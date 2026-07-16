/**
 * Copyright 2026 Google LLC
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

import {
  AppleSignInButton,
  FacebookSignInButton,
  GitHubSignInButton,
  GoogleSignInButton,
  MicrosoftSignInButton,
  SignInAuthScreen,
  TwitterSignInButton,
  YahooSignInButton,
  useLegacySignInRecovery,
} from "@firebase-oss/ui-react";
import { useNavigate, useSearchParams } from "react-router";

/**
 * A minimal custom recovery UI, used by the `?legacyRecovery=handled` e2e scenario to prove that
 * apps can suppress the default `<LegacySignInRecovery />` modal (via `showLegacySignInRecovery={false}`)
 * and build their own UI on top of `useLegacySignInRecovery()`.
 */
function CustomLegacyRecovery() {
  const { recovery, clearRecovery } = useLegacySignInRecovery();

  if (!recovery) {
    return null;
  }

  return (
    <div data-testid="custom-legacy-recovery" className="max-w-sm mx-auto mt-4 text-sm border rounded-md p-4 space-y-2">
      <p className="font-medium">Custom recovery UI</p>
      <p>
        Previous sign-in methods for <span data-testid="custom-legacy-recovery-email">{recovery.email}</span>:{" "}
        <span data-testid="custom-legacy-recovery-methods">{recovery.signInMethods.join(", ")}</span>
      </p>
      <button type="button" onClick={clearRecovery} className="underline">
        Custom dismiss
      </button>
    </div>
  );
}

export default function LegacyRecoveryDemoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // e2e scenario switch: "handled" suppresses the default recovery modal in favor of the custom
  // UI above, proving apps can opt out of the built-in flow.
  const handled = searchParams.get("legacyRecovery") === "handled";

  return (
    <div className="space-y-6">
      <div className="max-w-sm mx-auto pt-10 text-sm text-gray-700 dark:text-gray-300 space-y-3">
        <p className="font-medium text-base text-black dark:text-white">Legacy recovery demo</p>
        <p>Use this screen to test wrong-provider recovery with both email/password and OAuth attempts.</p>
        <p>
          Suggested flow: create an account with Google first, sign out, then come back here and try the same email with
          email/password or another provider like GitHub.
        </p>
      </div>

      <SignInAuthScreen
        onSignIn={() => {
          navigate("/");
        }}
        showLegacySignInRecovery={!handled}
      >
        <div className="space-y-2">
          <GoogleSignInButton />
          <FacebookSignInButton />
          <AppleSignInButton />
          <GitHubSignInButton />
          <MicrosoftSignInButton />
          <TwitterSignInButton />
          <YahooSignInButton />
        </div>
      </SignInAuthScreen>

      {handled ? <CustomLegacyRecovery /> : null}
    </div>
  );
}
