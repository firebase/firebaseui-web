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

import { GoogleAuthProvider } from "firebase/auth";
import type { IdConfiguration } from "google-one-tap";
import type { FirebaseUI } from "~/config";
import { signInWithCredential } from "~/auth";

export type OneTapSignInOptions = {
  clientId: IdConfiguration["client_id"];
  autoSelect?: IdConfiguration["auto_select"];
  cancelOnTapOutside?: IdConfiguration["cancel_on_tap_outside"];
  context?: IdConfiguration["context"];
  uxMode?: IdConfiguration["ux_mode"];
  logLevel?: IdConfiguration["log_level"];
};

export const oneTapSignInHandler = async (ui: FirebaseUI, options: OneTapSignInOptions) => {
  // Only show one-tap if user is not signed in OR if they are anonymous.
  // Don't show if user is already signed in with a real account.
  if (ui.auth.currentUser && !ui.auth.currentUser.isAnonymous) {
    return;
  }

  // Prevent multiple instances of the script from being loaded, e.g. hot reload.
  if (document.querySelector("script[data-one-tap-sign-in]")) {
    return;
  }

  const script = document.createElement("script");
  script.setAttribute("data-one-tap-sign-in", "true");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;

  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: options.clientId,
      auto_select: options.autoSelect,
      cancel_on_tap_outside: options.cancelOnTapOutside,
      context: options.context,
      ux_mode: options.uxMode,
      log_level: options.logLevel,
      callback: async (response) => {
        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(ui, credential);
      },
    });

    window.google.accounts.id.prompt();
  };

  document.body.appendChild(script);
};
