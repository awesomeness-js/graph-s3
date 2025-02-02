import s3 from '@awesomeness-js/aws-s3';

async function getMultipleKvs(keys){

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

	let rows = await s3.get.multiple(s3Objects, { parseJson: false });

	let kvs = {};

	rows.forEach(row => {

		if(row.body === null){
			kvs[row.key.replace('kv/', '')] = null;
			return;
		}

		let type = row.metadata.type;
		let v = row.body;

		if(type === 'string'){
			v = v.toString();
		} else if(type === 'number'){
			v = parseFloat(v);
		} else if(type === 'boolean'){
			v = v === 'true';
		} else if(type === 'array'){
			v = JSON.parse(v);
		} else if(type === 'object'){
			v = JSON.parse(v);
		}

		kvs[row.metadata.k] = v;

	});

	return kvs;

}

export default getMultipleKvs;