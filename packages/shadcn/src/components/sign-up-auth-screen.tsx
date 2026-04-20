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
import { useUI, type SignUpAuthScreenProps, useOnUserAuthenticated } from "@firebase-oss/ui-react";
import { useCallback, useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignUpAuthForm } from "@/components/sign-up-auth-form";
import { MultiFactorAuthAssertionScreen } from "@/components/multi-factor-auth-assertion-screen";
import { type User } from "firebase/auth";

export type { SignUpAuthScreenProps };

export function SignUpAuthScreen({ children, onSignUp, ...props }: SignUpAuthScreenProps) {
  const ui = useUI();
  const handledUserIdRef = useRef<string | null>(null);

  const titleText = getTranslation(ui, "labels", "signUp");
  const subtitleText = getTranslation(ui, "prompts", "enterDetailsToCreate");

  const handleSignUp = useCallback(
    (user: User) => {
      if (handledUserIdRef.current === user.uid) {
        return;
      }

      handledUserIdRef.current = user.uid;
      onSignUp?.(user);
    },
    [onSignUp]
  );

  // Mirror the React package behavior: the built-in form reports success from the
  // resolved credential, while auth-state remains the fallback for child actions and MFA.
  useOnUserAuthenticated(children || ui.multiFactorResolver ? handleSignUp : undefined);

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
          <SignUpAuthForm
            {...props}
            onSignUp={(credential) => {
              handleSignUp(credential.user);
            }}
          />
          {children ? (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">{children}</div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
