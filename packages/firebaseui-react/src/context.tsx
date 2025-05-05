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

import { FirebaseUIConfiguration, type FirebaseUI } from "@firebase-ui/core";
import { useStore } from "@nanostores/react";
import { type PolicyProps, PolicyProvider } from "~/components/policies";
import { createContext } from "react";

export const FirebaseUIContext = createContext<FirebaseUIConfiguration>(
  {} as FirebaseUIConfiguration
);

export function FirebaseUIProvider({
  children,
  ui,
  policies,
}: {
  children: React.ReactNode;
  ui: FirebaseUI;
  policies?: PolicyProps;
}) {
  const value = useStore(ui);
  return (
    <FirebaseUIContext.Provider value={value}>
      <PolicyProvider policies={policies}>
        {children}
      </PolicyProvider>
    </FirebaseUIContext.Provider>
  );
}
