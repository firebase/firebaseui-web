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
import { getAuth } from "firebase/auth";
import { FirebaseUIContext } from "./context";
import { FirebaseUIConfiguration } from "@firebase-ui/core";

/**
 * Get the UI configuration from the context.
 */
export function useUI() {
  return useContext(FirebaseUIContext);
}

/**
 * Get the auth instance from the UI configuration.
 * If no UI configuration is provided, use the auth instance from the context.
 */
export function useAuth(ui?: FirebaseUIConfiguration | undefined) {
  const config = ui ?? useUI();
  const auth = useMemo(
    () => ui?.getAuth() ?? getAuth(config.app),
    [config.app],
  );
  return auth;
}
