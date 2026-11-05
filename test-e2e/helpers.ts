import { browser } from "@wdio/globals";

export const PLUGIN_ID = "automatic-installation-of-plugins";
export const HIDER = "obsidian-hider";
export const URL_INTO_SELECTION = "url-into-selection";

export async function writeConfigJson(
	name: string,
	data: unknown,
): Promise<void> {
	const path = await browser.executeObsidian(
		({ app }, name) => `${app.vault.configDir}/${name}`,
		name,
	);
	await writeVaultFile(path, JSON.stringify(data, null, 2));
}

export async function writeVaultFile(path: string, text: string): Promise<void> {
	await browser.executeObsidian(
		async ({ app }, path, text) => {
			const dir = path.split("/").slice(0, -1).join("/");
			if (dir && !(await app.vault.adapter.exists(dir))) {
				await app.vault.adapter.mkdir(dir);
			}
			await app.vault.adapter.write(path, text);
			// On slow Android emulators a read right after the write can
			// still see the old content, and Obsidian 1.5.8 can lose the
			// write to a new file altogether, leaving it empty.
			for (let i = 0; i < 50; i++) {
				const current = await app.vault.adapter.read(path);
				if (current === text) {
					return;
				}
				if (current === "") {
					await app.vault.adapter.write(path, text);
				}
				await new Promise((resolve) => window.setTimeout(resolve, 100));
			}
		},
		path,
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

// A new import is turned away while another one runs.
export async function waitUntilPluginIdle(): Promise<void> {
	await browser.waitUntil(
		() =>
			browser.executeObsidian(
				({ app }, id) =>
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					!(app as any).plugins.plugins[id].busy,
				PLUGIN_ID,
			),
		{ timeout: 60 * 1000, timeoutMsg: "the plugin stayed busy" },
	);
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

// Obsidian writes manifest.json itself while installing, and on Android 1.5.8
// it can stay empty until the plugin notices and installs again. That counts
// as not installed yet, so that tests waiting for an install keep waiting
// instead of crashing.
function parseInstalledVersion(id: string, manifest: string | null): string | null {
	if (manifest === null) {
		return null;
	}
	try {
		return (JSON.parse(manifest) as { version: string }).version;
	} catch {
		console.warn(`${id}: manifest.json is not readable yet (${manifest.length} chars)`);
		return null;
	}
}

export async function pluginState(id: string): Promise<PluginState> {
	const { manifest, ...state } = await browser.executeObsidian(async ({ app }, id) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const plugins = (app as any).plugins;
		const dir = `${app.vault.configDir}/plugins/${id}`;
		const manifestPath = `${dir}/manifest.json`;
		const manifest = (await app.vault.adapter.exists(manifestPath))
			? await app.vault.adapter.read(manifestPath)
			: null;
		const loaded = plugins.plugins[id];
		return {
			manifest,
			enabled: plugins.enabledPlugins.has(id),
			loaded: Boolean(loaded),
			settings: loaded?.settings
				? JSON.parse(JSON.stringify(loaded.settings))
				: null,
		};
	}, id);
	return { ...state, installedVersion: parseInstalledVersion(id, manifest) };
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
