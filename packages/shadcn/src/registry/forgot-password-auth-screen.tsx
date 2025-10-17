"use client";

import { useUI, type ForgotPasswordAuthScreenProps } from "@firebase-ui/react";
import { getTranslation } from "@firebase-ui/core";

import { ForgotPasswordAuthForm } from "@/registry/forgot-password-auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type { ForgotPasswordAuthScreenProps };

export function ForgotPasswordAuthScreen(props: ForgotPasswordAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "resetPassword");
  const subtitleText = getTranslation(ui, "prompts", "enterEmailToReset");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titleText}</CardTitle>
        <CardDescription>{subtitleText}</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordAuthForm {...props} />
      </CardContent>
    </Card>
  );
}
