
import { each } from "@awesomeness-js/utils";
import s3 from '@awesomeness-js/aws-s3';

async function addMultiple(kvs){

	let cleanKVs = [];

	each(kvs, (v, k) => {

		if(!k || typeof k !== 'string' || k.length < 1 || k.length > 420){
			throw new Error(`k invalid: ${k}`);
		}

		let type = typeof v;
		if (
			type !== 'string' 
			&& type !== 'number' 
			&& type !== 'boolean' 
			&& type !== 'object'
		){
			throw new Error(`v invalid: ${type}`);
		}

		if(Array.isArray(v)){
			type = 'array';
		}

		let docPath = `kv/${k}`;

		cleanKVs.push([
			k, 
			v, 
			type,
			docPath
		]);
		
	});

	let s3Objects = [];

	cleanKVs.forEach(kvData => {

		let k = kvData[0];
		let v = kvData[1];
		let type = kvData[2];
		let docPath = kvData[3];

		// create s3 object
		s3Objects.push({
			bucket: process.env.AWESOMENESS_GRAPH_AWS_BUCKET,
			key: docPath,
			body: v,
			metadata: {
				k,
				type,
			}
		});

	});

	await s3.put.multiple(s3Objects);

	return kvs;

}

export default addMultiple;