import addMultiple from './addMultiple.js';
async function add(k, v){ 
	await addMultiple({
		[k]: v
	});
	return v;
}
export default add;