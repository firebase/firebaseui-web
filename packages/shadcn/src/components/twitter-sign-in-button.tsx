"use client";

import { TwitterAuthProvider } from "firebase/auth";
import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type TwitterSignInButtonProps, TwitterLogo } from "@invertase/firebaseui-react";

import { OAuthButton } from "@/components/oauth-button";

export type { TwitterSignInButtonProps };

export function TwitterSignInButton({ provider, ...props }: TwitterSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new TwitterAuthProvider()}>
      <TwitterLogo />
      <span>{getTranslation(ui, "labels", "signInWithTwitter")}</span>
    </OAuthButton>
  );
}
