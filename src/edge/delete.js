import deleteMultiple from './deleteMultiple.js';
async function deleteOne(arrayWithThreeItems_v1_type_v2){ 
	await deleteMultiple([arrayWithThreeItems_v1_type_v2]);
	return true;
}
export default deleteOne;