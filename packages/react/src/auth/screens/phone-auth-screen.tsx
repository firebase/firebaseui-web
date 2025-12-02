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

import type { PropsWithChildren } from "react";
import { getTranslation } from "@firebase-oss/ui-core";
import { Divider } from "~/components/divider";
import { useOnUserAuthenticated, useUI } from "~/hooks";
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "~/components/card";
import { PhoneAuthForm } from "../forms/phone-auth-form";
import { MultiFactorAuthAssertionScreen } from "./multi-factor-auth-assertion-screen";
import { RedirectError } from "~/components/redirect-error";
import type { User } from "firebase/auth";

/** Props for the PhoneAuthScreen component. */
export type PhoneAuthScreenProps = PropsWithChildren<{
  /** Callback function called when sign-in is successful. */
  onSignIn?: (user: User) => void;
}>;

/**
 * A screen component for phone authentication.
 *
 * Displays a card with the phone auth form and handles multi-factor authentication if required.
 *
 * @returns The phone auth screen component.
 */
export function PhoneAuthScreen({ children, ...props }: PhoneAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");
  const mfaResolver = ui.multiFactorResolver;

  useOnUserAuthenticated(props.onSignIn);

  if (mfaResolver) {
    return <MultiFactorAuthAssertionScreen />;
  }

  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardSubtitle>{subtitleText}</CardSubtitle>
        </CardHeader>
        <CardContent>
          <PhoneAuthForm />
          {children ? (
            <>
              <Divider>{getTranslation(ui, "messages", "dividerOr")}</Divider>
              <div className="fui-screen__children">
                {children}
                <RedirectError />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
