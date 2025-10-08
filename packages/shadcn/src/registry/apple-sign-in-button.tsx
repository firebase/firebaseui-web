"use client";

import { OAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-ui/core";
import { useUI, AppleSignInButtonProps, AppleLogo } from "@firebase-ui/react";

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
