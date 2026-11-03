import { describe, expect, it } from "vitest";
import {
	PACK_FORMAT,
	buildSetupPack,
	mergePackIntoSetup,
	packUrl,
	parseSetupPack,
} from "../src/core/SetupPack";
import { SetupExporter } from "../src/core/SetupExporter";
import { SettingsBackup } from "../src/core/SettingsBackup";
import { SECRET_PLACEHOLDER } from "../src/utils/secrets";
import {
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
	VAULT_SETUP_FILE,
} from "../src/types";
import { createTestVault, installedPlugin } from "./helpers";

const LIST = `.obsidian/${PLUGINS_LIST_FILE}`;
const SETTINGS = `.obsidian/${PLUGINS_SETTINGS_FILE}`;
const SETUP = `.obsidian/${VAULT_SETUP_FILE}`;

const pack = (extra: Record<string, unknown> = {}) => ({
	format: PACK_FORMAT,
	version: 1,
	name: "Writer",
	plugins: [
		{ id: "dataview", version: "0.5.68", note: "keep" },
		"calendar",
		{ id: "../evil" },
	],
	settings: { dataview: { refresh: 500 }, "../x": { a: 1 }, calendar: "nope" },
	...extra,
});

describe("parseSetupPack", () => {
	it("keeps valid plugins (as written) and settings", () => {
		const parsed = parseSetupPack(pack({ vaultSetup: { theme: "Minimal" } }));
		expect(parsed?.name).toBe("Writer");
		expect(parsed?.plugins).toEqual([
			{ id: "dataview", version: "0.5.68" },
			{ id: "calendar" },
		]);
		expect(parsed?.pluginItems).toEqual([
			{ id: "dataview", version: "0.5.68", note: "keep" },
			"calendar",
		]);
		expect(parsed?.settings).toEqual({ dataview: { refresh: 500 } });
		expect(parsed?.vaultSetup?.theme).toEqual({ name: "Minimal" });
	});

	it("rejects files that are not setup packs", () => {
		expect(parseSetupPack({ plugins: [] })).toBeNull();
		expect(parseSetupPack(["dataview"])).toBeNull();
		expect(parseSetupPack(null)).toBeNull();
	});

	it("round-trips a built pack", () => {
		const built = buildSetupPack(["dataview"], { dataview: { a: 1 } }, null, "Me");
		expect(parseSetupPack(JSON.parse(JSON.stringify(built)))?.plugins).toEqual([
			{ id: "dataview" },
		]);
	});
});

describe("packUrl", () => {
	it("accepts https and turns GitHub pages into raw links", () => {
		expect(packUrl("https://example.com/pack.json")).toBe(
			"https://example.com/pack.json",
		);
		expect(packUrl("https://github.com/me/repo/blob/main/pack.json")).toBe(
			"https://raw.githubusercontent.com/me/repo/main/pack.json",
		);
		expect(packUrl("https://gist.github.com/me/0123abcd")).toBe(
			"https://gist.githubusercontent.com/me/0123abcd/raw",
		);
	});

	it("refuses anything that is not https", () => {
		expect(packUrl("http://example.com/pack.json")).toBeNull();
		expect(packUrl("file:///etc/passwd")).toBeNull();
		expect(packUrl("setup-pack.json")).toBeNull();
	});
});

describe("mergePackIntoSetup", () => {
	it("adds the pack to the vault's files; the pack wins on overlap", async () => {
		const vault = createTestVault({
			[LIST]: JSON.stringify([{ id: "dataview", version: "0.5.0" }, "tasks"]),
			[SETTINGS]: JSON.stringify({
				dataview: { refresh: 100, keep: true },
				tasks: { a: 1 },
			}),
			[SETUP]: JSON.stringify({
				theme: { name: "Things" },
				snippets: { mine: { css: "a{}" } },
				hotkeys: { "a:b": [] },
			}),
		});
		const parsed = parseSetupPack(
			pack({
				vaultSetup: {
					theme: { name: "Minimal" },
					snippets: { theirs: { css: "b{}" } },
					corePlugins: { graph: false },
				},
			}),
		)!;
		const backup = new SettingsBackup(vault.fileManager);
		backup.begin("Import setup pack");
		await mergePackIntoSetup(vault.fileManager, parsed, backup);
		await backup.end();

		expect(vault.readJson(LIST)).toEqual([
			"tasks",
			{ id: "dataview", version: "0.5.68", note: "keep" },
			"calendar",
		]);
		expect(vault.readJson(SETTINGS)).toEqual({
			dataview: { refresh: 500, keep: true },
			tasks: { a: 1 },
		});
		expect(vault.readJson(SETUP)).toEqual({
			theme: { name: "Minimal" },
			snippets: { mine: { css: "a{}" }, theirs: { css: "b{}" } },
			hotkeys: { "a:b": [] },
			corePlugins: { graph: false },
		});
		expect((await backup.latest())?.snapshot.entries.map((e) => e.path)).toEqual([
			LIST,
			SETTINGS,
			SETUP,
		]);
	});

	it("creates the files in a fresh vault", async () => {
		const vault = createTestVault();
		await mergePackIntoSetup(vault.fileManager, parseSetupPack(pack())!);
		expect(vault.readJson(LIST)).toHaveLength(2);
		expect(vault.read(SETUP)).toBeUndefined();
	});
});

describe("SetupExporter.collect for packs", () => {
	it("always leaves secrets out when asked to", async () => {
		const vault = createTestVault(
			installedPlugin("ai", { id: "ai" }, { apiKey: "sk-1", model: "x" }),
		);
		const exporter = new SetupExporter(
			vault.fileManager,
			() => false,
			() => ({ redact: false, extraKeys: [] }),
		);
		expect((await exporter.collect()).settings).toEqual({
			ai: { apiKey: "sk-1", model: "x" },
		});
		const forced = await exporter.collect(true);
		expect(forced.settings).toEqual({
			ai: { apiKey: SECRET_PLACEHOLDER, model: "x" },
		});
		expect(forced.redactedCount).toBe(1);
	});
});
