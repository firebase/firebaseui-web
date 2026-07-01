---
type: Work Queue
title: Playwright example e2e smoke
description: Phased backlog to add Playwright smoke tests for all UI examples and gate dependency updates.
tags: [playwright, e2e, work-queue]
timestamp: 2026-07-01T00:00:00Z
status: active
---

# Goal

Playwright smoke tests that validate example apps still **load and respond to basic interaction** after dependency updates. Normative scope: [AD-3](../decisions.md#ad-3-playwright-example-smoke-tests-mvp-scope). Execution model: [AD-4](../decisions.md#ad-4-serial-per-example-e2e-with-preflight-and-postflight).

# Smoke scenarios (MVP)

Per UI example, one spec file (shared helpers):

| Step | Action | Pass criterion |
|------|--------|----------------|
| S1 | `goto` sign-in-with-handlers path | Email + password fields and submit button visible |
| S2 | Click submit (empty) | Validation feedback (no successful auth required) |
| S3 | Click forgot-password control | Forgot-password screen renders |

Paths: see [architecture/examples-inventory.md](../architecture/examples-inventory.md). Prefer role/locator selectors; add minimal `data-testid` only if i18n blocks stability ([AD-3](../decisions.md#ad-3-playwright-example-smoke-tests-mvp-scope)).

Optional stretch (same phase or follow-up): home page route-list click for react, shadcn, angular only.

# Orchestration model

```
pnpm test:e2e
  → for each example in [react, shadcn, nextjs, nextjs-ssr, angular]:
       pnpm test:e2e:<example>
         → node scripts/e2e-preflight.mjs --example=<example>
         → playwright test --project=<example>
         → node scripts/e2e-postflight.mjs --example=<example>
```

* **Serial:** `test:e2e` invokes per-example targets in fixed order; no two dev servers at once.
* **Emulator:** started once before the loop (or first preflight); stays up until final postflight; shared `:9099`.
* **Preflight:** host requirements + target ports free + optional `curl` emulator ready.
* **Postflight:** stop example dev server PID recorded by preflight; verify ports released.

Per-example scripts allow local debugging: `pnpm test:e2e:react` only.

# Proposed root scripts (not implemented yet)

| Script | Purpose |
|--------|---------|
| `test:e2e` | Serial runner over all UI examples |
| `test:e2e:react` | react only |
| `test:e2e:shadcn` | shadcn only |
| `test:e2e:nextjs` | nextjs only |
| `test:e2e:nextjs-ssr` | nextjs-ssr only |
| `test:e2e:angular` | angular-example only |
| `test:e2e:preflight` | Delegates to `scripts/e2e-preflight.mjs` |
| `test:e2e:postflight` | Delegates to `scripts/e2e-postflight.mjs` |

# Port map (e2e dev servers)

| Example | Port | Dev server command (e2e) |
|---------|------|---------------------------|
| react | 5173 | `pnpm --filter=react exec vite -- --port 5173 --strictPort` |
| shadcn | 5174 | `pnpm --filter=shadcn exec vite -- --port 5174 --strictPort` |
| nextjs | 3000 | `pnpm --filter=nextjs exec next dev --turbopack -p 3000` |
| nextjs-ssr | 3001 | `pnpm --filter=nextjs-ssr exec next dev -p 3001` |
| angular-example | 4200 | `pnpm --filter=angular-example exec ng serve --port 4200` |

Ports are CLI-configurable today; parallel e2e is possible later if orchestration assigns unique ports per concurrent job — not MVP ([AD-4](../decisions.md#ad-4-serial-per-example-e2e-with-preflight-and-postflight)).

# Work items

## Phase A — Infrastructure

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| A1 | Add `e2e/` workspace package with `@playwright/test` | — | Package installs; empty config runs |
| A2 | `playwright.config.ts`: one project per UI example, `baseURL` per port map | A1 | Five projects defined |
| A3 | `scripts/e2e-preflight.mjs`: Node 22+, pnpm, `firebase` CLI, ports free, emulator `:9099` reachable; `--example` selects port set; writes PID/state file for server | A2 | Fails fast with clear errors |
| A4 | `scripts/e2e-postflight.mjs`: stop server from state file; confirm ports free | A3 | Clean teardown after failed or passed run |
| A5 | `scripts/e2e-run-example.mjs` (or shell): preflight → start dev server with E2E env → wait URL → playwright → postflight | A3, A4 | Used by per-example npm scripts |
| A6 | Root `package.json` scripts: `test:e2e`, `test:e2e:<example>` | A5 | Commands documented in LOCAL_DEVELOPMENT (link only) |
| A7 | Shared emulator start for full `test:e2e` (single process before serial loop) | A5 | Emulator not restarted per example |

## Phase B — Example E2E flags

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| B1 | react + shadcn: skip `oneTapSignIn` when `VITE_E2E=1` | A2 | [AD-5](../decisions.md#ad-5-e2e-mode-flags-for-auth-behaviors) |
| B2 | nextjs + nextjs-ssr: skip `autoAnonymousLogin` when `NEXT_PUBLIC_E2E=1` | A2 | Predictable sign-in screen on deep-link |

## Phase C — Tests

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| C1 | `e2e/tests/sign-in-handlers.spec.ts` shared steps S1–S3 | B1, B2 | Parameterized per project |
| C2 | `e2e/fixtures/example-meta.ts`: path suffix, trailing slash, baseURL | C1 | Next vs Vite path rules centralized |
| C3 | Optional `data-testid` on sign-in form if locators unstable | C1 | Only if C1 blocked |

## Phase D — CI

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| D1 | CI job: `playwright install --with-deps chromium` | C1 | Browsers cached on repeat runs |
| D2 | CI: `pnpm build:packages`, enable webframeworks, `pnpm test:e2e` | D1, A6 | PRs run smoke |
| D3 | Extend [testing-strategy.md](../architecture/testing-strategy.md) owner + CONTRIBUTING link after CI lands | D2 | Single owner updated |

## Phase E — Dependency hardening (after smoke green)

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| E1 | Align example deps to pnpm catalog / current stable | D2 | CVE audit improved |
| E2 | Run [dependency-update-verification.md](../playbooks/dependency-update-verification.md) including `test:e2e` | E1 | Smoke passes on dep PR |
| E3 | Optional: `pnpm audit --audit-level=high` in CI | E2 | Team decision |

## Deferred

| ID | Item | Reason |
|----|------|--------|
| X1 | `custom-auth-server` e2e | Secrets + port 4000 vs emulator UI |
| X2 | Parallel multi-example e2e | Needs centralized port env; serial sufficient for MVP |
| X3 | Real emulator sign-in flows | Post-MVP user scenarios |
| X4 | Multi-browser matrix | Chromium only for MVP |

# File layout (target)

```
e2e/
├── package.json
├── playwright.config.ts
├── fixtures/
│   └── example-meta.ts
└── tests/
    └── sign-in-handlers.spec.ts
scripts/
├── e2e-preflight.mjs
├── e2e-postflight.mjs
└── e2e-run-example.mjs
```

# Related

* [architecture/examples-inventory.md](../architecture/examples-inventory.md)
* [architecture/testing-strategy.md](../architecture/testing-strategy.md)
* [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md)
