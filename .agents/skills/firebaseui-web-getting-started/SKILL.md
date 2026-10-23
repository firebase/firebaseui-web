---
name: firebaseui-web-getting-started
description: Add FirebaseUI Web authentication (sign-in, sign-up, password reset, email link, phone, OAuth, anonymous upgrade, MFA screens, forms, behaviors) to React, shadcn/ui, and Angular apps. This skill's references hold every prop, selector and signature needed, so do not search node_modules, and never glob `**/*` or `src/**/*` from the project root (it matches node_modules); glob with targetDirectory `src`.
---

# FirebaseUI Web Getting Started

Implement Firebase authentication with FirebaseUI Web (`@firebase-oss/ui-*`). Detect the stack, then read its reference files: setup, `initializeUI` wiring, the Auth emulator recipe and every component's props.

## 1. Search Rules (Read Before Using Any Search Tool)

- **Never glob `**/*` or `src/**/*` from the project root.** Glob matches at any depth, so both also match every `node_modules/**/src/` folder and return thousands of paths. Call glob with `targetDirectory: "src"` (or another subfolder) and a narrow pattern such as `**/*.ts`. Give grep `path: "src"`, not `.`.
- **Never read, grep, or glob inside `node_modules`.** The packages ship minified bundles and huge `.d.ts` files, and greps there return nothing. If something is missing from the references, state your assumption and let the build confirm it.
- **Read the project's own files under `src/` freely**, including any component source the project already contains.
- **Check for existing Firebase code** in `package.json` and with a grep scoped to `src`.

## 2. Detect the Stack and Load the References

| Stack | Detect | Read |
| --- | --- | --- |
| React | `react` and `react-dom` in `package.json`, no `components.json` | [`references/react.md`](references/react.md), [`references/react-recipes.md`](references/react-recipes.md), [`references/core.md`](references/core.md) |
| shadcn/ui | `components.json` next to `react` and `tailwindcss` | [`references/shadcn.md`](references/shadcn.md), [`references/shadcn-recipes.md`](references/shadcn-recipes.md), [`references/core.md`](references/core.md) |
| Angular | `@angular/core` v19+ | [`references/angular.md`](references/angular.md), [`references/angular-recipes.md`](references/angular-recipes.md), [`references/core.md`](references/core.md) |

Read only your stack's files, in **one parallel batch** with these project files (those that exist): `package.json`, `firebase.json`; React and shadcn/ui `src/main.tsx`, `src/App.tsx` (shadcn/ui also `components.json`); Angular `angular.json`, `src/app/app.config.ts`, `src/app/app.routes.ts`, `src/app/app.ts`. If the stack is ambiguous, ask the user before installing packages.

## 3. Workflow

1. **Read** the stack's files and the project files in one batch (section 2), plus any existing pages and layout wrapper so the new screens fit the app.
2. **Install** only what is missing, and never change existing versions. Each stack's reference lists the packages.
3. **Configure** Firebase and `initializeUI` as the stack's reference shows. If the project notes name the Auth emulator, use the emulator recipe in the stack's recipes file with the notes' host, port and project id.
4. **Build each flow** from a FirebaseUI screen, form or button. Look the flow up in the stack's reference before writing custom `firebase/auth` code.
5. **Wire** the routes and where each flow goes after sign-in. Edit the router in place: keep the existing routes and pages (the landing page stays), add the new routes next to them, link to the new screens from the existing home page or navigation, and reuse the app's page container for the new pages.
6. **Validate** with the project's typecheck and production build (for example `npm run build`) and fix every error before finishing.

## 4. What FirebaseUI Provides

- **Screens** (card, form, MFA assertion, policies) for sign-in, sign-up, password reset, email link, phone, OAuth and MFA enrollment. The sign-in, sign-up, email link, phone and OAuth screens switch to the MFA assertion step on their own, so sign-in needs no custom MFA code.
- **Forms**: the same flows without card chrome, for your own layout.
- **OAuth buttons** (Google, GitHub, Apple, Microsoft, Facebook, Twitter, Yahoo, generic) that go inside a screen.
- **Behaviors** for `initializeUI` (`autoUpgradeAnonymousUsers()`, `requireDisplayName()`, `autoAnonymousLogin()` and more) and **core actions** in `@firebase-oss/ui-core`. Both are in `core.md`.

How a stack imports, mounts and configures these is in its reference.

## 5. Gotchas (All Stacks)

- **Store vs state:** `initializeUI` returns a store. Give the store to the stack's provider. Give the `FirebaseUI` state object (`ui.get()`, or what the stack's reference names) to `@firebase-oss/ui-core` actions. Mixing them up fails at runtime.
- **Screen links need handlers:** "Forgot password?", "Sign up", "Sign in" and "Back to sign in" render only when the matching callback or output is wired.
- **Extra controls go outside the card:** a screen is a self-contained card whose slot is for OAuth buttons. Put other controls (such as "Continue as guest") outside it, or compose a form inside your own card.
- **Anonymous upgrade:** do not call `linkWithCredential` yourself. With `autoUpgradeAnonymousUsers()` in `initializeUI`, every screen and OAuth button links to the guest and keeps its `uid`.
- **Core results and sign-out:** core sign-in actions can resolve to `void`, and `ui-core` has no sign-out. See `core.md`.
