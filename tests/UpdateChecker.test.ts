import { describe, expect, it } from "vitest";
import { setRequestUrlHandler } from "obsidian";
import {
	UpdateChecker,
	compareVersions,
	updatePinsInList,
} from "../src/core/UpdateChecker";
import { NetworkManager } from "../src/utils/NetworkManager";
import { PLUGIN_ID, PLUGIN_REGISTRY_URL, PLUGINS_LIST_FILE } from "../src/types";
import { createTestVault, installedPlugin } from "./helpers";

const raw = (repo: string, file: string) =>
	`https://raw.githubusercontent.com/${repo}/HEAD/${file}`;

function serve(routes: Record<string, unknown>): void {
	setRequestUrlHandler(async (req) =>
		Object.prototype.hasOwnProperty.call(routes, req.url)
			? { status: 200, json: routes[req.url] }
			: { status: 404, json: null },
	);
}

const registry = [
	{ id: "dataview", repo: "o/dataview" },
	{ id: "calendar", repo: "o/calendar" },
	{ id: "fancy", repo: "o/fancy" },
	{ id: "gone", repo: "o/gone" },
];

function checker(files: Record<string, string>, app = "1.5.0") {
	const vault = createTestVault(files);
	return new UpdateChecker(vault.fileManager, new NetworkManager(), () => app);
}

describe("compareVersions", () => {
	it("compares numerically and handles v prefixes and pre-releases", () => {
		expect(compareVersions("1.10.0", "1.9.2")).toBeGreaterThan(0);
		expect(compareVersions("v1.2", "1.2.0")).toBe(0);
		expect(compareVersions("1.2.0-beta.1", "1.2.0")).toBeLessThan(0);
		expect(compareVersions("0.5.68", "0.5.67")).toBeGreaterThan(0);
	});
});

describe("UpdateChecker.check", () => {
	const files = {
		...installedPlugin("dataview", { id: "dataview", version: "0.5.67" }),
		...installedPlugin("calendar", { id: "calendar", version: "1.5.10" }),
		...installedPlugin("fancy", { id: "fancy", version: "1.0.0" }),
		...installedPlugin("gone", { id: "gone", version: "1.0.0" }),
		...installedPlugin("local-only", { id: "local-only", version: "1.0.0" }),
		...installedPlugin(PLUGIN_ID, { id: PLUGIN_ID, version: "1.0.0" }),
		[`.obsidian/${PLUGINS_LIST_FILE}`]: JSON.stringify([
			{ id: "dataview", version: "0.5.67" },
			"calendar",
		]),
	};

	it("reports newer versions, pins and versions that need a newer Obsidian", async () => {
		serve({
			[PLUGIN_REGISTRY_URL]: registry,
			[raw("o/dataview", "manifest.json")]: {
				name: "Dataview",
				version: "0.5.68",
				minAppVersion: "0.15.0",
			},
			[raw("o/calendar", "manifest.json")]: { name: "Calendar", version: "1.5.10" },
			[raw("o/fancy", "manifest.json")]: {
				name: "Fancy",
				version: "3.0.0",
				minAppVersion: "1.9.0",
			},
			[raw("o/fancy", "versions.json")]: {
				"3.0.0": "1.9.0",
				"2.1.0": "1.4.0",
				"2.0.0": "1.0.0",
				"0.9.0": "0.15.0",
			},
		});

		const updates = await checker(files).check();

		expect(updates).toEqual([
			{
				pluginId: "dataview",
				name: "Dataview",
				installed: "0.5.67",
				available: "0.5.68",
				pinned: "0.5.67",
			},
			{
				pluginId: "fancy",
				name: "Fancy",
				installed: "1.0.0",
				available: "2.1.0",
				newerNeedsApp: { version: "3.0.0", minAppVersion: "1.9.0" },
				pinned: undefined,
			},
		]);
	});

	it("reports no available version when nothing newer runs here", async () => {
		serve({
			[PLUGIN_REGISTRY_URL]: registry,
			[raw("o/fancy", "manifest.json")]: {
				name: "Fancy",
				version: "3.0.0",
				minAppVersion: "1.9.0",
			},
		});
		const updates = await checker(
			installedPlugin("fancy", { id: "fancy", version: "1.0.0" }),
		).check();
		expect(updates).toEqual([
			{
				pluginId: "fancy",
				name: "Fancy",
				installed: "1.0.0",
				available: null,
				newerNeedsApp: { version: "3.0.0", minAppVersion: "1.9.0" },
				pinned: undefined,
			},
		]);
	});

	it("fails when the registry cannot be loaded", async () => {
		serve({});
		await expect(checker(files).check()).rejects.toThrow("HTTP 404");
	});
});

describe("updatePinsInList", () => {
	it("moves pins and keeps everything else", () => {
		const text = JSON.stringify([
			{ id: "dataview", version: "0.5.67", note: "x" },
			"calendar",
			{ id: "tasks", version: "1.0.0" },
		]);
		const result = updatePinsInList(
			text,
			new Map([
				["dataview", "0.5.68"],
				["calendar", "2.0.0"],
			]),
		);
		expect(JSON.parse(result!)).toEqual([
			{ id: "dataview", version: "0.5.68", note: "x" },
			"calendar",
			{ id: "tasks", version: "1.0.0" },
		]);
	});

	it("returns null when nothing changes or the list is invalid", () => {
		expect(updatePinsInList('["a"]', new Map([["a", "1.0.0"]]))).toBeNull();
		expect(updatePinsInList("{oops", new Map())).toBeNull();
	});
});
