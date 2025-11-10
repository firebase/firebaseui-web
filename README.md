<img src="https://raw.githubusercontent.com/firebase/firebaseui-web/refs/heads/%40invertase/v7-development/.github/readme-banner.png" alt="Banner" />

# FirebaseUI for Web

Firebase UI for Web brings out-of-the-box components for Firebase for your favourite frameworks:

- Support for [React](https://react.dev/), [Shadcn](https://ui.shadcn.com/) and [Angular](https://angular.dev/).
- Composable authentication components; Email/Password Sign Up/In, Forgot Password, Email Link, Phone Auth, OAuth, Multi-Factor and more.
- Configure the behavior of internal logic and UI via behaviors.
- Framework agnostic core package; bring your own UI.
- Built-in localization via translations.

## Table of contents

- [Getting Started](#getting-started)
- [Styling](#styling)
- [Behaviors](#behaviors)
- [Translations](#translations)
- [Reference API](#reference)
- [Bring your own UI](#bring-your-own-ui)

## Getting Started

To get started, make sure that the [`firebase`](https://www.npmjs.com/package/firebase) package is installed in your project:

```bash
npm install firebase
```

Once installed, setup Firebase in your project ensuring you have configured your Firebase instance via `initializeApp`:

```ts
import { initializeApp } from 'firebase/app';

const app = initializeApp({ ... });
```

Next, follow the framework specific installation steps, for either React, Shadcn or Angular:

<details>
  <summary>React</summary>

  Install the `@invertase/firebaseui-react` package:

  ```bash
  npm install @invertase/firebaseui-react
  ```

  Alongside your Firebase configuration, import the `initializeUI` function and pass your configured Firebase App instance:

  ```ts
  import { initializeApp } from 'firebase/app';
  import { initializeUI } from '@invertase/firebaseui-core';

  const app = initializeApp({ ... });

  const ui = initializeUI({
    app,
  });
  ```

  Once configured, provide the `ui` instance to your application by wrapping it within the `FirebaseUIProvider` component:

  ```tsx
  import { FirebaseUIProvider } from '@invertase/firebaseui-react';

  function App() {
    return (
      <FirebaseUIProvider ui={ui}>
        ...
      </FirebaseUIProvider>
    );
  }
  ```

  Ensure your application includes the bundled styles for Firebase UI (see [styling](#styling) for additional info).

  ```css
  @import "@invertase/firebaseui-styles/dist.min.css";
  /* Or for tailwind users */
  @import "@invertase/firebaseui-styles/tailwind";
  ```

  That's it 🎉 You can now import components and start building:

  ```tsx
  import { SignInAuthScreen } from '@invertase/firebaseui-react';

  export function MySignInPage() {
    return (
      <>
        <header>Welcome</header>
        <SignInAuthScreen onSignIn={() => { ... }} />
      </>
    )
  }
  ```

  View the [reference API](#reference) for a full list of components.
</details>

<details>
  <summary>Shadcn</summary>

  Firstly, ensure you have [installed and setup](https://ui.shadcn.com/docs/installation) Shadcn in your project.

  Once configured, add the `@firebase` registry to your `components.json` file:

  ```json
  {
    ...
    "registries": {
      "@firebase": "https://fir-ui-shadcn-registry.web.app/r/{name}.json"
    }
  }
  ```

  Next, add a Firebase UI component from the registry, e.g.

  ```bash
  npx shadcn@latest add @firebase/sign-in-auth-screen
  ```

  This will automatically install any required dependencies.

  Alongside your Firebase configuration, import the `initializeUI` function and pass your configured Firebase App instance:

  ```ts
  import { initializeApp } from 'firebase/app';
  import { initializeUI } from '@invertase/firebaseui-core';

  const app = initializeApp({ ... });

  const ui = initializeUI({
    app,
  });
  ```

  Once configured, provide the `ui` instance to your application by wrapping it within the `FirebaseUIProvider` component:

  ```tsx
  import { FirebaseUIProvider } from '@invertase/firebaseui-react';

  function App() {
    return (
      <FirebaseUIProvider ui={ui}>
        ...
      </FirebaseUIProvider>
    );
  }
  ```

  That's it 🎉 You can now import components and start building:

  ```tsx
  import { SignInAuthScreen } from '@/components/sign-in-auth-screen';

  export function MySignInPage() {
    return (
      <>
        <header>Welcome</header>
        <SignInAuthScreen onSignIn={() => { ... }} />
      </>
    )
  }
  ```

  View the [reference API](#reference) for a full list of components.
</details>

<details>
  <summary>Angular</summary>

  The Angular project requires that [AngularFire](https://github.com/angular/angularfire) is setup and configured before using Firebase UI.

  Once you have provided the Firebase App instance to your application using `provideFirebaseApp`, install the Firebase UI for Angular package:

  ```bash
  npm install @invertase/firebaseui-angular
  ```

  Alongside your existing providers, add the `provideFirebaseUI` provider, returning a new Firebase UI instance via `initializeUI`:

  ```ts
  import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
  import { initializeUI } from '@invertase/firebaseui-core';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideFirebaseApp(() => initializeApp({ ... })),
      provideFirebaseUI((apps) => initializeUI({ app: apps[0] })),
    ]
  };
  ```

  Ensure your application includes the bundled styles for Firebase UI (see [styling](#styling) for additional info).

  ```css
  @import "@invertase/firebaseui-styles/dist.min.css";
  /* Or for tailwind users */
  @import "@invertase/firebaseui-styles/tailwind";
  ```

  That's it 🎉 You can now import components and start building:

  ```tsx
  import { Component } from "@angular/core";
  import { SignInAuthScreenComponent } from "@invertase/firebaseui-angular";

  @Component({
    selector: "sign-in-route",
    standalone: true,
    imports: [CommonModule, SignInAuthScreenComponent],
    template: `
      <header>Sign In</header>
      <fui-sign-in-auth-screen (signIn)="onSignIn($event)" />
    `,
  })
  export class SignInRoute {
    onSignIn(credential: UserCredential) {
      // ...
    }
  }
  ```

  View the [reference API](#reference) for a full list of components.
</details>

## Styling

Firebase UI provides out-of-the-box styling via CSS, and provides means to customize the UI to align with your existing application or guidelines.

> Note: if you are using Shadcn this section does not apply. All styles are inherited from your Shadcn configuration.

Ensure your application imports the Firebase UI CSS file. This can be handled a number of ways depending on your setup:

### CSS Bundling 

If your bundler supports importing CSS files from node_modules:

```css
@import "@invertase/firebaseui-styles/dist.min.css";
```

### Tailwind

If you are using [Tailwind CSS](https://tailwindcss.com/), add the Tailwind specific CSS file:

```css
@import "tailwindcss";
@import "@invertase/firebaseui-styles/tailwind";
```

### Via CDN

If none of these options apply, include the CSS file via a CDN:

```html
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@invertase/firebaseui-styles/dist/dist.min.css">
</head>
```

### Theming

Out of the box, Firebase UI provides a neutral light and dark theme with some opinionated styling (colors, border radii etc). These are all controlled via CSS variables, allowing you to update these at will to match any existing UI design guidelines. To modify the variables, override the following CSS variables:

```css
:root {
  /* The primary color is used for the button and link colors */
  --fui-primary: ...;
  /* The primary hover color is used for the button and link colors when hovered */
  --fui-primary-hover: ...;
  /* The primary surface color is used for the button text color */
  --fui-primary-surface: ...;
  /* The text color used for body text */
  --fui-text: ...;
  /* The muted text color used for body text, such as subtitles */
  --fui-text-muted: ...;
  /* The background color of the cards */
  --fui-background: ...;
  /* The border color used for none input fields */
  --fui-border: ...;
  /* The input color used for input fields */
  --fui-input: ...;
  /* The error color used for error messages */
  --fui-error: ...;
  /* The radius used for the input fields */
  --fui-radius: ...;
  /* The radius used for the cards */
  --fui-radius-card: ...;
}
```

## Behaviors

Out of the box, Firebase UI applies sensible default behaviors for how the UI should handle specific scenarios which may occur during user flows. You can however customize this behavior by modifying your `initializeUI` to provide an array of "behaviors", for example:

```ts
import { requireDisplayName } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [
    requireDisplayName(),
  ],
});
```

#### `autoAnonymousLogin`

The `autoAnonymousLogin` behavior will automatically sign users in via [anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth) when initialized. Whilst authenticating, the Firebase UI state will be set to "loading", allowing you to block the loading of the application if you wish.

```ts
import { autoAnonymousLogin } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [autoAnonymousLogin()],
});
```

#### `autoUpgradeAnonymousUsers`

The `autoUpgradeAnonymousUsers` behavior will automatically upgrade a user who is anonymously authenticated with your application upon a successful sign in (including OAuth). You can optionally provide a callback to handle an upgrade (such as merging account data). During the async callback, the UI will stay in a pending state.

```ts
import { autoUpgradeAnonymousUsers } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [autoUpgradeAnonymousUsers({
    async onUpgrade(ui, oldUserId, credential) {
      // Some account upgrade logic.
    }
  })],
});
```

#### `recaptchaVerification`

The `recaptchaVerification` behavior allows you to customize how the [reCAPTCHA provider](https://firebase.google.com/docs/app-check/web/recaptcha-provider) is rendered during some UI flows (such as Phone Authentication).

By default, the reCAPTCHA UI will be rendered in "invisible" mode. To override this:

```ts
import { recaptchaVerification } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [recaptchaVerification({
    size: "compact", // "normal" | "invisible" | "compact"
    theme: "dark", // "light" | "dark"
  })],
});
```

#### `providerRedirectStrategy`

The `providerRedirectStrategy` behavior redirects any external provider authentication (e.g. OAuth) via a redirect flow. This is the default strategy.

```ts
import { providerRedirectStrategy } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [providerRedirectStrategy()],
});
```

#### `providerPopupStrategy`

The `providerPopupStrategy` behavior causes any external provider authentication (e.g. OAuth) to be handled via a popup window.

```ts
import { providerPopupStrategy } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [providerPopupStrategy()],
});
```

#### `oneTapSignIn`

The `oneTapSignIn` behavior triggers the [Google One Tap](https://developers.google.com/identity/gsi/web/guides/features) experience to render.

Note: This behavior requires that Google Sign In is enabled as an authentication method on the Firebase Console. Once enabled, you can obtain the required `clientId` via the "Web SDK configuration" settings on the Console.

The One Tap popup can be additionally configured via this behavior:

```ts
import { oneTapSignIn } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [oneTapSignIn({
    clientId: "...", // required - from Firebase Console under Google provider
    autoSelect: false, // optional
    cancelOnTapOutside: false, // optional
  })],
});
```

See https://developers.google.com/identity/gsi/web/reference/js-reference for a full list of configuration options.

#### `requireDisplayName`

The `requireDisplayName` behavior configures Firebase UI to display a required "Display Name" input box in the UI, which is applied to the users account during sign up flows.

If you are not using pre-built components, the `createUserWithEmailAndPassword` function from Firebase UI will throw if a display name is not provided.

```ts
import { requireDisplayName } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [requireDisplayName()],
});
```

#### `countryCodes`

The `countryCodes` behavior controls how country codes are consumed throughout your application, for example during Phone Authentication flows when selecting a phone numbers country code.

```ts
import { countryCodes } from '@invertase/firebaseui-core';

const ui = initializeUI({
  app,
  behaviors: [countryCodes({
    allowedCountries: ['GB', 'US', 'FR'], // only allow Great Britain, USA and France
    defaultCountry: 'GB', // GB is default
  })],
});
```

## Translations

> Note: Firebase UI currently only provides English (en-US) translations out of the box.

Firebase UI provides a mechanism for overriding any localized strings in the UI components. To define your own custom locale, use the `registerLocale` function from the `@invertase/firebaseui-translations` package:

```ts
import { registerLocale } from '@invertase/firebaseui-translations';

const frFr = registerLocale('fr-FR', {
  labels: {
    signIn: "Sign In, Matey",
  },
}); 
```

To use this locale, provide it to the `initializeUI` configuration:

```ts
const ui = initializeUI({
  app,
  locale: frFr,
});
```

### Dynamic translations

To dynamically change your locale during the applications lifecycle (e.g. a language drop down), you can call the `setLocale` method on the UI instance:

```ts
const ui = initializeUI({
  app,
  locale: frFr,
});

...

<button onClick={() => ui.setLocale(frFr)}>
  French 🇫🇷
</button>
```

### Fallback

By default, any missing translations will fallback to English if not specified. You can pass a 3rd "fallback" argument locale to the `registerLocale` function.

## Reference

<details>
  <summary>@invertase/firebaseui-core</summary>

  <h3>initializeUI</h3>

  Initalizes a new `FirebaseUIStore` instance.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | config   | FirebaseUIOptions | The configuration for Firebase UI  |
  | name     | string?           | An optional name for the instance. |

  Returns `FirebaseUIStore`.

  <h3>signInWithEmailAndPassword</h3>

  Signs the user in with an email and password.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | email    | string            | The users email address.  |
  | password | string            | The users password. |

  Returns `Promise<UserCredential>`.

  <h3>createUserWithEmailAndPassword</h3>

  Creates a new user account with an email and password.

  | Argument   |        Type       | Description                        |
  |------------|:-----------------:|------------------------------------|
  | ui         | FirebaseUI        | The Firebase UI instance.  |
  | email      | string            | The users email address.  |
  | password   | string            | The users password. |
  | displayName| string?           | Optional display name for the user. |

  Returns `Promise<UserCredential>`.

  <h3>verifyPhoneNumber</h3>

  Verifies a phone number and sends a verification code.

  | Argument      |        Type       | Description                        |
  |---------------|:-----------------:|------------------------------------|
  | ui            | FirebaseUI        | The Firebase UI instance.  |
  | phoneNumber   | string            | The phone number to verify.  |
  | appVerifier   | ApplicationVerifier | The reCAPTCHA verifier. |
  | mfaUser       | MultiFactorUser?  | Optional MFA user for enrollment flow. |
  | mfaHint       | MultiFactorInfo?  | Optional MFA hint for assertion flow. |

  Returns `Promise<string>` (verification ID).

  <h3>confirmPhoneNumber</h3>

  Confirms a phone number verification with the verification code.

  | Argument       |        Type       | Description                        |
  |----------------|:-----------------:|------------------------------------|
  | ui             | FirebaseUI        | The Firebase UI instance.  |
  | verificationId | string            | The verification ID from verifyPhoneNumber. |
  | verificationCode | string         | The verification code sent to the phone. |

  Returns `Promise<UserCredential>`.

  <h3>sendPasswordResetEmail</h3>

  Sends a password reset email to the user.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | email    | string            | The users email address.  |

  Returns `Promise<void>`.

  <h3>sendSignInLinkToEmail</h3>

  Sends a sign-in link to the user's email address.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | email    | string            | The users email address.  |

  Returns `Promise<void>`.

  <h3>signInWithEmailLink</h3>

  Signs in a user with an email link.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | email    | string            | The users email address.  |
  | link     | string            | The email link from the sign-in email. |

  Returns `Promise<UserCredential>`.

  <h3>signInWithCredential</h3>

  Signs in a user with an authentication credential.

  | Argument  |        Type       | Description                        |
  |-----------|:-----------------:|------------------------------------|
  | ui        | FirebaseUI        | The Firebase UI instance.  |
  | credential| AuthCredential    | The authentication credential. |

  Returns `Promise<UserCredential>`.

  <h3>signInWithCustomToken</h3>

  Signs in a user with a custom token.

  | Argument   |        Type       | Description                        |
  |------------|:-----------------:|------------------------------------|
  | ui         | FirebaseUI        | The Firebase UI instance.  |
  | customToken| string            | The custom token. |

  Returns `Promise<UserCredential>`.

  <h3>signInAnonymously</h3>

  Signs in a user anonymously.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `Promise<UserCredential>`.

  <h3>signInWithProvider</h3>

  Signs in a user with an OAuth provider (e.g., Google, Facebook, etc.).

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | provider | AuthProvider      | The OAuth provider. |

  Returns `Promise<UserCredential | never>`.

  <h3>completeEmailLinkSignIn</h3>

  Completes the email link sign-in flow by checking if the current URL is a valid email link.

  | Argument  |        Type       | Description                        |
  |-----------|:-----------------:|------------------------------------|
  | ui        | FirebaseUI        | The Firebase UI instance.  |
  | currentUrl| string            | The current URL to check. |

  Returns `Promise<UserCredential | null>`.

  <h3>generateTotpQrCode</h3>

  Generates a QR code data URL for TOTP (Time-based One-Time Password) enrollment.

  | Argument   |        Type       | Description                        |
  |------------|:-----------------:|------------------------------------|
  | ui         | FirebaseUI        | The Firebase UI instance.  |
  | secret     | TotpSecret        | The TOTP secret. |
  | accountName| string?           | Optional account name for the QR code. |
  | issuer     | string?           | Optional issuer name for the QR code. |

  Returns `string` (data URL of the QR code).

  <h3>signInWithMultiFactorAssertion</h3>

  Signs in a user with a multi-factor authentication assertion.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | assertion| MultiFactorAssertion | The MFA assertion. |

  Returns `Promise<UserCredential>`.

  <h3>enrollWithMultiFactorAssertion</h3>

  Enrolls a multi-factor authentication method for the current user.

  | Argument   |        Type       | Description                        |
  |------------|:-----------------:|------------------------------------|
  | ui         | FirebaseUI        | The Firebase UI instance.  |
  | assertion  | MultiFactorAssertion | The MFA assertion. |
  | displayName| string?           | Optional display name for the MFA method. Throws if not provided and the `requireDisplayName` behavior is enabled. |

  Returns `Promise<void>`.

  <h3>generateTotpSecret</h3>

  Generates a TOTP secret for multi-factor authentication enrollment.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `Promise<TotpSecret>`.

  <h3>autoAnonymousLogin</h3>

  Automatically signs in users anonymously when the UI initializes.

  Returns `Behavior<"autoAnonymousLogin">`.

  <h3>autoUpgradeAnonymousUsers</h3>

  Automatically upgrades anonymous users to permanent accounts when they sign in with a credential or provider.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | options  | AutoUpgradeAnonymousUsersOptions? | Optional configuration. |
  | options.onUpgrade | function? | Optional callback when upgrade occurs. |

  Returns `Behavior<"autoUpgradeAnonymousCredential" | "autoUpgradeAnonymousProvider" | "autoUpgradeAnonymousUserRedirectHandler">`.

  <h3>recaptchaVerification</h3>

  Configures reCAPTCHA verification for phone authentication.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | options  | RecaptchaVerificationOptions? | Optional reCAPTCHA configuration. |

  Returns `Behavior<"recaptchaVerification">`.

  <h3>providerRedirectStrategy</h3>

  Configures OAuth providers to use redirect flow (full page redirect).

  Returns `Behavior<"providerSignInStrategy" | "providerLinkStrategy">`.

  <h3>providerPopupStrategy</h3>

  Configures OAuth providers to use popup flow (popup window).

  Returns `Behavior<"providerSignInStrategy" | "providerLinkStrategy">`.

  <h3>oneTapSignIn</h3>

  Enables Google One Tap sign-in.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | options  | OneTapSignInOptions | Configuration for One Tap sign-in. |

  Returns `Behavior<"oneTapSignIn">`.

  <h3>requireDisplayName</h3>

  Requires users to provide a display name during registration.

  Returns `Behavior<"requireDisplayName">`.

  <h3>countryCodes</h3>

  Configures country code handling for phone number input.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | options  | CountryCodesOptions? | Optional country codes configuration. |

  Returns `Behavior<"countryCodes">`.

  <h3>hasBehavior</h3>

  Checks if a behavior is enabled on a Firebase UI instance.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | key      | string            | The behavior key to check. |

  Returns `boolean`.

  <h3>getBehavior</h3>

  Gets a behavior handler from a Firebase UI instance.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | key      | string            | The behavior key to retrieve. |

  Returns the behavior handler function.

  <h3>defaultBehaviors</h3>

  The default behaviors that are automatically included in a Firebase UI instance. Includes `recaptchaVerification`, `providerRedirectStrategy`, and `countryCodes`.

  Type: `Behavior<"recaptchaVerification">`.

  <h3>countryData</h3>

  An array of country data objects containing name, dial code, country code, and emoji for all supported countries.

  Type: `readonly CountryData[]`.

  <h3>formatPhoneNumber</h3>

  Formats a phone number according to the specified country data.

  | Argument   |        Type       | Description                        |
  |------------|:-----------------:|------------------------------------|
  | phoneNumber| string            | The phone number to format.  |
  | countryData| CountryData       | The country data to use for formatting. |

  Returns `string` (formatted phone number in E164 format).

  <h3>FirebaseUIError</h3>

  A custom error class that extends FirebaseError with localized error messages.

  <h3>handleFirebaseError</h3>

  Handles Firebase errors and converts them to FirebaseUIError with localized messages. Also handles special cases like account linking and multi-factor authentication.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |
  | error    | unknown           | The error to handle. |

  Throws `FirebaseUIError`.

  <h3>getTranslation</h3>

  Gets a translated string for a given category and key.

  | Argument     |        Type       | Description                        |
  |--------------|:-----------------:|------------------------------------|
  | ui           | FirebaseUI        | The Firebase UI instance.  |
  | category     | TranslationCategory | The translation category. |
  | key          | TranslationKey    | The translation key. |
  | replacements | Record<string, string>? | Optional replacements for placeholders. |

  Returns `string`.

  <h3>createSignInAuthFormSchema</h3>

  Creates a Zod schema for email/password sign-in form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `email` and `password` fields.

  <h3>createSignUpAuthFormSchema</h3>

  Creates a Zod schema for email/password sign-up form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `email`, `password`, and optionally `displayName` fields.

  <h3>createForgotPasswordAuthFormSchema</h3>

  Creates a Zod schema for forgot password form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `email` field.

  <h3>createEmailLinkAuthFormSchema</h3>

  Creates a Zod schema for email link authentication form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `email` field.

  <h3>createPhoneAuthNumberFormSchema</h3>

  Creates a Zod schema for phone number input form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `phoneNumber` field.

  <h3>createPhoneAuthVerifyFormSchema</h3>

  Creates a Zod schema for phone verification code form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `verificationId` and `verificationCode` fields.

  <h3>createMultiFactorPhoneAuthNumberFormSchema</h3>

  Creates a Zod schema for multi-factor phone authentication number form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `phoneNumber` and `displayName` fields.

  <h3>createMultiFactorPhoneAuthAssertionFormSchema</h3>

  Creates a Zod schema for multi-factor phone authentication assertion form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `phoneNumber` field.

  <h3>createMultiFactorPhoneAuthVerifyFormSchema</h3>

  Creates a Zod schema for multi-factor phone authentication verification form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `verificationId` and `verificationCode` fields.

  <h3>createMultiFactorTotpAuthNumberFormSchema</h3>

  Creates a Zod schema for multi-factor TOTP authentication form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `displayName` field.

  <h3>createMultiFactorTotpAuthVerifyFormSchema</h3>

  Creates a Zod schema for multi-factor TOTP verification code form validation.

  | Argument |        Type       | Description                        |
  |----------|:-----------------:|------------------------------------|
  | ui       | FirebaseUI        | The Firebase UI instance.  |

  Returns `ZodObject` with `verificationCode` field.

</details>

<details>
  <summary>@invertase/firebaseui-react</summary>

  **FirebaseUIProvider**

  Provider component that wraps your application and provides Firebase UI context.

  | Prop     | Type | Description |
  |----------|:----:|-------------|
  | ui | `FirebaseUIStore` | The UI store (from `initializeUI`) |
  | policies | `{ termsOfServiceUrl: PolicyURL; privacyPolicyUrl: PolicyURL; onNavigate?: (url: PolicyURL) => void; }?` | Optional policies configuration. If provided, UI components will automatically render the policies. |
  | children | `React.ReactNode` | Child components |

  **SignInAuthForm**

  Form component for email/password sign-in.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onSignIn | `(credential: UserCredential) => void?` | Callback when sign-in succeeds |
  | onForgotPasswordClick | `() => void?` | Callback when forgot password link is clicked |
  | onSignUpClick | `() => void?` | Callback when sign-up link is clicked |

  <h4>SignUpAuthForm</h4>

  Form component for email/password sign-up.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onSignUp | `(credential: UserCredential) => void?` | Callback when sign-up succeeds |
  | onSignInClick | `() => void?` | Callback when sign-in link is clicked |

  <h4>ForgotPasswordAuthForm</h4>

  Form component for password reset.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onSendPasswordResetEmail | `() => void?` | Callback when password reset email is sent |
  | onBackClick | `() => void?` | Callback when back button is clicked |

  <h4>EmailLinkAuthForm</h4>

  Form component for email link authentication.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onSendSignInLinkToEmail | `() => void?` | Callback when sign-in link email is sent |

  <h4>PhoneAuthForm</h4>

  Form component for phone number authentication.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onVerifyPhoneNumber | `() => void?` | Callback when phone number verification is initiated |
  | onVerifyCode | `(credential: UserCredential) => void?` | Callback when verification code is verified |

  <h4>MultiFactorAuthAssertionForm</h4>

  Form component for multi-factor authentication assertion during sign-in.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onAssert | `(credential: UserCredential) => void?` | Callback when MFA assertion succeeds |

  <h4>MultiFactorAuthEnrollmentForm</h4>

  Form component for multi-factor authentication enrollment.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onEnroll | `() => void?` | Callback when MFA enrollment succeeds |

  <h4>SmsMultiFactorAssertionForm</h4>

  Form component for SMS-based multi-factor authentication assertion.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onAssert | `(credential: UserCredential) => void?` | Callback when SMS MFA assertion succeeds |

  <h4>SmsMultiFactorEnrollmentForm</h4>

  Form component for SMS-based multi-factor authentication enrollment.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onEnroll | `() => void?` | Callback when SMS MFA enrollment succeeds |

  <h4>TotpMultiFactorAssertionForm</h4>

  Form component for TOTP-based multi-factor authentication assertion.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onAssert | `(credential: UserCredential) => void?` | Callback when TOTP MFA assertion succeeds |

  <h4>TotpMultiFactorEnrollmentForm</h4>

  Form component for TOTP-based multi-factor authentication enrollment.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | onEnroll | `() => void?` | Callback when TOTP MFA enrollment succeeds |

  <h3>Screen Components</h3>

  <h4>SignInAuthScreen</h4>

  Screen component for email/password sign-in. Extends `SignInAuthFormProps` and accepts `children`.

  <h4>SignUpAuthScreen</h4>

  Screen component for email/password sign-up. Extends `SignUpAuthFormProps` and accepts `children`.

  <h4>ForgotPasswordAuthScreen</h4>

  Screen component for password reset. Extends `ForgotPasswordAuthFormProps`.

  <h4>EmailLinkAuthScreen</h4>

  Screen component for email link authentication. Extends `EmailLinkAuthFormProps` and accepts `children`.

  <h4>PhoneAuthScreen</h4>

  Screen component for phone number authentication. Extends `PhoneAuthFormProps` and accepts `children`.

  <h4>MultiFactorAuthAssertionScreen</h4>

  Screen component for multi-factor authentication assertion. Extends `MultiFactorAuthAssertionFormProps`.

  <h4>MultiFactorAuthEnrollmentScreen</h4>

  Screen component for multi-factor authentication enrollment. Extends `MultiFactorAuthEnrollmentFormProps`.

  <h4>OAuthScreen</h4>

  Screen component for OAuth provider sign-in.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | children | `React.ReactNode?` | Child components |

  <h3>OAuth Components</h3>

  <h4>OAuthButton</h4>

  Generic OAuth button component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | provider | `AuthProvider` | Firebase Auth provider instance |
  | themed | `boolean \| string?` | Whether to apply themed styling |
  | children | `React.ReactNode?` | Button content |

  <h4>GoogleSignInButton</h4>

  Google OAuth sign-in button component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | themed | `boolean \| string?` | Whether to apply themed styling |

  <h4>AppleSignInButton</h4>

  Apple OAuth sign-in button component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | themed | `boolean \| string?` | Whether to apply themed styling |

  <h4>FacebookSignInButton</h4>

  Facebook OAuth sign-in button component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | themed | `boolean \| string?` | Whether to apply themed styling |

  <h4>GitHubSignInButton</h4>

  GitHub OAuth sign-in button component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | themed | `boolean \| string?` | Whether to apply themed styling |

  <h4>MicrosoftSignInButton</h4>

  Microsoft OAuth sign-in button component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | themed | `boolean \| string?` | Whether to apply themed styling |

  <h4>TwitterSignInButton</h4>

  Twitter OAuth sign-in button component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | themed | `boolean \| string?` | Whether to apply themed styling |

  <h3>UI Components</h3>

  <h4>Button</h4>

  Button component with variant support.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | variant | `"primary" \| "secondary" \| "outline"?` | Button style variant |
  | asChild | `boolean?` | Render as child component using Slot |
  | ...props | `ComponentProps<"button">` | Standard button HTML attributes |

  <h4>Card</h4>

  Card container component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | children | `React.ReactNode?` | Card content |
  | ...props | `ComponentProps<"div">` | Standard div HTML attributes |

  <h4>CardHeader</h4>

  Card header component. Accepts `children` and standard div props.

  <h4>CardTitle</h4>

  Card title component. Accepts `children` and standard h2 props.

  <h4>CardSubtitle</h4>

  Card subtitle component. Accepts `children` and standard p props.

  <h4>CardContent</h4>

  Card content component. Accepts `children` and standard div props.

  <h4>CountrySelector</h4>

  Country selector component for phone number input.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | ...props | `ComponentProps<"div">` | Standard div HTML attributes |

  <h4>Divider</h4>

  Divider component.

  | Prop | Type | Description |
  |------|:----:|-------------|
  | children | `React.ReactNode?` | Divider content |
  | ...props | `ComponentProps<"div">` | Standard div HTML attributes |

  <h4>Policies</h4>

  Component that renders terms of service and privacy policy links. Automatically rendered when policies are provided to `FirebaseUIProvider`.

  <h4>RedirectError</h4>

  Component that displays redirect errors from Firebase UI authentication flow.

  <h3>Hooks</h3>

  <h4>useUI</h4>

  Gets the Firebase UI configuration from context.

  Returns `FirebaseUI`.

  <h4>useRedirectError</h4>

  Gets the redirect error from the UI store.

  Returns `string | undefined`.

  <h4>useSignInAuthFormSchema</h4>

  Creates a Zod schema for sign-in form validation.

  Returns `ZodObject` with `email` and `password` fields.

  <h4>useSignUpAuthFormSchema</h4>

  Creates a Zod schema for sign-up form validation.

  Returns `ZodObject` with `email`, `password`, and optionally `displayName` fields.

  <h4>useForgotPasswordAuthFormSchema</h4>

  Creates a Zod schema for forgot password form validation.

  Returns `ZodObject` with `email` field.

  <h4>useEmailLinkAuthFormSchema</h4>

  Creates a Zod schema for email link authentication form validation.

  Returns `ZodObject` with `email` field.

  <h4>usePhoneAuthNumberFormSchema</h4>

  Creates a Zod schema for phone number input form validation.

  Returns `ZodObject` with `phoneNumber` field.

  <h4>usePhoneAuthVerifyFormSchema</h4>

  Creates a Zod schema for phone verification code form validation.

  Returns `ZodObject` with `verificationId` and `verificationCode` fields.

  <h4>useMultiFactorPhoneAuthNumberFormSchema</h4>

  Creates a Zod schema for multi-factor phone authentication number form validation.

  Returns `ZodObject` with `phoneNumber` and `displayName` fields.

  <h4>useMultiFactorPhoneAuthVerifyFormSchema</h4>

  Creates a Zod schema for multi-factor phone authentication verification form validation.

  Returns `ZodObject` with `verificationId` and `verificationCode` fields.

  <h4>useMultiFactorTotpAuthNumberFormSchema</h4>

  Creates a Zod schema for multi-factor TOTP authentication form validation.

  Returns `ZodObject` with `displayName` field.

  <h4>useMultiFactorTotpAuthVerifyFormSchema</h4>

  Creates a Zod schema for multi-factor TOTP verification code form validation.

  Returns `ZodObject` with `verificationCode` field.

  <h4>useRecaptchaVerifier</h4>

  Creates and manages a reCAPTCHA verifier instance.

  | Argument | Type | Description |
  |----------|:----:|-------------|
  | ref | `React.RefObject<HTMLDivElement \| null>` | Reference to the DOM element where reCAPTCHA should be rendered |

  Returns `RecaptchaVerifier \| null`.

  <h3>Form Hooks</h3>

  <h4>useSignInAuthForm</h4>

  Hook for managing sign-in form state and validation.

  Returns form state and handlers.

  <h4>useSignInAuthFormAction</h4>

  Hook for sign-in form submission action.

  Returns async action handler.

  <h4>useSignUpAuthForm</h4>

  Hook for managing sign-up form state and validation.

  Returns form state and handlers.

  <h4>useSignUpAuthFormAction</h4>

  Hook for sign-up form submission action.

  Returns async action handler.

  <h4>useRequireDisplayName</h4>

  Hook to check if display name is required for sign-up.

  Returns `boolean`.

  <h4>useForgotPasswordAuthForm</h4>

  Hook for managing forgot password form state and validation.

  Returns form state and handlers.

  <h4>useForgotPasswordAuthFormAction</h4>

  Hook for forgot password form submission action.

  Returns async action handler.

  <h4>useEmailLinkAuthForm</h4>

  Hook for managing email link auth form state and validation.

  Returns form state and handlers.

  <h4>useEmailLinkAuthFormAction</h4>

  Hook for email link auth form submission action.

  Returns async action handler.

  <h4>useEmailLinkAuthFormCompleteSignIn</h4>

  Hook to complete email link authentication.

  Returns async action handler.

  <h4>usePhoneNumberForm</h4>

  Hook for managing phone number form state and validation.

  Returns form state and handlers.

  <h4>usePhoneNumberFormAction</h4>

  Hook for phone number form submission action.

  Returns async action handler.

  <h4>useVerifyPhoneNumberForm</h4>

  Hook for managing phone verification form state and validation.

  Returns form state and handlers.

  <h4>useVerifyPhoneNumberFormAction</h4>

  Hook for phone verification form submission action.

  Returns async action handler.

  <h4>useMultiFactorAssertionCleanup</h4>

  Hook for cleaning up multi-factor assertion state.

  <h4>useSmsMultiFactorAssertionPhoneFormAction</h4>

  Hook for SMS MFA assertion phone form submission action.

  Returns async action handler.

  <h4>useSmsMultiFactorAssertionVerifyFormAction</h4>

  Hook for SMS MFA assertion verification form submission action.

  Returns async action handler.

  <h4>useSmsMultiFactorEnrollmentPhoneNumberForm</h4>

  Hook for managing SMS MFA enrollment phone number form state.

  Returns form state and handlers.

  <h4>useSmsMultiFactorEnrollmentPhoneAuthFormAction</h4>

  Hook for SMS MFA enrollment phone auth form submission action.

  Returns async action handler.

  <h4>useMultiFactorEnrollmentVerifyPhoneNumberForm</h4>

  Hook for managing MFA enrollment phone verification form state.

  Returns form state and handlers.

  <h4>useMultiFactorEnrollmentVerifyPhoneNumberFormAction</h4>

  Hook for MFA enrollment phone verification form submission action.

  Returns async action handler.

  <h4>useTotpMultiFactorAssertionForm</h4>

  Hook for managing TOTP MFA assertion form state.

  Returns form state and handlers.

  <h4>useTotpMultiFactorAssertionFormAction</h4>

  Hook for TOTP MFA assertion form submission action.

  Returns async action handler.

  <h4>useTotpMultiFactorSecretGenerationForm</h4>

  Hook for managing TOTP secret generation form state.

  Returns form state and handlers.

  <h4>useTotpMultiFactorSecretGenerationFormAction</h4>

  Hook for TOTP secret generation form submission action.

  Returns async action handler.

  <h4>useMultiFactorEnrollmentVerifyTotpForm</h4>

  Hook for managing MFA enrollment TOTP verification form state.

  Returns form state and handlers.

  <h4>useMultiFactorEnrollmentVerifyTotpFormAction</h4>

  Hook for MFA enrollment TOTP verification form submission action.

  Returns async action handler.

  <h4>useSignInWithProvider</h4>

  Hook for OAuth provider sign-in.

  | Argument | Type | Description |
  |----------|:----:|-------------|
  | provider | `AuthProvider` | Firebase Auth provider instance |

  Returns async action handler.

  <h3>Utility Hooks</h3>

  <h4>useCountries</h4>

  Hook to get list of countries for country selector.

  Returns array of country data.

  <h4>useDefaultCountry</h4>

  Hook to get default country for country selector.

  Returns country data or `undefined`.

  <h3>Context & Types</h3>

  <h4>PolicyContext</h4>

  React context for policy configuration.

  <h4>PolicyProps</h4>

  Type for policy configuration.

  | Property | Type | Description |
  |----------|:----:|-------------|
  | termsOfServiceUrl | `PolicyURL` | URL to terms of service |
  | privacyPolicyUrl | `PolicyURL` | URL to privacy policy |
  | onNavigate | `(url: PolicyURL) => void?` | Optional navigation handler |

  <h4>PolicyURL</h4>

  Type alias: `string \| URL`

  <h4>FirebaseUIProviderProps</h4>

  Type for `FirebaseUIProvider` component props.

</details>

<details>
  <summary>Shadcn</summary>

  The shadcn registry is available at: https://fir-ui-shadcn-registry.web.app/r/{name}.json

  | Name     |       Path       | Description |
  |----------|:----------------:|-------------|
  | apple-sign-in-button | /r/apple-sign-in-button.json | A button component for Apple OAuth authentication. |
  | country-selector | /r/country-selector.json | A country selector component for phone number input with country codes and flags. |
  | email-link-auth-form | /r/email-link-auth-form.json | A form allowing users to sign in via email link. |
  | email-link-auth-screen | /r/email-link-auth-screen.json | A screen allowing users to sign in via email link. |
  | facebook-sign-in-button | /r/facebook-sign-in-button.json | A button component for Facebook OAuth authentication. |
  | forgot-password-auth-form | /r/forgot-password-auth-form.json | A form allowing users to reset their password via email. |
  | forgot-password-auth-screen | /r/forgot-password-auth-screen.json | A screen allowing users to reset their password via email. |
  | github-sign-in-button | /r/github-sign-in-button.json | A button component for GitHub OAuth authentication. |
  | google-sign-in-button | /r/google-sign-in-button.json | A button component for Google OAuth authentication. |
  | microsoft-sign-in-button | /r/microsoft-sign-in-button.json | A button component for Microsoft OAuth authentication. |
  | multi-factor-auth-assertion-form | /r/multi-factor-auth-assertion-form.json | A form allowing users to complete multi-factor authentication during sign-in with TOTP or SMS options. |
  | multi-factor-auth-assertion-screen | /r/multi-factor-auth-assertion-screen.json | A screen allowing users to complete multi-factor authentication during sign-in with TOTP or SMS options. |
  | multi-factor-auth-enrollment-form | /r/multi-factor-auth-enrollment-form.json | A form allowing users to select and configure multi-factor authentication methods. |
  | multi-factor-auth-enrollment-screen | /r/multi-factor-auth-enrollment-screen.json | A screen allowing users to set up multi-factor authentication with TOTP or SMS options. |
  | oauth-button | /r/oauth-button.json | A button component for OAuth authentication providers. |
  | oauth-screen | /r/oauth-screen.json | A screen allowing users to sign in with OAuth providers. |
  | phone-auth-form | /r/phone-auth-form.json | A form allowing users to authenticate using their phone number with SMS verification. |
  | phone-auth-screen | /r/phone-auth-screen.json | A screen allowing users to authenticate using their phone number with SMS verification. |
  | policies | /r/policies.json | A component allowing users to navigate to the terms of service and privacy policy. |
  | redirect-error | /r/redirect-error.json | A component that displays redirect errors from Firebase UI authentication flow. |
  | sign-in-auth-form | /r/sign-in-auth-form.json | A form allowing users to sign in with email and password. |
  | sign-in-auth-screen | /r/sign-in-auth-screen.json | A screen allowing users to sign in with email and password. |
  | sign-up-auth-form | /r/sign-up-auth-form.json | A form allowing users to sign up with email and password. |
  | sign-up-auth-screen | /r/sign-up-auth-screen.json | A screen allowing users to sign up with email and password. |
  | sms-multi-factor-assertion-form | /r/sms-multi-factor-assertion-form.json | A form allowing users to complete SMS-based multi-factor authentication during sign-in. |
  | sms-multi-factor-enrollment-form | /r/sms-multi-factor-enrollment-form.json | A form allowing users to enroll SMS-based multi-factor authentication. |
  | totp-multi-factor-assertion-form | /r/totp-multi-factor-assertion-form.json | A form allowing users to complete TOTP-based multi-factor authentication during sign-in. |
  | totp-multi-factor-enrollment-form | /r/totp-multi-factor-enrollment-form.json | A form allowing users to enroll TOTP-based multi-factor authentication with QR code generation. |
  | twitter-sign-in-button | /r/twitter-sign-in-button.json | A button component for Twitter OAuth authentication. |

</details>

<details>
  <summary>@invertase/firebaseui-angular</summary>

  <h3>provideFirebaseUI</h3>

  Provider function that configures Firebase UI for your Angular application.

  | Argument | Type | Description |
  |----------|:----:|-------------|
  | uiFactory | `(apps: FirebaseApps) => FirebaseUIStore` | Factory function that creates the UI store from Firebase apps |

  Returns `EnvironmentProviders`.

  <h3>provideFirebaseUIPolicies</h3>

  Provider function that configures policies (terms of service and privacy policy) for Firebase UI.

  | Argument | Type | Description |
  |----------|:----:|-------------|
  | factory | `() => PolicyConfig` | Factory function that returns policy configuration |

  Returns `EnvironmentProviders`.

  <h3>Form Components</h3>

  <h4>SignInAuthFormComponent</h4>

  Selector: `fui-sign-in-auth-form`

  Form component for email/password sign-in.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | signIn | `EventEmitter<UserCredential>` | Emitted when sign-in succeeds |
  | forgotPassword | `EventEmitter<void>` | Emitted when forgot password link is clicked |
  | signUp | `EventEmitter<void>` | Emitted when sign-up link is clicked |

  <h4>SignUpAuthFormComponent</h4>

  Selector: `fui-sign-up-auth-form`

  Form component for email/password sign-up.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | signUp | `EventEmitter<UserCredential>` | Emitted when sign-up succeeds |
  | signIn | `EventEmitter<void>` | Emitted when sign-in link is clicked |

  <h4>ForgotPasswordAuthFormComponent</h4>

  Selector: `fui-forgot-password-auth-form`

  Form component for password reset.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | passwordSent | `EventEmitter<void>` | Emitted when password reset email is sent |
  | backToSignIn | `EventEmitter<void>` | Emitted when back button is clicked |

  <h4>EmailLinkAuthFormComponent</h4>

  Selector: `fui-email-link-auth-form`

  Form component for email link authentication.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | emailSent | `EventEmitter<void>` | Emitted when sign-in link email is sent |
  | signIn | `EventEmitter<UserCredential>` | Emitted when sign-in succeeds (via link or MFA) |

  <h4>PhoneAuthFormComponent</h4>

  Selector: `fui-phone-auth-form`

  Form component for phone number authentication.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | signIn | `EventEmitter<UserCredential>` | Emitted when phone verification succeeds |

  <h4>MultiFactorAuthAssertionFormComponent</h4>

  Selector: `fui-multi-factor-auth-assertion-form`

  Form component for multi-factor authentication assertion during sign-in.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | onSuccess | `EventEmitter<UserCredential>` | Emitted when MFA assertion succeeds |

  <h4>SmsMultiFactorAssertionFormComponent</h4>

  Selector: `fui-sms-multi-factor-assertion-form`

  Form component for SMS-based multi-factor authentication assertion.

  | Input | Type | Description |
  |-------|:----:|-------------|
  | hint | `MultiFactorInfo` | The MFA hint for SMS verification |

  | Output | Type | Description |
  |--------|:----:|-------------|
  | onSuccess | `EventEmitter<UserCredential>` | Emitted when SMS MFA assertion succeeds |

  <h4>SmsMultiFactorAssertionPhoneFormComponent</h4>

  Selector: `fui-sms-multi-factor-assertion-phone-form`

  Phone number form component for SMS MFA assertion.

  <h4>SmsMultiFactorAssertionVerifyFormComponent</h4>

  Selector: `fui-sms-multi-factor-assertion-verify-form`

  Verification code form component for SMS MFA assertion.

  <h4>TotpMultiFactorAssertionFormComponent</h4>

  Selector: `fui-totp-multi-factor-assertion-form`

  Form component for TOTP-based multi-factor authentication assertion.

  | Input | Type | Description |
  |-------|:----:|-------------|
  | hint | `MultiFactorInfo` | The MFA hint for TOTP verification |

  | Output | Type | Description |
  |--------|:----:|-------------|
  | onSuccess | `EventEmitter<UserCredential>` | Emitted when TOTP MFA assertion succeeds |

  <h3>Screen Components</h3>

  <h4>SignInAuthScreenComponent</h4>

  Selector: `fui-sign-in-auth-screen`

  Screen component for email/password sign-in.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | signIn | `EventEmitter<UserCredential>` | Emitted when sign-in succeeds |
  | signUp | `EventEmitter<void>` | Emitted when sign-up link is clicked |

  <h4>SignUpAuthScreenComponent</h4>

  Selector: `fui-sign-up-auth-screen`

  Screen component for email/password sign-up.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | signUp | `EventEmitter<UserCredential>` | Emitted when sign-up succeeds |
  | signIn | `EventEmitter<void>` | Emitted when sign-in link is clicked |

  <h4>ForgotPasswordAuthScreenComponent</h4>

  Selector: `fui-forgot-password-auth-screen`

  Screen component for password reset.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | passwordSent | `EventEmitter<void>` | Emitted when password reset email is sent |
  | backToSignIn | `EventEmitter<void>` | Emitted when back button is clicked |

  <h4>EmailLinkAuthScreenComponent</h4>

  Selector: `fui-email-link-auth-screen`

  Screen component for email link authentication.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | emailSent | `EventEmitter<void>` | Emitted when sign-in link email is sent |
  | signIn | `EventEmitter<UserCredential>` | Emitted when sign-in succeeds |

  <h4>PhoneAuthScreenComponent</h4>

  Selector: `fui-phone-auth-screen`

  Screen component for phone number authentication.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | signIn | `EventEmitter<UserCredential>` | Emitted when phone verification succeeds |

  <h4>OAuthScreenComponent</h4>

  Selector: `fui-oauth-screen`

  Screen component for OAuth provider sign-in.

  | Output | Type | Description |
  |--------|:----:|-------------|
  | onSignIn | `EventEmitter<UserCredential>` | Emitted when OAuth sign-in succeeds |

  <h3>OAuth Components</h3>

  <h4>OAuthButtonComponent</h4>

  Selector: `fui-oauth-button`

  Generic OAuth button component.

  | Input | Type | Description |
  |-------|:----:|-------------|
  | provider | `AuthProvider` | Firebase Auth provider instance |

  <h4>GoogleSignInButtonComponent</h4>

  Selector: `fui-google-sign-in-button`

  Google OAuth sign-in button component.

  <h4>AppleSignInButtonComponent</h4>

  Selector: `fui-apple-sign-in-button`

  Apple OAuth sign-in button component.

  <h4>FacebookSignInButtonComponent</h4>

  Selector: `fui-facebook-sign-in-button`

  Facebook OAuth sign-in button component.

  <h4>GithubSignInButtonComponent</h4>

  Selector: `fui-github-sign-in-button`

  GitHub OAuth sign-in button component.

  <h4>MicrosoftSignInButtonComponent</h4>

  Selector: `fui-microsoft-sign-in-button`

  Microsoft OAuth sign-in button component.

  <h4>TwitterSignInButtonComponent</h4>

  Selector: `fui-twitter-sign-in-button`

  Twitter OAuth sign-in button component.

  <h3>UI Components</h3>

  <h4>ButtonComponent</h4>

  Selector: `button[fui-button]`

  Button component with variant support.

  | Input | Type | Description |
  |-------|:----:|-------------|
  | variant | `"primary" \| "secondary" \| "outline"?` | Button style variant |

  <h4>CardComponent</h4>

  Selector: `fui-card`

  Card container component.

  <h4>CardHeaderComponent</h4>

  Selector: `fui-card-header`

  Card header component.

  <h4>CardTitleComponent</h4>

  Selector: `fui-card-title`

  Card title component.

  <h4>CardSubtitleComponent</h4>

  Selector: `fui-card-subtitle`

  Card subtitle component.

  <h4>CardContentComponent</h4>

  Selector: `fui-card-content`

  Card content component.

  <h4>CountrySelectorComponent</h4>

  Selector: `fui-country-selector`

  Country selector component for phone number input.

  | Input | Type | Description |
  |-------|:----:|-------------|
  | value | `CountryCode` | Selected country code |

  | Output | Type | Description |
  |--------|:----:|-------------|
  | valueChange | `EventEmitter<CountryCode>` | Emitted when country selection changes |

  <h4>DividerComponent</h4>

  Selector: `fui-divider`

  Divider component.

  <h4>PoliciesComponent</h4>

  Selector: `fui-policies`

  Component that renders terms of service and privacy policy links. Automatically rendered when policies are provided via `provideFirebaseUIPolicies`.

  <h4>RedirectErrorComponent</h4>

  Selector: `fui-redirect-error`

  Component that displays redirect errors from Firebase UI authentication flow.

  <h4>ContentComponent</h4>

  Selector: `fui-content`

  Content wrapper component.

  <h3>Injection Functions</h3>

  <h4>injectUI</h4>

  Injects the Firebase UI configuration as a read-only signal.

  Returns `ReadonlySignal<FirebaseUI>`.

  <h4>injectRedirectError</h4>

  Injects the redirect error from the UI store as a signal.

  Returns `Signal<string \| undefined>`.

  <h4>injectTranslation</h4>

  Injects a translated string for a given category and key.

  | Argument | Type | Description |
  |----------|:----:|-------------|
  | category | `string` | The translation category |
  | key | `string` | The translation key |

  Returns `Signal<string>`.

  <h4>injectSignInAuthFormSchema</h4>

  Injects a Zod schema for sign-in form validation.

  Returns `Signal<ZodObject>` with `email` and `password` fields.

  <h4>injectSignUpAuthFormSchema</h4>

  Injects a Zod schema for sign-up form validation.

  Returns `Signal<ZodObject>` with `email`, `password`, and optionally `displayName` fields.

  <h4>injectForgotPasswordAuthFormSchema</h4>

  Injects a Zod schema for forgot password form validation.

  Returns `Signal<ZodObject>` with `email` field.

  <h4>injectEmailLinkAuthFormSchema</h4>

  Injects a Zod schema for email link authentication form validation.

  Returns `Signal<ZodObject>` with `email` field.

  <h4>injectPhoneAuthFormSchema</h4>

  Injects a Zod schema for phone number input form validation.

  Returns `Signal<ZodObject>` with `phoneNumber` field.

  <h4>injectPhoneAuthVerifyFormSchema</h4>

  Injects a Zod schema for phone verification code form validation.

  Returns `Signal<ZodObject>` with `verificationId` and `verificationCode` fields.

  <h4>injectMultiFactorPhoneAuthNumberFormSchema</h4>

  Injects a Zod schema for multi-factor phone authentication number form validation.

  Returns `Signal<ZodObject>` with `phoneNumber` and `displayName` fields.

  <h4>injectMultiFactorPhoneAuthAssertionFormSchema</h4>

  Injects a Zod schema for multi-factor phone authentication assertion form validation.

  Returns `Signal<ZodObject>` with `phoneNumber` field.

  <h4>injectMultiFactorPhoneAuthVerifyFormSchema</h4>

  Injects a Zod schema for multi-factor phone authentication verification form validation.

  Returns `Signal<ZodObject>` with `verificationId` and `verificationCode` fields.

  <h4>injectMultiFactorTotpAuthNumberFormSchema</h4>

  Injects a Zod schema for multi-factor TOTP authentication form validation.

  Returns `Signal<ZodObject>` with `displayName` field.

  <h4>injectMultiFactorTotpAuthVerifyFormSchema</h4>

  Injects a Zod schema for multi-factor TOTP verification code form validation.

  Returns `Signal<ZodObject>` with `verificationCode` field.

  <h4>injectRecaptchaVerifier</h4>

  Injects a reCAPTCHA verifier instance.

  | Argument | Type | Description |
  |----------|:----:|-------------|
  | element | `() => ElementRef<HTMLDivElement>` | Function that returns the element reference where reCAPTCHA should be rendered |

  Returns `Signal<RecaptchaVerifier \| null>`.

  <h4>injectPolicies</h4>

  Injects the policy configuration.

  Returns `PolicyConfig \| null`.

  <h4>injectCountries</h4>

  Injects the list of countries for country selector.

  Returns `Signal<CountryData[]>`.

  <h4>injectDefaultCountry</h4>

  Injects the default country for country selector.

  Returns `Signal<CountryData>`.

</details>

## Bring your own UI

The Firebase UI library is designed in a way which enables you to easily bring your own UI, or even framework, and still gain the benefits of what Firebase UI offers.

### Screens vs Forms

In Firebase UI, a "Screen" is an opinionated UI view which provides specific styling and layout, for example Screens provide a maximum width, are centered, within a card containing padding, a title and description.

If you are building an application quickly or want an opinionated view, Screens work great. However, if you have constrained requirements (perhaps an existing login page), you can instead use Forms.

Forms are less opinionated, and only contain the relevant logic required to function. For example, for a sign-in page, the "Sign in form" only includes the email, password and submit button form fields. A Form will fill its parent's width, allowing you to add a Form to any existing UI screens. Typically, Firebase UI screens are simply composed of surrounding UI logic and the form itself.

Every supported platform follows this principle, thus you can easily swap out a Screen for a Form if required. For example with React:

```diff
-  import { SignInAuthScreen } from '@invertase/firebaseui-react';
+  import { SignInAuthForm } from '@invertase/firebaseui-react';
```

## Building your own UI

Whether you're using a (currently) unsupported framework such as Svelte, SolidJS or Vue, you can still use Firebase UI to build your own UI.

### `FirebaseUIStore`

The `initializeUI` function returns a `FirebaseUIStore` - a framework agnostic [reactive store](https://github.com/nanostores/nanostores) which allows you to subscribe to changes to the UI instance, such as state or locale updates:

```ts
const ui = initializeUI({
  app,
});

// Subscribe to UI changes
ui.listen((ui) => {
  console.log('State changed', ui.state); // loading | pending | idle
  console.log('Current locale', ui.locale);
  console.log('MFA Assertion', ui.multiFactorResolver); 
});

// Update the store
store.setKey('state', 'loading');
```

The reactive store allows you to easily add states to your application, such as disabling buttons, checking for MFA assertions and more.

### Core package

The `@invertase/firebaseui-core` exports functionality which is directly tied to Firebase UI. Some of these functions mimic the Firebase JS SDK (with added benefits), whereas others are specifically for Firebase UI.

For example, let's use the `signInWithEmailAndPassword` function:

```ts
import { signInWithEmailAndPassword } from '@invertase/firebaseui-core';

await signInWithEmailAndPassword(ui.get(), 'test@test.com', '123456');
```

This API is almost the same as the [Firebase JS SDK](https://firebase.google.com/docs/reference/js/auth?_gl=1*rb4770*_up*MQ..*_ga*MTE2NzQ1NDU4MC4xNzYyNzgzNTA0*_ga_CW55HF8NVT*czE3NjI3ODM1MDMkbzEkZzAkdDE3NjI3ODM1MDMkajYwJGwwJGgw#signinwithemailandpassword_21ad33b) functionality, however instead provides a stable `FirebaseUI` instance from our `FirebaseUIStore`.

However internally, Firebase UI will additionally handle the following:

1. Setting the UI state to `pending` (allowing you to modify any UI (e.g. disabled states)).
2. Automatically triggering any [behaviors](#behaviors), for example automatically upgrading an anonymous user to account.
3. Automatically link any pending credentials (in the event an [account exists with a different credential](https://firebase.google.com/docs/auth/web/google-signin#handling-account-exists-with-different-credential-errors)).
4. Automatically catch any errors thrown from Firebase, handling `account-exists-with-different-credential` errors and any multi-factor assertions which are triggered (see below).
5. Automatically provide a `FirebaseUIError`, which returns a translated error message based on the configured locale.
6. Sets the UI state back to `idle` once the flow has completed.

All of the functionality within Firebase UI flows a similar logic flow. See the [Reference API](#reference) for more details on all of the available functionality.

### Multi-factor assertions

As mentioned above, Firebase UI will automatically capture MFA errors, and provide you with the [`MultiFactorResolver`](https://firebase.google.com/docs/reference/js/auth.multifactorresolver?_gl=1*163rwe5*_up*MQ..*_ga*NDEwODIyMDY5LjE3NjI3ODM2OTQ.*_ga_CW55HF8NVT*czE3NjI3ODM2OTQkbzEkZzAkdDE3NjI3ODM2OTQkajYwJGwwJGgw) to handle the assertion:

```ts
ui.listen((ui) => {
  if (ui.multiFactorResolver) {
    // Show a MFA assertion flow
  }
});
```

The core package additionally exposes a `signInWithMultiFactorAssertion` function for signing the user in with one of their enrolled factors.



