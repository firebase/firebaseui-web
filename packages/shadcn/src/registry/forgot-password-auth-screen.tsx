"use client";

import { getTranslation } from "@firebase-ui/core";
import { useUI, type ForgotPasswordAuthScreenProps } from "@firebase-ui/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordAuthForm } from "@/registry/forgot-password-auth-form";

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
