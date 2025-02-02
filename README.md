# Edge Bucket: edges/V1_uuid/type
This will be an array of vertex2 uuids
if the collection gets too large 
it will be sharded into multiple files
and this file will just be a dictionary 
of all shard ids and their metadata

the body will be an array of vertex2 uuids
the array will be sorted in ascending order

## metadata of a un-sharded collection (or root file) looks like this
```json
{
	"V1": "V1_uuid", // the uuid of the vertex 
	"type": "friend", // the edge type
	"size": 1, // how many uuids are in the entire collection
}
```

## Shards will be placed like this: 
`edges/v1_uuid/type/shard.1`
the body, like an un-sharded collection,
will be a simple array of vertex2 uuids

### the metadata will look like this
```json
{
	"id": "shardId", // the id of the shard
	"lastId": "vertex2_uuid", // used for routing to the correct shard
	"size": 1, // how many uuids are in the shard,
	"type": "friend", // the edge type
	"lastId": "V1_uuid", // the uuid of the vertex
}
```

### the body of a collection that is sharded (the root file) will look like this

it is a dictionary of shard ids and the shards metadata

```json
{
  "shard.1": {
	"id": "shardId", // the id of the shard
	"lastId": "vertex2_uuid", // used for routing to the correct shard
	"size": 1, // how many uuids are in the shard
	"type": "friend", // the edge type
	"lastId": "V1_uuid", // the uuid of the vertex
  }
}
```

# General Notes on size of collections (arrays of uuids)
7777 = 365 kb (works for dynamodb)
10k = 469 kb (too big for dynamodb)
25_000 = 1.2 mb
50_000 = 2.4 mb
100_000 = 4.7 mb
250_000 = 11.7 mb
500_000 = 23.4 mb
1_000_000 = 46.8 mb