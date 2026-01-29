
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
	addEdges = [],
	maxSize = 100_000
}){

	if (!addEdges.length) return true;

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
		'edges/00000000-0000-4000-8000-000000000000/friend/shard.1': {
			id: 'edges/00000000-0000-4000-8000-000000000000/friend/shard.1',
			lastV2Id: '00000000-0000-4000-8000-000000000010',
			size: 10
		},
		'edges/00000000-0000-4000-8000-000000000000/friend/shard.2': {
			id: 'edges/00000000-0000-4000-8000-000000000000/friend/shard.2',
			lastV2Id: '00000000-0000-4000-8000-000000000020',
			size: 10
		}
	*/

	let shardKeysSorted = Object.keys(shardMap).sort((a, b) => { 
		return a > b ? 1 : -1; 
	});
	let lastKey = shardKeysSorted[shardKeysSorted.length - 1];

	const shardMap__id_items = {};

	function findAHomeForThis(id){

		let house = shardKeysSorted[0];

		each(shardKeysSorted, (shardID) => {

			let { lastV2Id } = shardMap[shardID];

			if(id < lastV2Id){ house = shardID; return false; }
			if(shardID === lastKey) { house = shardID; }

		});

		return house;

	}

	addEdges.forEach(edge => {
		let house = findAHomeForThis(edge.v2);
		if(!shardMap__id_items[house]) shardMap__id_items[house] = [];
		shardMap__id_items[house].push(edge);
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

	let edgeKVsToCreate = {};
	const uniqueIds = new Set();

	each(allNeededShards, (shard, i) => {

		let shardId = shard.key;

		// this is only needed for testing
		// it will always exist in the real world
		if(shard.body === null){
			shard.body = [];
			shard.metadata = {
				size: 0,
				lastV2Id: null,
				id: shardId,
				v1: metadata.v1,
				type: metadata.type
			};
		}

		let existingEdges = shard.body;

		let newShard = [...existingEdges, ...shardMap__id_items[shardId]];

		// make unique
		each(newShard, (edge) => {

			if(!edge.id || !isUUID(edge.id)){
				throw new Error(`edge id invalid: ${edge.id}`);
			}

			if(uniqueIds.has(edge.id)){
				throw new Error(`duplicate edge id found: ${edge.id}`);
			}

			uniqueIds.add(edge.id);

			edgeKVsToCreate[`edge::${edge.id}`] = {
				... edge,
				edgeLocation: awsS3Key,
			};

		});

		// sort the new shard
		newShard.sort((a, b) => {
			return a.v2 > b.v2 ? 1 : -1;
		});

		shard.metadata.size = newShard.length;

		if(shard.metadata.size < maxSize){
			
			updatedShards.push({
				key: shard.key,
				body: newShard,
				bucket,
				metadata: {
					size: newShard.length,
					lastV2Id: newShard[newShard.length - 1].v2,
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
					lastV2Id: thisChunk[thisChunk.length - 1].v2,
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
				shardMap[`${key}/${shardId}.${i}`] = thisMetadata;

				thisChunk.forEach(edge => {

					if(!edge.id || !isUUID(edge.id)){
						throw new Error(`edge id invalid: ${edge.id}`);
					}

					if(uniqueIds.has(edge.id)){
						throw new Error(`duplicate edge id found: ${edge.id}`);
					}

					uniqueIds.add(edge.id);

					edgeKVsToCreate[`edge::${edge.id}`] = {
						... edge,
						edgeLocation: `${key}/${shardId}.${i}`
					};

				});

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


	try {

		if(Object.keys(edgeKVsToCreate).length){
		
			await addMultipleKVs(edgeKVsToCreate);
		
		}

	} catch(err){

		console.log(err);

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