Want to contribute? Great! First, read this page (including the small print at
the end).

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [pnpm](https://pnpm.io/) - This workspace uses pnpm for package management

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/firebase/firebaseui-web.git
   cd firebaseui-web
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development Workflow

This is a monorepo managed with pnpm, containing both `packages` and `examples` sub-directories.

#### Building

Build all packages:

```bash
pnpm build
```

Build only the packages (excluding examples):

```bash
pnpm build:packages
```

#### Testing

Run all tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

Run tests for a specific package:

```bash
pnpm --filter=<package-name> run test
```

#### Linting and Formatting

Check for linting errors:

```bash
pnpm lint:check
```

Fix linting errors automatically:

```bash
pnpm lint:fix
```

Check for formatting issues:

```bash
pnpm format:check
```

Format code automatically:

```bash
pnpm format:write
```

### Project Structure

The project is organized as follows:

- **`packages/`**: Framework-agnostic and framework-specific packages
  - `core`: Framework-agnostic core package providing `initializeUI` and authentication functions
  - `translations`: Translation utilities and locale mappings
  - `styles`: CSS utility classes and compiled styles
  - `react`: React components and hooks
  - `angular`: Angular components and DI functionality
  - `shadcn`: Shadcn UI components

- **`examples/`**: Example applications demonstrating usage
  - `react`: React example
  - `nextjs`: Next.js example
  - `nextjs-ssr`: Next.js SSR example
  - `angular`: Angular example
  - `shadcn`: Shadcn example

The dependency graph:

```
core → translations
react → core
angular → core
react → styles
angular → styles
shadcn → react
```

### Additional Notes

- All packages extend the same base `tsconfig.json` file
- Vitest is the preferred testing framework
- The workspace uses pnpm catalogs to ensure dependency version alignment
- Linting is controlled by ESLint via a root flatconfig `eslint.config.ts` file
- Formatting is controlled by Prettier integrated with ESLint via the `.prettierrc` file

### Before you contribute

Before we can use your code, you must sign the [Google Individual Contributor
License Agreement](https://cla.developers.google.com/about/google-individual)
(CLA), which you can do online. The CLA is necessary mainly because you own the
copyright to your changes, even after your contribution becomes part of our
codebase, so we need your permission to use and distribute your code. We also
need to be sure of various other things—for instance that you'll tell us if you
know that your code infringes on other people's patents. You don't have to sign
the CLA until after you've submitted your code for review and a member has
approved it, but you must do it before we can put your code into our codebase.

### Adding new features

Before you start working on a larger contribution, you should get in touch with
us first through the issue tracker with your idea so that we can help out and
possibly guide you. Coordinating up front makes it much easier to avoid
frustration later on.

If this has been discussed in an issue, make sure to mention the issue number.
If not, go file an issue about this to make sure this is a desirable change.

If this is a new feature please co-ordinate with someone on
[FirebaseUI-Android](https://github.com/firebase/FirebaseUI-Android) and someone
on [FirebaseUI-iOS](https://github.com/firebase/FirebaseUI-iOS)
to make sure that we can implement this on all platforms and maintain feature
parity. Feature parity (where it makes sense) is a strict requirement for
feature development in FirebaseUI.

### Code reviews

All submissions, including submissions by project members, require review. We
use Github pull requests for this purpose. Please refer to the
[Style Guide](STYLEGUIDE.md) and ensure you respect it before submitting a PR.

### Releasing

See [`cloudbuild.yaml`](./cloudbuild.yaml) and [`publish.sh`](./publish.sh) for the full release process.

#### Experimental versions

All new commits to the main branch are published to npm under the `exp` tag.

#### Release versions

When a tag of the form `v1.0.0` is created, that version is published to npm under the `beta` tag.

### The small print

Contributions made by corporations are covered by a different agreement than the
one above, the [Software Grant and Corporate Contributor License
Agreement](https://cla.developers.google.com/about/google-corporate).
