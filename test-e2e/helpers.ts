import { browser } from "@wdio/globals";

export const PLUGIN_ID = "automatic-installation-of-plugins";
export const HIDER = "obsidian-hider";
export const URL_INTO_SELECTION = "url-into-selection";

export async function writeConfigJson(
	name: string,
	data: unknown,
): Promise<void> {
	await browser.executeObsidian(
		async ({ app }, name, text) => {
			await app.vault.adapter.write(`${app.vault.configDir}/${name}`, text);
		},
		name,
		JSON.stringify(data, null, 2),
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
		| "undoLastChange",
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
