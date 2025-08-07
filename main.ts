import { App, Plugin, PluginSettingTab, Setting, Notice } from "obsidian";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import JSZip from "jszip";

interface InstallCommunityPluginsSettings {
	loadSettingsOnInstall: boolean;
	loadSettingsOnStartup: boolean;
	autoInstallPlugins: boolean;
}

const DEFAULT_SETTINGS: InstallCommunityPluginsSettings = {
	loadSettingsOnInstall: true,
	loadSettingsOnStartup: true,
	autoInstallPlugins: true,
};

export default class InstallCommunityPlugins extends Plugin {
	settings: InstallCommunityPluginsSettings;

	async onload() {
		await this.loadSettings();

		if (this.settings.loadSettingsOnStartup) {
			await this.applySettingsToInstalledPlugins();
		}

		if (this.settings.autoInstallPlugins) {
			new Notice("Starting community plugins installation...");
			await this.installPluginsFromFile();
			new Notice("Installation process finished.");
		}

		this.addSettingTab(
			new InstallCommunityPluginsSettingTab(this.app, this)
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async applySettingsToInstalledPlugins() {
		const adapterWithBasePath = this.app.vault.adapter as any;
		const basePath = adapterWithBasePath.basePath;
		const pluginsFolder = path.join(basePath, ".obsidian", "plugins");
		const settingsFile = path.join(
			basePath,
			".obsidian",
			"community-plugins-settings.json"
		);

		if (!fs.existsSync(settingsFile)) {
			console.log(
				"[Installer] No community-plugins-settings.json file found, skipping applying settings on startup."
			);
			return;
		}

		let allSettings: Record<string, any>;
		try {
			const rawSettings = fs.readFileSync(settingsFile, "utf-8");
			allSettings = JSON.parse(rawSettings);
		} catch (e) {
			console.warn(
				"[Installer] Failed to parse community-plugins-settings.json on startup",
				e
			);
			return;
		}

		for (const pluginId of Object.keys(allSettings)) {
			const pluginFolder = path.join(pluginsFolder, pluginId);
			const dataJsonPath = path.join(pluginFolder, "data.json");

			if (fs.existsSync(pluginFolder) && allSettings[pluginId]) {
				try {
					fs.writeFileSync(
						dataJsonPath,
						JSON.stringify(allSettings[pluginId], null, 2),
						"utf-8"
					);
					console.log(
						`[Installer] Applied settings on startup to plugin ${pluginId}`
					);
				} catch (e) {
					console.warn(
						`[Installer] Failed to write data.json for plugin ${pluginId} on startup`,
						e
					);
				}
			}
		}
	}

	async installPluginsFromFile() {
		const adapterWithBasePath = this.app.vault.adapter as any;
		const pluginsJsonPath = path.join(
			adapterWithBasePath.basePath,
			".obsidian",
			"community-plugins.json"
		);

		if (!fs.existsSync(pluginsJsonPath)) {
			new Notice(`File not found: ${pluginsJsonPath}`);
			return;
		}

		try {
			const content = fs.readFileSync(pluginsJsonPath, "utf-8");
			const pluginIds: string[] = JSON.parse(content);
			for (const pluginId of pluginIds) {
				await this.installPluginById(pluginId);
			}
		} catch (e) {
			console.error("Failed to read or parse community-plugins.json", e);
			new Notice("Error reading community-plugins.json. See console.");
		}
	}

	async installPluginById(pluginId: string) {
		const adapterWithBasePath = this.app.vault.adapter as any;
		const basePath = adapterWithBasePath.basePath;
		const pluginsFolder = path.join(basePath, ".obsidian", "plugins");
		const pluginFolder = path.join(pluginsFolder, pluginId);
		const settingsFile = path.join(
			basePath,
			".obsidian",
			"community-plugins-settings.json"
		);

		console.log(`[Installer] Installing plugin: ${pluginId}`);

		if (fs.existsSync(pluginFolder)) {
			new Notice(`Plugin "${pluginId}" already installed.`);
			console.log(
				`[Installer] Plugin folder exists, skipping install: ${pluginId}`
			);
			return;
		}

		const registryUrl =
			"https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";

		try {
			console.log(`[Installer] Fetching plugin registry...`);
			const pluginRegistry = await this.fetchJson(registryUrl);
			console.log(
				`[Installer] Registry fetched, searching for plugin...`
			);
			const normalizedId = pluginId.trim().toLowerCase();
			const pluginMeta = pluginRegistry.find(
				(p: any) => p.id.trim().toLowerCase() === normalizedId
			);

			if (!pluginMeta) {
				new Notice(`Plugin "${pluginId}" not found in registry`);
				console.log(
					`[Installer] Plugin not found in registry: ${pluginId}`
				);
				return;
			}

			const [owner, repo] = pluginMeta.repo.split("/");
			console.log(
				`[Installer] Fetching latest release for ${owner}/${repo}...`
			);
			const release = await this.fetchJson(
				`https://api.github.com/repos/${owner}/${repo}/releases/latest`
			);

			console.log(
				`[Installer] Release info received. Preparing folders...`
			);
			if (!fs.existsSync(pluginFolder)) {
				fs.mkdirSync(pluginFolder, { recursive: true });
			}

			const zipAsset = release.assets.find((a: any) =>
				a.name.endsWith(".zip")
			);
			if (zipAsset) {
				const zipPath = path.join(pluginsFolder, `${pluginId}.zip`);
				console.log(
					`[Installer] Downloading zip asset: ${zipAsset.browser_download_url}`
				);
				await this.downloadFileWithRedirect(
					zipAsset.browser_download_url,
					zipPath
				);
				console.log(`[Installer] Unzipping plugin...`);
				await this.unzipPlugin(zipPath, pluginFolder, pluginId);
				fs.unlinkSync(zipPath);
			} else if (release.assets && release.assets.length > 0) {
				console.log(
					`[Installer] No zip asset found, downloading individual assets...`
				);
				for (const asset of release.assets) {
					const destPath = path.join(pluginFolder, asset.name);
					console.log(
						`[Installer] Downloading asset: ${asset.browser_download_url}`
					);
					await this.downloadFileWithRedirect(
						asset.browser_download_url,
						destPath
					);
				}
			} else {
				new Notice(`No zip or assets found for plugin "${pluginId}"`);
				console.log(
					`[Installer] No zip or assets in release: ${pluginId}`
				);
				return;
			}

			if (
				this.settings.loadSettingsOnInstall &&
				fs.existsSync(settingsFile)
			) {
				try {
					const rawSettings = fs.readFileSync(settingsFile, "utf-8");
					const allSettings = JSON.parse(rawSettings);
					if (allSettings[pluginId]) {
						const dataJsonPath = path.join(
							pluginFolder,
							"data.json"
						);
						fs.writeFileSync(
							dataJsonPath,
							JSON.stringify(allSettings[pluginId], null, 2),
							"utf-8"
						);
						console.log(
							`[Installer] Applied saved settings to plugin ${pluginId} data.json`
						);
					}
				} catch (e) {
					console.warn(
						`[Installer] Failed to apply settings for plugin ${pluginId}`,
						e
					);
				}
			}

			new Notice(`Plugin "${pluginId}" installed.`);
			console.log(`[Installer] Installation finished: ${pluginId}`);
		} catch (error) {
			console.error(
				`[Installer] Failed to install plugin "${pluginId}":`,
				error
			);
			new Notice(`Failed to install plugin "${pluginId}". See console.`);
		}
	}

	fetchJson(url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			https
				.get(
					url,
					{ headers: { "User-Agent": "obsidian-plugin-installer" } },
					(res) => {
						if (res.statusCode !== 200) {
							reject(new Error(`HTTP ${res.statusCode}: ${url}`));
							return;
						}
						let data = "";
						res.on("data", (chunk) => (data += chunk));
						res.on("end", () => {
							try {
								resolve(JSON.parse(data));
							} catch (err) {
								reject(err);
							}
						});
					}
				)
				.on("error", reject);
		});
	}

	downloadFileWithRedirect(
		url: string,
		dest: string,
		options: { headers?: Record<string, string> } = {},
		maxRedirects = 5
	): Promise<void> {
		return new Promise((resolve, reject) => {
			if (maxRedirects < 0) {
				reject(new Error("Too many redirects"));
				return;
			}

			const file = fs.createWriteStream(dest);

			https
				.get(url, { headers: options.headers || {} }, (res) => {
					if (
						res.statusCode &&
						[301, 302, 303, 307, 308].includes(res.statusCode)
					) {
						const location = res.headers.location;
						if (!location) {
							reject(
								new Error(
									`Redirect status code ${res.statusCode} but no Location header`
								)
							);
							return;
						}
						file.close();
						fs.unlink(dest, () => {
							this.downloadFileWithRedirect(
								location,
								dest,
								options,
								maxRedirects - 1
							)
								.then(resolve)
								.catch(reject);
						});
						return;
					}

					if (res.statusCode !== 200) {
						reject(
							new Error(
								`Failed to download file: ${res.statusCode} ${res.statusMessage}`
							)
						);
						return;
					}

					res.pipe(file);
					file.on("finish", () => {
						file.close();
						resolve();
					});
					file.on("error", (err) => {
						fs.unlink(dest, () => reject(err));
					});
				})
				.on("error", (err) => {
					fs.unlink(dest, () => reject(err));
				});
		});
	}

	async unzipPlugin(
		zipFilePath: string,
		destFolder: string,
		pluginId: string
	) {
		const data = fs.readFileSync(zipFilePath);
		const zip = await JSZip.loadAsync(data);

		if (!fs.existsSync(destFolder)) {
			fs.mkdirSync(destFolder, { recursive: true });
		}

		const rootPrefix = pluginId + "/";

		await Promise.all(
			Object.keys(zip.files).map(async (filename) => {
				let relativePath = filename.startsWith(rootPrefix)
					? filename.slice(rootPrefix.length)
					: filename;
				if (!relativePath) return;

				const filePath = path.join(destFolder, relativePath);
				const file = zip.files[filename];

				if (file.dir) {
					if (!fs.existsSync(filePath))
						fs.mkdirSync(filePath, { recursive: true });
				} else {
					const content = await file.async("nodebuffer");
					fs.mkdirSync(path.dirname(filePath), { recursive: true });
					fs.writeFileSync(filePath, content);
				}
			})
		);
	}
}

class InstallCommunityPluginsSettingTab extends PluginSettingTab {
	plugin: InstallCommunityPlugins;

	constructor(app: App, plugin: InstallCommunityPlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Install Community Plugins Settings",
		});

		new Setting(containerEl)
			.setName("Auto install plugins on startup")
			.setDesc(
				"If enabled, plugins from community-plugins.json will be automatically installed on Obsidian startup."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoInstallPlugins)
					.onChange(async (value) => {
						this.plugin.settings.autoInstallPlugins = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Load plugin settings on install")
			.setDesc(
				"If enabled, plugin configuration will be loaded from community-plugins-settings.json after installation."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.loadSettingsOnInstall)
					.onChange(async (value) => {
						this.plugin.settings.loadSettingsOnInstall = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Load plugin settings on startup")
			.setDesc(
				"If enabled, plugin configuration will be loaded from community-plugins-settings.json into installed plugins' data.json on Obsidian startup."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.loadSettingsOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.loadSettingsOnStartup = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
