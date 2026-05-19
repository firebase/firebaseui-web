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

import { useState } from "react";

const SNAPCHAT_STATE_KEY = "snapchat_oauth_state";

const authServerUrl = import.meta.env.VITE_CUSTOM_AUTH_SERVER_URL ?? "http://localhost:4000";

export function getSnapchatCallbackUrl(): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/auth/snapchat/callback`;
}

export function SnapchatSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const configRes = await fetch(`${authServerUrl}/auth/snapchat/config`);
      if (!configRes.ok) {
        throw new Error("Failed to get Snapchat config");
      }
      const config = (await configRes.json()) as {
        clientId: string;
        authUrl: string;
        scopes: string[];
      };

      const state = crypto.randomUUID();
      sessionStorage.setItem(SNAPCHAT_STATE_KEY, state);

      const redirectUri = getSnapchatCallbackUrl();
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: config.scopes.join(" "),
        state,
      });
      window.location.href = `${config.authUrl}?${params.toString()}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start sign in");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="fui-provider__button flex w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-[#FFFC00] px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50 dark:border-neutral-700"
        data-provider="snapchat"
      >
        <span className="fui-provider__icon flex items-center justify-center" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.568-.046-.195-.105-.479-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.052-.225-.015-.239.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.364 0-.374.27-.704.72-.853.149-.06.33-.09.509-.09.12 0 .299.015.464.104.374.181.733.285 1.033.3.198 0 .326-.044.401-.089l-.031-.509c-.098-1.627-.225-3.654.307-4.847C7.392 1.077 10.739.793 11.727.793l.419-.015.06.015z" />
          </svg>
        </span>
        <span>{loading ? "Redirecting…" : "Sign in with Snapchat"}</span>
      </button>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
