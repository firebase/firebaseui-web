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

import { type ApplicationConfig, provideZoneChangeDetection, isDevMode } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";

import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { provideAuth, getAuth, connectAuthEmulator } from "@angular/fire/auth";
import { provideFirebaseUI, provideFirebaseUIPolicies } from "@firebase-oss/ui-angular";
import {
  autoAnonymousLogin,
  autoUpgradeAnonymousUsers,
  initializeUI,
  providerRedirectStrategy,
} from "@firebase-oss/ui-core";
import type { FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCvMftIUCD9lUQ3BzIrimfSfBbCUQYZf-I",
  authDomain: "fir-ui-rework.firebaseapp.com",
  projectId: "fir-ui-rework",
  storageBucket: "fir-ui-rework.firebasestorage.app",
  messagingSenderId: "200312857118",
  appId: "1:200312857118:web:94e3f69b0e0a4a863f040f",
};

function initializeExampleUI(app: FirebaseApp) {
  const e2eAnonymousUpgradeScenario =
    isDevMode() && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("e2eAnonymousUpgrade")
      : null;

  const behaviors = e2eAnonymousUpgradeScenario
    ? [
        autoAnonymousLogin(),
        autoUpgradeAnonymousUsers({
          onUpgrade: (_ui, oldUserId, credential) => {
            window.localStorage.setItem(
              "firebaseui:e2e:upgrade-result",
              JSON.stringify({ oldUserId, newUserId: credential.user.uid })
            );
          },
          onUpgradeFailure: ({ oldUserId, error, credential }) => {
            const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
            window.localStorage.setItem(
              "firebaseui:e2e:upgrade-failure",
              JSON.stringify({ oldUserId, code, kind: credential ? "credential" : "provider" })
            );

            return e2eAnonymousUpgradeScenario === "handled" ? "handled" : undefined;
          },
        }),
        ...(e2eAnonymousUpgradeScenario === "redirect" ? [providerRedirectStrategy()] : []),
      ]
    : [];

  const ui = initializeUI({ app, behaviors });

  if (e2eAnonymousUpgradeScenario) {
    ui.get().auth.onAuthStateChanged((user) => {
      if (user?.isAnonymous) {
        window.localStorage.setItem("firebaseui:e2e:anonymous-user-id", user.uid);
      }
    });
  }

  return ui;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      if (isDevMode()) {
        /** Enable emulators in development */
        connectAuthEmulator(auth, "http://localhost:9099");
      }
      return auth;
    }),
    provideFirebaseUI((apps) => initializeExampleUI(apps[0])),
    provideFirebaseUIPolicies(() => ({
      termsOfServiceUrl: "https://www.google.com",
      privacyPolicyUrl: "https://www.google.com",
    })),
  ],
};
