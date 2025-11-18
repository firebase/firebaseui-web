"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type MultiFactorAuthEnrollmentFormProps } from "@firebase-oss/ui-react";

import { MultiFactorAuthEnrollmentForm } from "@/components/multi-factor-auth-enrollment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type MultiFactorAuthEnrollmentScreenProps = MultiFactorAuthEnrollmentFormProps;

export function MultiFactorAuthEnrollmentScreen(props: MultiFactorAuthEnrollmentScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "multiFactorEnrollment");
  const subtitleText = getTranslation(ui, "prompts", "mfaEnrollmentPrompt");

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <MultiFactorAuthEnrollmentForm {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
