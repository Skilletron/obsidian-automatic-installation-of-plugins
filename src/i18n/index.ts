import { getLanguage, moment } from "obsidian";
import { en } from "./locales/en";
import { LOCALES } from "./locales";

export type MessageKey = keyof typeof en;

// A message with a {count} in it can have a form per plural category
// (Intl.PluralRules): "one", "few", "many", "other" and so on.
export type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & {
	other: string;
};
export type Message = string | PluralMessage;
export type LocaleMessages = Partial<Record<MessageKey, Message>>;

let language = "en";
let messages: LocaleMessages = en;
let plurals = new Intl.PluralRules("en");

// Obsidian's language codes are mostly plain ("de", "ja"), with a region
// for a few ("pt-BR", "zh-TW"). Falls back to the base language, then English.
export function setLanguage(code: string): void {
	const normalized = code.trim();
	const base = normalized.split("-")[0];
	const match =
		LOCALES[normalized] !== undefined
			? normalized
			: LOCALES[base] !== undefined
				? base
				: "en";
	language = match;
	messages = LOCALES[match];
	try {
		plurals = new Intl.PluralRules(match);
	} catch {
		plurals = new Intl.PluralRules("en");
	}
}

export function currentLanguage(): string {
	return language;
}

// getLanguage() exists from Obsidian 1.8; before that, moment follows the
// app language.
export function detectLanguage(): string {
	if (typeof getLanguage === "function") {
		return getLanguage();
	}
	return typeof moment?.locale === "function" ? moment.locale() : "en";
}

function pick(message: Message, count: unknown): string {
	if (typeof message === "string") {
		return message;
	}
	const category =
		typeof count === "number" ? plurals.select(count) : ("other" as const);
	return message[category] ?? message.other;
}

// Looks up a message in the current language (English when missing) and
// fills in {name} placeholders.
export function t(
	key: MessageKey,
	params: Record<string, string | number> = {},
): string {
	const message = messages[key] ?? en[key];
	return pick(message, params.count).replace(/\{(\w+)\}/g, (all, name: string) =>
		name in params ? String(params[name]) : all,
	);
}
