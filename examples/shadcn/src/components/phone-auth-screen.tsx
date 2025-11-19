"use client";

import type { PropsWithChildren } from "react";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, useOnUserAuthenticated } from "@firebase-oss/ui-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PhoneAuthForm } from "@/components/phone-auth-form";
import { MultiFactorAuthAssertionScreen } from "@/components/multi-factor-auth-assertion-screen";
import { RedirectError } from "@/components/redirect-error";
import type { User } from "firebase/auth";

export type PhoneAuthScreenProps = PropsWithChildren<{
  onSignIn?: (user: User) => void;
}>;

export function PhoneAuthScreen({ children, onSignIn }: PhoneAuthScreenProps) {
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
          <PhoneAuthForm />
          {children ? (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                {children}
                <RedirectError />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
