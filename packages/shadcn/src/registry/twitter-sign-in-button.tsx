"use client";

import { TwitterAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-ui/core";
import { useUI, type TwitterSignInButtonProps, TwitterLogo } from "@firebase-ui/react";

import { OAuthButton } from "@/registry/oauth-button";

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
