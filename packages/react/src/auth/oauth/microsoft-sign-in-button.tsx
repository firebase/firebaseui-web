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

import { getTranslation } from "@firebase-ui/core";
import { OAuthProvider } from "firebase/auth";
import { useUI } from "~/hooks";
import { OAuthButton } from "./oauth-button";
import MicrosoftSvgLogo from "~/components/logos/microsoft/Logo";

export type MicrosoftSignInButtonProps = {
  provider?: OAuthProvider;
  themed?: boolean;
};

export function MicrosoftSignInButton({ provider, themed }: MicrosoftSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton provider={provider || new OAuthProvider("microsoft.com")} themed={themed}>
      <MicrosoftLogo />
      <span>{getTranslation(ui, "labels", "signInWithMicrosoft")}</span>
    </OAuthButton>
  );
}

export function MicrosoftLogo() {
  return <MicrosoftSvgLogo className="fui-provider__icon" />;
}
