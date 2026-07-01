---
type: Playbook
title: Dependency update verification
description: Steps to validate firebaseui-web after updating dependencies to current stable.
tags: [dependencies, security, e2e]
timestamp: 2026-07-01T00:00:00Z
---

# When to use

After bumping dependencies in the monorepo root, `packages/*`, `examples/*`, or `pnpm-workspace.yaml` catalog.

# Steps

1. `pnpm install`
2. `pnpm build` — compile all packages and five UI examples
3. `pnpm test` — package unit tests (emulator optional for skipped integration tests)
4. `pnpm lint:check` && `pnpm format:check`
5. `pnpm audit` — triage high/critical; example-path advisories called out in PR
6. `pnpm test:e2e` — serial example smoke (once Playwright queue is complete)
7. `pnpm --filter=custom-auth-server run build` — if `firebase-admin` or Express touched

# CI parity

Match [`.github/workflows/test.yaml`](../../.github/workflows/test.yaml) plus future e2e job from [work-queues/playwright-e2e-smoke.md](../work-queues/playwright-e2e-smoke.md).

# Owners

| Topic | Document |
|-------|----------|
| Example ports and commands | [architecture/examples-inventory.md](../architecture/examples-inventory.md) |
| E2E scope | [decisions.md](../decisions.md) (AD-3, AD-4) |
| Local emulator setup | [LOCAL_DEVELOPMENT.md](../../LOCAL_DEVELOPMENT.md) |
