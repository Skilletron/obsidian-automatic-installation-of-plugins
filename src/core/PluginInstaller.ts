import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { NetworkManager } from "../utils/NetworkManager";
import { SettingsManager } from "./SettingsManager";
import {
	PluginRegistryEntry,
	GitHubRelease,
	PLUGIN_REGISTRY_URL,
	PLUGINS_SETTINGS_FILE,
	MAX_FILE_SIZE,
} from "../types";
import { logger } from "../utils/Logger";

/**
 * Manages plugin installation from the Obsidian Community Plugins registry.
 */
export class PluginInstaller {
	constructor(
		private fileManager: FileManager,
		private networkManager: NetworkManager,
		private settingsManager: SettingsManager,
		private loadSettingsOnInstall: boolean
	) {}

	/**
	 * Installs a plugin by its ID from the Obsidian Community Plugins registry.
	 * @param pluginId - The ID of the plugin to install
	 * @param pluginsFolder - Path to the plugins folder
	 * @param settingsFile - Path to the settings file
	 * @param onProgress - Optional progress callback for download
	 */
	async installPluginById(
		pluginId: string,
		pluginsFolder: string,
		settingsFile: string,
		onProgress?: (bytesDownloaded: number) => void
	): Promise<boolean> {
		if (!pluginId || typeof pluginId !== "string" || pluginId.trim() === "") {
			new Notice("[Installer] Invalid plugin ID provided.");
			return false;
		}

		const pluginFolder = path.join(pluginsFolder, pluginId);

		if (this.fileManager.fileExists(pluginFolder)) {
			new Notice(`Plugin "${pluginId}" already installed.`);
			return true;
		}

		try {
			// Fetch plugin registry
			const pluginRegistry = await this.networkManager.fetchJson<PluginRegistryEntry[]>(
				PLUGIN_REGISTRY_URL
			);

			if (!Array.isArray(pluginRegistry)) {
				throw new Error("Plugin registry is not an array");
			}

			const normalizedId = pluginId.trim().toLowerCase();
			const pluginMeta = pluginRegistry.find(
				(p) => p.id.trim().toLowerCase() === normalizedId
			);

			if (!pluginMeta) {
				new Notice(
					`Plugin "${pluginId}" not found in Obsidian Community Plugins registry.`
				);
				return false;
			}

			if (!pluginMeta.repo || typeof pluginMeta.repo !== "string") {
				new Notice(
					`Plugin "${pluginId}" has invalid repository information in registry.`
				);
				return false;
			}

			const repoParts = pluginMeta.repo.split("/");
			if (repoParts.length !== 2) {
				new Notice(
					`Plugin "${pluginId}" has invalid repository format: ${pluginMeta.repo}`
				);
				return false;
			}

			const [owner, repo] = repoParts;

			// Fetch latest release
			const release = await this.networkManager.fetchJson<GitHubRelease>(
				`https://api.github.com/repos/${owner}/${repo}/releases/latest`
			);

			if (!release || !release.assets || !Array.isArray(release.assets)) {
				new Notice(
					`No release assets found for plugin "${pluginId}". The plugin may not have any releases.`
				);
				return false;
			}

			if (!this.fileManager.isFileSystemAccessible(pluginFolder)) {
				new Notice(
					`[Installer] Cannot create plugin folder for "${pluginId}". Check file permissions.`
				);
				return false;
			}

			if (!this.fileManager.fileExists(pluginFolder)) {
				this.fileManager.ensureDirectory(pluginFolder);
			}

			const zipAsset = release.assets.find((a) => a.name.endsWith(".zip"));

			if (zipAsset) {
				const zipPath = path.join(pluginsFolder, `${pluginId}.zip`);
				try {
					await this.networkManager.downloadFileWithRedirect(
						zipAsset.browser_download_url,
						zipPath,
						{},
						undefined,
						onProgress
					);

					// Validate file size after download
					const fileSize = this.fileManager.getFileSize(zipPath);
					if (fileSize && fileSize > MAX_FILE_SIZE) {
						fs.unlinkSync(zipPath);
						throw new Error(
							`File too large: ${(fileSize / 1024 / 1024).toFixed(2)} MB (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`
						);
					}

					await this.unzipPlugin(zipPath, pluginFolder, pluginId);
					fs.unlinkSync(zipPath);
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					new Notice(
						`[Installer] Failed to download or extract plugin "${pluginId}": ${errorMessage}`
					);
					logger.error(`Download/extract error for ${pluginId}:`, error);
					// Clean up on error
					if (this.fileManager.fileExists(zipPath)) {
						try {
							fs.unlinkSync(zipPath);
						} catch {
							// Ignore cleanup errors
						}
					}
					return false;
				}
			} else if (release.assets.length > 0) {
				// Fallback: download individual assets
				for (const asset of release.assets) {
					const destPath = path.join(pluginFolder, asset.name);
					try {
						await this.networkManager.downloadFileWithRedirect(
							asset.browser_download_url,
							destPath
						);
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : "Unknown error";
						new Notice(
							`[Installer] Failed to download asset ${asset.name} for plugin "${pluginId}": ${errorMessage}`
						);
						logger.error(`Asset download error for ${pluginId}/${asset.name}:`, error);
					}
				}
			} else {
				new Notice(
					`No zip or assets found for plugin "${pluginId}". The release may be empty.`
				);
				return false;
			}

			// Apply settings if configured
			if (this.loadSettingsOnInstall) {
				await this.settingsManager.applySettingsForPlugin(
					pluginId,
					pluginFolder,
					settingsFile
				);
			}

			new Notice(`Plugin "${pluginId}" installed successfully.`);
			return true;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(
				`[Installer] Failed to install plugin "${pluginId}": ${errorMessage}. See console for details.`
			);
			logger.error(`Installation error for ${pluginId}:`, error);
			return false;
		}
	}

	/**
	 * Extracts a ZIP file to a destination folder.
	 * @param zipFilePath - Path to the ZIP file
	 * @param destFolder - Destination folder to extract to
	 * @param pluginId - Plugin ID for path prefix handling
	 * @throws {Error} If extraction fails
	 */
	async unzipPlugin(
		zipFilePath: string,
		destFolder: string,
		pluginId: string
	): Promise<void> {
		if (!this.fileManager.fileExists(zipFilePath)) {
			throw new Error(`ZIP file not found: ${zipFilePath}`);
		}

		// Validate file size before extraction
		const fileSize = this.fileManager.getFileSize(zipFilePath);
		if (fileSize && fileSize > MAX_FILE_SIZE) {
			throw new Error(
				`ZIP file too large: ${(fileSize / 1024 / 1024).toFixed(2)} MB (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`
			);
		}

		let data: Buffer;
		try {
			data = fs.readFileSync(zipFilePath);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			throw new Error(`Failed to read ZIP file ${zipFilePath}: ${errorMessage}`);
		}

		let zip: JSZip;
		try {
			zip = await JSZip.loadAsync(data);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			throw new Error(
				`Failed to parse ZIP file ${zipFilePath}: ${errorMessage}. The file may be corrupted.`
			);
		}

		if (!this.fileManager.isFileSystemAccessible(destFolder)) {
			throw new Error(
				`Cannot access destination folder: ${destFolder}. Check file permissions.`
			);
		}

		if (!this.fileManager.fileExists(destFolder)) {
			this.fileManager.ensureDirectory(destFolder);
		}

		const rootPrefix = pluginId + "/";

		try {
			await Promise.all(
				Object.keys(zip.files).map(async (filename) => {
					let relativePath = filename.startsWith(rootPrefix)
						? filename.slice(rootPrefix.length)
						: filename;
					if (!relativePath) return;

					const filePath = path.join(destFolder, relativePath);
					const file = zip.files[filename];

					if (file.dir) {
						if (!this.fileManager.fileExists(filePath))
							this.fileManager.ensureDirectory(filePath);
					} else {
						const content = await file.async("nodebuffer");
						this.fileManager.ensureDirectory(path.dirname(filePath));
						fs.writeFileSync(filePath, content);
					}
				})
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			throw new Error(
				`Failed to extract ZIP file ${zipFilePath}: ${errorMessage}`
			);
		}
	}
}

