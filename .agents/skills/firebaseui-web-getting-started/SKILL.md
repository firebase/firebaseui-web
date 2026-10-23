---
name: firebaseui-web-getting-started
description: Add FirebaseUI Web authentication (sign-in, sign-up, password reset, email link, phone, OAuth, anonymous upgrade, MFA screens, forms, behaviors) to React, shadcn/ui, and Angular apps. This skill's references hold every prop and signature needed, so do not search node_modules, and never glob `**/*` or `src/**/*` from the project root (it matches node_modules); glob with targetDirectory `src`.
---

# FirebaseUI Web Getting Started

Implement Firebase authentication using FirebaseUI Web (`@firebase-oss/ui-*`). Follow the steps below to detect the project stack, configure `@firebase-oss/ui-core`, and load the reference file for your UI framework.

## 0. Search Rules (Read Before Using Any Search Tool)

- **Never glob `**/*` or `src/**/*` from the project root.** The glob tool matches a pattern at any depth, so both also match every `node_modules/**/src/` folder and return thousands of paths (over 160,000 characters), almost all inside `node_modules`. Call glob with `targetDirectory: "src"` (or another specific subfolder) and a narrow pattern such as `**/*.tsx`. Give grep `path: "src"`, not `.`.
- **Do not read, grep, or glob inside `node_modules`.** The packages ship only minified `dist/` bundles and 150-280 KB `.d.ts` files, and greps there have returned nothing. Every prop, signature, and recipe you need is in the references below; if something is missing, state your assumption and let `npm run build` confirm it.
- **Read in one parallel batch:** `package.json`, `src/main.tsx`, `src/App.tsx`, and the reference files for your stack (step 1).

## 1. Detect the Stack & Load the Framework Reference

Inspect `package.json` and project configuration files:

- **shadcn/ui** (`components.json` present alongside `react` and `tailwindcss`): Read [`references/shadcn.md`](references/shadcn.md) and [`references/core.md`](references/core.md).
- **React** (`react` and `react-dom` in `package.json`): Read [`references/react.md`](references/react.md), [`references/react-recipes.md`](references/react-recipes.md) and [`references/core.md`](references/core.md).
- **Angular** (`@angular/core` in `package.json`, Angular v19+): Read [`references/angular.md`](references/angular.md) and [`references/core.md`](references/core.md).

If the stack is ambiguous, ask the user before installing packages.

## 2. Check Dependencies

Never overwrite existing versions. Install only what is missing:

- **All stacks**: `firebase` (`^11.0.0 || ^12.0.0`), `@firebase-oss/ui-core`
- **React**: `@firebase-oss/ui-react`, `@firebase-oss/ui-styles`
- **shadcn/ui**: `@firebase-oss/ui-react`, `@firebase-oss/ui-styles` (plus registry components via `npx shadcn@latest add @firebase/<screen>`)
- **Angular**: `@angular/fire`, `@firebase-oss/ui-angular`, `@firebase-oss/ui-styles`

## 3. Firebase Configuration & `initializeUI`

Look for an existing `initializeApp(...)` call first. If none exists, create a Firebase config module (e.g., `src/firebase.ts`) and initialize FirebaseUI with `initializeUI` from `@firebase-oss/ui-core`:

```ts
import { initializeApp } from 'firebase/app';
import {
  initializeUI,
  autoAnonymousLogin,
  autoUpgradeAnonymousUsers,
  requireDisplayName,
} from '@firebase-oss/ui-core';

export const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...remaining Firebase config
});

export const ui = initializeUI({
  app,
  behaviors: [
    // Add behaviors as needed (see references/core.md):
    // autoAnonymousLogin(),
    // autoUpgradeAnonymousUsers(),
    // requireDisplayName(),
  ],
});
```

## 4. Capability Map (What FirebaseUI Provides Out of the Box)

Check this map before writing custom `firebase/auth` code or inspecting `node_modules`:

1. **Layer 1 — Predefined `*AuthScreen` Components (Card + Header + Form + MFA Assertion + Policies):**
   - `SignInAuthScreen`, `SignUpAuthScreen`, `ForgotPasswordAuthScreen`, `EmailLinkAuthScreen`, `PhoneAuthScreen`, `OAuthScreen`, `MultiFactorAuthEnrollmentScreen`, `MultiFactorAuthAssertionScreen` (Angular: `<fui-*-auth-screen>`).
   - Screens with `<SignInAuthScreen>`, `<SignUpAuthScreen>`, `<EmailLinkAuthScreen>`, `<PhoneAuthScreen>`, and `<OAuthScreen>` automatically switch to `MultiFactorAuthAssertionScreen` when an MFA challenge (`ui.multiFactorResolver`) is active.
2. **Layer 2 — Headless `*AuthForm` Components (Form Fields + Validation + Submission Without Card Chrome):**
   - `SignInAuthForm`, `SignUpAuthForm`, `ForgotPasswordAuthForm`, `EmailLinkAuthForm`, `PhoneAuthForm`, `MultiFactorAuthEnrollmentForm`, `MultiFactorAuthAssertionForm`, plus factor-specific forms (`SmsMultiFactorEnrollmentForm`, `SmsMultiFactorAssertionForm`, `TotpMultiFactorEnrollmentForm`, `TotpMultiFactorAssertionForm`).
   - Use `*AuthForm` when embedding auth inside your own page/modal layout or when custom actions accompany a form without double-wrapping in `.fui-card`.
3. **Layer 3 — Prebuilt OAuth Buttons, Hooks & UI Utilities:**
   - Branded buttons: `GoogleSignInButton`, `GitHubSignInButton`, `AppleSignInButton`, `MicrosoftSignInButton`, `FacebookSignInButton`, `TwitterSignInButton`, `YahooSignInButton`, and generic `OAuthButton`.
   - Utilities & hooks: `FirebaseUIProvider`, `useUI`, `useOnUserAuthenticated`, `useRedirectError`, `useRecaptchaVerifier`, `RedirectError`, `Policies`, `CountrySelector` (Angular: `provideFirebaseUI`, `provideFirebaseUIPolicies`, `injectUI`, `injectUserAuthenticated`).
4. **Layer 4 — Core Behaviors & Auth Actions (`@firebase-oss/ui-core`):**
   - Behaviors passed to `initializeUI({ app, behaviors: [...] })`: `autoAnonymousLogin()`, `autoUpgradeAnonymousUsers()`, `requireDisplayName()`, `recaptchaVerification()`, `providerPopupStrategy()`, `providerRedirectStrategy()`, `oneTapSignIn()`, `countryCodes()`, `legacyFetchSignInWithEmail()`.
   - Direct core actions (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendPasswordResetEmail`, `signInWithProvider`, `signInAnonymously`, `verifyPhoneNumber`, `confirmPhoneNumber`, `generateTotpSecret`, etc.) that automatically run registered behaviors (including anonymous account linking/upgrade). See [`references/core.md`](references/core.md).

### Flow-to-API Quick Lookup

| Authentication Flow | Recommended FirebaseUI Building Block | Reference |
| --- | --- | --- |
| Email + Password Sign-In | `<SignInAuthScreen onSignIn={...} onForgotPasswordClick={...} onSignUpClick={...}>` | [`references/react.md`](references/react.md) |
| Email + Password Sign-Up | `<SignUpAuthScreen onSignUp={...} onSignInClick={...}>` (+ `requireDisplayName()` behavior if display name is needed) | [`references/react.md`](references/react.md) |
| Password Reset | `<ForgotPasswordAuthScreen onPasswordSent={...} onBackToSignInClick={...} />` | [`references/react.md`](references/react.md) |
| Social / OAuth Sign-In | `<GoogleSignInButton />` (or `GitHubSignInButton`, `AppleSignInButton`, `OAuthButton`) passed as `children` of `SignInAuthScreen` / `SignUpAuthScreen` or inside `OAuthScreen` | [`references/react.md`](references/react.md) |
| Anonymous Sign-In & Upgrade | `autoUpgradeAnonymousUsers()` in `initializeUI({ app, behaviors })` + `signInAnonymously(ui.get())` (or `autoAnonymousLogin()`) | [`references/react-recipes.md`](references/react-recipes.md) (Guest, then add an email), [`references/core.md`](references/core.md) |
| Multi-Factor Auth (MFA) | `<MultiFactorAuthEnrollmentScreen hints={[FactorId.TOTP, FactorId.PHONE]} />` for enrollment; assertion is automatic inside `*AuthScreen` | [`references/react-recipes.md`](references/react-recipes.md) |
| Email Link / Phone SMS | `<EmailLinkAuthScreen />` / `<PhoneAuthScreen />` (email link route recipe in react-recipes) | [`references/react-recipes.md`](references/react-recipes.md) / [`references/react.md`](references/react.md) |
| Terms & Privacy Links | `policies={{ termsOfServiceUrl, privacyPolicyUrl }}` on `<FirebaseUIProvider>` | [`references/react.md`](references/react.md) |

## 5. Screen Defaults & Composition

- **Use Predefined Screens by Default:** Prefer `*AuthScreen` components (`SignInAuthScreen`, `SignUpAuthScreen`, `ForgotPasswordAuthScreen`, `MultiFactorAuthEnrollmentScreen`, etc.) over building custom form inputs. Pass `<GoogleSignInButton />` (or other provider buttons) as `children` of `<SignInAuthScreen>` or `<SignUpAuthScreen>` to render OAuth buttons below the form with an automatic divider.
- **Keep Auxiliary Controls Outside `.fui-screen` Cards (or Use `*AuthForm`):** `*AuthScreen` components render a complete self-contained card (`.fui-screen > .fui-card`) whose `children` slot is designed specifically for OAuth buttons (`GoogleSignInButton`, `OAuthButton`, etc.). If your app adds custom non-OAuth controls (such as a "Continue as guest" action or custom banners), either place them outside the `*AuthScreen` component with matching layout styles, or compose `<SignInAuthForm>` inside your own card container.
- **Ensure Base Reset Styles:** In projects without Tailwind CSS preflight, `@firebase-oss/ui-styles/dist.min.css` relies on `box-sizing: border-box` and reset borders on `fieldset`, `input`, and `button` (see [`references/react.md`](references/react.md)).

## 6. Common Gotchas

- **Missing Provider / Styles:** Every React `*AuthScreen`, `*AuthForm`, or OAuth button must be rendered inside `<FirebaseUIProvider ui={ui}>`, and `@firebase-oss/ui-styles/dist.min.css` (or `@import "@firebase-oss/ui-styles/tailwind"` in Tailwind v4) must be imported.
- **Passing `ui` vs `ui.get()`:** Pass the `FirebaseUIStore` returned by `initializeUI({ app })` directly to `<FirebaseUIProvider ui={ui}>`. When calling `@firebase-oss/ui-core` actions directly (e.g., `signInWithProvider(ui.get(), provider)`), pass `ui.get()` (or the `ui` value returned by `useUI()`).
- **Navigation Props Are Required for Screen Links:** `SignInAuthScreen` only renders the "Forgot password?" and "Sign up" links when `onForgotPasswordClick` and `onSignUpClick` are provided. `SignUpAuthScreen` only renders the "Sign in" link when `onSignInClick` is provided. `ForgotPasswordAuthScreen` only renders the "Back to sign in" button when `onBackToSignInClick` is provided.
- **Anonymous-to-Permanent Upgrade:** Instead of manually calling `linkWithCredential` from `firebase/auth`, pass `autoUpgradeAnonymousUsers()` in `initializeUI({ app, behaviors: [autoUpgradeAnonymousUsers()] })` so all FirebaseUI screens and OAuth buttons automatically upgrade anonymous users and preserve their `uid`.

## 7. Validation

After implementing authentication, run the project's typecheck and production build (e.g., `npm run build`) and fix any TypeScript or bundler errors before finishing.
