---
type: Index
title: developer-docs
description: OKF knowledge bundle entry point for firebaseui-web.
tags: [okf, documentation]
okf_version: "0.1"
timestamp: 2026-07-03T00:00:00Z
---

# developer-docs

OKF knowledge bundle for firebaseui-web: architecture, decisions, playbooks, and work queues.

**Before editing any file in this bundle:** read [documentation-policy.md](documentation-policy.md).

# Start here

- [documentation-policy.md](documentation-policy.md) — rules for writing and maintaining docs in this repo
- [decisions.md](decisions.md) — architecture decision log (`AD-<number>` entries)

# Architecture

- [architecture/examples-inventory.md](architecture/examples-inventory.md) — example apps, ports, dev commands, emulator wiring
- [architecture/testing-strategy.md](architecture/testing-strategy.md) — unit, build, and e2e verification layers

# Playbooks

- [playbooks/dependency-update-verification.md](playbooks/dependency-update-verification.md) — verify monorepo after dependency bumps

# Work queues

Living implementation backlogs under [work-queues/](work-queues/). Task IDs and phases may change; do not treat as normative architecture — see [documentation-policy.md](documentation-policy.md).

- [work-queues/playwright-e2e-smoke.md](work-queues/playwright-e2e-smoke.md) — Playwright example smoke tests and CI

# Related docs (outside this bundle)

- [LOCAL_DEVELOPMENT.md](../LOCAL_DEVELOPMENT.md) — human onboarding: emulator, dev servers, package watch
- [GETTING_STARTED.md](../GETTING_STARTED.md) — library consumer getting started
- [CONTRIBUTING.md](../CONTRIBUTING.md) — contribution workflow and CI expectations
