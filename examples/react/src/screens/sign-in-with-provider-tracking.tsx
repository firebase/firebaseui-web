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

"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { signInWithEmailAndPassword, type AuthError, type UserCredential } from "firebase/auth";
import {
  AppleSignInButton,
  FacebookSignInButton,
  GitHubSignInButton,
  GoogleSignInButton,
  MicrosoftSignInButton,
  TwitterSignInButton,
  YahooSignInButton,
} from "@firebase-oss/ui-react";
import { auth } from "../firebase/firebase";

/** localStorage key used to persist the most recent sign-in provider hint. */
export const PROVIDER_HINT_STORAGE_KEY = "fui_provider_hint";

/** Shape of the data stored under PROVIDER_HINT_STORAGE_KEY. */
export interface StoredProviderHint {
  /** The email address associated with the known providers. */
  email: string;
  /** Firebase provider IDs (e.g. "google.com", "github.com") the user has signed in with. */
  providers: string[];
}

function storeProvider(email: string, providerId: string): void {
  try {
    const raw = localStorage.getItem(PROVIDER_HINT_STORAGE_KEY);
    const existing: StoredProviderHint = raw
      ? (JSON.parse(raw) as StoredProviderHint)
      : { email: "", providers: [] };

    const providers = existing.email === email ? [...existing.providers] : [];
    if (!providers.includes(providerId)) {
      providers.push(providerId);
    }
    localStorage.setItem(PROVIDER_HINT_STORAGE_KEY, JSON.stringify({ email, providers }));
  } catch {
    // Silently ignore storage errors.
  }
}

function getKnownProviders(email: string): string[] {
  try {
    const raw = localStorage.getItem(PROVIDER_HINT_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as StoredProviderHint;
    return data.email === email ? data.providers : [];
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

export default function SignInWithProviderTrackingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      const authError = err as AuthError;

      // auth/wrong-password (Firebase Auth v9 legacy) and auth/invalid-credential (v10+)
      // both indicate bad credentials. Check if the user has a known OAuth provider for
      // this email and redirect them to the provider hint screen if so.
      const isCredentialError =
        authError.code === "auth/wrong-password" ||
        authError.code === "auth/invalid-credential" ||
        authError.code === "auth/invalid-password";

      if (isCredentialError) {
        const knownProviders = getKnownProviders(email);
        if (knownProviders.length > 0) {
          navigate("/screens/provider-hint");
          return;
        }
      }

      setError(getErrorMessage(authError.code));
    } finally {
      setLoading(false);
    }
  }

  function handleOAuthSignIn(credential: UserCredential): void {
    const userEmail = credential.user.email ?? "";
    const providerId = credential.user.providerData[0]?.providerId ?? "";
    if (userEmail && providerId) {
      storeProvider(userEmail, providerId);
    }
    navigate("/");
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 p-4 space-y-1">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
          Demo
        </p>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Sign in with an OAuth provider first, then sign out. Return here and try
          signing in with email + password to see the provider hint flow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="tracking-email">
            Email address
          </label>
          <input
            id="tracking-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="tracking-password">
            Password
          </label>
          <input
            id="tracking-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white dark:bg-[--fui-bg] text-gray-500">or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        <GoogleSignInButton onSignIn={handleOAuthSignIn} />
        <FacebookSignInButton onSignIn={handleOAuthSignIn} />
        <AppleSignInButton onSignIn={handleOAuthSignIn} />
        <GitHubSignInButton onSignIn={handleOAuthSignIn} />
        <MicrosoftSignInButton onSignIn={handleOAuthSignIn} />
        <TwitterSignInButton onSignIn={handleOAuthSignIn} />
        <YahooSignInButton onSignIn={handleOAuthSignIn} />
      </div>
    </div>
  );
}
