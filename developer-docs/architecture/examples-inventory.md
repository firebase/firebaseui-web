---
type: Reference
title: Examples inventory
description: How each monorepo example is started, which port it uses, and emulator requirements.
resource: firebaseui-web/examples/
tags: [examples, monorepo, emulator]
timestamp: 2026-07-01T00:00:00Z
---

# Workspace layout

pnpm workspace members: `packages/*`, `examples/*` ([pnpm-workspace.yaml](../../pnpm-workspace.yaml)). Examples consume `@firebase-oss/ui-*` via `workspace:*`.

# Examples in scope for e2e smoke

| Example            | pnpm filter          | Dev command                                   | Default port  | E2E port | Emulator in dev                                    | Smoke type                 |
| ------------------ | -------------------- | --------------------------------------------- | ------------- | -------- | -------------------------------------------------- | -------------------------- |
| react              | `react`              | `vite`                                        | 5173          | 5173     | `import.meta.env.MODE === "development"` → `:9099` | browser (S1–S3)            |
| shadcn             | `shadcn`             | `vite`                                        | 5173          | 5174     | same as react                                      | browser (S1–S3)            |
| nextjs (SSG)       | `nextjs`             | `next dev --turbopack`                        | 3000          | 3000     | `NODE_ENV === "development"` → `:9099`             | browser (S1–S3)            |
| nextjs-ssr         | `nextjs-ssr`         | `next dev`                                    | 3000          | 3001     | same as nextjs                                     | browser (S1–S3)            |
| angular-example    | `angular-example`    | `run start --port 4200` (`clean && ng serve`) | 4200          | 4200     | `isDevMode()` → `:9099`                            | browser (S1–S3)            |
| custom-auth-server | `custom-auth-server` | `start` (built Express)                       | 4000 (`PORT`) | 4001     | n/a (uses `firebase-admin`)                        | HTTP boot + `fetch`/`curl` |

**Port configurability:** not pinned in `vite.config.ts` / `next.config.ts`. All examples accept CLI/`PORT` overrides for e2e; Playwright's top-level `webServer` (selected by `E2E_PROJECT`) owns lifecycle. Exact e2e commands: `e2e/fixtures/example-meta.ts`. See [AD-4](../decisions.md#ad-4-playwright-managed-dev-servers-serial-shared-emulator).

**custom-auth-server port:** default `:4000` collides with the Firebase Emulator UI (`:4000`), so e2e binds `:4001` — [AD-6](../decisions.md#ad-6-custom-auth-server-binds-4001-for-e2e). Its smoke is non-browser (boot + HTTP assert); it is not in root `pnpm build`.

**Angular:** e2e reuses the package `start` script (`pnpm clean && ng serve`) so the `.angular/cache` clean is not duplicated — [AD-4](../decisions.md#ad-4-playwright-managed-dev-servers-serial-shared-emulator).

**Auth behaviors affecting smoke:** react/shadcn use `oneTapSignIn`; nextjs/nextjs-ssr use `autoAnonymousLogin`. Neither hides the sign-in form (`SignInAuthScreen` renders regardless of auth state), so E2E flags are optional — [AD-5](../decisions.md#ad-5-auth-behavior-e2e-flags-are-optional-only-if-flaky). The One Tap external script is blocked in the harness.

**Next.js paths:** both nextjs (SSG) and nextjs-ssr use `trailingSlash: true` — e2e URLs end with `/` (e.g. `/screens/sign-in-auth-screen-w-handlers/`).

**Forgot-password route varies per example** (S3 asserts rendered UI, not a fixed path):

| Example                | Forgot-password route from sign-in-with-handlers |
| ---------------------- | ------------------------------------------------ |
| react, angular-example | `/screens/forgot-password-auth-screen`           |
| shadcn                 | `/screens/forgot-password-screen`                |
| nextjs, nextjs-ssr     | `/screens/forgot-password-auth-screen`           |

# Shared prerequisites

1. `pnpm install`
2. `pnpm build:packages` (or full `pnpm build` in CI)
3. Auth emulator: `pnpm emulators` → `http://localhost:9099` ([firebase.json](../../firebase.json))

Procedural steps: [LOCAL_DEVELOPMENT.md](../../LOCAL_DEVELOPMENT.md) (owner for command copy-paste).

# Smoke test entry path (all UI examples)

Deep-link: `/screens/sign-in-auth-screen-w-handlers` (with trailing slash for Next). Smoke scope: [AD-3](../decisions.md#ad-3-playwright-example-smoke-tests-mvp-scope-dev-server).

# Citations

[1] [LOCAL_DEVELOPMENT.md](../../LOCAL_DEVELOPMENT.md)
