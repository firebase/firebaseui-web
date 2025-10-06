
# Firebase UI for Web - Shadcn

> This package is private and not published to npm.

The `@firebase-ui/shadcn` package exposes React components via the [Shadcn Registy](https://ui.shadcn.com/docs/registry), allowing users
to take advantage of Firebase UI for Web logic but bringing their own UI via Shadcn.

To get started, add the `@firebase` registry [namespace](https://ui.shadcn.com/docs/registry/namespace) to your `components.json`:

```json
{
  // ...
  "registries": {
    "@firebase": "https://ui.firebase.com/{name}.json"
  }
}
```

Next install one of the registry components - this will automatically install the `@firebase-ui/react` for you,
alongwith adding any additionally required components.

```bash
npx shadcn@latest add @firebase/sign-up-auth-screen
```

Before consuming a component, ensure you have initalized your Firebase UI application:

```tsx
import { initalizeUI } from '@firebase-ui/core';
import { FirebaseUIProvider } from '@firebase-ui/react';
import { SignInAuthScreen } from '@/components/sign-in-auth-screen';

const ui = initalizeUI(...);

function App() {
  return (
    <FirebaseUIProvider ui={ui}>
      <SignInAuthScreen />
    </FirebaseUIProvider>
  );
}
```

## Building the registry

To build the registry, run the `build` script:

```
pnpm build
```

Note, the script run (`build.ts`) expects a domain, which replaces the `{{ DOMAIN }}` field within the 
`registy-spec.json`. This enables building the registry for different domains without updating the domain
in the actual `registry.json` file Shadcn expects.