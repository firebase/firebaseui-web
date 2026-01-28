/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { AppleSignInButton } from "@/components/apple-sign-in-button";
import { EmailLinkAuthScreen } from "@/components/email-link-auth-screen";
import { FacebookSignInButton } from "@/components/facebook-sign-in-button";
import { GitHubSignInButton } from "@/components/github-sign-in-button";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { MicrosoftSignInButton } from "@/components/microsoft-sign-in-button";
import { TwitterSignInButton } from "@/components/twitter-sign-in-button";
import { YahooSignInButton } from "@/components/yahoo-sign-in-button";
import { useNavigate } from "react-router";

export default function EmailLinkAuthScreenWithOAuthPage() {
  const navigate = useNavigate();

  return (
    <EmailLinkAuthScreen
      onSignIn={() => {
        navigate("/");
      }}
    >
      <GoogleSignInButton />
      <FacebookSignInButton />
      <AppleSignInButton />
      <GitHubSignInButton />
      <MicrosoftSignInButton />
      <TwitterSignInButton />
      <YahooSignInButton />
    </EmailLinkAuthScreen>
  );
}
