"use client";

import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type SignInAuthScreenProps } from "@invertase/firebaseui-react";

import { SignInAuthForm } from "@/components/sign-in-auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type { SignInAuthScreenProps };

export function SignInAuthScreen({ children, ...props }: SignInAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInAuthForm {...props} />
          {children ? (
            <>
              <Separator>{getTranslation(ui, "messages", "dividerOr")}</Separator>
              <div className="space-y-2">{children}</div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
