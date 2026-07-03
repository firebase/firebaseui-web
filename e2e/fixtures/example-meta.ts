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

/**
 * Whether an example is exercised through the browser (UI smoke S1–S3) or as a
 * non-browser HTTP boot smoke (custom-auth-server). See AD-6.
 */
export type ExampleKind = "ui" | "http";

/** Shared server/startup metadata for every Playwright project. */
type BaseExampleMeta = {
  /** Playwright project name (matches pnpm filter where applicable). */
  name: string;
  /** Server origin used as Playwright baseURL. */
  baseURL: string;
  /** Optional server command for Playwright webServer. */
  webServerCommand?: string;
  /** Optional Playwright webServer startup timeout (ms). */
  webServerTimeoutMs?: number;
  /** URL Playwright polls until the server is ready (defaults to baseURL). */
  webServerHealthURL?: string;
};

/** Browser example: rendered UI smoke over the sign-in-with-handlers flow. */
export type UiExampleMeta = BaseExampleMeta & {
  kind: "ui";
  /** Deep-link path for the sign-in-with-handlers smoke entry screen. */
  signInWithHandlersPath: string;
  /** Whether URLs for this example require a trailing slash (Next.js). */
  trailingSlash: boolean;
  /** Forgot-password route from sign-in-with-handlers (S3 asserts UI, not this path). */
  forgotPasswordPath: string;
};

/** Non-browser example: boot the server and assert an HTTP response. */
export type HttpExampleMeta = BaseExampleMeta & {
  kind: "http";
  /** Path probed by the HTTP smoke (relative to baseURL). */
  smokePath: string;
};

export type ExampleMeta = UiExampleMeta | HttpExampleMeta;

export const exampleMeta: Record<string, ExampleMeta> = {
  react: {
    kind: "ui",
    name: "react",
    baseURL: "http://localhost:5173",
    signInWithHandlersPath: "/screens/sign-in-auth-screen-w-handlers",
    trailingSlash: false,
    forgotPasswordPath: "/screens/forgot-password-auth-screen",
    webServerCommand: "pnpm --filter=react exec vite --port 5173 --strictPort",
  },
  shadcn: {
    kind: "ui",
    name: "shadcn",
    baseURL: "http://localhost:5174",
    signInWithHandlersPath: "/screens/sign-in-auth-screen-w-handlers",
    trailingSlash: false,
    forgotPasswordPath: "/screens/forgot-password-screen",
    webServerCommand: "pnpm --filter=shadcn exec vite --port 5174 --strictPort",
  },
  nextjs: {
    kind: "ui",
    name: "nextjs",
    baseURL: "http://localhost:3000",
    signInWithHandlersPath: "/screens/sign-in-auth-screen-w-handlers",
    trailingSlash: true,
    forgotPasswordPath: "/screens/forgot-password-auth-screen",
    webServerCommand: "pnpm --filter=nextjs exec next dev --turbopack -p 3000",
    webServerTimeoutMs: 180_000,
  },
  "nextjs-ssr": {
    kind: "ui",
    name: "nextjs-ssr",
    baseURL: "http://localhost:3001",
    signInWithHandlersPath: "/screens/sign-in-auth-screen-w-handlers",
    trailingSlash: true,
    forgotPasswordPath: "/screens/forgot-password-auth-screen",
    webServerCommand: "pnpm --filter=nextjs-ssr exec next dev -p 3001",
    webServerTimeoutMs: 180_000,
  },
  "angular-example": {
    kind: "ui",
    name: "angular-example",
    baseURL: "http://localhost:4200",
    signInWithHandlersPath: "/screens/sign-in-auth-screen-w-handlers",
    trailingSlash: false,
    forgotPasswordPath: "/screens/forgot-password-auth-screen",
    webServerCommand: "pnpm --filter=angular-example run start --port 4200",
    webServerTimeoutMs: 240_000,
  },
  // AD-6: non-browser HTTP smoke; lifecycle in custom-auth-server.spec.ts
  "custom-auth-server": {
    kind: "http",
    name: "custom-auth-server",
    baseURL: "http://localhost:4001",
    smokePath: "/auth/snapchat/config",
  },
};

/** UI examples (browser smoke S1–S3), narrowed by discriminant. */
export const uiExampleEntries: [string, UiExampleMeta][] = Object.entries(exampleMeta).filter(
  (entry): entry is [string, UiExampleMeta] => entry[1].kind === "ui"
);

/** Returns the sign-in-with-handlers path respecting per-example trailing-slash rules. */
export function signInWithHandlersUrl(meta: UiExampleMeta): string {
  const { signInWithHandlersPath, trailingSlash } = meta;

  if (trailingSlash) {
    return signInWithHandlersPath.endsWith("/") ? signInWithHandlersPath : `${signInWithHandlersPath}/`;
  }

  return signInWithHandlersPath.endsWith("/") ? signInWithHandlersPath.slice(0, -1) : signInWithHandlersPath;
}
