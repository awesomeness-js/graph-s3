import { uuid, isUUID } from '@awesomeness-js/utils';
import s3 from '@awesomeness-js/aws-s3';

async function addMultiple(vertices){

	// make sure edges are formatted correctly
	const requiredKeys = [
		{ key: 'id', type: 'uuid4' },
		{ key: 'type', type: 'string' },
	];

	let s3Objects = [];

	vertices.forEach(vertex => {

		if(!vertex.id){ vertex.id = uuid(); }

		// check if required keys are present
		requiredKeys.forEach(key => {
			
			if(!vertex[key.key]){
				throw new Error(`Vertex is missing required key: ${key.key}`);
			}

			// check if key is correct type
			if(key.type === 'uuid4' && !isUUID(vertex[key.key])){
				throw new Error(`Vertex key ${key.key} is not a valid uuid4`);
			}

			if(key.type === 'string' && typeof vertex[key.key] !== 'string'){
				throw new Error(`Vertex key ${key.key} is not a string`);
			}
			
		});

		// create s3 object
		s3Objects.push({
			bucket: process.env.AWESOMENESS_GRAPH_AWS_BUCKET,
			key: `vertices/${vertex.id}`,
			body: vertex,
			metadata: {
				id: vertex.id,
				type: vertex.type,
			}
		});
		
	});

	await s3.put.multiple(s3Objects);

	return vertices;

}

export default addMultiple;