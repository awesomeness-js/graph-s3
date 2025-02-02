
import { isUUID } from '@awesomeness-js/utils';
import s3 from '@awesomeness-js/aws-s3';

async function getMultipleVertices(ids){

	let cleanIds = [];

	ids.forEach( id => {

		if(!id || !isUUID(id)){
			throw new Error(`id invalid: ${id}`);
		}

		let docPath = `vertices/${id}`;

		cleanIds.push(docPath);
		
	});

	let s3Objects = [];

	cleanIds.forEach(docPath => {
		
		// create s3 object
		s3Objects.push({
			bucket: process.env.AWESOMENESS_GRAPH_AWS_BUCKET,
			key: docPath,
		});

	});

	let rows = await s3.get.multiple(s3Objects);

	let map = {};

	rows.forEach(row => {

		if(row.body === null){
			map[row.key.replace('vertices/', '')] = null;
			return;
		}

		map[row.metadata.id] = row.body;

	});

	return map;

}

export default getMultipleVertices;