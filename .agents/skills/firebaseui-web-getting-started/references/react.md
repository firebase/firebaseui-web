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

**Important CSS Reset Note for Non-Tailwind Projects:** `@firebase-oss/ui-styles/dist.min.css` does not bundle Tailwind's Preflight reset. Without a CSS reset, browser-default user-agent styles on `<fieldset>` and `<button>` add native grooved borders and padding inside `.fui-form`, and links such as "Forgot password?" (`.fui-form__action`) render as gray native buttons. In apps without Tailwind CSS, include this minimal reset in your global CSS (e.g., `src/index.css`):

```css
*, *::before, *::after {
  box-sizing: border-box;
}
.fui-screen fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}
.fui-form__action {
  background: transparent;
  border: 0;
  padding-block: 0;
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
