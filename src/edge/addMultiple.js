import addToSuperNode from "./addToSuperNode.js";
import convertToSuperNode from "./convertToSuperNode.js";
import { each, isUUID } from "@awesomeness-js/utils";
import s3 from '@awesomeness-js/aws-s3';
import addMultipleKVs from '../kv/addMultiple.js';

async function addMultiple(edges, {
	maxSize = 100_000,
	bucket = process.env.AWESOMENESS_GRAPH_AWS_BUCKET
} = {}){

	if(!edges || !Array.isArray(edges) || !edges.length){
		throw new Error('edges invalid');
	}

	let map_new__v1_type__new_v2s = {};

	let keyMap = {};
	let s3ObjectsExisting = [];

	edges.forEach(edge => {

		let {
			v1,
			type,
			v2,
			id = uuid(),
			properties = null,
		} = edge;

		if(!v1 || !isUUID(v1)){
			throw new Error(`v1 invalid: ${v1}`);
		}

		if(!type || typeof type !== 'string' || type.length < 1 || type.length > 420){
			throw new Error(`type invalid: ${type}`);
		}

		if(!v2 || !isUUID(v2)){
			throw new Error(`v2 invalid: ${v2}`);
		}

		if(!isUUID(id)){
			throw new Error(`id invalid: ${id}`);
		}

		let key = `edges/${v1}/${type}`;
		
		if(!map_new__v1_type__new_v2s[key]){ 

			map_new__v1_type__new_v2s[key] = []; 

			keyMap[key] = {
				type,
				v1
			};

			s3ObjectsExisting.push({
				bucket,
				key,
			});

		}

		map_new__v1_type__new_v2s[key].push(edge);
		
	});


	const existingEdgeS3Objects = await s3.get.multiple(s3ObjectsExisting);


	const edgesToUpdate = {};
	const superNodePromises = [];

	existingEdgeS3Objects.forEach(edge => {

		let isSuperNode = edge?.metadata?.supernode ? true : false; // aws converts to lowercase

		if(isSuperNode){

			superNodePromises.push(addToSuperNode({
				edge,
				addEdges: map_new__v1_type__new_v2s[edge.key],
				maxSize
			}));

			return;

		}

		// n1 + edge type never existed
		if(edge.body === null){ 
			edgesToUpdate[edge.key] = [];
			return;
		}

		try {

			// normal edge collection, not super node
			edgesToUpdate[edge.key] = edge.body;
		
		} catch (error) {

			throw({
				message: 'edge data corrupt',
				edge,
			});
	
		}

		
	});


	// do super node things
	if(superNodePromises.length){
		await Promise.all(superNodePromises);
	}




	// do we need to convert any into super nodes?
	const convertToSuperNode_setups = [];
	const edgesToCreateOrUpdate_setups = [];

	const edgeKVsToCreate = {};

	each(edgesToUpdate, (existing_v2s, awsS3Key) => {

		let allEdges = existing_v2s.concat(map_new__v1_type__new_v2s[awsS3Key]);

		// make sure all ids are unique
		const uniqueIds = new Set();
		each(allEdges, (edge) => {

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


		let size = allEdges.length;

		if(size > maxSize){

			convertToSuperNode_setups.push({
				bucket,
				key: awsS3Key,
				allEdges,
				type: keyMap[awsS3Key].type,
				v1: keyMap[awsS3Key].v1,
				maxSize
			});

			return;

		}

		// create s3 object
		edgesToCreateOrUpdate_setups.push({
			bucket,
			key: awsS3Key,
			body: allEdges,
			metadata: {
				v1: keyMap[awsS3Key].v1,
				type: keyMap[awsS3Key].type,
				size: allEdges.length,
				id: awsS3Key,
				supernode: false,
			}
		});

		
	});

	if(convertToSuperNode_setups.length){

		let allPromises = [];
		convertToSuperNode_setups.forEach(setup => {
			allPromises.push(convertToSuperNode(setup));
		});

		await Promise.all(allPromises);
	}

	try {

		if(edgesToCreateOrUpdate_setups.length){

			let allPromises = [];
			edgesToCreateOrUpdate_setups.forEach(setup => {
				allPromises.push(s3.put.multiple([setup]));
			});

			await Promise.all(allPromises);
		
		}

	} catch(err){

		console.log(err);
		
	}


	try {

		if(Object.keys(edgeKVsToCreate).length){
		
			await addMultipleKVs(edgeKVsToCreate);
		
		}

	} catch(err){

		console.log(err);

	}



	return edges;

}

export default addMultiple;