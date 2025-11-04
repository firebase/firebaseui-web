"use client";

import { getTranslation } from "@firebase-ui/core";
import { type PropsWithChildren } from "react";
import { useUI } from "@firebase-ui/react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Policies } from "@/components/policies";
import { MultiFactorAuthAssertionForm } from "@/components/multi-factor-auth-assertion-form";
import { RedirectError } from "@/components/redirect-error";

export type OAuthScreenProps = PropsWithChildren;

export function OAuthScreen({ children }: OAuthScreenProps) {
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
            <MultiFactorAuthAssertionForm />
          ) : (
            <>
              <div className="space-y-2">
                {children}
                <RedirectError />
                <Policies />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
