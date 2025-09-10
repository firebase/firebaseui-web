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

import {
  FirebaseUIError,
  getTranslation,
  signInWithOAuth,
} from "@firebase-ui/core";
import type { AuthProvider } from "firebase/auth";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { Button } from "~/components/button";
import { useUI } from "~/hooks";

export type OAuthButtonProps = PropsWithChildren<{
  provider: AuthProvider;
}>;

export function OAuthButton({ provider, children }: OAuthButtonProps) {
  const ui = useUI();

  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = async () => {
    setError(null);
    try {
      await signInWithOAuth(ui, provider);
    } catch (error) {
      if (error instanceof FirebaseUIError) {
        setError(error.message);
        return;
      }
      console.error(error);
      setError(getTranslation(ui, "errors", "unknownError"));
    }
  };

  return (
    <div>
      <Button
        type="button"
        disabled={ui.state !== "idle"}
        onClick={handleOAuthSignIn}
        className="fui-provider__button"
      >
        {children}
      </Button>
      {error && <div className="fui-form__error">{error}</div>}
    </div>
  );
}
