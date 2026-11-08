import { App } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { NetworkManager } from "../utils/NetworkManager";
import { logger } from "../utils/Logger";
import {
	isSafePathSegment,
	isSafePluginId,
	normalizeVersion,
} from "../utils/parsePluginList";
import { redactSecrets, restoreSecrets } from "../utils/secrets";
import { COMMUNITY_THEMES_URL } from "../types";
import { SettingsBackup } from "./SettingsBackup";
import { t } from "../i18n";

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
	// Obsidian's own settings (app.json and appearance.json). Import sets the
	// listed ones; the rest stay as they are.
	appSettings?: Record<string, unknown>;
	// Settings of core plugins by id, merged over what each one has.
	coreSettings?: Record<string, Record<string, unknown>>;
	// Bookmarks as in bookmarks.json. Import adds the missing ones.
	bookmarks?: BookmarkItem[];
}

export type BookmarkItem = Record<string, unknown> & { type: string };

// Handled through the theme and snippets above.
const MANAGED_APP_SETTINGS = new Set(["cssTheme", "enabledCssSnippets"]);

// Assigning these would change an object's prototype instead of a setting.
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

// Core plugins whose settings travel. Left out on purpose: sync and publish
// (tied to an account), workspaces (layouts of one vault) and bookmarks (see
// BookmarkItem).
export const CORE_SETTINGS_IDS = [
	"audio-recorder",
	"backlink",
	"bases",
	"canvas",
	"command-palette",
	"daily-notes",
	"editor-status",
	"file-explorer",
	"file-recovery",
	"footnotes",
	"global-search",
	"graph",
	"note-composer",
	"outgoing-link",
	"outline",
	"page-preview",
	"properties",
	"random-note",
	"slash-command",
	"slides",
	"switcher",
	"tag-pane",
	"templates",
	"webviewer",
	"word-count",
	"zk-prefixer",
];

// The graph saves its zoom and whether its panel is open here too. Exporting
// them would make every import look like a change.
const VOLATILE_CORE_SETTINGS: Record<string, string[]> = {
	graph: ["scale", "close"],
};

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

function cleanAppSettings(raw: unknown): Record<string, unknown> | undefined {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return undefined;
	}
	return Object.fromEntries(
		Object.entries(raw).filter(
			([key]) => !MANAGED_APP_SETTINGS.has(key) && !UNSAFE_KEYS.has(key),
		),
	);
}

function parseCoreSettings(
	raw: unknown,
): Record<string, Record<string, unknown>> | undefined {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return undefined;
	}
	const settings: Record<string, Record<string, unknown>> = {};
	for (const [id, value] of Object.entries(raw)) {
		if (
			!CORE_SETTINGS_IDS.includes(id) ||
			!value ||
			typeof value !== "object" ||
			Array.isArray(value)
		) {
			logger.warn(`Ignoring settings for core plugin "${id}".`);
			continue;
		}
		settings[id] = Object.fromEntries(
			Object.entries(value as Record<string, unknown>).filter(
				([key]) => !UNSAFE_KEYS.has(key),
			),
		);
	}
	return settings;
}

function isBookmark(item: unknown): item is BookmarkItem {
	return (
		!!item &&
		typeof item === "object" &&
		typeof (item as { type?: unknown }).type === "string"
	);
}

function parseBookmarks(raw: unknown): BookmarkItem[] | undefined {
	return Array.isArray(raw) ? raw.filter(isBookmark) : undefined;
}

// What makes two bookmarks the same one. Their dates don't count.
function bookmarkKey(item: BookmarkItem): string {
	return JSON.stringify(
		item.type === "group"
			? [item.type, item.title]
			: [item.type, item.path, item.subpath, item.query, item.url],
	);
}

// Adds the bookmarks that are missing, also inside groups of the same title.
// Nothing is removed.
export function mergeBookmarks(
	current: BookmarkItem[],
	wanted: BookmarkItem[],
): { items: BookmarkItem[]; added: number } {
	const items = [...current];
	let added = 0;
	for (const item of wanted) {
		const index = items.findIndex((c) => bookmarkKey(c) === bookmarkKey(item));
		if (index === -1) {
			items.push(item);
			added += item.type === "group" ? Math.max(countBookmarks(item), 1) : 1;
		} else if (item.type === "group") {
			const merged = mergeBookmarks(
				parseBookmarks(items[index].items) ?? [],
				parseBookmarks(item.items) ?? [],
			);
			items[index] = { ...items[index], items: merged.items };
			added += merged.added;
		}
	}
	return { items, added };
}

function countBookmarks(group: BookmarkItem): number {
	return (parseBookmarks(group.items) ?? []).reduce(
		(sum, item) => sum + (item.type === "group" ? countBookmarks(item) : 1),
		0,
	);
}

// Replaces secret-looking values in the settings, like Export does for
// community plugins.
export function redactVaultSetup(
	setup: VaultSetup,
	extraKeys: string[] = [],
): { setup: VaultSetup; redacted: number } {
	const result: VaultSetup = { ...setup };
	let redacted = 0;
	if (setup.appSettings) {
		const clean = redactSecrets(setup.appSettings, extraKeys);
		result.appSettings = clean.value as Record<string, unknown>;
		redacted += clean.redacted;
	}
	if (setup.coreSettings) {
		const clean = redactSecrets(setup.coreSettings, extraKeys);
		result.coreSettings = clean.value as Record<string, Record<string, unknown>>;
		redacted += clean.redacted;
	}
	return { setup: result, redacted };
}

// app.vault's settings, also not public API.
interface VaultConfig {
	config?: Record<string, unknown>;
	setConfig?: (key: string, value: unknown) => void;
	saveConfig?: () => Promise<void>;
}

// Applies appearance settings to the open window.
interface AppearanceUpdates {
	updateAccentColor?: () => void;
	updateTheme?: () => void;
	updateFontFamily?: () => void;
	updateFontSize?: () => void;
	updateViewHeaderDisplay?: () => void;
}

// app.hotkeyManager and app.internalPlugins, also not public API.
interface HotkeyManager {
	setHotkeys?: (commandId: string, keys: Hotkey[]) => void;
	save?: () => Promise<void>;
}

interface CorePlugin {
	enabled?: boolean;
	enable?: (byUser?: boolean) => unknown;
	disable?: (byUser?: boolean) => unknown;
	instance?: {
		options?: Record<string, unknown>;
		items?: unknown[];
		onExternalSettingsChange?: () => unknown;
		onItemsChanged?: (save: boolean) => void;
	};
}

interface InternalPlugins {
	plugins?: Record<string, CorePlugin>;
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
	const appSettings = cleanAppSettings(obj.appSettings);
	if (appSettings) {
		setup.appSettings = appSettings;
	}
	const coreSettings = parseCoreSettings(obj.coreSettings);
	if (coreSettings) {
		setup.coreSettings = coreSettings;
	}
	const bookmarks = parseBookmarks(obj.bookmarks);
	if (bookmarks) {
		setup.bookmarks = bookmarks;
	}
	return setup;
}

// The active theme and enabled snippets as Obsidian has them in memory.
// appearance.json on disk is saved with a delay and can lag behind.
export interface LiveVaultState {
	theme: string;
	enabledSnippets: string[];
	corePlugins?: Record<string, boolean>;
	appSettings?: Record<string, unknown>;
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
	const config = (app.vault as unknown as VaultConfig).config;
	if (config) {
		state.appSettings = config;
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

	const appSettings = cleanAppSettings(
		live?.appSettings ?? {
			...config,
			...(await readJsonObject(fileManager, fileManager.configPath("app.json"))),
		},
	);
	if (appSettings && Object.keys(appSettings).length > 0) {
		setup.appSettings = appSettings;
	}

	const coreSettings: Record<string, Record<string, unknown>> = {};
	for (const id of CORE_SETTINGS_IDS) {
		const settings = await readJsonObject(
			fileManager,
			fileManager.configPath(`${id}.json`),
		);
		for (const key of VOLATILE_CORE_SETTINGS[id] ?? []) {
			delete settings[key];
		}
		if (Object.keys(settings).length > 0) {
			coreSettings[id] = settings;
		}
	}
	if (Object.keys(coreSettings).length > 0) {
		setup.coreSettings = coreSettings;
	}

	const bookmarks = parseBookmarks(
		(await readJsonObject(fileManager, fileManager.configPath("bookmarks.json")))
			.items,
	);
	if (bookmarks && bookmarks.length > 0) {
		setup.bookmarks = bookmarks;
	}
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
		const label = name || t("vaultSetup.defaultThemeLabel");
		const currentTheme = current.theme ?? { name: "" };
		const sameVersion = !version || currentTheme.version === version;
		if (currentTheme.name === name && sameVersion) {
			parts.push(t("vaultSetup.describeThemeSame", { label }));
		} else {
			parts.push(
				t("vaultSetup.describeThemeSwitch", {
					label: version ? `${label} ${version}` : label,
				}),
			);
		}
	}
	const names = Object.keys(wanted.snippets);
	if (names.length > 0) {
		const added = names.filter((n) => !(n in current.snippets)).length;
		const changed = names.filter(
			(n) => n in current.snippets && current.snippets[n].css !== wanted.snippets[n].css,
		).length;
		parts.push(
			t("vaultSetup.describeSnippets", {
				total: names.length,
				added,
				changed,
				unchanged: names.length - added - changed,
			}),
		);
	}
	if (wanted.hotkeys) {
		const ids = Object.keys(wanted.hotkeys);
		const changed = changedHotkeys(wanted.hotkeys, current.hotkeys ?? {}).length;
		if (ids.length > 0) {
			parts.push(
				t("vaultSetup.describeHotkeys", { total: ids.length, changed }),
			);
		}
	}
	if (wanted.corePlugins) {
		const { on, off } = corePluginChanges(
			wanted.corePlugins,
			current.corePlugins ?? {},
		);
		if (on.length > 0 || off.length > 0) {
			parts.push(
				t("vaultSetup.describeCore", { on: on.length, off: off.length }),
			);
		} else if (Object.keys(wanted.corePlugins).length > 0) {
			parts.push(t("vaultSetup.describeCoreSame"));
		}
	}
	if (wanted.appSettings) {
		const total = Object.keys(wanted.appSettings).length;
		if (total > 0) {
			parts.push(
				t("vaultSetup.describeApp", {
					total,
					changed: changedAppSettings(wanted.appSettings, current.appSettings ?? {})
						.length,
				}),
			);
		}
	}
	if (wanted.coreSettings) {
		const ids = Object.keys(wanted.coreSettings);
		if (ids.length > 0) {
			parts.push(
				t("vaultSetup.describeCoreSettings", {
					total: ids.length,
					changed: ids.filter(
						(id) =>
							mergedCoreSettings(
								wanted.coreSettings?.[id] ?? {},
								current.coreSettings?.[id] ?? {},
							).changed,
					).length,
				}),
			);
		}
	}
	if (wanted.bookmarks && wanted.bookmarks.length > 0) {
		parts.push(
			t("vaultSetup.describeBookmarks", {
				total: wanted.bookmarks.length,
				added: mergeBookmarks(current.bookmarks ?? [], wanted.bookmarks).added,
			}),
		);
	}
	return parts.join(" · ");
}

// The settings to set, without ones that already match. A secret left out on
// export keeps the value it has here, or is skipped if there is none.
function changedAppSettings(
	wanted: Record<string, unknown>,
	current: Record<string, unknown>,
): [string, unknown][] {
	const changed: [string, unknown][] = [];
	for (const [key, value] of Object.entries(wanted)) {
		const restored = restoreSecrets(value, current[key]);
		if (
			restored !== undefined &&
			JSON.stringify(restored) !== JSON.stringify(current[key])
		) {
			changed.push([key, restored]);
		}
	}
	return changed;
}

function mergedCoreSettings(
	wanted: Record<string, unknown>,
	current: Record<string, unknown>,
): { merged: Record<string, unknown>; changed: boolean } {
	const merged = {
		...current,
		...(restoreSecrets(wanted, current) as Record<string, unknown>),
	};
	return { merged, changed: JSON.stringify(merged) !== JSON.stringify(current) };
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
	appSettingsChanged: number;
	coreSettingsChanged: number;
	bookmarksAdded: number;
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
			appSettingsChanged: 0,
			coreSettingsChanged: 0,
			bookmarksAdded: 0,
			problems: [],
		};
		await this.applySnippets(setup.snippets, result);
		if (setup.theme) {
			await this.applyTheme(setup.theme, result);
		}
		if (setup.hotkeys) {
			await this.applyHotkeys(setup.hotkeys, result);
		}
		if (setup.appSettings) {
			await this.applyAppSettings(setup.appSettings, result);
		}
		// Before turning core plugins on, so they start with these settings.
		if (setup.coreSettings) {
			await this.applyCoreSettings(setup.coreSettings, result);
		}
		if (setup.bookmarks) {
			await this.applyBookmarks(setup.bookmarks, result);
		}
		if (setup.corePlugins) {
			await this.applyCorePlugins(setup.corePlugins, result);
		}
		return result;
	}

	private get vaultConfig(): VaultConfig {
		return this.app.vault as unknown as VaultConfig;
	}

	private get corePlugins(): Record<string, CorePlugin> | undefined {
		return (this.app as App & { internalPlugins?: InternalPlugins }).internalPlugins
			?.plugins;
	}

	// Obsidian keeps these in memory and writes them back later, so a change
	// made to the files alone would be lost.
	private async applyAppSettings(
		wanted: Record<string, unknown>,
		result: VaultSetupResult,
	): Promise<void> {
		const vault = this.vaultConfig;
		if (!vault.config || !vault.setConfig) {
			if (Object.keys(wanted).length > 0) {
				result.problems.push(t("vaultSetup.noConfigManager"));
			}
			return;
		}
		const changed = changedAppSettings(wanted, vault.config);
		if (changed.length === 0) {
			return;
		}
		// Save first, so the backup holds the settings as they are now.
		await vault.saveConfig?.();
		await this.backup?.capture(this.fileManager.configPath("app.json"));
		await this.backup?.capture(this.fileManager.configPath("appearance.json"));
		for (const [key, value] of changed) {
			vault.setConfig(key, value);
		}
		await vault.saveConfig?.();
		this.refreshAppearance();
		result.appSettingsChanged = changed.length;
	}

	private refreshAppearance(): void {
		const app = this.app as App & AppearanceUpdates;
		try {
			app.updateAccentColor?.();
			app.updateTheme?.();
			app.updateFontFamily?.();
			app.updateFontSize?.();
			app.updateViewHeaderDisplay?.();
		} catch (err: unknown) {
			logger.warn("Could not refresh the appearance:", err);
		}
	}

	private async applyCoreSettings(
		wanted: Record<string, Record<string, unknown>>,
		result: VaultSetupResult,
	): Promise<void> {
		const plugins = this.corePlugins;
		if (!plugins) {
			if (Object.keys(wanted).length > 0) {
				result.problems.push(t("vaultSetup.noCoreManager"));
			}
			return;
		}
		for (const [id, settings] of Object.entries(wanted)) {
			// This Obsidian version or device doesn't have it.
			if (!plugins[id]) {
				continue;
			}
			const path = this.fileManager.configPath(`${id}.json`);
			const { merged, changed } = mergedCoreSettings(
				settings,
				await readJsonObject(this.fileManager, path),
			);
			if (!changed) {
				continue;
			}
			await this.backup?.capture(path);
			if (await this.fileManager.writeFile(path, JSON.stringify(merged, null, 2))) {
				await this.reloadCorePlugin(plugins[id], merged);
				result.coreSettingsChanged++;
			} else {
				result.problems.push(t("vaultSetup.coreSettingsFailed", { id }));
			}
		}
	}

	private async applyBookmarks(
		wanted: BookmarkItem[],
		result: VaultSetupResult,
	): Promise<void> {
		const plugin = this.corePlugins?.bookmarks;
		if (!plugin) {
			return;
		}
		const path = this.fileManager.configPath("bookmarks.json");
		const current = await readJsonObject(this.fileManager, path);
		const { items, added } = mergeBookmarks(
			parseBookmarks(current.items) ?? [],
			wanted,
		);
		if (added === 0) {
			return;
		}
		await this.backup?.capture(path);
		if (
			await this.fileManager.writeFile(
				path,
				JSON.stringify({ ...current, items }, null, 2),
			)
		) {
			await this.reloadCorePlugin(plugin);
			result.bookmarksAdded = added;
		} else {
			result.problems.push(t("vaultSetup.bookmarksFailed"));
		}
	}

	// A running core plugin holds its settings in memory. This is what
	// Obsidian itself calls when the plugin's file changes from outside.
	private async reloadCorePlugin(
		plugin: CorePlugin,
		settings?: Record<string, unknown>,
	): Promise<void> {
		const { instance } = plugin;
		if (!plugin.enabled || !instance) {
			return;
		}
		try {
			if (instance.onExternalSettingsChange) {
				await instance.onExternalSettingsChange();
			} else if (settings && instance.options) {
				Object.assign(instance.options, settings);
			}
		} catch (err: unknown) {
			logger.warn("Could not reload a core plugin's settings:", err);
		}
	}

	// After Undo put these files back: makes the open Obsidian use them.
	async reloadRestored(paths: string[]): Promise<void> {
		const configPath = (file: string) => this.fileManager.configPath(file);
		if (
			paths.includes(configPath("app.json")) ||
			paths.includes(configPath("appearance.json"))
		) {
			await this.reloadAppSettings();
		}
		const plugins = this.corePlugins;
		for (const id of [...CORE_SETTINGS_IDS, "bookmarks"]) {
			const plugin = plugins?.[id];
			if (plugin && paths.includes(configPath(`${id}.json`))) {
				// Older Obsidian can't reread the file, so its values get copied in.
				// A key the file doesn't have stays until Obsidian is reopened: the
				// plugin's defaults live only in memory and must not be wiped.
				await this.reloadCorePlugin(
					plugin,
					await readJsonObject(this.fileManager, configPath(`${id}.json`)),
				);
				// With no file left, the bookmarks plugin keeps what it has.
				if (
					id === "bookmarks" &&
					plugin.enabled &&
					plugin.instance &&
					!(await this.fileManager.exists(configPath("bookmarks.json")))
				) {
					plugin.instance.items = [];
					plugin.instance.onItemsChanged?.(false);
				}
			}
		}
	}

	// The theme and snippets stay as they are in memory: Undo doesn't switch
	// them back.
	private async reloadAppSettings(): Promise<void> {
		const vault = this.vaultConfig;
		if (!vault.config || !vault.setConfig) {
			return;
		}
		const saved =
			cleanAppSettings({
				...(await readJsonObject(
					this.fileManager,
					this.fileManager.configPath("appearance.json"),
				)),
				...(await readJsonObject(
					this.fileManager,
					this.fileManager.configPath("app.json"),
				)),
			}) ?? {};
		const live = cleanAppSettings(vault.config) ?? {};
		for (const [key, value] of Object.entries(saved)) {
			if (JSON.stringify(value) !== JSON.stringify(live[key])) {
				vault.setConfig(key, value);
			}
		}
		for (const key of Object.keys(live)) {
			if (!(key in saved)) {
				vault.setConfig(key, undefined);
			}
		}
		await vault.saveConfig?.();
		this.refreshAppearance();
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
			result.problems.push(t("vaultSetup.noHotkeyManager"));
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
			result.problems.push(t("vaultSetup.noCoreManager"));
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
				result.problems.push(t("vaultSetup.snippetFailed", { name }));
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
			result.problems.push(t("vaultSetup.noThemeManager"));
			return;
		}
		if (!theme.name) {
			if (css.theme) {
				css.setTheme("");
				result.theme = t("vaultSetup.themeDefault");
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
				result.problems.push(t("vaultSetup.themeFailed", { name: theme.name }));
				return;
			}
			result.theme = t("vaultSetup.themeInstalled", { name: theme.name, version });
		}
		if (css.theme !== theme.name) {
			css.setTheme(theme.name);
			result.theme ??= t("vaultSetup.themeSwitched", { name: theme.name });
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
