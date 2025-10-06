# Firebase UI for Web - Shadcn

## Building the registry

To build the registry, run the `build` script:

```
pnpm build
```

Note, the script run (`build.ts`) expects a domain, which replaces the `{{ DOMAIN }}` field within the 
`registy-spec.json`. This enables building the registry for different domains without updating the domain
in the actual `registry.json` file Shadcn expects.