"use client";

import { TwitterAuthProvider } from "firebase/auth";
import { getTranslation } from "@invertase/firebaseui-core";
import { useUI, type TwitterSignInButtonProps, TwitterLogo } from "@invertase/firebaseui-react";

import { OAuthButton } from "@/components/oauth-button";

export type { TwitterSignInButtonProps };

export function TwitterSignInButton({ provider, themed }: TwitterSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton provider={provider || new TwitterAuthProvider()} themed={themed}>
      <TwitterLogo />
      <span>{getTranslation(ui, "labels", "signInWithTwitter")}</span>
    </OAuthButton>
  );
}
