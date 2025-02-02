
import { each } from "@awesomeness-js/utils";
import s3 from "@awesomeness-js/aws-s3";

async function convertToSuperNode({ 
	key,
	bucket,
	allIds,
	type,
	v1,
	maxSize = 100_000
}){

	if (!allIds.length) { 
		
		console.warn('no ids to convert to super node');

		return true; 

	}

	const rootDocBody = {};
	const updatedShards = [];
	const rootDocMetaData = {
		id: key,
		type,
		v1,
		size: allIds.length,
		supernode: true // aws converts to lowercase....
	};


	// sort
	allIds.sort((a, b) => { 
		return a > b ? 1 : -1; 
	});
	
	const shardKeysSorted = [];

	// how many buckets do we need?
	const bucketsNeeded = Math.ceil(allIds.length / maxSize);

	// Determine the ideal size for each bucket for even distribution
	const idealSize = Math.ceil(allIds.length / bucketsNeeded);

	// chuck it up
	for(let i = 0; i < bucketsNeeded; i++){

		const start = i * idealSize;
		const end = start + idealSize;
		const thisChunk = allIds.slice(start, end);

		const shardId = `shard.${i}`;

		const thisMetadata = {
			size: thisChunk.length,
			lastId: thisChunk[thisChunk.length - 1],
			id: shardId,
			v1,
			type
		};

		updatedShards.push({
			key: `${key}/${shardId}`,
			body: thisChunk,
			bucket,
			metadata: thisMetadata
		});

		// update main metadata
		rootDocBody[shardId] = thisMetadata;

		shardKeysSorted.push(shardId);

	}

	// sort the keys
	shardKeysSorted.sort((a, b) => {
		return a > b ? 1 : -1;
	});

	const lastKey = shardKeysSorted[shardKeysSorted.length - 1];

	function findAHomeForThisId(id){

		let house = shardKeysSorted[0];

		each(shardKeysSorted, (shardID) => {

			let { lastId } = rootDocBody[shardID];

			if(id < lastId){ house = shardID; return false; }
			if(shardID === lastKey) { house = shardID; }

		});

		return house;

	}


	const shardMap__id_items = {};

	allIds.forEach(id => {
		let house = findAHomeForThisId(id);
		if(!shardMap__id_items[house]) shardMap__id_items[house] = [];
		shardMap__id_items[house].push(id);
	});

	
	// update the main entry
	updatedShards.push({
		key,
		body: rootDocBody,
		bucket,
		metadata: rootDocMetaData
	});

	console.log('updatedShards', updatedShards);
	
	try {
	
		await s3.put.multiple(updatedShards);
	
	} catch (e){

		console.log('error', e);
		return false;

	}


	return {
		updatedShards,
		shardKeysSorted,
		shardMap__id_items
	}

}

export default convertToSuperNode;