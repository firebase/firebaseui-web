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
import { OAuthProvider, type UserCredential } from "firebase/auth";
import MicrosoftSvgLogo from "~/components/logos/microsoft/Logo";
import { useUI } from "~/hooks";
import { cn } from "~/utils/cn";
import { OAuthButton } from "./oauth-button";

/** Props for the MicrosoftSignInButton component. */
export type MicrosoftSignInButtonProps = {
  /** Optional OAuth provider instance. Defaults to Microsoft provider. */
  provider?: OAuthProvider;
  /** Whether to apply themed styling. */
  themed?: boolean;
  /** Callback function called when sign-in is successful. */
  onSignIn?: (credential: UserCredential) => void;
};

/**
 * A button component for signing in with Microsoft.
 *
 * @returns The Microsoft sign-in button component.
 */
export function MicrosoftSignInButton({ provider, ...props }: MicrosoftSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new OAuthProvider("microsoft.com")}>
      <MicrosoftLogo />
      <span>{getTranslation(ui, "labels", "signInWithMicrosoft")}</span>
    </OAuthButton>
  );
}

/**
 * The Microsoft logo SVG component.
 *
 * @returns The Microsoft logo component.
 */
export function MicrosoftLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return <MicrosoftSvgLogo className={cn("fui-provider__icon", className)} {...props} />;
}
