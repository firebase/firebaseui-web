"use client";

import { getTranslation } from "@invertase/firebaseui-core";
import { type User } from "firebase/auth";
import { type PropsWithChildren } from "react";
import { useUI, useOnUserAuthenticated } from "@invertase/firebaseui-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Policies } from "@/components/policies";
import { MultiFactorAuthAssertionScreen } from "@/components/multi-factor-auth-assertion-screen";
import { RedirectError } from "@/components/redirect-error";

export type OAuthScreenProps = PropsWithChildren<{
  onSignIn?: (user: User) => void;
}>;

export function OAuthScreen({ children, onSignIn }: OAuthScreenProps) {
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
          <div className="space-y-2">{children}</div>
          <div className="mt-4 space-y-4">
            <RedirectError />
            <Policies />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
