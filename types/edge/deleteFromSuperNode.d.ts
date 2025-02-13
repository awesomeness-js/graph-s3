export default deleteFromSuperNode;
declare function deleteFromSuperNode({ edge, deleteIds }: {
    edge?: {
        key: any;
        body: any;
        bucket: any;
        metadata: any;
        bytes: any;
        modified: any;
    };
    deleteIds?: any[];
}): Promise<boolean | {
    updatedShards: {
        key: any;
        body: any;
        bucket: any;
        metadata: any;
    }[];
    objectsToFetch: any[];
    shardKeysSorted: string[];
    shardMap__id_items: {};
    allNeededShards: any;
}>;
