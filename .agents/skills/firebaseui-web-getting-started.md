---
name: firebaseui-web-getting-started
description: Set up FirebaseUI Web authentication screens in consumer React, shadcn/ui, or Angular projects. Use when installing FirebaseUI Web, wiring Firebase app configuration, adding predefined auth screens, or checking FirebaseUI dependencies.
---

# FirebaseUI Web Getting Started

Use this skill when the user wants FirebaseUI Web added to their own app. The supported targets are React, shadcn/ui React, and Angular only. If the repo is another stack, stop and explain that this skill does not cover it.

Authoritative docs:
- FirebaseUI Web README: `https://github.com/firebase/firebaseui-web/blob/main/README.md`

## Setup Workflow

1. Identify the stack from `package.json`, framework config, and source layout:
   - React: `react` plus a Vite/SPA/React app, without shadcn registry components.
   - shadcn/ui: React app with `components.json` and shadcn aliases such as `@/components`.
   - Angular: `@angular/core`, Angular CLI config, and preferably `@angular/fire`.
2. Check the package manager from lockfiles and use it consistently.
3. Check dependencies before editing. Install missing packages with the repo's package manager.
4. Find existing Firebase initialization. Reuse it when present. If no Firebase config exists, ask the user for their Firebase web app config or use existing env conventions. Do not copy Firebase config values from examples or docs.
5. Add the FirebaseUI initialization/provider once near the app root.
6. Add predefined screen routes/components requested by the user. Default to `SignInAuthScreen` if they did not specify a screen.
7. Import styles where required.
8. Run the smallest relevant validation command: typecheck, lint, build, or the repo's existing test script.

## Dependencies

React:

```bash
npm install firebase @firebase-oss/ui-core @firebase-oss/ui-react@beta @firebase-oss/ui-styles
```

shadcn/ui:

```bash
npm install firebase @firebase-oss/ui-core @firebase-oss/ui-react@beta
```

Then add the Firebase registry to `components.json`:

```json
{
  "registries": {
    "@firebase": "https://firebaseopensource.com/r/{name}.json"
  }
}
```

Add only the screens the app needs, for example:

```bash
npx shadcn@latest add @firebase/sign-in-auth-screen
```

Angular:

```bash
npm install firebase @angular/fire @firebase-oss/ui-core @firebase-oss/ui-angular@beta @firebase-oss/ui-styles
```

Adapt commands for `pnpm`, `yarn`, or `bun` if that is the repo's package manager.

## Firebase Config

FirebaseUI needs a Firebase App instance initialized with the consumer project's Firebase web app config:

```ts
import { initializeApp } from "firebase/app";

const firebaseApp = initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "...",
});
```

Prefer the app's existing env pattern for config values. If using env vars, preserve the framework's prefix rules, such as `VITE_` for Vite and `NEXT_PUBLIC_` for Next.js client code. Firebase web app config is not a service account, but still do not invent or paste example project values.

## React Pattern

Create or update a Firebase module:

```ts
import { initializeUI } from "@firebase-oss/ui-core";
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Use the consumer app's Firebase web app config.
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "...",
};
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const ui = initializeUI({ app: firebaseApp });
```

Wrap the app once:

```tsx
import { FirebaseUIProvider } from "@firebase-oss/ui-react";

root.render(
  <FirebaseUIProvider ui={ui}>
    <App />
  </FirebaseUIProvider>,
);
```

Import FirebaseUI styles once, unless the app uses shadcn/ui:

```ts
import "@firebase-oss/ui-styles/dist.min.css";
```

For Tailwind projects that want FirebaseUI Tailwind styles:

```css
@import "tailwindcss";
@import "@firebase-oss/ui-styles/tailwind";
```

Add predefined screens by importing from `@firebase-oss/ui-react`:

```tsx
import { SignInAuthScreen } from "@firebase-oss/ui-react";
import { useNavigate } from "react-router-dom";

export function SignInPage() {
  const navigate = useNavigate();

  return <SignInAuthScreen onSignIn={() => navigate("/")} />;
}
```

Common React screens: `SignInAuthScreen`, `SignUpAuthScreen`, `ForgotPasswordAuthScreen`, `EmailLinkAuthScreen`, `PhoneAuthScreen`, `OAuthScreen`, `MultiFactorAuthAssertionScreen`, `MultiFactorAuthEnrollmentScreen`.

## shadcn/ui Pattern

Use the same Firebase module and `FirebaseUIProvider` pattern as React. Do not import `@firebase-oss/ui-styles`; shadcn components inherit the app's shadcn/Tailwind theme.

Install registry components instead of importing screens directly from `@firebase-oss/ui-react`:

```bash
npx shadcn@latest add @firebase/sign-in-auth-screen
npx shadcn@latest add @firebase/sign-up-auth-screen
npx shadcn@latest add @firebase/phone-auth-screen
```

Then import generated components from the local shadcn alias:

```tsx
import { SignInAuthScreen } from "@/components/sign-in-auth-screen";
import { useNavigate } from "react-router-dom";

export function SignInPage() {
  const navigate = useNavigate();

  return <SignInAuthScreen onSignIn={() => navigate("/")} />;
}
```

Before adding registry components, verify `components.json` aliases match the app's import style. Fix only the Firebase registry entry and missing shadcn setup needed for the requested screen.

## Angular Pattern

Angular projects should use AngularFire and providers in the app config:

```ts
import { type ApplicationConfig } from "@angular/core";
import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFirebaseUI, provideFirebaseUIPolicies } from "@firebase-oss/ui-angular";
import { initializeUI } from "@firebase-oss/ui-core";

// Use the consumer app's Firebase web app config.
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "...",
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirebaseUI((apps) => initializeUI({ app: apps[0] })),
    provideFirebaseUIPolicies(() => ({
      termsOfServiceUrl: "/terms",
      privacyPolicyUrl: "/privacy",
    })),
  ],
};
```

Import styles once in the global stylesheet:

```css
@import "@firebase-oss/ui-styles/dist.min.css";
```

Wrap predefined screens in standalone route components:

```ts
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { SignInAuthScreenComponent } from "@firebase-oss/ui-angular";

@Component({
  selector: "app-sign-in",
  standalone: true,
  imports: [CommonModule, SignInAuthScreenComponent],
  template: `<fui-sign-in-auth-screen (signIn)="onSignIn()" />`,
})
export class SignInPageComponent {
  private router = inject(Router);

  onSignIn() {
    this.router.navigate(["/"]);
  }
}
```

Common Angular selectors:
- `fui-sign-in-auth-screen`
- `fui-sign-up-auth-screen`
- `fui-forgot-password-auth-screen`
- `fui-email-link-auth-screen`
- `fui-phone-auth-screen`
- `fui-oauth-screen`

## Screen Defaults

Use Screens for a quick setup with opinionated layout. Use Forms only when the user has an existing custom auth page and asks to embed FirebaseUI logic into that layout.

Default route set for a basic auth setup:
- `/sign-in` -> sign-in screen
- `/sign-up` -> sign-up screen
- `/forgot-password` -> forgot password screen

Add phone, email-link, OAuth, or MFA screens only when the user asks for those flows or the app already has matching routes/providers enabled.

## Gotchas

- Do not set up unsupported frameworks such as Vue, Svelte, Solid, or plain HTML from this skill.
- Do not copy Firebase config values, OAuth client IDs, emulator hosts, or project IDs from FirebaseUI examples.
- Ensure the requested Firebase Auth providers are enabled in the user's Firebase project; code alone will not enable Email/Password, Phone, or OAuth providers.
- shadcn/ui uses local generated components from `@/components/...`; React uses package exports from `@firebase-oss/ui-react`.
- React and shadcn need `FirebaseUIProvider` above any screen that calls FirebaseUI hooks.
- Angular needs `provideFirebaseUI`; importing screen components alone is not enough.
- FirebaseUI CSS applies to React and Angular package screens, but not to shadcn registry components.
- If a React app runs in SSR, keep FirebaseUI screen usage in client-only components.

## Validation

Before finishing:
- Confirm dependencies are present in `package.json`.
- Confirm Firebase config is sourced from the consumer project.
- Confirm exactly one Firebase App/UI initialization path is used.
- Confirm routes render the selected predefined screens.
- Run the repo's relevant validation command and report any skipped checks.