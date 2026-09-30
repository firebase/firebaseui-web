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

import { createContext, useContext, useState, type ReactNode } from "react";

export const BASE = "/full-customization";

export const paths = {
  email: BASE,
  login: `${BASE}/login`,
  signUp: `${BASE}/sign-up`,
  phone: `${BASE}/phone`,
  account: `${BASE}/account`,
  twoFactor: `${BASE}/account/two-factor`,
} as const;

type DemoState = {
  /** The address typed on the first screen, carried into the login and sign up steps. */
  email: string;
  setEmail: (email: string) => void;
  /** Why opening an emailed sign-in link failed, shown on the login screen. */
  linkError: string | null;
};

const DemoContext = createContext<DemoState | null>(null);

export function DemoProvider({ children, linkError }: { children: ReactNode; linkError: string | null }) {
  const [email, setEmail] = useState("");
  return <DemoContext.Provider value={{ email, setEmail, linkError }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const state = useContext(DemoContext);
  if (!state) throw new Error("useDemo must be used inside DemoProvider");
  return state;
}
