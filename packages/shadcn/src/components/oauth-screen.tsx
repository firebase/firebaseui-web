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
import { type User } from "firebase/auth";
import { type PropsWithChildren } from "react";
import { useUI, useOnUserAuthenticated } from "@firebase-oss/ui-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Policies } from "@/components/policies";
import { MultiFactorAuthAssertionScreen } from "@/components/multi-factor-auth-assertion-screen";
import { RedirectError } from "@/components/redirect-error";

export type OAuthScreenProps = PropsWithChildren<{
  onSignIn?: (user: User) => void;
}>;

export function OAuthScreen({ children, onSignIn }: OAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

  useOnUserAuthenticated(onSignIn);

  if (ui.multiFactorResolver) {
    return <MultiFactorAuthAssertionScreen />;
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">{children}</div>
          <div className="mt-4 space-y-4">
            <RedirectError />
            <Policies />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
