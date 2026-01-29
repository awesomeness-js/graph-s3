
import { each, isUUID } from "@awesomeness-js/utils";
import s3 from "@awesomeness-js/aws-s3";
import getKVs from "../kv/getMultiple.js";

async function deleteMultiple(edgeIDs, {
	bucket = process.env.AWESOMENESS_GRAPH_AWS_BUCKET,
	edgeLocations = [],
} = {}){

    // Validate edgeIDs is an array
    if (!Array.isArray(edgeIDs)) {
        throw {
            dbError: {
                msg: 'edge ids invalid - must be array of UUIDs',
                edgeIDs
            }
        };
    }

    // Validate each edgeID in the array
    edgeIDs.forEach((id, i) => {
        if (!isUUID(id)) {
            throw {
                dbError: {
                    msg: `edge id invalid - must be a UUID (error at index ${i})`,
                    edgeIDs,
                    key: i,
                    value: id
                }
            };
        }
    });


	if(!edgeLocations){

		edgeLocations = [];

		const keys = edgeIDs.map(id => `edge::${id}`);
		let kvs = await getKVs(keys);

		if(!kvs || !Object.keys(kvs).length){
			return {
				edgesDeleted: 0,
			}
		}

		edgeLocations = Object.values(kvs).map(edge => edge.edgeLocation);

	}

	// fetch the edgeCollections
	let objectsToFetch = [];
	each(edgeLocations, (key) => {
	
		objectsToFetch.push({
			key,
			bucket
		});

	});
	
	let edgeCollections = await s3.get.multiple(objectsToFetch);
	
	const updatedCollections = [];

	let totalReduction = 0;

	each(edgeCollections, (edgeCollection, i) => {
		// this is only needed for testing
		// it will always exist in the real world
		if(edgeCollection.body === null){
			throw new Error(`edgeCollection.body is null: ${edgeCollection.key} someone fucked up.`);
		}

		let existingEdges = edgeCollection.body;

		let updatedCollection = existingEdges.filter(edge => {
			return !edgeIDs.includes(edge.id);
		});

		const sizeBefore = existingEdges.length;
		const sizeAfter = updatedCollection.length;

		const reduction = sizeBefore - sizeAfter;

		updatedCollections.push({
			key: edgeCollection.key,
			body: updatedCollection,
			bucket,
			metadata: {
				size: updatedCollection.length,
				lastV2Id: updatedCollection[updatedCollection.length - 1].v2,
				id: edgeCollection.key,
				v1: metadata.v1,
				type: metadata.type
			}
		});

		// update main metadata
		totalReduction += reduction;

	});

	return true;

}

export default deleteMultiple;