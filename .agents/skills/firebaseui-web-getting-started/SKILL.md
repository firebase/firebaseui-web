---
name: firebaseui-web-getting-started
description: Add FirebaseUI Web authentication (sign-in, sign-up, password reset, email link, phone, OAuth, anonymous upgrade, MFA screens, forms, behaviors) to React, shadcn/ui, and Angular apps. This skill's references hold every prop and signature needed, so do not search node_modules, and never glob `**/*` or `src/**/*` from the project root (it matches node_modules); glob with targetDirectory `src`.
---

# FirebaseUI Web Getting Started

Implement Firebase authentication with FirebaseUI Web (`@firebase-oss/ui-*`): detect the stack, configure `@firebase-oss/ui-core`, and load the reference files for your UI framework.

## 0. Search Rules (Read Before Using Any Search Tool)

- **Never glob `**/*` or `src/**/*` from the project root.** The glob tool matches a pattern at any depth, so both also match every `node_modules/**/src/` folder and return thousands of paths (over 160,000 characters), almost all inside `node_modules`. Call glob with `targetDirectory: "src"` (or another specific subfolder) and a narrow pattern such as `**/*.tsx`. Give grep `path: "src"`, not `.`.
- **Do not read, grep, or glob inside `node_modules`.** The packages ship only minified `dist/` bundles and 150-280 KB `.d.ts` files, and greps there have returned nothing. Every prop, signature, and recipe you need is in the references below; if something is missing, state your assumption and let `npm run build` confirm it.
- **Read in one parallel batch:** `package.json`, `src/main.tsx`, `src/App.tsx`, and the reference files for your stack (step 1).

## 1. Detect the Stack & Load the References

- **shadcn/ui** (`components.json` alongside `react` and `tailwindcss`): [`references/shadcn.md`](references/shadcn.md) and [`references/core.md`](references/core.md).
- **React** (`react` and `react-dom` in `package.json`): [`references/react.md`](references/react.md), [`references/react-recipes.md`](references/react-recipes.md) and [`references/core.md`](references/core.md).
- **Angular** (`@angular/core`, v19+): [`references/angular.md`](references/angular.md) and [`references/core.md`](references/core.md).

If the stack is ambiguous, ask the user before installing packages.

## 2. Check Dependencies

Never overwrite existing versions. Install only what is missing:

- **All stacks**: `firebase` (`^11.0.0 || ^12.0.0`), `@firebase-oss/ui-core`
- **React**: `@firebase-oss/ui-react`, `@firebase-oss/ui-styles`
- **shadcn/ui**: `@firebase-oss/ui-react`, `@firebase-oss/ui-styles` (plus registry components via `npx shadcn@latest add @firebase/<screen>`)
- **Angular**: `@angular/fire`, `@firebase-oss/ui-angular`, `@firebase-oss/ui-styles`

## 3. Firebase Configuration & `initializeUI`

Look for an existing `initializeApp(...)` call first. If none exists, create a config module (e.g., `src/firebase.ts`):

```ts
import { initializeApp } from 'firebase/app';
import { initializeUI, autoUpgradeAnonymousUsers } from '@firebase-oss/ui-core';

export const app = initializeApp({ /* the project's Firebase config */ });

export const ui = initializeUI({
  app,
  behaviors: [autoUpgradeAnonymousUsers()], // more behaviors: references/core.md
});
```

For the Auth emulator, use the `src/firebase.ts` recipe in [`references/react-recipes.md`](references/react-recipes.md).

## 4. What FirebaseUI Provides

Check this before writing custom `firebase/auth` code:

- **`*AuthScreen`** (card + form + MFA assertion + policies): `SignIn`, `SignUp`, `ForgotPassword`, `EmailLink`, `Phone`, `OAuth`, `MultiFactorAuthEnrollment`, `MultiFactorAuthAssertion` (Angular: `<fui-*-auth-screen>`). Sign-in, sign-up, email link, phone and OAuth screens switch to the MFA assertion screen on their own when `ui.multiFactorResolver` is set.
- **`*AuthForm`**: the same forms without card chrome, for your own layouts (details in `react-recipes.md`).
- **Buttons, hooks, utilities**: `GoogleSignInButton`, `GitHubSignInButton`, `AppleSignInButton`, `MicrosoftSignInButton`, `FacebookSignInButton`, `TwitterSignInButton`, `YahooSignInButton`, `OAuthButton`, `FirebaseUIProvider`, `useUI`, `useOnUserAuthenticated`, `useRedirectError`, `useRecaptchaVerifier`, `RedirectError`, `Policies`, `CountrySelector` (Angular: `provideFirebaseUI`, `provideFirebaseUIPolicies`, `injectUI`, `injectUserAuthenticated`).
- **Behaviors** for `initializeUI({ app, behaviors })`: `autoAnonymousLogin()`, `autoUpgradeAnonymousUsers()`, `requireDisplayName()`, `recaptchaVerification()`, `providerPopupStrategy()`, `providerRedirectStrategy()`, `oneTapSignIn()`, `countryCodes()`, `legacyFetchSignInWithEmail()`.
- **Core actions** (`signInWithEmailAndPassword`, `signInWithProvider`, `signInAnonymously`, `verifyPhoneNumber`, `generateTotpSecret`, and the rest in `core.md`) run the registered behaviors, including anonymous-account upgrade.

### Flow-to-API Quick Lookup (React)

| Authentication Flow | Building Block | Reference |
| --- | --- | --- |
| Email + Password Sign-In | `<SignInAuthScreen onSignIn onForgotPasswordClick onSignUpClick>` | [`react.md`](references/react.md) |
| Email + Password Sign-Up | `<SignUpAuthScreen onSignUp onSignInClick>` (+ `requireDisplayName()` for a display name) | [`react.md`](references/react.md) |
| Password Reset | `<ForgotPasswordAuthScreen onPasswordSent onBackToSignInClick />` | [`react.md`](references/react.md) |
| Social / OAuth | `<GoogleSignInButton />` etc. as `children` of `SignInAuthScreen` / `SignUpAuthScreen`, or inside `OAuthScreen` | [`react.md`](references/react.md) |
| Phone SMS | `<PhoneAuthScreen />` | [`react.md`](references/react.md) |
| Email Link | one `<EmailLinkAuthScreen />` on the route the link returns to; nothing else to configure | [`react-recipes.md`](references/react-recipes.md) |
| Anonymous Sign-In & Upgrade | `autoUpgradeAnonymousUsers()` + `signInAnonymously(useUI())`, then `SignUpAuthScreen` keeps the `uid` | [`react-recipes.md`](references/react-recipes.md) (Guest, then add an email) |
| MFA | `<MultiFactorAuthEnrollmentScreen hints={[FactorId.TOTP, FactorId.PHONE]} />`; assertion is automatic inside the screens | [`react-recipes.md`](references/react-recipes.md) |
| Terms & Privacy Links | `policies={{ termsOfServiceUrl, privacyPolicyUrl }}` on `<FirebaseUIProvider>` | [`react.md`](references/react.md) |

## 5. Gotchas

- **Provider and styles:** every `*AuthScreen`, `*AuthForm` and OAuth button must be inside `<FirebaseUIProvider ui={ui}>`, and `@firebase-oss/ui-styles/dist.min.css` (or `@import "@firebase-oss/ui-styles/tailwind"` in Tailwind v4) must be imported. Without Tailwind, also add the small CSS reset in `react.md` section 1.
- **`ui` vs `ui.get()`:** pass the store returned by `initializeUI` straight to `<FirebaseUIProvider ui={ui}>`. Pass `ui.get()` (or the value of `useUI()`) to `@firebase-oss/ui-core` actions such as `signInWithProvider(ui.get(), provider)`.
- **Screen links need handlers:** `SignInAuthScreen` renders "Forgot password?" and "Sign up" only when `onForgotPasswordClick` and `onSignUpClick` are set; `SignUpAuthScreen` renders "Sign in" only with `onSignInClick`; `ForgotPasswordAuthScreen` renders "Back to sign in" only with `onBackToSignInClick`.
- **Extra controls go outside the card:** `*AuthScreen` renders a self-contained `.fui-screen > .fui-card` whose `children` slot is for OAuth buttons. Put other controls (such as "Continue as guest") outside it, or compose a `*AuthForm` inside your own card.
- **Anonymous upgrade:** do not call `linkWithCredential` yourself. With `autoUpgradeAnonymousUsers()` in `initializeUI`, every FirebaseUI screen and OAuth button links to the anonymous user and keeps its `uid`.

## 6. Validation

Run the project's typecheck and production build (e.g., `npm run build`) and fix any errors before finishing.
