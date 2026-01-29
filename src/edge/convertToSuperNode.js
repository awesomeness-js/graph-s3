
import { each } from "@awesomeness-js/utils";
import s3 from "@awesomeness-js/aws-s3";

async function convertToSuperNode({ 
	key,
	bucket,
	allEdges,
	type,
	v1,
	maxSize = 100_000
}){

	if (!allEdges.length) { 
		
		console.warn('no ids to convert to super node');

		return true; 

	}

	const rootDocBody = {};
	const updatedShards = [];
	const rootDocMetaData = {
		id: key,
		type,
		v1,
		size: allEdges.length,
		supernode: true // aws converts to lowercase....
	};


	// sort
	allEdges.sort((a, b) => { 
		return a.v2 > b.v2 ? 1 : -1; 
	});
	
	const shardKeysSorted = [];

	// how many buckets do we need?
	const bucketsNeeded = Math.ceil(allEdges.length / maxSize);

	// Determine the ideal size for each bucket for even distribution
	const idealSize = Math.ceil(allEdges.length / bucketsNeeded);

	// chuck it up
	for(let i = 0; i < bucketsNeeded; i++){

		const start = i * idealSize;
		const end = start + idealSize;
		const thisChunk = allEdges.slice(start, end);

		const shardId = `edges/00000000-0000-4000-8000-000000000000/friend/shard.${i}`;

		const thisMetadata = {
			size: thisChunk.length,
			lastV2Id: thisChunk[thisChunk.length - 1].v2,
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
		return a.v2 > b.v2 ? 1 : -1;
	});

	const lastKey = shardKeysSorted[shardKeysSorted.length - 1];

	function findAHomeForThis(id){

		let house = shardKeysSorted[0];

		each(shardKeysSorted, (shardID) => {

			let { lastV2Id } = rootDocBody[shardID];

			if(id < lastV2Id){ house = shardID; return false; }
			if(shardID === lastKey) { house = shardID; }

		});

		return house;

	}


	const shardMap__id_items = {};

	let edgeKVsToCreate = {};

	allEdges.forEach(edge => {
		let house = findAHomeForThis(edge.v2);
		if(!shardMap__id_items[house]) shardMap__id_items[house] = [];
		shardMap__id_items[house].push(edge);

		edgeKVsToCreate[`edge::${edge.id}`] = {
			... edge,
			edgeLocation: `${key}/${house}`,
		};

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
	

	try {

		if(Object.keys(edgeKVsToCreate).length){
		
			await addMultipleKVs(edgeKVsToCreate);
		
		}

	} catch(err){

		console.log(err);

	}


	return {
		updatedShards,
		shardKeysSorted,
		shardMap__id_items
	}

}

export default convertToSuperNode;