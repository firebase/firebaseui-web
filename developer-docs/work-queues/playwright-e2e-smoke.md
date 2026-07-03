---
type: Work Queue
title: Playwright example e2e smoke
description: Phased, orchestrator-processable backlog to add Playwright smoke tests for every monorepo example, run them locally and in CI, then harden dependencies.
tags: [playwright, e2e, work-queue]
timestamp: 2026-07-03T00:00:00Z
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

**Gates** (`open` | `closed` | `deferred`): `implementation_gate` (implementation complete + `unit-focused` green) · `review_gate` (independent review complete on frozen tree + `area-focused` green) · `commit_gate` (durable commit exists whose subject matches `commit_subject`). `deferred` = optional work parked until a trigger (e.g. flakiness) re-opens it. Code with `review_gate: open` is untrusted until review closes it. `commit_subject` is the planned Conventional Commit subject, set **before** `git commit` and staged in the same commit; never record SHAs.

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
  → for each example in [react, shadcn, nextjs, nextjs-ssr, angular-example, custom-auth-server]:
       playwright test  (E2E_PROJECT=<example>)
         → globalSetup: assert packages built + emulator reachable
         → top-level webServer selected by E2E_PROJECT (UI examples only; custom-auth-server boots in spec)
         → run smoke spec(s) for the project
         → webServer: stop dev server (UI examples)
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

| Script | Purpose |
|--------|---------|
| `test:e2e` | Serial runner: five UI examples + `custom-auth-server` HTTP smoke |
| `test:e2e:react` | react only (`E2E_PROJECT=react`) |
| `test:e2e:shadcn` | shadcn only |
| `test:e2e:nextjs` | nextjs only |
| `test:e2e:nextjs-ssr` | nextjs-ssr only |
| `test:e2e:angular` | angular-example only |
| `test:e2e:custom-auth-server` | `custom-auth-server` HTTP smoke only |

# CI coverage

See [architecture/testing-strategy.md](../architecture/testing-strategy.md) and [`.github/workflows/e2e.yaml`](../../.github/workflows/e2e.yaml). Workflow runs `pnpm test:e2e` with broad path triggers — [AD-7](../decisions.md#ad-7-e2e-runs-in-a-separate-ci-workflow-with-broad-triggers).

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
| 2.5 | `scripts/e2e-run.mjs` serial runner + root `test:e2e` / `test:e2e:<example>` scripts; CI runs `pnpm test:e2e` | 2.1–2.3 | `pnpm test:e2e` covers all wired UI examples locally and in CI |

## Phase 2b — Angular-example e2e

Split from Phase 2 when bootstrap failed under workspace linking; resolved via peer-resolved injected workspace dependency and provider factory cleanup in `@firebase-oss/ui-angular`.

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 2b.1 | angular-example project + meta (reuse `run start -- --port 4200`, i.e. `clean && ng serve`) | 2.5 | meta + `test:e2e:angular` wired |
| 2b.2 | Fix client bootstrap so sign-in form renders in Playwright | 2b.1 | S1–S3 pass locally |
| 2b.3 | Add angular-example to `e2e-run.mjs` + `pnpm test:e2e` | 2b.2 | serial runner includes angular (five UI examples) |
| 2b.4 | Confirm `pnpm test:e2e` in CI includes angular | 2b.3 | CI serial smoke includes angular |

## Phase 3 — CI hardening

Depends on Phase 2 CI baseline ([2.5](#phase-2--generalize-vitenext-examples--serial-runner)).

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 3.1 | E2e workflow hardening: `playwright install --with-deps chromium` with **browser cache keyed on resolved Playwright version**; confirm `pnpm test:e2e` green in CI | 2.5 | e2e green on PRs; browsers cached across runs |
| 3.2 | Broad path triggers: `packages/**`, `examples/**`, root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `e2e/**`, workflow file ([AD-7](../decisions.md#ad-7-e2e-runs-in-a-separate-ci-workflow-with-broad-triggers)) | 3.1 | Relevant PRs trigger e2e; shared-dependency changes not missed |

## Phase 4 — custom-auth-server smoke

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| 4.1 | Bind `custom-auth-server` to `:4001` for e2e; boot built server + assert HTTP response (non-browser); wire into runner + CI ([AD-6](../decisions.md#ad-6-custom-auth-server-binds-4001-for-e2e)) | 2.5, 3.1 | custom-auth-server smoke in `pnpm test:e2e` locally and in CI |

## Phase 5 — Optional auth-behavior flags (deferred)

Deferred — no flakiness observed; `page.route` One Tap block is sufficient ([AD-5](../decisions.md#ad-5-auth-behavior-e2e-flags-are-optional-only-if-flaky)). Re-open only if smoke becomes unstable.

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
| 1 | 1.1–1.6 Phase 1 (react vertical slice) | closed | closed | closed | test(e2e): install/configure playwright, implement react e2e smoke test | — | — | |
| 2 | 2.1–2.3 shadcn, nextjs, nextjs-ssr | closed | closed | closed | test: working e2e tests for shadcn, nextjs, and nextjs-ssr | — | — | |
| 2 | 2.5 serial runner + root scripts | closed | closed | closed | test: working e2e tests for shadcn, nextjs, and nextjs-ssr | — | — | |
| 2b | 2b.1–2b.4 angular-example e2e | closed | closed | closed | test(angular): e2e test for angular example | — | — | |
| 3 | 3.1–3.2 CI hardening | closed | closed | closed | ci(e2e): harden workflow triggers and browser cache | — | — | |
| 4 | 4.1 custom-auth-server HTTP smoke (:4001) | closed | closed | closed | test(e2e): add custom-auth-server HTTP smoke on :4001 | — | — | |
| 5 | 5.1 VITE_E2E skip oneTapSignIn | deferred | deferred | deferred | — | — | — | optional; no flakiness observed |
| 5 | 5.2 NEXT_PUBLIC_E2E skip autoAnonymousLogin | deferred | deferred | deferred | — | — | — | optional; no flakiness observed |
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
│   └── example-meta.ts         # per-example routing and server metadata (ui | http kind)
└── tests/
    ├── sign-in-handlers.spec.ts
    └── custom-auth-server.spec.ts
scripts/
└── e2e-run.mjs                 # serial per-example runner for `pnpm test:e2e`
```

# Deferred

| Item | Reason |
|------|--------|
| Auth-behavior E2E flags (`VITE_E2E`, `NEXT_PUBLIC_E2E`) | No flakiness observed; `page.route` block sufficient — [AD-5](../decisions.md#ad-5-auth-behavior-e2e-flags-are-optional-only-if-flaky) |
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

# Related

* [architecture/examples-inventory.md](../architecture/examples-inventory.md)
* [architecture/testing-strategy.md](../architecture/testing-strategy.md)
* [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md)
