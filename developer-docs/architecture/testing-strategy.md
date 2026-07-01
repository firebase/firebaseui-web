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
| Example smoke (browser) | `pnpm test:e2e` | [work-queues/playwright-e2e-smoke.md](../work-queues/playwright-e2e-smoke.md) | Example dev server load + basic UI interactivity |
| Security audit | `pnpm audit` | [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md) | Known CVEs in lockfile |

# CI today

[`.github/workflows/test.yaml`](../../.github/workflows/test.yaml): `pnpm build`, Auth emulator start, `pnpm test`. **No browser smoke yet** — target of Playwright work queue.

# Gaps (pre-Playwright)

* No example-level automated tests (Angular example `vitest` has no spec files).
* Skipped package integration tests (`describe.skip`).
* `custom-auth-server` not built by root `build`.
* `pnpm audit` not gated in CI.

# Post-dependency-update gate (target)

See [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md).
