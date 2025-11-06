"use client";

import { OAuthProvider } from "firebase/auth";
import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type AppleSignInButtonProps, AppleLogo } from "@invertase/firebaseui-react";

import { OAuthButton } from "@/components/oauth-button";

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
