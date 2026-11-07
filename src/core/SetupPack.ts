import { FileManager } from "../utils/FileManager";
import { logger } from "../utils/Logger";
import { isSafePluginId, parsePluginList } from "../utils/parsePluginList";
import {
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
	PluginListEntry,
	VAULT_SETUP_FILE,
} from "../types";
import { SettingsBackup } from "./SettingsBackup";
import { mergeSettingsObjects } from "./SettingsManager";
import { VaultSetup, parseVaultSetup } from "./VaultSetup";

export const PACK_FORMAT = "community-install-manager/setup-pack";
export const PACK_FILE = "setup-pack.json";

// A whole setup in one file, meant to be shared: plugins, their settings,
// and optionally the theme, snippets, hotkeys and core plugins.
export interface SetupPack {
	format: typeof PACK_FORMAT;
	version: 1;
	name?: string;
	description?: string;
	plugins: unknown[];
	settings: Record<string, unknown>;
	vaultSetup?: VaultSetup;
}

// The parts of a pack after validation.
export interface ParsedPack {
	name: string;
	description: string;
	plugins: PluginListEntry[];
	// Raw list items, kept as written (devices, enabled, notes).
	pluginItems: unknown[];
	settings: Record<string, Record<string, unknown>>;
	vaultSetup?: VaultSetup;
}

export function parseSetupPack(raw: unknown): ParsedPack | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return null;
	}
	const obj = raw as Record<string, unknown>;
	if (obj.format !== PACK_FORMAT || !Array.isArray(obj.plugins)) {
		return null;
	}
	const plugins = parsePluginList(obj.plugins) ?? [];
	const ids = new Set(plugins.map((p) => p.id));
	const pluginItems = obj.plugins.filter((item) => {
		const id =
			typeof item === "string"
				? item.trim()
				: item && typeof item === "object"
					? (item as { id?: unknown }).id
					: null;
		return typeof id === "string" && ids.has(id.trim());
	});

	const settings: Record<string, Record<string, unknown>> = {};
	if (obj.settings && typeof obj.settings === "object" && !Array.isArray(obj.settings)) {
		for (const [id, value] of Object.entries(obj.settings)) {
			if (
				isSafePluginId(id) &&
				value &&
				typeof value === "object" &&
				!Array.isArray(value)
			) {
				settings[id] = value as Record<string, unknown>;
			} else {
				logger.warn(`Ignoring settings for "${id}" in the setup pack.`);
			}
		}
	}

	const pack: ParsedPack = {
		name: typeof obj.name === "string" ? obj.name.trim() : "",
		description:
			typeof obj.description === "string" ? obj.description.trim() : "",
		plugins,
		pluginItems,
		settings,
	};
	const vaultSetup = obj.vaultSetup ? parseVaultSetup(obj.vaultSetup) : null;
	if (vaultSetup) {
		pack.vaultSetup = vaultSetup;
	}
	return pack;
}

export function buildSetupPack(
	listEntries: unknown[],
	settings: Record<string, unknown>,
	vaultSetup: VaultSetup | null,
	name: string,
): SetupPack {
	const pack: SetupPack = {
		format: PACK_FORMAT,
		version: 1,
		name,
		description: "",
		plugins: listEntries,
		settings,
	};
	if (vaultSetup) {
		pack.vaultSetup = vaultSetup;
	}
	return pack;
}

// A command id starts with its plugin's id, so a hotkey for a plugin left
// out of a pack would still give that plugin away.
export function withoutHotkeysOf(
	setup: VaultSetup,
	pluginIds: readonly string[],
): VaultSetup {
	if (!setup.hotkeys) {
		return setup;
	}
	const hotkeys = Object.fromEntries(
		Object.entries(setup.hotkeys).filter(
			([command]) => !pluginIds.some((id) => command.startsWith(`${id}:`)),
		),
	);
	return { ...setup, hotkeys };
}

// Only https links are fetched, and GitHub gist and blob pages are turned
// into their raw file URLs so people can paste the page they see.
export function packUrl(input: string): string | null {
	let url: URL;
	try {
		url = new URL(input.trim());
	} catch {
		return null;
	}
	if (url.protocol !== "https:") {
		return null;
	}
	if (url.hostname === "github.com") {
		const blob = url.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
		if (blob) {
			return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}`;
		}
	}
	if (url.hostname === "gist.github.com") {
		const gist = url.pathname.match(/^\/([^/]+)\/([0-9a-f]+)\/?$/);
		if (gist) {
			return `https://gist.githubusercontent.com/${gist[1]}/${gist[2]}/raw`;
		}
	}
	return url.toString();
}

async function readJson(fileManager: FileManager, path: string): Promise<unknown> {
	if (!(await fileManager.exists(path))) {
		return undefined;
	}
	try {
		return JSON.parse((await fileManager.readFile(path)) ?? "") as unknown;
	} catch {
		return undefined;
	}
}

function itemId(item: unknown): string | null {
	if (typeof item === "string") {
		return item.trim() || null;
	}
	if (item && typeof item === "object" && !Array.isArray(item)) {
		const id = (item as { id?: unknown }).id;
		return typeof id === "string" ? id.trim() : null;
	}
	return null;
}

// Adds a pack to the vault's own setup files, so the next Import installs
// it. The pack wins where both have something: its list entry replaces the
// vault's one for the same plugin, its settings are merged over the vault's,
// and its theme replaces the vault's theme. Everything else stays.
export async function mergePackIntoSetup(
	fileManager: FileManager,
	pack: ParsedPack,
	backup?: SettingsBackup,
): Promise<void> {
	const listPath = fileManager.configPath(PLUGINS_LIST_FILE);
	const settingsPath = fileManager.configPath(PLUGINS_SETTINGS_FILE);
	const setupPath = fileManager.configPath(VAULT_SETUP_FILE);

	const currentList = await readJson(fileManager, listPath);
	const packIds = new Set(pack.plugins.map((p) => p.id));
	const list = [
		...(Array.isArray(currentList) ? (currentList as unknown[]) : []).filter((item) => {
			const id = itemId(item);
			return !id || !packIds.has(id);
		}),
		...pack.pluginItems,
	];

	const currentSettings = await readJson(fileManager, settingsPath);
	const settings: Record<string, unknown> =
		currentSettings && typeof currentSettings === "object" && !Array.isArray(currentSettings)
			? { ...(currentSettings as Record<string, unknown>) }
			: {};
	for (const [id, value] of Object.entries(pack.settings)) {
		settings[id] = mergeSettingsObjects(settings[id], value);
	}

	await backup?.capture(listPath);
	await backup?.capture(settingsPath);
	const ok =
		(await fileManager.writeFile(listPath, `${JSON.stringify(list, null, 2)}\n`)) &&
		(await fileManager.writeFile(
			settingsPath,
			`${JSON.stringify(settings, null, 2)}\n`,
		));
	if (!ok) {
		throw new Error("could not write the setup files");
	}

	if (pack.vaultSetup) {
		const current = parseVaultSetup(await readJson(fileManager, setupPath)) ?? {
			snippets: {},
		};
		const merged: VaultSetup = {
			...current,
			snippets: { ...current.snippets, ...pack.vaultSetup.snippets },
		};
		if (pack.vaultSetup.theme) {
			merged.theme = pack.vaultSetup.theme;
		}
		if (pack.vaultSetup.hotkeys) {
			merged.hotkeys = { ...current.hotkeys, ...pack.vaultSetup.hotkeys };
		}
		if (pack.vaultSetup.corePlugins) {
			merged.corePlugins = {
				...current.corePlugins,
				...pack.vaultSetup.corePlugins,
			};
		}
		await backup?.capture(setupPath);
		if (!(await fileManager.writeFile(setupPath, `${JSON.stringify(merged, null, 2)}\n`))) {
			throw new Error("could not write the vault setup file");
		}
	}
}
