import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";

// These tests run against a real Obsidian and download real plugins from
// GitHub. They share one vault and run in order: each step builds on the
// state the previous one left behind.

const PLUGIN_ID = "automatic-installation-of-plugins";
const HIDER = "obsidian-hider";
const URL_INTO_SELECTION = "url-into-selection";

async function writeConfigJson(name: string, data: unknown): Promise<void> {
	await browser.executeObsidian(
		async ({ app }, name, text) => {
			await app.vault.adapter.write(`${app.vault.configDir}/${name}`, text);
		},
		name,
		JSON.stringify(data, null, 2),
	);
}

async function readConfigJson<T>(name: string): Promise<T | null> {
	const text = await browser.executeObsidian(async ({ app }, name) => {
		const path = `${app.vault.configDir}/${name}`;
		return (await app.vault.adapter.exists(path))
			? await app.vault.adapter.read(path)
			: null;
	}, name);
	return text === null ? null : (JSON.parse(text) as T);
}

// Calls a plugin method and waits for it, unlike executeObsidianCommand,
// which does not wait for async command callbacks.
async function runPluginMethod(
	method:
		| "runImportPipeline"
		| "applySettingsToInstalledPlugins"
		| "exportPluginSetup",
): Promise<void> {
	await browser.executeObsidian(
		async ({ app }, id, method) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const plugin = (app as any).plugins.plugins[id];
			await plugin[method]();
		},
		PLUGIN_ID,
		method,
	);
}

interface PluginState {
	installedVersion: string | null;
	enabled: boolean;
	loaded: boolean;
	settings: Record<string, unknown> | null;
}

async function pluginState(id: string): Promise<PluginState> {
	return browser.executeObsidian(async ({ app }, id) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const plugins = (app as any).plugins;
		const dir = `${app.vault.configDir}/plugins/${id}`;
		const manifestPath = `${dir}/manifest.json`;
		const installedVersion = (await app.vault.adapter.exists(manifestPath))
			? JSON.parse(await app.vault.adapter.read(manifestPath)).version
			: null;
		const loaded = plugins.plugins[id];
		return {
			installedVersion,
			enabled: plugins.enabledPlugins.has(id),
			loaded: Boolean(loaded),
			settings: loaded?.settings
				? JSON.parse(JSON.stringify(loaded.settings))
				: null,
		};
	}, id);
}

describe("Community Install Manager in Obsidian", () => {
	before(async () => {
		await browser.reloadObsidian({ vault: "test-e2e/vaults/empty" });
	});

	it("registers its commands", async () => {
		const ids = await browser.executeObsidian(({ app }) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Object.keys((app as any).commands.commands),
		);
		for (const command of [
			"export-plugin-setup",
			"preview-plugin-setup",
			"import-plugin-setup",
			"apply-plugin-settings",
		]) {
			expect(ids).toContain(`${PLUGIN_ID}:${command}`);
		}
	});

	it("installs, configures and enables listed plugins in a clean vault", async () => {
		await writeConfigJson("community-plugins-list.json", [
			{ id: HIDER, version: "1.7.0" },
			URL_INTO_SELECTION,
		]);
		await writeConfigJson("community-plugins-settings.json", {
			[HIDER]: { hideStatus: true },
		});

		await runPluginMethod("runImportPipeline");

		const hider = await pluginState(HIDER);
		expect(hider.installedVersion).toBe("1.7.0");
		expect(hider.enabled).toBe(true);
		expect(hider.loaded).toBe(true);
		// Settings are written before the plugin starts, so it loads them.
		expect(hider.settings?.hideStatus).toBe(true);

		const urlPlugin = await pluginState(URL_INTO_SELECTION);
		expect(urlPlugin.installedVersion).not.toBeNull();
		expect(urlPlugin.enabled).toBe(true);
		expect(urlPlugin.loaded).toBe(true);

		const enabledOnDisk = await readConfigJson<string[]>(
			"community-plugins.json",
		);
		expect(enabledOnDisk).toEqual(
			expect.arrayContaining([HIDER, URL_INTO_SELECTION]),
		);
	});

	it("does not turn a plugin back on when it is already installed", async () => {
		await browser.executeObsidian(async ({ app }, id) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (app as any).plugins.disablePluginAndSave(id);
		}, URL_INTO_SELECTION);

		await runPluginMethod("runImportPipeline");

		const urlPlugin = await pluginState(URL_INTO_SELECTION);
		expect(urlPlugin.enabled).toBe(false);
		expect(urlPlugin.loaded).toBe(false);
		expect((await pluginState(HIDER)).installedVersion).toBe("1.7.0");
	});

	it("switches to a new pinned version and keeps it enabled", async () => {
		await writeConfigJson("community-plugins-list.json", [
			{ id: HIDER, version: "1.7.1" },
			URL_INTO_SELECTION,
		]);

		await runPluginMethod("runImportPipeline");

		const hider = await pluginState(HIDER);
		expect(hider.installedVersion).toBe("1.7.1");
		expect(hider.enabled).toBe(true);
		expect(hider.loaded).toBe(true);
	});

	it("applies settings to a running plugin and restarts it", async () => {
		await writeConfigJson("community-plugins-settings.json", {
			[HIDER]: { hideTabs: true },
		});

		await runPluginMethod("applySettingsToInstalledPlugins");

		const data = await readConfigJson<Record<string, unknown>>(
			`plugins/${HIDER}/data.json`,
		);
		// Merge is on by default: earlier keys stay.
		expect(data).toMatchObject({ hideStatus: true, hideTabs: true });

		const hider = await pluginState(HIDER);
		expect(hider.loaded).toBe(true);
		expect(hider.settings?.hideTabs).toBe(true);
	});

	it("waits for the Settings window to close before restarting plugins", async () => {
		await writeConfigJson("community-plugins-settings.json", {
			[HIDER]: { hideStatus: false },
		});
		await browser.executeObsidian(({ app }) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(app as any).setting.open();
		});

		await runPluginMethod("applySettingsToInstalledPlugins");

		const data = await readConfigJson<Record<string, unknown>>(
			`plugins/${HIDER}/data.json`,
		);
		expect(data).toMatchObject({ hideStatus: false });
		// Still running with the settings it had before.
		expect((await pluginState(HIDER)).settings?.hideStatus).toBe(true);

		await browser.executeObsidian(({ app }) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(app as any).setting.close();
		});
		await browser.waitUntil(
			async () => (await pluginState(HIDER)).settings?.hideStatus === false,
			{ timeoutMsg: "plugin was not restarted after Settings closed" },
		);
		expect((await pluginState(HIDER)).loaded).toBe(true);
	});

	it("exports the installed plugins and their settings", async () => {
		await runPluginMethod("exportPluginSetup");

		const list = await readConfigJson<Array<string | { id: string }>>(
			"community-plugins-list.json",
		);
		const ids = (list ?? []).map((entry) =>
			typeof entry === "string" ? entry : entry.id,
		);
		expect(ids).toEqual(
			expect.arrayContaining([HIDER, URL_INTO_SELECTION]),
		);
		expect(ids).not.toContain(PLUGIN_ID);
		expect(list).toContainEqual(
			expect.objectContaining({ id: HIDER, version: "1.7.1" }),
		);

		const settings = await readConfigJson<Record<string, unknown>>(
			"community-plugins-settings.json",
		);
		expect(settings?.[HIDER]).toMatchObject({
			hideStatus: false,
			hideTabs: true,
		});
	});
});
