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
} from "@firebase-oss/ui-react";
import { useNavigate } from "react-router";

export default function LegacyRecoveryDemoPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="max-w-sm mx-auto pt-10 text-sm text-gray-700 dark:text-gray-300 space-y-3">
        <p className="font-medium text-base text-black dark:text-white">Legacy recovery demo</p>
        <p>Use this screen to test wrong-provider recovery with both email/password and OAuth attempts.</p>
        <p>
          Suggested flow: create an account with Google first, sign out, then come back here and try the same email with
          with email/password or another provider like GitHub.
        </p>
      </div>

      <SignInAuthScreen
        onSignIn={() => {
          navigate("/");
        }}
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
    </div>
  );
}
