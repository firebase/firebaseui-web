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
 * @fileoverview Tests for password.js
 */

goog.provide('firebaseui.auth.ui.element.passwordTest');
goog.setTestOnly('firebaseui.auth.ui.element.passwordTest');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.password');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new goog.ui.Component();
  container.innerHTML =
      '<input type="password" class="firebaseui-id-password firebaseui-input">' +
      '<div class="firebaseui-id-password-error firebaseui-hidden"></div>';
  component.decorate(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetPasswordElement() {
  var passwordElement = component.getPasswordElement();
  assertNotNull(passwordElement);
  assertTrue(goog.dom.classlist.contains(passwordElement,
      'firebaseui-id-password'));
}


function testGetPasswordErrorElement() {
  var errorElement = component.getPasswordErrorElement();
  assertNotNull(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement,
      'firebaseui-id-password-error'));
}


function testCheckAndGetPassword_empty() {
  goog.dom.forms.setValue(component.getPasswordElement(), '');
  assertNull(component.checkAndGetPassword());

  var passwordElement = component.getPasswordElement();
  var errorElement = component.getPasswordErrorElement();

  assertTrue(goog.dom.classlist.contains(passwordElement,
      'firebaseui-input-invalid'));
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertEquals(firebaseui.auth.soy2.strings.errorMissingPassword().toString(),
      goog.dom.getTextContent(errorElement));
}


function testCheckAndGetPassword_valid() {
  var testPasswords = [
    'password123',
    'P@ssw0rd!',
    'very-long-password-with-special-chars-123!@#',
    'a',  // Single character should be allowed
    '12345678'
  ];

  testPasswords.forEach(function(password) {
    goog.dom.forms.setValue(component.getPasswordElement(), password);
    assertEquals(password, component.checkAndGetPassword());

    var passwordElement = component.getPasswordElement();
    var errorElement = component.getPasswordErrorElement();

    assertTrue(goog.dom.classlist.contains(passwordElement, 'firebaseui-input'));
    assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  });
}


function testInitPasswordElement_clearErrorOnInput() {
  component.initPasswordElement();

  var passwordElement = component.getPasswordElement();
  var errorElement = component.getPasswordErrorElement();

  // Trigger error
  goog.dom.forms.setValue(passwordElement, '');
  component.checkAndGetPassword();
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Type something
  goog.dom.forms.setValue(passwordElement, 'P');
  goog.testing.events.fireKeySequence(passwordElement, goog.events.KeyCodes.P);

  // Error should be hidden
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertTrue(goog.dom.classlist.contains(passwordElement, 'firebaseui-input'));
}


function testPasswordValidation_whitespaceOnly() {
  // Test passwords with only whitespace
  var whitespacePasswords = ['   ', '\t', '\n', ' \t\n '];

  whitespacePasswords.forEach(function(password) {
    goog.dom.forms.setValue(component.getPasswordElement(), password);
    // Whitespace should be considered valid (not empty)
    assertNotNull(component.checkAndGetPassword());
  });
}


function testPasswordValidation_specialCharacters() {
  // Test passwords with special characters
  var specialPasswords = [
    'p@$$w0rd!',
    'password#123',
    'test&password',
    'pass<word>',
    'päss wörd'  // Unicode
  ];

  specialPasswords.forEach(function(password) {
    goog.dom.forms.setValue(component.getPasswordElement(), password);
    assertEquals(password, component.checkAndGetPassword());
  });
}


function testPasswordValidation_maxLength() {
  // Test very long password
  var longPassword = 'a'.repeat(1000);
  goog.dom.forms.setValue(component.getPasswordElement(), longPassword);
  assertEquals(longPassword, component.checkAndGetPassword());
}


function testPasswordSecurity_noTrimming() {
  // Verify passwords are not trimmed (leading/trailing spaces should be kept)
  var passwordWithSpaces = '  password  ';
  goog.dom.forms.setValue(component.getPasswordElement(), passwordWithSpaces);
  assertEquals(passwordWithSpaces, component.checkAndGetPassword());
}


function testPasswordInput_typeAttribute() {
  var passwordElement = component.getPasswordElement();
  // Verify it's a password input type
  assertEquals('password', passwordElement.type);
}
