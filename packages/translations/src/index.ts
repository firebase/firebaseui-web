/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ar as arTranslations } from "./locales/ar";
import { bgBG } from "./locales/bg-bg";
import { caES } from "./locales/ca-es";
import { csCZ } from "./locales/cs-cz";
import { daDK } from "./locales/da-dk";
import { deDE } from "./locales/de-de";
import { elGR } from "./locales/el-gr";
import { enGB } from "./locales/en-gb";
import { enUS } from "./locales/en-us";
import { esES } from "./locales/es-es";
import { es419 } from "./locales/es-419";
import { faIR } from "./locales/fa-ir";
import { fiFI } from "./locales/fi-fi";
import { filPH } from "./locales/fil-ph";
import { frFR } from "./locales/fr-fr";
import { heIL } from "./locales/he-il";
import { hiIN } from "./locales/hi-in";
import { hrHR } from "./locales/hr-hr";
import { huHU } from "./locales/hu-hu";
import { idID } from "./locales/id-id";
import { itIT } from "./locales/it-it";
import { jaJP } from "./locales/ja-jp";
import { koKR } from "./locales/ko-kr";
import { ltLT } from "./locales/lt-lt";
import { lvLV } from "./locales/lv-lv";
import { nbNO } from "./locales/nb-no";
import { nlNL } from "./locales/nl-nl";
import { plPL } from "./locales/pl-pl";
import { ptBR } from "./locales/pt-br";
import { ptPT } from "./locales/pt-pt";
import { roRO } from "./locales/ro-ro";
import { ruRU } from "./locales/ru-ru";
import { skSK } from "./locales/sk-sk";
import { slSI } from "./locales/sl-si";
import { srRS } from "./locales/sr-rs";
import { svSE } from "./locales/sv-se";
import { thTH } from "./locales/th-th";
import { trTR } from "./locales/tr-tr";
import { ukUA } from "./locales/uk-ua";
import { viVN } from "./locales/vi-vn";
import { zhCN } from "./locales/zh-cn";
import { zhTW } from "./locales/zh-tw";
import { type Translations } from "./types";

export type * from "./types";
export * from "./mapping";

/** Locale identifier string. Supports BCP 47 format (e.g., "en-US") or any string. */
export type Locale = "en-US" | `${string}-${string}` | string;

/**
 * Registers a locale with its translations and optional fallback locale.
 *
 * @param locale - The locale identifier (e.g., "en-US", "fr-FR").
 * @param translations - The translation object for this locale.
 * @param fallback - Optional fallback locale to use when a translation is missing.
 * @returns A registered locale object.
 */
export function registerLocale(
  locale: Locale,
  translations: Translations,
  fallback?: RegisteredLocale
): RegisteredLocale {
  return {
    locale,
    translations,
    fallback,
  };
}

/** Pre-registered English US locale with default translations. */
export const enUs = registerLocale("en-US", enUS);

/** Pre-registered Arabic locale. */
export const ar = registerLocale("ar", arTranslations);

/** Pre-registered Czech CZ locale. */
export const csCz = registerLocale("cs-CZ", csCZ);

/** Pre-registered German DE locale. */
export const deDe = registerLocale("de-DE", deDE);

/** Pre-registered Spanish ES locale. */
export const esEs = registerLocale("es-ES", esES);

/** Pre-registered French FR locale. */
export const frFr = registerLocale("fr-FR", frFR);

/** Pre-registered Hindi IN locale. */
export const hiIn = registerLocale("hi-IN", hiIN);

/** Pre-registered Italian IT locale. */
export const itIt = registerLocale("it-IT", itIT);

/** Pre-registered Japanese JP locale. */
export const jaJp = registerLocale("ja-JP", jaJP);

/** Pre-registered Korean KR locale. */
export const koKr = registerLocale("ko-KR", koKR);

/** Pre-registered Portuguese BR locale. */
export const ptBr = registerLocale("pt-BR", ptBR);

/** Pre-registered Bulgarian BG locale. */
export const bgBg = registerLocale("bg-BG", bgBG);

/** Pre-registered Catalan ES locale. */
export const caEs = registerLocale("ca-ES", caES);

/** Pre-registered Danish DK locale. */
export const daDk = registerLocale("da-DK", daDK);

/** Pre-registered Greek GR locale. */
export const elGr = registerLocale("el-GR", elGR);

/** Pre-registered English GB locale. */
export const enGb = registerLocale("en-GB", enGB);

/** Pre-registered Spanish Latin America locale. */
export const esLa = registerLocale("es-419", es419);

/** Pre-registered Persian IR locale. */
export const faIr = registerLocale("fa-IR", faIR);

/** Pre-registered Finnish FI locale. */
export const fiFi = registerLocale("fi-FI", fiFI);

/** Pre-registered Filipino PH locale. */
export const filPh = registerLocale("fil-PH", filPH);

/** Pre-registered Hebrew IL locale. */
export const heIl = registerLocale("he-IL", heIL);

/** Pre-registered Croatian HR locale. */
export const hrHr = registerLocale("hr-HR", hrHR);

/** Pre-registered Hungarian HU locale. */
export const huHu = registerLocale("hu-HU", huHU);

/** Pre-registered Indonesian ID locale. */
export const idId = registerLocale("id-ID", idID);

/** Pre-registered Lithuanian LT locale. */
export const ltLt = registerLocale("lt-LT", ltLT);

/** Pre-registered Latvian LV locale. */
export const lvLv = registerLocale("lv-LV", lvLV);

/** Pre-registered Norwegian Bokmål NO locale. */
export const nbNo = registerLocale("nb-NO", nbNO);

/** Pre-registered Dutch NL locale. */
export const nlNl = registerLocale("nl-NL", nlNL);

/** Pre-registered Polish PL locale. */
export const plPl = registerLocale("pl-PL", plPL);

/** Pre-registered Portuguese PT locale. */
export const ptPt = registerLocale("pt-PT", ptPT);

/** Pre-registered Romanian RO locale. */
export const roRo = registerLocale("ro-RO", roRO);

/** Pre-registered Russian RU locale. */
export const ruRu = registerLocale("ru-RU", ruRU);

/** Pre-registered Slovak SK locale. */
export const skSk = registerLocale("sk-SK", skSK);

/** Pre-registered Slovenian SI locale. */
export const slSi = registerLocale("sl-SI", slSI);

/** Pre-registered Serbian RS locale. */
export const srRs = registerLocale("sr-RS", srRS);

/** Pre-registered Swedish SE locale. */
export const svSe = registerLocale("sv-SE", svSE);

/** Pre-registered Thai TH locale. */
export const thTh = registerLocale("th-TH", thTH);

/** Pre-registered Turkish TR locale. */
export const trTr = registerLocale("tr-TR", trTR);

/** Pre-registered Ukrainian UA locale. */
export const ukUa = registerLocale("uk-UA", ukUA);

/** Pre-registered Vietnamese VN locale. */
export const viVn = registerLocale("vi-VN", viVN);

/** Pre-registered Chinese Simplified CN locale. */
export const zhCn = registerLocale("zh-CN", zhCN);

/** Pre-registered Chinese Traditional TW locale. */
export const zhTw = registerLocale("zh-TW", zhTW);

/** A registered locale with its translations and optional fallback. */
export type RegisteredLocale = {
  /** The locale identifier. */
  locale: Locale;
  /** The translation object for this locale. */
  translations: Translations;
  /** Optional fallback locale to use when a translation is missing. */
  fallback?: RegisteredLocale;
};
