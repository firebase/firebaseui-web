---
type: Decision Log
title: Architecture decisions
description: Sequential decision log for firebaseui-web. Entries use AD-number identifiers.
tags: [adr, architecture]
timestamp: 2026-07-01T00:00:00Z
---

Decisions follow the shape in [ADR format (mattpocock)](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md) (read that spec only during documentation maintenance runs).

---

## AD-1: Dependabot cooldown per ecosystem

Dependabot version-update PRs use a **7-day cooldown** on all ecosystems. Semver cooldown fields (`semver-major-days`, `semver-minor-days`, `semver-patch-days`) are set to 7 only where [GitHub documents SemVer-bump support](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#cooldown) for that package manager. GitHub Actions blocks use `default-days: 7` only. Initial config PRs (#1378 Android/iOS) merged without full cooldown; follow-ups align configs (#1380 web, #2355 Android, #1367 iOS).

---

## AD-2: developer-docs OKF bundle at repository root

Durable human+agent knowledge lives in `developer-docs/` as an [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle. Root guides (`LOCAL_DEVELOPMENT.md`, etc.) remain the owners for contributor onboarding commands; this bundle owns architecture, decisions, playbooks, and work queues. Agents should start at [developer-docs/index.md](index.md) or [AGENTS.md](../AGENTS.md).

---

## AD-3: Playwright example smoke tests (MVP scope)

Example apps are verified after dependency updates with **Playwright smoke tests**, not full user-flow e2e. MVP: deep-link to sign-in-with-handlers screen, assert form render, empty submit shows validation, forgot-password navigation works. Out of MVP: OAuth, phone/MFA flows, real sign-in, `custom-auth-server`. Package unit tests (`pnpm test`) and compile checks (`pnpm build`) remain necessary but insufficient for runtime UI regression.

---

## AD-4: Serial per-example e2e with preflight and postflight

Example e2e runs **one example at a time** because dev servers default to overlapping ports (Vite 5173, Next 3000, Angular 4200) and only one process can bind each port. Ports are **configurable via CLI** (`vite --port`, `next dev -p`, `ng serve --port`) but not fixed in repo config today. Orchestration: `pnpm test:e2e` runs `test:e2e:<example>` sequentially; each target runs `e2e-preflight` → Playwright → `e2e-postflight` for that example's ports and server PID. A single Auth emulator on `:9099` is shared across the serial run. Parallel multi-example e2e is deferred until port assignment is centralized (env-driven config or documented port map).

---

## AD-5: E2E mode flags for auth behaviors

Examples that enable `oneTapSignIn` (react, shadcn) or `autoAnonymousLogin` (nextjs, nextjs-ssr) must respect an **E2E env flag** (`VITE_E2E` / `NEXT_PUBLIC_E2E`) set by Playwright `webServer` so smoke tests see a predictable unauthenticated sign-in screen. Owner for emulator connection rules: [architecture/examples-inventory.md](architecture/examples-inventory.md).
