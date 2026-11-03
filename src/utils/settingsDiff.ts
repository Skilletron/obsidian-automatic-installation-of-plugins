import { isSecretKey } from "./secrets";

export interface SettingChange {
	// Dotted path to the setting, e.g. "editor.fontSize".
	path: string;
	kind: "added" | "changed" | "removed";
	before?: unknown;
	after?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Lists what differs between two settings objects. Nested objects are
// compared key by key; arrays and other values as a whole.
export function diffSettings(
	before: unknown,
	after: unknown,
	path = "",
): SettingChange[] {
	if (isPlainObject(before) && isPlainObject(after)) {
		const changes: SettingChange[] = [];
		const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
		for (const key of keys) {
			const childPath = path ? `${path}.${key}` : key;
			if (!(key in after)) {
				changes.push({ path: childPath, kind: "removed", before: before[key] });
			} else if (!(key in before)) {
				changes.push({ path: childPath, kind: "added", after: after[key] });
			} else {
				changes.push(...diffSettings(before[key], after[key], childPath));
			}
		}
		return changes;
	}
	if (JSON.stringify(before) === JSON.stringify(after)) {
		return [];
	}
	if (before === undefined) {
		return [{ path: path || "(all)", kind: "added", after }];
	}
	return [{ path: path || "(all)", kind: "changed", before, after }];
}

const MAX_VALUE_LENGTH = 40;

function formatValue(value: unknown, secret: boolean): string {
	if (secret && typeof value === "string" && value !== "") {
		return "••••";
	}
	const text = JSON.stringify(value) ?? String(value);
	return text.length > MAX_VALUE_LENGTH
		? `${text.slice(0, MAX_VALUE_LENGTH - 1)}…`
		: text;
}

// One line per change; values under secret-looking keys are masked.
export function formatChange(change: SettingChange): string {
	const secret = change.path.split(".").some((part) => isSecretKey(part));
	switch (change.kind) {
		case "added":
			return `+ ${change.path}: ${formatValue(change.after, secret)}`;
		case "removed":
			return `− ${change.path}`;
		default:
			return `${change.path}: ${formatValue(change.before, secret)} → ${formatValue(change.after, secret)}`;
	}
}
