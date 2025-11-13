"use client";

import { FacebookAuthProvider } from "firebase/auth";
import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type FacebookSignInButtonProps, FacebookLogo } from "@invertase/firebaseui-react";

import { OAuthButton } from "@/components/oauth-button";

export type { FacebookSignInButtonProps };

export function FacebookSignInButton({ provider, ...props }: FacebookSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new FacebookAuthProvider()}>
      <FacebookLogo />
      <span>{getTranslation(ui, "labels", "signInWithFacebook")}</span>
    </OAuthButton>
  );
}
