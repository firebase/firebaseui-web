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

import { getTranslation } from "@firebase-oss/ui-core";
import type { User } from "firebase/auth";
import type { PropsWithChildren } from "react";
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "~/components/card";
import { Divider } from "~/components/divider";
import { RedirectError } from "~/components/redirect-error";
import { useOnUserAuthenticated, useUI } from "~/hooks";
import { EmailLinkAuthForm, type EmailLinkAuthFormProps } from "../forms/email-link-auth-form";
import { MultiFactorAuthAssertionScreen } from "./multi-factor-auth-assertion-screen";

/** Props for the EmailLinkAuthScreen component. */
export type EmailLinkAuthScreenProps = PropsWithChildren<
  Pick<EmailLinkAuthFormProps, "onEmailSent"> & {
    /** Callback function called when sign-in is successful. */
    onSignIn?: (user: User) => void;
  }
>;

/**
 * A screen component for email link authentication.
 *
 * Displays a card with the email link auth form and handles multi-factor authentication if required.
 *
 * @returns The email link auth screen component.
 */
export function EmailLinkAuthScreen({ children, onEmailSent, onSignIn }: EmailLinkAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");
  const mfaResolver = ui.multiFactorResolver;

  useOnUserAuthenticated(onSignIn);

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
          <EmailLinkAuthForm onEmailSent={onEmailSent} />
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
