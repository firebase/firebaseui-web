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

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { enUs } from "@invertase/firebaseui-translations";
import { Behavior, FirebaseUI, FirebaseUIOptions, FirebaseUIStore, initializeUI } from "@invertase/firebaseui-core";
import { FirebaseUIProvider } from "../src/context";
import { vi } from "vitest";

export function createMockUI(overrides?: Partial<FirebaseUIOptions>): FirebaseUIStore {
  const defaultAuth = {
    onAuthStateChanged: vi.fn(() => vi.fn()),
  } as unknown as Auth;

  const { auth, ...restOverrides } = overrides || {};

  return initializeUI({
    app: {} as FirebaseApp,
    auth: auth ?? defaultAuth,
    locale: enUs,
    behaviors: [] as Behavior[],
    ...restOverrides,
  });
}

export const createFirebaseUIProvider = ({ children, ui }: { children: React.ReactNode; ui: FirebaseUIStore }) => (
  <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>
);

export function CreateFirebaseUIProvider({ children, ui }: { children: React.ReactNode; ui: FirebaseUIStore }) {
  return <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>;
}
