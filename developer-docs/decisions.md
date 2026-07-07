---
type: Decision Log
title: Architecture decisions
description: Sequential decision log for firebaseui-web. Entries use AD-number identifiers.
tags: [adr, architecture]
timestamp: 2026-07-03T00:00:00Z
---

Decisions follow the shape in [ADR format (mattpocock)](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md) (read that spec only during documentation maintenance runs).

---

## AD-1: Dependabot cooldown per ecosystem

Dependabot version-update PRs use a **7-day cooldown** on all ecosystems. Semver cooldown fields (`semver-major-days`, `semver-minor-days`, `semver-patch-days`) are set to 7 only where [GitHub documents SemVer-bump support](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#cooldown) for that package manager. GitHub Actions blocks use `default-days: 7` only. Initial config PRs (#1378 Android/iOS) merged without full cooldown; follow-ups align configs (#1380 web, #2355 Android, #1367 iOS). **npm groups** (angular, typescript, playwright, firebase-js) keep related catalog entries on one PR — see [.github/dependabot.yml](../.github/dependabot.yml).

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

---

## AD-9: Firebase JS SDK version policy (v11 resolved, v12 for consumers)

The monorepo **resolves** `firebase` **11.x** in the pnpm catalog (`^11.10.0` today). That is **not a regression** from a stable v12 baseline: catalog `^12.2.1` existed only briefly during the Sep 2025 catalog migration and was reverted; main has used catalog **11.x since Sep 2025** ([commit a275905a](https://github.com/firebase/firebaseui-web/commit/a275905a7598cb9d9e1be2250befc840334e8ab2) — peer range widened to `^11 || ^12` while keeping catalog 11 for AngularFire).

**Why catalog 11:** `@angular/fire@20.0.1` depends on `firebase ^11.8.0` and `rxfire ^6.1.0` (rxfire peers firebase through **^11**). `@firebase-oss/ui-angular` imports both `@angular/fire/auth` and `firebase/auth` directly; forcing catalog **12** duplicates SDK types at compile time (e.g. `RecaptchaVerifier`, `TotpSecret`) — same class of failure as [angular/angularfire#3666](https://github.com/angular/angularfire/issues/3666).

**Consumer policy:** package **peer** catalog stays **`firebase: ^11 || ^12`** — apps embedding `@firebase-oss/ui-*` may install firebase 12; published packages must remain compatible with both majors where types overlap.

**Angular paths (explicit pin):** `packages/angular` and `examples/angular` keep a **non-catalog** devDependency pin (e.g. `"firebase": "^11.10.0"`) aligned with `@angular/fire`, not the workspace catalog entry.

**Optional internal split (prove v12 sooner):** bump catalog `firebase` to **12.x** for core/react/shadcn and non-angular examples (`"firebase": "catalog:"`); leave angular packages on explicit **11.x** pins so pnpm can install both majors. Validate with `pnpm build`, `pnpm test`, and `pnpm test:e2e` (especially `@firebase-oss/ui-angular` and the angular example). Do **not** use a workspace-wide `pnpm.overrides` forcing firebase 12 — that breaks AngularFire immediately.

**Upstream to track (harmonize on v12 later):**

| Track | Link |
|-------|------|
| Firebase 12 on AngularFire v20 | [angular/angularfire#3666](https://github.com/angular/angularfire/issues/3666) |
| AngularFire v21 (Angular 21 + firebase 12) | [21.0.0-rc.0 release](https://github.com/angular/angularfire/releases/tag/21.0.0-rc.0), [angular/angularfire#3689](https://github.com/angular/angularfire/issues/3689) |
| rxfire firebase 12 (blocks AngularFire 21) | [FirebaseExtended/rxfire#123](https://github.com/FirebaseExtended/rxfire/pull/123) |
| Firebase JS SDK releases | [firebase-js-sdk releases](https://github.com/firebase/firebase-js-sdk/releases), [Firebase JS release notes](https://firebase.google.com/support/release-notes/js) |

**Unlock:** when **AngularFire 21 stable** (and rxfire firebase 12) ships, bump `@angular/fire`, angular pins, and catalog together in one verified change.

Owner for catalog/peer fields: [pnpm-workspace.yaml](../pnpm-workspace.yaml). Verification steps: [playbooks/change-authoring-verification.md](playbooks/change-authoring-verification.md), [playbooks/dependency-update-verification.md](playbooks/dependency-update-verification.md).

---

## AD-10: Change authoring requires CI-parity verification before commit

Authors (human or agent) **must not commit or push** changes that touch dependencies, CI workflows, or example/test harnesses until [change-authoring-verification.md](playbooks/change-authoring-verification.md) **Required sequence** completes locally with exit code 0.

**Why:** CI runs `pnpm test:e2e` and builds `custom-auth-server` on demand; root `pnpm build` does not. Skipping e2e or custom-auth-server build allowed firebase-admin 14 and jsdom/`localStorage` test drift to land while local `pnpm test` + `pnpm build` passed on a different Node version.

**Includes:** run on the **same Node major as CI** ([LOCAL_DEVELOPMENT.md](../LOCAL_DEVELOPMENT.md)). Use the playbook one-shot script for dependency PRs. **Style guide:** [`.gemini/styleguide.md`](../.gemini/styleguide.md) compliance is part of the bar — not only `pnpm test` / `pnpm test:e2e` (e.g. Rule 11: duplicate workspace deps belong in the pnpm catalog; `pnpm lint:check` && `pnpm format:check` per [change-authoring-verification.md](playbooks/change-authoring-verification.md)).

**Does not replace** code review or CI; it is the minimum pre-commit bar for change classes above.

---

## AD-11: Angular 22 and TypeScript 6 as a coordinated catalog bump

**Context:** Dependabot PR [#1387](https://github.com/firebase/firebaseui-web/pull/1387) bumped only `@angular/platform-browser` to v22 while the rest of the Angular stack stayed on v20. CI failed: Angular 22 FESM metadata (`ɵɵFactoryTarget`, `minVersion: "22.0.0"`) is incompatible with Angular 20 build tooling. Partial Angular majors are invalid ([Dependabot groups](#ad-1-dependabot-cooldown-per-ecosystem) mitigate recurrence).

**Decision:** When adopting a new Angular major, bump **the full Angular catalog atomically** — all `@angular/*`, `@angular-devkit/*`, `ng-packagr`, `angular-eslint`, and `jest-preset-angular` — in one verified change. Angular 22 requires **TypeScript 6** (`>=6.0.0 <6.1.0` per `@angular/compiler-cli`).

**@angular/fire @20 on Angular 22:** Keep `@angular/fire@^20.0.1` (latest stable; peers `@angular/core@^20.0.0` only). No stable AngularFire release targets Angular 22 yet ([angular/angularfire#3678](https://github.com/angular/angularfire/issues/3678), [angular/angularfire#3689](https://github.com/angular/angularfire/issues/3689), [21.0.0-rc.0](https://github.com/angular/angularfire/releases/tag/21.0.0-rc.0)). Proceed with **pnpm `peerDependencyRules.allowedVersions`** for Angular 22 peers and validate with full CI parity ([AD-10](#ad-10-change-authoring-requires-ci-parity-verification-before-commit)). This is an **unsupported upstream combo** until AngularFire ships a matching major; re-evaluate when **AngularFire 21+ stable** lands (see [AD-9](#ad-9-firebase-js-sdk-version-policy-v11-resolved-v12-for-consumers) unlock). **Do not** bump `firebase` to 12 on angular paths while on AngularFire 20.

**TypeScript 6 / `baseUrl`:**

| Layer | Action |
|-------|--------|
| Hand-authored tsconfigs | Remove redundant `baseUrl: "."` where `paths` already use `./`-prefixed targets ([TS 6 migration](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html#deprecated---baseurl)). |
| tsup `dts` pipeline | **Temporary** `ignoreDeprecations: "6.0"` in each tsup package's `dts.compilerOptions` — not in root tsconfig. tsup 8.5.1 injects `baseUrl: '.'` when calling `rollup-plugin-dts`, triggering `TS5101` even when user configs omit `baseUrl` ([egoist/tsup#1388](https://github.com/egoist/tsup/issues/1388), [egoist/tsup#1389](https://github.com/egoist/tsup/issues/1389)). `rollup-plugin-dts` 6.4.x added TS6 compatibility ([rollup-plugin-dts CHANGELOG](https://github.com/Swatinem/rollup-plugin-dts/blob/master/CHANGELOG.md)); the blocker is tsup's injection, not our tsconfigs. Remove suppression when tsup stops injecting `baseUrl` or we replace the dts pipeline (e.g. `tsc --emitDeclarationOnly`). |

**ng-packagr 22:** Update `@firebase-oss/ui-angular` package `exports`/`typings` to `./dist/types/firebase-oss-ui-angular.d.ts` (output path changed from v20).

**Status:** Speculative — held locally until `pnpm build`, `pnpm test`, `pnpm test:e2e`, and [`.gemini/styleguide.md`](../.gemini/styleguide.md) compliance (`pnpm lint:check`, `pnpm format:check`, catalog rules) pass on CI Node. Owner: [pnpm-workspace.yaml](../pnpm-workspace.yaml) catalog + [playbooks/dependency-update-verification.md](playbooks/dependency-update-verification.md).

