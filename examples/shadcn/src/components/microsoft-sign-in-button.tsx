"use client";

import { OAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type MicrosoftSignInButtonProps, MicrosoftLogo } from "@firebase-oss/ui-react";

import { OAuthButton } from "@/components/oauth-button";

export type { MicrosoftSignInButtonProps };

export function MicrosoftSignInButton({ provider, themed }: MicrosoftSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton provider={provider || new OAuthProvider("microsoft.com")} themed={themed}>
      <MicrosoftLogo />
      <span>{getTranslation(ui, "labels", "signInWithMicrosoft")}</span>
    </OAuthButton>
  );
}
