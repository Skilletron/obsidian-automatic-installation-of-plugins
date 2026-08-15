import { App, FileSystemAdapter, Notice, normalizePath } from "obsidian";
import { logger } from "./Logger";
import { isSafePathSegment } from "./parsePluginList";

export class FileManager {
	constructor(private app: App) {}

	assertDesktopAdapter(): void {
		if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
			throw new Error(
				"This plugin requires the desktop version of Obsidian (FileSystemAdapter).",
			);
		}
	}

	joinPath(...parts: string[]): string {
		const joined = parts.filter((part) => part.length > 0).join("/");
		return normalizePath(joined);
	}

	configPath(...parts: string[]): string {
		for (const part of parts) {
			if (!isSafePathSegment(part)) {
				throw new Error(`Invalid config path segment: ${part}`);
			}
		}
		return this.joinPath(this.app.vault.configDir, ...parts);
	}

	pluginsPath(...parts: string[]): string {
		for (const part of parts) {
			if (!isSafePathSegment(part)) {
				throw new Error(`Invalid plugin path segment: ${part}`);
			}
		}
		return this.configPath("plugins", ...parts);
	}

	async exists(vaultPath: string): Promise<boolean> {
		try {
			return await this.app.vault.adapter.exists(normalizePath(vaultPath));
		} catch (err: unknown) {
			logger.error(`exists() failed for ${vaultPath}:`, err);
			return false;
		}
	}

	async ensureParentDir(vaultFilePath: string): Promise<boolean> {
		const normalized = normalizePath(vaultFilePath);
		const lastSlash = normalized.lastIndexOf("/");
		if (lastSlash <= 0) {
			return true;
		}
		return this.ensureDirectory(normalized.slice(0, lastSlash));
	}

	async ensureDirectory(vaultPath: string): Promise<boolean> {
		try {
			const normalized = normalizePath(vaultPath);
			if (await this.exists(normalized)) {
				return true;
			}
			const parts = normalized.split("/").filter(Boolean);
			let current = "";
			for (const part of parts) {
				if (!isSafePathSegment(part)) {
					throw new Error(`Invalid directory segment: ${part}`);
				}
				current = current ? `${current}/${part}` : part;
				const currentPath = normalizePath(current);
				if (!(await this.exists(currentPath))) {
					await this.app.vault.adapter.mkdir(currentPath);
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
			return await this.app.vault.adapter.read(normalizePath(vaultPath));
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
			const normalized = normalizePath(vaultPath);
			if (!(await this.ensureParentDir(normalized))) {
				return false;
			}
			await this.app.vault.adapter.write(normalized, content);
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
			const normalized = normalizePath(vaultPath);
			if (await this.exists(normalized)) {
				await this.app.vault.adapter.rmdir(normalized, true);
			}
		} catch (err: unknown) {
			logger.debug(`removeRecursive failed for ${vaultPath}:`, err);
		}
	}

	async listDirs(vaultPath: string): Promise<string[]> {
		try {
			const normalized = normalizePath(vaultPath);
			if (!(await this.exists(normalized))) {
				return [];
			}
			const listed = await this.app.vault.adapter.list(normalized);
			return listed.folders.map((folderPath) => {
				const parts = normalizePath(folderPath)
					.split("/")
					.filter(Boolean);
				return parts[parts.length - 1] ?? folderPath;
			});
		} catch (err: unknown) {
			logger.error(`listDirs() failed for ${vaultPath}:`, err);
			return [];
		}
	}

	parseJsonWithValidation<T>(content: string, fileName: string): T | null {
		if (!content || content.trim() === "") {
			new Notice(
				`[Installer] ${fileName} is empty. Please add content or the file will be recreated.`,
			);
			return null;
		}

		try {
			return JSON.parse(content) as T;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				`[Installer] Invalid JSON in ${fileName}: ${errorMessage}. Please check the file format.`,
			);
			logger.error(`JSON parse error in ${fileName}:`, err);
			return null;
		}
	}
}
