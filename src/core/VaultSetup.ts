import { App } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { NetworkManager } from "../utils/NetworkManager";
import { logger } from "../utils/Logger";
import {
	isSafePathSegment,
	isSafePluginId,
	normalizeVersion,
} from "../utils/parsePluginList";
import { COMMUNITY_THEMES_URL } from "../types";
import { SettingsBackup } from "./SettingsBackup";

export interface SnippetSetup {
	css: string;
	enabled?: boolean;
}

// Same shape as in Obsidian's hotkeys.json. "Mod" is Ctrl on Windows and
// Linux and Cmd on macOS.
export interface Hotkey {
	modifiers: string[];
	key: string;
}

// Contents of vault-setup.json.
export interface VaultSetup {
	// Community theme to use. name "" is Obsidian's default theme; no
	// version means the newest one. Unset: Import leaves the theme alone.
	theme?: { name: string; version?: string };
	snippets: Record<string, SnippetSetup>;
	// Custom hotkeys by command id. An empty list removes the default one.
	hotkeys?: Record<string, Hotkey[]>;
	// Core plugins by id: true on, false off.
	corePlugins?: Record<string, boolean>;
}

const MODIFIERS = new Set(["Mod", "Ctrl", "Meta", "Shift", "Alt"]);

// Command ids look like "plugin-id:command" or "app:open-settings".
function isSafeCommandId(id: string): boolean {
	return /^[\w.-]+(:[\w.-]+)*$/.test(id);
}

function parseHotkeys(raw: unknown): Record<string, Hotkey[]> | undefined {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return undefined;
	}
	const hotkeys: Record<string, Hotkey[]> = {};
	for (const [id, value] of Object.entries(raw)) {
		if (!isSafeCommandId(id) || !Array.isArray(value)) {
			logger.warn(`Ignoring hotkeys for "${id}".`);
			continue;
		}
		const keys = value.filter(
			(k): k is Hotkey =>
				!!k &&
				typeof k === "object" &&
				typeof (k as Hotkey).key === "string" &&
				(k as Hotkey).key !== "" &&
				Array.isArray((k as Hotkey).modifiers) &&
				(k as Hotkey).modifiers.every((m) => MODIFIERS.has(m)),
		);
		hotkeys[id] = keys.map((k) => ({
			modifiers: [...k.modifiers],
			key: k.key,
		}));
	}
	return hotkeys;
}

// core-plugins.json is a list of enabled ids in older Obsidian versions and
// an id -> on/off map in newer ones.
function parseCorePlugins(raw: unknown): Record<string, boolean> | undefined {
	if (Array.isArray(raw)) {
		return Object.fromEntries(
			raw
				.filter((id): id is string => typeof id === "string" && isSafePluginId(id))
				.map((id) => [id, true]),
		);
	}
	if (!raw || typeof raw !== "object") {
		return undefined;
	}
	const plugins: Record<string, boolean> = {};
	for (const [id, on] of Object.entries(raw)) {
		if (isSafePluginId(id) && typeof on === "boolean") {
			plugins[id] = on;
		}
	}
	return plugins;
}

// app.hotkeyManager and app.internalPlugins, also not public API.
interface HotkeyManager {
	setHotkeys?: (commandId: string, keys: Hotkey[]) => void;
	save?: () => Promise<void>;
}

interface InternalPlugins {
	plugins?: Record<
		string,
		{
			enabled?: boolean;
			enable?: (byUser?: boolean) => unknown;
			disable?: (byUser?: boolean) => unknown;
		}
	>;
	saveConfig?: () => Promise<void>;
}

interface ThemeRegistryEntry {
	name: string;
	repo: string;
}

// Obsidian's theme and snippet manager (app.customCss). Not part of the
// public API, so every member is optional.
interface CustomCss {
	theme?: string;
	themes?: Record<string, { version?: string }>;
	enabledSnippets?: Set<string>;
	installTheme?: (theme: ThemeRegistryEntry, version: string) => Promise<void>;
	setTheme?: (name: string) => void;
	setCssEnabledStatus?: (name: string, enabled: boolean) => void;
	readSnippets?: (load?: boolean) => Promise<void>;
	readThemes?: () => Promise<void>;
}

function isSafeSnippetName(name: string): boolean {
	return isSafePathSegment(name) && !name.startsWith(".");
}

// Validates parsed JSON; invalid snippets are dropped with a warning.
export function parseVaultSetup(raw: unknown): VaultSetup | null {
	if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
		return null;
	}
	const obj = raw as Record<string, unknown>;
	const setup: VaultSetup = { snippets: {} };

	if (typeof obj.theme === "string") {
		setup.theme = { name: obj.theme.trim() };
	} else if (obj.theme && typeof obj.theme === "object") {
		const theme = obj.theme as Record<string, unknown>;
		if (typeof theme.name === "string") {
			setup.theme = { name: theme.name.trim() };
			if (typeof theme.version === "string" && theme.version.trim()) {
				setup.theme.version = normalizeVersion(theme.version);
			}
		}
	}
	if (setup.theme && setup.theme.name && !isSafePathSegment(setup.theme.name)) {
		logger.warn(`Ignoring theme with an unsafe name: ${setup.theme.name}`);
		delete setup.theme;
	}

	const snippets = obj.snippets;
	if (snippets && typeof snippets === "object" && !Array.isArray(snippets)) {
		for (const [name, value] of Object.entries(snippets)) {
			const snippet =
				value && typeof value === "object"
					? (value as Record<string, unknown>)
					: null;
			if (!isSafeSnippetName(name) || typeof snippet?.css !== "string") {
				logger.warn(`Ignoring invalid snippet "${name}".`);
				continue;
			}
			setup.snippets[name] = { css: snippet.css };
			if (typeof snippet.enabled === "boolean") {
				setup.snippets[name].enabled = snippet.enabled;
			}
		}
	}

	const hotkeys = parseHotkeys(obj.hotkeys);
	if (hotkeys) {
		setup.hotkeys = hotkeys;
	}
	const corePlugins =
		obj.corePlugins && !Array.isArray(obj.corePlugins)
			? parseCorePlugins(obj.corePlugins)
			: undefined;
	if (corePlugins) {
		setup.corePlugins = corePlugins;
	}
	return setup;
}

// The active theme and enabled snippets as Obsidian has them in memory.
// appearance.json on disk is saved with a delay and can lag behind.
export interface LiveVaultState {
	theme: string;
	enabledSnippets: string[];
	corePlugins?: Record<string, boolean>;
}

export function liveVaultState(app: App): LiveVaultState | null {
	const css = (app as App & { customCss?: CustomCss }).customCss;
	if (typeof css?.theme !== "string" || !css.enabledSnippets) {
		return null;
	}
	const state: LiveVaultState = {
		theme: css.theme,
		enabledSnippets: [...css.enabledSnippets],
	};
	const internal = (app as App & { internalPlugins?: InternalPlugins })
		.internalPlugins?.plugins;
	if (internal) {
		state.corePlugins = Object.fromEntries(
			Object.entries(internal).map(([id, p]) => [id, p.enabled === true]),
		);
	}
	return state;
}

// Reads the current theme and CSS snippets from the config folder, using
// `live` for the active theme and enabled snippets when given.
export async function readVaultSetup(
	fileManager: FileManager,
	live: LiveVaultState | null = null,
): Promise<VaultSetup> {
	const config = await readJsonObject(
		fileManager,
		fileManager.configPath("appearance.json"),
	);
	const themeName =
		live?.theme ?? (typeof config.cssTheme === "string" ? config.cssTheme : "");
	const enabled = new Set(
		live?.enabledSnippets ??
			(Array.isArray(config.enabledCssSnippets)
				? config.enabledCssSnippets.filter(
						(name): name is string => typeof name === "string",
					)
				: []),
	);

	const setup: VaultSetup = { theme: { name: themeName }, snippets: {} };
	if (themeName && isSafePathSegment(themeName)) {
		const manifest = await readJsonObject(
			fileManager,
			fileManager.configPath("themes", themeName, "manifest.json"),
		);
		if (typeof manifest.version === "string" && manifest.version.trim()) {
			setup.theme = {
				name: themeName,
				version: normalizeVersion(manifest.version),
			};
		}
	}

	const snippetsDir = fileManager.configPath("snippets");
	for (const file of (await fileManager.listFiles(snippetsDir)).sort()) {
		if (!file.toLowerCase().endsWith(".css")) {
			continue;
		}
		const name = file.slice(0, -4);
		if (!isSafeSnippetName(name)) {
			continue;
		}
		const css = await fileManager.readFile(
			fileManager.configPath("snippets", file),
		);
		if (css !== null) {
			setup.snippets[name] = { css, enabled: enabled.has(name) };
		}
	}

	setup.hotkeys = parseHotkeys(
		await readJsonValue(fileManager, fileManager.configPath("hotkeys.json")),
	) ?? {};
	setup.corePlugins =
		live?.corePlugins ??
		parseCorePlugins(
			await readJsonValue(fileManager, fileManager.configPath("core-plugins.json")),
		) ??
		{};
	return setup;
}

async function readJsonValue(
	fileManager: FileManager,
	path: string,
): Promise<unknown> {
	if (!(await fileManager.exists(path))) {
		return undefined;
	}
	try {
		return JSON.parse((await fileManager.readFile(path)) ?? "") as unknown;
	} catch {
		return undefined;
	}
}

async function readJsonObject(
	fileManager: FileManager,
	path: string,
): Promise<Record<string, unknown>> {
	if (!(await fileManager.exists(path))) {
		return {};
	}
	try {
		const parsed: unknown = JSON.parse((await fileManager.readFile(path)) ?? "");
		return parsed && typeof parsed === "object" && !Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: {};
	} catch {
		return {};
	}
}

// One line for the import preview: what Import would do with the theme
// and snippets, compared with what is in this vault now.
export function describeVaultSetupChanges(
	wanted: VaultSetup,
	current: VaultSetup,
): string {
	const parts: string[] = [];
	if (wanted.theme) {
		const { name, version } = wanted.theme;
		const label = name || "the default theme";
		const currentTheme = current.theme ?? { name: "" };
		const sameVersion = !version || currentTheme.version === version;
		if (currentTheme.name === name && sameVersion) {
			parts.push(`Theme: already using ${label}`);
		} else {
			parts.push(`Theme: would switch to ${label}${version ? ` ${version}` : ""}`);
		}
	}
	const names = Object.keys(wanted.snippets);
	if (names.length > 0) {
		const added = names.filter((n) => !(n in current.snippets)).length;
		const changed = names.filter(
			(n) => n in current.snippets && current.snippets[n].css !== wanted.snippets[n].css,
		).length;
		parts.push(
			`Snippets: ${names.length} (${added} new, ${changed} changed, ${names.length - added - changed} unchanged)`,
		);
	}
	if (wanted.hotkeys) {
		const ids = Object.keys(wanted.hotkeys);
		const changed = changedHotkeys(wanted.hotkeys, current.hotkeys ?? {}).length;
		if (ids.length > 0) {
			parts.push(`Hotkeys: ${ids.length} commands (${changed} would change)`);
		}
	}
	if (wanted.corePlugins) {
		const { on, off } = corePluginChanges(
			wanted.corePlugins,
			current.corePlugins ?? {},
		);
		if (on.length > 0 || off.length > 0) {
			parts.push(
				`Core plugins: would turn on ${on.length}, turn off ${off.length}`,
			);
		} else if (Object.keys(wanted.corePlugins).length > 0) {
			parts.push("Core plugins: already as listed");
		}
	}
	return parts.join(" · ");
}

function changedHotkeys(
	wanted: Record<string, Hotkey[]>,
	current: Record<string, Hotkey[]>,
): string[] {
	return Object.keys(wanted).filter(
		(id) => JSON.stringify(wanted[id]) !== JSON.stringify(current[id]),
	);
}

// Core plugins whose state differs; ids this Obsidian doesn't know are left
// out when `known` is given.
function corePluginChanges(
	wanted: Record<string, boolean>,
	current: Record<string, boolean>,
	known?: Set<string>,
): { on: string[]; off: string[] } {
	const on: string[] = [];
	const off: string[] = [];
	for (const [id, enabled] of Object.entries(wanted)) {
		if (known && !known.has(id)) {
			continue;
		}
		if (enabled && current[id] !== true) {
			on.push(id);
		} else if (!enabled && current[id] === true) {
			off.push(id);
		}
	}
	return { on, off };
}

export interface VaultSetupResult {
	// What happened to the theme, for the import summary; null if the file
	// does not mention a theme.
	theme: string | null;
	snippetsWritten: number;
	snippetsEnabled: number;
	hotkeysChanged: number;
	corePluginsOn: number;
	corePluginsOff: number;
	problems: string[];
}

// Applies an VaultSetup through Obsidian's theme manager.
export class VaultSetupApplier {
	constructor(
		private app: App,
		private fileManager: FileManager,
		private networkManager: NetworkManager,
		private backup?: SettingsBackup,
	) {}

	private get customCss(): CustomCss | undefined {
		return (this.app as App & { customCss?: CustomCss }).customCss;
	}

	async apply(setup: VaultSetup): Promise<VaultSetupResult> {
		const result: VaultSetupResult = {
			theme: null,
			snippetsWritten: 0,
			snippetsEnabled: 0,
			hotkeysChanged: 0,
			corePluginsOn: 0,
			corePluginsOff: 0,
			problems: [],
		};
		await this.applySnippets(setup.snippets, result);
		if (setup.theme) {
			await this.applyTheme(setup.theme, result);
		}
		if (setup.hotkeys) {
			await this.applyHotkeys(setup.hotkeys, result);
		}
		if (setup.corePlugins) {
			await this.applyCorePlugins(setup.corePlugins, result);
		}
		return result;
	}

	// Sets hotkeys for the listed commands; other commands keep theirs.
	private async applyHotkeys(
		hotkeys: Record<string, Hotkey[]>,
		result: VaultSetupResult,
	): Promise<void> {
		const current =
			parseHotkeys(
				await readJsonValue(
					this.fileManager,
					this.fileManager.configPath("hotkeys.json"),
				),
			) ?? {};
		const changed = changedHotkeys(hotkeys, current);
		if (changed.length === 0) {
			return;
		}
		const manager = (this.app as App & { hotkeyManager?: HotkeyManager })
			.hotkeyManager;
		if (!manager?.setHotkeys || !manager.save) {
			result.problems.push("Obsidian's hotkey manager is not available.");
			return;
		}
		for (const id of changed) {
			manager.setHotkeys(id, hotkeys[id]);
		}
		await manager.save();
		result.hotkeysChanged = changed.length;
	}

	// Turns core plugins on or off as listed. Ones this Obsidian version or
	// platform doesn't have are skipped.
	private async applyCorePlugins(
		wanted: Record<string, boolean>,
		result: VaultSetupResult,
	): Promise<void> {
		const internal = (this.app as App & { internalPlugins?: InternalPlugins })
			.internalPlugins;
		const plugins = internal?.plugins;
		if (!plugins) {
			result.problems.push("Obsidian's core plugin manager is not available.");
			return;
		}
		const current = Object.fromEntries(
			Object.entries(plugins).map(([id, p]) => [id, p.enabled === true]),
		);
		const { on, off } = corePluginChanges(
			wanted,
			current,
			new Set(Object.keys(plugins)),
		);
		for (const id of on) {
			await plugins[id].enable?.(true);
			if (plugins[id].enabled) {
				result.corePluginsOn++;
			}
		}
		for (const id of off) {
			await plugins[id].disable?.(true);
			if (!plugins[id].enabled) {
				result.corePluginsOff++;
			}
		}
		if (on.length > 0 || off.length > 0) {
			await internal.saveConfig?.();
		}
	}

	// Writes snippet files that are new or changed. Only snippets created
	// here follow "enabled"; existing ones keep their on/off state.
	private async applySnippets(
		snippets: Record<string, SnippetSetup>,
		result: VaultSetupResult,
	): Promise<void> {
		const names = Object.keys(snippets);
		if (names.length === 0) {
			return;
		}
		const created: string[] = [];
		for (const name of names) {
			const path = this.fileManager.configPath("snippets", `${name}.css`);
			const exists = await this.fileManager.exists(path);
			if (exists && (await this.fileManager.readFile(path)) === snippets[name].css) {
				continue;
			}
			await this.backup?.capture(path);
			if (await this.fileManager.writeFile(path, snippets[name].css)) {
				result.snippetsWritten++;
				if (!exists) {
					created.push(name);
				}
			} else {
				result.problems.push(`Could not write snippet "${name}".`);
			}
		}

		const css = this.customCss;
		await css?.readSnippets?.(true);
		for (const name of created) {
			if (snippets[name].enabled !== false && css?.setCssEnabledStatus) {
				css.setCssEnabledStatus(name, true);
				result.snippetsEnabled++;
			}
		}
	}

	private async applyTheme(
		theme: { name: string; version?: string },
		result: VaultSetupResult,
	): Promise<void> {
		const css = this.customCss;
		if (!css?.setTheme) {
			result.problems.push("Obsidian's theme manager is not available.");
			return;
		}
		if (!theme.name) {
			if (css.theme) {
				css.setTheme("");
				result.theme = "Switched to the default theme";
			}
			return;
		}

		const installed = css.themes?.[theme.name]?.version;
		const needsInstall =
			!installed ||
			(theme.version !== undefined &&
				normalizeVersion(installed) !== theme.version);
		if (needsInstall) {
			const version = await this.installTheme(theme.name, theme.version);
			if (!version) {
				result.problems.push(`Could not install theme "${theme.name}".`);
				return;
			}
			result.theme = `Installed theme ${theme.name} ${version}`;
		}
		if (css.theme !== theme.name) {
			css.setTheme(theme.name);
			result.theme ??= `Switched to theme ${theme.name}`;
		}
	}

	// Returns the installed version, or null on failure.
	private async installTheme(
		name: string,
		pinned: string | undefined,
	): Promise<string | null> {
		const css = this.customCss;
		if (!css?.installTheme) {
			return null;
		}
		try {
			const registry = await this.networkManager.fetchJson<
				ThemeRegistryEntry[]
			>(COMMUNITY_THEMES_URL);
			const entry = Array.isArray(registry)
				? registry.find((t) => t.name === name)
				: undefined;
			if (!entry) {
				logger.warn(`Theme "${name}" is not in the community themes list.`);
				return null;
			}
			const version = pinned ?? (await this.latestVersion(entry.repo));
			if (!version) {
				return null;
			}
			await css.installTheme(entry, version);
			await css.readThemes?.();
			const manifest = await readJsonObject(
				this.fileManager,
				this.fileManager.configPath("themes", name, "manifest.json"),
			);
			// installTheme reports failures with its own notice only.
			return typeof manifest.version === "string" &&
				normalizeVersion(manifest.version) === version
				? version
				: null;
		} catch (err: unknown) {
			logger.warn(`Installing theme "${name}" failed:`, err);
			return null;
		}
	}

	private async latestVersion(repo: string): Promise<string | null> {
		const manifest = await this.networkManager.tryFetchJson<{
			version?: string;
		}>(`https://raw.githubusercontent.com/${repo}/HEAD/manifest.json`);
		return manifest?.version ? normalizeVersion(manifest.version) : null;
	}
}
