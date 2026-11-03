import { describe, expect, it } from "vitest";
import { diffSettings, formatChange } from "../src/utils/settingsDiff";

describe("diffSettings", () => {
	it("lists added, changed and removed keys, nested by path", () => {
		expect(
			diffSettings(
				{ a: 1, b: { c: 2, d: 3 }, gone: true, list: [1, 2] },
				{ a: 1, b: { c: 20, e: 5 }, list: [1, 2], fresh: "x" },
			),
		).toEqual([
			{ path: "b.c", kind: "changed", before: 2, after: 20 },
			{ path: "b.d", kind: "removed", before: 3 },
			{ path: "b.e", kind: "added", after: 5 },
			{ path: "gone", kind: "removed", before: true },
			{ path: "fresh", kind: "added", after: "x" },
		]);
	});

	it("compares arrays as a whole and returns nothing when equal", () => {
		expect(diffSettings({ l: [1, 2] }, { l: [2, 1] })).toEqual([
			{ path: "l", kind: "changed", before: [1, 2], after: [2, 1] },
		]);
		expect(diffSettings({ a: { b: 1 } }, { a: { b: 1 } })).toEqual([]);
	});
});

describe("formatChange", () => {
	it("formats each kind of change", () => {
		expect(formatChange({ path: "size", kind: "changed", before: 14, after: 16 })).toBe(
			"size: 14 → 16",
		);
		expect(formatChange({ path: "theme", kind: "added", after: "dark" })).toBe(
			'+ theme: "dark"',
		);
		expect(formatChange({ path: "old", kind: "removed", before: 1 })).toBe("− old");
	});

	it("masks secrets and shortens long values", () => {
		expect(
			formatChange({ path: "auth.apiKey", kind: "changed", before: "a", after: "b" }),
		).toBe("auth.apiKey: •••• → ••••");
		const long = formatChange({ path: "text", kind: "added", after: "x".repeat(100) });
		expect(long.length).toBeLessThan(60);
		expect(long.endsWith("…")).toBe(true);
	});
});
