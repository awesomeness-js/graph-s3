# Setup
Create an S3 bucket.
set the AWESOMENESS_GRAPH_AWS_BUCKET env to the bucket name

For local testing you can do this:
Change `secrets_example` to `secrets` and fill in the values

AWESOMENESS_DEFAULT_AWS_REGION=us-east-1
AWESOMENESS_GRAPH_AWS_BUCKET=graph.awesomeness.js.com

In production you can delete the secrets folder as long as the envs are set.

# Example Usage
```js
import graph from '@awesomeness-js/graph-s3';
```

## Vertex

### graph.vertex.add()

**`graph.vertex.addMultiple()`**
is the same it just takes an array of items

```js

// create a vertex
const vertex = await graph.vertex.add({
	_type: 'person',
	name: 'John Doe',
	age: 30,
});

console.log(vertex._id); // will be assigned a uuid4

// create another vertex
const vertex2 = await graph.vertex.add({
	_id: '00000000-0000-4000-8000-000000000000',
	_type: 'person',
	name: 'Jane Doe',
	age: 25,
});

console.log(vertex2._id); // will be '00000000-0000-4000-8000-000000000000'

```

### graph.vertex.get()

**`graph.vertex.getMultiple()`**
is the same it just takes an array of items

```js

// get a vertex

const vertex = await graph.vertex.get('00000000-0000-4000-8000-000000000000');

console.log(vertex);

```

### graph.vertex.delete()

**`graph.vertex.deleteMultiple()`**
is the same it just takes an array of items

```js	

// delete a vertex

await graph.vertex.delete('00000000-0000-4000-8000-000000000000');

```

## Edge

### graph.edge.add()

**`graph.edge.addMultiple()`**
is the same it just takes an array of items

```js

// create an edge

await graph.edge.add({
	v1: '00000000-0000-4000-8000-000000000000',
	v2: '00000000-0000-4000-8000-000000000001',
	type: 'friend',
});

```

### graph.edge.search()

```js

// find friends of a vertex

const edges = await graph.edge.search('00000000-0000-4000-8000-000000000000', 'friend');
console.log(edges);

// find friends and enemies of multiple vertices

const edges = await graph.edge.search([
	'00000000-0000-4000-8000-000000000000'
	'00000000-0000-4000-8000-000000000001'
], [
	'friend',
	'enemy',
]);

console.log(edges);

```

### graph.edge.getMultiple()

```js

// find friends of vertex 1
// and enemies of vertex 2
await graph.edge.delete([
	[
		'00000000-0000-4000-8000-000000000001', 
		'friend'
	],
	[
		'00000000-0000-4000-8000-000000000002',
		'enemy'
	],
]);

```

### graph.edge.delete()

**`graph.edge.deleteMultiple()`**
is the same it just takes an array of items

```js

// delete the friendship between vertex 1 and vertex 2
// 2 still is friends with 1

await graph.edge.delete([
	'00000000-0000-4000-8000-000000000001', 
	'friend',
	'00000000-0000-4000-8000-000000000002'
]);

// delete the friendship between vertex 1 and vertex 2
// 2 is no longer friends with 1

await graph.edge.deleteMultiple([
	[
		'00000000-0000-4000-8000-000000000001',
		'friend',
		'00000000-0000-4000-8000-000000000002'
	],
	[
		'00000000-0000-4000-8000-000000000002',
		'friend',
		'00000000-0000-4000-8000-000000000001'
	],
]);

```


## KV

### graph.kv.add()

**`graph.kv.addMultiple()`**
is the same it just takes an array of items

```js

// create a key value pair
await graph.kv.add('keyBaz', { foo: 'bar' });

```

### graph.kv.get()

**`graph.kv.getMultiple()`**
is the same it just takes an array of items

```js

// get a key value pair
const kv = await graph.kv.get('keyBaz');
console.log(kv);

// get multiple key value pairs
const kvs = await graph.kv.getMultiple([
	'keyBaz',
	'somethingElse'
]);

```

### graph.kv.delete()

**`graph.kv.deleteMultiple()`**
is the same it just takes an array of items

```js

// delete a key value pair
await graph.kv.delete('keyBaz');

// delete multiple key value pairs
await graph.kv.deleteMultiple([
	'keyBaz',
	'somethingElse'
]);


```




# Graph Database - Structure

---

## Vertex

**S3 Storage Location: your-bucket/vertices/**
`your-bucket/vertices/00000000-0000-4000-8000-000000000000`

### Vertex Body

They should be a JSON object.
The only reserved properties are `_id` and `_type`,
all others are fair game.

`_id` is a uuid4
`_type` is any string

```json
{
	"_id": "00000000-0000-4000-8000-000000000000",
	"_type": "person",
	"anythingYouWant": "...", 
}
```

### Vertex Metadata
```json
{
	"id": "00000000-0000-4000-8000-000000000000",
	"type": "person",
}
```

---

## Edge

**S3 Storage Location: your-bucket/edges/**

**un-sharded**
`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend`

**sharded**
`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend`
`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend/shard.1`
`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend/shard.2`


An edge collection by default is un-sharded.
The max size of a edge collection is 100_000 uuids,
which is about 4.7mb.

When the number of uuids in the collection exceeds 100_000, the collection will be sharded into multiple files.

**OTHER SIZES:**
```
7777 = 365 kb (works for dynamodb)
10k = 469 kb (too big for dynamodb)
25_000 = 1.2 mb
50_000 = 2.4 mb
100_000 = 4.7 mb
250_000 = 11.7 mb
500_000 = 23.4 mb
1_000_000 = 46.8 mb
```


### Edge Body 
`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend`

**un-sharded**

Just a simple array of uuids.

```json
[
	"00000000-0000-4000-8000-000000000001",
	"00000000-0000-4000-8000-000000000002",
	"00000000-0000-4000-8000-000000000003",
	"00000000-0000-4000-8000-000000000004",
]
```

**sharded**

A dictionary with the metadata of all shards.

```json
{
  "shard.1": {
	"v1": "00000000-0000-4000-8000-000000000000", // the uuid of the vertex
	"type": "friend", // the edge type
	"size": 4, // how many uuids are in the shard,

	"id": "shard.1", // the id of the shard
	"lastId": "00000000-0000-4000-8000-000000000004", // used for routing to the correct shard
  },
  "shard.2": {
	"v1": "00000000-0000-4000-8000-000000000000", // the uuid of the vertex
	"type": "friend", // the edge type
	"size": 4, // how many uuids are in the shard,

	"id": "shard.2", // the id of the shard
	"lastId": "00000000-0000-4000-8000-000000000008", // used for routing to the correct shard
  }
}
```

### Edge Metadata 
`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend`

**un-sharded**
```json
{
	"v1": "00000000-0000-4000-8000-000000000005",
	"type": "someEdgeType",
	"size": 4,
}
```

**sharded**
```json
{
	"v1": "00000000-0000-4000-8000-000000000005",
	"type": "someEdgeType",
	"size": 8,
	
	// 2 additional properties
	"id": "edges/00000000-0000-4000-8000-000000000000/friend",
	"supernode": true,
}
```


#### Shard Body

Same as an un-sharded edge collection body.

`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend/shard.1`

```json
[
	"00000000-0000-4000-8000-000000000001",
	"00000000-0000-4000-8000-000000000002",
	"00000000-0000-4000-8000-000000000003",
	"00000000-0000-4000-8000-000000000004",
]
```

`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend/shard.2`

```json
[
	"00000000-0000-4000-8000-000000000005",
	"00000000-0000-4000-8000-000000000006",
	"00000000-0000-4000-8000-000000000007",
	"00000000-0000-4000-8000-000000000008",
]
```

#### shard metadata

Shard metadata is the same as edge metadata,
but with the addition of the `id` and `lastId` properties.

`id` is the id of the shard.

`lastId` is the last uuid in the shard. 
This is used for quickly routing to the correct shard.

`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend/shard.1`
```json
{
	"v1": "00000000-0000-4000-8000-000000000000",
	"type": "friend",
	"size": 4,

	// special shard properties
	"id": "shard.1",
	"lastId": "00000000-0000-4000-8000-000000000004",
}
```

`your-bucket/edges/00000000-0000-4000-8000-000000000000/friend/shard.2`

```json
{
	"v1": "00000000-0000-4000-8000-000000000000",
	"type": "friend",
	"size": 4,

	// special shard properties
	"id": "shard.2",
	"lastId": "00000000-0000-4000-8000-000000000008",
}
```

---

## KV Bucket

`your-bucket/kv/anyStringLessThan420Chars`

### Body

No size limit.

Can be: `string` | `number` | `boolean` | `object`

```json
{
	"key": "value",
	"key2": "value2",
	"deep": {
		"key": "value",
		"key2": "value2",
	}
}
```

### Metadata
```json
{
	"k": "anyStringLessThan420Chars",
	"type": "string | number | boolean | object",
}
```