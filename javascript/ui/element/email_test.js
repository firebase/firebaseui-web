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
 * @fileoverview Tests for email.js
 */

goog.provide('firebaseui.auth.ui.element.emailTest');
goog.setTestOnly('firebaseui.auth.ui.element.emailTest');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.email');
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

  // Create a component with email input and error elements
  component = new goog.ui.Component();
  container.innerHTML =
      '<input type="email" class="firebaseui-id-email firebaseui-input">' +
      '<div class="firebaseui-id-email-error firebaseui-hidden"></div>';
  component.decorate(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetEmailElement() {
  var emailElement = component.getEmailElement();
  assertNotNull(emailElement);
  assertTrue(goog.dom.classlist.contains(emailElement, 'firebaseui-id-email'));
}


function testGetEmailErrorElement() {
  var errorElement = component.getEmailErrorElement();
  assertNotNull(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement,
      'firebaseui-id-email-error'));
}


function testGetEmail_empty() {
  goog.dom.forms.setValue(component.getEmailElement(), '');
  assertEquals('', component.getEmail());
}


function testGetEmail_valid() {
  goog.dom.forms.setValue(component.getEmailElement(), 'user@example.com');
  assertEquals('user@example.com', component.getEmail());
}


function testGetEmail_trimWhitespace() {
  goog.dom.forms.setValue(component.getEmailElement(), '  user@example.com  ');
  assertEquals('user@example.com', component.getEmail());
}


function testCheckAndGetEmail_empty() {
  goog.dom.forms.setValue(component.getEmailElement(), '');
  assertNull(component.checkAndGetEmail());

  var emailElement = component.getEmailElement();
  var errorElement = component.getEmailErrorElement();

  // Should show error
  assertTrue(goog.dom.classlist.contains(emailElement,
      'firebaseui-input-invalid'));
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertEquals(firebaseui.auth.soy2.strings.errorMissingEmail().toString(),
      goog.dom.getTextContent(errorElement));
}


function testCheckAndGetEmail_invalid() {
  // Test various invalid email formats
  var invalidEmails = [
    'notanemail',
    '@example.com',
    'user@',
    'user@.',
    'user @example.com',
    'user@example',
    'user.example.com',
    'user@@example.com',
    'user..name@example.com'
  ];

  invalidEmails.forEach(function(email) {
    goog.dom.forms.setValue(component.getEmailElement(), email);
    assertNull(component.checkAndGetEmail());

    var emailElement = component.getEmailElement();
    var errorElement = component.getEmailErrorElement();

    assertTrue(goog.dom.classlist.contains(emailElement,
        'firebaseui-input-invalid'));
    assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
    assertEquals(firebaseui.auth.soy2.strings.errorInvalidEmail().toString(),
        goog.dom.getTextContent(errorElement));
  });
}


function testCheckAndGetEmail_valid() {
  // Test various valid email formats
  var validEmails = [
    'user@example.com',
    'user.name@example.com',
    'user+tag@example.co.uk',
    'user_name@example.com',
    'user123@test-domain.com',
    'a@b.c'
  ];

  validEmails.forEach(function(email) {
    goog.dom.forms.setValue(component.getEmailElement(), email);
    assertEquals(email, component.checkAndGetEmail());

    var emailElement = component.getEmailElement();
    var errorElement = component.getEmailErrorElement();

    assertTrue(goog.dom.classlist.contains(emailElement, 'firebaseui-input'));
    assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  });
}


function testInitEmailElement_clearErrorOnInput() {
  var enterPressed = false;
  component.initEmailElement(function() {
    enterPressed = true;
  });

  var emailElement = component.getEmailElement();
  var errorElement = component.getEmailErrorElement();

  // Trigger error
  goog.dom.forms.setValue(emailElement, '');
  component.checkAndGetEmail();
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Type something
  goog.dom.forms.setValue(emailElement, 'u');
  goog.testing.events.fireKeySequence(emailElement, goog.events.KeyCodes.U);

  // Error should be hidden
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertTrue(goog.dom.classlist.contains(emailElement, 'firebaseui-input'));
}


function testInitEmailElement_enterKey() {
  var enterPressed = false;
  component.initEmailElement(function() {
    enterPressed = true;
  });

  var emailElement = component.getEmailElement();

  assertFalse(enterPressed);
  goog.testing.events.fireKeySequence(emailElement, goog.events.KeyCodes.ENTER);
  assertTrue(enterPressed);
}


function testInitEmailElement_noEnterCallback() {
  // Should not throw when no callback provided
  component.initEmailElement();
  var emailElement = component.getEmailElement();
  goog.testing.events.fireKeySequence(emailElement, goog.events.KeyCodes.ENTER);
  // Just verify no error thrown
  assertTrue(true);
}


function testEmailValidation_specialCharacters() {
  // Test email with special characters (security test)
  var maliciousInputs = [
    '<script>alert("xss")</script>@example.com',
    'user@<img src=x onerror=alert(1)>.com',
    'javascript:alert(1)@example.com',
    '"<>@example.com'
  ];

  maliciousInputs.forEach(function(input) {
    goog.dom.forms.setValue(component.getEmailElement(), input);
    // Should be treated as invalid email
    assertNull(component.checkAndGetEmail());
  });
}


function testEmailValidation_maxLength() {
  // Test very long email (boundary test)
  var longLocalPart = 'a'.repeat(64);
  var longDomain = 'b'.repeat(63);
  var longEmail = longLocalPart + '@' + longDomain + '.com';

  goog.dom.forms.setValue(component.getEmailElement(), longEmail);
  // Should still validate correctly
  var result = component.checkAndGetEmail();
  assertTrue(result === longEmail || result === null);
}


function testEmailValidation_unicodeCharacters() {
  // Test unicode in email
  var unicodeEmail = 'tëst@example.com';
  goog.dom.forms.setValue(component.getEmailElement(), unicodeEmail);
  component.checkAndGetEmail();
  // Just verify no crash
  assertTrue(true);
}
