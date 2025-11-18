# Testing Guide for FirebaseUI Web

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Test Types](#test-types)
6. [CI/CD](#cicd)
7. [Code Coverage](#code-coverage)
8. [Debugging Tests](#debugging-tests)
9. [Common Issues](#common-issues)
10. [Contributing](#contributing)

---

## Overview

### Testing Philosophy

FirebaseUI Web uses a comprehensive testing strategy to ensure reliability, security, and accessibility across all authentication flows. Our testing approach follows these principles:

- **Test Early, Test Often**: Write tests alongside feature development
- **Comprehensive Coverage**: Unit tests for logic, integration tests for workflows
- **Browser Compatibility**: Validate across multiple browsers and versions
- **Accessibility First**: Ensure UI is usable by everyone
- **Security Focus**: Prevent XSS, CSRF, and other vulnerabilities

### Testing Stack

- **Test Framework**: Google Closure Testing Framework (`goog.testing.jsunit`)
- **Test Runner**: Protractor 7.x with Selenium WebDriver
- **Assertion Library**: Jasmine-style assertions
- **Browsers**: Headless Chrome (local), SauceLabs (CI - multiple browsers)
- **Build System**: Gulp + Closure Compiler
- **CI Platform**: GitHub Actions

### Test Statistics

- **89+ test files** covering core functionality
- **100% handler coverage** (29/29 handlers tested)
- **96.6% page coverage** (28/29 UI pages tested)
- **94.1% utils coverage** (16/17 utility modules tested)

For detailed coverage analysis, see [TEST_COVERAGE_ANALYSIS.md](TEST_COVERAGE_ANALYSIS.md).

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Chrome browser (for local testing)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/firebase/firebaseui-web.git
cd firebaseui-web

# Install dependencies
npm install
```

### Running Tests Locally

#### Run All Tests

```bash
# Build the project and run all tests
npm test
```

This command will:
1. Build the FirebaseUI library (`npm run build`)
2. Generate test files (`npm run generate-test-files`)
3. Start a Selenium WebDriver server
4. Start a local HTTP server on port 4000
5. Run all Closure unit tests via Protractor
6. Report test results

#### Run Tests with Auto-Rebuild

```bash
# Start server and watch for changes (useful during development)
npm run serve
```

Then navigate to `http://localhost:4000/generated/` in your browser to see available test files.

#### Run Specific Tests

To run a specific test file, navigate to:
```
http://localhost:4000/generated/<path_to_test>_test.html
```

For example:
```
http://localhost:4000/generated/javascript/widgets/authui_test.html
```

#### Build Only

```bash
# Build the library without running tests
npm run build

# Build for all locales
npm run build-all
```

### Running Tests with SauceLabs

For cross-browser testing using SauceLabs:

```bash
# Set up SauceLabs credentials
export SAUCE_USERNAME=<your-username>
export SAUCE_ACCESS_KEY=<your-access-key>

# Start SauceConnect tunnel
./buildtools/sauce_connect.sh

# In another terminal, run tests
npm test -- --saucelabs --tunnelIdentifier=<tunnel-id>
```

---

## Test Structure

### Directory Organization

```
firebaseui-web/
├── javascript/
│   ├── data/
│   │   └── country_test.js           # Data module tests
│   ├── testing/
│   │   ├── auth_test.js              # Auth mock tests
│   │   ├── mockhelper_test.js        # Test helper tests
│   │   └── recaptchaverifier_test.js # reCAPTCHA mock tests
│   ├── ui/
│   │   ├── element/
│   │   │   ├── email_test.js         # UI element tests
│   │   │   ├── form_test.js
│   │   │   ├── *testhelper.js        # Test helper utilities
│   │   │   └── ...
│   │   ├── page/
│   │   │   ├── signin_test.js        # Page-level tests
│   │   │   ├── callback_test.js
│   │   │   └── ...
│   │   └── mdl_test.js               # MDL integration tests
│   ├── utils/
│   │   ├── storage_test.js           # Utility tests
│   │   ├── util_test.js
│   │   └── ...
│   └── widgets/
│       ├── authui_test.js            # Widget tests
│       ├── config_test.js
│       └── handler/
│           ├── signin_test.js        # Handler tests
│           ├── callback_test.js
│           └── ...
├── soy/
│   ├── elements_test.js              # Soy template tests
│   └── pages_test.js
├── buildtools/
│   ├── run_tests.sh                  # Test runner script
│   ├── generate_test_files.sh        # Test file generator
│   ├── gen_test_html.py              # HTML test wrapper generator
│   └── test_template.html            # HTML template for tests
├── generated/                        # Generated test files (gitignored)
│   ├── deps.js                       # Closure dependency file
│   ├── all_tests.js                  # All test paths
│   └── **/*_test.html                # Generated HTML test wrappers
├── protractor.conf.js                # Protractor configuration
└── protractor_spec.js                # Protractor test spec
```

### Test File Naming Convention

- **Test Files**: `*_test.js` (e.g., `authui_test.js`)
- **Test Helpers**: `*testhelper.js` (e.g., `emailtesthelper.js`)
- **Generated HTML**: `*_test.html` (auto-generated, not committed)

### Test Categories

1. **Unit Tests**: Test individual functions and classes in isolation
   - Utils: `javascript/utils/*_test.js`
   - Data: `javascript/data/*_test.js`

2. **Component Tests**: Test UI components
   - Elements: `javascript/ui/element/*_test.js`
   - Pages: `javascript/ui/page/*_test.js`

3. **Integration Tests**: Test complete workflows
   - Handlers: `javascript/widgets/handler/*_test.js`
   - Widgets: `javascript/widgets/*_test.js`

4. **Template Tests**: Test Soy templates
   - Templates: `soy/*_test.js`

---

## Writing Tests

### Basic Test Structure

Every test file follows this structure:

```javascript
/**
 * @fileoverview Tests for my_module.js
 */

goog.provide('firebaseui.auth.MyModuleTest');

goog.require('firebaseui.auth.MyModule');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.MyModuleTest');

// Test setup
function setUp() {
  // Initialize test fixtures
}

// Test teardown
function tearDown() {
  // Clean up test fixtures
}

// Test case
function testMyFunction() {
  var result = firebaseui.auth.MyModule.myFunction('input');
  assertEquals('expected', result);
}

// Async test case
function testAsyncOperation() {
  return firebaseui.auth.MyModule.asyncOperation()
    .then(function(result) {
      assertEquals('expected', result);
    });
}
```

### Writing Unit Tests

#### Example: Testing a Utility Function

```javascript
/**
 * @fileoverview Tests for email validation utility.
 */

goog.provide('firebaseui.auth.utils.EmailTest');

goog.require('firebaseui.auth.utils');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.utils.EmailTest');

function testIsValidEmail_validEmails() {
  var validEmails = [
    'user@example.com',
    'user.name@example.com',
    'user+tag@example.co.uk'
  ];

  validEmails.forEach(function(email) {
    assertTrue(
      'Expected ' + email + ' to be valid',
      firebaseui.auth.utils.isValidEmail(email)
    );
  });
}

function testIsValidEmail_invalidEmails() {
  var invalidEmails = [
    '',
    'invalid',
    'invalid@',
    '@example.com',
    'user@'
  ];

  invalidEmails.forEach(function(email) {
    assertFalse(
      'Expected ' + email + ' to be invalid',
      firebaseui.auth.utils.isValidEmail(email)
    );
  });
}
```

#### Example: Testing with Mocks

```javascript
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');

var mockControl;
var stubs;

function setUp() {
  mockControl = new goog.testing.MockControl();
  stubs = new goog.testing.PropertyReplacer();
}

function tearDown() {
  mockControl.$tearDown();
  stubs.reset();
}

function testWithMockedDependency() {
  // Create mock
  var mockAuth = mockControl.createStrictMock(firebase.auth.Auth);

  // Set expectations
  mockAuth.signInWithEmailAndPassword('user@example.com', 'password')
    .$returns(Promise.resolve({user: {uid: '123'}}));

  // Replay mock
  mockControl.$replayAll();

  // Test code that uses mock
  return myFunctionThatUsesAuth(mockAuth)
    .then(function(result) {
      assertEquals('123', result.uid);
      // Verify all expectations were met
      mockControl.$verifyAll();
    });
}
```

### Writing Component Tests

#### Example: Testing a UI Page

```javascript
/**
 * @fileoverview Tests for sign-in page.
 */

goog.provide('firebaseui.auth.ui.page.SignInTest');

goog.require('firebaseui.auth.ui.page.SignIn');
goog.require('goog.dom');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.ui.page.SignInTest');

var component;
var container;

function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new firebaseui.auth.ui.page.SignIn(
    function(email, password) {
      // Submit callback
    }
  );
  component.render(container);
}

function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}

function testInitialRender() {
  assertNotNull(component.getEmailElement());
  assertNotNull(component.getPasswordElement());
  assertNotNull(component.getSubmitButton());
}

function testEmailInput_validation() {
  var emailInput = component.getEmailElement();

  // Enter invalid email
  goog.dom.forms.setValue(emailInput, 'invalid');
  component.validateEmail_();

  // Check error is displayed
  assertNotNull(component.getEmailErrorElement());
  assertTrue(goog.dom.classlist.contains(
    component.getEmailErrorElement(),
    'firebaseui-error'
  ));
}

function testFormSubmission() {
  var submitted = false;
  component.onSubmit = function(email, password) {
    submitted = true;
    assertEquals('user@example.com', email);
    assertEquals('password123', password);
  };

  // Fill form
  goog.dom.forms.setValue(component.getEmailElement(), 'user@example.com');
  goog.dom.forms.setValue(component.getPasswordElement(), 'password123');

  // Submit form
  goog.testing.events.fireClickSequence(component.getSubmitButton());

  assertTrue('Form should be submitted', submitted);
}
```

### Writing Handler Tests

Handler tests verify complete authentication flows:

```javascript
/**
 * @fileoverview Tests for password sign-in handler.
 */

goog.provide('firebaseui.auth.widget.handler.handlePasswordSignInTest');

goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');

goog.setTestOnly('firebaseui.auth.widget.handler.handlePasswordSignInTest');

function testHandlePasswordSignIn_success() {
  // Set up mock app and container
  var app = new firebaseui.auth.AuthUI(mockAuth);
  var container = goog.dom.createDom(goog.dom.TagName.DIV);

  // Mock successful sign-in
  mockAuth.signInWithEmailAndPassword('user@example.com', 'password')
    .$returns(Promise.resolve({
      user: {uid: '123', email: 'user@example.com'}
    }));

  // Handle sign-in
  firebaseui.auth.widget.handler.handlePasswordSignIn(
    app,
    container,
    'user@example.com'
  );

  // Verify correct page is rendered
  assertPasswordSignInPage();

  // Submit form
  submitForm('user@example.com', 'password');

  // Verify success callback is called
  return testHelper.waitForCallback()
    .then(function(result) {
      assertEquals('123', result.user.uid);
    });
}
```

### Best Practices

#### 1. Test Naming

```javascript
// Good: Descriptive test names
function testEmailValidation_invalidFormat_showsError() { }
function testSignIn_withValidCredentials_succeeds() { }
function testPasswordReset_withExpiredCode_showsErrorMessage() { }

// Bad: Vague test names
function testEmail() { }
function testSignIn() { }
function test1() { }
```

#### 2. Arrange-Act-Assert Pattern

```javascript
function testUserRegistration() {
  // Arrange: Set up test data and mocks
  var email = 'user@example.com';
  var password = 'password123';
  mockAuth.createUserWithEmailAndPassword(email, password)
    .$returns(Promise.resolve({user: {uid: '123'}}));

  // Act: Execute the code under test
  return registerUser(email, password)

    // Assert: Verify the results
    .then(function(result) {
      assertEquals('123', result.uid);
      assertTrue(result.emailVerified);
    });
}
```

#### 3. Test One Thing at a Time

```javascript
// Good: Each test focuses on one behavior
function testEmailValidation_emptyEmail_showsError() {
  assertFalse(isValidEmail(''));
  assertEquals('Email is required', getErrorMessage());
}

function testEmailValidation_invalidFormat_showsError() {
  assertFalse(isValidEmail('invalid'));
  assertEquals('Invalid email format', getErrorMessage());
}

// Bad: Test tries to verify too many things
function testEmailValidation() {
  assertFalse(isValidEmail(''));
  assertFalse(isValidEmail('invalid'));
  assertTrue(isValidEmail('valid@example.com'));
  // ... 20 more assertions
}
```

#### 4. Use Test Helpers

```javascript
// Extract common setup logic to helpers
var testHelper = {
  createMockApp: function() {
    var app = new firebaseui.auth.AuthUI(mockAuth);
    app.setConfig(testConfig);
    return app;
  },

  renderComponent: function(component, container) {
    component.render(container);
    return component;
  },

  fillAndSubmitForm: function(email, password) {
    goog.dom.forms.setValue(emailInput, email);
    goog.dom.forms.setValue(passwordInput, password);
    goog.testing.events.fireClickSequence(submitButton);
  }
};
```

#### 5. Clean Up After Tests

```javascript
var component;
var container;
var stubs;

function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);
  stubs = new goog.testing.PropertyReplacer();
}

function tearDown() {
  // Dispose components
  if (component) {
    component.dispose();
  }

  // Remove DOM elements
  if (container) {
    goog.dom.removeNode(container);
  }

  // Reset stubs
  stubs.reset();
}
```

---

## Test Types

### Unit Tests

Unit tests verify individual functions and classes in isolation.

**Location**: `javascript/utils/`, `javascript/data/`

**Example**:
```javascript
function testFormatPhoneNumber_usNumber() {
  var result = firebaseui.auth.utils.formatPhoneNumber('+14155551234');
  assertEquals('+1 415-555-1234', result);
}
```

**When to Write**:
- Testing utility functions
- Testing data transformations
- Testing validation logic
- Testing business logic

### Integration Tests

Integration tests verify complete workflows across multiple components.

**Location**: `javascript/widgets/handler/`

**Example**:
```javascript
function testPasswordSignInFlow_complete() {
  // Start sign-in flow
  app.start(container);

  // Verify provider sign-in page
  assertProviderSignInPage();

  // Click email provider
  clickEmailProvider();

  // Verify password sign-in page
  assertPasswordSignInPage();

  // Submit credentials
  submitForm('user@example.com', 'password');

  // Verify callback
  return waitForCallback()
    .then(function(result) {
      assertTrue(result.user.emailVerified);
    });
}
```

**When to Write**:
- Testing authentication flows
- Testing page transitions
- Testing state management across components
- Testing error handling across layers

### Security Tests

Security tests prevent XSS, CSRF, and other vulnerabilities.

**See**: [SECURITY_TESTING.md](SECURITY_TESTING.md) for comprehensive guide

**Example**:
```javascript
function testEmailInput_xssPrevention() {
  var xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)'
  ];

  xssPayloads.forEach(function(payload) {
    goog.dom.forms.setValue(emailInput, payload);
    var result = component.checkAndGetEmail();

    // Should reject malicious input
    assertNull(result);
  });
}
```

**When to Write**:
- Testing user input handling
- Testing URL validation
- Testing content rendering
- Testing redirect flows

### Accessibility Tests

Accessibility tests ensure the UI is usable by everyone, including users with disabilities.

**See**: [ACCESSIBILITY_TESTING.md](ACCESSIBILITY_TESTING.md) for comprehensive guide

**Example**:
```javascript
function testSignInPage_keyboardNavigation() {
  component.render(container);

  var emailInput = component.getEmailElement();
  var passwordInput = component.getPasswordElement();
  var submitButton = component.getSubmitButton();

  // Tab through form
  emailInput.focus();
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.TAB);
  assertEquals(passwordInput, document.activeElement);

  goog.testing.events.fireKeySequence(passwordInput, goog.events.KeyCodes.TAB);
  assertEquals(submitButton, document.activeElement);

  // Submit with Enter key
  goog.testing.events.fireKeySequence(submitButton, goog.events.KeyCodes.ENTER);
  assertTrue('Form should submit', formSubmitted);
}

function testSignInPage_ariaLabels() {
  component.render(container);

  var emailInput = component.getEmailElement();
  assertNotNull(emailInput.getAttribute('aria-label'));
  assertEquals('Email', emailInput.getAttribute('aria-label'));

  var passwordInput = component.getPasswordElement();
  assertNotNull(passwordInput.getAttribute('aria-label'));
  assertEquals('Password', passwordInput.getAttribute('aria-label'));
}
```

**When to Write**:
- Testing keyboard navigation
- Testing screen reader support
- Testing ARIA attributes
- Testing focus management
- Testing color contrast

### Browser Compatibility Tests

Browser compatibility is tested automatically via SauceLabs in CI.

**Browsers Tested**: See `sauce_browsers.json`:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Various mobile browsers

**Running Locally**:
```bash
# Run with SauceLabs (requires credentials)
npm test -- --saucelabs
```

**Configuration**: `protractor.conf.js`, `sauce_browsers.json`

---

## CI/CD

### GitHub Actions Workflow

Tests run automatically on every push and pull request.

**Configuration**: `.github/workflows/test.yml`

**Workflow Steps**:
1. Checkout code
2. Setup Node.js 18
3. Cache node_modules
4. Install dependencies (`npm ci`)
5. Build and run tests locally (`npm test`)
6. Run tests on SauceLabs across multiple browsers

**Triggering CI**:
```bash
# Push to any branch
git push origin feature-branch

# Create pull request
gh pr create
```

### Test Results

**Local Tests**:
- Results printed to console
- HTML test pages show pass/fail in browser

**CI Tests**:
- View results in GitHub Actions tab
- SauceLabs results linked in workflow logs
- Failed tests block PR merging

### Required Checks

All tests must pass before merging:
- ✅ Local headless Chrome tests
- ✅ SauceLabs cross-browser tests
- ✅ Build succeeds without errors

---

## Code Coverage

### Current State

⚠️ **Code coverage metrics are not currently configured.**

See [TEST_COVERAGE_ANALYSIS.md](TEST_COVERAGE_ANALYSIS.md) for detailed analysis of test coverage by module.

### Future: Setting Up Coverage (Recommended)

To add code coverage tracking:

#### 1. Install Istanbul/nyc

```bash
npm install --save-dev nyc @istanbuljs/nyc-config-babel
```

#### 2. Configure nyc

Add to `package.json`:
```json
{
  "nyc": {
    "include": ["javascript/**/*.js"],
    "exclude": [
      "**/*_test.js",
      "**/testing/**",
      "**/*testhelper.js"
    ],
    "reporter": ["html", "text", "lcov"],
    "report-dir": "./coverage",
    "check-coverage": true,
    "lines": 80,
    "statements": 80,
    "functions": 80,
    "branches": 75
  }
}
```

#### 3. Update Test Script

```json
{
  "scripts": {
    "test": "npm run build && npm run generate-test-files && nyc ./buildtools/run_tests.sh",
    "test:coverage": "npm test && open coverage/index.html"
  }
}
```

#### 4. Generate Coverage Report

```bash
npm run test:coverage
```

### Interpreting Coverage Reports

**Coverage Metrics**:
- **Lines**: Percentage of code lines executed
- **Statements**: Percentage of statements executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of conditional branches taken

**Coverage Goals**:
- **Critical paths**: 90%+ (authentication, security)
- **Business logic**: 80%+ (handlers, utils)
- **UI components**: 70%+ (pages, elements)
- **Overall**: 80%+

**Uncovered Code**:
- May indicate dead code (can be removed)
- May indicate missing test cases (need tests)
- May be error handling for rare edge cases (document why untested)

---

## Debugging Tests

### Running Tests in Debug Mode

#### 1. Browser DevTools

```bash
# Start the test server
npm run serve

# Open in browser
open http://localhost:4000/generated/javascript/widgets/authui_test.html
```

Then:
1. Open Chrome DevTools (F12)
2. Navigate to Sources tab
3. Set breakpoints in test or source code
4. Reload page to debug

#### 2. Console Logging

```javascript
function testMyFunction() {
  var input = 'test';
  console.log('Input:', input);

  var result = myFunction(input);
  console.log('Result:', result);

  assertEquals('expected', result);
}
```

#### 3. Debugging Async Tests

```javascript
function testAsyncOperation() {
  return myAsyncFunction()
    .then(function(result) {
      console.log('Async result:', result);
      assertEquals('expected', result);
    })
    .catch(function(error) {
      console.error('Async error:', error);
      fail('Should not throw error');
    });
}
```

### Common Debugging Techniques

#### Isolate the Problem

```javascript
// Comment out other tests to run only the failing test
function testOnlyThis() {
  // failing test
}

// function testOther1() { }
// function testOther2() { }
```

#### Verify Setup

```javascript
function setUp() {
  console.log('setUp called');
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  console.log('Container created:', container);
  document.body.appendChild(container);
}
```

#### Check Async Timing

```javascript
function testWithDelay() {
  var asyncCompleted = false;

  setTimeout(function() {
    asyncCompleted = true;
  }, 100);

  // Wrong: Assertion runs immediately
  // assertTrue(asyncCompleted); // FAILS

  // Right: Wait for async operation
  return new Promise(function(resolve) {
    setTimeout(function() {
      assertTrue(asyncCompleted);
      resolve();
    }, 150);
  });
}
```

#### Inspect DOM State

```javascript
function testComponentRender() {
  component.render(container);

  // Inspect DOM structure
  console.log('Container HTML:', container.innerHTML);
  console.log('Email element:', component.getEmailElement());

  // Verify element exists
  assertNotNull('Email input should exist', component.getEmailElement());
}
```

### Debugging Protractor Tests

#### Enable Verbose Logging

In `protractor.conf.js`:
```javascript
config.seleniumArgs = ['-debug'];
config.allScriptsTimeout = 999999;
```

#### Pause Execution

```javascript
// In protractor_spec.js
browser.pause(); // Opens debugger REPL
```

#### Check Browser Logs

```javascript
browser.manage().logs().get('browser').then(function(logs) {
  console.log('Browser console logs:', logs);
});
```

---

## Common Issues

### Issue: Tests Timeout

**Symptoms**:
- Tests hang and eventually timeout
- "Timeout - Async callback was not invoked within timeout" error

**Causes**:
- Async test not returning Promise
- Infinite loop in code
- Waiting for event that never fires

**Solutions**:

```javascript
// Wrong: Async test without return
function testAsync() {
  myAsyncFunction().then(function() {
    assertTrue(true);
  });
}

// Right: Return the promise
function testAsync() {
  return myAsyncFunction().then(function() {
    assertTrue(true);
  });
}
```

### Issue: Flaky Tests

**Symptoms**:
- Tests pass sometimes, fail other times
- Different results on different browsers

**Causes**:
- Race conditions in async code
- Timing-dependent assertions
- Shared state between tests

**Solutions**:

```javascript
// Wrong: Timing-dependent assertion
function testAnimation() {
  component.animateIn();
  assertTrue(component.isVisible()); // May fail due to timing
}

// Right: Wait for animation to complete
function testAnimation() {
  component.animateIn();
  return component.waitForAnimation().then(function() {
    assertTrue(component.isVisible());
  });
}

// Right: Use MockClock for deterministic timing
function testWithMockClock() {
  var mockClock = new goog.testing.MockClock(true);

  component.delayedAction(); // Executes after 1000ms

  mockClock.tick(1000); // Advance time

  assertTrue(component.actionCompleted);

  mockClock.dispose();
}
```

### Issue: "Element not found" errors

**Symptoms**:
- `Cannot read property 'X' of null`
- Element lookups return null

**Causes**:
- Component not rendered before accessing elements
- Incorrect element selector
- Element removed from DOM

**Solutions**:

```javascript
// Wrong: Access element before render
function testComponent() {
  var component = new MyComponent();
  var element = component.getEmailElement(); // Returns null
}

// Right: Render first
function testComponent() {
  var component = new MyComponent();
  component.render(container);
  var element = component.getEmailElement(); // Returns element
  assertNotNull(element);
}
```

### Issue: Tests Pass Locally but Fail in CI

**Symptoms**:
- All tests pass on your machine
- Same tests fail on GitHub Actions

**Causes**:
- Browser differences (Chrome versions)
- Timing differences (CI is slower)
- Environment differences (ports, URLs)

**Solutions**:

1. **Check browser version**:
   ```bash
   google-chrome --version
   ```

2. **Run with same configuration as CI**:
   ```bash
   # Use headless Chrome like CI does
   npm test
   ```

3. **Check CI logs**:
   - View GitHub Actions workflow logs
   - Check SauceLabs test results
   - Look for browser console errors

### Issue: Mock Not Working

**Symptoms**:
- Unexpected method called on mock
- Mock expectations not verified

**Causes**:
- Forgot to call `$replayAll()`
- Forgot to call `$verifyAll()`
- Mock type incorrect (strict vs. loose)

**Solutions**:

```javascript
function testWithMock() {
  var mockControl = new goog.testing.MockControl();
  var mockAuth = mockControl.createStrictMock(firebase.auth.Auth);

  // Set up expectations
  mockAuth.signOut().$returns(Promise.resolve());

  // IMPORTANT: Replay before using mock
  mockControl.$replayAll();

  // Use mock
  return mockAuth.signOut().then(function() {
    // IMPORTANT: Verify all expectations were met
    mockControl.$verifyAll();
  });
}
```

### Issue: "Build failed" Before Tests Run

**Symptoms**:
- Tests don't run
- Error in build process

**Causes**:
- Syntax error in code
- Missing dependency
- Closure Compiler error

**Solutions**:

1. **Check build directly**:
   ```bash
   npm run build
   ```

2. **Check for syntax errors**:
   - Look at terminal output
   - Compiler will show exact file and line

3. **Verify dependencies**:
   ```bash
   npm install
   ```

---

## Contributing

### Adding Tests for New Features

When adding a new feature, follow these steps:

#### 1. Write Tests First (TDD)

```javascript
// 1. Write failing test
function testNewFeature_success() {
  var result = myNewFeature('input');
  assertEquals('expected', result);
}

// 2. Run test (should fail)
// 3. Implement feature
// 4. Run test (should pass)
```

#### 2. Test File Checklist

When creating a new test file:

- [ ] Use `_test.js` suffix
- [ ] Include copyright header
- [ ] Use `goog.provide()` for test namespace
- [ ] Use `goog.require()` for dependencies
- [ ] Call `goog.setTestOnly()`
- [ ] Include `setUp()` if needed
- [ ] Include `tearDown()` if needed
- [ ] Document test purpose in fileoverview

**Template**:
```javascript
/**
 * Copyright 2024 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * ...
 */

/**
 * @fileoverview Tests for my_new_module.js
 */

goog.provide('firebaseui.auth.MyNewModuleTest');

goog.require('firebaseui.auth.MyNewModule');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.MyNewModuleTest');

function setUp() {
  // Setup code
}

function tearDown() {
  // Cleanup code
}

function testMyNewModule_basicFunctionality() {
  // Test code
}
```

#### 3. Generate HTML Wrapper

After creating `*_test.js`:

```bash
npm run generate-test-files
```

This generates `*_test.html` wrapper files.

#### 4. Run Your Tests

```bash
# Run all tests
npm test

# Or run just your test
npm run serve
# Then navigate to http://localhost:4000/generated/path/to/your_test.html
```

#### 5. Test Coverage Checklist

For each new feature, ensure you have:

- [ ] **Happy path tests**: Feature works as expected
- [ ] **Error cases**: Feature handles errors gracefully
- [ ] **Edge cases**: Empty input, null, undefined, extremes
- [ ] **Input validation**: Invalid input is rejected
- [ ] **Security**: XSS prevention, URL sanitization
- [ ] **Accessibility**: Keyboard navigation, ARIA attributes
- [ ] **Integration**: Feature works with other components

**Example**:
```javascript
// Happy path
function testEmailValidation_validEmail_returnsTrue() { }

// Error case
function testEmailValidation_networkError_showsMessage() { }

// Edge cases
function testEmailValidation_emptyEmail_returnsFalse() { }
function testEmailValidation_nullEmail_returnsFalse() { }
function testEmailValidation_veryLongEmail_handlesGracefully() { }

// Input validation
function testEmailValidation_maliciousInput_sanitized() { }

// Security
function testEmailValidation_xssAttempt_rejected() { }
```

### Testing Best Practices

1. **Keep tests simple**: Each test should verify one behavior
2. **Use descriptive names**: Test name should describe what is being tested
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Avoid test interdependence**: Tests should not depend on execution order
5. **Clean up properly**: Use `tearDown()` to prevent test pollution
6. **Test behavior, not implementation**: Focus on what code does, not how
7. **Use test helpers**: Extract common setup to helper functions
8. **Document complex tests**: Add comments explaining non-obvious test logic

### Code Review Checklist

Before submitting a PR:

- [ ] All new code has corresponding tests
- [ ] Tests follow naming conventions
- [ ] Tests pass locally (`npm test`)
- [ ] Tests pass in CI (GitHub Actions)
- [ ] Test coverage is adequate (see checklist above)
- [ ] Security tests added for user input handling
- [ ] Accessibility tests added for UI changes
- [ ] Tests are well-documented

### Getting Help

- **Documentation**:
  - [TEST_COVERAGE_ANALYSIS.md](TEST_COVERAGE_ANALYSIS.md)
  - [SECURITY_TESTING.md](SECURITY_TESTING.md)
  - [ACCESSIBILITY_TESTING.md](ACCESSIBILITY_TESTING.md)
  - [CONTRIBUTING.md](CONTRIBUTING.md)

- **Ask Questions**:
  - Open a GitHub Discussion
  - File an issue with "question" label

- **Report Issues**:
  - File bug report on GitHub Issues
  - Include test output and environment details

---

## Additional Resources

### Closure Testing Documentation

- [Closure Library Testing](https://google.github.io/closure-library/api/goog.testing.html)
- [jsUnit Style Guide](https://google.github.io/closure-library/api/goog.testing.jsunit.html)
- [MockControl](https://google.github.io/closure-library/api/goog.testing.MockControl.html)

### Protractor Documentation

- [Protractor API](https://www.protractortest.org/#/api)
- [Locators](https://www.protractortest.org/#/locators)
- [Debugging](https://www.protractortest.org/#/debugging)

### Jasmine Documentation

- [Jasmine Introduction](https://jasmine.github.io/tutorials/your_first_suite)
- [Matchers](https://jasmine.github.io/api/edge/matchers.html)

### Related Documentation

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Material Design Lite](https://getmdl.io/)

---

## Appendix

### Test Assertions Reference

Common assertion methods:

```javascript
// Equality
assertEquals(expected, actual);
assertNotEquals(expected, actual);

// Truthiness
assertTrue(condition);
assertFalse(condition);

// Nullness
assertNull(value);
assertNotNull(value);
assertUndefined(value);
assertNotUndefined(value);

// Objects
assertObjectEquals(expected, actual);
assertArrayEquals(expected, actual);

// Exceptions
assertThrows(function() {
  // code that should throw
});

// Ranges
assertRoughlyEquals(expected, actual, tolerance);

// Failure
fail('Custom failure message');
```

### Mock Methods Reference

```javascript
var mockControl = new goog.testing.MockControl();

// Create mocks
var strictMock = mockControl.createStrictMock(Constructor);
var looseMock = mockControl.createLooseMock(Constructor);

// Set expectations
mock.method(arg1, arg2).$returns(returnValue);
mock.method(arg1, arg2).$throws(error);
mock.method(arg1, arg2).$does(function() { });
mock.method().$times(3); // Expect 3 calls
mock.method().$atLeastOnce();

// Control flow
mockControl.$replayAll();  // Start using mocks
mockControl.$verifyAll();  // Verify expectations met
mockControl.$resetAll();   // Reset for reuse
mockControl.$tearDown();   // Clean up
```

### Common Test Patterns

#### Testing Promises

```javascript
function testPromise() {
  return myPromiseFunction()
    .then(function(result) {
      assertEquals('expected', result);
    });
}
```

#### Testing Events

```javascript
function testButtonClick() {
  var clicked = false;

  goog.events.listen(button, goog.events.EventType.CLICK, function() {
    clicked = true;
  });

  goog.testing.events.fireClickSequence(button);

  assertTrue('Button should be clicked', clicked);
}
```

#### Testing with Fake Timer

```javascript
function testDelayedAction() {
  var mockClock = new goog.testing.MockClock(true);
  var executed = false;

  setTimeout(function() {
    executed = true;
  }, 1000);

  assertFalse('Should not execute yet', executed);

  mockClock.tick(1000);

  assertTrue('Should execute after delay', executed);

  mockClock.dispose();
}
```

---

**Last Updated**: 2025-11-18
**Version**: 1.0.0

For questions or improvements to this documentation, please open an issue or pull request.
