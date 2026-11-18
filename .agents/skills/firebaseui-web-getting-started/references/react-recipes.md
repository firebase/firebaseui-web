# FirebaseUI Web — React Recipes (`@firebase-oss/ui-react`)

Companion to [`react.md`](react.md): flow lookup, multi-factor screens, the email link recipe, headless forms, hooks, and copy-paste setup recipes.

## 0. Flow-to-Component Lookup

| Flow | Building block | Where |
| --- | --- | --- |
| Email + password sign-in | `<SignInAuthScreen onSignIn onForgotPasswordClick onSignUpClick>` | `react.md` |
| Email + password sign-up | `<SignUpAuthScreen onSignUp onSignInClick>` (`requireDisplayName()` adds a name field) | `react.md` |
| Password reset | `<ForgotPasswordAuthScreen onPasswordSent onBackToSignInClick />` | `react.md` |
| Social / OAuth | `<GoogleSignInButton />` etc. as `children` of `SignInAuthScreen` / `SignUpAuthScreen`, or inside `OAuthScreen` | `react.md` |
| Phone SMS | `<PhoneAuthScreen />` | `react.md` |
| Email link | one `<EmailLinkAuthScreen />` on the route the link returns to | section 2 |
| Anonymous sign-in and upgrade | `autoUpgradeAnonymousUsers()` + `signInAnonymously(useUI())`, then `SignUpAuthScreen` keeps the `uid` | section 5 |
| Multi-factor | `<MultiFactorAuthEnrollmentScreen hints={[FactorId.PHONE]} />`; assertion is automatic inside the screens | section 1 |
| Terms and privacy links | `policies={{ termsOfServiceUrl, privacyPolicyUrl }}` on `<FirebaseUIProvider>` | `react.md` section 2 |
| Sign-out | `signOut(useUI().auth)` from `firebase/auth` (`ui-core` has no sign-out) | n/a |

The "Forgot password?", "Sign up", "Sign in" and "Back to sign in" links render only when their handler prop is set. Do not call `linkWithCredential` yourself: with `autoUpgradeAnonymousUsers()` every screen and OAuth button links to the guest.

## 1. Multi-Factor Auth Screens

### `MultiFactorAuthEnrollmentScreen`

Allows a signed-in user to enroll a second factor (TOTP authenticator app and/or SMS phone verification). Note: Firebase Auth requires an authenticated, non-anonymous user session to enroll MFA factors. The Auth emulator cannot complete TOTP, so against it pass `hints={[FactorId.PHONE]}`.

```tsx
import { FactorId } from 'firebase/auth';
import { MultiFactorAuthEnrollmentScreen } from '@firebase-oss/ui-react';

<MultiFactorAuthEnrollmentScreen hints={[FactorId.PHONE]} onEnrollment={() => navigate('/account')} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `hints` | `Hint[]` (`(typeof FactorId.PHONE \| typeof FactorId.TOTP)[]`) | Optional list of factor types to offer. Defaults to `[FactorId.TOTP, FactorId.PHONE]`; an empty list throws. |
| `onEnrollment` | `() => void` | Called when the user finishes enrolling the factor. |

### `MultiFactorAuthAssertionScreen`

Completes MFA verification when `ui.multiFactorResolver` is set. Automatically rendered by `SignInAuthScreen`, `SignUpAuthScreen`, `EmailLinkAuthScreen`, `PhoneAuthScreen`, and `OAuthScreen`, or can be mounted standalone:

```tsx
import { MultiFactorAuthAssertionScreen } from '@firebase-oss/ui-react';

<MultiFactorAuthAssertionScreen onSuccess={(credential) => console.log(credential.user)} />
```

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

## 4. Hooks & UI Utilities

- `useUI(): FirebaseUI`: the state object (`{ app, auth, state, multiFactorResolver, redirectError, locale, behaviors }`).
- `useOnUserAuthenticated((user: User) => void)`: runs when a non-anonymous user authenticates.
- `useRedirectError(): string | undefined`: message when a redirect sign-in failed.
- `useRecaptchaVerifier(containerRef)`: renders and manages a `RecaptchaVerifier`.
- `<RedirectError />`, `<Policies />`, `<Divider />`, `<CountrySelector />`: primitives used inside screens and custom layouts.

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
import { Button, Card, CardContent, CardHeader, CardSubtitle, CardTitle, SignUpAuthScreen, useUI } from '@firebase-oss/ui-react';

export function GuestPage() {
  const ui = useUI();
  const navigate = useNavigate();
  return (
    <div className="fui-screen">
      <Card>
        <CardHeader>
          <CardTitle>Continue as guest</CardTitle>
          <CardSubtitle>Try the app without an account. You can add an email later and keep your data.</CardSubtitle>
        </CardHeader>
        <CardContent>
          <Button onClick={async () => { await signInAnonymously(ui); navigate('/account'); }}>Continue as guest</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AddEmailPage() {
  const navigate = useNavigate();
  return <SignUpAuthScreen onSignUp={() => navigate('/')} />; // route: /add-email
}
```

### `Button` and `Card`

Both come from `@firebase-oss/ui-react` (usage in the guest page above). `Button` takes normal `<button>` props plus `variant?: 'primary' | 'secondary'` and `asChild`. `Card` pieces: `CardHeader`, `CardTitle`, `CardSubtitle`, `CardContent`. Wrap a `Card` in `.fui-screen` to match the screens' width and centring.

### Auth state, guarded routes and the account page

`useUI().auth` is the Firebase `Auth`. Keep the user `undefined` until the first auth-state answer so a guard does not redirect too early. Sign-out is `signOut` from `firebase/auth`. Wrap any page that needs a signed-in user (`/account`, MFA enrollment, adding an email to a guest) in `RequireAuth`.

```tsx
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Button, Card, CardContent, CardHeader, CardTitle, useUI } from '@firebase-oss/ui-react';

export function useAuthUser() {
  const { auth } = useUI();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), [auth]);
  return user;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthUser();
  if (user === undefined) return null;
  return user ? children : <Navigate to="/sign-in" replace />;
}

export function AccountPage() {
  const { auth } = useUI();
  const user = useAuthUser();
  const navigate = useNavigate();
  return (
    <RequireAuth>
      <div className="fui-screen">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent>
            <p>uid: {user?.uid}</p>
            <p>email: {user?.email ?? ''}</p>
            <Button variant="secondary" onClick={async () => { await signOut(auth); navigate('/sign-in'); }}>Sign out</Button>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
```
