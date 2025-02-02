
import { each, isUUID } from "@awesomeness-js/utils";
import s3 from "@awesomeness-js/aws-s3";
import deleteFromSuperNode from "./deleteFromSuperNode.js";

async function deleteMultiple(edges, {
	bucket = process.env.AWESOMENESS_GRAPH_AWS_BUCKET
} = {}){

	if(!edges || !Array.isArray(edges) || !edges.length){
		throw new Error('edges invalid');
	}

	let map_new__v1_type__v2s_toDelete = {};

	let keyMap = {};

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
		
		if(!map_new__v1_type__v2s_toDelete[key]){ 

			map_new__v1_type__v2s_toDelete[key] = []; 

			keyMap[key] = {
				type,
				v1
			};

		}

		map_new__v1_type__v2s_toDelete[key].push(v2);
		
	});


	let s3ObjectsExisting = [];
	each(keyMap, ( _, key ) => {
		s3ObjectsExisting.push({
			bucket,
			key,
		});
	});


	const existingEdgeS3Objects = await s3.get.multiple(s3ObjectsExisting);


	const edgesToUpdate = {};
	const superNodePromises = [];

	existingEdgeS3Objects.forEach(edge => {

		let isSuperNode = edge?.metadata?.supernode ? true : false;

		if(isSuperNode){

			superNodePromises.push(deleteFromSuperNode({
				edge,
				deleteIds: map_new__v1_type__v2s_toDelete[edge.key]
			}));

			return;

		}

		// n1 + edge type never existed
		if(edge.body === null){ 
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



	const edgesToUpdate_setups = [];
	each(edgesToUpdate, (existing_v2s, awsS3Key) => {

		let allIds = existing_v2s.filter(v2 => {
			return !map_new__v1_type__v2s_toDelete[awsS3Key].includes(v2);
		});

		// make unique
		allIds = [...new Set(allIds)];

		let size = allIds.length;

		// create s3 object
		edgesToUpdate_setups.push({
			bucket,
			key: awsS3Key,
			body: allIds,
			metadata: {
				type: keyMap[awsS3Key].type,
				v1: keyMap[awsS3Key].v1,
				size: allIds.length,
			}
		});

		
	});


	try {

		if(edgesToUpdate_setups.length){

			let allPromises = [];
			edgesToUpdate_setups.forEach(setup => {
				allPromises.push(s3.put.multiple([setup]));
			});

			await Promise.all(allPromises);
		}

	} catch(err){

		console.log(err);
		
	}


	return true;

}

export default deleteMultiple;