---
type: Playbook
title: Dependency update verification
description: Steps to validate firebaseui-web after updating dependencies to current stable.
tags: [dependencies, security, e2e]
timestamp: 2026-07-03T00:00:00Z
---

# When to use

After bumping dependencies in the monorepo root, `packages/*`, `examples/*`, or `pnpm-workspace.yaml` catalog.

**Gate:** complete [change-authoring-verification.md](change-authoring-verification.md) first (required before commit/push — [AD-10](../decisions.md#ad-10-change-authoring-requires-ci-parity-verification-before-commit)). For **Firebase JS SDK** major/minor policy (catalog 11 vs consumer 12, angular pins, upstream tracking), see [decisions.md](../decisions.md) **AD-9**.

# Steps

Follow [change-authoring-verification.md](change-authoring-verification.md) **Required sequence**. Additionally:

1. `pnpm audit` — triage high/critical; example-path advisories called out in PR

# CI parity

Same as [change-authoring-verification.md](change-authoring-verification.md#ci-parity-matrix). Workflows: [`.github/workflows/test.yaml`](../../.github/workflows/test.yaml), [`.github/workflows/e2e.yaml`](../../.github/workflows/e2e.yaml), [`.github/workflows/lint.yaml`](../../.github/workflows/lint.yaml).

# Owners

| Topic                      | Document                                                                    |
| -------------------------- | --------------------------------------------------------------------------- |
| Example ports and commands | [architecture/examples-inventory.md](../architecture/examples-inventory.md) |
| E2E scope                  | [decisions.md](../decisions.md) (AD-3, AD-4)                                |
| Local emulator setup       | [LOCAL_DEVELOPMENT.md](../../LOCAL_DEVELOPMENT.md)                          |
