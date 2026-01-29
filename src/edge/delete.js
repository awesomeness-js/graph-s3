import deleteMultiple from './deleteMultiple.js';
async function deleteOne(edgeID){ 
	await deleteMultiple([edgeID]);
	return true;
}
export default deleteOne;