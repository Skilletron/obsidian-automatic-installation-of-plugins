import { Notice } from "obsidian";
import { DeviceKind, PluginListEntry, PLUGINS_LIST_FILE } from "../types";
import { logger } from "./Logger";
import { t } from "../i18n";

export function normalizeVersion(version: string): string {
	return version.trim().replace(/^v(?=\d)/i, "");
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

const DEVICE_KINDS: DeviceKind[] = ["desktop", "mobile"];

// Accepts "desktop", "mobile" or a list of them. Returns null when the
// value is not valid.
export function parseDevices(value: unknown): DeviceKind[] | null {
	const items = typeof value === "string" ? [value] : value;
	if (!Array.isArray(items) || items.length === 0) {
		return null;
	}
	const devices: DeviceKind[] = [];
	for (const item of items) {
		const kind =
			typeof item === "string" ? item.trim().toLowerCase() : null;
		if (!kind || !DEVICE_KINDS.includes(kind as DeviceKind)) {
			return null;
		}
		if (!devices.includes(kind as DeviceKind)) {
			devices.push(kind as DeviceKind);
		}
	}
	return devices;
}

export function isForThisDevice(
	entry: PluginListEntry,
	isMobile: boolean,
): boolean {
	return !entry.devices || entry.devices.includes(isMobile ? "mobile" : "desktop");
}

export function parsePluginList(raw: unknown): PluginListEntry[] | null {
	if (!Array.isArray(raw)) {
		new Notice(t("list.notArray", { file: PLUGINS_LIST_FILE }));
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
			if (obj.devices !== undefined) {
				const devices = parseDevices(obj.devices);
				if (devices) {
					entry.devices = devices;
				} else {
					logger.warn(
						`Ignoring invalid "devices" for ${id} in ${PLUGINS_LIST_FILE}; use "desktop", "mobile" or both.`,
					);
				}
			}
			if (typeof obj.enabled === "boolean") {
				entry.enabled = obj.enabled;
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
		new Notice(t("list.skipped", { count: skipped, file: PLUGINS_LIST_FILE }));
	}

	return entries;
}
