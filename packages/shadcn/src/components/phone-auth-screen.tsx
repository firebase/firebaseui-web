"use client";

import type { PropsWithChildren } from "react";
import { getTranslation } from "@invertase/firebaseui-core";
import { useUI } from "@invertase/firebaseui-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PhoneAuthForm, type PhoneAuthFormProps } from "@/components/phone-auth-form";
import { MultiFactorAuthAssertionScreen } from "@/components/multi-factor-auth-assertion-screen";
import { RedirectError } from "@/components/redirect-error";

export type PhoneAuthScreenProps = PropsWithChildren<PhoneAuthFormProps>;

export function PhoneAuthScreen({ children, ...props }: PhoneAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");
  const mfaResolver = ui.multiFactorResolver;

  if (mfaResolver) {
    return <MultiFactorAuthAssertionScreen onSuccess={props.onSignIn} />;
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <PhoneAuthForm {...props} />
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
