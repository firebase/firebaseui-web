# FirebaseUI for Web

This repository contains the source code for the FirebaseUI for Web project rewrite, focused on providing Authentication components for popular JavaScript frameworks.

## Installation

FirebaseUI requires the `firebase` package to be installed:

```bash
npm install firebase
```

**Note**: Since the packages are not yet published to npm, you must manually install them from GitHub releases. Once published, these steps will be simplified.

###  Framework-specific Installation

Packages have been created for both `React` and `Angular`. For now, they're only available as direct downloads from this repository. Add the following to your `package.json` file:

<details>
  <summary>React</summary>

```json
{
  "dependencies": {
    "@firebase-ui/react": "https://github.com/firebase/firebaseui-web/raw/refs/heads/v7-alpha/releases/firebase-ui-react-0.0.1.tgz",
    "@firebase-ui/core": "https://github.com/firebase/firebaseui-web/raw/refs/heads/v7-alpha/releases/firebase-ui-core-0.0.1.tgz",
    "@firebase-ui/styles": "https://github.com/firebase/firebaseui-web/raw/refs/heads/v7-alpha/releases/firebase-ui-styles-0.0.1.tgz",
    "@firebase-ui/translations": "https://github.com/firebase/firebaseui-web/raw/refs/heads/v7-alpha/releases/firebase-ui-translations-0.0.1.tgz"
  }
}
```

</details>

<details>
  <summary>Angular</summary>

FirebaseUI for Angular depends on the [AngularFire](https://github.com/angular/angularfire) package:

```json
{
  "dependencies": {
    "@angular/fire": "^19.1.0",
    "@firebase-ui/angular": "https://github.com/firebase/firebaseui-web/raw/refs/heads/v7-alpha/releases/firebase-ui-angular-0.0.1.tgz",
    "@firebase-ui/core": "https://github.com/firebase/firebaseui-web/raw/refs/heads/v7-alpha/releases/firebase-ui-core-0.0.1.tgz",
    "@firebase-ui/styles": "https://github.com/firebase/firebaseui-web/raw/refs/heads/v7-alpha/releases/firebase-ui-styles-0.0.1.tgz",
    "@firebase-ui/translations": "https://github.com/firebase/firebaseui-web/raw/refs/heads/v7-alpha/releases/firebase-ui-translations-0.0.1.tgz"
  }
}
```

</details>

## Getting Started

FirebaseUI requires that your Firebase app is setup following the [Getting Started with Firebase](https://firebase.google.com/docs/web/setup) flow for Web:

### Initialization

```ts
import { initializeApp } from 'firebase/app';

const app = initializeApp({ ... });
```

Next, setup and configure FirebaseUI, import the `initializeUI` function from `@firebase-ui/core`:

```ts
import { initializeUI } from "@firebase-ui/core";

const ui = initializeUI();
```

> To learn more about configuring FirebaseUI, view the [configuration](#configuration) section.

### Framework Setup

<details>
  <summary>React</summary>

FirebaseUI for React requires that your application be wrapped in the `ConfigProvider`, providing the initialized UI configuration. React expects the `FirebaseApp` instance be provided to the `initializeUI` configuration:

```tsx
import { initializeApp } from 'firebase/app';
import { initializeUI } from "@firebase-ui/core";
import { ConfigProvider } from '@firebase-ui/react';

const app = initializeApp({ .. });
const ui = initializeUI({ app });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider ui={ui}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
```

</details>

<details>
  <summary>Angular</summary>

FirebaseUI depends on [AngularFire](https://github.com/angular/angularfire) being configured to inject Firebase Auth into your Angular application. Additionally, the `provideFirebaseUI` function is required to inject FirebaseUI into your application:

```tsx
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirebaseUI } from '@firebase-ui/angular';
import { initializeUI } from '@firebase-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp({ .. })),
    provideAuth(() => getAuth()),
    provideFirebaseUI(() => initializeUI({}))
    ..
  ],
  ..
}
```

</details>

### Styling

Next, import the CSS styles for the FirebaseUI project.

If you are using [TailwindCSS](https://tailwindcss.com/), import the base CSS from the `@firebase-ui/styles` package after your Tailwind import:

```css
@import "tailwindcss";
@import "@firebase-ui/styles/src/base.css";
```

If you are not using Tailwind, import the distributable CSS in your project:

```css
@import "@firebase-ui/styles/dist.css";
```

To learn more about theming, view the [theming](#theming) section.

### Authentication Components

FirebaseUI provides a number of opinionated components designed to drop into your application which handle common user flows, such as signing in or registration.

### Sign-in

Allows users to sign in with an email and password:

<details>
  <summary>React</summary>

```tsx
import { SignInAuthScreen } from "@firebase-ui/react";

function App() {
  return <SignInAuthScreen />;
}
```

Props: `onForgotPasswordClick` / `onRegisterClick`

Additionally, allow the user to sign in with an OAuth provider by providing children:

```tsx
import { SignInAuthScreen, GoogleSignInButton } from "@firebase-ui/react";

function App() {
  return (
    <SignInAuthScreen>
      <GoogleSignInButton />
    </SignInAuthScreen>
  );
}
```

</details>

<details>
  <summary>Angular</summary>

```tsx
import { SignUpAuthScreenComponent } from "@firebase-ui/angular";

@Component({
  selector: "app-root",
  imports: [SignUpAuthScreenComponent],
  template: `<fui-sign-up-auth-screen></fui-sign-up-auth-screen>`,
})
export class AppComponent {}
```

</details>

## Configuration

The initializeUI function accepts an options object that allows you to customize FirebaseUI’s behavior.

### Type Definition

```js
type FirebaseUIConfigurationOptions = {
  app: FirebaseApp;
  locale?: Locale | undefined;
  translations?: RegisteredTranslations[] | undefined;
  behaviors?: Partial<Behavior<keyof BehaviorHandlers>>[] | undefined;
  recaptchaMode?: 'normal' | 'invisible' | undefined;
};
```

**App**: The initialized Firebase app instance. This is required.

**Locale**: Optional locale string to override the default language (e.g., 'en', 'fr', 'es').

**Translations**: Add or override translation strings for labels, prompts, and errors.

**Behaviors**: Customize UI behavior such as automatic sign-in or error handling.

**RecaptchaMode**:Set the reCAPTCHA mode for phone auth (default is 'normal').

## Theming

FirebaseUI provides a basic default theme out of the box, however the theme can be customized to match your application's design.

The package uses CSS Variables, which can be overridden in your application's CSS. Below is a list of all available variables:

```css
:root {
  /* The primary color is used for the button and link colors */
  --fui-primary: var(--color-black);
  /* The primary hover color is used for the button and link colors when hovered */
  --fui-primary-hover: --alpha(var(--fui-primary) / 85%);
  /* The primary surface color is used for the button text color */
  --fui-primary-surface: var(--color-white);
  /* The text color used for body text */
  --fui-text: var(--color-black);
  /* The muted text color used for body text, such as subtitles */
  --fui-text-muted: var(--color-gray-800);
  /* The background color of the cards */
  --fui-background: var(--color-white);
  /* The border color used for none input fields */
  --fui-border: var(--color-gray-200);
  /* The input color used for input fields */
  --fui-input: var(--color-gray-300);
  /* The error color used for error messages */
  --fui-error: var(--color-red-500);
  /* The radius used for the input fields */
  --fui-radius: var(--radius-sm);
  /* The radius used for the cards */
  --fui-radius-card: var(--radius-xl);
}
```

The default values are based on the [TailwindCSS](https://tailwindcss.com/docs/theme) theme variables. You can override these values with other TailwindCSS theme variables, or custom CSS values.

## FirebaseUI Core Integration

`@firebase-ui/core` is a framework-agnostic layer that manages the complete lifecycle of Firebase Authentication flows. It exposes a reactive store via nanostores that can be wrapped and adapted into any JavaScript framework such as React, Angular, Vue, Svelte, or SolidJS to name a few.

### What FirebaseUI Core Provides

- Manages Firebase Authentication flows (sign-in, sign-out, linking, etc.)

- Reactive UI state via [nanostores](https://github.com/nanostores/nanostores)

- Form schemas using [Zod](https://zod.dev/)

- Pluggable behaviors (e.g. autoAnonymousLogin)

- i18n and translations

- Error parsing and localization

#### Initialize the Core

Call initializeUI() with your Firebase app and configuration options:

```js
import { initializeUI } from '@firebase-ui/core';

const ui = initializeUI({
  app: firebaseApp,
  ..
});
```

Configuration Type:

```js
type FirebaseUIConfigurationOptions = {
  app: FirebaseApp;
  locale?: Locale | undefined;
  translations?: RegisteredTranslations[] | undefined;
  behaviors?: Partial<Behavior<keyof BehaviorHandlers>>[] | undefined;
  recaptchaMode?: 'normal' | 'invisible' | undefined;
};
```

#### Firebase Authentication Flows

**signInWithEmailAndPassword**: Signs in the user based on an email/password credential.

- _ui_: FirebaseUIConfiguration
- _email_: string
- _password_: string

**createUserWithEmailAndPassword**: Creates a user account based on an email/password credential.

- _ui_: FirebaseUIConfiguration
- _email_: string
- _password_: string

**signInWithPhoneNumber**: Signs in the user based on a provided phone number, using ReCaptcha to verify the sign-in.

- _ui_: FirebaseUIConfiguration
- _phoneNumber_: string
- _recaptchaVerifier_: string

**confirmPhoneNumber**: Verifies the phonenumber credential and signs in the user.

- _ui_: FirebaseUIConfiguration
- _confirmationResult_: [ConfirmationResult](https://firebase.google.com/docs/reference/node/firebase.auth.ConfirmationResult)
- _verificationCode_: string

**sendPasswordResetEmail**: Sends password reset instructions to an email account.

- _ui_: FirebaseUIConfiguration
- _email_: string

**sendSignInLinkToEmail**: Send an sign-in links to an email account.

- _ui_: FirebaseUIConfiguration
- _email_: string

**signInWithEmailLink**: Signs in with the user with the email link. If `autoUpgradeAnonymousCredential` then a pending credential will be handled.

- _ui_: FirebaseUIConfiguration
- _email_: string
- _link_: string

**signInAnonymously**: Signs in as an anonymous user.

- _ui_: FirebaseUIConfiguration

**signInWithOAuth**: Signs in with a provider such as Google via a redirect link. If `autoUpgradeAnonymousCredential` then the account will upgraded.

- _ui_: FirebaseUIConfiguration
- _provider_: [AuthProvider](https://firebase.google.com/docs/reference/node/firebase.auth.AuthProvider)

**completeEmailLinkSignIn**: Completes the signing process based on a user signing in with an email link.

- _ui_: FirebaseUIConfiguration
- _currentUrl_: string

#### Provide a Store via Context

Using the returned `FirebaseUIConfiguration`, it is reccomended to use local context/providers/dependency-injection to expose the FirebaseUIConfiguration to the application. Here is an example context wrapper which accepts the configuration as a `ui` parameter:

```js
/** Creates a framework-agnostic context for Firebase UI configuration **/
export function createFirebaseUIContext(initialConfig) {
  let config = initialConfig;
  const subscribers = new Set();

  return {
    /** Retrieve current config **/
    getConfig() {
      return config;
    },

    /** Update config and notify subscribers **/
    setConfig(newConfig) {
      config = newConfig;
      subscribers.forEach((callback) => callback(config));
    },

    /** Subscribe to config changes (for use in any framework) **/
    subscribe(callback) {
      subscribers.add(callback);
      /** Optionally call immediately with current config**/
      callback(config);
      return () => subscribers.delete(callback);
    },
  };
}
```

FirebaseUI Configuration Type:

```js
export type FirebaseUIConfiguration = {
  app: FirebaseApp,
  getAuth: () => Auth,
  setLocale: (locale: Locale) => void,
  state: FirebaseUIState,
  setState: (state: FirebaseUIState) => void,
  locale: Locale,
  translations: TranslationsConfig,
  behaviors: Partial<Record<BehaviorKey, BehaviorHandlers[BehaviorKey]>>,
  recaptchaMode: "normal" | "invisible",
};
```

Through this approach, you can now achieve global access to the FirebaseUI methods and state.

#### State Management

FirebaseUI Core provides built-in state management to track the current step in the authentication flow. This can be used to drive UI transitions, control rendering, or show progress indicators.

##### Available States

```js
type FirebaseUIState =
  | "loading"
  | "idle"
  | "signing-in"
  | "signing-out"
  | "linking"
  | "creating-user"
  | "sending-password-reset-email"
  | "sending-sign-in-link-to-email";
```

These represent the current phase of the user experience — such as waiting for input, submitting credentials, or linking accounts.

##### Updating State Manually

The core module automatically updates state based on auth activity, but you can also override it manually if needed:

```js
/** Set the UI state to "idle" **/
ui.setState("idle");
```

##### Reading State in Your App

In a component, you can access the current state through the FirebaseUI configuration:

```js
/** Sample: Framework-agnostic UI state management **/

/** Create a simple UI state store with an initial state **/
const uiStore = createUIStateStore({ state: "idle" });

uiStore.subscribe((ui) => {
  /** Replace `showSpinner` and `showMainApp` with your actual rendering logic **/
  if (ui.state === "signing-in") {
    showSpinner();
  } else {
    showMainApp();
  }
});
```

### Translations (i18n)

You can pass one or more translations to support localized strings.

```js
import { english } from "@firebase-ui/translations";

initializeUI({
  app,
  locale: "en",
  translations: [english],
});
```

To override or add your own strings:

```js
const customFr = {
  locale: "fr",
  translations: {
    errors: {
      invalidEmail: "Adresse e-mail invalide",
    },
  },
};
```

To use a string at runtime (e.g., in an error message):

```js
import { getTranslation } from "@firebase-ui/core";

const message = getTranslation(config, "errors", "unknownError");
```

**When multiple translation sets are passed, FirebaseUI merges them in order — allowing you to layer overrides on top of built-in language packs.**

### Form Schemas

FirebaseUI uses Zod to validate authentication forms. This ensures consistent, strongly typed, and localized error handling across form components.

Each schema can be used standalone or integrated into your custom forms. You can pass in a TranslationsConfig object to localize error messages.

#### Available Schemas

**createEmailFormSchema(translations?)**
Validates a sign-in or sign-up form using email and password.

- _email_: Must be a valid email address.

- _password_: Must be at least 8 characters.

```js
import { createEmailFormSchema } from "@firebase-ui/core";

const schema = createEmailFormSchema(translations);
```

**createForgotPasswordFormSchema(translations?)**
Validates the forgot password form.

- _email_: Must be a valid email address.

```js
const schema = createForgotPasswordFormSchema(translations);
```

**createEmailLinkFormSchema(translations?)**
Validates the email link authentication form.

- _email_: Must be a valid email address.

```js
const schema = createEmailLinkFormSchema(translations);
```

**createPhoneFormSchema(translations?)**
Validates the phone number authentication form using reCAPTCHA.

- _phoneNumber_: Must be a valid phone number with at least 10 digits.

- _verificationCode_: Optional, must be at least 6 digits if provided.

- _recaptchaVerifier_: Must be an instance of RecaptchaVerifier.

```js
const schema = createPhoneFormSchema(translations);
```

#### Handling Form Errors

Handling errors can be managed using [Zods parsing functions](http://zod.dev/basics?ref=ossgallery&id=handling-errors) such as `safeParse`

### Error Handling

The core library provides a function for handling errors.

#### handleFirebaseError()

```js
export function handleFirebaseError(
  ui: FirebaseUIConfiguration,
  error: any,
  opts?: {
    enableHandleExistingCredential?: boolean;
  }
)
```

This function will run through a series of checks to catch known Firebase errors:

1. `auth/account-exists-with-different-credential`: Checking the error code to see if an account already exists for the user. If `enableHandleExistingCredential` is enabled the library will update the local storage automtaically before throwing the error.

2. `FirebaseUIError`: Alternatively, a FirebaseUIError will be thrown with the appropriate code.
