# FirebaseUI Web — Core, Behaviors & Auth Actions (`@firebase-oss/ui-core`)

Complete reference for `@firebase-oss/ui-core`, including `initializeUI`, behaviors, and core authentication functions.

## 1. `initializeUI`

`initializeUI` creates (or returns) a reactive `FirebaseUIStore` (`DeepMapStore<FirebaseUI>`) bound to your Firebase `App` and `Auth` instance:

```ts
import { initializeApp } from 'firebase/app';
import {
  initializeUI,
  autoAnonymousLogin,
  autoUpgradeAnonymousUsers,
  requireDisplayName,
} from '@firebase-oss/ui-core';

const app = initializeApp(firebaseConfig);

export const ui = initializeUI({
  app,
  // Optional:
  // auth: getAuth(app),
  // locale: registerLocale('es', spanishTranslations),
  behaviors: [
    autoAnonymousLogin(),
    autoUpgradeAnonymousUsers({
      onUpgrade: (ui, credential) => {
        // Optional hook when an anonymous user upgrades to a permanent account
      },
      onUpgradeFailure: async (ui, error, credential) => {
        // Optional conflict resolution hook (e.g., when auth/credential-already-in-use occurs)
      },
    }),
    requireDisplayName(),
  ],
});
```

### `FirebaseUI` State Shape (`ui.get()` or `useUI()`)

| Property | Type | Description |
| --- | --- | --- |
| `app` | `FirebaseApp` | The Firebase `App` instance. |
| `auth` | `Auth` | The `firebase/auth` `Auth` instance (`ui.get().auth` / `useUI().auth`). |
| `state` | `'idle' \| 'pending'` | Current operation state (`setState('idle' \| 'pending')`). |
| `multiFactorResolver` | `MultiFactorResolver \| undefined` | Populated automatically when `auth/multi-factor-auth-required` is caught during sign-in; cleared once MFA assertion succeeds. |
| `redirectError` | `Error \| FirebaseError \| undefined` | Populated if a redirect OAuth or email-link flow fails. |
| `locale` | `RegisteredLocale` | Active locale (defaults to `enUs`). |
| `behaviors` | `Behavior[]` | Active behaviors registered with `initializeUI`. |

---

## 2. Built-in Behaviors (`import { ... } from '@firebase-oss/ui-core'`)

Pass behaviors in the `behaviors: [...]` array of `initializeUI({ app, behaviors })`:

| Behavior Factory | What It Does |
| --- | --- |
| `autoAnonymousLogin()` | Automatically signs the user in anonymously via `signInAnonymously(auth)` whenever `onAuthStateChanged` emits `null`. Note: wait to call `autoAnonymousLogin()` or sign out carefully if you want an explicit unauthenticated landing state, or use `signInAnonymously(ui.get())` on demand for a "Continue as guest" button. |
| `autoUpgradeAnonymousUsers(options?)` | When `auth.currentUser?.isAnonymous` is `true`, automatically intercepts `createUserWithEmailAndPassword`, `signInWithProvider`, `verifyPhoneNumber`, and `signInWithEmailLink` to **link** the new credential to the existing anonymous user (`linkWithCredential` / `linkWithPopup`), **preserving the anonymous user's `uid`**. Accepts `{ onUpgrade?: (ui, credential) => void, onUpgradeFailure?: (ui, error, credential) => Promise<void> \| void }`. |
| `requireDisplayName()` | Causes `SignUpAuthScreen` / `SignUpAuthForm` to render a required "Display Name" field and updates the user's profile (`updateProfile`) upon sign-up. |
| `providerPopupStrategy()` | Default OAuth strategy (`signInWithPopup` / `linkWithPopup`). |
| `providerRedirectStrategy()` | Switches OAuth buttons to redirect flow (`signInWithRedirect` / `linkWithRedirect`) and handles `getRedirectResult` on page load. |
| `recaptchaVerification(options?)` | Configures the reCAPTCHA size/theme for phone auth and SMS MFA (`{ size?: 'normal' \| 'compact' \| 'invisible', theme?: 'light' \| 'dark' }`). |
| `countryCodes(options)` | Restricts or sets the default country in `PhoneAuthScreen` / `CountrySelector` (`{ allowedCountries?: CountryCode[], defaultCountry?: CountryCode }`). |
| `oneTapSignIn(options)` | Enables Google One Tap sign-in (`{ clientId: string, autoSelect?: boolean, cancelOnTapOutside?: boolean }`). |
| `legacyFetchSignInWithEmail()` | Enables legacy `fetchSignInMethodsForEmail` account-recovery hints when `showLegacySignInRecovery` is enabled on a screen. |

---

## 3. Core Auth Actions (`import { ... } from '@firebase-oss/ui-core'`)

All FirebaseUI screens, forms, and OAuth buttons call these functions under the hood. If you build custom triggers (such as a "Continue as guest" button or a custom upgrade form), call these `@firebase-oss/ui-core` functions with `ui.get()` (or `useUI()` in React) instead of raw `firebase/auth` functions so that registered behaviors (`autoUpgradeAnonymousUsers`, `multiFactorResolver` capture, pending state, and localized error formatting) execute automatically:

- **Email & Password:**
  - `signInWithEmailAndPassword(ui, email, password): Promise<UserCredential>`
  - `createUserWithEmailAndPassword(ui, email, password, displayName?): Promise<UserCredential>` — Automatically links `EmailAuthProvider.credential(email, password)` to `auth.currentUser` when `autoUpgradeAnonymousUsers()` is registered and the current user is anonymous!
  - `sendPasswordResetEmail(ui, email): Promise<void>`
- **Email Link:**
  - `sendSignInLinkToEmail(ui, email): Promise<void>` — No `actionCodeSettings` argument. The link always returns to `window.location.href` with `handleCodeInApp: true`, and the email is saved in `localStorage` (`emailForSignIn`).
  - `completeEmailLinkSignIn(ui, currentUrl): Promise<UserCredential | null>` — `currentUrl` is required (pass `window.location.href`). Reads the saved email, signs in, then clears it. Returns `null` if the URL is not a sign-in link or no email is saved.
  - `signInWithEmailLink(ui, email, link): Promise<UserCredential | void>` — `email` and `link` are both required.
- **OAuth & Anonymous:**
  - `signInWithProvider(ui, provider): Promise<UserCredential>` — Automatically links the OAuth provider to `auth.currentUser` when `autoUpgradeAnonymousUsers()` is registered and the current user is anonymous!
  - `signInAnonymously(ui): Promise<UserCredential>`
  - `signInWithCredential(ui, credential): Promise<UserCredential>`
  - `signInWithCustomToken(ui, customToken): Promise<UserCredential>`
- **Phone & Multi-Factor Authentication (MFA):**
  - `verifyPhoneNumber(ui, phoneNumber, appVerifier, mfaUser?, mfaHint?): Promise<string>` (returns `verificationId`)
  - `confirmPhoneNumber(ui, verificationId, verificationCode): Promise<UserCredential>`
  - `signInWithMultiFactorAssertion(ui, assertion): Promise<UserCredential>`
  - `enrollWithMultiFactorAssertion(ui, assertion, displayName?): Promise<void>`
  - `generateTotpSecret(ui): Promise<TotpSecret>`
  - `generateTotpQrCode(ui, secret, accountName?, issuer?): Promise<string>` (returns a data URL image string)
- **Error Formatting:**
  - `FirebaseUIError`
  - `formatFirebaseError(error, locale): string`
