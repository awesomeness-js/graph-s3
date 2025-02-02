import s3 from '@awesomeness-js/aws-s3';
import { isUUID } from '@awesomeness-js/utils';

async function deleteMultipleVertices(ids){

	let cleanIds = [];

	ids.forEach( id => {

		if(!id || !isUUID(id)){
			throw new Error(`k invalid: ${id}`);
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

	await s3.delete.multiple(s3Objects);

	return true;

}

export default deleteMultipleVertices;