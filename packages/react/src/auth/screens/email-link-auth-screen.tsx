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
import { getTranslation } from "@firebase-ui/core";
import { Divider } from "~/components/divider";
import { useUI } from "~/hooks";
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "../../components/card";
import { EmailLinkAuthForm, type EmailLinkAuthFormProps } from "../forms/email-link-auth-form";

export type EmailLinkAuthScreenProps = PropsWithChildren<EmailLinkAuthFormProps>;

export function EmailLinkAuthScreen({ children, onEmailSent }: EmailLinkAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

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
              <div className="fui-screen__children">{children}</div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
