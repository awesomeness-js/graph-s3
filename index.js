/**
 * This file is auto-generated by the build script.
 * It consolidates API functions for use in the application.
 * Do not edit manually.
 */
import edge_add from './src/edge/add.js';
import edge_addMultiple from './src/edge/addMultiple.js';
import edge_addToSuperNode from './src/edge/addToSuperNode.js';
import edge_convertToSuperNode from './src/edge/convertToSuperNode.js';
import edge_delete from './src/edge/delete.js';
import edge_deleteFromSuperNode from './src/edge/deleteFromSuperNode.js';
import edge_deleteMultiple from './src/edge/deleteMultiple.js';
import edge_getMultiple from './src/edge/getMultiple.js';
import edge_search from './src/edge/search.js';
import kv_add from './src/kv/add.js';
import kv_addMultiple from './src/kv/addMultiple.js';
import kv_delete from './src/kv/delete.js';
import kv_deleteMultiple from './src/kv/deleteMultiple.js';
import kv_get from './src/kv/get.js';
import kv_getMultiple from './src/kv/getMultiple.js';
import vertex_add from './src/vertex/add.js';
import vertex_addMultiple from './src/vertex/addMultiple.js';
import vertex_delete from './src/vertex/delete.js';
import vertex_deleteMultiple from './src/vertex/deleteMultiple.js';
import vertex_get from './src/vertex/get.js';
import vertex_getMultiple from './src/vertex/getMultiple.js';


export default {
    edge: {
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
        add: edge_add,
        addMultiple: edge_addMultiple,
        addToSuperNode: edge_addToSuperNode,
        convertToSuperNode: edge_convertToSuperNode,
        delete: edge_delete,
        deleteFromSuperNode: edge_deleteFromSuperNode,
        deleteMultiple: edge_deleteMultiple,
        getMultiple: edge_getMultiple,
        search: edge_search
    },
    kv: {
        add: kv_add,
        addMultiple: kv_addMultiple,
        delete: kv_delete,
        deleteMultiple: kv_deleteMultiple,
        get: kv_get,
        getMultiple: kv_getMultiple
    },
    vertex: {
        add: vertex_add,
        addMultiple: vertex_addMultiple,
        delete: vertex_delete,
        deleteMultiple: vertex_deleteMultiple,
        get: vertex_get,
        getMultiple: vertex_getMultiple
    }
};