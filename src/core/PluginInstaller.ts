import { App, Notice, PluginManifest } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { NetworkManager } from "../utils/NetworkManager";
import { SettingsManager } from "./SettingsManager";
import {
	PluginRegistryEntry,
	GitHubRelease,
	PLUGIN_REGISTRY_URL,
} from "../types";
import { logger } from "../utils/Logger";

/**
 * Undocumented Obsidian plugins API used by the Community plugins browser.
 */
interface PluginsAPI {
	manifests?: Record<string, PluginManifest>;
	installPlugin?: (
		repo: string,
		version: string,
		manifest: PluginManifest
	) => Promise<void>;
}

/**
 * Installs community plugins via Obsidian's own installer API.
 * Does not download/extract ZIP or write main.js itself (avoids automated
 * "self-update" / obfuscation false positives).
 */
export class PluginInstaller {
	constructor(
		private app: App,
		private fileManager: FileManager,
		private networkManager: NetworkManager,
		private settingsManager: SettingsManager,
		private shouldLoadSettingsOnInstall: () => boolean
	) {}

	private getPluginsApi(): PluginsAPI | undefined {
		return (this.app as App & { plugins?: PluginsAPI }).plugins;
	}

	async installPluginById(pluginId: string): Promise<boolean> {
		if (!pluginId || typeof pluginId !== "string" || pluginId.trim() === "") {
			new Notice("Invalid plugin ID provided.");
			return false;
		}

		const normalizedId = pluginId.trim();
		const pluginsApi = this.getPluginsApi();

		if (
			pluginsApi?.manifests &&
			Object.prototype.hasOwnProperty.call(pluginsApi.manifests, normalizedId)
		) {
			new Notice(`Plugin "${normalizedId}" already installed.`);
			return true;
		}

		const pluginFolder = this.fileManager.pluginsPath(normalizedId);
		const manifestPath = this.fileManager.pluginsPath(
			normalizedId,
			"manifest.json"
		);
		const mainPath = this.fileManager.pluginsPath(normalizedId, "main.js");

		if (
			(await this.fileManager.exists(manifestPath)) &&
			(await this.fileManager.exists(mainPath))
		) {
			new Notice(`Plugin "${normalizedId}" already installed.`);
			return true;
		}

		if (!pluginsApi?.installPlugin) {
			new Notice(
				"[Installer] Obsidian installPlugin API is unavailable. Update Obsidian and try again."
			);
			return false;
		}

		try {
			const pluginRegistry = await this.networkManager.fetchJson<
				PluginRegistryEntry[]
			>(PLUGIN_REGISTRY_URL);

			if (!Array.isArray(pluginRegistry)) {
				throw new Error("Plugin registry is not an array");
			}

			const pluginMeta = pluginRegistry.find(
				(p) => p.id.trim().toLowerCase() === normalizedId.toLowerCase()
			);

			if (!pluginMeta) {
				new Notice(
					`Plugin "${normalizedId}" not found in Obsidian Community Plugins registry.`
				);
				return false;
			}

			if (!pluginMeta.repo || typeof pluginMeta.repo !== "string") {
				new Notice(
					`Plugin "${normalizedId}" has invalid repository information in registry.`
				);
				return false;
			}

			const repoParts = pluginMeta.repo.split("/");
			if (repoParts.length !== 2) {
				new Notice(
					`Plugin "${normalizedId}" has invalid repository format: ${pluginMeta.repo}`
				);
				return false;
			}

			const [owner, repo] = repoParts;
			const release = await this.selectRelease(owner, repo, normalizedId);
			if (!release?.tag_name || !release.assets?.length) {
				new Notice(
					`No suitable release found for plugin "${normalizedId}".`
				);
				return false;
			}

			const manifestAsset = release.assets.find(
				(a) => a.name === "manifest.json"
			);
			if (!manifestAsset) {
				new Notice(
					`[Installer] Release for "${normalizedId}" has no manifest.json asset.`
				);
				return false;
			}

			const manifest = await this.networkManager.fetchJson<PluginManifest>(
				manifestAsset.browser_download_url
			);
			if (!manifest?.id) {
				new Notice(
					`[Installer] Invalid manifest.json for "${normalizedId}".`
				);
				return false;
			}

			const version = release.tag_name.replace(/^v/, "");
			logger.debug(
				`Installing "${normalizedId}" via Obsidian installPlugin (${pluginMeta.repo}@${version})`
			);

			await pluginsApi.installPlugin(pluginMeta.repo, version, manifest);

			if (this.shouldLoadSettingsOnInstall()) {
				const installedFolderId = (await this.fileManager.exists(
					this.fileManager.pluginsPath(manifest.id)
				))
					? manifest.id
					: normalizedId;

				await this.settingsManager.applySettingsForPlugin(
					normalizedId,
					installedFolderId
				);
				if (manifest.id !== normalizedId) {
					await this.settingsManager.applySettingsForPlugin(
						manifest.id,
						installedFolderId
					);
				}
			}

			new Notice(`Plugin "${normalizedId}" installed successfully.`);
			return true;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				`[Installer] Failed to install plugin "${normalizedId}": ${errorMessage}. See console for details.`
			);
			logger.error(`Installation error for ${normalizedId}:`, err);
			if (
				(await this.fileManager.exists(pluginFolder)) &&
				!(await this.fileManager.exists(mainPath))
			) {
				await this.fileManager.removeRecursive(pluginFolder);
			}
			return false;
		}
	}

	private async selectRelease(
		owner: string,
		repo: string,
		pluginId: string
	): Promise<GitHubRelease | null> {
		try {
			const releases = await this.networkManager.fetchJson<GitHubRelease[]>(
				`https://api.github.com/repos/${owner}/${repo}/releases?per_page=20`
			);

			if (!Array.isArray(releases) || releases.length === 0) {
				return await this.networkManager.fetchJson<GitHubRelease>(
					`https://api.github.com/repos/${owner}/${repo}/releases/latest`
				);
			}

			const isUnstable = (r: GitHubRelease) =>
				!!r.prerelease ||
				/beta|alpha|rc|preview/i.test(r.tag_name || "");

			const hasManifest = (r: GitHubRelease) =>
				(r.assets || []).some((a) => a.name === "manifest.json");

			const candidates = releases.filter(
				(r) => !r.draft && hasManifest(r)
			);

			const stable = candidates.find((r) => !isUnstable(r));
			if (stable) {
				return stable;
			}

			if (candidates[0]) {
				logger.warn(
					`No stable release for ${owner}/${repo}; using newest for "${pluginId}".`
				);
				return candidates[0];
			}

			return null;
		} catch (err: unknown) {
			logger.warn(
				`Failed to list releases for ${owner}/${repo}, falling back to /latest:`,
				err
			);
			return await this.networkManager.fetchJson<GitHubRelease>(
				`https://api.github.com/repos/${owner}/${repo}/releases/latest`
			);
		}
	}
}
