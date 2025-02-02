
import { each, isUUID } from "@awesomeness-js/utils";
import s3 from "@awesomeness-js/aws-s3";

export default async function getMultipleEdges(data){

	let edgeFiles = [];

	data.forEach( row => {

		let v1 = row[0];
		let type = row[1];

		if(!v1 || !isUUID(v1)){
			throw new Error(`v1 invalid: ${v1}`);
		}

		if(!type || typeof type !== 'string' || type.length < 1 || type.length > 420){
			throw new Error(`type invalid: ${type}`);
		}

		let docPath = `edges/${v1}/${type}`;

		edgeFiles.push(docPath);
		
	});

	let s3Objects = [];

	edgeFiles.forEach(docPath => {
		
		// create s3 object
		s3Objects.push({
			bucket: process.env.AWESOMENESS_GRAPH_AWS_BUCKET,
			key: docPath,
		});

	});

	const existingEdgeS3Objects = await s3.get.multiple(s3Objects);

	let edges = [];
	let shardsToFetch = [];

	existingEdgeS3Objects.forEach( edge => {

		let metaData = edge.metadata;
		let v1 = metaData.v1;
		let type = metaData.type;
		let isSuperNode = metaData.supernode;

		if(isSuperNode){

			let shards = edge.body;

			each(shards, (shardData, shard) => {
				
				let docPath = `edges/${v1}/${type}/${shard}`;

				let s3Object = {
					bucket: process.env.AWESOMENESS_GRAPH_AWS_BUCKET,
					key: docPath,
				};

				shardsToFetch.push(s3Object);
			
			});

			return true;
		}

		let allV2s = edge.body;

		edge.body.forEach( v2 => {
			
			edges.push([v1, type, v2]);

		});

	});

	if(shardsToFetch.length > 0){

		const existingEdgeShards = await s3.get.multiple(shardsToFetch);

		existingEdgeShards.forEach( edge => {

			let metaData = edge.metadata;
			let v1 = metaData.v1;
			let type = metaData.type;
			let shard = metaData.shard;

			let allV2s = edge.body;

			allV2s.forEach( v2 => {
				
				edges.push([v1, type, v2]);

			});

		});

	}


	return edges;

}