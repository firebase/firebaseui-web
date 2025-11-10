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

## Theming

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



