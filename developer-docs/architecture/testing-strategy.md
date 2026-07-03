---
type: Reference
title: Testing strategy
description: Verification layers for firebaseui-web packages and examples.
tags: [testing, ci, playwright]
timestamp: 2026-07-03T00:00:00Z
---

# Layers

| Layer | Command | Owner doc | Catches |
|-------|---------|-----------|---------|
| Package unit tests | `pnpm test` | [CONTRIBUTING.md](../../CONTRIBUTING.md) | Core/react/angular/shadcn/translations/styles logic |
| Compile (packages + examples) | `pnpm build` | [CONTRIBUTING.md](../../CONTRIBUTING.md) | TS, bundler, framework build errors |
| Lint / format | `pnpm lint:check`, `pnpm format:check` | [CONTRIBUTING.md](../../CONTRIBUTING.md) | Style regressions |
| Example smoke (browser + HTTP) | `pnpm test:e2e` | [AD-3](../decisions.md#ad-3-playwright-example-smoke-tests-mvp-scope-dev-server), [AD-4](../decisions.md#ad-4-playwright-managed-dev-servers-serial-shared-emulator), [AD-6](../decisions.md#ad-6-custom-auth-server-binds-4001-for-e2e) | Dev-server UI interactivity (five UI examples) and `custom-auth-server` HTTP boot |
| Security audit | `pnpm audit` | [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md) | Known CVEs in lockfile |

# CI today

[`.github/workflows/test.yaml`](../../.github/workflows/test.yaml): `pnpm build`, Auth emulator start, `pnpm test`.

[`.github/workflows/e2e.yaml`](../../.github/workflows/e2e.yaml): `pnpm test:e2e` (six examples), Playwright Chromium, HTML/coverage artifacts — [AD-7](../decisions.md#ad-7-e2e-runs-in-a-separate-ci-workflow-with-broad-triggers). Auth emulator is ensured by Playwright `globalSetup` (reuse-aware).

# Gaps

* Skipped package integration tests (`describe.skip`).
* `custom-auth-server` not built by root `pnpm build` (e2e builds it on demand).
* Production build artifacts not exercised by e2e — deferred, [AD-8](../decisions.md#ad-8-production-artifact-e2e-deferred-future-phase).
* `pnpm audit` not gated in CI.

# Post-dependency-update gate

Required before commit: [playbooks/change-authoring-verification.md](../playbooks/change-authoring-verification.md) ([AD-10](../decisions.md#ad-10-change-authoring-requires-ci-parity-verification-before-commit)). Dependency-specific steps: [playbooks/dependency-update-verification.md](../playbooks/dependency-update-verification.md).
