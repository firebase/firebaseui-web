"use client";

import { getTranslation } from "@firebase-ui/core";
import { useUI, type ForgotPasswordAuthScreenProps } from "@firebase-ui/react";

import { ForgotPasswordAuthForm } from "@/components/forgot-password-auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type { ForgotPasswordAuthScreenProps };

export function ForgotPasswordAuthScreen(props: ForgotPasswordAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "resetPassword");
  const subtitleText = getTranslation(ui, "prompts", "enterEmailToReset");

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordAuthForm {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
