"use client";

import { GithubAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-ui/core";
import { useUI, type GitHubSignInButtonProps, GitHubLogo } from "@firebase-ui/react";

import { OAuthButton } from "@/components/oauth-button";

export type { GitHubSignInButtonProps };

export function GitHubSignInButton({ provider, themed }: GitHubSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton provider={provider || new GithubAuthProvider()} themed={themed}>
      <GitHubLogo />
      <span>{getTranslation(ui, "labels", "signInWithGitHub")}</span>
    </OAuthButton>
  );
}
