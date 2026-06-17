# Local Development Guide

This guide walks you through running FirebaseUI Web locally so you can test features and changes on your machine.

## Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18+ (CI uses v22 — matching this avoids surprises)
- [pnpm](https://pnpm.io/) — if you have Node.js 18+, [corepack](https://nodejs.org/api/corepack.html) can install pnpm on demand when you run it
- [Firebase CLI](https://firebase.google.com/docs/cli):
  ```bash
  pnpm add -g firebase-tools
  ```

## First-Time Setup

```bash
git clone https://github.com/<your-username>/firebaseui-web.git
cd firebaseui-web
pnpm install
pnpm build:packages
```

`pnpm build:packages` builds only the library packages in dependency order (`translations` → `styles` → `core` → `react` → `angular`). You need to do this once before any example app will work.

There is also `pnpm build` which builds the library packages **and** all the example apps. You don't need this for local development — the example apps get served live by their own dev servers.

## Running Locally

You need three things running at the same time, each in its own terminal:

### Terminal 1 — Start the Firebase Auth Emulator

Before running the emulator for the first time, enable the webframeworks experiment:

```bash
firebase experiments:enable webframeworks
```

Then start the emulator:

```bash
pnpm emulators
```

The example apps need a Firebase Auth backend to handle sign-in and sign-up. Instead of hitting a real Firebase project, the emulator runs a fake Auth service on your machine at `http://localhost:9099`. Users you create only exist in memory and disappear when you stop the emulator. No credentials or billing required.

This command runs `firebase emulators:start --only auth --project demo-test`. Any project ID starting with `demo-` is a special fake project the emulator accepts, so you don't need to create anything in the Firebase console.

It's ready when you see:

```
✔  auth: Auth Emulator at http://localhost:9099
```

The emulator also provides a web UI at [http://localhost:4000](http://localhost:4000) where you can inspect users created during sign-up flows, manually add test users, or delete them.

### Terminal 2 — Watch the package you're editing

```bash
# If you're editing core:
pnpm --filter=@firebase-oss/ui-core run dev

# If you're editing React components:
pnpm --filter=@firebase-oss/ui-react run dev

# If you're editing translations:
pnpm --filter=@firebase-oss/ui-translations run dev
```

This runs `tsup --watch`, which rebuilds the package every time you save a file. You can run multiple watchers in one terminal:

```bash
pnpm --filter=@firebase-oss/ui-core run dev & pnpm --filter=@firebase-oss/ui-react run dev # (Unix/macOS)
```

`angular`, `styles`, and `shadcn` don't have a watch mode. Rebuild them manually after changes:

```bash
pnpm --filter=@firebase-oss/ui-angular run build
pnpm --filter=@firebase-oss/ui-styles run build
pnpm --filter=@firebase-oss/ui-shadcn run build
```

### Terminal 3 — Start an example app

```bash
# React (recommended — fastest feedback with Vite HMR):
pnpm --filter=react run dev

# Next.js (static export):
pnpm --filter=nextjs run dev

# Next.js (SSR):
pnpm --filter=nextjs-ssr run dev

# Angular:
pnpm --filter=angular-example run start

# Shadcn:
pnpm --filter=shadcn run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173` for Vite apps). Edit a package source file, save, and the app reloads with your changes.

## How the emulator connects

Every example app already auto-connects to the emulator in development mode. No additional configuration is needed. For example, in `examples/react/src/firebase/firebase.ts`:

```typescript
if (import.meta.env.MODE === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
}
```

Each framework detects dev mode differently:
- **Vite examples** (react, shadcn): `import.meta.env.MODE === "development"`
- **Next.js examples**: `process.env.NODE_ENV === "development"`
- **Angular**: `isDevMode()` from `@angular/core`

All automatic when using the `dev` / `start` scripts.

## Which example app should I use?

| I'm working on... | Use this example |
|---|---|
| Core auth logic, sign-in flows, state | `react` |
| React components, hooks, UI | `react` |
| Angular components or DI | `angular` |
| Shadcn components or theming | `shadcn` |
| Server-side rendering, server components | `nextjs-ssr` |
| Static Next.js / client-only | `nextjs` |
| Translations or CSS | `react` (easiest) |
| Custom OAuth flows | `custom-auth-server` (see [CUSTOM_AUTHENTICATION.md](CUSTOM_AUTHENTICATION.md)) |

The `react` example is recommended as the default — it has the fastest reload cycle.

## Running tests

Start the emulator first, then:

```bash
# All tests:
pnpm test

# Watch mode (core, react, angular):
pnpm test:watch

# Single package:
pnpm --filter=@firebase-oss/ui-core run test
pnpm --filter=@firebase-oss/ui-react run test
pnpm --filter=@firebase-oss/ui-angular run test
```

## Before you push

```bash
pnpm lint:fix
pnpm format:write
pnpm test
```

CI runs all three. Running them locally first avoids failed checks on your pull request.
