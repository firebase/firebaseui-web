"use client";

import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type MultiFactorAuthEnrollmentFormProps } from "@invertase/firebaseui-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiFactorAuthEnrollmentForm } from "@/components/multi-factor-auth-enrollment-form";

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
