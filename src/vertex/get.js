import getMultiple from './getMultiple.js';
async function get(id){ 
	let all = await getMultiple([id]);
	return all[id];
}
export default get;