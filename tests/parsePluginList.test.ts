import { describe, expect, it } from "vitest";
import { Notice } from "obsidian";
import {
	isSafePathSegment,
	isSafePluginId,
	normalizeVersion,
	parsePluginList,
} from "../src/utils/parsePluginList";

describe("normalizeVersion", () => {
	it("strips a leading v and surrounding whitespace", () => {
		expect(normalizeVersion("v1.2.3")).toBe("1.2.3");
		expect(normalizeVersion("V1.2.3")).toBe("1.2.3");
		expect(normalizeVersion("  1.2.3 ")).toBe("1.2.3");
	});

	it("leaves pre-release suffixes alone", () => {
		expect(normalizeVersion("1.0.0-beta.1")).toBe("1.0.0-beta.1");
	});

	it("only strips a v that precedes a digit", () => {
		expect(normalizeVersion("version1")).toBe("version1");
	});
});

describe("isSafePathSegment", () => {
	it.each(["plugin", "my-plugin", "a.b", "..hidden", "with space"])(
		"accepts %j",
		(segment) => {
			expect(isSafePathSegment(segment)).toBe(true);
		},
	);

	it.each(["", ".", "..", "a/b", "a\\b", "a\0b"])("rejects %j", (segment) => {
		expect(isSafePathSegment(segment)).toBe(false);
	});
});

describe("isSafePluginId", () => {
	it.each(["dataview", "obsidian-git", "templater_obsidian", "a1.b2", "9lives"])(
		"accepts %j",
		(id) => {
			expect(isSafePluginId(id)).toBe(true);
		},
	);

	it.each([
		"",
		"-leading-dash",
		".hidden",
		"../escape",
		"a/b",
		"a b",
		"name\n",
		"плагин",
	])("rejects %j", (id) => {
		expect(isSafePluginId(id)).toBe(false);
	});
});

describe("parsePluginList", () => {
	it("returns null and shows a notice for non-array input", () => {
		expect(parsePluginList({ id: "dataview" })).toBeNull();
		expect(parsePluginList("dataview")).toBeNull();
		expect(parsePluginList(null)).toBeNull();
		expect(Notice.messages).toHaveLength(3);
		expect(Notice.messages[0]).toContain("must contain an array");
	});

	it("returns an empty list for an empty array", () => {
		expect(parsePluginList([])).toEqual([]);
		expect(Notice.messages).toEqual([]);
	});

	it("parses plain string IDs and trims them", () => {
		expect(parsePluginList(["dataview", "  calendar  "])).toEqual([
			{ id: "dataview" },
			{ id: "calendar" },
		]);
	});

	it("parses { id, version } objects and normalizes versions", () => {
		expect(
			parsePluginList([
				{ id: "dataview", version: "v0.5.68" },
				{ id: "calendar", version: " 1.5.10 " },
			]),
		).toEqual([
			{ id: "dataview", version: "0.5.68" },
			{ id: "calendar", version: "1.5.10" },
		]);
	});

	it("ignores empty or non-string versions", () => {
		expect(
			parsePluginList([
				{ id: "a", version: "" },
				{ id: "b", version: "   " },
				{ id: "c", version: 3 },
			]),
		).toEqual([{ id: "a" }, { id: "b" }, { id: "c" }]);
	});

	it("accepts a mix of strings and objects in order", () => {
		expect(
			parsePluginList(["obsidian-git", { id: "dataview", version: "1.0.0" }]),
		).toEqual([{ id: "obsidian-git" }, { id: "dataview", version: "1.0.0" }]);
	});

	it("skips invalid entries and reports how many were skipped", () => {
		const result = parsePluginList([
			"dataview",
			"",
			"../evil",
			42,
			null,
			["nested"],
			{ version: "1.0.0" },
			{ id: "   " },
			{ id: "a/b" },
			{ id: "calendar" },
		]);

		expect(result).toEqual([{ id: "dataview" }, { id: "calendar" }]);
		expect(Notice.messages).toEqual([
			expect.stringContaining("Skipped 8 invalid entries"),
		]);
	});

	it("uses the singular form when one entry is skipped", () => {
		parsePluginList(["dataview", 1]);
		expect(Notice.messages).toEqual([
			expect.stringContaining("Skipped 1 invalid entry "),
		]);
	});

	it("keeps duplicate IDs as listed", () => {
		expect(parsePluginList(["a", "a"])).toEqual([{ id: "a" }, { id: "a" }]);
	});
});
