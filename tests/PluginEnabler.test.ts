import { afterEach, describe, expect, it, vi } from "vitest";
import { PluginEnabler } from "../src/core/PluginEnabler";
import { PLUGIN_ID } from "../src/types";
import { createTestVault, installedPlugin } from "./helpers";

function setup(
	options: {
		files?: Record<string, string>;
		manifests?: string[];
		// Plugins currently loaded (app.plugins.plugins)
		loaded?: string[];
		withSaveConfig?: boolean;
		// app.setting
		setting?: { isOpen?: boolean };
	} = {},
) {
	const calls: string[] = [];
	const plugins = {
		manifests: Object.fromEntries(
			(options.manifests ?? []).map((id) => [id, { id }]),
		),
		enabledPlugins: new Set<string>(),
		plugins: Object.fromEntries(
			(options.loaded ?? []).map((id) => [id, {}]),
		),
		loadManifests: vi.fn(async () => {}),
		loadManifest: vi.fn(async () => {}),
		enablePluginAndSave: vi.fn(async (id: string) => {
			calls.push(`enableAndSave:${id}`);
		}),
		enablePlugin: vi.fn(async (id: string) => {
			calls.push(`enable:${id}`);
		}),
		disablePlugin: vi.fn(async (id: string) => {
			calls.push(`disable:${id}`);
		}),
		saveConfig:
			options.withSaveConfig === false ? undefined : vi.fn(async () => {}),
	};
	const vault = createTestVault(options.files ?? {}, {
		plugins,
		...(options.setting ? { setting: options.setting } : {}),
	});
	return {
		vault,
		plugins,
		calls,
		enabler: new PluginEnabler(vault.app, vault.fileManager),
	};
}

describe("PluginEnabler.enableInstalledPlugins", () => {
	it("returns early for an empty list", async () => {
		const { enabler, plugins } = setup();
		expect(await enabler.enableInstalledPlugins([])).toEqual({
			enabled: 0,
			failed: 0,
			failedPlugins: [],
		});
		expect(plugins.loadManifests).not.toHaveBeenCalled();
	});

	it("enables each plugin, reports progress and saves the config", async () => {
		const { enabler, plugins, calls } = setup({
			manifests: ["dataview", "calendar"],
		});
		const progress: string[] = [];

		const result = await enabler.enableInstalledPlugins(
			["dataview", "calendar", "../evil"],
			(current, total, id) => progress.push(`${current}/${total} ${id}`),
		);

		expect(result).toEqual({ enabled: 2, failed: 0, failedPlugins: [] });
		expect(progress).toEqual(["1/2 dataview", "2/2 calendar"]);
		expect(calls).toEqual([
			"enableAndSave:dataview",
			"enableAndSave:calendar",
		]);
		expect([...plugins.enabledPlugins]).toEqual(["dataview", "calendar"]);
		expect(plugins.saveConfig).toHaveBeenCalled();
	});

	it("resolves IDs that differ by an obsidian- prefix", async () => {
		const { enabler, calls } = setup({ manifests: ["obsidian-git"] });
		await enabler.enableInstalledPlugins(["git"]);
		expect(calls).toEqual(["enableAndSave:obsidian-git"]);
	});

	it("resolves IDs through the local manifest", async () => {
		const { enabler, calls } = setup({
			manifests: ["real-id"],
			files: installedPlugin("folder-id", { id: "real-id" }),
		});
		await enabler.enableInstalledPlugins(["folder-id"]);
		expect(calls).toEqual(["enableAndSave:real-id"]);
	});

	it("writes community-plugins.json when saveConfig is unavailable", async () => {
		const { enabler, vault } = setup({
			withSaveConfig: false,
			manifests: ["dataview"],
			files: {
				".obsidian/community-plugins.json": JSON.stringify(["calendar"]),
			},
		});

		await enabler.enableInstalledPlugins(["dataview"]);
		expect(vault.readJson(".obsidian/community-plugins.json")).toEqual([
			"calendar",
			"dataview",
			PLUGIN_ID,
		]);
	});

	it("does not mark a plugin enabled when enabling fails", async () => {
		const { enabler, plugins } = setup({ manifests: ["broken"] });
		plugins.enablePluginAndSave.mockRejectedValueOnce(new Error("crash"));

		const result = await enabler.enableInstalledPlugins(["broken"]);
		expect(result).toEqual({
			enabled: 0,
			failed: 1,
			failedPlugins: ["broken"],
		});
		expect(plugins.enabledPlugins.has("broken")).toBe(false);
	});
});

describe("PluginEnabler.runWithPluginsStopped", () => {
	function setSettingsOpen(open: boolean): void {
		(document as unknown as { querySelector: () => unknown }).querySelector =
			() => (open ? {} : null);
	}

	afterEach(() => {
		setSettingsOpen(false);
		vi.useRealTimers();
	});

	it("unloads loaded plugins, runs the task, then loads them again", async () => {
		const { enabler, calls } = setup({
			manifests: ["dataview", "calendar"],
			loaded: ["dataview", "calendar"],
		});

		const result = await enabler.runWithPluginsStopped(
			["dataview", "calendar", PLUGIN_ID, "../evil"],
			async () => {
				calls.push("task");
			},
		);

		expect(result).toEqual({ restarted: 2, deferred: 0 });
		expect(calls).toEqual([
			"disable:dataview",
			"disable:calendar",
			"task",
			"enable:dataview",
			"enable:calendar",
		]);
	});

	it("only runs the task for plugins that are not loaded", async () => {
		const { enabler, calls } = setup({ manifests: ["dataview"] });
		const result = await enabler.runWithPluginsStopped(
			["dataview"],
			async () => {
				calls.push("task");
			},
		);
		expect(result).toEqual({ restarted: 0, deferred: 0 });
		expect(calls).toEqual(["task"]);
	});

	it("loads plugins again even when the task throws", async () => {
		const { enabler, calls } = setup({
			manifests: ["dataview"],
			loaded: ["dataview"],
		});
		await expect(
			enabler.runWithPluginsStopped(["dataview"], async () => {
				throw new Error("write failed");
			}),
		).rejects.toThrow("write failed");
		expect(calls).toEqual(["disable:dataview", "enable:dataview"]);
	});

	it("asks app.setting whether Settings is open", async () => {
		const setting = { isOpen: true };
		const { enabler, calls } = setup({
			manifests: ["dataview"],
			loaded: ["dataview"],
			setting,
		});
		const result = await enabler.runWithPluginsStopped(
			["dataview"],
			async () => {
				calls.push("task");
			},
		);
		// The DOM has no Settings modal (popout window), isOpen still wins.
		expect(result).toEqual({ restarted: 0, deferred: 1 });
		expect(calls).toEqual(["task"]);
	});

	it("ignores the mobile drawer settings button", async () => {
		(document as unknown as {
			querySelector: (selector: string) => unknown;
		}).querySelector = (selector) =>
			selector === ".mod-settings" ? {} : null;
		const { enabler } = setup({
			manifests: ["dataview"],
			loaded: ["dataview"],
		});
		const result = await enabler.runWithPluginsStopped(
			["dataview"],
			async () => {},
		);
		expect(result).toEqual({ restarted: 1, deferred: 0 });
	});

	it("defers the restart until the Settings window closes", async () => {
		vi.useFakeTimers();
		setSettingsOpen(true);
		const { enabler, calls } = setup({
			manifests: ["dataview"],
			loaded: ["dataview"],
		});

		const result = await enabler.runWithPluginsStopped(
			["dataview"],
			async () => {
				calls.push("task");
			},
		);
		expect(result).toEqual({ restarted: 0, deferred: 1 });
		expect(calls).toEqual(["task"]);

		await vi.advanceTimersByTimeAsync(1000);
		expect(calls).toEqual(["task"]);

		setSettingsOpen(false);
		await vi.advanceTimersByTimeAsync(500);
		expect(calls).toEqual([
			"task",
			"disable:dataview",
			"task",
			"enable:dataview",
		]);
	});
});
