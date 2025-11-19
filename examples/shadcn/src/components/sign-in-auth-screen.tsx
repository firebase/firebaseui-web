"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type SignInAuthScreenProps, useOnUserAuthenticated } from "@firebase-oss/ui-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignInAuthForm } from "@/components/sign-in-auth-form";
import { MultiFactorAuthAssertionScreen } from "@/components/multi-factor-auth-assertion-screen";

export type { SignInAuthScreenProps };

export function SignInAuthScreen({ children, onSignIn, ...props }: SignInAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

  useOnUserAuthenticated(onSignIn);

  if (ui.multiFactorResolver) {
    return <MultiFactorAuthAssertionScreen />;
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInAuthForm {...props} />
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
