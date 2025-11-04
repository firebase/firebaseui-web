"use client";

import type { PropsWithChildren } from "react";
import { getTranslation } from "@firebase-ui/core";
import { useUI } from "@firebase-ui/react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PhoneAuthForm, type PhoneAuthFormProps } from "@/components/phone-auth-form";
import { MultiFactorAuthAssertionForm } from "@/components/multi-factor-auth-assertion-form";
import { RedirectError } from "@/components/redirect-error";

export type PhoneAuthScreenProps = PropsWithChildren<PhoneAuthFormProps>;

export function PhoneAuthScreen({ children, ...props }: PhoneAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");
  const mfaResolver = ui.multiFactorResolver;

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          {mfaResolver ? (
            <MultiFactorAuthAssertionForm
              onSuccess={(credential) => {
                props.onSignIn?.(credential);
              }}
            />
          ) : (
            <>
              <PhoneAuthForm {...props} />
              {children ? (
                <>
                  <Separator>{getTranslation(ui, "messages", "dividerOr")}</Separator>
                  <div className="space-y-2">
                    {children}
                    <RedirectError />
                  </div>
                </>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
