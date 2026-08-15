import { App, FileSystemAdapter, Notice } from "obsidian";
import { logger } from "./Logger";

/**
 * Vault-relative file helpers via Obsidian's DataAdapter (no Node fs).
 */
export class FileManager {
	constructor(private app: App) {}

	/**
	 * Ensures desktop FileSystemAdapter is available.
	 */
	assertDesktopAdapter(): void {
		if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
			throw new Error(
				"Base path is only available on desktop. This plugin requires desktop version of Obsidian."
			);
		}
	}

	/**
	 * Joins vault-relative path segments (Obsidian uses `/`).
	 */
	joinPath(...parts: string[]): string {
		return parts
			.filter((part) => part.length > 0)
			.join("/")
			.replace(/\\/g, "/")
			.replace(/\/+/g, "/");
	}

	/**
	 * Path under the vault config dir (usually `.obsidian/...`).
	 */
	configPath(...parts: string[]): string {
		return this.joinPath(this.app.vault.configDir, ...parts);
	}

	/**
	 * Path under `.obsidian/plugins/...`.
	 */
	pluginsPath(...parts: string[]): string {
		return this.configPath("plugins", ...parts);
	}

	async exists(vaultPath: string): Promise<boolean> {
		try {
			return await this.app.vault.adapter.exists(vaultPath);
		} catch (err: unknown) {
			logger.error(`exists() failed for ${vaultPath}:`, err);
			return false;
		}
	}

	/**
	 * Ensures parent directories exist so a file can be written.
	 */
	async ensureParentDir(vaultFilePath: string): Promise<boolean> {
		const normalized = vaultFilePath.replace(/\\/g, "/");
		const lastSlash = normalized.lastIndexOf("/");
		if (lastSlash <= 0) {
			return true;
		}
		return this.ensureDirectory(normalized.slice(0, lastSlash));
	}

	async ensureDirectory(vaultPath: string): Promise<boolean> {
		try {
			if (await this.exists(vaultPath)) {
				return true;
			}
			const parts = vaultPath.replace(/\\/g, "/").split("/").filter(Boolean);
			let current = "";
			for (const part of parts) {
				current = current ? `${current}/${part}` : part;
				if (!(await this.exists(current))) {
					await this.app.vault.adapter.mkdir(current);
				}
			}
			return true;
		} catch (err: unknown) {
			logger.error(`Failed to create directory ${vaultPath}:`, err);
			return false;
		}
	}

	async readFile(vaultPath: string): Promise<string | null> {
		try {
			return await this.app.vault.adapter.read(vaultPath);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(`[Installer] Failed to read file: ${errorMessage}`);
			logger.error(`[Installer] File read error for ${vaultPath}:`, err);
			return null;
		}
	}

	async writeFile(vaultPath: string, content: string): Promise<boolean> {
		try {
			if (!(await this.ensureParentDir(vaultPath))) {
				return false;
			}
			await this.app.vault.adapter.write(vaultPath, content);
			return true;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(`[Installer] Failed to write file: ${errorMessage}`);
			logger.error(`[Installer] File write error for ${vaultPath}:`, err);
			return false;
		}
	}

	async removeRecursive(vaultPath: string): Promise<void> {
		try {
			if (await this.exists(vaultPath)) {
				await this.app.vault.adapter.rmdir(vaultPath, true);
			}
		} catch (err: unknown) {
			logger.debug(`removeRecursive failed for ${vaultPath}:`, err);
		}
	}

	/**
	 * Validates and parses JSON content with detailed error messages.
	 */
	parseJsonWithValidation<T>(content: string, fileName: string): T | null {
		if (!content || content.trim() === "") {
			new Notice(
				`[Installer] ${fileName} is empty. Please add content or the file will be recreated.`
			);
			return null;
		}

		try {
			return JSON.parse(content) as T;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				`[Installer] Invalid JSON in ${fileName}: ${errorMessage}. Please check the file format.`
			);
			logger.error(`JSON parse error in ${fileName}:`, err);
			return null;
		}
	}
}
