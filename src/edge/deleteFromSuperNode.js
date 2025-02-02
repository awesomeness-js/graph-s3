
import { each } from "@awesomeness-js/utils";
import s3 from "@awesomeness-js/aws-s3";


async function deleteFromSuperNode({ 
	edge = {
		key, 
		body,
		bucket,
		metadata,
		bytes,
		modified
	},
	deleteIds = []
}){

	if (!deleteIds.length) return true;

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
			size: 10,
			type: 'someEdgeType',
			v1: '00000000-0000-4000-8000-000000000001'
		},
		'shard.2': {
			id: 'shard.2',
			lastId: '00000000-0000-4000-8000-000000000020',
			size: 10,
			type: 'someEdgeType',
			v1: '00000000-0000-4000-8000-000000000001'
		}
	*/

	let shardKeysSorted = Object.keys(shardMap).sort((a, b) => { 
		return a > b ? 1 : -1; 
	});
	let lastKey = shardKeysSorted[shardKeysSorted.length - 1];

	const shardMap__id_items = {};

	function findAHomeForThisId(id){

		let house = shardKeysSorted[0];

		each(shardKeysSorted, (shardID, k) => {

			let { lastId } = shardMap[shardID];

			if(id < lastId){ house = shardID; return false; }
			if(shardID === lastKey) { house = shardID; }

		});

		return house;

	}

	deleteIds.forEach(id => {
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

	let totalBefore = 0;
	let totalAfter = 0;
	
	each(allNeededShards, (shard, i) => {

		let shardId = shard.key.split('/').pop();

		// this is only needed for testing
		// it will always exist in the real world
		if(shard.body === null){
			throw new Error(`shard.body is null: ${shard.key} someone fucked up.`);
		}

		let existingIds = shard.body;

		let newShard = [];

		each(existingIds, (id, i) => {
			if(!deleteIds.includes(id)){
				newShard.push(id);
			}
		});

		totalBefore += existingIds.length;
		shard.metadata.size = newShard.length;
		totalAfter += newShard.length;

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
	
	} catch (e){

		console.log('error', e);
		return false;

	}

	return {
		updatedShards,
		objectsToFetch,
		shardKeysSorted,
		shardMap__id_items,
		allNeededShards
	}

}

export default deleteFromSuperNode;