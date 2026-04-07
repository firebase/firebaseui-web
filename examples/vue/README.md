# Vue + React (veaury)

This example demonstrates `@firebase-oss/ui-react` running inside a Vue 3 application using [veaury](https://github.com/devilwjp/veaury).

Rather than duplicating the React source, `src/react_app` is a symlink to `../react/src`. A thin wrapper component — `src/ReactRoot.tsx` — re-exports the full React route tree (the same `<BrowserRouter>`, `<FirebaseUIProvider>`, and screen routes as the React example) as a single React component. `App.vue` mounts it into the Vue app with `applyPureReactInVue(ReactRoot)`.

## How it works

```
App.vue
  └─ applyPureReactInVue(ReactRoot)   ← veaury bridges Vue → React
       └─ ReactRoot.tsx               ← BrowserRouter + FirebaseUIProvider + routes
            └─ react_app/            ← symlink to examples/react/src
```

Vite is configured with veaury's `type: "react"` mode, which restricts the Vue JSX transform to inline JSX inside `.vue` script blocks and sends all standalone `.tsx`/`.jsx` files through the React plugin. 

## Running

```bash
pnpm dev
```
