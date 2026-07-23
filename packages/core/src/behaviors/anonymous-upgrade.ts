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

import { type AuthCredential, type AuthProvider, linkWithCredential, type UserCredential } from "firebase/auth";
import { type FirebaseUI } from "~/config";
import { getBehavior } from "~/behaviors";

export type OnUpgradeCallback = (ui: FirebaseUI, oldUserId: string, credential: UserCredential) => Promise<void> | void;
export type OnUpgradeFailureResult = "handled" | void;
export type OnUpgradeFailureContext = {
  ui: FirebaseUI;
  oldUserId: string;
  error: unknown;
  credential?: AuthCredential;
  provider?: AuthProvider;
};
export type OnUpgradeFailureCallback = (
  context: OnUpgradeFailureContext
) => Promise<OnUpgradeFailureResult> | OnUpgradeFailureResult;

async function handleUpgradeFailure(
  context: OnUpgradeFailureContext,
  onUpgradeFailure?: OnUpgradeFailureCallback
): Promise<boolean> {
  try {
    return (await onUpgradeFailure?.(context)) === "handled";
  } catch (callbackError) {
    if (callbackError instanceof Error && !("cause" in callbackError)) {
      (callbackError as Error & { cause?: unknown }).cause = context.error;
    }

    throw callbackError;
  }
}

// Best-effort extraction for errors like auth/credential-already-in-use, which carry the
// conflicting credential so callers can offer to link/merge it themselves.
function extractCredentialFromError(error: unknown): AuthCredential | undefined {
  if (error && typeof error === "object" && "credential" in error) {
    return (error as { credential?: AuthCredential }).credential;
  }

  return undefined;
}

export const autoUpgradeAnonymousCredentialHandler = async (
  ui: FirebaseUI,
  credential: AuthCredential,
  onUpgrade?: OnUpgradeCallback,
  onUpgradeFailure?: OnUpgradeFailureCallback
): Promise<UserCredential | void> => {
  const currentUser = ui.auth.currentUser;

  if (!currentUser?.isAnonymous) {
    return;
  }

  const oldUserId = currentUser.uid;

  let result: UserCredential;

  try {
    result = await linkWithCredential(currentUser, credential);
  } catch (error) {
    if (await handleUpgradeFailure({ ui, oldUserId, error, credential }, onUpgradeFailure)) {
      return;
    }

    throw error;
  }

  if (onUpgrade) {
    await onUpgrade(ui, oldUserId, result);
  }

  return result;
};

export const autoUpgradeAnonymousProviderHandler = async (
  ui: FirebaseUI,
  provider: AuthProvider,
  onUpgrade?: OnUpgradeCallback,
  onUpgradeFailure?: OnUpgradeFailureCallback
): Promise<UserCredential | void> => {
  const currentUser = ui.auth.currentUser;

  if (!currentUser?.isAnonymous) {
    return;
  }

  const oldUserId = currentUser.uid;

  window.localStorage.setItem("fbui:upgrade:oldUserId", oldUserId);

  let result: UserCredential | void;

  try {
    result = await getBehavior(ui, "providerLinkStrategy")(ui, currentUser, provider);
  } catch (error) {
    window.localStorage.removeItem("fbui:upgrade:oldUserId");

    if (await handleUpgradeFailure({ ui, oldUserId, error, provider }, onUpgradeFailure)) {
      return;
    }

    throw error;
  }

  // Redirect strategies complete later, so keep oldUserId for the redirect handler.
  if (!result) {
    return;
  }

  window.localStorage.removeItem("fbui:upgrade:oldUserId");

  if (onUpgrade) {
    await onUpgrade(ui, oldUserId, result);
  }

  return result;
};

export const autoUpgradeAnonymousUserRedirectHandler = async (
  ui: FirebaseUI,
  credential: UserCredential | null,
  onUpgrade?: OnUpgradeCallback,
  onUpgradeFailure?: OnUpgradeFailureCallback,
  error?: unknown
): Promise<OnUpgradeFailureResult> => {
  const oldUserId = window.localStorage.getItem("fbui:upgrade:oldUserId");

  // Always clean up localStorage once we've retrieved the oldUserId
  if (oldUserId) {
    window.localStorage.removeItem("fbui:upgrade:oldUserId");
  }

  // getRedirectResult() rejected. Only relevant if this redirect was for an anonymous upgrade;
  // otherwise defer to FirebaseUI's default redirect error handling.
  if (error !== undefined) {
    if (!oldUserId) {
      return;
    }

    const handled = await handleUpgradeFailure(
      { ui, oldUserId, error, credential: extractCredentialFromError(error) },
      onUpgradeFailure
    );

    return handled ? "handled" : undefined;
  }

  if (!onUpgrade || !oldUserId || !credential) {
    return;
  }

  await onUpgrade(ui, oldUserId, credential);
};
