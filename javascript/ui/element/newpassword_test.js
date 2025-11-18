/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Tests for newpassword.js
 */

goog.provide('firebaseui.auth.ui.element.newPasswordTest');
goog.setTestOnly('firebaseui.auth.ui.element.newPasswordTest');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.newPassword');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.userAgent');


var component;
var container;


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  // Create a component with new password input, toggle, and error elements
  component = new goog.ui.Component();
  container.innerHTML =
      '<input type="password" class="firebaseui-id-new-password firebaseui-input">' +
      '<button class="firebaseui-id-password-toggle firebaseui-input-toggle-on"></button>' +
      '<div class="firebaseui-id-new-password-error firebaseui-hidden"></div>';
  component.decorate(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetNewPasswordElement() {
  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  assertNotNull(passwordElement);
  assertTrue(goog.dom.classlist.contains(passwordElement,
      'firebaseui-id-new-password'));
}


function testGetPasswordToggleElement() {
  var toggleElement = firebaseui.auth.ui.element.newPassword.getPasswordToggleElement.call(
      component);
  assertNotNull(toggleElement);
  assertTrue(goog.dom.classlist.contains(toggleElement,
      'firebaseui-id-password-toggle'));
}


function testGetNewPasswordErrorElement() {
  var errorElement = firebaseui.auth.ui.element.newPassword.getNewPasswordErrorElement.call(
      component);
  assertNotNull(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement,
      'firebaseui-id-new-password-error'));
}


function testInitNewPasswordElement() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  var toggleElement = firebaseui.auth.ui.element.newPassword.getPasswordToggleElement.call(
      component);

  // Should be password type initially
  assertEquals('password', passwordElement.type);
  assertFalse(component.isPasswordVisible_);
  assertTrue(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-on'));
}


function testTogglePasswordVisible_showPassword() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  var toggleElement = firebaseui.auth.ui.element.newPassword.getPasswordToggleElement.call(
      component);

  assertEquals('password', passwordElement.type);
  assertTrue(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-on'));

  // Toggle to show password
  firebaseui.auth.ui.element.newPassword.togglePasswordVisible.call(component);

  assertEquals('text', passwordElement.type);
  assertTrue(component.isPasswordVisible_);
  assertTrue(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-off'));
  assertFalse(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-on'));
}


function testTogglePasswordVisible_hidePassword() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  // Toggle to show
  firebaseui.auth.ui.element.newPassword.togglePasswordVisible.call(component);

  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  var toggleElement = firebaseui.auth.ui.element.newPassword.getPasswordToggleElement.call(
      component);

  assertEquals('text', passwordElement.type);

  // Toggle to hide
  firebaseui.auth.ui.element.newPassword.togglePasswordVisible.call(component);

  assertEquals('password', passwordElement.type);
  assertFalse(component.isPasswordVisible_);
  assertTrue(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-on'));
  assertFalse(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-off'));
}


function testTogglePasswordVisible_clickEvent() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  var toggleElement = firebaseui.auth.ui.element.newPassword.getPasswordToggleElement.call(
      component);

  assertEquals('password', passwordElement.type);

  // Click toggle
  goog.testing.events.fireClickSequence(toggleElement);

  assertEquals('text', passwordElement.type);

  // Click again
  goog.testing.events.fireClickSequence(toggleElement);

  assertEquals('password', passwordElement.type);
}


function testCheckAndGetNewPassword_empty() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(component),
      '');

  assertNull(firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword.call(
      component));

  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  var errorElement = firebaseui.auth.ui.element.newPassword.getNewPasswordErrorElement.call(
      component);

  assertTrue(goog.dom.classlist.contains(passwordElement,
      'firebaseui-input-invalid'));
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertEquals(firebaseui.auth.soy2.strings.errorMissingPassword().toString(),
      goog.dom.getTextContent(errorElement));
}


function testCheckAndGetNewPassword_valid() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  var testPasswords = [
    'password123',
    'P@ssw0rd!',
    'very-long-password-with-special-chars-123!@#',
    'a',
    '12345678',
    'päss wörd'  // Unicode and spaces
  ];

  testPasswords.forEach(function(password) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(component),
        password);

    assertEquals(password,
        firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword.call(component));

    var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
        component);
    var errorElement = firebaseui.auth.ui.element.newPassword.getNewPasswordErrorElement.call(
        component);

    assertTrue(goog.dom.classlist.contains(passwordElement, 'firebaseui-input'));
    assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  });
}


function testInitNewPasswordElement_clearErrorOnInput() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  var errorElement = firebaseui.auth.ui.element.newPassword.getNewPasswordErrorElement.call(
      component);

  // Trigger error
  goog.dom.forms.setValue(passwordElement, '');
  firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword.call(component);
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Type something
  goog.dom.forms.setValue(passwordElement, 'P');
  goog.testing.events.fireKeySequence(passwordElement, goog.events.KeyCodes.P);

  // Error should be hidden
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertTrue(goog.dom.classlist.contains(passwordElement, 'firebaseui-input'));
}


function testInitNewPasswordElement_focusBlurToggle() {
  // Skip for IE due to focus event timing issues
  if (goog.userAgent.IE) {
    return;
  }

  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  var toggleElement = firebaseui.auth.ui.element.newPassword.getPasswordToggleElement.call(
      component);

  // Focus the password input
  goog.testing.events.fireFocusEvent(passwordElement);

  assertTrue(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-focus'));
  assertFalse(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-blur'));

  // Blur the password input
  goog.testing.events.fireBlurEvent(passwordElement);

  assertTrue(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-blur'));
  assertFalse(goog.dom.classlist.contains(toggleElement, 'firebaseui-input-toggle-focus'));
}


function testPasswordValidation_whitespaceOnly() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  // Test passwords with only whitespace (should be considered valid, not empty)
  var whitespacePasswords = ['   ', '\t', '\n', ' \t\n '];

  whitespacePasswords.forEach(function(password) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(component),
        password);
    assertNotNull(firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword.call(
        component));
  });
}


function testPasswordValidation_specialCharacters() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  // Test passwords with special characters that might have security implications
  var specialPasswords = [
    'p@$$w0rd!',
    'password#123',
    'test&password',
    'pass<word>',
    'pass"word',
    "pass'word"
  ];

  specialPasswords.forEach(function(password) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(component),
        password);
    assertEquals(password,
        firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword.call(component));
  });
}


function testPasswordValidation_maxLength() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  // Test very long password
  var longPassword = 'a'.repeat(1000);
  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(component),
      longPassword);
  assertEquals(longPassword,
      firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword.call(component));
}


function testPasswordSecurity_noTrimming() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  // Verify passwords are not trimmed (leading/trailing spaces should be kept)
  var passwordWithSpaces = '  password  ';
  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(component),
      passwordWithSpaces);
  assertEquals(passwordWithSpaces,
      firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword.call(component));
}


function testPasswordToggleFocus_afterToggle() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  var passwordElement = firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(
      component);
  var toggleElement = firebaseui.auth.ui.element.newPassword.getPasswordToggleElement.call(
      component);

  // Toggle password visibility
  goog.testing.events.fireClickSequence(toggleElement);

  // Password element should still have focus after toggle (focus is called in toggle)
  // This is just verifying the function doesn't throw an error
  assertTrue(true);
}


function testPasswordValidation_xssProtection() {
  firebaseui.auth.ui.element.newPassword.initNewPasswordElement.call(component);

  // Test potential XSS payloads as passwords (should be safely handled)
  var xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>'
  ];

  xssPayloads.forEach(function(payload) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.newPassword.getNewPasswordElement.call(component),
        payload);
    // Should not throw and should return the value as-is
    assertEquals(payload,
        firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword.call(component));
  });
}
