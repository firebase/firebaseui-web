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

"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useCallback } from "react";
import { AppleSignInButton } from "~/auth/oauth/apple-sign-in-button";
import { FacebookSignInButton } from "~/auth/oauth/facebook-sign-in-button";
import { GitHubSignInButton } from "~/auth/oauth/github-sign-in-button";
import { GoogleSignInButton } from "~/auth/oauth/google-sign-in-button";
import { MicrosoftSignInButton } from "~/auth/oauth/microsoft-sign-in-button";
import { TwitterSignInButton } from "~/auth/oauth/twitter-sign-in-button";
import { YahooSignInButton } from "~/auth/oauth/yahoo-sign-in-button";
import { useLegacySignInRecovery, useUI } from "~/hooks";
import { Button } from "./button";

function hasMethod(signInMethods: string[], method: string) {
  return signInMethods.includes(method);
}

/**
 * Displays default recovery UI for legacy sign-in method suggestions.
 *
 * Returns null if there is no recovery state.
 */
export function LegacySignInRecovery() {
  const ui = useUI();
  const { recovery, clearRecovery } = useLegacySignInRecovery();
  const handleRecoverySignIn = useCallback(() => {
    clearRecovery();
  }, [clearRecovery]);

  if (!recovery) {
    return null;
  }

  return (
    <div className="fui-legacy-sign-in-recovery">
      <p>{getTranslation(ui, "messages", "legacySignInRecoveryPrompt", { email: recovery.email })}</p>
      <p>{getTranslation(ui, "messages", "legacySignInRecoverySelectMethod")}</p>
      <div className="fui-screen__children">
        {hasMethod(recovery.signInMethods, "google.com") ? (
          <GoogleSignInButton onSignIn={handleRecoverySignIn} />
        ) : null}
        {hasMethod(recovery.signInMethods, "github.com") ? (
          <GitHubSignInButton onSignIn={handleRecoverySignIn} />
        ) : null}
        {hasMethod(recovery.signInMethods, "facebook.com") ? (
          <FacebookSignInButton onSignIn={handleRecoverySignIn} />
        ) : null}
        {hasMethod(recovery.signInMethods, "apple.com") ? <AppleSignInButton onSignIn={handleRecoverySignIn} /> : null}
        {hasMethod(recovery.signInMethods, "microsoft.com") ? (
          <MicrosoftSignInButton onSignIn={handleRecoverySignIn} />
        ) : null}
        {hasMethod(recovery.signInMethods, "twitter.com") ? (
          <TwitterSignInButton onSignIn={handleRecoverySignIn} />
        ) : null}
        {hasMethod(recovery.signInMethods, "yahoo.com") ? <YahooSignInButton onSignIn={handleRecoverySignIn} /> : null}
      </div>
      {hasMethod(recovery.signInMethods, "password") ? (
        <p>{getTranslation(ui, "messages", "legacySignInRecoveryEmailPassword")}</p>
      ) : null}
      {hasMethod(recovery.signInMethods, "emailLink") ? (
        <p>{getTranslation(ui, "messages", "legacySignInRecoveryEmailLink")}</p>
      ) : null}
      <Button type="button" variant="secondary" onClick={clearRecovery}>
        {getTranslation(ui, "labels", "dismiss")}
      </Button>
    </div>
  );
}
