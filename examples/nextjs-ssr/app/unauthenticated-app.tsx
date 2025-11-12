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

import { MultiFactorAuthAssertionScreen, useUI } from "@invertase/firebaseui-react";
import { routes } from "@/lib/routes";
import Link from "next/link";

export function UnauthenticatedApp() {
  const ui = useUI();

  // This can trigger if the user is not on a screen already, and gets an MFA challenge - e.g. on One-Tap sign in.
  if (ui.multiFactorResolver) {
    return <MultiFactorAuthAssertionScreen />;
  }

  return (
    <div className="max-w-sm mx-auto pt-36 space-y-6 pb-36">
      <div className="text-center space-y-4">
        <img src="/firebase-logo-inverted.png" alt="Firebase UI" className="hidden dark:block h-36 mx-auto" />
        <img src="/firebase-logo.png" alt="Firebase UI" className="block dark:hidden h-36 mx-auto" />
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Welcome to Firebase UI, choose an example screen below to get started!
        </p>
      </div>
      <div className="border border-neutral-200 dark:border-neutral-800 rounded divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className="flex items-center justify-between hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 p-4"
          >
            <div className="space-y-1">
              <h2 className="font-medium text-sm">{route.name}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-300">{route.description}</p>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400">
              <span className="text-xl">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
