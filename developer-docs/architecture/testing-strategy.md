---
type: Reference
title: Testing strategy
description: Verification layers for firebaseui-web packages and examples.
tags: [testing, ci, playwright]
timestamp: 2026-07-01T00:00:00Z
---

# Layers

| Layer | Command | Owner doc | Catches |
|-------|---------|-----------|---------|
| Package unit tests | `pnpm test` | [CONTRIBUTING.md](../../CONTRIBUTING.md) | Core/react/angular/shadcn/translations/styles logic |
| Compile (packages + examples) | `pnpm build` | [CONTRIBUTING.md](../../CONTRIBUTING.md) | TS, bundler, framework build errors |
| Lint / format | `pnpm lint:check`, `pnpm format:check` | [CONTRIBUTING.md](../../CONTRIBUTING.md) | Style regressions |
| Example smoke (browser + HTTP) | `pnpm test:e2e` | [work-queues/playwright-e2e-smoke.md](../work-queues/playwright-e2e-smoke.md) | Example dev-server load + basic UI interactivity (five UI examples) and `custom-auth-server` HTTP boot |
| Security audit | `pnpm audit` | [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md) | Known CVEs in lockfile |

# CI today

[`.github/workflows/test.yaml`](../../.github/workflows/test.yaml): `pnpm build`, Auth emulator start, `pnpm test`. **No browser smoke yet** — target of Playwright work queue. e2e will land as a **separate workflow** with broad path triggers — [AD-7](../decisions.md#ad-7-e2e-runs-in-a-separate-ci-workflow-with-broad-triggers).

# Gaps

* No example-level automated tests yet (Angular example `vitest` has no spec files) — closed by the Playwright work queue.
* Skipped package integration tests (`describe.skip`).
* `custom-auth-server` not built by root `build` (e2e builds it on demand).
* Production build artifacts not exercised by e2e — deferred, [AD-8](../decisions.md#ad-8-production-artifact-e2e-deferred-future-phase).
* `pnpm audit` not gated in CI.

# Post-dependency-update gate (target)

See [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md).
