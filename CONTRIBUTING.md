# Contributing to FirebaseUI Web

Thank you for your interest in contributing to FirebaseUI Web! We appreciate your help in making authentication and UI components easier for Firebase developers worldwide. This document provides comprehensive guidelines for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Making Changes](#making-changes)
6. [Testing](#testing)
7. [Code Style and Standards](#code-style-and-standards)
8. [Commit Messages](#commit-messages)
9. [Pull Request Process](#pull-request-process)
10. [Documentation](#documentation)
11. [Performance Considerations](#performance-considerations)
12. [Security Guidelines](#security-guidelines)
13. [Browser Compatibility](#browser-compatibility)
14. [Troubleshooting](#troubleshooting)

## Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our Code of Conduct:

- **Be Respectful**: Treat all community members with respect and courtesy. Disagreements are natural, but they should be handled professionally and constructively.
- **Be Inclusive**: We welcome contributions from people of all backgrounds and experience levels. Ensure your language and behavior are inclusive.
- **Be Professional**: Keep discussions focused on the project and maintain a professional tone. Harassment, discrimination, or offensive behavior will not be tolerated.
- **Report Issues**: If you witness or experience unacceptable behavior, please report it to the Firebase team through appropriate channels.

## Getting Started

### Prerequisites

Before you begin contributing, ensure you have the following installed:

- **Node.js**: Version 14.0.0 or higher (check with `node --version`)
- **npm**: Version 6.0.0 or higher (check with `npm --version`)
- **Git**: For version control (check with `git --version`)
- **TypeScript**: Familiarity with TypeScript is helpful but not required
- **Firebase Account**: A Firebase project for testing (create one at https://console.firebase.google.com/)

### Forking and Cloning

1. Fork the FirebaseUI Web repository by clicking the "Fork" button on GitHub.
2. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/firebaseui-web.git
   cd firebaseui-web
   ```
3. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/firebase/firebaseui-web.git
   ```

### Verifying Your Setup

After cloning, verify that everything is working:

```bash
npm install
npm run build
npm run test
```

If all commands execute successfully, you're ready to contribute!

## Development Setup

### Installation

1. Install all dependencies:
   ```bash
   npm install
   ```

2. The project uses the following development tools:
   - **TypeScript**: For static typing
   - **Webpack**: For module bundling
   - **Karma**: For test running
   - **Jasmine**: For testing framework
   - **ESLint**: For code linting
   - **Prettier**: For code formatting

### Building the Project

To build the project:

```bash
npm run build
```

This compiles TypeScript files and generates distribution bundles in the `dist/` directory.

### Development Server

For development with hot reload:

```bash
npm run serve
```

This starts a development server where you can test your changes in real-time.

### Available Scripts

- `npm run build`: Build the project for production
- `npm run serve`: Start development server
- `npm run test`: Run the test suite
- `npm run test:watch`: Run tests in watch mode
- `npm run lint`: Lint code using ESLint
- `npm run lint:fix`: Automatically fix linting issues
- `npm run format`: Format code using Prettier
- `npm run clean`: Remove build artifacts

## Project Structure

Understanding the project layout is essential for efficient contributions:

```
firebaseui-web/
├── src/                           # Source code
│   ├── ui/                        # UI components
│   ├── auth/                      # Authentication logic
│   ├── storage/                   # State and storage utilities
│   └── [feature-modules]/         # Feature-specific modules
├── dist/                          # Compiled output (generated)
├── npm-module/                    # NPM package configuration
├── public/                        # Static assets
├── test/                          # Test files
├── javascript/                    # JavaScript examples and integrations
├── .husky/                        # Git hooks
├── webpack.config.js              # Webpack configuration
├── tsconfig.json                  # TypeScript configuration
├── karma.conf.js                  # Karma test runner config
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc.js                 # Prettier configuration
└── package.json                   # Project dependencies
```

### Key Directories

**src/ui/**: Contains UI components like account chooser, password recovery, signin page, etc.

**src/auth/**: Contains authentication-related utilities and managers.

**test/**: Contains unit tests and integration tests for all features.

**javascript/**: Contains example implementations and integrations.

## Making Changes

### Creating a Feature Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names that follow this pattern:
- `feature/short-description` - For new features
- `fix/short-description` - For bug fixes
- `docs/short-description` - For documentation improvements
- `refactor/short-description` - For refactoring
- `test/short-description` - For test improvements
- `perf/short-description` - For performance improvements

### Development Workflow

1. **Create your branch**: `git checkout -b feature/my-feature`
2. **Make your changes**: Edit files as needed
3. **Run tests locally**: `npm run test`
4. **Run linter**: `npm run lint`
5. **Format code**: `npm run format`
6. **Commit your changes**: Follow commit message guidelines (see below)
7. **Push to your fork**: `git push origin feature/my-feature`
8. **Create a Pull Request**: Describe your changes clearly

### Guidelines for Code Changes

- **Keep changes focused**: Each pull request should address a single concern.
- **Update related files**: If you modify a feature, update relevant tests and documentation.
- **Avoid breaking changes**: Maintain backward compatibility unless explicitly approved.
- **Add comments**: Document complex logic or non-obvious code.
- **Remove dead code**: Don't commit commented-out code or unused imports.
- **Follow existing patterns**: Maintain consistency with the codebase style.

## Testing

### Understanding the Test Suite

The FirebaseUI Web project uses a comprehensive testing strategy:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how components work together
- **UI Tests**: Test user interface behavior and rendering

### Writing Tests

When adding new features, you must include tests. Follow these guidelines:

1. **Test Location**: Place tests in the `test/` directory with the same structure as `src/`.
2. **File Naming**: Name test files with `.test.ts` or `.spec.ts` suffix.
3. **Test Structure**: Use Jasmine's describe/it syntax.

Example test structure:

```typescript
describe('MyComponent', () => {
  let component: MyComponent;

  beforeEach(() => {
    component = new MyComponent();
  });

  afterEach(() => {
    // Cleanup
  });

  it('should initialize with default values', () => {
    expect(component.value).toBe(0);
  });

  it('should update value when setValue is called', () => {
    component.setValue(10);
    expect(component.value).toBe(10);
  });

  it('should handle edge cases correctly', () => {
    component.setValue(-1);
    expect(component.value).toBe(0); // or your expected behavior
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run specific test file
npm run test -- path/to/specific.test.ts
```

### Test Coverage

Maintain or improve test coverage with your changes:

```bash
# Check coverage report
npm run test -- --coverage
```

Aim for high coverage, especially for:
- Core authentication logic
- UI components
- Utility functions
- Public APIs

### Testing Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how it does it.
2. **Use descriptive test names**: Test names should clearly describe what is being tested.
3. **Keep tests isolated**: Tests should not depend on other tests or share state.
4. **Mock external dependencies**: Use mocks for Firebase SDK and other external services.
5. **Test error cases**: Include tests for error handling and edge cases.
6. **Keep tests fast**: Avoid unnecessary delays or long-running operations.

## Code Style and Standards

### TypeScript Standards

- Use strict TypeScript mode (`strict: true` in tsconfig.json)
- Define types explicitly - avoid `any` type
- Use interfaces for complex object structures
- Use enums for fixed sets of values
- Export public APIs clearly

Example:

```typescript
// Good
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
}

export class AuthManager {
  private user: UserProfile | null = null;

  public getUser(): UserProfile | null {
    return this.user;
  }
}

// Avoid
export class AuthManager {
  private user: any = null;

  public getUser() {
    return this.user;
  }
}
```

### JavaScript/CSS Standards

- Use modern ES6+ syntax
- Avoid global variables - use modules
- Use meaningful variable and function names
- Write CSS that follows BEM (Block Element Modifier) naming convention
- Use flexbox and CSS Grid for layouts
- Ensure responsive design for mobile, tablet, and desktop

### Naming Conventions

- **Classes**: PascalCase (e.g., `AuthManager`, `SignInPage`)
- **Functions**: camelCase (e.g., `validateEmail`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`, `MAX_RETRIES`)
- **Private members**: Prefix with underscore (e.g., `_internalState`)
- **HTML/CSS classes**: kebab-case (e.g., `sign-in-form`, `error-message`)

### Linting and Formatting

All code must pass linting and formatting checks:

```bash
# Check linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format
```

Before committing, ensure your code passes these checks. Pre-commit hooks will automatically run these checks.

## Commit Messages

### Commit Message Format

Follow this format for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process, dependencies, or tools

### Scope

The scope specifies what part of the project is affected. Examples:

- `auth`: Authentication related
- `ui`: UI components
- `email-link`: Email link authentication
- `phone`: Phone authentication
- `reCAPTCHA`: reCAPTCHA integration
- `docs`: Documentation

### Subject

- Use imperative, present tense: "add" not "added" or "adds"
- Don't capitalize first letter
- No period (.) at the end
- Limit to 50 characters
- Be specific and descriptive

### Body

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with a blank line
- Include any breaking changes with a "BREAKING CHANGE:" prefix

### Footer

Include issue references:

```
Fixes #123
Closes #456
```

### Example Commit Messages

Good:
```
feat(auth): add biometric authentication support

Add fingerprint and face recognition authentication methods
for iOS and Android devices. This allows users to sign in
using biometric data instead of passwords.

Fixes #1234
```

Bad:
```
Fixed stuff
```

```
Update code
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. **Run all checks**:
   ```bash
   npm run lint
   npm run format
   npm run test
   npm run build
   ```

3. **Ensure tests pass**: All tests must pass before submitting.

### Creating a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature
   ```

2. Go to the repository on GitHub and click "New Pull Request".

3. Select your branch and provide a clear description following this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Changes Made
- Point 1
- Point 2
- Point 3

## Testing
Describe how you tested your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests passed locally with my changes
- [ ] Any dependent changes have been merged and published
```

### PR Review Process

- A maintainer will review your PR within a few business days
- Address feedback and suggestions promptly
- You may need to make revisions - that's completely normal
- Once approved, a maintainer will merge your PR
- Your contribution will be included in the next release

### Review Criteria

PRs are evaluated on:

- **Code quality**: Is the code well-written and maintainable?
- **Test coverage**: Are tests included and passing?
- **Documentation**: Is the change documented?
- **Performance**: Does the change impact performance negatively?
- **Backward compatibility**: Does it maintain compatibility?
- **Security**: Are there any security implications?

## Documentation

### Code Comments

Comment your code, especially:

- Complex algorithms or logic
- Non-obvious decisions
- Browser compatibility notes
- Performance considerations

```typescript
// Good - explains why
// We use a Set here for O(1) lookup time rather than
// an array which would be O(n)
const validUIDs = new Set(uids);

// Avoid - states the obvious
// This gets the user
const user = getUser();
```

### Updating Documentation Files

When you change functionality:

1. **Update README.md** if the change affects users
2. **Add JSDoc comments** for public APIs
3. **Update CHANGELOG** following semantic versioning
4. **Add inline comments** for complex logic
5. **Document breaking changes** clearly

### JSDoc Format

Use JSDoc for public APIs:

```typescript
/**
 * Authenticates a user with email and password.
 *
 * @param email - The user's email address
 * @param password - The user's password
 * @returns A promise that resolves with the user credential
 * @throws FirebaseError if authentication fails
 *
 * @example
 * ```
 * const credential = await auth.signInWithEmailAndPassword(
 *   'user@example.com',
 *   'password'
 * );
 * ```
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<UserCredential> {
  // Implementation
}
```

## Performance Considerations

### Guidelines

- **Bundle size**: Keep bundle size minimal. Lazy-load features when possible.
- **Rendering**: Minimize DOM reflows and repaints.
- **Memory**: Clean up event listeners and subscriptions.
- **Loading**: Load images and resources efficiently.
- **Caching**: Cache computationally expensive operations.

### Performance Checks

Before submitting a PR involving UI or computation:

1. Test with Chrome DevTools Performance tab
2. Check for memory leaks with DevTools Memory profiler
3. Verify no unnecessary re-renders
4. Ensure animations are smooth (60 FPS)

## Security Guidelines

### Security Best Practices

- **Never log sensitive data**: Don't log passwords, tokens, or keys
- **Sanitize user input**: Always validate and sanitize user-provided data
- **Use HTTPS**: Never make unencrypted network requests
- **Validate on the server**: Client-side validation is for UX, not security
- **Use secure libraries**: Use well-maintained, audited libraries
- **Keep dependencies updated**: Run `npm audit` and fix vulnerabilities

### Reporting Security Vulnerabilities

If you discover a security vulnerability:

1. **Do not create a public issue**
2. **Email security@firebase.google.com** with details
3. Include affected versions and potential impact
4. Wait for response before disclosing publicly

### Security Checklist

- [ ] No hardcoded secrets or API keys
- [ ] Input validation on all user input
- [ ] Proper error handling without exposing system details
- [ ] No use of `eval()` or dynamic code execution
- [ ] HTTPS/secure protocols used
- [ ] Dependencies scanned for vulnerabilities

## Browser Compatibility

### Supported Browsers

FirebaseUI Web supports:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Compatibility Testing

When adding features:

1. **Test in multiple browsers** using BrowserStack or similar
2. **Use polyfills** for newer JavaScript features if needed
3. **Check CSS compatibility** for older browsers
4. **Test responsive design** on various screen sizes
5. **Verify touch interactions** work on mobile

### Avoiding Compatibility Issues

- Use transpiled JavaScript (TypeScript helps here)
- Avoid browser-specific CSS without fallbacks
- Use feature detection, not user-agent detection
- Include polyfills for required functionality
- Test with browser DevTools device emulation

## Troubleshooting

### Common Issues

**Issue: Tests fail locally but pass in CI**

Solution: Ensure you're using the same Node.js version as CI. Check `.nvmrc` or `package.json` engines field.

**Issue: Linting errors when trying to commit**

Solution: Run `npm run lint:fix` to automatically fix issues, then commit again.

**Issue: Build fails with TypeScript errors**

Solution: Check for type errors with `npx tsc --noEmit`. Ensure all types are properly defined.

**Issue: Module not found errors**

Solution: Run `npm install` to ensure all dependencies are installed. Check for typos in import paths.

**Issue: Port already in use when running dev server**

Solution: Either kill the process using the port or specify a different port when starting the server.

### Getting Help

- **Read existing issues**: Search GitHub issues for similar problems
- **Check documentation**: Review the project's docs and examples
- **Ask on forums**: Post questions on Stack Overflow with `firebase` and `firebaseui` tags
- **Contact maintainers**: Open an issue if you can't find answers

## Conclusion

Thank you for considering a contribution to FirebaseUI Web! Your effort in improving this project is greatly appreciated. Whether you're fixing bugs, adding features, or improving documentation, you're helping make authentication simpler for developers worldwide.

If you have questions about the contribution process, please feel free to open an issue or reach out to the Firebase community. Happy coding!
