# FirebaseUI Web — Angular Reference (`@firebase-oss/ui-angular`)

Complete reference for `@firebase-oss/ui-angular` (Angular v19+ standalone components).

## 1. Installation & Styles

```bash
npm install firebase @angular/fire @firebase-oss/ui-core @firebase-oss/ui-angular @firebase-oss/ui-styles
```

Add `@firebase-oss/ui-styles/dist.min.css` to `styles` in `angular.json` (or import `@firebase-oss/ui-styles/dist.min.css` / `@import "@firebase-oss/ui-styles/tailwind"` in `src/styles.css`).

## 2. Application Configuration (`app.config.ts`)

Register `provideFirebaseApp`, `provideFirebaseUI`, and optionally `provideFirebaseUIPolicies` in `app.config.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeUI } from '@firebase-oss/ui-core';
import { provideFirebaseUI, provideFirebaseUIPolicies } from '@firebase-oss/ui-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_PROJECT.firebaseapp.com',
        projectId: 'YOUR_PROJECT_ID',
      })
    ),
    provideFirebaseUI((apps) =>
      initializeUI({
        app: apps[0]!,
        behaviors: [
          // e.g. autoAnonymousLogin(), autoUpgradeAnonymousUsers(), requireDisplayName()
        ],
      })
    ),
    provideFirebaseUIPolicies(() => ({
      termsOfServiceUrl: '/terms',
      privacyPolicyUrl: '/privacy',
    })),
  ],
};
```

## 3. Standalone Screen Components

Import the screen and button components directly into your standalone component's `imports` array:

| Component Class | Selector | Inputs | Outputs |
| --- | --- | --- | --- |
| `SignInAuthScreenComponent` | `<fui-sign-in-auth-screen>` | `[showLegacySignInRecovery]="boolean"` | `(signIn)="onSignIn($event)"` (`User`), `(forgotPassword)="..."`, `(signUp)="..."` |
| `SignUpAuthScreenComponent` | `<fui-sign-up-auth-screen>` | — | `(signUp)="onSignUp($event)"` (`User`), `(signIn)="..."` |
| `ForgotPasswordAuthScreenComponent` | `<fui-forgot-password-auth-screen>` | — | `(passwordSent)="..."`, `(backToSignIn)="..."` |
| `EmailLinkAuthScreenComponent` | `<fui-email-link-auth-screen>` | — | `(emailSent)="..."`, `(signIn)="onSignIn($event)"` (`User`) |
| `PhoneAuthScreenComponent` | `<fui-phone-auth-screen>` | — | `(signIn)="onSignIn($event)"` (`User`) |
| `OAuthScreenComponent` | `<fui-oauth-screen>` | `[showLegacySignInRecovery]="boolean"` | `(onSignIn)="onSignIn($event)"` (`User`) |
| `MultiFactorAuthEnrollmentScreenComponent` | `<fui-multi-factor-auth-enrollment-screen>` | `[hints]="[FactorId.TOTP, FactorId.PHONE]"` | `(onEnrollment)="..."` |
| `MultiFactorAuthAssertionScreenComponent` | `<fui-multi-factor-auth-assertion-screen>` | — | `(onSuccess)="onSuccess($event)"` (`UserCredential`) |

### Example Usage with OAuth Content Projection

`<fui-sign-in-auth-screen>`, `<fui-sign-up-auth-screen>`, `<fui-email-link-auth-screen>`, `<fui-phone-auth-screen>`, and `<fui-oauth-screen>` project child OAuth buttons via `<ng-content>` and automatically switch to `<fui-multi-factor-auth-assertion-screen>` when `ui().multiFactorResolver` is present:

```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  SignInAuthScreenComponent,
  GoogleSignInButtonComponent,
} from '@firebase-oss/ui-angular';
import type { User } from 'firebase/auth';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [SignInAuthScreenComponent, GoogleSignInButtonComponent],
  template: `
    <fui-sign-in-auth-screen
      (signIn)="onSignIn($event)"
      (forgotPassword)="router.navigate(['/forgot-password'])"
      (signUp)="router.navigate(['/sign-up'])"
    >
      <fui-google-sign-in-button />
    </fui-sign-in-auth-screen>
  `,
})
export class SignInComponent {
  constructor(public router: Router) {}

  onSignIn(user: User) {
    this.router.navigate(['/']);
  }
}
```

## 4. OAuth Button Components & Headless Forms

- **OAuth Buttons:** `GoogleSignInButtonComponent` (`<fui-google-sign-in-button>`), `GitHubSignInButtonComponent` (`<fui-github-sign-in-button>`), `AppleSignInButtonComponent` (`<fui-apple-sign-in-button>`), `MicrosoftSignInButtonComponent` (`<fui-microsoft-sign-in-button>`), `FacebookSignInButtonComponent` (`<fui-facebook-sign-in-button>`), `TwitterSignInButtonComponent` (`<fui-twitter-sign-in-button>`), `YahooSignInButtonComponent` (`<fui-yahoo-sign-in-button>`), `OAuthButtonComponent` (`<fui-oauth-button [provider]="provider">`). All accept `[themed]="boolean"` and emit `(signIn)="onCredential($event)"`.
- **Headless Forms:** `SignInAuthFormComponent` (`<fui-sign-in-auth-form>`), `SignUpAuthFormComponent` (`<fui-sign-up-auth-form>`), `ForgotPasswordAuthFormComponent` (`<fui-forgot-password-auth-form>`), `EmailLinkAuthFormComponent` (`<fui-email-link-auth-form>`), `PhoneAuthFormComponent` (`<fui-phone-auth-form>`), `MultiFactorAuthEnrollmentFormComponent` (`<fui-multi-factor-auth-enrollment-form>`), `MultiFactorAuthAssertionFormComponent` (`<fui-multi-factor-auth-assertion-form>`).
- **Injection Helpers:** `injectUI()`, `injectUserAuthenticated((user) => ...)`, `injectRedirectError()`, `injectRecaptchaVerifier()`, `injectPolicies()`.
