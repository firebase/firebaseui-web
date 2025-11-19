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

import { useUI, type OAuthButtonProps, useSignInWithProvider } from "@invertase/firebaseui-react";
import { Button } from "@/components/ui/button";

export type { OAuthButtonProps };

export function OAuthButton({ provider, children, themed, onSignIn }: OAuthButtonProps) {
  const ui = useUI();

  const { error, callback } = useSignInWithProvider(provider, onSignIn);

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
