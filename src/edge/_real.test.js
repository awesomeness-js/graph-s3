import { describe, it, expect } from "vitest";
import add from "./add.js";
import addMultiple from "./addMultiple.js";
import getMultiple from "./getMultiple.js";
import search from "./search.js";
import deleteMultiple from "./deleteMultiple.js";

describe("add edges", () => {
	let vertex1 = "00000000-0000-4000-8000-000000000000";

	it("should create a simple edge collection", async () => {
		const edge = [
			vertex1,
			"testTypeSimple",
			"00000000-0000-4000-8000-000000000000",
		];

		const result = await add(edge);

		expect(result).toEqual(edge);
	});

	it("should create 2 sharded edge collections", async () => {
		const edges = [
			[vertex1, "testType", "00000000-0000-4000-8000-000000000001"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000002"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000003"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000004"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000005"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000006"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000007"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000008"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000009"],
			[vertex1, "testType", "00000000-0000-4000-8000-000000000010"],

			[vertex1, "testType2", "00000000-0000-4000-8000-000000000001"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000002"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000003"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000004"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000005"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000006"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000007"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000008"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000009"],
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000010"],
		];

		const result2 = await addMultiple(edges, {
			maxSize: 8,
		});

		expect(result2).toEqual(edges);
	}, 10000);

	it("should get edges", async () => {
		const result = await getMultiple([
			[vertex1, "testType"],
			[vertex1, "testTypeSimple"],
		]);

		expect(result[0][1]).toBe("testTypeSimple");
	});

	it("should get edges", async () => {
		const result = await search(vertex1, "testTypeSimple");
		const result2 = await search(vertex1, ["testType", "testTypeSimple"]);

		let exists = false;
		result2.forEach((edge) => {
			if (
				edge[1] === "testType" &&
				edge[2] === "00000000-0000-4000-8000-000000000010"
			) {
				exists = true;
			}
		});

		expect(result[0][1]).toBe("testTypeSimple");
		expect(exists).toBe(true);
	});

	it("should delete one edge from a sharded edge collection", async () => {
		const result = await deleteMultiple([
			[vertex1, "testType2", "00000000-0000-4000-8000-000000000001"],
		]);

		expect(result).toBe(true);
	});
});
