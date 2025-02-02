import getMultiple from './getMultiple.js';
async function get(k){ 
	let kvs = await getMultiple([k]);
	return kvs[k];
}
export default get;