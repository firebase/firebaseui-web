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
import { FacebookAuthProvider, type UserCredential } from "firebase/auth";
import FacebookSvgLogo from "~/components/logos/facebook/Logo";
import { useUI } from "~/hooks";
import { cn } from "~/utils/cn";
import { OAuthButton } from "./oauth-button";

/** Props for the FacebookSignInButton component. */
export type FacebookSignInButtonProps = {
  /** Optional OAuth provider instance. Defaults to Facebook provider. */
  provider?: FacebookAuthProvider;
  /** Whether to apply themed styling. */
  themed?: boolean;
  /** Callback function called when sign-in is successful. */
  onSignIn?: (credential: UserCredential) => void;
};

/**
 * A button component for signing in with Facebook.
 *
 * @returns The Facebook sign-in button component.
 */
export function FacebookSignInButton({ provider, ...props }: FacebookSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new FacebookAuthProvider()}>
      <FacebookLogo />
      <span>{getTranslation(ui, "labels", "signInWithFacebook")}</span>
    </OAuthButton>
  );
}

/**
 * The Facebook logo SVG component.
 *
 * @returns The Facebook logo component.
 */
export function FacebookLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return <FacebookSvgLogo className={cn("fui-provider__icon", className)} {...props} />;
}
