import addMultiple from './addMultiple.js';
async function add(item){ 
	await addMultiple([item]);
	return item;
}
export default add;