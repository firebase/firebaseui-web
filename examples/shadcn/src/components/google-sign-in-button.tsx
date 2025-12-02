"use client";

import { GoogleAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type GoogleSignInButtonProps, GoogleLogo } from "@firebase-oss/ui-react";

import { OAuthButton } from "@/components/oauth-button";

export type { GoogleSignInButtonProps };

export function GoogleSignInButton({ provider, themed }: GoogleSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton provider={provider || new GoogleAuthProvider()} themed={themed}>
      <GoogleLogo />
      <span>{getTranslation(ui, "labels", "signInWithGoogle")}</span>
    </OAuthButton>
  );
}
