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
import { fetchSignInMethodsForEmail, OAuthProvider } from "firebase/auth";
import type { Auth, AuthCredential } from "firebase/auth";
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

/** sessionStorage key used to persist a pending OAuth credential across a sign-in/relink flow. */
export const PENDING_CREDENTIAL_STORAGE_KEY = "pendingCred";

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
  return "credential" in error && error.credential != null;
}

function getEmailFromError(error: FirebaseError): string | undefined {
  const emailError = error as FirebaseErrorWithEmail;
  return emailError.customData?.email ?? emailError.email;
}

function getPendingCredential(error: FirebaseError): AuthCredential | undefined {
  if (error.code !== "auth/account-exists-with-different-credential") {
    return undefined;
  }

  if (errorContainsCredential(error)) {
    return error.credential;
  }

  try {
    return OAuthProvider.credentialFromError(error) ?? undefined;
  } catch {
    return undefined;
  }
}

function buildRecovery(
  error: FirebaseError,
  email: string,
  signInMethods: string[],
  pendingCredential?: AuthCredential
): LegacySignInRecovery {
  const pendingProviderId = pendingCredential?.providerId;
  const attemptedProviderId =
    pendingProviderId ?? (PASSWORD_ATTEMPT_ERROR_CODES.includes(error.code) ? "password" : undefined);

  return {
    email,
    signInMethods,
    attemptedProviderId,
    pendingProviderId,
  };
}

/**
 * Checks whether a recovery has at least one sign-in method that differs from the one the
 * user just attempted. Without this, the recovery UI would open with nothing useful to offer —
 * e.g. a password typo where `fetchSignInMethodsForEmail` returns `["password"]` (the SAME
 * method just tried), or an empty method list (e.g. Email Enumeration Protection).
 */
function hasActionableRecoveryMethod(recovery: LegacySignInRecovery): boolean {
  return recovery.signInMethods.some((method) => method !== recovery.attemptedProviderId);
}

/**
 * Persists a pending OAuth credential to `sessionStorage` so it can survive the
 * recovery flow (e.g. a password re-auth or a redirect) and be reapplied afterward.
 *
 * Security trade-off (accepted, pre-existing): the serialized credential (via
 * `credential.toJSON()`) may include OAuth access/ID tokens, and is stored in
 * **plaintext**. This is scoped to `sessionStorage`, so it is same-origin only and is
 * cleared automatically when the tab/session ends. It is also consumed and removed
 * immediately upon use in {@link handlePendingCredential} in `auth.ts`, minimizing the
 * exposure window.
 */
function persistPendingCredential(credential?: AuthCredential) {
  if (!credential) {
    return;
  }

  window.sessionStorage.setItem(PENDING_CREDENTIAL_STORAGE_KEY, JSON.stringify(credential.toJSON()));
}

/**
 * Tracks a monotonically increasing "generation" of legacy-sign-in-recovery state per `Auth`
 * instance. Bumped by `setLegacySignInRecovery`/`clearLegacySignInRecovery` (see `config.ts`)
 * on every state transition, regardless of who triggers it (this handler, a duplicate
 * in-flight call, or the user dismissing the recovery UI).
 *
 * This lets `legacyFetchSignInWithEmailHandler` detect that its own in-flight
 * `fetchSignInMethodsForEmail()` call has been superseded by a newer transition and bail
 * out without touching the store, closing a race where a slow/duplicate call could reopen a
 * dismissed recovery modal or clobber a newer, unrelated recovery attempt.
 *
 * Kept module-internal (keyed by `Auth` instance, rather than a `name`/store lookup) and not
 * exposed on the public `FirebaseUI` type: it's purely an implementation detail of this race
 * guard, not something consumers should read or depend on. `Auth` is used as the key because,
 * unlike `legacySignInRecovery` itself, it's a stable field on `FirebaseUI` that is never
 * replaced via `setKey`, so it reliably identifies "this UI instance" across snapshots.
 */
const legacySignInRecoveryGenerations = new WeakMap<Auth, number>();

function getLegacySignInRecoveryGeneration(auth: Auth): number {
  return legacySignInRecoveryGenerations.get(auth) ?? 0;
}

/** Called by `config.ts` whenever legacy sign-in recovery state changes. Not part of the public API. */
export function bumpLegacySignInRecoveryGeneration(auth: Auth): void {
  legacySignInRecoveryGenerations.set(auth, getLegacySignInRecoveryGeneration(auth) + 1);
}

export async function legacyFetchSignInWithEmailHandler(ui: FirebaseUI, error: FirebaseError): Promise<void> {
  const pendingCredential = getPendingCredential(error);
  persistPendingCredential(pendingCredential);

  const email = getEmailFromError(error);
  if (!email) {
    // No `await` has happened yet, so nothing could have superseded this call - the
    // generation check below is unnecessary here.
    ui.clearLegacySignInRecovery();
    return;
  }

  // Captured immediately before the only `await` in this function (rather than at the top
  // of the handler) since that's the sole point where this call can be superseded by another
  // state transition; capturing it earlier would be equivalent here (nothing async happens
  // beforehand) but ties the snapshot more precisely to the risk it's guarding against.
  const generation = getLegacySignInRecoveryGeneration(ui.auth);

  try {
    const signInMethods = await fetchSignInMethodsForEmail(ui.auth, email);
    if (getLegacySignInRecoveryGeneration(ui.auth) !== generation) {
      // Superseded while this fetch was in flight (e.g. a duplicate call resolved first, or
      // the user dismissed recovery). A newer transition already reflects the current state
      // more accurately than this call could, so bail out without touching the store.
      return;
    }

    const recovery = buildRecovery(error, email, signInMethods, pendingCredential);
    if (hasActionableRecoveryMethod(recovery)) {
      ui.setLegacySignInRecovery(recovery);
    } else {
      ui.clearLegacySignInRecovery();
    }
  } catch {
    if (getLegacySignInRecoveryGeneration(ui.auth) !== generation) {
      return;
    }
    ui.clearLegacySignInRecovery();
  }
}
