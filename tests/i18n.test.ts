import { afterEach, describe, expect, it } from "vitest";
import { Message, currentLanguage, setLanguage, t } from "../src/i18n";
import { LOCALES } from "../src/i18n/locales";
import { en } from "../src/i18n/locales/en";

const placeholders = (text: string) =>
	[...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const forms = (message: Message): string[] =>
	typeof message === "string" ? [message] : Object.values(message);

afterEach(() => setLanguage("en"));

describe.each(Object.entries(LOCALES))("locale %s", (code, messages) => {
	const englishKeys = Object.keys(en).sort();

	it("has exactly the English keys", () => {
		expect(Object.keys(messages).sort()).toEqual(englishKeys);
	});

	it("keeps every placeholder", () => {
		for (const key of englishKeys) {
			const english = placeholders(forms(en[key as keyof typeof en])[0]);
			for (const form of forms(messages[key as keyof typeof en] as Message)) {
				expect({ key, placeholders: placeholders(form) }).toEqual({
					key,
					placeholders: english,
				});
			}
		}
	});

	it("uses the plural forms of its language", () => {
		const categories = new Intl.PluralRules(code).resolvedOptions().pluralCategories;
		for (const key of englishKeys) {
			const english = en[key as keyof typeof en];
			const message = messages[key as keyof typeof en] as Message;
			if (typeof english === "string") {
				expect({ key, type: typeof message }).toEqual({ key, type: "string" });
				continue;
			}
			expect({ key, forms: Object.keys(message).sort() }).toEqual({
				key,
				forms: [...categories].sort(),
			});
		}
	});

	it("has no empty texts", () => {
		for (const key of englishKeys) {
			for (const form of forms(messages[key as keyof typeof en] as Message)) {
				expect({ key, empty: form.trim() === "" }).toEqual({ key, empty: false });
			}
		}
	});
});

describe("t", () => {
	it("fills in placeholders and picks the English plural form", () => {
		expect(t("import.otherDevices", { count: 1 })).toBe(
			"1 plugin is listed for other devices only.",
		);
		expect(t("import.otherDevices", { count: 3 })).toBe(
			"3 plugins are listed for other devices only.",
		);
		expect(t("import.invalidJson", { file: "a.json", error: "x" })).toBe(
			"Invalid JSON in a.json: x.",
		);
	});

	it("picks Russian plural forms", () => {
		setLanguage("ru");
		expect(t("apply.plugins", { count: 1 })).toBe("1 плагин");
		expect(t("apply.plugins", { count: 3 })).toBe("3 плагина");
		expect(t("apply.plugins", { count: 5 })).toBe("5 плагинов");
		expect(t("apply.plugins", { count: 21 })).toBe("21 плагин");
	});

	it("falls back to the base language, then English", () => {
		setLanguage("ru-RU");
		expect(currentLanguage()).toBe("ru");
		setLanguage("xx");
		expect(currentLanguage()).toBe("en");
		expect(t("common.close")).toBe("Close");
	});

	it("leaves unknown placeholders alone", () => {
		expect(t("pack.from", {})).toBe("From: {source}");
	});
});
