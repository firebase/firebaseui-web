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
import { type RegisteredLocale } from ".";
import type { ErrorKey, TranslationCategory, TranslationKey, TranslationSet } from "./types";

/** Maps Firebase authentication error codes to translation keys. */
export const ERROR_CODE_MAP = {
  "auth/user-not-found": "userNotFound",
  "auth/wrong-password": "wrongPassword",
  "auth/invalid-email": "invalidEmail",
  "auth/unverified-email": "unverifiedEmail",
  "auth/user-disabled": "userDisabled",
  "auth/missing-code": "missingVerificationCode",
  "auth/invalid-credential": "invalidCredential",
  "auth/network-request-failed": "networkRequestFailed",
  "auth/too-many-requests": "tooManyRequests",
  "auth/email-already-in-use": "emailAlreadyInUse",
  "auth/weak-password": "weakPassword",
  "auth/operation-not-allowed": "operationNotAllowed",
  "auth/invalid-phone-number": "invalidPhoneNumber",
  "auth/missing-phone-number": "missingPhoneNumber",
  "auth/quota-exceeded": "quotaExceeded",
  "auth/code-expired": "codeExpired",
  "auth/captcha-check-failed": "captchaCheckFailed",
  "auth/missing-verification-id": "missingVerificationId",
  "auth/missing-email": "missingEmail",
  "auth/invalid-action-code": "invalidActionCode",
  "auth/credential-already-in-use": "credentialAlreadyInUse",
  "auth/requires-recent-login": "requiresRecentLogin",
  "auth/provider-already-linked": "providerAlreadyLinked",
  "auth/invalid-verification-code": "invalidVerificationCode",
  "auth/account-exists-with-different-credential": "accountExistsWithDifferentCredential",
  "auth/display-name-required": "displayNameRequired",
  "auth/second-factor-already-in-use": "secondFactorAlreadyInUse",
} satisfies Record<string, ErrorKey>;

/** Firebase authentication error code type. */
export type ErrorCode = keyof typeof ERROR_CODE_MAP;

/**
 * Retrieves a translation string for a given locale, category, and key.
 *
 * Falls back to the locale's fallback locale or English US if the translation is not found.
 * Supports string replacements using {placeholder} syntax.
 *
 * @param locale - The registered locale to get the translation from.
 * @param category - The translation category (e.g., "errors", "labels").
 * @param key - The translation key within the category.
 * @param replacements - Optional object with replacement values for placeholders in the translation string.
 * @returns The translated string, or an empty string if not found.
 */
export function getTranslation<T extends TranslationCategory>(
  locale: RegisteredLocale,
  category: T,
  key: TranslationKey<T>,
  replacements?: Record<string, string>
): string {
  const userTranslationSet = locale.translations[category] as TranslationSet<T> | undefined;
  const translatedString = userTranslationSet?.[key];

  let str: string | undefined;

  if (translatedString) {
    str = translatedString;
  } else if (locale.fallback) {
    const fallbackTranslation = getTranslation(locale.fallback, category, key);

    if (fallbackTranslation) {
      str = fallbackTranslation;
    }
  } else {
    const fallbackTranslationSet = enUS[category] as TranslationSet<T>;
    str = fallbackTranslationSet[key];
  }

  if (replacements) {
    str = str?.replace(/{(\w+)}/g, (match, p1) => replacements[p1] || match);
  }

  return str || "";
}
