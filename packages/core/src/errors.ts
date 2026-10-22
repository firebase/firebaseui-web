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

import { ERROR_CODE_MAP, type ErrorCode, type ErrorCodeKey } from "@firebase-oss/ui-translations";
import { FirebaseError } from "firebase/app";
import { type AuthCredential, getMultiFactorResolver, type MultiFactorError } from "firebase/auth";
import { type FirebaseUI } from "./config";
import { getBehavior, hasBehavior } from "./behaviors";
import {
  isLegacySignInRecoveryErrorCode,
  PENDING_CREDENTIAL_STORAGE_KEY,
} from "./behaviors/legacy-fetch-sign-in-with-email";
import { getTranslation } from "./translations";

/**
 * A custom error class that extends FirebaseError and provides a translated error message based on the configured locale.
 */
export class FirebaseUIError extends FirebaseError {
  /** The original Firebase error, with its untranslated message. */
  declare readonly cause: FirebaseError;

  constructor(ui: FirebaseUI, error: FirebaseError) {
    // A translation keyed by the error code itself wins over the named key.
    const message =
      getTranslation(ui, "errors", error.code as ErrorCodeKey) ||
      getTranslation(ui, "errors", ERROR_CODE_MAP[error.code as ErrorCode]);
    super(error.code, message || error.message);
    this.cause = error;

    // Ensures that `instanceof FirebaseUIError` works, alongside `instanceof FirebaseError`
    Object.setPrototypeOf(this, FirebaseUIError.prototype);
  }
}

// Codes caused by app or project misconfiguration rather than the user, which are logged for the developer.
const CONFIGURATION_ERROR_CODES = [
  "auth/admin-restricted-operation",
  "auth/api-key-expired",
  "auth/app-not-authorized",
  "auth/auth-domain-config-required",
  "auth/internal-error",
  "auth/invalid-api-key",
  "auth/invalid-app-credential",
  "auth/invalid-app-id",
  "auth/invalid-continue-uri",
  "auth/invalid-dynamic-link-domain",
  "auth/invalid-hosting-link-domain",
  "auth/invalid-oauth-client-id",
  "auth/invalid-oauth-provider",
  "auth/invalid-tenant-id",
  "auth/missing-android-pkg-name",
  "auth/missing-continue-uri",
  "auth/missing-ios-bundle-id",
  "auth/operation-not-allowed",
  "auth/operation-not-supported-in-this-environment",
  "auth/recaptcha-not-enabled",
  "auth/tenant-id-mismatch",
  "auth/unauthorized-continue-uri",
  "auth/unauthorized-domain",
  "auth/unsupported-tenant-operation",
];

/**
 * Handles a Firebase error and throws a FirebaseUIError if it is a Firebase error.
 *
 * Addtionally, handles the following error codes:
 * - auth/account-exists-with-different-credential - stores the credential in sessionStorage.
 * - auth/multi-factor-auth-required - updates the UI instance with the multi-factor resolver.
 *
 * @param ui - The FirebaseUI instance.
 * @param error - The error to handle.
 * @returns {Promise<never>} A never type wrapped in a promise.
 */
export async function handleFirebaseError(ui: FirebaseUI, error: unknown): Promise<never> {
  // If it's not a Firebase error, then we just throw it and preserve the original error.
  if (!isFirebaseError(error)) {
    throw error;
  }

  if (isLegacySignInRecoveryErrorCode(error.code)) {
    if (hasBehavior(ui, "legacyFetchSignInWithEmail")) {
      await getBehavior(ui, "legacyFetchSignInWithEmail")(ui, error);
    } else if (error.code === "auth/account-exists-with-different-credential" && errorContainsCredential(error)) {
      // Note: the credential is stored via `toJSON()`; it must be rehydrated (see handlePendingCredential in auth.ts) before being passed to linkWithCredential.
      window.sessionStorage.setItem(PENDING_CREDENTIAL_STORAGE_KEY, JSON.stringify(error.credential.toJSON()));
    }
  }

  // Update the UI with the multi-factor resolver if the error is thrown.
  if (error.code === "auth/multi-factor-auth-required") {
    const resolver = getMultiFactorResolver(ui.auth, error as MultiFactorError);
    ui.setMultiFactorResolver(resolver);
  }

  // A translated message would otherwise hide the cause of a configuration issue from the developer.
  if (CONFIGURATION_ERROR_CODES.includes(error.code)) {
    console.warn(`[FirebaseUI] Firebase configuration error (${error.code}): ${error.message}`);
  }

  throw new FirebaseUIError(ui, error);
}

// Utility to obtain whether something is a FirebaseError
function isFirebaseError(error: unknown): error is FirebaseError {
  // Calling instanceof FirebaseError is not working - not sure why yet.
  return !!error && typeof error === "object" && "code" in error && "message" in error;
}

// Utility to obtain whether something is a FirebaseError that contains a credential - doesn't seemed to be typed?
function errorContainsCredential(error: FirebaseError): error is FirebaseError & { credential: AuthCredential } {
  return "credential" in error;
}
