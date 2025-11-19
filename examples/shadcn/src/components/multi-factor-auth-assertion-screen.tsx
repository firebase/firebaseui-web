"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type MultiFactorAuthAssertionScreenProps } from "@firebase-oss/ui-react";

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
