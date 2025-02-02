
import getMultiple from "./getMultiple.js";

async function search(v1s, types, {

} = {}){

	if (!Array.isArray(v1s)){ v1s = [v1s]; }
	if (!Array.isArray(types)){ types = [types]; }

	const searchRows = [];

	v1s.forEach(v1 => {
		types.forEach(type => {
			searchRows.push([v1, type]);
		});
	});

	let edges = await getMultiple(searchRows);

	return edges;

}

export default search;