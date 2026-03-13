export default convertToSuperNode;
declare function convertToSuperNode({ key, bucket, allEdges, type, v1, maxSize }: {
    key: any;
    bucket: any;
    allEdges: any;
    type: any;
    v1: any;
    maxSize?: number;
}): Promise<boolean | {
    updatedShards: ({
        key: string;
        body: any;
        bucket: any;
        metadata: {
            size: any;
            lastV2Id: any;
            id: string;
            v1: any;
            type: any;
        };
    } | {
        key: any;
        body: {};
        bucket: any;
        metadata: {
            id: any;
            type: any;
            v1: any;
            size: any;
            supernode: boolean;
        };
    })[];
    shardKeysSorted: string[];
    shardMap__id_items: {};
}>;
