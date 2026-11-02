import { describe, expect, it } from "vitest";
import {
	SECRET_PLACEHOLDER,
	containsPlaceholder,
	isSecretKey,
	parseSecretKeys,
	redactSecrets,
	restoreSecrets,
} from "../src/utils/secrets";

describe("isSecretKey", () => {
	it("matches common secret names in any spelling", () => {
		for (const key of [
			"token",
			"accessToken",
			"api_key",
			"API-Key",
			"openAIApiKey",
			"password",
			"clientSecret",
			"webhookUrl",
			"Authorization",
		]) {
			expect(isSecretKey(key)).toBe(true);
		}
	});

	it("leaves ordinary settings alone", () => {
		for (const key of ["author", "hotkey", "keyboardLayout", "theme"]) {
			expect(isSecretKey(key)).toBe(false);
		}
	});

	it("accepts extra names", () => {
		const extra = parseSecretKeys(" licenseCode , end_point,");
		expect(extra).toEqual(["licensecode", "endpoint"]);
		expect(isSecretKey("license-code", extra)).toBe(true);
		expect(isSecretKey("endPoint", extra)).toBe(true);
	});
});

describe("redactSecrets", () => {
	it("replaces non-empty string secrets, also nested and in arrays", () => {
		const { value, redacted } = redactSecrets({
			apiKey: "sk-123",
			emptyToken: "",
			maxTokens: 500,
			showPassword: true,
			nested: { password: "hunter2", name: "me" },
			tokens: ["a", "b"],
			accounts: [{ name: "x", token: "t" }],
		});
		expect(value).toEqual({
			apiKey: SECRET_PLACEHOLDER,
			emptyToken: "",
			maxTokens: 500,
			showPassword: true,
			nested: { password: SECRET_PLACEHOLDER, name: "me" },
			tokens: [SECRET_PLACEHOLDER, SECRET_PLACEHOLDER],
			accounts: [{ name: "x", token: SECRET_PLACEHOLDER }],
		});
		expect(redacted).toBe(5);
	});

	it("does not mutate the input or copy __proto__", () => {
		const input = JSON.parse('{"token":"t","__proto__":{"x":1}}');
		const { value } = redactSecrets(input);
		expect(input.token).toBe("t");
		expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
		expect((value as Record<string, unknown>).x).toBeUndefined();
	});
});

describe("restoreSecrets", () => {
	it("keeps the current value where a placeholder came in", () => {
		expect(
			restoreSecrets(
				{ apiKey: SECRET_PLACEHOLDER, model: "new", nested: { password: SECRET_PLACEHOLDER } },
				{ apiKey: "real", model: "old", nested: { password: "pw" } },
			),
		).toEqual({ apiKey: "real", model: "new", nested: { password: "pw" } });
	});

	it("drops placeholders that have no current value", () => {
		expect(
			restoreSecrets(
				{ apiKey: SECRET_PLACEHOLDER, tokens: [SECRET_PLACEHOLDER, "x"] },
				undefined,
			),
		).toEqual({ tokens: ["x"] });
	});

	it("returns plain values unchanged", () => {
		expect(restoreSecrets({ a: 1 }, { a: 2 })).toEqual({ a: 1 });
		expect(restoreSecrets(SECRET_PLACEHOLDER, undefined)).toBeUndefined();
	});

	it("round-trips with redactSecrets", () => {
		const original = { apiKey: "k", list: [{ token: "t" }], n: 1 };
		const { value } = redactSecrets(original);
		expect(containsPlaceholder(value)).toBe(true);
		expect(restoreSecrets(value, original)).toEqual(original);
	});
});
