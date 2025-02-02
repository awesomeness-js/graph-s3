import { describe, it, expect } from 'vitest';
import add from './add.js';
import addMultiple from './addMultiple.js';
import getMultiple from './getMultiple.js';
import deleteMultiple from './deleteMultiple.js';


describe('add', async () => {

	it('should set envs', async () => {
		//console.log('testENV', process.env.AWESOMENESS_GRAPH_AWS_BUCKET);
	});


    it('should call addMultiple with the correct arguments', async () => {
        
		const node = { 
			_id: '00000000-0000-4000-8000-000000000000', 
			_type: 'test', 
			name: 'Test Node' 
		};

		const node2 = { 
			_id: '00000000-0000-4000-8000-000000000001', 
			_type: 'test', 
			name: 'Test Node' 
		}
		
        const result = await addMultiple([node, node2]);
        expect(result.length).toEqual(2);

    });

    it('should handle errors from addMultiple', async () => {

        const node = { 
			_id: '00000000-0000-4000-8000-000000000000', 
			name: 'Test Node' 
		};
        await expect(add(node)).rejects.toThrow('Vertex is missing required key: _type');

	});

	it('should get results', async () => {

		let vertices = await getMultiple([
			'00000000-0000-4000-8000-000000000000',
			'00000000-0000-4000-8000-000000000001'
		]);
		
		// console.log({vertices});

		expect(vertices['00000000-0000-4000-8000-000000000000']).toEqual({ 
			_id: '00000000-0000-4000-8000-000000000000', 
			_type: 'test', 
			name: 'Test Node' 
		});
	});

	it('should delete results', async () => {
		let result = await deleteMultiple([
			'00000000-0000-4000-8000-000000000000',
			'00000000-0000-4000-8000-000000000001'
		]);
		expect(result).toEqual(true);
	});

});