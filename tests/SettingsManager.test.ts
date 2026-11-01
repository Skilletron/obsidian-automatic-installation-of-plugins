import { describe, expect, it } from "vitest";
import { Notice } from "obsidian";
import {
	SettingsManager,
	mergeSettingsObjects,
} from "../src/core/SettingsManager";
import { PLUGINS_SETTINGS_FILE } from "../src/types";
import { createTestVault, installedPlugin } from "./helpers";

const SETTINGS_PATH = `.obsidian/${PLUGINS_SETTINGS_FILE}`;
const dataPath = (folder: string) => `.obsidian/plugins/${folder}/data.json`;

describe("mergeSettingsObjects", () => {
	it("deep-merges nested objects, source wins on conflicts", () => {
		const target = { a: 1, b: { c: 2, d: 3 }, keep: true };
		const source = { a: 10, b: { c: 20, e: 5 } };
		expect(mergeSettingsObjects(target, source)).toEqual({
			a: 10,
			b: { c: 20, d: 3, e: 5 },
			keep: true,
		});
	});

	it("replaces arrays instead of merging them", () => {
		expect(
			mergeSettingsObjects({ list: [1, 2, 3] }, { list: [4] }),
		).toEqual({ list: [4] });
	});

	it("replaces an object with a primitive or null from the source", () => {
		expect(mergeSettingsObjects({ a: { b: 1 } }, { a: null })).toEqual({
			a: null,
		});
		expect(mergeSettingsObjects({ a: { b: 1 } }, { a: "x" })).toEqual({
			a: "x",
		});
	});

	it("returns a copy of the source when target is not a plain object", () => {
		const source = { a: 1 };
		const merged = mergeSettingsObjects([1, 2], source);
		expect(merged).toEqual(source);
		expect(merged).not.toBe(source);
		expect(mergeSettingsObjects(null, source)).toEqual(source);
		expect(mergeSettingsObjects("text", source)).toEqual(source);
	});

	it("returns non-object sources as-is", () => {
		expect(mergeSettingsObjects({ a: 1 }, 5)).toBe(5);
		expect(mergeSettingsObjects({ a: 1 }, null)).toBeNull();
		expect(mergeSettingsObjects({ a: 1 }, [1])).toEqual([1]);
	});

	it("does not let __proto__ in the source change the prototype", () => {
		const source = JSON.parse('{"__proto__": {"polluted": true}, "a": 1}');
		const merged = mergeSettingsObjects({ b: 2 }, source) as Record<
			string,
			unknown
		>;
		expect(merged).toEqual({ a: 1, b: 2 });
		expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
		expect(merged.polluted).toBeUndefined();
	});

	it("does not mutate the inputs", () => {
		const target = { a: { b: 1 } };
		const source = { a: { c: 2 } };
		mergeSettingsObjects(target, source);
		expect(target).toEqual({ a: { b: 1 } });
		expect(source).toEqual({ a: { c: 2 } });
	});
});

describe("SettingsManager.applySettingsToInstalledPlugins", () => {
	it("returns [] with a notice when the settings file is missing", async () => {
		const vault = createTestVault();
		const manager = new SettingsManager(vault.fileManager);
		expect(await manager.applySettingsToInstalledPlugins()).toEqual([]);
		expect(Notice.messages[0]).toContain(`No ${PLUGINS_SETTINGS_FILE}`);
	});

	it("returns [] when the settings file is invalid JSON", async () => {
		const vault = createTestVault({ [SETTINGS_PATH]: "{oops" });
		const manager = new SettingsManager(vault.fileManager);
		expect(await manager.applySettingsToInstalledPlugins()).toEqual([]);
		expect(Notice.messages[0]).toContain("Invalid JSON");
	});

	it("replaces data.json entirely when merge is off", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }, { a: 1, b: 2 }),
			[SETTINGS_PATH]: JSON.stringify({ dataview: { b: 20 } }),
		});
		const manager = new SettingsManager(vault.fileManager, () => false);

		expect(await manager.applySettingsToInstalledPlugins()).toEqual([
			"dataview",
		]);
		expect(vault.readJson(dataPath("dataview"))).toEqual({ b: 20 });
	});

	it("merges into existing data.json when merge is on", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }, { a: 1, b: 2 }),
			[SETTINGS_PATH]: JSON.stringify({ dataview: { b: 20 } }),
		});
		const manager = new SettingsManager(vault.fileManager, () => true);

		await manager.applySettingsToInstalledPlugins();
		expect(vault.readJson(dataPath("dataview"))).toEqual({ a: 1, b: 20 });
	});

	it("creates data.json when the plugin has none yet", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }),
			[SETTINGS_PATH]: JSON.stringify({ dataview: { b: 20 } }),
		});
		const manager = new SettingsManager(vault.fileManager, () => true);

		await manager.applySettingsToInstalledPlugins();
		expect(vault.readJson(dataPath("dataview"))).toEqual({ b: 20 });
	});

	it("falls back to replace when existing data.json is corrupt", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }),
			[dataPath("dataview")]: "{corrupt",
			[SETTINGS_PATH]: JSON.stringify({ dataview: { b: 20 } }),
		});
		const manager = new SettingsManager(vault.fileManager, () => true);

		await manager.applySettingsToInstalledPlugins();
		expect(vault.readJson(dataPath("dataview"))).toEqual({ b: 20 });
	});

	it("skips plugins that are not installed and unsafe IDs", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }),
			[SETTINGS_PATH]: JSON.stringify({
				dataview: { x: 1 },
				"not-installed": { x: 1 },
				"../escape": { x: 1 },
			}),
		});
		const manager = new SettingsManager(vault.fileManager);

		expect(await manager.applySettingsToInstalledPlugins()).toEqual([
			"dataview",
		]);
		expect(vault.read(dataPath("not-installed"))).toBeUndefined();
		expect(
			[...vault.adapter.files.keys()].some((p) => p.includes("escape")),
		).toBe(false);
	});

	it("skips falsy settings entries", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }, { a: 1 }),
			[SETTINGS_PATH]: JSON.stringify({ dataview: null }),
		});
		const manager = new SettingsManager(vault.fileManager);

		expect(await manager.applySettingsToInstalledPlugins()).toEqual([]);
		expect(vault.readJson(dataPath("dataview"))).toEqual({ a: 1 });
	});

	it("does not report a plugin as applied when the write fails", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }),
			[SETTINGS_PATH]: JSON.stringify({ dataview: { x: 1 } }),
		});
		vault.adapter.write = async () => {
			throw new Error("read-only");
		};
		const manager = new SettingsManager(vault.fileManager);

		expect(await manager.applySettingsToInstalledPlugins()).toEqual([]);
		expect(Notice.messages.some((m) => m.includes("Cannot write"))).toBe(
			true,
		);
	});

	it("applies settings when the plugin folder differs from its id", async () => {
		const vault = createTestVault({
			...installedPlugin("manual-folder", { id: "real-id" }),
			[SETTINGS_PATH]: JSON.stringify({ "real-id": { x: 1 } }),
		});
		const manager = new SettingsManager(vault.fileManager);

		expect(await manager.applySettingsToInstalledPlugins()).toEqual([
			"real-id",
		]);
		expect(vault.readJson(dataPath("manual-folder"))).toEqual({ x: 1 });
	});

	it("prefers the folder named after the id", async () => {
		const vault = createTestVault({
			...installedPlugin("other", { id: "dataview" }),
			...installedPlugin("dataview", { id: "dataview" }),
			[SETTINGS_PATH]: JSON.stringify({ dataview: { x: 1 } }),
		});
		const manager = new SettingsManager(vault.fileManager);

		await manager.applySettingsToInstalledPlugins();
		expect(vault.read(dataPath("dataview"))).toBeDefined();
		expect(vault.read(dataPath("other"))).toBeUndefined();
	});
});

describe("SettingsManager.collectSettingsTargets", () => {
	it("pairs settings entries with plugin folders without writing", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }, { a: 1 }),
			...installedPlugin("folder", { id: "real-id" }),
			[SETTINGS_PATH]: JSON.stringify({
				dataview: { a: 2 },
				"real-id": { b: 1 },
				missing: { c: 1 },
			}),
		});
		const manager = new SettingsManager(vault.fileManager);

		expect(await manager.collectSettingsTargets()).toEqual([
			{ pluginId: "dataview", folderName: "dataview", settings: { a: 2 } },
			{ pluginId: "real-id", folderName: "folder", settings: { b: 1 } },
		]);
		expect(vault.readJson(dataPath("dataview"))).toEqual({ a: 1 });
	});
});

describe("SettingsManager.applySettingsForPlugin", () => {
	it("writes settings into the given plugin folder", async () => {
		const vault = createTestVault({
			...installedPlugin("folder", { id: "real-id" }, { keep: 1 }),
			[SETTINGS_PATH]: JSON.stringify({ "real-id": { x: 1 } }),
		});
		const manager = new SettingsManager(vault.fileManager, () => true);

		await manager.applySettingsForPlugin("real-id", "folder");
		expect(vault.readJson(dataPath("folder"))).toEqual({ keep: 1, x: 1 });
	});

	it("does nothing when the plugin has no settings entry", async () => {
		const vault = createTestVault({
			...installedPlugin("dataview", { id: "dataview" }, { keep: 1 }),
			[SETTINGS_PATH]: JSON.stringify({ other: { x: 1 } }),
		});
		const manager = new SettingsManager(vault.fileManager);

		await manager.applySettingsForPlugin("dataview", "dataview");
		expect(vault.readJson(dataPath("dataview"))).toEqual({ keep: 1 });
	});

	it("does nothing when the plugin is not installed", async () => {
		const vault = createTestVault({
			[SETTINGS_PATH]: JSON.stringify({ dataview: { x: 1 } }),
		});
		const manager = new SettingsManager(vault.fileManager);

		await manager.applySettingsForPlugin("dataview", "dataview");
		expect(vault.read(dataPath("dataview"))).toBeUndefined();
	});

	it("does nothing when the settings file is missing", async () => {
		const vault = createTestVault(installedPlugin("dataview", { id: "dataview" }));
		const manager = new SettingsManager(vault.fileManager);

		await manager.applySettingsForPlugin("dataview", "dataview");
		expect(vault.read(dataPath("dataview"))).toBeUndefined();
		expect(Notice.messages).toEqual([]);
	});

	it("rejects unsafe IDs", async () => {
		const vault = createTestVault({
			[SETTINGS_PATH]: JSON.stringify({ "../x": { x: 1 } }),
		});
		const manager = new SettingsManager(vault.fileManager);

		await manager.applySettingsForPlugin("../x", "../x");
		expect(vault.adapter.files.size).toBe(1);
	});
});
