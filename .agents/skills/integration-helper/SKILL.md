---
name: integration-helper
description: Help consumers integrate FirebaseUI Web v7 packages into their own applications. Use when a user asks how to install, configure, migrate to, or implement authentication with firebaseui-web, @firebase-oss/ui-core, @firebase-oss/ui-react, @firebase-oss/ui-angular, @firebase-oss/ui-styles, @firebase-oss/ui-translations, or the FirebaseUI shadcn registry; especially for React, Next.js, Angular, shadcn, bring-your-own-UI, email/password, email link, phone auth, OAuth, OIDC, custom token, anonymous upgrade, MFA, localization, theming, or v6-to-v7 migration tasks.
metadata:
  tags: firebaseui-web, build, integrate
  last_reviewed: "2026-05-05"
  version: "0.1.0"
---

# FirebaseUI Web Consumer

## Core Workflow

Help the user integrate FirebaseUI Web into a consumer app, not develop this repository unless they ask for repo maintenance.

1. Identify the app framework and rendering model: React/Vite, Next.js App Router, Next.js SSR, Angular, shadcn, or headless/core.
2. Inspect the consumer app when files are available: package manager, existing Firebase setup, routing, CSS pipeline, auth providers already enabled, and SSR/client boundaries.
3. Load the smallest useful reference:
   - [framework-setup.md](references/framework-setup.md) for installation, Firebase initialization, providers, CSS, Next.js, Angular, shadcn, and headless setup.
   - [auth-flows.md](references/auth-flows.md) for email/password, sign-up, password reset, email link, phone auth, OAuth, OIDC, custom token, anonymous users, and MFA.
   - [customization-and-migration.md](references/customization-and-migration.md) for styling, themes, policies, translations, behaviors, emulators, troubleshooting, and v6 migration.
4. Prefer code that matches the consumer app's existing router, Firebase config pattern, and component style. Keep FirebaseUI initialization in one client-safe module and pass the resulting `ui` store through the framework provider.
5. After editing an app, verify with the app's existing typecheck/test/build command where practical. For browser-facing changes, suggest or perform a local browser check if the app can run.

## Repo Facts To Preserve

- FirebaseUI Web v7 is modular: `@firebase-oss/ui-core` owns auth logic/state/behaviors, `@firebase-oss/ui-react` and `@firebase-oss/ui-angular` provide UI components, `@firebase-oss/ui-styles` provides CSS, and `@firebase-oss/ui-translations` provides locales.
- `initializeUI({ app, auth?, locale?, behaviors? }, name?)` returns a `FirebaseUIStore`. If `auth` is omitted, core calls `getAuth(app)`.
- OAuth provider strategy is configured through behaviors. `defaultBehaviors` currently include reCAPTCHA, popup provider strategy, and country code handling; verify the current source before making a definitive claim.
- Screens are composable. For example, OAuth buttons are children of `SignInAuthScreen`, `SignUpAuthScreen`, `EmailLinkAuthScreen`, `PhoneAuthScreen`, or `OAuthScreen`.
- React apps wrap with `FirebaseUIProvider`; Angular apps add `provideFirebaseUI`; shadcn consumers install registry components but still use the React provider and core initialization.
- Next.js App Router files that initialize FirebaseUI or render FirebaseUI components must be client components (`"use client"`). Server auth checks are separate and currently limited in the SSR example.

## Implementation Bias

- Use public package imports, not internal repo aliases like `~/`.
- Use `getApps().length === 0 ? initializeApp(config) : getApps()[0]` in React/Next examples to avoid duplicate initialization under HMR.
- Include `firebase` as a required dependency. Add framework package(s) and styles/translations only when needed.
- Use component callbacks/events for navigation instead of v6-style global callbacks.
- Ask the user to enable providers in Firebase Console when the flow requires it; code alone is not enough for Google, Apple, Facebook, phone, email link, OIDC, MFA, or anonymous auth.
- For custom OAuth 2.0 providers that are not OIDC, use a backend that exchanges the provider code and mints a Firebase custom token, then sign in with that token on the client.

## Useful Source Anchors

- Root docs: `README.md`, `MIGRATION.md`, `CUSTOM_AUTHENTICATION.md`.
- Core API: `packages/core/src/config.ts`, `packages/core/src/auth.ts`, `packages/core/src/behaviors/`.
- React exports: `packages/react/src/index.ts`, `packages/react/src/auth/index.ts`, `packages/react/src/components/index.tsx`.
- Angular exports: `packages/angular/src/public-api.ts`, `packages/angular/src/lib/provider.ts`.
- Examples: `examples/react`, `examples/angular`, `examples/nextjs`, `examples/nextjs-ssr`, `examples/custom-auth-server`, `examples/shadcn`.
