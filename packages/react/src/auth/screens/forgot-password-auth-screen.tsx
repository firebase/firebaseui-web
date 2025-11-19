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
import { useUI } from "~/hooks";
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "../../components/card";
import { ForgotPasswordAuthForm, type ForgotPasswordAuthFormProps } from "../forms/forgot-password-auth-form";

/** Props for the ForgotPasswordAuthScreen component. */
export type ForgotPasswordAuthScreenProps = ForgotPasswordAuthFormProps;

/**
 * A screen component for requesting a password reset.
 *
 * Displays a card with the forgot password form.
 *
 * @returns The forgot password screen component.
 */
export function ForgotPasswordAuthScreen(props: ForgotPasswordAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "resetPassword");
  const subtitleText = getTranslation(ui, "prompts", "enterEmailToReset");

  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardSubtitle>{subtitleText}</CardSubtitle>
        </CardHeader>
        <CardContent>
          <ForgotPasswordAuthForm {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
