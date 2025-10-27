"use client";

import { getTranslation } from "@firebase-ui/core";
import { useUI, type MultiFactorAuthEnrollmentScreenProps } from "@firebase-ui/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiFactorAuthEnrollmentForm } from "@/registry/multi-factor-auth-enrollment-form";

export type { MultiFactorAuthEnrollmentScreenProps };

export function MultiFactorAuthEnrollmentScreen({ children, ...props }: MultiFactorAuthEnrollmentScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "multiFactorEnrollment");
  const subtitleText = getTranslation(ui, "prompts", "mfaEnrollmentPrompt");

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <MultiFactorAuthEnrollmentForm {...props} />
          {children ? (
            <div className="space-y-2 mt-4">{children}</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
