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
import { GoogleAuthProvider, type UserCredential } from "firebase/auth";
import GoogleSvgLogo from "~/components/logos/google/Logo";
import { useUI } from "~/hooks";
import { cn } from "~/utils/cn";
import { OAuthButton } from "./oauth-button";

/** Props for the GoogleSignInButton component. */
export type GoogleSignInButtonProps = {
  /** Optional OAuth provider instance. Defaults to Google provider. */
  provider?: GoogleAuthProvider;
  /** Whether to apply themed styling. Can be true, false, or "neutral". */
  themed?: boolean | "neutral";
  /** Callback function called when sign-in is successful. */
  onSignIn?: (credential: UserCredential) => void;
};

/**
 * A button component for signing in with Google.
 *
 * @returns The Google sign-in button component.
 */
export function GoogleSignInButton({ provider, ...props }: GoogleSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new GoogleAuthProvider()}>
      <GoogleLogo />
      <span>{getTranslation(ui, "labels", "signInWithGoogle")}</span>
    </OAuthButton>
  );
}

/**
 * The Google logo SVG component.
 *
 * @returns The Google logo component.
 */
export function GoogleLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return <GoogleSvgLogo className={cn("fui-provider__icon", className)} {...props} />;
}
