# Firebase UI Translations

This document provides context for the `@firebase-ui/translations` package.

## Overview

The `@firebase-ui/translations` package provides the localization and internationalization (i18n) capabilities for the Firebase UI for Web library. It contains the translation strings for various languages and exports utilities to register and use different locales.

This package is a core dependency of `@firebase-ui/core`, which uses it to display all user-facing text, such as labels, messages, and errors.

## Usage

The primary way to use this package is to import a pre-registered locale and pass it to the `initializeUI` function from the `@firebase-ui/core` package.

```typescript
import { initializeUI } from "@firebase-ui/core";
import { enUs } from "@firebase-ui/translations";
import { firebaseApp } from "./firebase";

const ui = initializeUI({
  app: firebaseApp,
  locale: enUs, // Use the English (US) locale
});
```

## Structure of a Locale

A registered locale is an object containing the locale code and the translation strings. The translations are organized into four categories:

-   `errors`: Error messages (e.g., "Incorrect password").
-   `messages`: General messages (e.g., "Password reset email sent successfully").
-   `labels`: UI element labels (e.g., "Email Address", "Sign In").
-   `prompts`: Prompting text (e.g., "Don't have an account?").

## Available Languages

Currently, the following locale is available out-of-the-box:

-   `enUs`: English (United States)

## Advanced Usage

### Contributing Translations

To contribute a new language, you can create a new locale file and register it using the `registerLocale` function. This function takes the locale code and the translation object as arguments.

**Example: Registering a custom French locale**

1.  **Create the translation file (`fr.ts`):**

    ```typescript
    import { type Translations } from "@firebase-ui/translations";

    export const fr: Translations = {
      errors: {
        userNotFound: "Aucun compte trouvé avec cette adresse e-mail",
        // ... other translations
      },
      // ... messages, labels, prompts
    };
    ```

2.  **Register and use the locale:**

    ```typescript
    import { initializeUI } from "@firebase-ui/core";
    import { registerLocale } from "@firebase-ui/translations";
    import { fr } from "./fr"; // Your custom locale file

    const frFr = registerLocale("fr-FR", fr);

    const ui = initializeUI({
      // ...
      locale: frFr,
    });
    ```

### Using Fallback Locales

The `registerLocale` function accepts an optional third argument: a `fallback` locale. This is useful when you want to create a regional variation of a language without redefining every string. If a translation key is not found in the primary locale, the system will search for it in the fallback locale.

**Example: Creating a British English (`en-GB`) locale with `en-US` as a fallback.**

1.  **Create a partial translation file (`en-gb.ts`):**

    ```typescript
    // en-gb.ts
    import { type Translations } from "@firebase-ui/translations";

    // Only define the strings you want to override.
    export const enGB: Partial<Translations> = {
      labels: {
        emailAddress: "Email address", // Lowercase 'a'
      },
    };
    ```

2.  **Register the locale with a fallback:**

    ```typescript
    import { initializeUI } from "@firebase-ui/core";
    import { registerLocale, enUs } from "@firebase-ui/translations";
    import { enGB } from "./en-gb";

    // Register en-GB, with en-US as the fallback.
    const enGb = registerLocale("en-GB", enGB, enUs);

    const ui = initializeUI({
      // ...
      locale: enGb,
    });

    // Now, `ui.strings.labels.emailAddress` will be "Email address",
    // but `ui.strings.labels.password` will be "Password" from the enUs fallback.
    ```
