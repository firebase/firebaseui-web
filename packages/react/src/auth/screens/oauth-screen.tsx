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

import { getTranslation } from "@invertase/firebaseui-core";
import { type UserCredential } from "firebase/auth";
import { type PropsWithChildren } from "react";
import { useUI } from "~/hooks";
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "~/components/card";
import { Policies } from "~/components/policies";
import { MultiFactorAuthAssertionScreen } from "./multi-factor-auth-assertion-screen";
import { RedirectError } from "~/components/redirect-error";

export type OAuthScreenProps = PropsWithChildren<{
  onSignIn?: (credential: UserCredential) => void;
}>;

export function OAuthScreen({ children, onSignIn }: OAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");
  const mfaResolver = ui.multiFactorResolver;

  if (mfaResolver) {
    return <MultiFactorAuthAssertionScreen onSuccess={onSignIn} />;
  }

  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardSubtitle>{subtitleText}</CardSubtitle>
        </CardHeader>
        <CardContent className="fui-screen__children">
          {children}
          <RedirectError />
          <Policies />
        </CardContent>
      </Card>
    </div>
  );
}
