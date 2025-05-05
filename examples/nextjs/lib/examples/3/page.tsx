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
import { EmailPasswordForm, RegisterForm } from "@firebase-ui/react";

export default function Example3() {
  const [showModal, setShowModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div
      style={
        {
          "--fui-primary": "oklch(0.6 0.2 330)",
          "--fui-primary-hover": "oklch(0.5 0.2 330)",
          "--fui-background": "oklch(0.98 0 0)",
          "--fui-surface": "oklch(1 0 0)",
          "--fui-text": "oklch(0.2 0 0)",
          "--fui-text-secondary": "oklch(0.4 0 0)",
          "--fui-border": "oklch(0.9 0 0)",
          "--fui-radius-sm": "0.375rem",
        } as React.CSSProperties
      }
      className="min-h-screen bg-[var(--fui-background)]"
    >
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold">Modal Example</div>
            <nav className="flex gap-6">
              <a href="#" className="text-sm hover:text-[var(--fui-primary)]">
                Features
              </a>
              <a href="#" className="text-sm hover:text-[var(--fui-primary)]">
                Pricing
              </a>
              <a href="#" className="text-sm hover:text-[var(--fui-primary)]">
                About
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsRegister(false);
                setShowModal(true);
              }}
              className="text-sm hover:text-[var(--fui-primary)]"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setShowModal(true);
              }}
              className="rounded-md bg-[var(--fui-primary)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--fui-primary-hover)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Modal Example</h1>
          <p className="mx-auto mt-4 text-gray-600">
            Click the Sign In or Get Started button in the header to see the
            modal.
          </p>
        </div>
      </main>

      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {isRegister ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">Create Account</h2>
                      <p className="mt-2 text-sm text-gray-600">
                        Join us to get started with your journey
                      </p>
                    </div>
                    <RegisterForm
                      onBackToSignInClick={() => setIsRegister(false)}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">Welcome Back</h2>
                      <p className="mt-2 text-sm text-gray-600">
                        Sign in to your account to continue
                      </p>
                    </div>
                    <EmailPasswordForm
                      onForgotPasswordClick={() => {}}
                      onRegisterClick={() => setIsRegister(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
