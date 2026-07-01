---
type: Reference
title: Examples inventory
description: How each monorepo example is started, which port it uses, and emulator requirements.
resource: firebaseui-web/examples/
tags: [examples, monorepo, emulator]
timestamp: 2026-07-01T00:00:00Z
---

# Workspace layout

pnpm workspace members: `packages/*`, `examples/*` ([pnpm-workspace.yaml](../../pnpm-workspace.yaml)). Examples consume `@firebase-oss/ui-*` via `workspace:*`.

# UI examples (in scope for e2e smoke)

| Example | pnpm filter | Dev command | Default port | E2E port (proposed) | Emulator in dev |
|---------|-------------|-------------|--------------|---------------------|-----------------|
| react | `react` | `vite` | 5173 | 5173 | `import.meta.env.MODE === "development"` → `:9099` |
| shadcn | `shadcn` | `vite` | 5173 | 5174 | same as react |
| nextjs (SSG) | `nextjs` | `next dev --turbopack` | 3000 | 3000 | `NODE_ENV === "development"` → `:9099` |
| nextjs-ssr | `nextjs-ssr` | `next dev` | 3000 | 3001 | same as nextjs |
| angular-example | `angular-example` | `ng serve` (after `clean`) | 4200 | 4200 | `isDevMode()` → `:9099` |

**Port configurability:** not pinned in `vite.config.ts` / `next.config.ts`. All examples accept CLI port overrides for e2e. See [AD-4](../decisions.md#ad-4-serial-per-example-e2e-with-preflight-and-postflight).

**Auth behaviors affecting smoke:** react/shadcn use `oneTapSignIn`; nextjs/nextjs-ssr use `autoAnonymousLogin`. E2E flag required — [AD-5](../decisions.md#ad-5-e2e-mode-flags-for-auth-behaviors).

**Next.js paths:** static export uses `trailingSlash: true` — e2e URLs end with `/` (e.g. `/screens/sign-in-auth-screen-w-handlers/`).

# Out of e2e MVP scope

| Example | pnpm filter | Default port | Notes |
|---------|-------------|--------------|-------|
| custom-auth-server | `custom-auth-server` | 4000 (`PORT` env) | Needs secrets; port conflicts with Firebase Emulator UI; not in root `pnpm build` |

# Shared prerequisites

1. `pnpm install`
2. `pnpm build:packages` (or full `pnpm build` in CI)
3. Auth emulator: `pnpm emulators` → `http://localhost:9099` ([firebase.json](../../firebase.json))

Procedural steps: [LOCAL_DEVELOPMENT.md](../../LOCAL_DEVELOPMENT.md) (owner for command copy-paste).

# Smoke test entry path (all UI examples)

Deep-link: `/screens/sign-in-auth-screen-w-handlers` (with trailing slash for Next). Details: [work-queues/playwright-e2e-smoke.md](../work-queues/playwright-e2e-smoke.md).

# Citations

[1] [LOCAL_DEVELOPMENT.md](../../LOCAL_DEVELOPMENT.md)
