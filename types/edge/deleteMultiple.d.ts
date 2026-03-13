export default deleteMultiple;
declare function deleteMultiple(edgeIDs: any, { bucket, edgeLocations, }?: {
    bucket?: any;
    edgeLocations?: any[];
}): Promise<true | {
    edgesDeleted: number;
}>;
