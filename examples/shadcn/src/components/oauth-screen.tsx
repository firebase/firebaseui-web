"use client";

import { getTranslation } from "@invertase/firebaseui-core";
import { type UserCredential } from "firebase/auth";
import { type PropsWithChildren } from "react";
import { useUI } from "@invertase/firebaseui-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Policies } from "@/components/policies";
import { MultiFactorAuthAssertionForm } from "@/components/multi-factor-auth-assertion-form";
import { RedirectError } from "@/components/redirect-error";

export type OAuthScreenProps = PropsWithChildren<{
  onSignIn?: (credential: UserCredential) => void;
}>;

export function OAuthScreen({ children, onSignIn }: OAuthScreenProps) {
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
            <MultiFactorAuthAssertionForm
              onSuccess={(credential) => {
                onSignIn?.(credential);
              }}
            />
          ) : (
            <>
              <div className="space-y-2">{children}</div>
              <div className="mt-4 space-y-4">
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
