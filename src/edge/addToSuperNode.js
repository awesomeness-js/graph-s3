
import { each } from "@awesomeness-js/utils";
import s3 from '@awesomeness-js/aws-s3';

async function addToSuperNode({ 
	edge = {
		key, 
		body,
		bucket,
		metadata,
		bytes,
		modified
	},
	addIds = [],
	maxSize = 100_000
}){

	if (!addIds.length) return true;

	let {
		key, 
		body,
		bucket,
		metadata,
		bytes,
		modified
	} = edge;

	
	let shardMap = body;
	/*
	{
		'shard.1': {
			id: 'shard.1',
			lastId: '00000000-0000-4000-8000-000000000010',
			size: 10
		},
		'shard.2': {
			id: 'shard.2',
			lastId: '00000000-0000-4000-8000-000000000020',
			size: 10
		}
	*/

	let shardKeysSorted = Object.keys(shardMap).sort((a, b) => { 
		return a > b ? 1 : -1; 
	});
	let lastKey = shardKeysSorted[shardKeysSorted.length - 1];

	const shardMap__id_items = {};

	function findAHomeForThisId(id){

		let house = shardKeysSorted[0];

		each(shardKeysSorted, (shardID) => {

			let { lastId } = shardMap[shardID];

			if(id < lastId){ house = shardID; return false; }
			if(shardID === lastKey) { house = shardID; }

		});

		return house;

	}

	addIds.forEach(id => {
		let house = findAHomeForThisId(id);
		if(!shardMap__id_items[house]) shardMap__id_items[house] = [];
		shardMap__id_items[house].push(id);
	});

	// fetch the shards
	let objectsToFetch = [];
	each(shardMap__id_items, (ids, shardId) => {
	
		objectsToFetch.push({
			key: `${key}/${shardId}`,
			bucket
		});

	});

	
	let allNeededShards = await s3.get.multiple(objectsToFetch);
	let updatedShards = [];
	let deleteShards = [];
	
	each(allNeededShards, (shard, i) => {

		let shardId = shard.key.split('/').pop();

		// this is only needed for testing
		// it will always exist in the real world
		if(shard.body === null){
			shard.body = [];
			shard.metadata = {
				size: 0,
				lastId: null,
				id: shardId,
				v1: metadata.v1,
				type: metadata.type
			};
		}

		let existingIds = shard.body;

		let newShard = [...existingIds, ...shardMap__id_items[shardId]];

		// make unique
		newShard = [...new Set(newShard)];

		// sort the new shard
		newShard.sort((a, b) => {
			return a > b ? 1 : -1;
		});

		shard.metadata.size = newShard.length;

		if(shard.metadata.size < maxSize){
			
			updatedShards.push({
				key: shard.key,
				body: newShard,
				bucket,
				metadata: {
					size: newShard.length,
					lastId: newShard[newShard.length - 1],
					id: shardId,
					v1: metadata.v1,
					type: metadata.type
				}
			});

			// update main metadata
			shardMap[shardId].size = newShard.length;

		} else {

			// mark the old for deletion
			deleteShards.push({
				key: shard.key,
				bucket
			});

			// delete the old
			delete shardMap[shardId];

			// how many buckets do we need?
			const bucketsNeeded = Math.ceil(newShard.length / maxSize);

			// Determine the ideal size for each bucket for even distribution
			const idealSize = Math.ceil(newShard.length / bucketsNeeded);

			// chuck it up
			for(let i = 0; i < bucketsNeeded; i++){

				const start = i * idealSize;
				const end = start + idealSize;
				let thisChunk = newShard.slice(start, end);

				const thisMetadata = {
					size: thisChunk.length,
					lastId: thisChunk[thisChunk.length - 1],
					id: shardId,
					v1: metadata.v1,
					type: metadata.type						
				};

				updatedShards.push({
					key: `${key}/${shardId}.${i}`,
					body: thisChunk,
					bucket,
					metadata: thisMetadata
				});

				// update main metadata
				shardMap[`${shardId}.${i}`] = thisMetadata;

			}


			
		}

	});

	try {

		let totalNewSize = 0;

		each(shardMap, (shard, shardId) => {
			totalNewSize += shard.size;
		});

		metadata.size = totalNewSize;
		
		// update the main entry
		updatedShards.push({
			key,
			body: shardMap,
			bucket,
			metadata
		});

	
		await s3.put.multiple(updatedShards);

		// delete the old shards
		if(deleteShards.length){
			await s3.delete.multiple(deleteShards);
		}
	
	} catch (e){

		console.log('error', e);
		return false;

	}


	return {
		updatedShards,
		deleteShards,
		objectsToFetch,
		shardKeysSorted,
		shardMap__id_items,
		allNeededShards
	}

}

export default addToSuperNode;