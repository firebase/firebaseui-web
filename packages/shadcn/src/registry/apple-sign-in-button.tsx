"use client";

import { OAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type AppleSignInButtonProps, AppleLogo } from "@firebase-oss/ui-react";

import { OAuthButton } from "@/registry/oauth-button";

export type { AppleSignInButtonProps };

export function AppleSignInButton({ provider, themed }: AppleSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton provider={provider || new OAuthProvider("apple.com")} themed={themed}>
      <AppleLogo />
      <span>{getTranslation(ui, "labels", "signInWithApple")}</span>
    </OAuthButton>
  );
}
