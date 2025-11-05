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

import { useState } from "react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { FacebookSignInButton } from "@/components/facebook-sign-in-button";
import { AppleSignInButton } from "@/components/apple-sign-in-button";
import { GitHubSignInButton } from "@/components/github-sign-in-button";
import { MicrosoftSignInButton } from "@/components/microsoft-sign-in-button";
import { TwitterSignInButton } from "@/components/twitter-sign-in-button";
import { OAuthScreen } from "@/components/oauth-screen";
import { useState } from "react";

export default function OAuthScreenPage() {
  const [themed, setThemed] = useState(false);

  return (
    <>
      <OAuthScreen>
        <GoogleSignInButton themed={themed ? "neutral" : undefined} />
        <FacebookSignInButton themed={themed} />
        <AppleSignInButton themed={themed} />
        <GitHubSignInButton themed={themed} />
        <MicrosoftSignInButton themed={themed} />
        <TwitterSignInButton themed={themed} />
      </OAuthScreen>
      <div className="flex items-center gap-2 max-w-sm mx-auto mt-12">
        <input type="checkbox" checked={themed} onChange={() => setThemed(!themed)} />
        <label htmlFor="remember-me">Themed buttons</label>
      </div>
    </>
  );
}
