---
type: Work Queue
title: Playwright example e2e smoke
description: Phased, orchestrator-processable backlog to add Playwright smoke tests for every monorepo example, run them locally and in CI, then harden dependencies.
tags: [playwright, e2e, work-queue]
timestamp: 2026-07-01T00:00:00Z
status: active
---

# Goal

A fully automated e2e framework that validates each monorepo example **loads and responds to basic interaction**, runnable by **local invocation and in CI**, with one minimum-viable smoke per example. Normative scope: [AD-3](../decisions.md#ad-3-playwright-example-smoke-tests-mvp-scope-dev-server). Execution model: [AD-4](../decisions.md#ad-4-playwright-managed-dev-servers-serial-shared-emulator). Production-artifact validation is deferred: [AD-8](../decisions.md#ad-8-production-artifact-e2e-deferred-future-phase).

# Work-queue conventions

Ephemeral tracker; policy: [documentation-policy.md](../documentation-policy.md). This queue records **state** (gates, next step) using neutral OKF work-queue field conventions — not agent roles, dispatch, or session choreography.

**Work types** (`next_work_type`): `gap-analysis` (read-only feasibility) · `implementation` (author code + tests) · `independent-review` (verify a frozen diff) · `documentation` (durable doc/OKF updates) · `commit` (one focused commit).

**Validation tiers** (`validation_tier`), mapped to this repo:

| Tier | Meaning here |
|------|--------------|
| `unit-focused` | Fast local check while authoring: `pnpm build:packages`, the targeted example's spec (`pnpm test:e2e:<example>`), `pnpm lint:check` on the diff |
| `area-focused` | Full smoke for the changed example(s) on a frozen tree, plus `pnpm test` / lint / format as applicable |
| `full` | `pnpm build` + `pnpm test` + whole `pnpm test:e2e` across all examples before merge |

**Gates** (`open` | `closed`): `implementation_gate` (implementation complete + `unit-focused` green) · `review_gate` (independent review complete on frozen tree + `area-focused` green) · `commit_gate` (durable commit exists whose subject matches `commit_subject`). Code with `review_gate: open` is untrusted until review closes it. `commit_subject` is the planned Conventional Commit subject, set **before** `git commit` and staged in the same commit; never record SHAs.

# Smoke scenarios (MVP)

Per UI example, one shared spec (parameterized per project). Assert on **rendered UI, not exact URLs** — the forgot-password route differs per example ([examples-inventory.md](../architecture/examples-inventory.md)); [AD-3](../decisions.md#ad-3-playwright-example-smoke-tests-mvp-scope-dev-server).

| Step | Action | Pass criterion |
|------|--------|----------------|
| S1 | `goto` sign-in-with-handlers path | Email + password fields and submit button visible |
| S2 | Click submit (empty) | Validation feedback (no successful auth required) |
| S3 | Click forgot-password control | Forgot-password screen renders (assert heading/email field, not a fixed path) |

`custom-auth-server` is **not** a browser flow: boot the built Express server on `:4001` and assert an HTTP response ([AD-6](../decisions.md#ad-6-custom-auth-server-binds-4001-for-e2e)).

# Orchestration model

Playwright manages each example's dev server; no hand-rolled preflight/postflight/PID scripts ([AD-4](../decisions.md#ad-4-playwright-managed-dev-servers-serial-shared-emulator)).

```
scripts/e2e-run.mjs (pnpm test:e2e)
  → build:packages once (assert dist/)
  → start Auth emulator once (:9099, shared)
  → for each example in [react, shadcn, nextjs, nextjs-ssr] (angular deferred — [Phase 2b](#phase-2b--angular-example-e2e-blocked)):
       playwright test  (E2E_PROJECT=<example>)
         → globalSetup: assert packages built + emulator reachable
         → top-level webServer selected by E2E_PROJECT: start <example> dev server on its port, wait for URL
         → run smoke spec(s) for the project
         → webServer: stop dev server
  → stop emulator (globalTeardown / runner)
```

* **Serial:** `workers: 1`; `E2E_PROJECT` selects both the single Playwright project and the top-level `webServer`, so one dev server is up at a time.
* **Emulator:** started once by the runner (or first `globalSetup`, reuse-aware); shared `:9099`; stopped once.
* **Per-example debug:** `pnpm test:e2e:react` runs one project; `globalSetup` starts the emulator with reuse if not already running.

# Port map (e2e servers)

| Example | Port | Dev server command (e2e) |
|---------|------|---------------------------|
| react | 5173 | `pnpm --filter=react exec vite --port 5173 --strictPort` |
| shadcn | 5174 | `pnpm --filter=shadcn exec vite --port 5174 --strictPort` |
| nextjs | 3000 | `pnpm --filter=nextjs exec next dev --turbopack -p 3000` |
| nextjs-ssr | 3001 | `pnpm --filter=nextjs-ssr exec next dev -p 3001` (generous `webServer.timeout`, no turbopack) |
| angular-example | 4200 | `pnpm --filter=angular-example run start -- --port 4200` (reuses `clean && ng serve`) |
| custom-auth-server | 4001 | `PORT=4001 pnpm --filter=custom-auth-server start` (HTTP smoke only) |

Auth emulator `:9099`; Emulator UI `:4000` (why custom-auth-server uses `:4001`). Ports are unique, so parallel e2e is possible later — deferred ([AD-4](../decisions.md#ad-4-playwright-managed-dev-servers-serial-shared-emulator)).

# Root scripts

| Script | Status | Purpose |
|--------|--------|---------|
| `test:e2e` | **implemented** | Serial runner over react, shadcn, nextjs, nextjs-ssr |
| `test:e2e:react` | **implemented** | react smoke only (`E2E_PROJECT=react`) |
| `test:e2e:shadcn` | **implemented** | shadcn only |
| `test:e2e:nextjs` | **implemented** | nextjs only |
| `test:e2e:nextjs-ssr` | **implemented** | nextjs-ssr only |
| `test:e2e:angular` | planned (2b) | angular-example — blocked on bootstrap (see Phase 2b) |
| `test:e2e:custom-auth-server` | planned (4.1) | custom-auth-server HTTP smoke only |

# CI coverage

| What | Status |
|------|--------|
| Local `pnpm test:e2e` | **4 UI examples** (react, shadcn, nextjs, nextjs-ssr) — green |
| [`.github/workflows/e2e.yaml`](../../.github/workflows/e2e.yaml) | **`pnpm test:e2e`** — same four examples in CI; actions pinned (checkout v7, setup-node v6, pnpm v6) |

When angular e2e closes ([Phase 2b](#phase-2b--angular-example-e2e-blocked)), add it to the serial runner and confirm **five** examples green in CI ([2b.4](#phase-2b--angular-example-e2e-blocked)).

# Per-item iteration protocol

Each item runs one serial loop; the queue records the outcome after each step.

| Step | Work type | Closes gate |
|------|-----------|-------------|
| 1 | `implementation` | `implementation_gate` (`unit-focused` green) |
| 2 | `independent-review` | `review_gate` (frozen tree, `area-focused` green; blocking findings → back to step 1) |
| 3 | `documentation` | — (only if durable docs/OKF changed) |
| 4 | `commit` | `commit_gate` (set `commit_subject`, stage queue with product change) |

# Work items

## Phase 1 — React vertical slice (infra + first test + CI proof)

Prove the whole model end-to-end on one example before generalizing ([review finding #13](#review-notes)).

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 1.1 | `e2e/` workspace package; `@playwright/test` pinned via pnpm catalog; skeleton `playwright.config.ts` | — | Package installs; empty config runs |
| 1.2 | `globalSetup`/`globalTeardown`: run `build:packages` and assert `dist/`; ensure/start shared Auth emulator on `:9099`; stop what it started | 1.1 | Setup fails fast with clear errors; emulator reused if already up |
| 1.3 | `e2e/fixtures/example-meta.ts`: seed react (baseURL, sign-in path, trailing-slash rule, forgot-password target) | 1.1 | Per-example path rules centralized |
| 1.4 | react project `webServer` (`vite --port 5173 --strictPort`); harness `page.route` block of `accounts.google.com` **with a comment explaining why** (One Tap external/flaky — [AD-5](../decisions.md#ad-5-auth-behavior-e2e-flags-are-optional-only-if-flaky)) | 1.2, 1.3 | react dev server managed by Playwright; One Tap script never loaded |
| 1.5 | `e2e/tests/sign-in-handlers.spec.ts` S1–S3, asserting rendered UI, parameterized per project | 1.4 | react smoke green locally |
| 1.6 | Minimal CI job proving react e2e runs green (browser install + emulator + `test:e2e:react`) | 1.5 | react smoke green in CI |

## Phase 2 — Generalize Vite/Next examples + serial runner

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 2.1 | shadcn project + meta (`vite --port 5174`; forgot-password → `/screens/forgot-password-screen`) | 1.5 | shadcn smoke green |
| 2.2 | nextjs project + meta (`next dev -p 3000`; `trailingSlash`) | 1.5 | nextjs smoke green |
| 2.3 | nextjs-ssr project + meta (`next dev -p 3001`; generous `webServer.timeout`) | 1.5 | nextjs-ssr smoke green |
| 2.5 | `scripts/e2e-run.mjs` serial runner + root `test:e2e` / `test:e2e:<example>` scripts; **CI** runs `pnpm test:e2e` (four UI examples) with pinned modern actions | 2.1–2.3 | `pnpm test:e2e` green locally and in CI |

## Phase 2b — Angular-example e2e (blocked)

Split from Phase 2 after e2e attempt failed; angular is **not** in `example-meta`, `e2e-run.mjs`, or CI until resolved.

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 2b.1 | angular-example project + meta (reuse `run start -- --port 4200`, i.e. `clean && ng serve`) | 2.5 | meta + `test:e2e:angular` wired |
| 2b.2 | Fix client bootstrap so sign-in form renders in Playwright | 2b.1 | S1–S3 green locally |
| 2b.3 | Add angular-example to `e2e-run.mjs` + `pnpm test:e2e` | 2b.2 | full serial runner includes angular (five UI examples) |
| 2b.4 | Add angular-example to CI: confirm `pnpm test:e2e` (five UI examples) green on a PR | 2b.3 | CI serial smoke includes angular |

### Angular e2e blocker (observed 2026-07-03)

Playwright loads `http://localhost:4200/screens/sign-in-auth-screen-w-handlers` but the sign-in form never appears (`input[name="email"]` times out after 30s). Browser console:

```
NG0201: No provider found for `FirebaseApps`. Source: Environment Injector.
  Path: firebaseui.store → FirebaseApps
```

`examples/angular/src/app/app.config.ts` registers `provideFirebaseApp(...)` and `provideFirebaseUI(...)`, but under `ng serve` the `FIREBASE_UI_STORE` factory still failed to resolve `FirebaseApps` in the client injector until the local workspace package was installed as an injected dependency. The package already declares `@angular/fire` as a peer; `dependenciesMeta["@firebase-oss/ui-angular"].injected = true` makes the Angular example consume a peer-resolved workspace copy instead of the source package's devDependency peer context. With the provider factory cleanup and injected workspace dependency, `pnpm test:e2e:angular` passes `3/3`.

**Next steps:** reproduce with `E2E_PROJECT=angular-example pnpm --filter=e2e exec playwright test --project=angular-example`; fix provider/DI wiring in the example app and/or `@firebase-oss/ui-angular` before re-adding angular to the serial runner.

## Phase 3 — CI hardening

Depends on Phase 2 CI baseline ([2.5](#phase-2--generalize-vitenext-examples--serial-runner)); browser-cache work applies once the runner is stable in GHA.

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 3.1 | E2e workflow hardening: `playwright install --with-deps chromium` with **browser cache keyed on resolved Playwright version**; confirm `pnpm test:e2e` green in CI | 2.5 | e2e green on PRs; browsers cached across runs |
| 3.2 | Broad path triggers: `packages/**`, `examples/**`, root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `e2e/**`, workflow file ([AD-7](../decisions.md#ad-7-e2e-runs-in-a-separate-ci-workflow-with-broad-triggers)) | 3.1 | Relevant PRs trigger e2e; shared-dependency changes not missed |

## Phase 4 — custom-auth-server smoke

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 4.1 | Bind `custom-auth-server` to `:4001` for e2e; boot built server + assert HTTP response (non-browser); wire into runner + CI ([AD-6](../decisions.md#ad-6-custom-auth-server-binds-4001-for-e2e)) | 2.5, 3.1 | custom-auth-server smoke green locally and in CI |

## Phase 5 — Optional auth-behavior flags (only if flaky)

Skip entirely unless Phase 1–2 prove flaky ([AD-5](../decisions.md#ad-5-auth-behavior-e2e-flags-are-optional-only-if-flaky)).

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 5.1 | react + shadcn: skip `oneTapSignIn` when `VITE_E2E=1` | 2.1 | Only if `page.route` block insufficient |
| 5.2 | nextjs + nextjs-ssr: skip `autoAnonymousLogin` when `NEXT_PUBLIC_E2E=1` | 2.3 | Only if anon sign-in destabilizes smoke |

## Phase 6 — Dependency hardening (after smoke green)

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 6.1 | Align example deps to pnpm catalog / current stable | 3.1 | CVE audit improved |
| 6.2 | Run [dependency-update-verification.md](../playbooks/dependency-update-verification.md) including `test:e2e` | 6.1 | Smoke passes on dep PR |
| 6.3 | Optional `pnpm audit --audit-level=high` in CI | 6.2 | Team decision |

# Gate tracker

Update immediately after each step closes a gate. All items start `open` / `implementation`.

| Phase | Item | `implementation_gate` | `review_gate` | `commit_gate` | `commit_subject` | `next_work_type` | `validation_tier` | Notes |
|-------|------|----------------------|---------------|---------------|------------------|------------------|-------------------|-------|
| 1 | 1.1 e2e package + config skeleton | closed | closed | closed | test(e2e): install/configure playwright, implement react e2e smoke test | — | — | Shipped in Phase 1 commit. |
| 1 | 1.2 globalSetup/teardown (build + emulator) | closed | closed | closed | test(e2e): install/configure playwright, implement react e2e smoke test | — | — | |
| 1 | 1.3 example-meta (react seed) | closed | closed | closed | test(e2e): install/configure playwright, implement react e2e smoke test | — | — | |
| 1 | 1.4 react webServer + One Tap route-block | closed | closed | closed | test(e2e): install/configure playwright, implement react e2e smoke test | — | — | top-level webServer + `E2E_PROJECT`. |
| 1 | 1.5 sign-in-handlers spec S1–S3 (react) | closed | closed | closed | test(e2e): install/configure playwright, implement react e2e smoke test | — | — | 3/3 passed locally. |
| 1 | 1.6 minimal CI proof (react) | closed | closed | closed | test(e2e): install/configure playwright, implement react e2e smoke test | — | — | Phase 1 react-only proof; expanded to 4-example `pnpm test:e2e` in Phase 2 commit. |
| 2 | 2.1 shadcn | closed | closed | closed | test: working e2e tests for shadcn, nextjs, and nextjs-ssr | — | — | 3/3 green. |
| 2 | 2.2 nextjs | closed | closed | closed | test: working e2e tests for shadcn, nextjs, and nextjs-ssr | — | — | 3/3; forgot-password handler added to example page. |
| 2 | 2.3 nextjs-ssr | closed | closed | closed | test: working e2e tests for shadcn, nextjs, and nextjs-ssr | — | — | 3/3 green. |
| 2 | 2.5 serial runner + root scripts | closed | closed | closed | test: working e2e tests for shadcn, nextjs, and nextjs-ssr | — | — | `pnpm test:e2e` local + CI (4 examples); modern pinned actions. |
| 2b | 2b.1 angular meta + script | closed | closed | closed | test(angular): e2e test for angular example | — | — | `test:e2e:angular` wired. |
| 2b | 2b.2 fix NG0201 bootstrap | closed | closed | closed | test(angular): e2e test for angular example | — | — | fixed via peer-resolved injected workspace dependency + provider factory cleanup. |
| 2b | 2b.3 wire angular into serial runner | closed | closed | closed | test(angular): e2e test for angular example | — | — | `pnpm test:e2e` = five UI examples, green locally. |
| 2b | 2b.4 add angular to CI + verify | closed | closed | closed | test(angular): e2e test for angular example | — | — | workflow already runs `pnpm test:e2e`; next PR run verifies in GHA. |
| 3 | 3.1 e2e workflow browser cache | open | open | open | — | implementation | area-focused | blocked on 2.5 CI baseline |
| 3 | 3.2 broad path triggers | open | open | open | — | implementation | unit-focused | |
| 4 | 4.1 custom-auth-server HTTP smoke (:4001) | open | open | open | — | implementation | area-focused | |
| 5 | 5.1 VITE_E2E skip oneTapSignIn | open | open | open | — | implementation | unit-focused | only if flaky |
| 5 | 5.2 NEXT_PUBLIC_E2E skip autoAnonymousLogin | open | open | open | — | implementation | unit-focused | only if flaky |
| 6 | 6.1 align example deps | open | open | open | — | implementation | area-focused | |
| 6 | 6.2 dep-update playbook incl. test:e2e | open | open | open | — | implementation | full | |
| 6 | 6.3 optional audit gate | open | open | open | — | implementation | unit-focused | team decision |

# File layout (target)

```
e2e/
├── package.json
├── playwright.config.ts        # projects + top-level webServer selected by E2E_PROJECT; globalSetup/teardown
├── global-setup.ts             # build:packages assert + start/reuse emulator
├── global-teardown.ts          # stop emulator if started here
├── fixtures/
│   └── example-meta.ts         # baseURL, sign-in path, trailing-slash, forgot-password target
└── tests/
    └── sign-in-handlers.spec.ts
scripts/
└── e2e-run.mjs                 # serial per-example runner for `pnpm test:e2e`
```

# Deferred

| Item | Reason |
|------|--------|
| Production-artifact e2e (SSG export, SSR `next start`, Angular prod build, hosting rewrites) | Future design phase; MVP is dev-server only — [AD-8](../decisions.md#ad-8-production-artifact-e2e-deferred-future-phase) |
| Parallel multi-example e2e | Unique ports make it possible later; serial sufficient for MVP — [AD-4](../decisions.md#ad-4-playwright-managed-dev-servers-serial-shared-emulator) |
| Real emulator sign-in flows | Post-MVP user scenarios |
| Multi-browser matrix | Chromium only for MVP |
| Angular-SSR smoke | Angular tested via CSR `ng serve`; SSR path deferred |

# Review notes

Feasibility review (verified against code) that shaped this queue:

* Deep-link `/screens/sign-in-auth-screen-w-handlers` exists in all five UI examples; forgot-password target differs (shadcn `/screens/forgot-password-screen` vs react/angular `/screens/forgot-password-auth-screen`) → S3 asserts rendered UI.
* `SignInAuthScreen` renders the form regardless of auth state → auth-behavior flags decoupled (Phase 5, optional).
* Playwright top-level `webServer` selected by `E2E_PROJECT` + `globalSetup` replace hand-rolled orchestration (biggest simplification).
* `custom-auth-server` default `:4000` collides with Emulator UI → `:4001`.
* CI path-filtering must be broad (examples depend on `packages/**`, root manifests, lockfile, catalog).
* #13: react-only vertical slice first, to validate the model cheaply.
* **CI lag (angular only):** four UI examples run in GHA; angular waits on Phase 2b.

# Related

* [architecture/examples-inventory.md](../architecture/examples-inventory.md)
* [architecture/testing-strategy.md](../architecture/testing-strategy.md)
* [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md)
