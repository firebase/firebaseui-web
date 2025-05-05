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

import { EmailPasswordForm, RegisterForm } from "@firebase-ui/react";
import { useState } from "react";

export default function Example1() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--fui-background)]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="text-xl font-bold">Company Logo</div>
          <nav className="flex gap-6">
            <a href="#" className="text-sm hover:text-[var(--fui-primary)]">
              Products
            </a>
            <a href="#" className="text-sm hover:text-[var(--fui-primary)]">
              Solutions
            </a>
            <a href="#" className="text-sm hover:text-[var(--fui-primary)]">
              Pricing
            </a>
            <a href="#" className="text-sm hover:text-[var(--fui-primary)]">
              Documentation
            </a>
          </nav>
        </div>
      </header>

      <main
        className="flex flex-1 items-center justify-center py-16"
        style={
          {
            "--fui-primary": "oklch(0.25 0 0)",
            "--fui-primary-hover": "oklch(0.15 0 0)",
            "--fui-background": "oklch(0.98 0 0)",
            "--fui-surface": "oklch(1 0 0)",
            "--fui-radius-sm": "9999px",
          } as React.CSSProperties
        }
      >
        <div className="relative w-full max-w-5xl">
          <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-[var(--fui-primary)] opacity-5"></div>
          <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[var(--fui-primary)] opacity-5"></div>

          {showRegister ? (
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-12 shadow-xl">
              <button
                onClick={() => setShowRegister(false)}
                className="mb-8 text-sm text-gray-600 hover:text-[var(--fui-primary)]"
              >
                ← Back to login
              </button>
              <div className="mx-auto max-w-md">
                <div className="mb-8 space-y-2">
                  <h2 className="text-2xl font-bold">Create Account</h2>
                  <p className="text-sm text-gray-600">
                    Join thousands of users worldwide
                  </p>
                </div>
                <RegisterForm />
                <div className="mt-6 text-center text-sm text-gray-500">
                  By signing up, you agree to our Terms of Service
                </div>
              </div>
            </div>
          ) : (
            <div className="relative grid grid-cols-2 gap-16 rounded-2xl bg-white p-12 shadow-xl">
              <div>
                <div className="mb-8 space-y-2">
                  <h2 className="text-2xl font-bold">Welcome Back</h2>
                  <p className="text-sm text-gray-600">
                    Sign in to your account to continue
                  </p>
                </div>
                <EmailPasswordForm onForgotPasswordClick={() => {}} />
              </div>

              <div className="absolute left-1/2 top-12 bottom-12 w-px -translate-x-1/2 bg-gray-200"></div>

              <div className="flex flex-col">
                <div className="mb-8 space-y-2">
                  <h2 className="text-2xl font-bold">New Here?</h2>
                  <p className="text-sm text-gray-600">
                    Create an account and get access to all features
                  </p>
                </div>

                <div className="mb-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-[var(--fui-primary)] bg-opacity-10 p-1">
                      <svg
                        className="h-4 w-4 text-[var(--fui-primary)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Free Forever</h3>
                      <p className="text-sm text-gray-600">
                        Get started with our free plan and upgrade anytime
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-[var(--fui-primary)] bg-opacity-10 p-1">
                      <svg
                        className="h-4 w-4 text-[var(--fui-primary)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Premium Support</h3>
                      <p className="text-sm text-gray-600">
                        24/7 support for all your questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-[var(--fui-primary)] bg-opacity-10 p-1">
                      <svg
                        className="h-4 w-4 text-[var(--fui-primary)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Regular Updates</h3>
                      <p className="text-sm text-gray-600">
                        New features and improvements every month
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowRegister(true)}
                  className="mt-auto rounded-full bg-[var(--fui-primary)] px-8 py-3 text-white transition-colors hover:bg-[var(--fui-primary-hover)]"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Integrations
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Enterprise
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Solutions
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Guides
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  API Status
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  About Us
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Careers
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Press
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Security
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-[var(--fui-primary)]"
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            © 2024 Company, Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
