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

import { Injectable, signal } from "@angular/core";
import type { User } from "firebase/auth";

export const BASE = "/full-customization";

export const paths = {
  email: BASE,
  login: `${BASE}/login`,
  signUp: `${BASE}/sign-up`,
  phone: `${BASE}/phone`,
  // Separate screens in the Professional theme; the other themes do both inline on the login step.
  resetPassword: `${BASE}/reset-password`,
  emailLink: `${BASE}/email-link`,
  account: `${BASE}/account`,
  twoFactor: `${BASE}/account/two-factor`,
} as const;

export const themes = [
  { id: "doggo", label: "Doggo" },
  { id: "spark", label: "Coffee Spark" },
  { id: "grid", label: "Grid" },
  { id: "professional", label: "Professional" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

const STORAGE_KEY = "firebaseui:full-customization:theme";

function readStoredTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return themes.some((theme) => theme.id === stored) ? (stored as ThemeId) : "doggo";
  } catch {
    return "doggo";
  }
}

/** State shared by the demo screens, provided by the demo root so it resets when the demo is left. */
@Injectable()
export class DemoState {
  /** The address typed on the first screen, carried into the login and sign up steps. */
  readonly email = signal("");
  /** Why opening an emailed sign-in link failed, shown on the login screen. */
  readonly linkError = signal<string | null>(null);
  readonly theme = signal<ThemeId>(readStoredTheme());
  /**
   * The signed-in user. reload() and profile updates mutate the user object in place, so equality
   * is off: setting the same object again still notifies the screens that read it.
   */
  readonly user = signal<User | null>(null, { equal: () => false });

  setTheme(next: ThemeId) {
    this.theme.set(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode), the switch still works for this visit.
    }
  }

  /** Re-renders the screens after the current user changed in place. */
  refreshUser() {
    this.user.set(this.user());
  }
}

export function identifier(user: User) {
  return user.displayName || user.email || user.phoneNumber || "your account";
}
