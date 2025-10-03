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
import { TwitterAuthProvider } from "firebase/auth";
import { useUI } from "~/hooks";
import { OAuthButton } from "./oauth-button";
import TwitterSvgLogo from "~/components/logos/twitter/Logo";
import { cn } from "~/utils/cn";

export type TwitterSignInButtonProps = {
  provider?: TwitterAuthProvider;
  themed?: boolean;
};

export function TwitterSignInButton({ provider, themed }: TwitterSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton provider={provider || new TwitterAuthProvider()} themed={themed}>
      <TwitterLogo />
      <span>{getTranslation(ui, "labels", "signInWithTwitter")}</span>
    </OAuthButton>
  );
}

export function TwitterLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return <TwitterSvgLogo className={cn("fui-provider__icon", className)} {...props} />;
}
