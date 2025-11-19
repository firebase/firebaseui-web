# Firebase UI React

This document provides context for the `@firebase-oss/ui-react` package.

## Overview

The `@firebase-oss/ui-react` package provides a set of React components and hooks to integrate Firebase UI for Web into a React application. It builds on top of `@firebase-oss/ui-core` and `@firebase-oss/ui-styles` to provide a seamless integration with the React ecosystem.

The package offers two main ways to build your UI:

1.  **Pre-built Components**: A set of ready-to-use components for common authentication screens (e.g., Sign In, Register).
2.  **Hooks**: A collection of React hooks that provide access to the underlying UI state and authentication logic, allowing you to build fully custom UIs.

## Setup

To use the React package, you must first initialize Firebase UI using `initializeUI` from the core package, and then wrap your application with the `FirebaseUIProvider`.

```tsx
// In your main App.tsx or a similar entry point

import { initializeUI } from "@firebase-oss/ui-core";
import { enUs } from "@firebase-oss/ui-translations";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import { firebaseApp } from "./firebase"; // Your firebase config

// 1. Initialize the UI
const ui = initializeUI({
  app: firebaseApp,
  locale: enUs,
  // ... other configurations
});

function App() {
  // 2. Wrap your app in the provider
  return (
    <FirebaseUIProvider ui={ui}>
      {/* Your application components */}
      <SignInScreen />
    </FirebaseUIProvider>
  );
}
```

## Pre-built Components

The package includes several pre-built "screen" components for a quick setup. These components render a full-page authentication form.

**Example: Sign-In Screen**

```tsx
import { SignInScreen } from "@firebase-oss/ui-react";

function MySignInPage() {
  return <SignInScreen />;
}
```

Other available components include `RegisterScreen`, `ForgotPasswordScreen`, etc.

## Hooks

Hooks are the recommended way to build a custom user interface.

### `useUI()`

The main hook is `useUI()`. It returns the entire UI state object from the underlying `nanostores` store. This gives you access to the current `state` (`idle`, `pending`, `error`), any `error` messages, and the `auth` instance.

**Example: Custom Button**

```tsx
import { useUI } from "@firebase-oss/ui-react";
import { signInWithEmailAndPassword } from "@firebase-oss/ui-core";

function CustomSignInButton() {
  const ui = useUI();

  const handleClick = () => {
    // Functions from @firebase-oss/ui-core require the `ui` instance
    signInWithEmailAndPassword(ui, "user@example.com", "password");
  };

  return (
    <button onClick={handleClick} disabled={ui.state === "pending"}>
      {ui.state === "pending" ? "Signing in..." : "Sign In"}
    </button>
  );
}
```

### Other Hooks

The package also provides other specialized hooks:

-   `useSignInAuthFormSchema()`: Returns a Zod schema for sign-in form validation.
-   `useSignUpAuthFormSchema()`: Returns a Zod schema for sign-up form validation.
-   `useRecaptchaVerifier()`: A hook to easily integrate a reCAPTCHA verifier.
