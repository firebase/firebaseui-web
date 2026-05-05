# Customization, Troubleshooting, And Migration Reference

## Table Of Contents

- Behaviors
- Policies
- Theming and CSS variables
- Translations
- Emulators
- Troubleshooting
- Migration from FirebaseUI v6

## Behaviors

Behaviors configure cross-cutting auth logic in `initializeUI`.

Common behaviors:

```ts
import {
  autoAnonymousLogin,
  autoUpgradeAnonymousUsers,
  countryCodes,
  oneTapSignIn,
  providerPopupStrategy,
  providerRedirectStrategy,
  recaptchaVerification,
  requireDisplayName,
} from "@firebase-oss/ui-core";

const ui = initializeUI({
  app,
  behaviors: [
    providerPopupStrategy(),
    recaptchaVerification({ size: "invisible", theme: "light" }),
    countryCodes({ allowedCountries: ["US", "GB"], defaultCountry: "US" }),
    requireDisplayName(),
  ],
});
```

Behavior notes:

- `autoAnonymousLogin()` signs users in anonymously after initialization and sets UI state to loading while it runs.
- `autoUpgradeAnonymousUsers({ onUpgrade })` links/upgrades anonymous sessions during credential/provider sign-in.
- `recaptchaVerification()` controls reCAPTCHA rendering for phone auth.
- `providerPopupStrategy()` and `providerRedirectStrategy()` choose OAuth popup or redirect behavior.
- `oneTapSignIn({ clientId, ... })` enables Google One Tap; the client ID comes from Firebase Console's Google provider Web SDK configuration.
- `requireDisplayName()` adds/validates display name in sign-up/enrollment flows.
- `countryCodes()` controls phone country picker defaults and allowed countries.

## Policies

React:

```tsx
<FirebaseUIProvider
  ui={ui}
  policies={{
    termsOfServiceUrl: "/terms",
    privacyPolicyUrl: "/privacy",
    onNavigate: (url) => router.push(String(url)),
  }}
>
  <App />
</FirebaseUIProvider>
```

Angular:

```ts
provideFirebaseUIPolicies(() => ({
  termsOfServiceUrl: "/terms",
  privacyPolicyUrl: "/privacy",
}));
```

Policies render automatically in forms/screens that include them.

## Theming And CSS Variables

Consumers can override FirebaseUI CSS variables:

```css
:root {
  --fui-primary: #1a73e8;
  --fui-primary-hover: #1558b0;
  --fui-primary-surface: #ffffff;
  --fui-text: #111827;
  --fui-text-muted: #6b7280;
  --fui-background: #ffffff;
  --fui-border: #d1d5db;
  --fui-input: #ffffff;
  --fui-error: #dc2626;
  --fui-radius: 0.375rem;
  --fui-radius-card: 0.5rem;
}
```

Import one base style path:

```css
@import "@firebase-oss/ui-styles/dist.min.css";
```

or for Tailwind:

```css
@import "tailwindcss";
@import "@firebase-oss/ui-styles/tailwind";
```

Provider buttons use `fui-provider__button` and `data-provider` attributes, useful for custom provider theming.

## Translations

Register a locale:

```ts
import { registerLocale } from "@firebase-oss/ui-translations";

export const frFr = registerLocale("fr-FR", {
  labels: {
    signIn: "Se connecter",
  },
});
```

Initialize with a locale:

```ts
const ui = initializeUI({ app, locale: frFr });
```

Switch dynamically:

```tsx
const ui = useUI();
ui.setLocale(frFr);
```

Missing strings fall back to English by default. For a complete key map, inspect `packages/translations/src/types.ts` and `packages/translations/src/locales/en-us.ts`.

## Emulators

React/Next:

```ts
import { connectAuthEmulator, getAuth } from "firebase/auth";

export const auth = getAuth(firebaseApp);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099");
}
```

Next.js:

```ts
if (process.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
}
```

Angular:

```ts
provideAuth(() => {
  const auth = getAuth();
  if (isDevMode()) {
    connectAuthEmulator(auth, "http://localhost:9099");
  }
  return auth;
});
```

Call emulator setup soon after `getAuth` and before auth operations.

## Troubleshooting

- Hydration or `window is not defined`: move FirebaseUI initialization/rendering into a client-only module/component. Add `"use client"` in Next App Router files that import FirebaseUI React components.
- Duplicate Firebase app: use `getApps()` guard.
- OAuth popup blocked: use redirect strategy or trigger sign-in from direct user interaction.
- OAuth redirect returns no result: confirm authorized domains, provider enabled state, redirect URI, and that the same `authDomain` is used.
- Phone auth fails: verify Phone provider is enabled, authorized domains are configured, reCAPTCHA is rendered, and emulator/production environments are not mixed.
- Email link fails: verify action code settings, authorized domains, same email address, and the full current URL passed to completion.
- Styles missing: import `@firebase-oss/ui-styles/dist.min.css` or `@firebase-oss/ui-styles/tailwind` once at the app root.
- shadcn component missing dependencies: rerun `npx shadcn@latest add @firebase/<component>` and inspect the generated component imports.
- MFA screen not appearing: ensure the original sign-in error is passed through FirebaseUI error handling and that `ui.multiFactorResolver` is set; prebuilt sign-in screens handle this path.
- Display name not required: add `requireDisplayName()` behavior during `initializeUI`.

## Migration From FirebaseUI v6

v7 is a complete rewrite; do not suggest a drop-in upgrade from `firebaseui`.

Migration approach:

1. Remove `firebaseui`.
2. Install the relevant `@firebase-oss/ui-*` packages and `firebase`.
3. Replace `new firebaseui.auth.AuthUI(firebase.auth())` and `ui.start(...)` with `initializeUI(...)` and framework provider setup.
4. Replace `uiConfig.signInOptions` with rendered OAuth buttons and explicit screen components.
5. Replace `callbacks` with component props/events such as `onSignIn`, `onSignUp`, and `onForgotPasswordClick`.
6. Replace `signInFlow` with `providerPopupStrategy()` or `providerRedirectStrategy()`.
7. Replace `autoUpgradeAnonymousUsers` config with `autoUpgradeAnonymousUsers({ onUpgrade })`.
8. Replace `credentialHelper`/AccountChooser with `oneTapSignIn({ clientId })`.
9. Replace `tosUrl`/`privacyPolicyUrl` with provider policies.
10. Move `signInSuccessUrl` handling into route navigation in callback handlers.
11. Replace phone country config with `countryCodes({ allowedCountries, defaultCountry })`.

Mapping examples:

```ts
// v6 concept: signInFlow: "redirect"
const ui = initializeUI({
  app,
  behaviors: [providerRedirectStrategy()],
});
```

```tsx
// v6 concept: signInSuccessUrl
<SignInAuthScreen onSignIn={() => router.push("/dashboard")} />
```

```tsx
// v6 concept: signInOptions order
<SignInAuthScreen>
  <GoogleSignInButton />
  <AppleSignInButton />
</SignInAuthScreen>
```
