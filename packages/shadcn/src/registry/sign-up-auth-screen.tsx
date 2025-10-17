"use client";

import { useUI, type SignUpAuthScreenProps } from "@firebase-ui/react";
import { getTranslation } from "@firebase-ui/core";

import { SignUpAuthForm } from "@/registry/sign-up-auth-form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type { SignUpAuthScreenProps };

export function SignUpAuthScreen({ children, ...props }: SignUpAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "register");
  const subtitleText = getTranslation(ui, "prompts", "enterDetailsToCreate");

  return (
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
  );
}
