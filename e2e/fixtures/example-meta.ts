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

/** Per-example routing and server metadata for Playwright smoke tests. */
export type ExampleMeta = {
  /** Playwright project name (matches pnpm filter where applicable). */
  name: string;
  /** Dev server origin used as Playwright baseURL. */
  baseURL: string;
  /** Deep-link path for the sign-in-with-handlers smoke entry screen. */
  signInWithHandlersPath: string;
  /** Whether URLs for this example require a trailing slash (Next.js). */
  trailingSlash: boolean;
  /** Forgot-password route from sign-in-with-handlers (S3 asserts UI, not this path). */
  forgotPasswordPath: string;
  /** Optional dev-server command for Playwright webServer. */
  webServerCommand?: string;
};

export const exampleMeta: Record<string, ExampleMeta> = {
  react: {
    name: "react",
    baseURL: "http://localhost:5173",
    signInWithHandlersPath: "/screens/sign-in-auth-screen-w-handlers",
    trailingSlash: false,
    forgotPasswordPath: "/screens/forgot-password-auth-screen",
    webServerCommand: "pnpm --filter=react exec vite --port 5173 --strictPort",
  },
};

/** Returns the sign-in-with-handlers path respecting per-example trailing-slash rules. */
export function signInWithHandlersUrl(meta: ExampleMeta): string {
  const { signInWithHandlersPath, trailingSlash } = meta;

  if (trailingSlash) {
    return signInWithHandlersPath.endsWith("/") ? signInWithHandlersPath : `${signInWithHandlersPath}/`;
  }

  return signInWithHandlersPath.endsWith("/") ? signInWithHandlersPath.slice(0, -1) : signInWithHandlersPath;
}
