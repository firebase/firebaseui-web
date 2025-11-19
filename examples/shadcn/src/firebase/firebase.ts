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

import { countryCodes, initializeUI, oneTapSignIn } from "@invertase/firebaseui-core";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { firebaseConfig } from "./config";

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(firebaseApp);

export const ui = initializeUI({
  app: firebaseApp,
  behaviors: [
    // autoAnonymousLogin(),
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
