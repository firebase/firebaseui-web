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

import { RecaptchaVerifier } from "firebase/auth";
import { type FirebaseUI } from "~/config";

export type RecaptchaVerificationOptions = {
  size?: "normal" | "invisible" | "compact";
  theme?: "light" | "dark";
  tabindex?: number;
};

export const recaptchaVerificationHandler = (
  ui: FirebaseUI,
  element: HTMLElement,
  options?: RecaptchaVerificationOptions
) => {
  return new RecaptchaVerifier(ui.auth, element, {
    size: options?.size ?? "invisible",
    theme: options?.theme ?? "light",
    tabindex: options?.tabindex ?? 0,
  });
};
