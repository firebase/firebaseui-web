# Firebase UI for Web

A library for building UIs with Firebase, with first class support for Angular and shad (with Shadcn).

## General rules

- The workspace is managed with pnpm. Always use pnpm commands for installation and execution.
- This is a monorepo, with `packages` and `examples` sub-directories.
- Linting is controlled by ESLint, via a root flatconfig `eslint.config.ts` file. Run `pnpm lint:check` for linting errors.
- Formatting is controlled vi Prettier integrated with ESLint via the `.prettierrc` file. Run `pnpm format:check` for formatting errors.
- The workspace uses pnpm cataloges to ensure dependency version alignment. If a dependency exists twice, it should be cataloged.
- Tests can be run for the entire workspace via `pnpm test` or scoped to a package via `test:<name>`.

## Structure

The project structure is setup in a way which provides a framework agnostic set of packages; `core`, `translations` and `styles`.

- `core`: The main entry-point to the package via `initalizeUI`. Firebase UI provides it's own functional exports, which when called wraps the Firebase JS SDK functionality, however manages state, translated error handling and behaviors (configurable by the user).
- `translations`: A package exporting utilities and translation mappings for various languages, which `core` depends on.
- `styles`: A package providing CSS utility classes which frameworks can use to provide consistent styling. The `styles` package works for existing Tailwind users, but also exports a distributable file with compiled "tailwindless" CSS. The CSS styles heavily depend on CSS variables for customization.

Additionally, framework specific packages depend on these agnostic packages to offer full integration with the frameworks:

- `react`: Exposes React UI components (in the form of screens, full page components, or forms, the bare-bones UI forms) & hooks, enabling users to easily build their own UIs or consume the built in ones.
- `angular`: Exposes Angular UI components (in the form of screens, full page components, or forms, the bare-bones UI forms) & DI functionality, enabling users to easily build their own UIs or consume the built in ones. This package depends directly on AngularFire.

The dependency graph is:

```
graph TD
  core --> angular;
  core --> react;
  core --> translations;
  angular --> styles;
  react --> styles;
  shadcn --> react;
```

## Misc

- All packages extend the same base `tsconfig.json` file.
- Where possible, prefer Vitest testing framework.

## Context

Additional context for packages available:

- `core`: @./packages/core/GEMINI.md
- `react`: @./packages/react/GEMINI.md
- `styles`: @./packages/styles/GEMINI.md
- `translations`: @./packages/translations/GEMINI.md
