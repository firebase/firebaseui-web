# Easily add sign-in to your Web app with Firebase UI for Web

Firebase UI for Web is a set of libraries built on the [Firebase Authentication](https://firebase.google.com/docs/auth) JavaScript SDK. It provides composable screens and buttons for email/password, email link, phone, OAuth, multi-factor authentication, and more—so you can ship auth flows quickly and still customize behavior and styling.

**Compared to the previous `firebaseui` package (v6):** v7 is a full rewrite with a modular architecture: a framework-agnostic core (`@firebase-oss/ui-core`), framework packages (React, Angular, Shadcn registry), and separate style and translation packages. It is designed to work with the **modern modular Firebase JS SDK** (`import { initializeApp } from 'firebase/app'`, etc.), not the legacy namespaced compat-only pattern required by old FirebaseUI. If you are migrating from v6, see [MIGRATION.md](MIGRATION.md).

This guide follows the same overall flow as the [classic FirebaseUI Web documentation](https://firebase.google.com/docs/auth/web/firebaseui), updated for v7.

## Table of contents

- [Before you begin](#before-you-begin)
- [CDN / no bundler](#cdn--no-bundler)
- [Install packages](#install-packages)
- [Initialize Firebase UI](#initialize-firebase-ui)
- [Include styles](#include-styles)
- [Set up sign-in methods](#set-up-sign-in-methods)
- [Sign in](#sign-in)
- [OAuth: popup vs redirect](#oauth-popup-vs-redirect)
- [Phone number](#phone-number)
- [Google One Tap](#google-one-tap)
- [Terms of service and privacy policy](#terms-of-service-and-privacy-policy)
- [Upgrading anonymous users](#upgrading-anonymous-users)
- [Translations](#translations)
- [Next steps](#next-steps)

## Before you begin

1. Add Firebase to your web app and enable **Authentication** in the [Firebase console](https://console.firebase.google.com/).
2. Use the **modular** Firebase JS SDK (v9+), for example:

   ```ts
   import { initializeApp } from 'firebase/app';

   const app = initializeApp({
     /* your Firebase config */
   });
   ```

3. Install the `firebase` package if you have not already:

   ```bash
   npm install firebase
   ```

4. Choose your integration: **React**, **Next.js**, **Shadcn** (React components from the registry), or **Angular** (with AngularFire).

## CDN / no bundler

The legacy `firebaseui` v6 workflow often used **CDN script tags** for `firebase-ui-auth.js` and CSS. **Firebase UI for Web v7 does not ship a single drop-in script** for the UI library: the packages (`@firebase-oss/ui-react`, `@firebase-oss/ui-core`, etc.) are published on npm and are intended for use with a **bundler** (Vite, webpack, Next.js, Angular CLI, etc.) or another modern JavaScript toolchain.

- **Styles only via CDN:** You can still load the compiled stylesheet from a CDN for apps that bundle your own JS but want CSS without importing from `node_modules`. See [README.md#styling](README.md#styling) (and the “Via CDN” example there).
- **No bundler at all:** If you cannot use a bundler, you would need to assemble compatible ESM builds and dependencies yourself (not officially supported as a first-class path). For most teams, **use npm + a bundler** and follow one of the framework sections below.

## Install packages

### React

```bash
npm install @firebase-oss/ui-react@beta
```

The React package pulls in `@firebase-oss/ui-core` as a dependency. You will also use `@firebase-oss/ui-styles` for CSS (see [Include styles](#include-styles)).

### Next.js

Use the **same npm packages as React** (`@firebase-oss/ui-react@beta`). The [Next.js App Router](https://nextjs.org/docs/app) example in this repo keeps Firebase UI on the **client**: initialize Firebase and `initializeUI` in a **`"use client"`** module (for example `lib/firebase/clientApp.ts`), wrap the tree in **`FirebaseUIProvider`** from another client component (for example `lib/firebase/ui.tsx`), and import that wrapper from `app/layout.tsx`. See [examples/nextjs](examples/nextjs).

### Shadcn

Shadcn uses the **same React runtime** (`@firebase-oss/ui-react`) as plain React. Install [Shadcn](https://ui.shadcn.com/docs/installation) first, then register the Firebase UI registry and add the components you need:

```json
{
  "registries": {
    "@firebase": "https://firebaseopensource.com/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @firebase/sign-in-auth-screen
```

After that, **initialize Firebase UI and wrap your app exactly as in the React section**—the only difference is you import generated components from your project (for example `@/components/sign-in-auth-screen`) instead of from `@firebase-oss/ui-react`.

### Angular

Install AngularFire and the Angular package (see also [packages/angular/README.md](packages/angular/README.md)):

```bash
npm install @angular/fire @firebase-oss/ui-angular@beta
```

## Initialize Firebase UI

Create a Firebase UI instance with `initializeUI` from `@firebase-oss/ui-core`, then expose it to your UI layer.

### React

```ts
import { initializeApp } from 'firebase/app';
import { initializeUI } from '@firebase-oss/ui-core';

const app = initializeApp({
  /* your config */
});

export const ui = initializeUI({
  app,
  // behaviors: [...]  // optional; see sections below
});
```

Wrap your application with `FirebaseUIProvider`:

```tsx
import { FirebaseUIProvider } from '@firebase-oss/ui-react';

function Root() {
  return (
    <FirebaseUIProvider ui={ui}>
      {/* your routes / screens */}
    </FirebaseUIProvider>
  );
}
```

### Shadcn

Use the **same** `initializeUI` and `FirebaseUIProvider` snippets as **React**. Import screens from the paths Shadcn generated, for example:

```tsx
import { SignInAuthScreen } from '@/components/sign-in-auth-screen';

export function MySignInPage() {
  return <SignInAuthScreen onSignIn={() => { /* ... */ }} />;
}
```

### Angular

Provide the Firebase app and Firebase UI alongside AngularFire:

```ts
import { type ApplicationConfig } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirebaseUI } from '@firebase-oss/ui-angular';
import { initializeUI } from '@firebase-oss/ui-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp({ /* your config */ })),
    provideFirebaseUI((apps) => initializeUI({ app: apps[0] })),
  ],
};
```

### Next.js (App Router)

Create a **client** module that exports your `ui` instance (same `initializeUI` pattern as React). The App Router runs server components by default, so mark client-only files with `"use client"`:

```ts
// lib/firebase/clientApp.ts
'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeUI } from '@firebase-oss/ui-core';

const app = getApps().length === 0 ? initializeApp({ /* your config */ }) : getApps()[0];

export const auth = getAuth(app);

export const ui = initializeUI({ app });
```

Wrap your app with `FirebaseUIProvider` in a small client component and use it from `app/layout.tsx`:

```tsx
// lib/firebase/ui.tsx
'use client';

import { ui } from '@/lib/firebase/clientApp';
import { FirebaseUIProvider } from '@firebase-oss/ui-react';

export function FirebaseUIProviderHoc({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseUIProvider
      ui={ui}
      policies={{
        termsOfServiceUrl: 'https://example.com/terms',
        privacyPolicyUrl: 'https://example.com/privacy',
      }}
    >
      {children}
    </FirebaseUIProvider>
  );
}
```

```tsx
// app/layout.tsx (server layout imports the client wrapper)
import { FirebaseUIProviderHoc } from '@/lib/firebase/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FirebaseUIProviderHoc>{children}</FirebaseUIProviderHoc>
      </body>
    </html>
  );
}
```

Import Firebase UI styles from `app/globals.css` the same way as in [Include styles](#include-styles). Full reference: [examples/nextjs](examples/nextjs).

## Include styles

> **Shadcn:** You normally **do not** import Firebase UI’s bundled CSS; styling comes from your Shadcn theme and generated components.

For React, Next.js, and Angular default UI, import styles from `@firebase-oss/ui-styles` (for example in `globals.css` for Next.js):

```css
@import '@firebase-oss/ui-styles/dist.min.css';
```

Or with Tailwind:

```css
@import 'tailwindcss';
@import '@firebase-oss/ui-styles/tailwind';
```

See [README.md#styling](README.md#styling) for CDN import, theming via CSS variables, and details.

## Set up sign-in methods

In the Firebase console, open **Authentication** → **Sign-in method** and enable each provider you need (Email/Password, Email link, Google, GitHub, Phone, etc.). Add your app’s domain to **Authorized domains** where required (OAuth and phone flows).

In v7 you **do not** pass a single `signInOptions` array. Instead you:

- Render the **screens and buttons** that match your product (for example `SignInAuthScreen`, `OAuthScreen`, or individual `GoogleSignInButton` components).
- Optionally tune flows with **behaviors** on `initializeUI` (see the following sections).

### Email address and password

1. Enable **Email/Password** in the console.
2. Use a screen such as `SignInAuthScreen` / `SignUpAuthScreen` (React) or `<fui-sign-in-auth-screen>` / `<fui-sign-up-auth-screen>` (Angular).

Optional: require a display name on sign-up via the `requireDisplayName` behavior:

```ts
import { requireDisplayName } from '@firebase-oss/ui-core';

const ui = initializeUI({
  app,
  behaviors: [requireDisplayName()],
});
```

### Email link authentication

1. Enable **Email/Password** and **Email link (passwordless)** in the console.
2. Use the email-link auth screen or forms from the library; complete the flow using the core helpers (for example `completeEmailLinkSignIn`) as documented in [README.md#reference](README.md#reference).

### OAuth providers (Google, Facebook, GitHub, Apple, Microsoft, Yahoo, X/Twitter, …)

1. Enable each provider in the console and configure OAuth client IDs/secrets as required.
2. Add OAuth buttons inside an OAuth screen or your own layout. Example (React):

   ```tsx
   import { OAuthScreen, GoogleSignInButton, GitHubSignInButton } from '@firebase-oss/ui-react';

   export function OAuthExample() {
     return (
       <OAuthScreen>
         <GoogleSignInButton />
         <GitHubSignInButton />
       </OAuthScreen>
     );
   }
   ```

   Angular uses the `fui-*` components, for example `<fui-oauth-screen>` with `<fui-google-sign-in-button>` inside.

3. **Custom scopes or provider options:** pass a configured provider to a button when needed—for example a `GoogleAuthProvider` with `addScope(...)`—via the optional `provider` prop on `GoogleSignInButton` (React) or the analogous input on the Angular component.

### Phone number

1. Enable **Phone** in the console and add your domain to authorized domains.
2. Use the phone auth screen/form components.
3. Optional: restrict countries and set a default with the `countryCodes` behavior; customize reCAPTCHA with `recaptchaVerification`. See [README.md#behaviors](README.md#behaviors).

## Sign in

Render the screen you want on a route or container. Handle success in component props (React) or outputs (Angular)—this replaces v6’s `callbacks.signInSuccessWithAuthResult` and related hooks.

### React

```tsx
import { SignInAuthScreen } from '@firebase-oss/ui-react';
import { useNavigate } from 'react-router';

export function SignInPage() {
  const navigate = useNavigate();

  return (
    <SignInAuthScreen
      onSignIn={() => {
        navigate('/dashboard');
      }}
    />
  );
}
```

### Shadcn

Same as React, but import from your Shadcn path:

```tsx
import { SignInAuthScreen } from '@/components/sign-in-auth-screen';
```

### Next.js

Use **client components** for screens that depend on Firebase UI (`"use client"`). Navigate with the App Router:

```tsx
'use client';

import { SignInAuthScreen } from '@firebase-oss/ui-react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  return (
    <SignInAuthScreen
      onSignIn={() => {
        router.push('/dashboard');
      }}
    />
  );
}
```

### Angular

```ts
import { Component } from '@angular/core';
import { SignInAuthScreenComponent } from '@firebase-oss/ui-angular';
import { Router } from '@angular/router';
import type { User } from '@angular/fire/auth';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [SignInAuthScreenComponent],
  template: `
    <fui-sign-in-auth-screen (signIn)="onSignIn($event)" />
  `,
})
export class SignInPage {
  constructor(private router: Router) {}

  onSignIn(user: User) {
    this.router.navigate(['/dashboard']);
  }
}
```

If you relied on v6’s `signInSuccessUrl` or query parameters, perform redirects yourself in these handlers (see [MIGRATION.md](MIGRATION.md)).

## OAuth: popup vs redirect

v6 used `signInFlow: 'popup' | 'redirect'`. In v7, use **behaviors**:

- **Popup (default):** `providerPopupStrategy()` or omit an explicit strategy.
- **Redirect:** `providerRedirectStrategy()`.

```ts
import { providerRedirectStrategy } from '@firebase-oss/ui-core';

const ui = initializeUI({
  app,
  behaviors: [providerRedirectStrategy()],
});
```

## Phone number

Configure default country and allowed regions with `countryCodes`; tune reCAPTCHA with `recaptchaVerification`. Example:

```ts
import { countryCodes, recaptchaVerification } from '@firebase-oss/ui-core';

const ui = initializeUI({
  app,
  behaviors: [
    countryCodes({
      allowedCountries: ['GB', 'US', 'FR'],
      defaultCountry: 'GB',
    }),
    recaptchaVerification({
      size: 'compact',
      theme: 'light',
    }),
  ],
});
```

## Google One Tap

The old **Account Chooser / credential helper** style integration maps conceptually to **Google One Tap** in v7 via the `oneTapSignIn` behavior (requires Google sign-in enabled and a web client ID from the console). See [README.md#behaviors](README.md#behaviors) and [MIGRATION.md](MIGRATION.md).

## Terms of service and privacy policy

v6 used `tosUrl` and `privacyPolicyUrl` on the widget config. In v7:

- **React / Next.js / Shadcn:** pass `policies` to `FirebaseUIProvider` (in Next.js, keep the provider in a client component as in [Next.js (App Router)](#nextjs-app-router)):

  ```tsx
  <FirebaseUIProvider
    ui={ui}
    policies={{
      termsOfServiceUrl: 'https://example.com/terms',
      privacyPolicyUrl: 'https://example.com/privacy',
    }}
  >
    {children}
  </FirebaseUIProvider>
  ```

- **Angular:** use `provideFirebaseUIPolicies`:

  ```ts
  import { provideFirebaseUIPolicies } from '@firebase-oss/ui-angular';

  // In appConfig.providers:
  provideFirebaseUIPolicies(() => ({
    termsOfServiceUrl: 'https://example.com/terms',
    privacyPolicyUrl: 'https://example.com/privacy',
  })),
  ```

## Upgrading anonymous users

Enable anonymous auth in the console if needed. Use the `autoUpgradeAnonymousUsers` behavior and optionally implement `onUpgrade` for data migration (replacing v6’s `autoUpgradeAnonymousUsers` flag and `signInFailure` merge handling). See [README.md#behaviors](README.md#behaviors) and the anonymous upgrade sections in [MIGRATION.md](MIGRATION.md).

```ts
import { autoUpgradeAnonymousUsers } from '@firebase-oss/ui-core';

const ui = initializeUI({
  app,
  behaviors: [
    autoUpgradeAnonymousUsers({
      async onUpgrade(ui, oldUserId, credential) {
        // Migrate data from anonymous user to the signed-in user if needed
      },
    }),
  ],
});
```

## Translations

Register locales with `@firebase-oss/ui-translations` and pass `locale` into `initializeUI`, or call `ui.setLocale(...)` at runtime. See [README.md#translations](README.md#translations).

## Next steps

- Full feature list, behaviors reference, and API tables: [README.md](README.md).
- Migrating from v6: [MIGRATION.md](MIGRATION.md).
- Example apps: [examples/react](examples/react), [examples/nextjs](examples/nextjs), [examples/shadcn](examples/shadcn), [examples/angular](examples/angular).
- Custom OIDC and advanced flows: [CUSTOM_AUTHENTICATION.md](CUSTOM_AUTHENTICATION.md).
