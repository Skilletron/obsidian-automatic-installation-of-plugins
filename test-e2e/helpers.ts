import { browser } from "@wdio/globals";

export const PLUGIN_ID = "automatic-installation-of-plugins";
export const HIDER = "obsidian-hider";
export const URL_INTO_SELECTION = "url-into-selection";

export async function writeConfigJson(
	name: string,
	data: unknown,
): Promise<void> {
	const text = JSON.stringify(data, null, 2);
	await browser.executeObsidian(
		async ({ app }, name, text) => {
			const path = `${app.vault.configDir}/${name}`;
			await app.vault.adapter.write(path, text);
			// On slow Android emulators a read right after the write can
			// still see the old content; wait until the file reads back.
			for (let i = 0; i < 50; i++) {
				if ((await app.vault.adapter.read(path)) === text) {
					return;
				}
				await new Promise((resolve) => window.setTimeout(resolve, 100));
			}
		},
		name,
		text,
	);
}

// A plugin may be saving the file at the moment we read it (seen on slow
// Android emulators), so retry briefly while it is not valid JSON yet.
export async function readConfigJson<T>(name: string): Promise<T | null> {
	for (let attempt = 1; ; attempt++) {
		const text = await browser.executeObsidian(async ({ app }, name) => {
			const path = `${app.vault.configDir}/${name}`;
			return (await app.vault.adapter.exists(path))
				? await app.vault.adapter.read(path)
				: null;
		}, name);
		if (text === null) {
			return null;
		}
		try {
			return JSON.parse(text) as T;
		} catch (err) {
			if (attempt >= 20) {
				throw err;
			}
			await browser.pause(250);
		}
	}
}

// Calls a plugin method and waits for it, unlike executeObsidianCommand,
// which does not wait for async command callbacks.
export async function runPluginMethod(
	method:
		| "runImportPipeline"
		| "applySettingsToInstalledPlugins"
		| "exportPluginSetup"
		| "undoLastChange"
		| "previewPluginSetup",
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

export interface PluginState {
	installedVersion: string | null;
	enabled: boolean;
	loaded: boolean;
	settings: Record<string, unknown> | null;
}

export async function pluginState(id: string): Promise<PluginState> {
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

export async function updateOwnSettings(
	patch: Record<string, unknown>,
): Promise<void> {
	await browser.executeObsidian(
		async ({ app }, id, patch) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const plugin = (app as any).plugins.plugins[id];
			Object.assign(plugin.settings, patch);
			await plugin.saveSettings();
		},
		PLUGIN_ID,
		patch,
	);
}

export async function isMobile(): Promise<boolean> {
	return browser.executeObsidian(({ obsidian }) => obsidian.Platform.isMobile);
}

// Opens a fresh copy of the empty test vault. Obsidian follows the system
// language unless one is picked, and the plugin follows Obsidian; the tests
// check English texts, so pin English.
export async function openEmptyVault(language = "en"): Promise<void> {
	await browser.reloadObsidian({ vault: "test-e2e/vaults/empty" });
	const current = await browser.executeObsidian(() =>
		window.localStorage.getItem("language"),
	);
	if (current !== language) {
		await browser.executeObsidian(
			(_obsidian, language) => window.localStorage.setItem("language", language),
			language,
		);
		await browser.reloadObsidian();
	}
}
