import { apiVersion, PluginManifest } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { NetworkManager } from "../utils/NetworkManager";
import { logger } from "../utils/Logger";
import {
	isSafePluginId,
	normalizeVersion,
	parsePluginList,
} from "../utils/parsePluginList";
import {
	PLUGIN_ID,
	PLUGIN_REGISTRY_URL,
	PLUGINS_LIST_FILE,
	PluginRegistryEntry,
} from "../types";
import { scanInstalledPlugins } from "./InstalledPlugins";

export interface PluginUpdate {
	pluginId: string;
	name: string;
	installed: string;
	// Newest version that runs on this Obsidian; null if none is newer
	// than what is installed.
	available: string | null;
	// Newest version overall, when it needs a newer Obsidian.
	newerNeedsApp?: { version: string; minAppVersion: string };
	// Version pinned in the plugin list, if any.
	pinned?: string;
}

// Compares dotted versions numerically: 1.10.0 > 1.9.2. A pre-release
// (1.2.0-beta) sorts before its release.
export function compareVersions(a: string, b: string): number {
	const parse = (v: string) => {
		const [main, pre] = normalizeVersion(v).split("-", 2);
		return { parts: main.split(".").map((p) => parseInt(p, 10) || 0), pre };
	};
	const x = parse(a);
	const y = parse(b);
	for (let i = 0; i < Math.max(x.parts.length, y.parts.length); i++) {
		const diff = (x.parts[i] ?? 0) - (y.parts[i] ?? 0);
		if (diff !== 0) {
			return diff;
		}
	}
	if (x.pre && !y.pre) return -1;
	if (!x.pre && y.pre) return 1;
	return (x.pre ?? "").localeCompare(y.pre ?? "");
}

// Finds newer versions of installed community plugins the same way
// Obsidian does: the repo's manifest.json, or for plugins whose newest
// release needs a newer Obsidian, the newest compatible one in
// versions.json. Uses raw.githubusercontent.com, not the rate-limited API.
export class UpdateChecker {
	constructor(
		private fileManager: FileManager,
		private networkManager: NetworkManager,
		private appVersion: () => string = () => apiVersion,
	) {}

	async check(
		onProgress?: (current: number, total: number, pluginId: string) => void,
	): Promise<PluginUpdate[]> {
		const registry = await this.networkManager.fetchJson<
			PluginRegistryEntry[]
		>(PLUGIN_REGISTRY_URL);
		if (!Array.isArray(registry)) {
			throw new Error("Plugin registry is not an array");
		}
		const repoById = new Map(
			registry.map((p) => [p.id.trim().toLowerCase(), p.repo]),
		);
		const pins = await this.readPins();

		const installed = (await scanInstalledPlugins(this.fileManager)).filter(
			(p) =>
				p.complete &&
				p.version &&
				p.pluginId !== PLUGIN_ID &&
				isSafePluginId(p.pluginId),
		);

		const results: PluginUpdate[] = [];
		for (let i = 0; i < installed.length; i++) {
			const plugin = installed[i];
			onProgress?.(i + 1, installed.length, plugin.pluginId);
			const repo = repoById.get(plugin.pluginId.toLowerCase());
			if (!repo) {
				// Not from the community registry (BRAT, manual, private).
				continue;
			}
			try {
				const update = await this.checkOne(
					plugin.pluginId,
					plugin.version as string,
					repo,
				);
				if (update) {
					update.pinned = pins.get(plugin.pluginId);
					results.push(update);
				}
			} catch (err: unknown) {
				logger.warn(`Update check failed for ${plugin.pluginId}:`, err);
			}
		}
		return results;
	}

	// Pinned versions from the plugin list, by id.
	private async readPins(): Promise<Map<string, string>> {
		const pins = new Map<string, string>();
		const path = this.fileManager.configPath(PLUGINS_LIST_FILE);
		if (!(await this.fileManager.exists(path))) {
			return pins;
		}
		const raw = await this.fileManager.readFile(path);
		try {
			for (const entry of parsePluginList(JSON.parse(raw ?? "")) ?? []) {
				if (entry.version) {
					pins.set(entry.id, entry.version);
				}
			}
		} catch {
			// An unreadable list just means no pins to report.
		}
		return pins;
	}

	// null when there is nothing to report for this plugin.
	private async checkOne(
		pluginId: string,
		installed: string,
		repo: string,
	): Promise<PluginUpdate | null> {
		const base = `https://raw.githubusercontent.com/${repo}/HEAD`;
		const manifest = await this.networkManager.tryFetchJson<PluginManifest>(
			`${base}/manifest.json`,
		);
		if (!manifest?.version) {
			return null;
		}
		const latest = normalizeVersion(manifest.version);
		if (compareVersions(latest, installed) <= 0) {
			return null;
		}

		const update: PluginUpdate = {
			pluginId,
			name: manifest.name || pluginId,
			installed,
			available: latest,
		};
		if (this.runsHere(manifest.minAppVersion)) {
			return update;
		}

		update.newerNeedsApp = {
			version: latest,
			minAppVersion: manifest.minAppVersion,
		};
		const versions = await this.networkManager.tryFetchJson<
			Record<string, string>
		>(`${base}/versions.json`);
		const compatible = Object.entries(versions ?? {})
			.filter(([, minApp]) => this.runsHere(minApp))
			.map(([version]) => normalizeVersion(version))
			.filter((version) => compareVersions(version, installed) > 0)
			.sort(compareVersions);
		update.available = compatible.pop() ?? null;
		return update;
	}

	private runsHere(minAppVersion: string | undefined): boolean {
		return (
			!minAppVersion || compareVersions(minAppVersion, this.appVersion()) <= 0
		);
	}
}

// Sets `version` on pinned entries of the plugin list text. Other entries
// and fields stay as they are. Returns null when nothing changed.
export function updatePinsInList(
	listText: string,
	versions: Map<string, string>,
): string | null {
	let list: unknown;
	try {
		list = JSON.parse(listText);
	} catch {
		return null;
	}
	if (!Array.isArray(list)) {
		return null;
	}
	let changed = false;
	for (const item of list) {
		if (item === null || typeof item !== "object" || Array.isArray(item)) {
			continue;
		}
		const entry = item as Record<string, unknown>;
		const id = typeof entry.id === "string" ? entry.id.trim() : "";
		const version = versions.get(id);
		if (typeof entry.version === "string" && version && entry.version !== version) {
			entry.version = version;
			changed = true;
		}
	}
	return changed ? `${JSON.stringify(list, null, 2)}\n` : null;
}
