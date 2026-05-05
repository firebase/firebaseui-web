# Framework Setup Reference

## Table Of Contents

- Package map
- Firebase project prerequisites
- React/Vite setup
- Next.js App Router setup
- Angular setup
- shadcn setup
- Headless/core setup
- Styling setup

## Package Map

- Always require `firebase`.
- React: `@firebase-oss/ui-react` plus CSS from `@firebase-oss/ui-styles`.
- Angular: `@angular/fire`, `@firebase-oss/ui-angular`, `@firebase-oss/ui-core`, and styles.
- shadcn: install components from the Firebase registry; registry components still depend on React/core patterns.
- Headless/custom UI: `@firebase-oss/ui-core`; use core auth functions/schemas and your own components.
- Translations: `@firebase-oss/ui-translations` when registering or switching locales.

When writing install commands, check the current README/package status. The root README uses `@beta` examples, while local package versions are `7.0.0`.

## Firebase Project Prerequisites

Tell consumers to do these in Firebase Console as needed:

- Add a Web app and copy the Firebase config.
- Enable each Auth provider they render in UI.
- Add authorized domains for production and preview domains.
- Configure email action links for email link and password reset flows.
- Enable phone authentication for SMS flows.
- Enable anonymous auth if using `autoAnonymousLogin` or anonymous upgrade.
- Enable multi-factor authentication and allowed factors when using MFA.
- Enable Identity Platform for OIDC/SAML providers.

## React/Vite Setup

Use a single client module for Firebase and FirebaseUI:

```ts
import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { initializeUI, countryCodes } from "@firebase-oss/ui-core";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "...",
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(firebaseApp);

export const ui = initializeUI({
  app: firebaseApp,
  auth,
  behaviors: [
    countryCodes({ allowedCountries: ["US", "GB"], defaultCountry: "US" }),
  ],
});

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099");
}
```

Wrap the app once:

```tsx
import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import { ui } from "./firebase";

export function Root() {
  return (
    <FirebaseUIProvider
      ui={ui}
      policies={{
        termsOfServiceUrl: "/terms",
        privacyPolicyUrl: "/privacy",
      }}
    >
      <App />
    </FirebaseUIProvider>
  );
}
```

Use callback props for navigation:

```tsx
import { GoogleSignInButton, SignInAuthScreen } from "@firebase-oss/ui-react";

export function SignInPage() {
  return (
    <SignInAuthScreen onSignIn={() => navigate("/dashboard")}>
      <GoogleSignInButton />
    </SignInAuthScreen>
  );
}
```

## Next.js App Router Setup

Keep Firebase client code and FirebaseUI provider in client components:

```ts
"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeUI } from "@firebase-oss/ui-core";

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(firebaseApp);
export const ui = initializeUI({ app: firebaseApp, auth });
```

```tsx
"use client";

import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import { ui } from "@/lib/firebase/client";

export function FirebaseUIProviderHoc({ children }: { children: React.ReactNode }) {
  return <FirebaseUIProvider ui={ui}>{children}</FirebaseUIProvider>;
}
```

Screens that import FirebaseUI React components need `"use client"`. Navigate with `useRouter()` or links in callbacks. For SSR, keep server checks separate from FirebaseUI rendering; the repo example uses `initializeServerApp` with an auth ID token header and notes cookie/service-worker auth is not fully solved there.

## Angular Setup

Use AngularFire providers and `provideFirebaseUI`:

```ts
import { ApplicationConfig, isDevMode } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { provideAuth, getAuth, connectAuthEmulator } from "@angular/fire/auth";
import { provideFirebaseUI, provideFirebaseUIPolicies } from "@firebase-oss/ui-angular";
import { initializeUI } from "@firebase-oss/ui-core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      if (isDevMode()) {
        connectAuthEmulator(auth, "http://localhost:9099");
      }
      return auth;
    }),
    provideFirebaseUI((apps) => initializeUI({ app: apps[0] })),
    provideFirebaseUIPolicies(() => ({
      termsOfServiceUrl: "/terms",
      privacyPolicyUrl: "/privacy",
    })),
  ],
};
```

Standalone screen example:

```ts
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import {
  ContentComponent,
  GoogleSignInButtonComponent,
  SignInAuthScreenComponent,
} from "@firebase-oss/ui-angular";

@Component({
  standalone: true,
  imports: [SignInAuthScreenComponent, ContentComponent, GoogleSignInButtonComponent],
  template: `
    <fui-sign-in-auth-screen (signIn)="onSignIn()">
      <fui-content>
        <fui-google-sign-in-button />
      </fui-content>
    </fui-sign-in-auth-screen>
  `,
})
export class SignInRoute {
  private router = inject(Router);
  onSignIn() {
    this.router.navigate(["/dashboard"]);
  }
}
```

## shadcn Setup

Add the Firebase registry namespace to `components.json`:

```json
{
  "registries": {
    "@firebase": "https://firebaseopensource.com/r/{name}.json"
  }
}
```

Install the registry component the user needs:

```bash
npx shadcn@latest add @firebase/sign-in-auth-screen
```

Then initialize FirebaseUI exactly like React and wrap with `FirebaseUIProvider`. Import registry components from the app's component path, for example `@/components/sign-in-auth-screen`.

## Headless/Core Setup

Use `@firebase-oss/ui-core` when the user wants custom UI:

```ts
import {
  createSignInAuthFormSchema,
  initializeUI,
  signInWithEmailAndPassword,
} from "@firebase-oss/ui-core";

const uiStore = initializeUI({ app });
const ui = uiStore.get();
const schema = createSignInAuthFormSchema(ui);

const parsed = schema.parse({ email, password });
await signInWithEmailAndPassword(ui, parsed.email, parsed.password);
```

Prefer core schemas and auth helpers over duplicating validation and Firebase error handling.

## Styling Setup

React/Angular consumers must import styles; shadcn does not use the bundled FirebaseUI CSS in the same way.

CSS import:

```css
@import "@firebase-oss/ui-styles/dist.min.css";
```

Tailwind import:

```css
@import "tailwindcss";
@import "@firebase-oss/ui-styles/tailwind";
```

JS import:

```ts
import "@firebase-oss/ui-styles/dist.min.css";
```

The styles package exports theme files such as `@firebase-oss/ui-styles/themes/brutalist.css`; verify current exports before using dark theme by path.
