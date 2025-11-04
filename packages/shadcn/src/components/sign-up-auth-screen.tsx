"use client";

import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type SignUpAuthScreenProps } from "@invertase/firebaseui-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignUpAuthForm } from "@/components/sign-up-auth-form";

export type { SignUpAuthScreenProps };

export function SignUpAuthScreen({ children, ...props }: SignUpAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signUp");
  const subtitleText = getTranslation(ui, "prompts", "enterDetailsToCreate");

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{titleText}</CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpAuthForm {...props} />
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
