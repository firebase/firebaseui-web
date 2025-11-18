# Accessibility Testing Guide for FirebaseUI Web

## Overview

This document provides comprehensive guidance on accessibility (a11y) testing for the FirebaseUI Web library. Ensuring our authentication UI is accessible to all users, including those with disabilities, is not just a legal requirement—it's the right thing to do.

## Why Accessibility Matters

- **15% of the world's population** lives with some form of disability
- **Legal requirements**: ADA (US), WCAG 2.1 AA (International), Section 508 (US Government)
- **Better UX for everyone**: Accessible design benefits all users
- **SEO benefits**: Search engines prefer accessible content

## Accessibility Standards

We aim to comply with:

- **WCAG 2.1 Level AA**: Web Content Accessibility Guidelines
- **ARIA 1.2**: Accessible Rich Internet Applications
- **Section 508**: US Federal accessibility requirements

## Testing Tools

### Automated Testing Tools

#### 1. axe-core (Recommended)

```bash
npm install --save-dev axe-core
```

```javascript
// In your test file
const { AxePuppeteer } = require('@axe-core/puppeteer');

async function testAccessibility() {
  const results = await new AxePuppeteer(page)
    .analyze();

  expect(results.violations).toHaveLength(0);

  if (results.violations.length > 0) {
    console.log('A11y violations:', JSON.stringify(results.violations, null, 2));
  }
}
```

#### 2. pa11y

```bash
npm install --save-dev pa11y
```

```javascript
const pa11y = require('pa11y');

async function runAccessibilityTest() {
  const results = await pa11y('http://localhost:4000/test-page.html');

  if (results.issues.length > 0) {
    console.log('Accessibility issues found:', results.issues);
  }
}
```

#### 3. WAVE (Web Accessibility Evaluation Tool)

Browser extension for manual testing:
- Chrome: https://chrome.google.com/webstore (search "WAVE Evaluation Tool")
- Firefox: https://addons.mozilla.org/firefox/ (search "WAVE")

### Manual Testing Tools

#### 1. Screen Readers

**NVDA (Windows - Free)**
- Download: https://www.nvaccess.org/
- Keyboard shortcuts:
  - Insert + Down Arrow: Read next item
  - Insert + Up Arrow: Read previous item
  - Insert + Space: Toggle focus/browse mode

**JAWS (Windows - Commercial)**
- Download: https://www.freedomscientific.com/products/software/jaws/
- Industry standard, most comprehensive

**VoiceOver (macOS - Built-in)**
- Activation: Cmd + F5
- Keyboard shortcuts:
  - VO + Right Arrow: Move to next item
  - VO + Left Arrow: Move to previous item
  - VO + Space: Activate item

**TalkBack (Android - Built-in)**
- Settings > Accessibility > TalkBack

**VoiceOver (iOS - Built-in)**
- Settings > Accessibility > VoiceOver

#### 2. Keyboard Testing

Test all functionality using only keyboard:

**Essential Keyboard Shortcuts:**
- **Tab**: Move to next focusable element
- **Shift + Tab**: Move to previous focusable element
- **Enter**: Activate buttons/links
- **Space**: Toggle checkboxes, activate buttons
- **Esc**: Close modals/dialogs
- **Arrow keys**: Navigate within components (select menus, radio groups)

#### 3. Browser DevTools

**Chrome DevTools:**
- Inspect > Accessibility pane
- Lighthouse > Accessibility audit
- Color contrast checker

**Firefox DevTools:**
- Inspector > Accessibility tab
- Accessibility property inspector

## Accessibility Checklist

### 1. Keyboard Navigation

✅ **All interactive elements must be keyboard accessible:**

```javascript
function testKeyboardNavigation() {
  // Tab through all form fields
  var emailInput = document.querySelector('.firebaseui-id-email');
  var passwordInput = document.querySelector('.firebaseui-id-password');
  var submitButton = document.querySelector('.firebaseui-id-submit');

  // Verify tab order
  emailInput.focus();
  assertEquals(emailInput, document.activeElement);

  // Simulate Tab key
  simulateKeyPress(emailInput, KeyCodes.TAB);
  assertEquals(passwordInput, document.activeElement);

  simulateKeyPress(passwordInput, KeyCodes.TAB);
  assertEquals(submitButton, document.activeElement);

  // Verify Enter activates submit button
  simulateKeyPress(submitButton, KeyCodes.ENTER);
  // Assert form submitted
}
```

✅ **Visual focus indicators must be visible:**

```css
/* Good: Clear focus indicator */
.firebaseui-input:focus {
  outline: 2px solid #4285f4;
  outline-offset: 2px;
}

/* Bad: Removed focus indicator */
.firebaseui-input:focus {
  outline: none; /* Never do this without alternative! */
}
```

✅ **Skip to content links for keyboard users:**

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### 2. ARIA Attributes

✅ **Proper ARIA labels for form inputs:**

```html
<!-- Good: Proper labeling -->
<label for="email-input">Email</label>
<input id="email-input" type="email" aria-required="true" aria-invalid="false">
<div id="email-error" role="alert" aria-live="polite"></div>

<!-- Bad: No label -->
<input type="email" placeholder="Email">
```

✅ **ARIA roles for custom components:**

```html
<!-- Custom button -->
<div role="button" tabindex="0" aria-label="Sign in with Google">
  <img src="google-icon.svg" alt="">
  Sign in with Google
</div>

<!-- Loading indicator -->
<div role="status" aria-live="polite" aria-label="Signing you in...">
  <div class="spinner"></div>
</div>

<!-- Error message -->
<div role="alert" aria-live="assertive">
  Invalid email address
</div>
```

✅ **ARIA states:**

```html
<button aria-pressed="false">Toggle option</button>
<input aria-invalid="true" aria-describedby="error-message">
<div role="tabpanel" aria-hidden="false">Content</div>
<button aria-disabled="true">Submit</button>
<div aria-expanded="false">Collapsed content</div>
```

### 3. Semantic HTML

✅ **Use semantic HTML elements:**

```html
<!-- Good -->
<button type="submit">Sign In</button>
<nav><ul><li><a href="/help">Help</a></li></ul></nav>
<main><h1>Sign In</h1></main>

<!-- Bad -->
<div class="button" onclick="submit()">Sign In</div>
<div class="nav"><div class="link">Help</div></div>
<div><span class="title">Sign In</span></div>
```

✅ **Proper heading hierarchy:**

```html
<!-- Good -->
<h1>Firebase Authentication</h1>
  <h2>Sign In</h2>
    <h3>Choose a sign-in method</h3>

<!-- Bad: Skipped level -->
<h1>Firebase Authentication</h1>
  <h3>Sign In</h3>
```

### 4. Form Accessibility

✅ **Associate labels with inputs:**

```html
<!-- Good: Explicit association -->
<label for="password-input">Password</label>
<input id="password-input" type="password">

<!-- Good: Implicit association -->
<label>
  Password
  <input type="password">
</label>

<!-- Bad: No association -->
<div>Password</div>
<input type="password">
```

✅ **Provide error messages:**

```html
<label for="email">Email</label>
<input id="email"
       type="email"
       aria-invalid="true"
       aria-describedby="email-error">
<div id="email-error" role="alert">
  Please enter a valid email address
</div>
```

✅ **Group related inputs:**

```html
<fieldset>
  <legend>Sign in method</legend>
  <input type="radio" id="email" name="method" value="email">
  <label for="email">Email</label>
  <input type="radio" id="phone" name="method" value="phone">
  <label for="phone">Phone</label>
</fieldset>
```

### 5. Color and Contrast

✅ **Minimum contrast ratios (WCAG AA):**

- **Normal text**: 4.5:1
- **Large text (18pt+ or 14pt+ bold)**: 3:1
- **UI components and graphics**: 3:1

```javascript
// Test contrast ratios
function testColorContrast() {
  var button = document.querySelector('.firebaseui-id-submit');
  var bgColor = getComputedStyle(button).backgroundColor;
  var textColor = getComputedStyle(button).color;

  var contrastRatio = calculateContrastRatio(bgColor, textColor);

  // Assert minimum contrast ratio
  assertTrue(contrastRatio >= 4.5,
    'Contrast ratio ' + contrastRatio + ' is below minimum 4.5:1');
}
```

✅ **Don't rely on color alone:**

```html
<!-- Good: Icon + color + text -->
<div class="error">
  <span class="error-icon" aria-hidden="true">⚠</span>
  <span class="error-text">Invalid email</span>
</div>

<!-- Bad: Color only -->
<div style="color: red;">Invalid email</div>
```

### 6. Images and Icons

✅ **Provide alt text for images:**

```html
<!-- Good: Descriptive alt text -->
<img src="google-icon.svg" alt="Google logo">

<!-- Good: Decorative image -->
<img src="decorative.svg" alt="" aria-hidden="true">

<!-- Bad: Missing alt text -->
<img src="google-icon.svg">

<!-- Bad: Redundant alt text -->
<button>
  <img src="google.svg" alt="Google">
  Sign in with Google
</button>
<!-- Screen reader reads: "Google Sign in with Google" -->

<!-- Good: Empty alt when text is present -->
<button>
  <img src="google.svg" alt="">
  Sign in with Google
</button>
```

### 7. Dialogs and Modals

✅ **Proper dialog implementation:**

```html
<div role="dialog"
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc"
     aria-modal="true">

  <h2 id="dialog-title">Confirm Sign Out</h2>
  <p id="dialog-desc">Are you sure you want to sign out?</p>

  <button>Cancel</button>
  <button>Sign Out</button>
</div>
```

```javascript
function testDialogAccessibility() {
  // When dialog opens
  dialog.show();

  // Focus should move to dialog
  assertTrue(dialog.contains(document.activeElement));

  // Focus should be trapped in dialog
  var lastElement = dialog.querySelector('button:last-child');
  lastElement.focus();
  simulateKeyPress(lastElement, KeyCodes.TAB);
  var firstElement = dialog.querySelector('button:first-child');
  assertEquals(firstElement, document.activeElement);

  // Esc should close dialog
  simulateKeyPress(document.activeElement, KeyCodes.ESC);
  assertFalse(dialog.isShown());

  // Focus should return to trigger element
  assertEquals(triggerButton, document.activeElement);
}
```

### 8. Loading and Processing States

✅ **Announce loading states:**

```html
<!-- Loading indicator -->
<div role="status" aria-live="polite">
  <span class="sr-only">Loading, please wait...</span>
  <div class="spinner" aria-hidden="true"></div>
</div>

<!-- Progress indicator -->
<div role="progressbar"
     aria-valuenow="50"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Upload progress">
  50% complete
</div>
```

### 9. Time Limits

✅ **Provide warnings and extensions for time limits:**

```javascript
function testSessionTimeout() {
  // Warn user before timeout
  showTimeoutWarning(60); // 60 seconds before timeout

  // Provide option to extend session
  var extendButton = document.querySelector('.extend-session');
  assertNotNull(extendButton);

  // Verify warning is announced to screen readers
  var warning = document.querySelector('[role="alert"]');
  assertTrue(warning.textContent.indexOf('session will expire') !== -1);
}
```

### 10. Link Accessibility

✅ **Descriptive link text:**

```html
<!-- Good: Descriptive -->
<a href="/help">Get help with sign-in</a>

<!-- Bad: Non-descriptive -->
<a href="/help">Click here</a>

<!-- Good: Additional context for screen readers -->
<a href="/tos">
  Terms of Service
  <span class="sr-only"> (opens in new window)</span>
</a>

<!-- Links that open new windows should be indicated -->
<a href="/privacy" target="_blank" rel="noopener">
  Privacy Policy
  <span class="sr-only"> (opens in new window)</span>
</a>
```

## Testing Workflow

### 1. Automated Tests

Run automated tests on every build:

```bash
# Run accessibility tests
npm run test:a11y

# Run with specific WCAG level
npm run test:a11y -- --level AA
```

### 2. Manual Keyboard Testing

Test all user flows with keyboard only:

1. **Sign-up flow**:
   - Tab through all fields
   - Fill out form using keyboard
   - Submit using Enter/Space
   - Navigate error messages

2. **Sign-in flow**:
   - Tab to email/password fields
   - Tab to provider buttons
   - Activate buttons with Enter/Space

3. **Password reset**:
   - Navigate reset form
   - Submit and navigate confirmation

### 3. Screen Reader Testing

Test with at least one screen reader:

1. Enable screen reader (NVDA/VoiceOver/JAWS)
2. Navigate to sign-in page
3. Listen to page announcement
4. Navigate form fields
5. Listen to field labels
6. Trigger validation errors
7. Listen to error announcements
8. Complete sign-in flow

### 4. Color Contrast Testing

1. Use browser DevTools
2. Check all text against backgrounds
3. Check button states (hover, focus, disabled)
4. Check error messages
5. Check links

## Test File Template

```javascript
/*
 * Copyright 2025 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */

/**
 * @fileoverview Accessibility tests for [component name]
 */

goog.provide('firebaseui.auth.a11y.[componentName]Test');
goog.setTestOnly('firebaseui.auth.a11y.[componentName]Test');

goog.require('[component under test]');
goog.require('goog.testing.jsunit');


function testKeyboardNavigation() {
  // Test tab order
  // Test Enter/Space activation
  // Test Esc to close
}


function testAriaLabels() {
  // Verify all inputs have labels
  // Verify aria-required
  // Verify aria-invalid
  // Verify aria-describedby for errors
}


function testScreenReaderAnnouncements() {
  // Test role="alert" for errors
  // Test aria-live for dynamic content
  // Test status messages
}


function testFocusManagement() {
  // Test focus indicators
  // Test focus trap in modals
  // Test focus return after modal close
}


function testColorContrast() {
  // Test text contrast ratios
  // Test button contrast
  // Test error message contrast
}
```

## Common Accessibility Issues and Fixes

### Issue 1: Missing Form Labels

**Problem:**
```html
<input type="email" placeholder="Email">
```

**Fix:**
```html
<label for="email-input">Email</label>
<input id="email-input" type="email">
```

### Issue 2: Keyboard Trap

**Problem:**
```javascript
// Modal with no Esc handler
dialog.show();
```

**Fix:**
```javascript
dialog.show();
dialog.addEventListener('keydown', function(e) {
  if (e.keyCode === KeyCodes.ESC) {
    dialog.close();
  }
});
```

### Issue 3: Low Contrast

**Problem:**
```css
.button {
  background: #bbb;
  color: #999; /* Contrast ratio: 1.5:1 - FAIL */
}
```

**Fix:**
```css
.button {
  background: #1976d2;
  color: #ffffff; /* Contrast ratio: 6.3:1 - PASS */
}
```

### Issue 4: No Error Announcement

**Problem:**
```html
<div class="error">Invalid email</div>
```

**Fix:**
```html
<div class="error" role="alert" aria-live="assertive">
  Invalid email
</div>
```

### Issue 5: Unclear Button Purpose

**Problem:**
```html
<button><img src="google.svg"></button>
```

**Fix:**
```html
<button aria-label="Sign in with Google">
  <img src="google.svg" alt="">
</button>
```

## Screen Reader Only Content

Use this CSS class for content that should only be announced by screen readers:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```html
<button>
  <span class="sr-only">Sign in with</span>
  <img src="google.svg" alt="" aria-hidden="true">
  <span>Google</span>
</button>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11Y Project](https://www.a11yproject.com/)
- [axe DevTools](https://www.deque.com/axe/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Conclusion

Accessibility is everyone's responsibility. By following these guidelines and testing thoroughly, we can ensure FirebaseUI Web is usable by everyone, regardless of their abilities.

**Remember: If it's not accessible, it's not done.**
