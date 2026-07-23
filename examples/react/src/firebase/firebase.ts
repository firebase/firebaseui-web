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

"use client";

import {
  autoAnonymousLogin,
  autoUpgradeAnonymousUsers,
  countryCodes,
  initializeUI,
  oneTapSignIn,
  providerRedirectStrategy,
} from "@firebase-oss/ui-core";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

import { firebaseConfig } from "./config";

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(firebaseApp);

const e2eAnonymousUpgradeScenario = import.meta.env.DEV
  ? new URLSearchParams(window.location.search).get("e2eAnonymousUpgrade")
  : null;

const E2E_REDIRECT_SCENARIOS = ["redirect", "redirect-handled"];
const E2E_HANDLED_SCENARIOS = ["handled", "redirect-handled"];

function e2eAnonymousUpgradeBehaviors() {
  if (!e2eAnonymousUpgradeScenario) {
    return [];
  }

  return [
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

        return E2E_HANDLED_SCENARIOS.includes(e2eAnonymousUpgradeScenario as string) ? "handled" : undefined;
      },
    }),
    ...(E2E_REDIRECT_SCENARIOS.includes(e2eAnonymousUpgradeScenario as string) ? [providerRedirectStrategy()] : []),
  ];
}

export const ui = initializeUI({
  app: firebaseApp,
  behaviors: e2eAnonymousUpgradeScenario
    ? e2eAnonymousUpgradeBehaviors()
    : [
        oneTapSignIn({
          clientId: "616577669988-led6l3rqek9ckn9t1unj4l8l67070fhp.apps.googleusercontent.com",
        }),
        countryCodes({
          allowedCountries: ["US", "CA", "GB"],
          defaultCountry: "GB",
        }),
      ],
});

if (import.meta.env.MODE === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
}

if (e2eAnonymousUpgradeScenario) {
  auth.onAuthStateChanged((user) => {
    if (user?.isAnonymous) {
      window.localStorage.setItem("firebaseui:e2e:anonymous-user-id", user.uid);
    }
  });
}
