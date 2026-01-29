import addEdges from './addMultiple.js';
import { uuid } from '@awesomeness-js/utils';
export default async function addEdge({
    v1, 
    type,
    v2, 
    id = uuid(), 
    properties = null
}){
    let edges = await addEdges([{
        v1, 
        type, 
        v2, 
        id, 
        properties
    }]);
    return edges[0];
}