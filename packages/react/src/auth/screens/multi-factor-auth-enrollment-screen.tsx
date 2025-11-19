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
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from "~/components/card";
import { useUI } from "~/hooks";
import {
  MultiFactorAuthEnrollmentForm,
  type MultiFactorAuthEnrollmentFormProps,
} from "../forms/multi-factor-auth-enrollment-form";

/** Props for the MultiFactorAuthEnrollmentScreen component. */
export type MultiFactorAuthEnrollmentScreenProps = MultiFactorAuthEnrollmentFormProps;

/**
 * A screen component for multi-factor authentication enrollment.
 *
 * Displays a card with the multi-factor enrollment form.
 *
 * @returns The multi-factor auth enrollment screen component.
 */
export function MultiFactorAuthEnrollmentScreen(props: MultiFactorAuthEnrollmentScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "multiFactorEnrollment");
  const subtitleText = getTranslation(ui, "prompts", "mfaEnrollmentPrompt");

  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardSubtitle>{subtitleText}</CardSubtitle>
        </CardHeader>
        <CardContent>
          <MultiFactorAuthEnrollmentForm {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
