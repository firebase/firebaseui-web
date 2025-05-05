# FirebaseUI for Web

This repository contains the source code for the FirebaseUI for Web project rewrite, focused on providing Authentication components for popular JavaScript frameworks.

## Installation

FirebaseUI requires the `firebase` package to be installed:

```bash
npm install firebase
```

**Note**: Since the packages are not yet published to npm, you must manually install them from GitHub releases. Once published, these steps will be simplified.

###  Framework-specific Installation

Packages have created for both `React` and `Angular`.

<details>
  <summary>React</summary>

  ```json
  {
    "dependencies": {
    "@firebase-ui/react": "https://github.com/firebase/firebaseui-web/releases/download/%40firebase-ui%2Freact%400.0.1/firebase-ui-react-0.0.1.tgz",  
    "@firebase-ui/core": "https://github.com/firebase/firebaseui-web/releases/download/%40firebase-ui%2Fcore%400.0.1/firebase-ui-core-0.0.1.tgz",
    "@firebase-ui/styles": "https://github.com/firebase/firebaseui-web/releases/download/%40firebase-ui%2Fstyles%400.0.1/firebase-ui-styles-0.0.1.tgz",
    "@firebase-ui/translations": "https://github.com/firebase/firebaseui-web/releases/download/%40firebase-ui%2Ftranslations%400.0.1/firebase-ui-translations-0.0.1.tgz",
    }
  }
  ```

  (Once published, this will be `npm install @firebase-ui/react`)

</details>

<details>
  <summary>Angular</summary>

  FirebaseUI for Angular depends on the [AngularFire](https://github.com/angular/angularfire) package:

  ```json
  {
    "dependencies": {
      "@firebase-ui/angular": "[path-to-repo/releases/firebase-ui-angular-0.0.1.tgz](https://github.com/firebase/firebaseui-web/releases/download/%40firebase-ui%2Fcore%400.0.1/firebase-ui-angular-0.0.1.tgz)",
      "@angular/fire": "^19.0.0"
      "@firebase-ui/core": "https://github.com/firebase/firebaseui-web/releases/download/%40firebase-ui%2Fcore%400.0.1/firebase-ui-core-0.0.1.tgz",
      "@firebase-ui/styles": "https://github.com/firebase/firebaseui-web/releases/download/%40firebase-ui%2Fstyles%400.0.1/firebase-ui-styles-0.0.1.tgz",
      "@firebase-ui/translations": "https://github.com/firebase/firebaseui-web/releases/download/%40firebase-ui%2Ftranslations%400.0.1/firebase-ui-translations-0.0.1.tgz",

    }
  }
  ```

  (Once published, this will be `npm install @firebase-ui/angular @angular/fire`)

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

  const app = initializeApp({ ... });
  const ui = initializeUI({ app });

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ConfigProvider config={ui}>
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
      provideFirebaseApp(() => initializeApp({ ... })),
      provideAuth(() => getAuth()),
      provideFirebaseUI(() => initializeUI({}))
      ...
    ],
    ...
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
  import { SignInAuthScreen } from '@firebase-ui/react';

  function App() {
    return <SignInAuthScreen />
  }
  ```

  Props: `onForgotPasswordClick` / `onRegisterClick`

  Additionally, allow the user to sign in with an OAuth provider by providing children:

  ```tsx
  import { SignInAuthScreen, GoogleSignInButton } from '@firebase-ui/react';

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
    selector: 'app-root',
    imports: [SignUpAuthScreenComponent],
    template: `<fui-sign-up-auth-screen></fui-sign-up-auth-screen>`,
  })
  export class AppComponent { }
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
