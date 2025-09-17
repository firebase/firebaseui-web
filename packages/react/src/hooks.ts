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

import { useContext, useMemo } from "react";
import { FirebaseUIContext } from "./context";
import { createSignInAuthFormSchema } from "@firebase-ui/core";

/**
 * Get the UI configuration from the context.
 */
export function useUI() {
  const ui = useContext(FirebaseUIContext);

  if (!ui) {
    throw new Error("No FirebaseUI context found. Your application must be wrapped in a <FirebaseUIProvider> component.");
  }

  return ui;
}

export function useSignInAuthFormSchema() {
  const ui = useUI();
  return useMemo(() => createSignInAuthFormSchema(ui), [ui]);
}
