import { describe, it, expect } from 'vitest';
import add from './add.js';
import addMultiple from './addMultiple.js';
import getMultiple from './getMultiple.js';
import deleteMultiple from './deleteMultiple.js';

describe('add', () => {

    it('should call add with the correct arguments', async () => {
		
        const result = await add('test', { some: 'data' });
        expect(result).toEqual({ some: 'data' });

    });

	it('should call addMultiple with the correct arguments', async () => {
		
		let kvs = {
			testObject: { some: 'data' },
			testString: "some string",
			testNumber: 123,
			testBoolean: true,
			testArray: [1, 2, 3],
			delete1: "delete1",
			delete2: "delete2",
		};

        const result = await addMultiple(kvs);
        expect(result).toEqual(kvs);

    });

	it('should get the correct value from the key', async () => {

		let kvs = {
			testObject: { some: 'data' },
			testString: "some string",
			testNumber: 123,
			testBoolean: true,
			testArray: [1, 2, 3],
			delete1: "delete1",
			delete2: "delete2",
		};

		let keys = Object.keys(kvs);

		let kvsBack = await getMultiple(keys);

		expect(kvsBack).toEqual(kvs);

		let del = await deleteMultiple([
			'delete1', 
			'delete2'
		]);

		expect(del).toEqual(true);

	});

});