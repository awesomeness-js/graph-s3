import deleteMultiple from './deleteMultiple.js';
async function deleteOne(k){ 
	await deleteMultiple([k]);
	return true;
}
export default deleteOne;