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

import { enUS } from "./locales/en-us";
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

/** A registered locale with its translations and optional fallback. */
export type RegisteredLocale = {
  /** The locale identifier. */
  locale: Locale;
  /** The translation object for this locale. */
  translations: Translations;
  /** Optional fallback locale to use when a translation is missing. */
  fallback?: RegisteredLocale;
};
