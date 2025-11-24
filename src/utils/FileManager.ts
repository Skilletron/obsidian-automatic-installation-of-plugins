import * as fs from "fs";
import * as path from "path";
import { App, FileSystemAdapter, Notice } from "obsidian";
import { PathInfo, PLUGINS_SETTINGS_FILE } from "../types";
import { logger } from "./Logger";

/**
 * Utility class for file system operations.
 */
export class FileManager {
	constructor(private app: App) {}

	/**
	 * Gets the base path and config directory for file system operations.
	 * @throws {Error} If the adapter is not a FileSystemAdapter (not desktop)
	 */
	getBasePathAndConfigDir(): PathInfo {
		const adapter = this.app.vault.adapter;
		if (adapter instanceof FileSystemAdapter) {
			const basePath = adapter.getBasePath();
			const configDir = this.app.vault.configDir;
			return { basePath, configDir };
		} else {
			throw new Error(
				"Base path is only available on desktop. This plugin requires desktop version of Obsidian."
			);
		}
	}

	/**
	 * Validates that the file system is accessible before operations.
	 * @param filePath - Path to check
	 * @returns True if accessible, false otherwise
	 */
	isFileSystemAccessible(filePath: string): boolean {
		try {
			const dir = path.dirname(filePath);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			return true;
		} catch (error) {
			logger.error(`File system not accessible at ${filePath}:`, error);
			return false;
		}
	}

	/**
	 * Reads a file and returns its content.
	 * @param filePath - Path to the file
	 * @returns File content or null if error
	 */
	readFile(filePath: string): string | null {
		try {
			return fs.readFileSync(filePath, "utf-8");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(`[Installer] Failed to read file: ${errorMessage}`);
			console.error(`[Installer] File read error for ${filePath}:`, error);
			return null;
		}
	}

	/**
	 * Writes content to a file.
	 * @param filePath - Path to the file
	 * @param content - Content to write
	 * @returns True if successful, false otherwise
	 */
	writeFile(filePath: string, content: string): boolean {
		try {
			if (!this.isFileSystemAccessible(filePath)) {
				return false;
			}
			fs.writeFileSync(filePath, content, "utf-8");
			return true;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(`[Installer] Failed to write file: ${errorMessage}`);
			console.error(`[Installer] File write error for ${filePath}:`, error);
			return false;
		}
	}

	/**
	 * Checks if a file exists.
	 * @param filePath - Path to check
	 * @returns True if exists, false otherwise
	 */
	fileExists(filePath: string): boolean {
		return fs.existsSync(filePath);
	}

	/**
	 * Creates a directory if it doesn't exist.
	 * @param dirPath - Path to the directory
	 * @returns True if successful, false otherwise
	 */
	ensureDirectory(dirPath: string): boolean {
		try {
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}
			return true;
		} catch (error) {
			logger.error(`Failed to create directory ${dirPath}:`, error);
			return false;
		}
	}

	/**
	 * Gets the size of a file in bytes.
	 * @param filePath - Path to the file
	 * @returns File size in bytes or null if error
	 */
	getFileSize(filePath: string): number | null {
		try {
			const stats = fs.statSync(filePath);
			return stats.size;
		} catch (error) {
			logger.error(`Failed to get file size for ${filePath}:`, error);
			return null;
		}
	}

	/**
	 * Validates and parses JSON content with detailed error messages.
	 * @param content - JSON string to parse
	 * @param fileName - Name of the file for error messages
	 * @returns Parsed JSON object or null if invalid
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
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(
				`[Installer] Invalid JSON in ${fileName}: ${errorMessage}. Please check the file format.`
			);
			logger.error(`JSON parse error in ${fileName}:`, error);
			return null;
		}
	}
}

