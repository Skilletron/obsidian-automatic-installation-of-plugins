import type { LocaleMessages } from "../index";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ja } from "./ja";
import { ko } from "./ko";
import { pl } from "./pl";
import { ptBR } from "./pt-br";
import { ru } from "./ru";
import { tr } from "./tr";
import { uk } from "./uk";
import { zh } from "./zh";
import { zhTW } from "./zh-tw";

// Obsidian language code -> messages. Missing keys fall back to English.
export const LOCALES: Record<string, LocaleMessages> = {
	en,
	de,
	es,
	fr,
	it,
	ja,
	ko,
	pl,
	"pt-BR": ptBR,
	// Obsidian's "pt" is European Portuguese; Brazilian reads better than English.
	pt: ptBR,
	ru,
	tr,
	uk,
	zh,
	"zh-TW": zhTW,
};
