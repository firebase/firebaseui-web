# FirebaseUI Web — React Reference (`@firebase-oss/ui-react`)

Complete reference for `@firebase-oss/ui-react` and `@firebase-oss/ui-styles`.

## 1. Installation & Styling Setup

```bash
npm install firebase @firebase-oss/ui-core @firebase-oss/ui-react @firebase-oss/ui-styles
```

### Option A: Plain CSS / Non-Tailwind Projects (`dist.min.css`)

Import the prebuilt stylesheet once in your app entry (e.g., `src/main.tsx` or `src/App.tsx`):

```tsx
import '@firebase-oss/ui-styles/dist.min.css';
```

**Important CSS Reset Note for Non-Tailwind Projects:** `@firebase-oss/ui-styles/dist.min.css` does not bundle Tailwind's Preflight reset. Without a CSS reset, browser-default user-agent styles on `<fieldset>`, `<input>`, and `<button>` will add native grooved borders and padding inside `.fui-form`. In apps without Tailwind CSS, include a minimal reset in your global CSS (e.g., `src/index.css`):

```css
*, *::before, *::after {
  box-sizing: border-box;
}
.fui-screen fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}
```

### Option B: Tailwind CSS v4 Projects

In your main CSS file (where `@import "tailwindcss";` is loaded), import the FirebaseUI Tailwind theme instead of `dist.min.css`:

```css
@import "tailwindcss";
@import "@firebase-oss/ui-styles/tailwind";
```

---

## 2. `FirebaseUIProvider` & Policies

Wrap your application (or auth route tree) in `<FirebaseUIProvider ui={ui}>`:

```tsx
import { FirebaseUIProvider } from '@firebase-oss/ui-react';
import { ui } from './firebase';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseUIProvider
      ui={ui}
      policies={{
        termsOfServiceUrl: '/terms',
        privacyPolicyUrl: '/privacy',
        // Optional custom SPA navigation handler for policy links:
        // onNavigate: (url) => navigate(url.toString()),
      }}
    >
      {children}
    </FirebaseUIProvider>
  );
}
```

| Prop | Type | Description |
| --- | --- | --- |
| `ui` | `FirebaseUIStore` | **Required.** Store returned by `initializeUI({ app })`. |
| `policies` | `PolicyConfig` | Optional `{ termsOfServiceUrl: string \| URL, privacyPolicyUrl: string \| URL, onNavigate?: (url: string \| URL) => void }`. Rendered automatically by screens and forms via `<Policies />`. |
| `children` | `ReactNode` | React children. |

---

## 3. Predefined `*AuthScreen` Components

Every `*AuthScreen` renders a complete `.fui-screen` card with header, localized title/subtitle, form/content, `<RedirectError />`, and `<Policies />`.

**Automatic MFA Assertion Handling:** `SignInAuthScreen`, `SignUpAuthScreen`, `EmailLinkAuthScreen`, `PhoneAuthScreen`, and `OAuthScreen` automatically render `<MultiFactorAuthAssertionScreen />` whenever `ui.multiFactorResolver` is active (e.g., when a user with MFA enabled signs in and Firebase throws `auth/multi-factor-auth-required`). You do **not** need custom conditional logic to switch to MFA assertion during sign-in.

### `SignInAuthScreen`

Email + password sign-in screen. Pass OAuth buttons as `children` to display social sign-in below the email form (separated by an automatic `<Divider />`).

```tsx
import { SignInAuthScreen, GoogleSignInButton } from '@firebase-oss/ui-react';
import { useNavigate } from 'react-router-dom';

export function SignInPage() {
  const navigate = useNavigate();

  return (
    <SignInAuthScreen
      onSignIn={(user) => navigate('/')}
      onForgotPasswordClick={() => navigate('/forgot-password')}
      onSignUpClick={() => navigate('/sign-up')}
    >
      <GoogleSignInButton />
    </SignInAuthScreen>
  );
}
```

| Prop | Type | Description |
| --- | --- | --- |
| `onSignIn` | `(user: User) => void` | Called whenever a user is authenticated (via email/password or child OAuth buttons) when no MFA challenge is pending. |
| `onForgotPasswordClick` | `() => void` | When provided, renders the "Forgot password?" button and invokes this callback on click. |
| `onSignUpClick` | `() => void` | When provided, renders the "Don't have an account? Sign up" action and invokes this callback on click. |
| `showLegacySignInRecovery` | `boolean` | Defaults to `false`. Set `true` alongside `legacyFetchSignInWithEmail()` behavior to show account recovery hints. |
| `children` | `ReactNode` | Slot for OAuth buttons (`<GoogleSignInButton />`, `<OAuthButton />`, etc.). |

### `SignUpAuthScreen`

Email + password account creation screen. Automatically includes a "Display Name" input field when `requireDisplayName()` is passed to `initializeUI({ app, behaviors: [requireDisplayName()] })`.

```tsx
import { SignUpAuthScreen, GoogleSignInButton } from '@firebase-oss/ui-react';
import { useNavigate } from 'react-router-dom';

export function SignUpPage() {
  const navigate = useNavigate();

  return (
    <SignUpAuthScreen
      onSignUp={(user) => navigate('/')}
      onSignInClick={() => navigate('/sign-in')}
    >
      <GoogleSignInButton />
    </SignUpAuthScreen>
  );
}
```

| Prop | Type | Description |
| --- | --- | --- |
| `onSignUp` | `(user: User) => void` | Called when registration (or child OAuth sign-in) completes. |
| `onSignInClick` | `() => void` | When provided, renders the "Already have an account? Sign in" link and invokes this callback on click. |
| `children` | `ReactNode` | Slot for OAuth buttons (`<GoogleSignInButton />`, etc.). |

### `ForgotPasswordAuthScreen`

Password reset email request screen. Displays a confirmation message inside the form once the reset email is sent.

```tsx
import { ForgotPasswordAuthScreen } from '@firebase-oss/ui-react';
import { useNavigate } from 'react-router-dom';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <ForgotPasswordAuthScreen
      onPasswordSent={() => {
        // Optional callback after reset email is dispatched
      }}
      onBackToSignInClick={() => navigate('/sign-in')}
    />
  );
}
```

| Prop | Type | Description |
| --- | --- | --- |
| `onPasswordSent` | `() => void` | Called after `sendPasswordResetEmail` succeeds. |
| `onBackToSignInClick` | `() => void` | When provided, renders the "Back to sign in" button and invokes this callback on click. |

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

### `EmailLinkAuthScreen`, `PhoneAuthScreen`, and `OAuthScreen`

- **`EmailLinkAuthScreen`**: `{ onEmailSent?: () => void, onSignIn?: (user: User) => void, children?: ReactNode }` — passwordless email magic link sign-in (automatically completes sign-in on redirect return).
- **`PhoneAuthScreen`**: `{ onSignIn?: (user: User) => void, children?: ReactNode }` — SMS phone number verification with country code selector and built-in reCAPTCHA container.
- **`OAuthScreen`**: `{ onSignIn?: (user: User) => void, showLegacySignInRecovery?: boolean, children?: ReactNode }` — OAuth-only card container (pass `<GoogleSignInButton />`, etc. as `children`).

---

## 4. OAuth Sign-In Buttons

Prebuilt OAuth buttons automatically invoke `signInWithProvider(ui, provider)` from `@firebase-oss/ui-core` (which respects `providerPopupStrategy` / `providerRedirectStrategy` and `autoUpgradeAnonymousUsers`).

Available branded button components:
- `GoogleSignInButton` (`new GoogleAuthProvider()` by default)
- `GitHubSignInButton` (`new GithubAuthProvider()` by default)
- `AppleSignInButton` (`new OAuthProvider('apple.com')` by default)
- `MicrosoftSignInButton` (`new OAuthProvider('microsoft.com')` by default)
- `FacebookSignInButton` (`new FacebookAuthProvider()` by default)
- `TwitterSignInButton` (`new TwitterAuthProvider()` by default)
- `YahooSignInButton` (`new OAuthProvider('yahoo.com')` by default)
- `OAuthButton` (generic button for any custom `AuthProvider`)

| Prop | Type | Description |
| --- | --- | --- |
| `provider` | `AuthProvider` | Optional for branded buttons (uses default provider instance if omitted); **required** for `OAuthButton`. |
| `themed` | `boolean \| string` | Optional brand theming (`true` uses provider brand colors; omit or `false` for neutral theme). |
| `onSignIn` | `(credential: UserCredential) => void` | Optional callback fired with the `UserCredential` upon sign-in. |

---

## 5. Headless `*AuthForm` Components

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

## 6. Hooks & UI Utilities

- **`useUI(): FirebaseUI`** — Returns the current `FirebaseUI` state object (`{ app, auth, state, multiFactorResolver, redirectError, locale, behaviors }`).
- **`useOnUserAuthenticated(callback: (user: User) => void)`** — Runs `callback` when a non-anonymous user authenticates (`!user.isAnonymous`).
- **`useRedirectError(): string | undefined`** — Returns a formatted error message if a redirect sign-in failed.
- **`useRecaptchaVerifier(containerRef: RefObject<HTMLDivElement | null>)`** — Renders and manages a Firebase `RecaptchaVerifier` instance.
- **`<RedirectError />`**, **`<Policies />`**, **`<Divider />`**, **`<CountrySelector />`** — Standalone UI primitives used inside screens and custom layouts.
