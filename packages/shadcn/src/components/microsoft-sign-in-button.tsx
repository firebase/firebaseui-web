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

import { OAuthProvider } from "firebase/auth";
import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type MicrosoftSignInButtonProps, MicrosoftLogo } from "@invertase/firebaseui-react";

import { OAuthButton } from "@/components/oauth-button";

export type { MicrosoftSignInButtonProps };

export function MicrosoftSignInButton({ provider, ...props }: MicrosoftSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new OAuthProvider("microsoft.com")}>
      <MicrosoftLogo />
      <span>{getTranslation(ui, "labels", "signInWithMicrosoft")}</span>
    </OAuthButton>
  );
}
