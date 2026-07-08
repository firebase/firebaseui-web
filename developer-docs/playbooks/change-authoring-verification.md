---
type: Playbook
title: Change authoring verification
description: Mandatory local verification before commit or push when a change can affect CI outcomes.
tags: [ci, testing, agents, dependencies]
timestamp: 2026-07-03T00:00:00Z
---

# When to use

Before **commit or push** on any change that touches:

* `pnpm-workspace.yaml`, lockfile, or `package.json` files (including examples)
* `.github/workflows/**`, `cloudbuild.yaml`, or Node/pnpm/CI tool versions
* test harness, e2e, or example apps consumed by CI

Normative gate: [AD-10](../decisions.md#ad-10-change-authoring-requires-ci-parity-verification-before-commit). Agents: [AGENTS.md](../../AGENTS.md) points here.

# Runtime

Use the **same Node major as CI** (see [LOCAL_DEVELOPMENT.md](../../LOCAL_DEVELOPMENT.md)). Local Node 26+ can pass tests that fail on CI Node 24 (e.g. jsdom `localStorage` behavior).

# CI parity matrix

| CI job | Workflow | Local command | Notes |
|--------|----------|---------------|-------|
| Lint and Format Check | `lint.yaml` | `pnpm lint:check` && `pnpm format:check` | |
| Test | `test.yaml` | `pnpm build` then `pnpm test` | CI starts Auth emulator; skipped integration tests do not need it |
| E2E | `e2e.yaml` | `pnpm test:e2e` | Auth emulator via Playwright `globalSetup`; serial, ~minutes |

# Gaps `pnpm build` does not cover

Root `pnpm build` **does not** compile `examples/custom-auth-server`. E2E builds it on demand — a deps bump can break e2e while `pnpm build` passes.

**Required extra step** when `examples/custom-auth-server` or its deps change:

```bash
pnpm --filter custom-auth-server run build
```

Or rely on full `pnpm test:e2e` (includes that build).

# Required sequence (all must exit 0)

Run in order; do not commit until complete:

1. `pnpm install`
2. `pnpm build`
3. `pnpm --filter custom-auth-server run build` — if custom-auth-server or firebase-admin/admin deps touched; always safe for deps PRs
4. `pnpm test`
5. `pnpm lint:check` && `pnpm format:check` — includes repository style guide ([`.gemini/styleguide.md`](../../.gemini/styleguide.md); e.g. Rule 11: catalog duplicate deps)
6. `pnpm test:e2e`

Dependency-only bumps: also follow [dependency-update-verification.md](dependency-update-verification.md) (audit, AD-9).

# One-shot script (deps / CI-affecting PRs)

```bash
pnpm install && \
pnpm build && \
pnpm --filter custom-auth-server run build && \
pnpm test && \
pnpm lint:check && \
pnpm format:check && \
pnpm test:e2e
```

# Owners

| Topic | Document |
|-------|----------|
| Test layers | [architecture/testing-strategy.md](../architecture/testing-strategy.md) |
| Dependency bumps | [dependency-update-verification.md](dependency-update-verification.md) |
| E2E scope | [decisions.md](../decisions.md) AD-3, AD-4, AD-6 |
| Local emulator | [LOCAL_DEVELOPMENT.md](../../LOCAL_DEVELOPMENT.md) |
