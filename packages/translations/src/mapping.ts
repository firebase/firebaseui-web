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
import { RegisteredLocale } from ".";
import type { ErrorKey, TranslationCategory, TranslationKey, TranslationSet } from "./types";

export const ERROR_CODE_MAP = {
  "auth/user-not-found": "userNotFound",
  "auth/wrong-password": "wrongPassword",
  "auth/invalid-email": "invalidEmail",
  "auth/user-disabled": "userDisabled",
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
} satisfies Record<string, ErrorKey>;

export type ErrorCode = keyof typeof ERROR_CODE_MAP;

export function getTranslation<T extends TranslationCategory>(
  locale: RegisteredLocale,
  category: T,
  key: TranslationKey<T>
): string {
  const userTranslationSet = locale.translations[category] as TranslationSet<T> | undefined;
  const translatedString = userTranslationSet?.[key];

  if (translatedString) {
    return translatedString;
  }

  // Check fallback locale if it exists
  if (locale.fallback) {
    const fallbackTranslation = getTranslation(locale.fallback, category, key);

    if (fallbackTranslation) {
      return fallbackTranslation;
    }
  }

  // Fall back to English translations
  const fallbackTranslationSet = enUS[category] as TranslationSet<T>;
  return fallbackTranslationSet[key];
}
