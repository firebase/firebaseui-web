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

import {
  type AuthProvider,
  linkWithPopup,
  linkWithRedirect,
  signInWithPopup,
  signInWithRedirect,
  type User,
  type UserCredential,
} from "firebase/auth";
import { type FirebaseUI } from "~/config";

export type ProviderSignInStrategyHandler = (ui: FirebaseUI, provider: AuthProvider) => Promise<never | UserCredential>;
export type ProviderLinkStrategyHandler = (
  ui: FirebaseUI,
  user: User,
  provider: AuthProvider
) => Promise<never | UserCredential>;

export const signInWithRediectHandler: ProviderSignInStrategyHandler = async (ui, provider) => {
  return signInWithRedirect(ui.auth, provider);
};

export const signInWithPopupHandler: ProviderSignInStrategyHandler = async (ui, provider) => {
  return signInWithPopup(ui.auth, provider);
};

export const linkWithRedirectHandler: ProviderLinkStrategyHandler = async (_ui, user, provider) => {
  return linkWithRedirect(user, provider);
};

export const linkWithPopupHandler: ProviderLinkStrategyHandler = async (_ui, user, provider) => {
  return linkWithPopup(user, provider);
};
