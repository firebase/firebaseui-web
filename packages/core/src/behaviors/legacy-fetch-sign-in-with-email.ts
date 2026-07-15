/**
 * Copyright 2026 Google LLC
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

import type { FirebaseError } from "firebase/app";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import type { AuthCredential } from "firebase/auth";
import type { LegacySignInRecovery, FirebaseUI } from "~/config";

type FirebaseErrorWithCredential = FirebaseError & { credential: AuthCredential };
type FirebaseErrorWithEmail = FirebaseError & {
  email?: string;
  customData?: {
    email?: string;
  };
};

/** Firebase Auth error codes that should trigger the `legacyFetchSignInWithEmail` recovery flow. */
export const LEGACY_SIGN_IN_RECOVERY_ERROR_CODES: readonly string[] = [
  "auth/account-exists-with-different-credential",
  "auth/wrong-password",
  "auth/invalid-credential",
  "auth/invalid-login-credentials",
];

/**
 * The subset of {@link LEGACY_SIGN_IN_RECOVERY_ERROR_CODES} that indicates a failed password
 * sign-in attempt, rather than an OAuth credential conflict.
 */
const PASSWORD_ATTEMPT_ERROR_CODES: readonly string[] = [
  "auth/wrong-password",
  "auth/invalid-credential",
  "auth/invalid-login-credentials",
];

/**
 * Checks whether a Firebase Auth error code should trigger the `legacyFetchSignInWithEmail` recovery flow.
 *
 * @param code - The Firebase Auth error code to check.
 * @returns True if the error code should trigger the recovery flow.
 */
export function isLegacySignInRecoveryErrorCode(code: string): boolean {
  return LEGACY_SIGN_IN_RECOVERY_ERROR_CODES.includes(code);
}

function errorContainsCredential(error: FirebaseError): error is FirebaseErrorWithCredential {
  return "credential" in error;
}

function getEmailFromError(error: FirebaseError): string | undefined {
  const emailError = error as FirebaseErrorWithEmail;
  return emailError.customData?.email ?? emailError.email;
}

function buildRecovery(error: FirebaseError, email: string, signInMethods: string[]): LegacySignInRecovery {
  const pendingProviderId = errorContainsCredential(error) ? error.credential.providerId : undefined;
  const attemptedProviderId =
    pendingProviderId ?? (PASSWORD_ATTEMPT_ERROR_CODES.includes(error.code) ? "password" : undefined);

  return {
    email,
    signInMethods,
    attemptedProviderId,
    pendingProviderId,
  };
}

function persistPendingCredential(error: FirebaseError) {
  if (!errorContainsCredential(error)) {
    return;
  }

  window.sessionStorage.setItem("pendingCred", JSON.stringify(error.credential.toJSON()));
}

export async function legacyFetchSignInWithEmailHandler(ui: FirebaseUI, error: FirebaseError): Promise<void> {
  persistPendingCredential(error);

  const email = getEmailFromError(error);
  if (!email) {
    ui.clearLegacySignInRecovery();
    return;
  }

  try {
    const signInMethods = await fetchSignInMethodsForEmail(ui.auth, email);
    ui.setLegacySignInRecovery(buildRecovery(error, email, signInMethods));
  } catch {
    ui.clearLegacySignInRecovery();
  }
}
