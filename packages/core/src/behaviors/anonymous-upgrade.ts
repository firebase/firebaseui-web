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

export const autoUpgradeAnonymousCredentialHandler = async (
  ui: FirebaseUI,
  credential: AuthCredential,
  onUpgrade?: OnUpgradeCallback
) => {
  const currentUser = ui.auth.currentUser;

  if (!currentUser?.isAnonymous) {
    return;
  }

  const oldUserId = currentUser.uid;

  const result = await linkWithCredential(currentUser, credential);

  if (onUpgrade) {
    await onUpgrade(ui, oldUserId, result);
  }

  return result;
};

export const autoUpgradeAnonymousProviderHandler = async (
  ui: FirebaseUI,
  provider: AuthProvider,
  onUpgrade?: OnUpgradeCallback
) => {
  const currentUser = ui.auth.currentUser;

  if (!currentUser?.isAnonymous) {
    return;
  }

  const oldUserId = currentUser.uid;

  window.localStorage.setItem("fbui:upgrade:oldUserId", oldUserId);

  const result = await getBehavior(ui, "providerLinkStrategy")(ui, currentUser, provider);

  // If we got here, the user has been linked via a popup, so we need to call the onUpgrade callback
  // and delete the oldUserId from localStorage.
  // If we didn't get here, they'll be redirected and we'll handle the result inside of the autoUpgradeAnonymousUserRedirectHandler.

  window.localStorage.removeItem("fbui:upgrade:oldUserId");

  if (onUpgrade) {
    await onUpgrade(ui, oldUserId, result);
  }

  return result;
};

export const autoUpgradeAnonymousUserRedirectHandler = async (
  ui: FirebaseUI,
  credential: UserCredential | null,
  onUpgrade?: OnUpgradeCallback
) => {
  const oldUserId = window.localStorage.getItem("fbui:upgrade:oldUserId");

  // Always clean up localStorage once we've retrieved the oldUserId
  if (oldUserId) {
    window.localStorage.removeItem("fbui:upgrade:oldUserId");
  }

  if (!onUpgrade || !oldUserId || !credential) {
    return;
  }

  await onUpgrade(ui, oldUserId, credential);
};
