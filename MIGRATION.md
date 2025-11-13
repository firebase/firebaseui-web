# Migration Guide

## Overview

FirebaseUI for Web has been completely rewritten from the ground up. The previous version (v6) was a single JavaScript package that provided a monolithic authentication UI solution. The new version (v7) represents a modern, modular architecture that separates concerns and provides better flexibility for developers.

### Architecture Changes

**Previous Version (v6):**
- Single JavaScript package (`firebaseui`) that handled both authentication logic and UI rendering
- Tightly coupled to DOM manipulation and jQuery-like patterns
- Limited customization options
- Framework-agnostic but with a rigid structure

**New Version (v7):**
- **Framework-agnostic core package** (`@invertase/firebaseui-core`): Contains all authentication logic, state management, behaviors, and utilities without any UI dependencies
- **Framework-specific packages**: Separate packages for React (`@invertase/firebaseui-react`), Angular (`@invertase/firebaseui-angular`), and Shadcn components
- **Supporting packages**: Separate packages for styles (`@invertase/firebaseui-styles`) and translations (`@invertase/firebaseui-translations`)
- **Composable architecture**: Components are designed to be composed together, allowing for greater flexibility
- **Modern patterns**: Uses reactive stores (nanostores), TypeScript throughout, and modern framework patterns

### Migration Path

**Important:** There is no direct migration path from v6 to v7. This is a complete rewrite with a fundamentally different architecture and API. You cannot simply update the package version and expect your existing code to work.

Instead, you will need to:
1. Remove the old `firebaseui` package
2. Install the appropriate new package(s) for your framework
3. Rewrite your authentication UI components using the new API
4. Update your configuration and styling approach

### What This Guide Covers

This migration guide maps features and concepts from the old [v6 version](https://github.com/firebase/firebaseui-web/tree/v6) to the new v7 rewrite, helping you understand:
- How authentication methods translate between versions
- How configuration options map to the new behaviors system
- How UI customization works in the new architecture
- How to achieve similar functionality with the new component-based approach

## Migrating

### 1. Installing Packages

First, remove the old `firebaseui` package and install the appropriate new package(s) for your framework:

<details>
  <summary>React</summary>

  Remove the old package:
  ```bash
  npm uninstall firebaseui
  ```

  Install the new React package:
  ```bash
  npm install @invertase/firebaseui-react
  ```

  The package automatically includes the core package as a dependency, so you don't need to install `@invertase/firebaseui-core` separately.
</details>

<details>
  <summary>Angular</summary>

  Remove the old package:
  ```bash
  npm uninstall firebaseui
  ```

  Install the new Angular package:
  ```bash
  npm install @invertase/firebaseui-angular
  ```

  **Note:** The Angular package requires [AngularFire](https://github.com/angular/angularfire) to be installed and configured first.
</details>

<details>
  <summary>Shadcn</summary>

  Remove the old package:
  ```bash
  npm uninstall firebaseui
  ```

  Ensure you have [installed and setup](https://ui.shadcn.com/docs/installation) Shadcn in your project first.

  Add the Firebase UI registry to your `components.json`:
  ```json
  {
    ...
    "registries": {
      "@firebase": "https://fir-ui-shadcn-registry.web.app/r/{name}.json"
    }
  }
  ```

  Then add components as needed:
  ```bash
  npx shadcn@latest add @firebase/sign-in-auth-screen
  ```

  This will automatically install all required dependencies.
</details>

### 2. Initialization

The initialization process is fundamentally different between v6 and v7.

**Old Way (v6):**
```javascript
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
```

**New Way (v7):**

<details>
  <summary>React</summary>

  ```tsx
  import { initializeApp } from 'firebase/app';
  import { initializeUI } from '@invertase/firebaseui-core';
  import { FirebaseUIProvider } from '@invertase/firebaseui-react';

  const app = initializeApp({ ... });

  const ui = initializeUI({
    app,
    // behaviors and other configuration go here
  });

  function App() {
    return (
      <FirebaseUIProvider ui={ui}>
        {/* Your app components */}
      </FirebaseUIProvider>
    );
  }
  ```
</details>

<details>
  <summary>Angular</summary>

  ```ts
  import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
  import { initializeUI } from '@invertase/firebaseui-core';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideFirebaseApp(() => initializeApp({ ... })),
      provideFirebaseUI((apps) => initializeUI({ 
        app: apps[0],
        // behaviors and other configuration go here
      })),
    ]
  };
  ```
</details>

<details>
  <summary>Shadcn</summary>

  ```tsx
  import { initializeApp } from 'firebase/app';
  import { initializeUI } from '@invertase/firebaseui-core';
  import { FirebaseUIProvider } from '@invertase/firebaseui-react';

  const app = initializeApp({ ... });

  const ui = initializeUI({
    app,
    // behaviors and other configuration go here
  });

  function App() {
    return (
      <FirebaseUIProvider ui={ui}>
        {/* Your app components */}
      </FirebaseUIProvider>
    );
  }
  ```
</details>

### 3. Configuration Options Migration

The following table maps v6 configuration options to their v7 equivalents:

| v6 Option | Required | Migration Guide |
|----------|:--------:|------------------|
| `autoUpgradeAnonymousUsers` | No | **Use the `autoUpgradeAnonymousUsers` behavior.**<br/><br/>```ts<br/>import { autoUpgradeAnonymousUsers } from '@invertase/firebaseui-core';<br/><br/>const ui = initializeUI({<br/>  app,<br/>  behaviors: [autoUpgradeAnonymousUsers({<br/>    async onUpgrade(ui, oldUserId, credential) {<br/>      // Handle account merge logic<br/>    }<br/>  })],<br/>});<br/>```<br/><br/>The `onUpgrade` callback replaces the `signInFailure` callback for handling merge conflicts. |
| `callbacks` | No | **Use component props instead.**<br/><br/>v6 callbacks like `signInSuccessWithAuthResult`, `signInFailure`, etc. are replaced by component event handlers:<br/><br/>- `onSignIn={(user) => { ... }}` on screen components<br/>- `onSignUp={(user) => { ... }}` on screen components<br/>- `onForgotPasswordClick={() => { ... }}` on form components<br/><br/>These are passed directly to the components you use, giving you more control over the flow. |
| `credentialHelper` | No | **Not directly supported.**<br/><br/>The credential helper (Account Chooser) feature from v6 is not available in v7. If you need similar functionality, you'll need to implement it yourself using Firebase Auth's account linking features. |
| `queryParameterForSignInSuccessUrl` | No | **Handle in your routing logic.**<br/><br/>v7 doesn't have built-in URL parameter handling. Instead, handle redirects in your `onSignIn` callback:<br/><br/>```tsx<br/><SignInAuthScreen onSignIn={(user) => {<br/>  const urlParams = new URLSearchParams(window.location.search);<br/>  const redirectUrl = urlParams.get('signInSuccessUrl') || '/dashboard';<br/>  window.location.href = redirectUrl;<br/>}} /><br/>``` |
| `queryParameterForWidgetMode` | No | **Not applicable.**<br/><br/>v7 doesn't use widget modes. Instead, you explicitly render the components you need (e.g., `<SignInAuthScreen />`, `<SignUpAuthScreen />`, etc.) in your application. |
| `signInFlow` | No | **Use provider strategy behaviors.**<br/><br/>Replace `signInFlow: 'redirect'` with:<br/>```ts<br/>import { providerRedirectStrategy } from '@invertase/firebaseui-core';<br/><br/>behaviors: [providerRedirectStrategy()]<br/>```<br/><br/>Replace `signInFlow: 'popup'` with:<br/>```ts<br/>import { providerPopupStrategy } from '@invertase/firebaseui-core';<br/><br/>behaviors: [providerPopupStrategy()]<br/>```<br/><br/>**Note:** `popup` is the default strategy in v7. |
| `immediateFederatedRedirect` | No | **Control via component rendering.**<br/><br/>v7 doesn't have this option. Instead, you control whether to show OAuth buttons or redirect immediately by conditionally rendering components or using your routing logic. For example:<br/><br/>```tsx<br/>{singleProvider ? (<br/>  <Navigate to="/oauth-redirect" /><br/>) : (<br/>  <OAuthScreen onSignIn={handleSignIn} /><br/>)}<br/>``` |
| `signInOptions` | Yes | **Use OAuth button components directly.**<br/><br/>v6's `signInOptions` array is replaced by explicitly rendering the OAuth provider buttons you want:<br/><br/>```tsx<br/>import { <br/>  GoogleSignInButton,<br/>  FacebookSignInButton,<br/>  AppleSignInButton<br/>} from '@invertase/firebaseui-react';<br/><br/><OAuthScreen onSignIn={handleSignIn}><br/>  <GoogleSignInButton onSignIn={handleSignIn} /><br/>  <FacebookSignInButton onSignIn={handleSignIn} /><br/>  <AppleSignInButton onSignIn={handleSignIn} /><br/></OAuthScreen><br/>```<br/><br/>The order you place the buttons determines their display order. |
| `signInSuccessUrl` | No* | **Handle in `onSignIn` callback.**<br/><br/>Instead of a configuration option, handle redirects in your component's `onSignIn` callback:<br/><br/>```tsx<br/><SignInAuthScreen onSignIn={(user) => {<br/>  window.location.href = '/dashboard';<br/>}} /><br/>```<br/><br/>*Required in v6 when `signInSuccessWithAuthResult` callback is not used or returns `true`. |
| `tosUrl` | Yes | **Pass via `policies` prop.**<br/><br/>**React:**<br/>```tsx<br/><FirebaseUIProvider <br/>  ui={ui} <br/>  policies={{<br/>    termsOfServiceUrl: 'https://example.com/tos',<br/>    privacyPolicyUrl: 'https://example.com/privacy'<br/>  }}<br/>><br/>```<br/><br/>**Angular:**<br/>```ts<br/>provideFirebaseUIPolicies(() => ({<br/>  termsOfServiceUrl: 'https://example.com/tos',<br/>  privacyPolicyUrl: 'https://example.com/privacy'<br/>}))<br/>```<br/><br/>The policies are automatically rendered in auth forms and screens. |
| `privacyPolicyUrl` | Yes | **Pass via `policies` prop.**<br/><br/>See `tosUrl` above - both URLs are passed together in the `policies` object. |
| `adminRestrictedOperation` | No | **Handle in your UI logic.**<br/><br/>v7 doesn't have built-in support for this GCIP-specific feature. You'll need to:<br/><br/>1. Check if sign-up is disabled in your Firebase project settings<br/>2. Handle the `auth/admin-restricted-operation` error in your error handling<br/>3. Display appropriate messaging to users when sign-up attempts are blocked<br/><br/>You can check for this error in your `onSignUp` or form error handlers and display custom UI accordingly. |
