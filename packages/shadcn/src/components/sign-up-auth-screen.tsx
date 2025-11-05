"use client";

import { getTranslation } from "@firebase-ui/core";
import { useUI, type SignUpAuthScreenProps } from "@firebase-ui/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignUpAuthForm } from "@/components/sign-up-auth-form";
import { MultiFactorAuthAssertionScreen } from "@/components/multi-factor-auth-assertion-screen";

export type { SignUpAuthScreenProps };

export function SignUpAuthScreen({ children, ...props }: SignUpAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signUp");
  const subtitleText = getTranslation(ui, "prompts", "enterDetailsToCreate");

  const mfaResolver = ui.multiFactorResolver;

  if (mfaResolver) {
    return <MultiFactorAuthAssertionScreen onSuccess={props.onSignUp} />;
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpAuthForm {...props} />
          {children ? (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">{children}</div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
