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

import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./config";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { autoAnonymousLogin, initializeUI } from "@firebase-ui/core";
import { customLanguage, english } from "@firebase-ui/translations";

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(firebaseApp);

export const ui = initializeUI({
  app: firebaseApp,
  behaviors: [autoAnonymousLogin()],
  translations: [
    customLanguage(english.locale, {
      labels: {
        signIn: "Sign In",
      },
      prompts: {
        signInToAccount: "Sign in to your account",
      },
      errors: {
        invalidEmail: "Please enter a valid email address",
      },
    }),
  ],
});

connectAuthEmulator(auth, "http://localhost:9099");
