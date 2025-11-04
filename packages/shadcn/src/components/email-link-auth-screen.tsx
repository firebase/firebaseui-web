"use client";

import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type EmailLinkAuthScreenProps } from "@invertase/firebaseui-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmailLinkAuthForm } from "@/components/email-link-auth-form";

export type { EmailLinkAuthScreenProps };

export function EmailLinkAuthScreen({ children, ...props }: EmailLinkAuthScreenProps) {
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
          <EmailLinkAuthForm {...props} />
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
