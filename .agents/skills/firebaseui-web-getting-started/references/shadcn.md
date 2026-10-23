# FirebaseUI Web — shadcn/ui Reference

Complete reference for using FirebaseUI Web in a React + Tailwind CSS + **shadcn/ui** project (`components.json` present).

## 1. Prerequisites & Dependencies

Ensure `firebase`, `@firebase-oss/ui-core`, `@firebase-oss/ui-react`, and `@firebase-oss/ui-styles` are installed:

```bash
npm install firebase @firebase-oss/ui-core @firebase-oss/ui-react @firebase-oss/ui-styles
```

## 2. Configure the `@firebase` Registry in `components.json`

Add the `@firebase` registry to `components.json`:

```json
{
  "registries": {
    "@firebase": "https://firebaseopensource.com/r/{name}.json"
  }
}
```

## 3. Add Screens via the shadcn CLI

Install the screens you need with `npx shadcn@latest add`:

| Screen | Command |
| --- | --- |
| Sign-In (`SignInAuthScreen`) | `npx shadcn@latest add @firebase/sign-in-auth-screen` |
| Sign-Up (`SignUpAuthScreen`) | `npx shadcn@latest add @firebase/sign-up-auth-screen` |
| Forgot Password (`ForgotPasswordAuthScreen`) | `npx shadcn@latest add @firebase/forgot-password-auth-screen` |
| Email Link (`EmailLinkAuthScreen`) | `npx shadcn@latest add @firebase/email-link-auth-screen` |
| Phone (`PhoneAuthScreen`) | `npx shadcn@latest add @firebase/phone-auth-screen` |
| OAuth (`OAuthScreen`) | `npx shadcn@latest add @firebase/oauth-screen` |
| MFA Assertion (`MultiFactorAuthAssertionScreen`) | `npx shadcn@latest add @firebase/multi-factor-auth-assertion-screen` |
| MFA Enrollment (`MultiFactorAuthEnrollmentScreen`) | `npx shadcn@latest add @firebase/multi-factor-auth-enrollment-screen` |

OAuth button components can also be added from the registry (e.g., `@firebase/google-sign-in-button`, `@firebase/github-sign-in-button`, `@firebase/apple-sign-in-button`, `@firebase/microsoft-sign-in-button`, `@firebase/oauth-button`), or imported directly from `@firebase-oss/ui-react`.

## 4. Provider & Screen Usage

Wrap your app with `FirebaseUIProvider` from `@firebase-oss/ui-react`, then import the generated screen components from your local components directory (e.g., `@/components/sign-in-auth-screen`):

```tsx
import { FirebaseUIProvider } from '@firebase-oss/ui-react';
import { SignInAuthScreen } from '@/components/sign-in-auth-screen';
import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { ui } from './firebase';

export function SignInPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <FirebaseUIProvider
      ui={ui}
      policies={{
        termsOfServiceUrl: '/terms',
        privacyPolicyUrl: '/privacy',
      }}
    >
      <SignInAuthScreen
        onSignIn={() => onNavigate('/')}
        onForgotPasswordClick={() => onNavigate('/forgot-password')}
        onSignUpClick={() => onNavigate('/sign-up')}
      >
        <GoogleSignInButton />
      </SignInAuthScreen>
    </FirebaseUIProvider>
  );
}
```

The shadcn registry components accept the exact same props as their `@firebase-oss/ui-react` counterparts (see [`references/react.md`](react.md) for the full prop tables and [`references/core.md`](core.md) for `initializeUI` behaviors and actions).
