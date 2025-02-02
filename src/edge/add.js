/**
 * Adds a single item by wrapping it in an array and passing it to the addMultiple function.
 *
 * @param {Object} item - The item to be added, represented as an array [vertex1, edgeType, vertex2].
 * 
 * @returns {Promise<Object>} A promise that resolves to the added item.
 *
 * @example
 * const item = ['vertex1', 'edgeType', 'vertex2'];
 * add(item).then(addedItem => {
 *   console.log(addedItem);
 * });
 */
import addMultiple from './addMultiple.js';
async function add(item){ 
	await addMultiple([item]); 
	return item;
}
export default add;