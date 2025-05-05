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

import { useState } from "react";
import {
  EmailPasswordForm,
  RegisterForm,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
} from "@firebase-ui/react";

export default function Example2() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div
      style={
        {
          "--fui-primary": "oklch(0.55 0.25 250)",
          "--fui-primary-hover": "oklch(0.45 0.25 250)",
          "--fui-background": "oklch(0.15 0 0)",
          "--fui-surface": "oklch(0.2 0 0)",
          "--fui-text": "oklch(0.98 0 0)",
          "--fui-text-secondary": "oklch(0.75 0 0)",
          "--fui-border": "oklch(0.3 0 0)",
          "--fui-radius-sm": "0.5rem",
        } as React.CSSProperties
      }
      className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]"
    >
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4">
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-[var(--fui-primary)]"></div>
            <span className="text-xl font-bold text-white">DemoStyle</span>
          </div>
          <button
            onClick={() => setShowRegister(!showRegister)}
            className="rounded-lg border border-white/10 bg-white/5 px-6 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            {showRegister ? "Sign In" : "Create Account"}
          </button>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="relative w-full max-w-lg">
            <div className="absolute -left-20 -top-20 h-72 w-72 animate-pulse rounded-full bg-[var(--fui-primary)] opacity-20 blur-3xl"></div>
            <div
              className="absolute -bottom-20 -right-20 h-72 w-72 animate-pulse rounded-full bg-[var(--fui-primary)] opacity-20 blur-3xl"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="!min-h-0 !bg-transparent !p-0">
              <Card className="relative rounded-xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>
                    {showRegister ? "Join DemoStyle" : "Welcome Back"}
                  </CardTitle>
                  <CardSubtitle>
                    {showRegister
                      ? "Experience this demo styling"
                      : "Sign in to continue your journey"}
                  </CardSubtitle>
                </CardHeader>
                {showRegister ? (
                  <>
                    <RegisterForm />
                    <p className="text-center text-xs text-gray-500">
                      By signing up, you agree to our Terms of Service
                    </p>
                  </>
                ) : (
                  <>
                    <EmailPasswordForm onForgotPasswordClick={() => {}} />
                    <div className="flex items-center gap-4 pt-4">
                      <div className="h-px flex-1 bg-white/10"></div>
                      <span className="text-xs text-gray-500">
                        Example Style Demo
                      </span>
                      <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </main>

        <footer className="py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © 2024 DemoStyle. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-white">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
