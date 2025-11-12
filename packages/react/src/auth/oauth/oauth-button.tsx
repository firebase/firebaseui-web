/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { FirebaseUIError, getTranslation, signInWithProvider } from "@invertase/firebaseui-core";
import type { AuthProvider, UserCredential } from "firebase/auth";
import type { PropsWithChildren } from "react";
import { useCallback, useState } from "react";
import { Button } from "~/components/button";
import { useUI } from "~/hooks";

export type OAuthButtonProps = PropsWithChildren<{
  provider: AuthProvider;
  themed?: boolean | string;
  onSignIn?: (credential: UserCredential) => void;
}>;

export function useSignInWithProvider(provider: AuthProvider, onSignIn?: (credential: UserCredential) => void) {
  const ui = useUI();
  const [error, setError] = useState<string | null>(null);

  const callback = useCallback(async () => {
    setError(null);
    try {
      const credential = await signInWithProvider(ui, provider);
      onSignIn?.(credential);
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        setError(error.message);
        return;
      }
      console.error(error);
      setError(getTranslation(ui, "errors", "unknownError"));
    }
  }, [ui, provider, setError, onSignIn]);

  return { error, callback };
}

export function OAuthButton({ provider, children, themed, onSignIn }: OAuthButtonProps) {
  const ui = useUI();

  const { error, callback } = useSignInWithProvider(provider, onSignIn);

  return (
    <div>
      <Button
        type="button"
        variant={themed ? "primary" : "secondary"}
        data-themed={themed}
        data-provider={provider.providerId}
        disabled={ui.state !== "idle"}
        onClick={callback}
        className="fui-provider__button"
      >
        {children}
      </Button>
      {error && <div className="fui-error">{error}</div>}
    </div>
  );
}
