---
type: Decision Log
title: Architecture decisions
description: Sequential decision log for firebaseui-web. Entries use AD-number identifiers.
tags: [adr, architecture]
timestamp: 2026-07-01T00:00:00Z
---

Decisions follow the shape in [ADR format (mattpocock)](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md) (read that spec only during documentation maintenance runs).

---

## AD-1: Dependabot cooldown per ecosystem

Dependabot version-update PRs use a **7-day cooldown** on all ecosystems. Semver cooldown fields (`semver-major-days`, `semver-minor-days`, `semver-patch-days`) are set to 7 only where [GitHub documents SemVer-bump support](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#cooldown) for that package manager. GitHub Actions blocks use `default-days: 7` only. Initial config PRs (#1378 Android/iOS) merged without full cooldown; follow-ups align configs (#1380 web, #2355 Android, #1367 iOS).

---

## AD-2: developer-docs OKF bundle at repository root

Durable human+agent knowledge lives in `developer-docs/` as an [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle. Root guides (`LOCAL_DEVELOPMENT.md`, etc.) remain the owners for contributor onboarding commands; this bundle owns architecture, decisions, playbooks, and work queues. Agents should start at [developer-docs/index.md](index.md) or [AGENTS.md](../AGENTS.md).

---

## AD-3: Playwright example smoke tests (MVP scope, dev-server)

Example apps are verified with **Playwright smoke tests**, not full user-flow e2e. MVP per UI example (react, shadcn, nextjs, nextjs-ssr, angular): deep-link to the sign-in-with-handlers screen, assert form render, empty submit shows validation, and the forgot-password control navigates to a rendered forgot-password screen. Assertions target **rendered UI**, not exact URLs, because the forgot-password route differs per example ([examples-inventory.md](architecture/examples-inventory.md)). `custom-auth-server` is covered by a **non-browser boot + HTTP smoke** ([AD-6](#ad-6-custom-auth-server-binds-4001-for-e2e)), not a browser flow. Smoke runs against **dev servers**, which auto-connect the Auth emulator in dev mode; production build artifacts are out of MVP ([AD-8](#ad-8-production-artifact-e2e-deferred-future-phase)). Out of MVP: OAuth, phone/MFA, real sign-in. Package unit tests (`pnpm test`) and compile checks (`pnpm build`) remain necessary but insufficient for runtime UI regression.

---

## AD-4: Playwright-managed dev servers, serial, shared emulator

Each example has a **unique e2e port** — see [examples-inventory.md](architecture/examples-inventory.md). Playwright's **top-level** `webServer` (one at a time, selected via `E2E_PROJECT`) starts each UI example's dev server, waits for its URL, and stops it — replacing hand-rolled preflight/postflight/PID scripts. Execution is **serial** (`workers: 1`) for resource predictability and clean logs; because ports are unique, parallelization is possible later but deferred ([Deferred](work-queues/playwright-e2e-smoke.md#deferred)). **`globalSetup`** builds packages (`build:packages`, asserting `dist/` exists — examples consume built `@firebase-oss/ui-*`), ensures a single Auth emulator on `:9099` for the whole run (reuse-aware), and starts it when not already running; **`globalTeardown`** stops what globalSetup started unless the serial runner is mid-suite (`E2E_KEEP_EMULATOR=1`). Angular reuses its package `start` semantics (`pnpm clean && ng serve`) rather than duplicating the `.angular/cache` clean.

---

## AD-5: Auth-behavior E2E flags are optional (only if flaky)

`SignInAuthScreen` renders the email/password form **regardless of auth state** (verified: no redirect or hide on `currentUser`; it only fires an `onSignIn` callback). Therefore `autoAnonymousLogin` (nextjs, nextjs-ssr) and `oneTapSignIn` (react, shadcn) do **not** block the smoke form-render assertions, and the E2E env flags (`VITE_E2E` / `NEXT_PUBLIC_E2E`) that skip these behaviors are a **flakiness mitigation, not a prerequisite** — decoupled from the test phase. The external One Tap script (`accounts.google.com`) is neutralized in the harness via a **documented Playwright `page.route` block**; the env flags are a backup only if that proves insufficient. Owner for emulator connection rules: [architecture/examples-inventory.md](architecture/examples-inventory.md).

---

## AD-6: custom-auth-server binds :4001 for e2e

The Express `custom-auth-server` defaults to `:4000`, which collides with the **Firebase Emulator UI** (`:4000`). For e2e it binds **`:4001`** (via its `PORT` env) so it never conflicts with emulator services. Its smoke is a **non-browser boot + HTTP assertion** — build the example, start the built server, assert it responds, tear down — not a Playwright browser flow. This brings every monorepo example (including `custom-auth-server`) under automated e2e coverage.

**Lifecycle:** Playwright's `webServer` readiness poll accepts only HTTP status `< 400`. Without credentials, `GET /auth/snapchat/config` returns `500`, so the HTTP smoke spec manages build/boot/poll/teardown itself (detached process group, `:4001` via `PORT`). UI examples continue to use Playwright `webServer` as in [AD-4](#ad-4-playwright-managed-dev-servers-serial-shared-emulator).

---

## AD-7: e2e runs in a separate CI workflow with broad triggers

Browser smoke runs in its **own workflow**, not folded into the unit `test.yaml`. Path-filtering is intentionally **broad**: examples depend on `packages/**` (built `@firebase-oss/ui-*`), `scripts/**` (serial runner), `firebase.json` (emulator config), the root `package.json`, `pnpm-lock.yaml`, and the `pnpm-workspace.yaml` catalog, so narrow `examples/**`-only filters would miss real regressions. Triggers therefore include packages, examples, scripts, root manifests, lockfile, workspace catalog, emulator config, and the e2e/workflow files themselves. Playwright browser binaries are **cached keyed on the resolved Playwright version** so the cache restores the actual browser artifact; Chromium-only for MVP.

---

## AD-8: Production-artifact e2e deferred (future phase)

MVP validates **dev-server runtime only**. Validating built/deployed artifacts — Next.js SSG `output: "export"`, Angular production build, `next start` SSR, and `firebase.json` hosting rewrites — is a recognized gap: dev mode auto-connects the emulator via `import.meta.env.MODE` / `process.env.NODE_ENV` / `isDevMode()`, so production builds would need explicit emulator wiring. This is tracked as a **future design phase and is intentionally NOT in the MVP work queue** ([work-queues/playwright-e2e-smoke.md](work-queues/playwright-e2e-smoke.md)).
