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

/**
 * This screen demonstrates how to handle the scenario where a user previously signed in
 * with an OAuth provider (e.g. Google) but later attempts to sign in with email + password.
 *
 * Because `fetchSignInMethodsForEmail()` is deprecated in Firebase Auth, applications must
 * implement their own provider-tracking solution. This example uses localStorage to record
 * which OAuth provider a user signed in with, then redirects them to the correct provider
 * button when a credential error is detected.
 *
 * NOTE: localStorage is used here for demonstration purposes only.
 * In a production application, prefer storing this information server-side or in an
 * HttpOnly encrypted cookie so that provider metadata is not exposed to client-side scripts.
 */

import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  Auth,
  signInWithEmailAndPassword,
  type AuthError,
  type UserCredential,
} from "@angular/fire/auth";
import {
  AppleSignInButtonComponent,
  FacebookSignInButtonComponent,
  GitHubSignInButtonComponent,
  GoogleSignInButtonComponent,
  MicrosoftSignInButtonComponent,
  TwitterSignInButtonComponent,
  YahooSignInButtonComponent,
} from "@firebase-oss/ui-angular";

/** localStorage key used to persist the most recent sign-in provider hint. */
export const PROVIDER_HINT_STORAGE_KEY = "fui_provider_hint";

/** Shape of the data stored under PROVIDER_HINT_STORAGE_KEY. */
export interface StoredProviderHint {
  /** The email address associated with the known providers. */
  email: string;
  /** Firebase provider IDs (e.g. "google.com", "github.com") the user has signed in with. */
  providers: string[];
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function storeProvider(email: string, providerId: string): void {
  try {
    const normalized = normalizeEmail(email);
    const raw = localStorage.getItem(PROVIDER_HINT_STORAGE_KEY);
    const existing: StoredProviderHint = raw
      ? (JSON.parse(raw) as StoredProviderHint)
      : { email: "", providers: [] };

    const providers = existing.email === normalized ? [...existing.providers] : [];
    if (!providers.includes(providerId)) {
      providers.push(providerId);
    }
    localStorage.setItem(PROVIDER_HINT_STORAGE_KEY, JSON.stringify({ email: normalized, providers }));
  } catch {
    // Silently ignore storage errors.
  }
}

function getKnownProviders(email: string): string[] {
  try {
    const normalized = normalizeEmail(email);
    const raw = localStorage.getItem(PROVIDER_HINT_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as StoredProviderHint;
    return data.email === normalized ? data.providers : [];
  } catch {
    return [];
  }
}

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
      return "No account found with that email address.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    default:
      return "Incorrect email or password.";
  }
}

@Component({
  selector: "app-sign-in-with-provider-tracking",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GoogleSignInButtonComponent,
    AppleSignInButtonComponent,
    FacebookSignInButtonComponent,
    GitHubSignInButtonComponent,
    MicrosoftSignInButtonComponent,
    TwitterSignInButtonComponent,
    YahooSignInButtonComponent,
  ],
  template: `
    <div class="max-w-sm mx-auto space-y-6">
      <div
        class="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 p-4 space-y-1"
      >
        <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
          Demo
        </p>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          Sign in with an OAuth provider first, then sign out. Return here and try signing in with
          email + password to see the provider hint flow.
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="space-y-4">
        <div class="space-y-1">
          <label class="text-sm font-medium" for="tracking-email">Email address</label>
          <input
            id="tracking-email"
            type="email"
            formControlName="email"
            autocomplete="email"
            required
            class="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium" for="tracking-password">Password</label>
          <input
            id="tracking-password"
            type="password"
            formControlName="password"
            autocomplete="current-password"
            required
            class="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        @if (error()) {
          <p class="text-sm text-red-600 dark:text-red-400" role="alert">{{ error() }}</p>
        }

        <button
          type="submit"
          [disabled]="loading()"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          {{ loading() ? "Signing in…" : "Sign in" }}
        </button>
      </form>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="px-2 bg-white dark:bg-neutral-950 text-gray-500">or continue with</span>
        </div>
      </div>

      <div class="space-y-2">
        <fui-google-sign-in-button (signIn)="handleOAuthSignIn($event)" />
        <fui-facebook-sign-in-button (signIn)="handleOAuthSignIn($event)" />
        <fui-apple-sign-in-button (signIn)="handleOAuthSignIn($event)" />
        <fui-github-sign-in-button (signIn)="handleOAuthSignIn($event)" />
        <fui-microsoft-sign-in-button (signIn)="handleOAuthSignIn($event)" />
        <fui-twitter-sign-in-button (signIn)="handleOAuthSignIn($event)" />
        <fui-yahoo-sign-in-button (signIn)="handleOAuthSignIn($event)" />
      </div>
    </div>
  `,
  styles: [],
})
export class SignInWithProviderTrackingComponent {
  private router = inject(Router);
  private auth = inject(Auth);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  });

  error = signal<string | null>(null);
  loading = signal(false);

  async handleSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.error.set(null);
    this.loading.set(true);

    const { email, password } = this.form.value;

    try {
      await signInWithEmailAndPassword(this.auth, email!, password!);
      this.router.navigate(["/"]);
    } catch (err) {
      const authError = err as AuthError;

      // Firebase Auth uses different error codes across SDK versions and project configurations:
      //   auth/wrong-password        — Firebase Auth v9 legacy
      //   auth/invalid-credential    — Firebase Auth v10+ (email+password bad credentials)
      //   auth/invalid-login-credentials — some Identity Platform configurations
      //   auth/invalid-password      — used in some emulator / admin SDK contexts
      // All of these indicate bad credentials, so treat them the same.
      const isCredentialError =
        authError.code === "auth/wrong-password" ||
        authError.code === "auth/invalid-credential" ||
        authError.code === "auth/invalid-login-credentials" ||
        authError.code === "auth/invalid-password";

      if (isCredentialError) {
        const knownProviders = getKnownProviders(email!);
        if (knownProviders.length > 0) {
          this.router.navigate(["/screens/provider-hint"]);
          return;
        }
      }

      this.error.set(getErrorMessage(authError.code));
    } finally {
      this.loading.set(false);
    }
  }

  handleOAuthSignIn(credential: UserCredential): void {
    const email = credential.user.email ?? "";
    const providerId = credential.user.providerData[0]?.providerId ?? "";
    if (email && providerId) {
      storeProvider(email, providerId);
    }
    this.router.navigate(["/"]);
  }
}

export default SignInWithProviderTrackingComponent;
