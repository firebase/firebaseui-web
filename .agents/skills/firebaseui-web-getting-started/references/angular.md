# FirebaseUI Web: Angular Reference (`@firebase-oss/ui-angular`)

Standalone components for Angular 19+ (written against `@firebase-oss/ui-angular@7.1.0`, `@angular/fire@20`). Read this file first. Email link, anonymous upgrade, MFA, the Auth emulator and headless forms are in [`angular-recipes.md`](angular-recipes.md). Core actions are in [`core.md`](core.md).

Every selector, input and output below was checked against the package's type declarations, so do not search `node_modules` for them.

## 0. Files to read first (one parallel batch)

`package.json`, `angular.json`, `src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`, plus `src/app/app.ts` (or `app.component.ts`) and the existing page components under `src/app/`, together with `angular-recipes.md` and `core.md`. List files with a glob scoped to `src` (`targetDirectory: "src"`), never the project root.

## 1. Install and styles

```bash
npm install firebase @angular/fire @firebase-oss/ui-core @firebase-oss/ui-angular @firebase-oss/ui-styles
```

`@angular/fire@20` needs Angular 20. Do not upgrade Angular to satisfy a peer warning.

Add the stylesheet to `styles` in the `build` options of `angular.json`, using the bare package path. A `node_modules/...` path fails to resolve.

```json
"styles": ["src/styles.css", "@firebase-oss/ui-styles/dist.min.css"]
```

Add this reset to `src/styles.css`. `dist.min.css` has no Tailwind Preflight, so without it `<fieldset>` shows native borders, the screens' padding is off, and "Forgot password?" / "Sign up" render as gray native buttons:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
.fui-screen fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}
button[fui-form-action] {
  background: transparent;
  border: 0;
  padding-block: 0;
}
```

Do **not** use React's `.fui-form__action { background: transparent }` rule here. In Angular the submit button (`fui-form-submit`) also carries `fui-form__action`, so that rule makes "Sign In" / "Create Account" invisible. `button[fui-form-action]` only matches the link-style actions.

Tailwind v4: `@import "@firebase-oss/ui-styles/tailwind";` in `src/styles.css` instead, no reset.

## 2. `app.config.ts` (provider order and what is required)

Copy this, changing the Firebase config. `provideAuth` is **required**: the screens inject AngularFire's `Auth` for `(signIn)`, and without it the app builds but renders a blank page with `NG0201: No provider for Auth`.

```ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { autoUpgradeAnonymousUsers, initializeUI } from '@firebase-oss/ui-core';
import { provideFirebaseUI, provideFirebaseUIPolicies } from '@firebase-oss/ui-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'demo-api-key',
        authDomain: 'demo-firebase-ui-evals.firebaseapp.com',
        projectId: 'demo-firebase-ui-evals',
        appId: '1:000000000000:web:demo',
      }),
    ),
    provideAuth(() => getAuth()),
    provideFirebaseUI((apps) =>
      initializeUI({ app: apps[0]!, behaviors: [autoUpgradeAnonymousUsers()] }),
    ),
    // Optional: Terms and Privacy links in the forms.
    provideFirebaseUIPolicies(() => ({ termsOfServiceUrl: '/terms', privacyPolicyUrl: '/privacy' })),
  ],
};
```

- Keep the existing providers and add the Firebase ones after them.
- `provideFirebaseUI((apps) => FirebaseUIStore)`: `apps[0]` is the app from `provideFirebaseApp`. `behaviors` is optional (recaptcha is on by default). The Auth emulator goes inside `provideAuth`: see recipes.
- Pass the `FirebaseUI` **value** to `@firebase-oss/ui-core` actions: `injectUI()` returns a `Signal<FirebaseUI>`, so call `signInAnonymously(this.ui())`.

## 3. Routes (`app.routes.ts`)

One standalone component per page. A guard for signed-in pages:

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

const signedIn: CanActivateFn = () => {
  const router = inject(Router);
  return authState(inject(Auth)).pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/sign-in']))),
  );
};

export const routes: Routes = [
  { path: 'sign-in', component: SignInPage },
  { path: 'account', component: AccountPage, canActivate: [signedIn] },
  // ...one entry per page
];
```

Keep the existing `{ path: '', ... }` route. Sign-out and the current user are in the account recipe.

## 4. Screens (selectors, inputs, outputs)

Import the component classes into the page's `imports` array. All screens render a card (`.fui-screen > fui-card`) with the page's heading, so do not wrap them in another card.

| Class | Selector | Inputs | Outputs |
| --- | --- | --- | --- |
| `SignInAuthScreenComponent` | `<fui-sign-in-auth-screen>` | `showLegacySignInRecovery: boolean` | `signIn: User`, `forgotPassword: void`, `signUp: void` |
| `SignUpAuthScreenComponent` | `<fui-sign-up-auth-screen>` | none | `signUp: User`, `signIn: void` |
| `ForgotPasswordAuthScreenComponent` | `<fui-forgot-password-auth-screen>` | none | `passwordSent: void`, `backToSignIn: void` |
| `EmailLinkAuthScreenComponent` | `<fui-email-link-auth-screen>` | none | `emailSent: void`, `signIn: User` |
| `PhoneAuthScreenComponent` | `<fui-phone-auth-screen>` | none | `signIn: User` |
| `OAuthScreenComponent` | `<fui-oauth-screen>` | `showLegacySignInRecovery: boolean` | `onSignIn: User` (not `signIn`) |
| `MultiFactorAuthEnrollmentScreenComponent` | `<fui-multi-factor-auth-enrollment-screen>` | `hints: ('phone' \| 'totp')[]` | `onEnrollment: void` |
| `MultiFactorAuthAssertionScreenComponent` | `<fui-multi-factor-auth-assertion-screen>` | none | `onSuccess: UserCredential` |

`User` and `UserCredential` come from `@angular/fire/auth` (or `firebase/auth`).

Rules that cause silent bugs:

- **A wrong input name fails the build** (`NG8002`), but **a wrong output name compiles and never fires**. Use the exact names above (`onSignIn` on `fui-oauth-screen`, `onEnrollment` and `onSuccess` with the `on` prefix, `signIn` elsewhere).
- "Forgot password?", "Sign up" and "Sign in" links render only when the matching output has a listener: bind `(forgotPassword)` and `(signUp)` on the sign-in screen, `(signIn)` on the sign-up screen, `(backToSignIn)` on the forgot-password screen.
- The `signIn` / `signUp` outputs follow auth state: they fire for non-anonymous users only and emit `User`. They do not fire after `signInAnonymously`; navigate yourself. Use them to navigate.
- The sign-in, sign-up, email-link, phone and OAuth screens switch to `fui-multi-factor-auth-assertion-screen` on their own when an account has a second factor. Do not build an MFA step for sign-in.
- Keep navigation in the page class (`onSignedIn()` below), not inline in templates, so what happens after sign-in changes in one place.

### OAuth buttons are projected content

Put a button between the screen's tags and it renders under the form (with a divider on sign-in and sign-up):

```ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleSignInButtonComponent, SignInAuthScreenComponent } from '@firebase-oss/ui-angular';

@Component({
  selector: 'app-sign-in',
  imports: [SignInAuthScreenComponent, GoogleSignInButtonComponent],
  template: `
    <fui-sign-in-auth-screen
      (signIn)="onSignedIn()"
      (forgotPassword)="goTo('/forgot-password')"
      (signUp)="goTo('/sign-up')"
    >
      <fui-google-sign-in-button />
    </fui-sign-in-auth-screen>
  `,
})
export class SignInPage {
  private readonly router = inject(Router);

  protected onSignedIn() {
    this.router.navigate(['/account']);
  }

  protected goTo(path: string) {
    this.router.navigate([path]);
  }
}
```

A Google-only page uses `<fui-oauth-screen (onSignIn)="...">` with the same projected button.

Buttons emit `(signIn)` with `UserCredential`: `<fui-google-sign-in-button>`, `-github-`, `-apple-`, `-microsoft-`, `-facebook-`, `-twitter-`, `-yahoo-` (`fui-<name>-sign-in-button`, class `<Name>SignInButtonComponent`), with optional inputs `themed: boolean` and `provider` (a custom provider, e.g. for scopes). Generic: `<fui-oauth-button [provider]="provider">`, `provider` required, any `AuthProvider`.

## 5. Layout pieces and helpers

- `<button fui-button [variant]="'primary' | 'secondary'">`, `<fui-card>`, `<fui-card-header>`, `<fui-card-title>`, `<fui-card-subtitle>`, `<fui-card-content>`, `<fui-divider [label]>`, `<fui-policies>`, `<fui-redirect-error>`, `<fui-country-selector [(value)]>` (classes `ButtonComponent`, `CardComponent`, `CardHeaderComponent`, `CardTitleComponent`, `CardSubtitleComponent`, `CardContentComponent`, `DividerComponent`, `PoliciesComponent`, `RedirectErrorComponent`, `CountrySelectorComponent`). Wrap a hand-made card in `<div class="fui-screen">` to match the screens' width and centring.
- `injectUI(): Signal<FirebaseUI>` (field initialiser or constructor only), `injectUserAuthenticated((user: User) => void)` (non-anonymous users only), `injectRedirectError(): Signal<string | undefined>`, `injectPolicies()`, `injectRecaptchaVerifier(() => ElementRef<HTMLDivElement>)`.

## 6. Build

`npm run build` runs strict template checking. A full sign-in is just over 1 MB initial; if the default 1 MB `initial` budget errors, raise `maximumError` in `angular.json` (for example to `2MB`) instead of removing features.
