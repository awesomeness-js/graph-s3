import addToSuperNode from "./addToSuperNode.js";
import convertToSuperNode from "./convertToSuperNode.js";
import { each, isUUID } from "@awesomeness-js/utils";
import s3 from '@awesomeness-js/aws-s3';

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

		let v1 = edge[0];
		let type = edge[1];
		let v2 = edge[2];

		if(!v1 || !isUUID(v1)){
			throw new Error(`v1 invalid: ${v1}`);
		}

		if(!type || typeof type !== 'string' || type.length < 1 || type.length > 420){
			throw new Error(`type invalid: ${type}`);
		}

		if(!v2 || !isUUID(v2)){
			throw new Error(`v2 invalid: ${v2}`);
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

		map_new__v1_type__new_v2s[key].push(v2);
		
	});


	const existingEdgeS3Objects = await s3.get.multiple(s3ObjectsExisting);


	const edgesToUpdate = {};
	const superNodePromises = [];

	existingEdgeS3Objects.forEach(edge => {

		let isSuperNode = edge?.metadata?.supernode ? true : false;

		if(isSuperNode){

			superNodePromises.push(addToSuperNode({
				edge,
				addIds: map_new__v1_type__new_v2s[edge.key],
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
	each(edgesToUpdate, (existing_v2s, awsS3Key) => {

		let allIds = existing_v2s.concat(map_new__v1_type__new_v2s[awsS3Key]);

		// make unique
		allIds = [...new Set(allIds)];

		let size = allIds.length;

		if(size > maxSize){

			convertToSuperNode_setups.push({
				bucket,
				key: awsS3Key,
				allIds,
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
			body: allIds,
			metadata: {
				v1: keyMap[awsS3Key].v1,
				type: keyMap[awsS3Key].type,
				size: allIds.length,
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


	return edges;

}

export default addMultiple;