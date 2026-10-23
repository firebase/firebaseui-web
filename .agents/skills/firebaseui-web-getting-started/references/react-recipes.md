# FirebaseUI Web — React Recipes (`@firebase-oss/ui-react`)

Companion to [`react.md`](react.md): multi-factor screens, the email link recipe, headless forms, hooks, and copy-paste setup recipes.

## 1. Multi-Factor Auth Screens

### `MultiFactorAuthEnrollmentScreen`

Allows a signed-in user to enroll a second factor (TOTP authenticator app and/or SMS phone verification). Note: Firebase Auth requires an authenticated, non-anonymous user session to enroll MFA factors.

```tsx
import { FactorId } from 'firebase/auth';
import { MultiFactorAuthEnrollmentScreen } from '@firebase-oss/ui-react';

export function MfaEnrollmentSection({ onComplete }: { onComplete?: () => void }) {
  return (
    <MultiFactorAuthEnrollmentScreen
      hints={[FactorId.TOTP, FactorId.PHONE]}
      onEnrollment={() => onComplete?.()}
    />
  );
}
```

| Prop | Type | Description |
| --- | --- | --- |
| `hints` | `Hint[]` (`(typeof FactorId.PHONE \| typeof FactorId.TOTP)[]`) | Optional list of factor types to offer. Defaults to `[FactorId.TOTP, FactorId.PHONE]`. |
| `onEnrollment` | `() => void` | Called when the user finishes enrolling the factor. |

### `MultiFactorAuthAssertionScreen`

Completes MFA verification when `ui.multiFactorResolver` is set. Automatically rendered by `SignInAuthScreen`, `SignUpAuthScreen`, `EmailLinkAuthScreen`, `PhoneAuthScreen`, and `OAuthScreen`, or can be mounted standalone:

```tsx
import { MultiFactorAuthAssertionScreen } from '@firebase-oss/ui-react';

<MultiFactorAuthAssertionScreen onSuccess={(credential) => console.log(credential.user)} />
```

---

## 2. Email Link Recipe

Mount one `EmailLinkAuthScreen` on the route the emailed link should return to. It sends the link with that page's URL as the continue URL, and completes sign-in on mount when the page is opened from the link. There is nothing else to configure (no `actionCodeSettings`, no manual `completeEmailLinkSignIn`). The email is kept in `localStorage`, so the link must be opened in the same browser.

```tsx
import { useNavigate } from 'react-router-dom';
import { EmailLinkAuthScreen } from '@firebase-oss/ui-react';

export function EmailLinkPage() {
  const navigate = useNavigate();
  return <EmailLinkAuthScreen onSignIn={() => navigate('/')} />; // route: /email-link
}
```

`onSignIn` follows auth-state changes, so it does not fire when the link upgrades an anonymous user (linking emits no auth-state event). In that case use `<EmailLinkAuthForm onSignIn={(credential) => ...} />`, which receives the credential directly.

---

## 3. Headless `*AuthForm` Components

Use `*AuthForm` components when you want FirebaseUI's form state, validation, localization, and submission logic inside your own custom page or card layout (avoiding nested `.fui-card` containers):

| Component | Props |
| --- | --- |
| `SignInAuthForm` | `{ onSignIn?: (credential: UserCredential) => void, onForgotPasswordClick?: () => void, onSignUpClick?: () => void }` |
| `SignUpAuthForm` | `{ onSignUp?: (credential: UserCredential) => void, onSignInClick?: () => void }` |
| `ForgotPasswordAuthForm` | `{ onPasswordSent?: () => void, onBackToSignInClick?: () => void }` |
| `EmailLinkAuthForm` | `{ onEmailSent?: () => void, onSignIn?: (credential: UserCredential) => void }` |
| `PhoneAuthForm` | `{ onSignIn?: (credential: UserCredential) => void }` |
| `MultiFactorAuthEnrollmentForm` | `{ onEnrollment?: () => void, hints?: Hint[] }` |
| `MultiFactorAuthAssertionForm` | `{ onSuccess?: (credential: UserCredential) => void }` |
| `SmsMultiFactorEnrollmentForm` | `{ onEnrollment?: () => void }` |
| `SmsMultiFactorAssertionForm` | `{ hint: MultiFactorInfo, onSuccess?: (credential: UserCredential) => void }` |
| `TotpMultiFactorEnrollmentForm` | `{ onEnrollment?: () => void }` |
| `TotpMultiFactorAssertionForm` | `{ hint: MultiFactorInfo, onSuccess?: (credential: UserCredential) => void }` |

---

## 4. Hooks & UI Utilities

- **`useUI(): FirebaseUI`** — Returns the current `FirebaseUI` state object (`{ app, auth, state, multiFactorResolver, redirectError, locale, behaviors }`).
- **`useOnUserAuthenticated(callback: (user: User) => void)`** — Runs `callback` when a non-anonymous user authenticates (`!user.isAnonymous`).
- **`useRedirectError(): string | undefined`** — Returns a formatted error message if a redirect sign-in failed.
- **`useRecaptchaVerifier(containerRef: RefObject<HTMLDivElement | null>)`** — Renders and manages a Firebase `RecaptchaVerifier` instance.
- **`<RedirectError />`**, **`<Policies />`**, **`<Divider />`**, **`<CountrySelector />`** — Standalone UI primitives used inside screens and custom layouts.

---

## 5. Recipes

### Auth emulator setup (`src/firebase.ts`)

Connect the emulator before `initializeUI`. Behaviors you pass are merged with the defaults, so reCAPTCHA (phone/MFA) stays enabled without listing it.

```ts
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { initializeUI, autoUpgradeAnonymousUsers } from '@firebase-oss/ui-core';

const app = initializeApp(firebaseConfig); // reuse the project's existing config
const auth = getAuth(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

export const ui = initializeUI({ app, auth, behaviors: [autoUpgradeAnonymousUsers()] });
```

### Guest, then add an email

With `autoUpgradeAnonymousUsers()` registered, sign-up (and OAuth and phone) links to the signed-in guest and keeps its `uid`. Call core actions with the `FirebaseUI` object: `useUI()` inside components, `ui.get()` outside. Passing the store itself (`ui`) fails at runtime (`setState is not a function`).

```tsx
import { useNavigate } from 'react-router-dom';
import { signInAnonymously } from '@firebase-oss/ui-core';
import { Button, SignUpAuthScreen, useUI } from '@firebase-oss/ui-react';

export function GuestButton() {
  const ui = useUI();
  return <Button onClick={() => signInAnonymously(ui)}>Continue as guest</Button>;
}

export function AddEmailPage() {
  const navigate = useNavigate();
  return <SignUpAuthScreen onSignUp={() => navigate('/')} />; // route: /add-email
}
```

### `Button` and `Card`

Both come from `@firebase-oss/ui-react` and use the FirebaseUI styles. `Button` accepts normal `<button>` props plus `variant?: 'primary' | 'secondary'` (default `'primary'`) and `asChild`. Wrap a `Card` in `.fui-screen` (`max-w-sm mx-auto`) to match the screens' width and centring.

```tsx
import { Button, Card, CardHeader, CardTitle, CardSubtitle, CardContent } from '@firebase-oss/ui-react';

export function Panel() {
  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardSubtitle>Optional subtitle</CardSubtitle>
        </CardHeader>
        <CardContent>
          <Button variant="secondary">Action</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```
