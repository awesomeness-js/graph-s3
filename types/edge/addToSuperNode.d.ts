export default addToSuperNode;
declare function addToSuperNode({ edge, addEdges, maxSize }: {
    edge?: {
        key: any;
        body: any;
        bucket: any;
        metadata: any;
        bytes: any;
        modified: any;
    };
    addEdges?: any[];
    maxSize?: number;
}): Promise<boolean | {
    updatedShards: {
        key: any;
        body: any;
        bucket: any;
        metadata: any;
    }[];
    deleteShards: any[];
    objectsToFetch: any[];
    shardKeysSorted: string[];
    shardMap__id_items: {};
    allNeededShards: any;
}>;
