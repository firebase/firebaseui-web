# @invertase/firebaseui-react

This package contains the React components for the FirebaseUI.

## Installation

Install the package from NPM:

```bash
npm install @invertase/firebaseui-react
```

## Usage

### Importing styles

To use the components, you need to import the styles from the `@invertase/firebaseui-styles` package.

If using Tailwind CSS, you can import the styles directly into your project.

```css
@import "tailwindcss";
@import "@invertase/firebaseui-styles/src/base.css";
```

Alternatively, you can import the fully compiled CSS file into your project.

```tsx
import "@invertase/firebaseui-styles/dist.css";
```

### Initializing the UI

First, initalize the Firebase JS SDK:

```tsx
import { initializeApp } from "firebase/app";

const app = initializeApp({ ... });
```

Then, initialize the FirebaseUI with the configuration:

```tsx
import { initializeUI } from "@invertase/firebaseui-react";

const ui = initializeUI({
  app,
});
```

Finally, wrap your app in the `ConfigProvider` component:

```tsx
import { ConfigProvider } from "@invertase/firebaseui-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider config={ui}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
```

### Importing components

To use the components, you need to import the components from the `@invertase/firebaseui-react` package.

```tsx
import { SignInAuthScreen, GoogleSignInButton } from "@invertase/firebaseui-react";

function App() {
  return (
    <SignInAuthScreen>
      <GoogleSignInButton />
    </SignInAuthScreen>
  );
}
```
