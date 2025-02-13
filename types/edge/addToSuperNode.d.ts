export default addToSuperNode;
declare function addToSuperNode({ edge, addIds, maxSize }: {
    edge?: {
        key: any;
        body: any;
        bucket: any;
        metadata: any;
        bytes: any;
        modified: any;
    };
    addIds?: any[];
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
