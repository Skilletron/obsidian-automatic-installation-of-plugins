import { App } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { NetworkManager } from "../utils/NetworkManager";
import { logger } from "../utils/Logger";
import { isSafePathSegment, normalizeVersion } from "../utils/parsePluginList";
import { COMMUNITY_THEMES_URL } from "../types";
import { SettingsBackup } from "./SettingsBackup";

export interface SnippetSetup {
	css: string;
	enabled?: boolean;
}

// Contents of community-appearance.json.
export interface AppearanceSetup {
	// Community theme to use. name "" is Obsidian's default theme; no
	// version means the newest one. Unset: Import leaves the theme alone.
	theme?: { name: string; version?: string };
	snippets: Record<string, SnippetSetup>;
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
export function parseAppearance(raw: unknown): AppearanceSetup | null {
	if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
		return null;
	}
	const obj = raw as Record<string, unknown>;
	const setup: AppearanceSetup = { snippets: {} };

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
	return setup;
}

// The active theme and enabled snippets as Obsidian has them in memory.
// appearance.json on disk is saved with a delay and can lag behind.
export interface LiveAppearance {
	theme: string;
	enabledSnippets: string[];
}

export function liveAppearance(app: App): LiveAppearance | null {
	const css = (app as App & { customCss?: CustomCss }).customCss;
	if (typeof css?.theme !== "string" || !css.enabledSnippets) {
		return null;
	}
	return { theme: css.theme, enabledSnippets: [...css.enabledSnippets] };
}

// Reads the current theme and CSS snippets from the config folder, using
// `live` for the active theme and enabled snippets when given.
export async function readAppearance(
	fileManager: FileManager,
	live: LiveAppearance | null = null,
): Promise<AppearanceSetup> {
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

	const setup: AppearanceSetup = { theme: { name: themeName }, snippets: {} };
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
	return setup;
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
export function describeAppearanceChanges(
	wanted: AppearanceSetup,
	current: AppearanceSetup,
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
	return parts.join(" · ");
}

export interface AppearanceResult {
	// What happened to the theme, for the import summary; null if the file
	// does not mention a theme.
	theme: string | null;
	snippetsWritten: number;
	snippetsEnabled: number;
	problems: string[];
}

// Applies an AppearanceSetup through Obsidian's theme manager.
export class AppearanceApplier {
	constructor(
		private app: App,
		private fileManager: FileManager,
		private networkManager: NetworkManager,
		private backup?: SettingsBackup,
	) {}

	private get customCss(): CustomCss | undefined {
		return (this.app as App & { customCss?: CustomCss }).customCss;
	}

	async apply(setup: AppearanceSetup): Promise<AppearanceResult> {
		const result: AppearanceResult = {
			theme: null,
			snippetsWritten: 0,
			snippetsEnabled: 0,
			problems: [],
		};
		await this.applySnippets(setup.snippets, result);
		if (setup.theme) {
			await this.applyTheme(setup.theme, result);
		}
		return result;
	}

	// Writes snippet files that are new or changed. Only snippets created
	// here follow "enabled"; existing ones keep their on/off state.
	private async applySnippets(
		snippets: Record<string, SnippetSetup>,
		result: AppearanceResult,
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
		result: AppearanceResult,
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
