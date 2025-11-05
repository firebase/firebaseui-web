"use client";

import { getTranslation } from "@firebase-ui/core";
import { useUI, type EmailLinkAuthScreenProps } from "@firebase-ui/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmailLinkAuthForm } from "@/components/email-link-auth-form";
import { MultiFactorAuthAssertionForm } from "@/components/multi-factor-auth-assertion-form";
import { RedirectError } from "@/components/redirect-error";

export type { EmailLinkAuthScreenProps };

export function EmailLinkAuthScreen({ children, ...props }: EmailLinkAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");
  const mfaResolver = ui.multiFactorResolver;

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          {mfaResolver ? (
            <MultiFactorAuthAssertionForm onSuccess={(credential) => props.onSignIn?.(credential)} />
          ) : (
            <>
              <EmailLinkAuthForm {...props} />
              {children ? (
                <>
                  <Separator className="my-4" />
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
