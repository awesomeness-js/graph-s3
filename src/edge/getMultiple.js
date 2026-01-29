import getKVs from '../kv/getMultiple.js';

export default async function getMultipleEdges(edgeIDs){

	const edgeKeys = edgeIDs.map(id => `edge::${id}`);

	const kvs = await getKVs(edgeKeys);

	const edges = {};

	for (const key in kvs) {
		if (kvs.hasOwnProperty(key)) {
			const edgeID = key.replace('edge::', '');
			edges[edgeID] = kvs[key];
		}
	}

	return edges;

}