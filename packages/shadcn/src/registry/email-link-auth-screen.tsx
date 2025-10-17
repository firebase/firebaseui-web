"use client";

import { useUI, type EmailLinkAuthScreenProps } from "@firebase-ui/react";
import { getTranslation } from "@firebase-ui/core";

import { EmailLinkAuthForm } from "@/registry/email-link-auth-form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type { EmailLinkAuthScreenProps };

export function EmailLinkAuthScreen({ children, ...props }: EmailLinkAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titleText}</CardTitle>
        <CardDescription>{subtitleText}</CardDescription>
      </CardHeader>
      <CardContent>
        <EmailLinkAuthForm {...props} />
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
