import s3 from '@awesomeness-js/aws-s3';

async function deleteMultipleKeys(keys){

	let cleanKVs = [];

	keys.forEach( k => {

		if(!k || typeof k !== 'string' || k.length < 1 || k.length > 420){
			throw new Error(`k invalid: ${k}`);
		}

		let docPath = `kv/${k}`;

		cleanKVs.push(docPath);
		
	});

	let s3Objects = [];

	cleanKVs.forEach(docPath => {
		
		// create s3 object
		s3Objects.push({
			bucket: process.env.AWESOMENESS_GRAPH_AWS_BUCKET,
			key: docPath,
		});

	});


	await s3.delete.multiple(s3Objects);

	return true;

}

export default deleteMultipleKeys;