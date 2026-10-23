# FirebaseUI Web: Angular Recipes (`@firebase-oss/ui-angular`)

Companion to [`angular.md`](angular.md) (setup, provider config, screens, styles). Email link, guest upgrade, MFA, the Auth emulator, the account page and headless forms. Call `@firebase-oss/ui-core` actions with `this.ui()` where `ui = injectUI()` (see [`core.md`](core.md)).

## 1. Auth emulator

Connect it inside `provideAuth` in `app.config.ts`, so it happens once, before `provideFirebaseUI` builds its store (which reads the same `Auth`). Do not call `connectAuthEmulator` anywhere else.

```ts
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';

provideAuth(() => {
  const auth = getAuth();
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  return auth;
}),
```

Use the project id and a dummy `apiKey` from the project notes in `provideFirebaseApp`. Phone codes and email links appear in the emulator log or at `http://127.0.0.1:9099/emulator/v1/projects/<projectId>/verificationCodes` and `.../oobCodes`.

## 2. Email link

Mount one `<fui-email-link-auth-screen>` on the route the emailed link should open. It sends the link with that page's URL as the continue URL, and completes the sign-in on load when the page is opened from the link. No `actionCodeSettings` and no manual `completeEmailLinkSignIn`. The email is kept in `localStorage`, so the link must open in the same browser.

```ts
@Component({
  selector: 'app-email-link',
  imports: [EmailLinkAuthScreenComponent],
  template: `<fui-email-link-auth-screen (signIn)="onSignedIn()" />`,
})
export class EmailLinkPage {
  private readonly router = inject(Router);

  protected onSignedIn() {
    this.router.navigate(['/account']);
  }
}
```

`(emailSent)` fires after the link is sent. `(signIn)` also fires when the link upgrades an anonymous user.

## 3. Guest, then add an email

With `autoUpgradeAnonymousUsers()` registered (see `angular.md` section 2), sign-up, OAuth and phone link to the signed-in guest and keep its `uid`. Do not call `linkWithCredential` yourself.

```ts
@Component({
  selector: 'app-anonymous',
  imports: [ButtonComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardSubtitleComponent, CardContentComponent],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header>
          <fui-card-title>Continue as guest</fui-card-title>
          <fui-card-subtitle>Try the app without an account. You can add an email later and keep your data.</fui-card-subtitle>
        </fui-card-header>
        <fui-card-content>
          <button fui-button type="button" (click)="continueAsGuest()">Continue as guest</button>
        </fui-card-content>
      </fui-card>
    </div>
  `,
})
export class AnonymousPage {
  private readonly ui = injectUI();
  private readonly router = inject(Router);

  async continueAsGuest() {
    await signInAnonymously(this.ui()); // from '@firebase-oss/ui-core'
    await this.router.navigate(['/account']);
  }
}
```

`/link-email` (guarded by `signedIn`): `<fui-sign-up-auth-screen (signUp)="onSignedIn()" />`. Its `(signUp)` fires after linking, with the same `uid`. `autoAnonymousLogin()` signs in as a guest on startup; leave it out when a signed-out landing page is wanted.

## 4. Account page

```ts
@Component({
  selector: 'app-account',
  imports: [ButtonComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  template: `
    <div class="fui-screen">
      <fui-card>
        <fui-card-header><fui-card-title>Account</fui-card-title></fui-card-header>
        <fui-card-content>
          <p>uid: {{ user()?.uid }}</p>
          <p>email: {{ user()?.email ?? '' }}</p>
          <button fui-button [variant]="'secondary'" type="button" (click)="signOutAndLeave()">Sign out</button>
        </fui-card-content>
      </fui-card>
    </div>
  `,
})
export class AccountPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly user = toSignal(authState(this.auth)); // toSignal: '@angular/core/rxjs-interop'

  async signOutAndLeave() {
    await signOut(this.auth);
    await this.router.navigate(['/sign-in']);
  }
}
```

`Auth`, `authState`, `signOut` come from `@angular/fire/auth`; the card pieces and `ButtonComponent` from `@firebase-oss/ui-angular` (selectors in `angular.md` section 5).

## 5. Multi-factor

Enrolment needs a signed-in, non-anonymous user. SMS only:

```ts
import { FactorId } from 'firebase/auth';

@Component({
  selector: 'app-mfa-enroll',
  imports: [MultiFactorAuthEnrollmentScreenComponent],
  template: `
    <fui-multi-factor-auth-enrollment-screen [hints]="hints" (onEnrollment)="onEnrolled()" />
  `,
})
export class MfaEnrollPage {
  private readonly router = inject(Router);
  protected readonly hints = [FactorId.PHONE]; // default is [FactorId.TOTP, FactorId.PHONE]

  protected onEnrolled() {
    this.router.navigate(['/account']);
  }
}
```

Enrolment sends the SMS code (`mfaEnrollment:start`) and shows the code step. In a run against the Auth emulator the code step's "Verify Code" button sent no `mfaEnrollment:finalize` request and the console logged `NG0951`, so finishing enrolment end to end is unconfirmed. Do not claim it works without seeing the finalize request.

Assertion is automatic: when sign-in hits an account with a second factor, `fui-sign-in-auth-screen` (and the sign-up, email-link, phone and OAuth screens) swap to the SMS code step and then emit `(signIn)`. For a standalone step use `<fui-multi-factor-auth-assertion-screen (onSuccess)="...">` (`UserCredential`), which reads `ui().multiFactorResolver`.

Phone: the country selector on `<fui-phone-auth-screen>` starts on the first list entry, Afghanistan (+93), whatever `countryCodes({ defaultCountry })` says (tried with `'US'`, no change; the 7.1.0 source seeds it from the first country). A national number typed without choosing a country is sent as +93 and the emulator rejects it. Pick the country in the `<select class="fui-country-selector__select">` first (`selectOption('US')`) before typing. With the country picked, phone sign-in worked against the emulator end to end.

## 6. Headless forms (your own layout, no card)

| Selector | Inputs | Outputs |
| --- | --- | --- |
| `fui-sign-in-auth-form` | `forgotPassword`, `signUp`: `EventEmitter<void>` | `signIn: UserCredential` |
| `fui-sign-up-auth-form` | `signIn`: `EventEmitter<void>` | `signUp: UserCredential` |
| `fui-forgot-password-auth-form` | `backToSignIn`: `EventEmitter<void>` | `passwordSent: void` |
| `fui-email-link-auth-form` | none | `emailSent: void`, `signIn: UserCredential` |
| `fui-phone-auth-form` | none | `signIn: UserCredential` |
| `fui-multi-factor-auth-enrollment-form` | `hints` | `onEnrollment: void` |
| `fui-multi-factor-auth-assertion-form` | none | `onSuccess: UserCredential` |
| `fui-sms-multi-factor-enrollment-form`, `fui-totp-multi-factor-enrollment-form` | none | `onEnrollment: void` |
| `fui-sms-multi-factor-assertion-form`, `fui-totp-multi-factor-assertion-form` | `hint: MultiFactorInfo` (required) | `onSuccess: UserCredential` |

On the forms, the link-style actions are **inputs that take an `EventEmitter`**, not outputs, and each link renders only if something subscribes to that emitter:

```ts
@Component({
  selector: 'app-custom-sign-in',
  imports: [SignInAuthFormComponent],
  template: `
    <div class="fui-screen">
      <fui-sign-in-auth-form
        [forgotPassword]="forgot"
        [signUp]="register"
        (signIn)="onSignedIn()"
      />
    </div>
  `,
})
export class CustomSignInPage {
  private readonly router = inject(Router);
  protected readonly forgot = new EventEmitter<void>();
  protected readonly register = new EventEmitter<void>();

  constructor() {
    this.forgot.subscribe(() => this.router.navigate(['/forgot-password']));
    this.register.subscribe(() => this.router.navigate(['/sign-up']));
  }

  protected onSignedIn() {
    this.router.navigate(['/account']);
  }
}
```

Forms emit `UserCredential` (read `.user`); screens emit `User`. Wrap forms in `<fui-card>`/`.fui-screen` yourself if you want a card. Exports also include `injectSignInAuthFormSchema()` and the other `inject*FormSchema()` helpers for custom form validation.

## 7. Core signatures that matter here

From `@firebase-oss/ui-core` (all take the `FirebaseUI` value first):

- `signInAnonymously(ui): Promise<UserCredential>`
- `sendSignInLinkToEmail(ui, email): Promise<void>` (no `actionCodeSettings`; the link returns to `window.location.href`)
- `completeEmailLinkSignIn(ui, currentUrl): Promise<UserCredential | null>` (`currentUrl` required; the email screen and form already call it)
- `signInWithProvider(ui, provider)`, `signInWithEmailAndPassword(ui, email, password)`, `createUserWithEmailAndPassword(ui, email, password, displayName?)`
- `generateTotpQrCode(ui, secret, accountName?, issuer?): string` (synchronous)
- `handleFirebaseError(ui, error): Promise<never>`
