# FirebaseUI Web — Core, Behaviors & Auth Actions (`@firebase-oss/ui-core`)

Complete reference for `@firebase-oss/ui-core`, including `initializeUI`, behaviors, and core authentication functions. It is the same for every stack. How a stack gets the `FirebaseUI` state object (hook, injector or `ui.get()`) is in that stack's reference.

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
  // locale: a RegisteredLocale from '@firebase-oss/ui-translations' (e.g. esEs),
  behaviors: [
    autoAnonymousLogin(),
    autoUpgradeAnonymousUsers({
      onUpgrade: (ui, oldUserId, credential) => {
        // Optional hook when an anonymous user upgrades to a permanent account
      },
      onUpgradeFailure: ({ ui, oldUserId, error, credential, provider }) => {
        // Optional conflict hook (e.g., auth/credential-already-in-use). Return 'handled' to swallow the error.
      },
    }),
    requireDisplayName(),
  ],
});
```

### `FirebaseUI` State Shape (`ui.get()`)

| Property | Type | Description |
| --- | --- | --- |
| `app` | `FirebaseApp` | The Firebase `App` instance. |
| `auth` | `Auth` | The `firebase/auth` `Auth` instance (`ui.get().auth`). |
| `state` | `'idle' \| 'pending' \| 'loading'` | Current operation state (`setState(...)`). |
| `multiFactorResolver` | `MultiFactorResolver \| undefined` | Populated automatically when `auth/multi-factor-auth-required` is caught during sign-in; cleared once MFA assertion succeeds. |
| `redirectError` | `Error \| undefined` | Populated if a redirect OAuth or email-link flow fails. |
| `locale` | `RegisteredLocale` | Active locale (defaults to `enUs`). |
| `behaviors` | `Behaviors` | Active behaviors registered with `initializeUI`. |

---

## 2. Built-in Behaviors (`import { ... } from '@firebase-oss/ui-core'`)

Pass behaviors in the `behaviors: [...]` array of `initializeUI({ app, behaviors })`:

| Behavior Factory | What It Does |
| --- | --- |
| `autoAnonymousLogin()` | Once, when `initializeUI` runs (after `auth.authStateReady()`), signs in anonymously if there is no current user. It does not run again after sign-out. For an explicit signed-out landing state, leave it out and call `signInAnonymously(ui.get())` from a "Continue as guest" button. |
| `autoUpgradeAnonymousUsers(options?)` | When `auth.currentUser?.isAnonymous` is `true`, automatically intercepts `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `confirmPhoneNumber`, `signInWithCredential` (so also `signInWithEmailLink`), and `signInWithProvider` to **link** the new credential to the existing anonymous user (`linkWithCredential` / `linkWithPopup`), **preserving the anonymous user's `uid`**. Accepts `{ onUpgrade?: (ui, oldUserId, credential) => void, onUpgradeFailure?: (context: { ui, oldUserId, error, credential?, provider? }) => 'handled' \| void }` (both may be async). |
| `requireDisplayName()` | Causes `SignUpAuthScreen` / `SignUpAuthForm` to render a required "Display Name" field and updates the user's profile (`updateProfile`) upon sign-up. |
| `providerPopupStrategy()` | Default OAuth strategy (`signInWithPopup` / `linkWithPopup`). |
| `providerRedirectStrategy()` | Switches OAuth buttons to redirect flow (`signInWithRedirect` / `linkWithRedirect`) and handles `getRedirectResult` on page load. |
| `recaptchaVerification(options?)` | Configures the reCAPTCHA size/theme for phone auth and SMS MFA (`{ size?: 'normal' \| 'compact' \| 'invisible', theme?: 'light' \| 'dark' }`). |
| `countryCodes(options)` | Restricts or sets the default country in `PhoneAuthScreen` / `CountrySelector` (`{ allowedCountries?: CountryCode[], defaultCountry?: CountryCode }`). |
| `oneTapSignIn(options)` | Enables Google One Tap sign-in (`{ clientId: string, autoSelect?: boolean, cancelOnTapOutside?: boolean }`). |
| `legacyFetchSignInWithEmail()` | Enables legacy `fetchSignInMethodsForEmail` account-recovery hints when `showLegacySignInRecovery` is enabled on a screen. |

---

## 3. Core Auth Actions (`import { ... } from '@firebase-oss/ui-core'`)

All FirebaseUI screens, forms, and OAuth buttons call these functions under the hood. If you build custom triggers (such as a "Continue as guest" button or a custom upgrade form), call these `@firebase-oss/ui-core` functions with the `FirebaseUI` state object (`ui.get()`, or the hook or injector your stack's reference names; never the store `ui` itself) instead of raw `firebase/auth` functions so that registered behaviors (`autoUpgradeAnonymousUsers`, `multiFactorResolver` capture, pending state, and localized error formatting) execute automatically.

**The result can be `void`.** `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithProvider`, `signInWithCredential`, `signInWithEmailLink` and `confirmPhoneNumber` return `Promise<UserCredential | void>`: `void` means no credential came back (for example a multi-factor challenge is pending), so guard before using it (`if (credential) ...`).

**Sign-out is not in `ui-core`.** The sign-out call is `signOut(ui.get().auth)` from `firebase/auth`.

**Anonymous sign-in does not fire `onSignIn`.** Screen callbacks that follow auth state (`onSignIn` and friends) run for non-anonymous users only, and linking a credential to a guest emits no auth-state change, so they do not fire when `autoUpgradeAnonymousUsers()` upgrades a guest either. Navigate yourself after `signInAnonymously`. Which outputs receive the credential directly is in the stack's reference.


- **Email & Password:**
  - `signInWithEmailAndPassword(ui, email, password): Promise<UserCredential | void>`
  - `createUserWithEmailAndPassword(ui, email, password, displayName?): Promise<UserCredential | void>` — Automatically links `EmailAuthProvider.credential(email, password)` to `auth.currentUser` when `autoUpgradeAnonymousUsers()` is registered and the current user is anonymous!
  - `sendPasswordResetEmail(ui, email): Promise<void>`
- **Email Link:**
  - `sendSignInLinkToEmail(ui, email): Promise<void>` — No `actionCodeSettings` argument. The link always returns to `window.location.href` with `handleCodeInApp: true`, and the email is saved in `localStorage` (`emailForSignIn`).
  - `completeEmailLinkSignIn(ui, currentUrl): Promise<UserCredential | null>` — `currentUrl` is required (pass `window.location.href`). Reads the saved email, signs in, then clears it. Returns `null` if the URL is not a sign-in link or no email is saved.
  - `signInWithEmailLink(ui, email, link): Promise<UserCredential | void>` — `email` and `link` are both required.
- **OAuth & Anonymous:**
  - `signInWithProvider(ui, provider): Promise<UserCredential | void>` — Automatically links the OAuth provider to `auth.currentUser` when `autoUpgradeAnonymousUsers()` is registered and the current user is anonymous!
  - `signInAnonymously(ui): Promise<UserCredential>`
  - `signInWithCredential(ui, credential): Promise<UserCredential | void>`
  - `signInWithCustomToken(ui, customToken): Promise<UserCredential>`
- **Phone & Multi-Factor Authentication (MFA):**
  - `verifyPhoneNumber(ui, phoneNumber, appVerifier, mfaUser?, mfaHint?): Promise<string>` (returns `verificationId`)
  - `confirmPhoneNumber(ui, verificationId, verificationCode): Promise<UserCredential | void>`
  - `signInWithMultiFactorAssertion(ui, assertion): Promise<UserCredential>`
  - `enrollWithMultiFactorAssertion(ui, assertion, displayName?): Promise<void>`
  - `generateTotpSecret(ui): Promise<TotpSecret>`
  - `generateTotpQrCode(ui, secret, accountName?, issuer?): string` (synchronous; returns a data URL image string)
- **Error Formatting:**
  - `FirebaseUIError`
  - `handleFirebaseError(ui, error): Promise<never>` — throws a `FirebaseUIError` with a translated message
