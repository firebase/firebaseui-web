# Auth Flows Reference

## Table Of Contents

- Shared screen/component model
- Email/password sign-in
- Sign-up and display names
- Forgot password
- Email link sign-in
- Phone auth
- OAuth providers
- OIDC providers
- OAuth 2.0 only providers and custom tokens
- Anonymous auth and account upgrade
- Multi-factor authentication
- Bring your own UI with core helpers

## Shared Screen/Component Model

React screen exports include:

- `SignInAuthScreen`, `SignUpAuthScreen`, `ForgotPasswordAuthScreen`
- `EmailLinkAuthScreen`, `PhoneAuthScreen`, `OAuthScreen`
- `MultiFactorAuthAssertionScreen`, `MultiFactorAuthEnrollmentScreen`
- OAuth buttons: `GoogleSignInButton`, `FacebookSignInButton`, `AppleSignInButton`, `GitHubSignInButton`, `MicrosoftSignInButton`, `TwitterSignInButton`, `YahooSignInButton`, plus generic `OAuthButton`

Angular has matching standalone components with `Component` suffix and `fui-*` selectors.

Screen components accept children for composable OAuth buttons. The order of rendered buttons is the visual/provider order.

## Email/Password Sign-In

Firebase Console: enable Email/Password provider.

React:

```tsx
import { SignInAuthScreen } from "@firebase-oss/ui-react";

export function SignInPage() {
  return (
    <SignInAuthScreen
      onSignIn={() => router.push("/dashboard")}
      onForgotPasswordClick={() => router.push("/forgot-password")}
      onSignUpClick={() => router.push("/register")}
    />
  );
}
```

Angular:

```html
<fui-sign-in-auth-screen
  (signIn)="onSignIn($event)"
  (forgotPassword)="goForgotPassword()"
  (signUp)="goRegister()"
/>
```

For custom UI, use `createSignInAuthFormSchema(ui)` and `signInWithEmailAndPassword(ui, email, password)`.

## Sign-Up And Display Names

Firebase Console: enable Email/Password provider.

React:

```tsx
import { SignUpAuthScreen } from "@firebase-oss/ui-react";

export function RegisterPage() {
  return (
    <SignUpAuthScreen
      onSignUp={() => router.push("/dashboard")}
      onSignInClick={() => router.push("/sign-in")}
    />
  );
}
```

Add display-name requirement with the core behavior:

```ts
import { initializeUI, requireDisplayName } from "@firebase-oss/ui-core";

export const ui = initializeUI({
  app,
  behaviors: [requireDisplayName()],
});
```

For custom UI, call `createUserWithEmailAndPassword(ui, email, password, displayName?)`. If `requireDisplayName()` is enabled, missing display name throws.

## Forgot Password

Firebase Console: configure email templates and authorized domains.

React:

```tsx
import { ForgotPasswordAuthScreen } from "@firebase-oss/ui-react";

export function ForgotPasswordPage() {
  return <ForgotPasswordAuthScreen onPasswordSent={() => router.push("/sign-in")} />;
}
```

Angular:

```html
<fui-forgot-password-auth-screen
  (passwordSent)="goSignIn()"
  (backToSignIn)="goSignIn()"
/>
```

Custom UI: use `createForgotPasswordAuthFormSchema(ui)` and `sendPasswordResetEmail(ui, email)`.

## Email Link Sign-In

Firebase Console: enable Email link sign-in, configure authorized domains and action URL settings.

React:

```tsx
import { EmailLinkAuthScreen } from "@firebase-oss/ui-react";

export function EmailLinkPage() {
  return (
    <EmailLinkAuthScreen
      onEmailSent={() => setMessage("Check your inbox")}
      onSignIn={() => router.push("/dashboard")}
    />
  );
}
```

Custom UI:

- Send link with `sendSignInLinkToEmail(ui, email)`.
- Complete with `signInWithEmailLink(ui, email, window.location.href)` or `completeEmailLinkSignIn(ui, currentUrl)` depending on the flow.

## Phone Auth

Firebase Console: enable Phone provider and configure reCAPTCHA/authorized domains.

Configure country behavior if needed:

```ts
import { countryCodes, recaptchaVerification } from "@firebase-oss/ui-core";

export const ui = initializeUI({
  app,
  behaviors: [
    recaptchaVerification({ size: "invisible", theme: "light" }),
    countryCodes({ allowedCountries: ["US", "CA", "GB"], defaultCountry: "GB" }),
  ],
});
```

React:

```tsx
import { PhoneAuthScreen } from "@firebase-oss/ui-react";

export function PhonePage() {
  return <PhoneAuthScreen onSignIn={() => router.push("/dashboard")} />;
}
```

Phone forms require a rendered reCAPTCHA verifier internally. For custom UI, use the React `useRecaptchaVerifier` hook or Angular `injectRecaptchaVerifier`, then core helpers `verifyPhoneNumber(ui, phoneNumber, verifier)` and `confirmPhoneNumber(ui, verificationId, verificationCode)`.

## OAuth Providers

Firebase Console: enable every provider rendered, configure provider-specific client IDs/secrets, and add authorized domains.

Choose provider strategy through behaviors:

```ts
import { providerPopupStrategy, providerRedirectStrategy } from "@firebase-oss/ui-core";

const popupUi = initializeUI({ app, behaviors: [providerPopupStrategy()] });
const redirectUi = initializeUI({ app, behaviors: [providerRedirectStrategy()] });
```

React with mixed email/password and OAuth:

```tsx
import {
  AppleSignInButton,
  GoogleSignInButton,
  SignInAuthScreen,
} from "@firebase-oss/ui-react";

export function SignInPage() {
  return (
    <SignInAuthScreen onSignIn={() => router.push("/dashboard")}>
      <GoogleSignInButton />
      <AppleSignInButton />
    </SignInAuthScreen>
  );
}
```

OAuth-only:

```tsx
import { GoogleSignInButton, OAuthScreen } from "@firebase-oss/ui-react";

export function OAuthPage() {
  return (
    <OAuthScreen onSignIn={() => router.push("/dashboard")}>
      <GoogleSignInButton />
    </OAuthScreen>
  );
}
```

Angular OAuth screen currently emits `(onSignIn)`, while sign-in and sign-up screens emit `(signIn)`/`(signUp)`. Confirm against `packages/angular/src/lib/auth/screens/*.ts` if writing Angular examples.

Custom provider button:

```tsx
import { OAuthButton } from "@firebase-oss/ui-react";
import { OAuthProvider } from "firebase/auth";

export function LineButton() {
  return (
    <OAuthButton provider={new OAuthProvider("oidc.line")}>
      <span>Sign in with LINE</span>
    </OAuthButton>
  );
}
```

Custom UI: call `signInWithProvider(ui, provider)` where `provider` is a Firebase `AuthProvider`.

## OIDC Providers

Firebase Console/Identity Platform:

- Enable Identity Platform.
- Add a new OIDC provider.
- Use provider IDs as `oidc.<name>`, for example `oidc.line`.
- Configure the third-party callback URL as `https://<project>.firebaseapp.com/__/auth/handler`.

Use `OAuthProvider("oidc.providerId")` with `OAuthButton` or core `signInWithProvider`.

## OAuth 2.0 Only Providers And Custom Tokens

Firebase Auth cannot directly configure generic OAuth 2.0 providers that are not OIDC/SAML. Use a backend:

1. Client starts authorization-code flow and stores a CSRF `state`.
2. Provider redirects back to the client callback with `code` and `state`.
3. Client validates `state` and sends `code` plus redirect URI to backend.
4. Backend exchanges the code with the provider using the client secret.
5. Backend fetches a stable provider user ID.
6. Backend mints a Firebase custom token with Admin SDK.
7. Client signs in with `signInWithCustomToken(auth, customToken)` from `firebase/auth`, or the core helper if using headless logic.

Use `examples/custom-auth-server` and `CUSTOM_AUTHENTICATION.md` as source anchors.

## Anonymous Auth And Account Upgrade

Firebase Console: enable Anonymous provider.

Automatically create anonymous sessions:

```ts
import { autoAnonymousLogin } from "@firebase-oss/ui-core";

const ui = initializeUI({
  app,
  behaviors: [autoAnonymousLogin()],
});
```

Upgrade anonymous users on successful credential/provider sign-in:

```ts
import { autoAnonymousLogin, autoUpgradeAnonymousUsers } from "@firebase-oss/ui-core";

const ui = initializeUI({
  app,
  behaviors: [
    autoAnonymousLogin(),
    autoUpgradeAnonymousUsers({
      async onUpgrade(ui, oldUserId, credential) {
        await mergeGuestData(oldUserId, credential.user.uid);
      },
    }),
  ],
});
```

Use `onUpgrade` for application data migration, cart merge, or profile merge.

## Multi-Factor Authentication

Firebase Console: enable MFA and the factors the app should support.

Assertion after sign-in is integrated into sign-in screens: if `ui.multiFactorResolver` exists, `SignInAuthScreen` renders `MultiFactorAuthAssertionScreen`.

Enrollment screen:

```tsx
import { MultiFactorAuthEnrollmentScreen } from "@firebase-oss/ui-react";
import { FactorId } from "firebase/auth";

export function MfaEnrollmentPage() {
  return (
    <MultiFactorAuthEnrollmentScreen
      hints={[FactorId.TOTP, FactorId.PHONE]}
      onEnrollment={() => router.push("/account/security")}
    />
  );
}
```

Core helpers include `generateTotpSecret`, `generateTotpQrCode`, `signInWithMultiFactorAssertion`, and `enrollWithMultiFactorAssertion`.

## Bring Your Own UI With Core Helpers

Core auth helpers exported from `@firebase-oss/ui-core` include:

- `signInWithEmailAndPassword`
- `createUserWithEmailAndPassword`
- `sendPasswordResetEmail`
- `sendSignInLinkToEmail`
- `signInWithEmailLink`
- `completeEmailLinkSignIn`
- `verifyPhoneNumber`
- `confirmPhoneNumber`
- `signInWithCredential`
- `signInWithCustomToken`
- `signInAnonymously`
- `signInWithProvider`

Core schemas include form builders such as `createSignInAuthFormSchema`, `createSignUpAuthFormSchema`, `createPhoneAuthNumberFormSchema`, and MFA schema builders. Use them to preserve FirebaseUI validation and localized error behavior.
