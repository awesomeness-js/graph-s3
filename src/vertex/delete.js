import deleteMultiple from './deleteMultiple.js';
async function deleteOne(id){ 
	await deleteMultiple([id]);
	return true;
}
export default deleteOne;