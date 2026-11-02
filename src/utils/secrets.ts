// Written in place of secret values when settings are exported. Importing
// never writes it to a plugin: the plugin keeps its current value instead.
export const SECRET_PLACEHOLDER = "<secret removed on export>";

// Assigning "__proto__" would replace the prototype instead of copying.
const UNSAFE_KEY = "__proto__";

// Matched against the setting key, lowercased and without separators, so
// "api_key", "apiKey" and "API-Key" all become "apikey".
const SECRET_KEY_PARTS = [
	"token",
	"secret",
	"password",
	"passwd",
	"passphrase",
	"apikey",
	"accesskey",
	"privatekey",
	"licensekey",
	"credential",
	"cookie",
	"sessionid",
	"authorization",
	"bearer",
	"webhook",
];

function normalizeKey(key: string): string {
	return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Parses the user's comma-separated list of extra key names.
export function parseSecretKeys(text: string): string[] {
	return text
		.split(",")
		.map((part) => normalizeKey(part))
		.filter(Boolean);
}

export function isSecretKey(key: string, extraParts: string[] = []): boolean {
	const normalized = normalizeKey(key);
	return [...SECRET_KEY_PARTS, ...extraParts].some((part) =>
		normalized.includes(part),
	);
}

// Replaces non-empty string values under secret-looking keys with
// SECRET_PLACEHOLDER. Numbers and booleans (maxTokens, showPassword) are kept.
export function redactSecrets(
	value: unknown,
	extraParts: string[] = [],
): { value: unknown; redacted: number } {
	let redacted = 0;

	const walk = (node: unknown, key: string | null): unknown => {
		if (
			key !== null &&
			typeof node === "string" &&
			node !== "" &&
			isSecretKey(key, extraParts)
		) {
			redacted++;
			return SECRET_PLACEHOLDER;
		}
		if (Array.isArray(node)) {
			// Items inherit the key of their array: tokens: ["a", "b"]
			return node.map((item) => walk(item, key));
		}
		if (node !== null && typeof node === "object") {
			const result: Record<string, unknown> = {};
			for (const [childKey, child] of Object.entries(
				node as Record<string, unknown>,
			)) {
				if (childKey === UNSAFE_KEY) {
					continue;
				}
				result[childKey] = walk(child, childKey);
			}
			return result;
		}
		return node;
	};

	return { value: walk(value, null), redacted };
}

// Puts the plugin's current values back where the incoming settings hold a
// placeholder; a placeholder with no current value is dropped.
export function restoreSecrets(incoming: unknown, existing: unknown): unknown {
	const MISSING = Symbol("missing");

	const walk = (node: unknown, current: unknown): unknown => {
		if (node === SECRET_PLACEHOLDER) {
			return current === undefined ? MISSING : current;
		}
		if (Array.isArray(node)) {
			const currentItems = Array.isArray(current) ? current : [];
			return node
				.map((item, i) => walk(item, currentItems[i]))
				.filter((item) => item !== MISSING);
		}
		if (node !== null && typeof node === "object") {
			const currentObject =
				current !== null &&
				typeof current === "object" &&
				!Array.isArray(current)
					? (current as Record<string, unknown>)
					: {};
			const result: Record<string, unknown> = {};
			for (const [key, child] of Object.entries(
				node as Record<string, unknown>,
			)) {
				if (key === UNSAFE_KEY) {
					continue;
				}
				const restored = walk(child, currentObject[key]);
				if (restored !== MISSING) {
					result[key] = restored;
				}
			}
			return result;
		}
		return node;
	};

	const restored = walk(incoming, existing);
	return restored === MISSING ? undefined : restored;
}

export function containsPlaceholder(value: unknown): boolean {
	if (value === SECRET_PLACEHOLDER) {
		return true;
	}
	if (Array.isArray(value)) {
		return value.some(containsPlaceholder);
	}
	if (value !== null && typeof value === "object") {
		return Object.values(value as Record<string, unknown>).some(
			containsPlaceholder,
		);
	}
	return false;
}
