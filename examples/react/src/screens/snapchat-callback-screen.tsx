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

import { signInWithCustomToken } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { auth } from "../firebase/firebase";
import { getSnapchatCallbackUrl } from "../custom-auth-buttons/snapchat-sign-in-button";

const SNAPCHAT_STATE_KEY = "snapchat_oauth_state";
const authServerUrl = import.meta.env.VITE_CUSTOM_AUTH_SERVER_URL ?? "http://localhost:4000";

export default function SnapchatCallbackScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setMessage(searchParams.get("error_description") ?? `Snapchat returned: ${errorParam}`);
      return;
    }

    if (!code || !state) {
      setStatus("error");
      setMessage("Missing code or state in callback");
      return;
    }

    const storedState = sessionStorage.getItem(SNAPCHAT_STATE_KEY);
    sessionStorage.removeItem(SNAPCHAT_STATE_KEY);
    if (storedState !== state) {
      setStatus("error");
      setMessage("Invalid state (possible CSRF)");
      return;
    }

    const redirectUri = getSnapchatCallbackUrl();
    fetch(`${authServerUrl}/auth/snapchat/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Token exchange failed");
        }
        return data.customToken as string;
      })
      .then(async (customToken) => {
        await signInWithCustomToken(auth, customToken);
        setStatus("success");
        navigate("/", { replace: true });
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Sign in failed");
      });
  }, [searchParams, navigate]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-neutral-600 dark:text-neutral-400">Completing sign in with Snapchat…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-500">{message}</p>
        <button
          type="button"
          onClick={() => navigate("/screens/sign-in-auth-screen-w-oauth")}
          className="rounded bg-neutral-200 px-4 py-2 text-sm dark:bg-neutral-700"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return null;
}
