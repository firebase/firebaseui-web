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

import type { UserCredential } from "firebase/auth";
import { useNavigate } from "react-router";
import {
  AppleSignInButton,
  FacebookSignInButton,
  GitHubSignInButton,
  GoogleSignInButton,
  MicrosoftSignInButton,
  TwitterSignInButton,
  YahooSignInButton,
} from "@firebase-oss/ui-react";
import { PROVIDER_HINT_STORAGE_KEY, type StoredProviderHint } from "./sign-in-with-provider-tracking";

function getStoredHint(): StoredProviderHint | null {
  try {
    const raw = localStorage.getItem(PROVIDER_HINT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredProviderHint) : null;
  } catch {
    return null;
  }
}

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  "google.com": "Google",
  "apple.com": "Apple",
  "facebook.com": "Facebook",
  "github.com": "GitHub",
  "microsoft.com": "Microsoft",
  "twitter.com": "Twitter / X",
  "yahoo.com": "Yahoo",
};

function ProviderButton({
  providerId,
  onSignIn,
}: {
  providerId: string;
  onSignIn: (credential: UserCredential) => void;
}) {
  switch (providerId) {
    case "google.com":
      return <GoogleSignInButton onSignIn={onSignIn} />;
    case "apple.com":
      return <AppleSignInButton onSignIn={onSignIn} />;
    case "facebook.com":
      return <FacebookSignInButton onSignIn={onSignIn} />;
    case "github.com":
      return <GitHubSignInButton onSignIn={onSignIn} />;
    case "microsoft.com":
      return <MicrosoftSignInButton onSignIn={onSignIn} />;
    case "twitter.com":
      return <TwitterSignInButton onSignIn={onSignIn} />;
    case "yahoo.com":
      return <YahooSignInButton onSignIn={onSignIn} />;
    default:
      return null;
  }
}

export default function ProviderHintPage() {
  const navigate = useNavigate();
  const hint = getStoredHint();

  function handleSignIn() {
    navigate("/");
  }

  if (!hint || hint.providers.length === 0) {
    return (
      <div className="max-w-sm mx-auto space-y-4 text-center pt-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">No provider hint found. Please sign in normally.</p>
        <button
          className="text-sm underline text-gray-600 dark:text-gray-300"
          onClick={() => navigate("/screens/sign-in-with-provider-tracking")}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  const providerNames = hint.providers.map((id) => PROVIDER_DISPLAY_NAMES[id] ?? id).join(" or ");

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-4 space-y-2">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Looks like you previously signed in with {providerNames}.
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Use the button below to sign in with the provider you used before.
        </p>
      </div>

      <div className="space-y-2">
        {hint.providers.map((providerId) => (
          <ProviderButton key={providerId} providerId={providerId} onSignIn={handleSignIn} />
        ))}
      </div>

      <button
        className="text-sm underline w-full text-center text-gray-500 dark:text-gray-400"
        onClick={() => navigate("/screens/sign-in-with-provider-tracking")}
      >
        Back to sign in
      </button>
    </div>
  );
}
