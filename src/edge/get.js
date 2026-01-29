import getKV from '../kv/get.js';

export default async function getEdge(id){

    const edge = await getKV(`edge::${id}`);

	return edge;

}