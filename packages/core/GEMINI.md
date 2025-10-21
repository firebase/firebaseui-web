# Firebase UI Core

This document provides context for the `@firebase-ui/core` package.

## Overview

The `@firebase-ui/core` package is the framework-agnostic core of the Firebase UI for Web library. It provides a set of functions and utilities for building UIs with Firebase Authentication. The core package is designed to be used by framework-specific packages like `@firebase-ui/react` and `@firebase-ui/angular`, but it can also be used directly to build custom UIs.

## Usage

The main entry point to the core package is the `initializeUI` function. This function takes a configuration object and returns a `FirebaseUI` instance, which is a `nanostores` store that holds the configuration and state of the UI.

```typescript
import { initializeUI } from "@firebase-ui/core";
import { enUs } from "@firebase-ui/translations";
import { firebaseApp } from "./firebase";

const ui = initializeUI({
  app: firebaseApp,
  locale: enUs,
  behaviors: [
    // ...
  ],
});
```

The `FirebaseUI` instance can then be used to call the various authentication functions, such as `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, etc.

```typescript
import { initializeUI, signInWithEmailAndPassword } from "@firebase-ui/core";

const ui = initializeUI({
  // ... your config
});

async function signIn(email, password) {
  await signInWithEmailAndPassword(ui, email, password);
}
```

## Behaviors

Behaviors are a way to customize the functionality of the Firebase UI. They are functions that are executed at different points in the authentication process. For example, the `requireDisplayName` behavior can be used to require the user to enter a display name when signing up.

Behaviors are passed to the `initializeUI` function in the `behaviors` array.

```typescript
import { initializeUI, requireDisplayName } from "@firebase-ui/core";

const ui = initializeUI({
  // ...
  behaviors: [
    requireDisplayName(),
  ],
});
```

## State Management

The core package uses `nanostores` for state management. The `FirebaseUI` instance is a `nanostores` store that holds the configuration and state of the UI. The state can be one of the following:

*   `idle`: The UI is idle.
*   `pending`: The UI is waiting for an asynchronous operation to complete.
*   `loading`: The UI is loading.

The state can be accessed from the `state` property of the `FirebaseUI` instance.

```typescript
import { useStore } from "@nanostores/react";
import { ui } from "./firebase"; // assuming ui is exported from a firebase config file

function MyComponent() {
  const { state } = useStore(ui);

  if (state === "pending") {
    return <p>Loading...</p>;
  }

  return <p>Idle</p>;
}
```
