import { Notice } from "obsidian";
import { PluginListEntry, PLUGINS_LIST_FILE } from "../types";
import { logger } from "./Logger";

export function normalizeVersion(version: string): string {
	return version.trim().replace(/^v/i, "");
}

export function isSafePathSegment(segment: string): boolean {
	if (!segment || segment === "." || segment === "..") {
		return false;
	}
	if (
		segment.includes("/") ||
		segment.includes("\\") ||
		segment.includes("\0")
	) {
		return false;
	}
	return true;
}

export function isSafePluginId(id: string): boolean {
	return /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(id);
}

export function parsePluginList(raw: unknown): PluginListEntry[] | null {
	if (!Array.isArray(raw)) {
		new Notice(
			`[Installer] ${PLUGINS_LIST_FILE} must contain an array of plugin IDs or { id, version } objects.`,
		);
		return null;
	}

	if (raw.length === 0) {
		return [];
	}

	const entries: PluginListEntry[] = [];
	let skipped = 0;

	for (let i = 0; i < raw.length; i++) {
		const item: unknown = raw[i];

		if (typeof item === "string") {
			const id = item.trim();
			if (!id || !isSafePluginId(id)) {
				skipped++;
				logger.warn(
					`Skipping invalid plugin id at index ${i} in ${PLUGINS_LIST_FILE}`,
				);
				continue;
			}
			entries.push({ id });
			continue;
		}

		if (item !== null && typeof item === "object" && !Array.isArray(item)) {
			const obj = item as Record<string, unknown>;
			if (typeof obj.id !== "string" || !obj.id.trim()) {
				skipped++;
				logger.warn(
					`Skipping invalid object entry at index ${i} in ${PLUGINS_LIST_FILE} (missing id)`,
				);
				continue;
			}

			const id = obj.id.trim();
			if (!isSafePluginId(id)) {
				skipped++;
				logger.warn(
					`Skipping unsafe plugin id at index ${i} in ${PLUGINS_LIST_FILE}: ${id}`,
				);
				continue;
			}

			const entry: PluginListEntry = { id };
			if (typeof obj.version === "string" && obj.version.trim()) {
				entry.version = normalizeVersion(obj.version);
			}
			entries.push(entry);
			continue;
		}

		skipped++;
		logger.warn(
			`Skipping invalid entry at index ${i} in ${PLUGINS_LIST_FILE}`,
		);
	}

	if (skipped > 0) {
		new Notice(
			`[Installer] Skipped ${skipped} invalid entr${skipped === 1 ? "y" : "ies"} in ${PLUGINS_LIST_FILE}. See console.`,
		);
	}

	return entries;
}
