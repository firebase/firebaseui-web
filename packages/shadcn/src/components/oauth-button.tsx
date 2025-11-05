"use client";

import { useUI, type OAuthButtonProps, useSignInWithProvider } from "@firebase-ui/react";
import { Button } from "@/components/ui/button";

export type { OAuthButtonProps };

export function OAuthButton({ provider, children, themed }: OAuthButtonProps) {
  const ui = useUI();

  const { error, callback } = useSignInWithProvider(provider);

  return (
    <div>
      <Button
        type="button"
        disabled={ui.state !== "idle"}
        onClick={callback}
        data-provider={provider.providerId}
        data-themed={themed}
        className="w-full"
        variant={themed ? "default" : "outline"}
      >
        {children}
      </Button>
      {error && <div className="text-destructive text-left text-xs">{error}</div>}
    </div>
  );
}
