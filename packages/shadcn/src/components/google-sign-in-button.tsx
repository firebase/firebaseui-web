"use client";

import { GoogleAuthProvider } from "firebase/auth";
import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type GoogleSignInButtonProps, GoogleLogo } from "@invertase/firebaseui-react";

import { OAuthButton } from "@/components/oauth-button";

export type { GoogleSignInButtonProps };

export function GoogleSignInButton({ provider, ...props }: GoogleSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new GoogleAuthProvider()}>
      <GoogleLogo />
      <span>{getTranslation(ui, "labels", "signInWithGoogle")}</span>
    </OAuthButton>
  );
}
