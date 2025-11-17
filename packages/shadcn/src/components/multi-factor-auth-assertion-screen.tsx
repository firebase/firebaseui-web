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

import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type MultiFactorAuthAssertionScreenProps } from "@invertase/firebaseui-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiFactorAuthAssertionForm } from "@/components/multi-factor-auth-assertion-form";

export type MultiFactorAuthEnrollmentScreenProps = MultiFactorAuthAssertionScreenProps;

export function MultiFactorAuthAssertionScreen(props: MultiFactorAuthEnrollmentScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "multiFactorAssertion");
  const subtitleText = getTranslation(ui, "prompts", "mfaAssertionPrompt");

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <MultiFactorAuthAssertionForm {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
