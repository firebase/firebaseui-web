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

import { getTranslation } from "@invertase/firebaseui-core";
import { OAuthProvider, type UserCredential } from "firebase/auth";
import { useUI } from "~/hooks";
import { OAuthButton } from "./oauth-button";
import AppleSvgLogo from "~/components/logos/apple/Logo";
import { cn } from "~/utils/cn";

/** Props for the AppleSignInButton component. */
export type AppleSignInButtonProps = {
  /** Optional OAuth provider instance. Defaults to Apple provider. */
  provider?: OAuthProvider;
  /** Whether to apply themed styling. */
  themed?: boolean;
  /** Callback function called when sign-in is successful. */
  onSignIn?: (credential: UserCredential) => void;
};

/**
 * A button component for signing in with Apple.
 *
 * @returns The Apple sign-in button component.
 */
export function AppleSignInButton({ provider, ...props }: AppleSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new OAuthProvider("apple.com")}>
      <AppleLogo />
      <span>{getTranslation(ui, "labels", "signInWithApple")}</span>
    </OAuthButton>
  );
}

/**
 * The Apple logo SVG component.
 *
 * @returns The Apple logo component.
 */
export function AppleLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return <AppleSvgLogo className={cn("fui-provider__icon", className)} {...props} />;
}
