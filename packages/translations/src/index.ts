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
import { csCZ } from "./locales/cs-cz";
import { deDE as deDETranslations } from "./locales/de-de";
import { enUS } from "./locales/en-us";
import { esES as esESTranslations } from "./locales/es-es";
import { frFR as frFRTranslations } from "./locales/fr-fr";
import { hiIN as hiINTranslations } from "./locales/hi-in";
import { itIT as itITTranslations } from "./locales/it-it";
import { jaJP as jaJPTranslations } from "./locales/ja-jp";
import { koKR as koKRTranslations } from "./locales/ko-kr";
import { ptBR as ptBRTranslations } from "./locales/pt-br";
import { zhCN as zhCNTranslations } from "./locales/zh-cn";
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
export const arAR = registerLocale("ar", arTranslations);

/** Pre-registered Czech CZ locale. */
export const csCz = registerLocale("cs-CZ", csCZ);

/** Pre-registered German DE locale. */
export const deDE = registerLocale("de-DE", deDETranslations);

/** Pre-registered Spanish ES locale. */
export const esES = registerLocale("es-ES", esESTranslations);

/** Pre-registered French FR locale. */
export const frFR = registerLocale("fr-FR", frFRTranslations);

/** Pre-registered Hindi IN locale. */
export const hiIN = registerLocale("hi-IN", hiINTranslations);

/** Pre-registered Italian IT locale. */
export const itIT = registerLocale("it-IT", itITTranslations);

/** Pre-registered Japanese JP locale. */
export const jaJP = registerLocale("ja-JP", jaJPTranslations);

/** Pre-registered Korean KR locale. */
export const koKR = registerLocale("ko-KR", koKRTranslations);

/** Pre-registered Portuguese BR locale. */
export const ptBR = registerLocale("pt-BR", ptBRTranslations);

/** Pre-registered Chinese Simplified CN locale. */
export const zhCN = registerLocale("zh-CN", zhCNTranslations);

/** A registered locale with its translations and optional fallback. */
export type RegisteredLocale = {
  /** The locale identifier. */
  locale: Locale;
  /** The translation object for this locale. */
  translations: Translations;
  /** Optional fallback locale to use when a translation is missing. */
  fallback?: RegisteredLocale;
};
