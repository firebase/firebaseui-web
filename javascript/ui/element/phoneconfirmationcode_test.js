/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Tests for phoneconfirmationcode.js
 */

goog.provide('firebaseui.auth.ui.element.phoneConfirmationCodeTest');
goog.setTestOnly('firebaseui.auth.ui.element.phoneConfirmationCodeTest');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.phoneConfirmationCode');
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
      '<input type="text" class="firebaseui-id-phone-confirmation-code ' +
      'firebaseui-input">' +
      '<div class="firebaseui-id-phone-confirmation-code-error ' +
      'firebaseui-hidden"></div>';
  component.decorate(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetPhoneConfirmationCodeElement() {
  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);
  assertNotNull(codeElement);
  assertTrue(goog.dom.classlist.contains(codeElement,
      'firebaseui-id-phone-confirmation-code'));
}


function testGetPhoneConfirmationCodeErrorElement() {
  var errorElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeErrorElement.call(component);
  assertNotNull(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement,
      'firebaseui-id-phone-confirmation-code-error'));
}


function testInitPhoneConfirmationCodeElement() {
  // Test initialization without callback
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);
  assertNotNull(codeElement);
}


function testInitPhoneConfirmationCodeElement_enterCallback() {
  var callbackCalled = false;
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(
          component,
          function() {
            callbackCalled = true;
          });

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);

  assertFalse(callbackCalled);
  goog.testing.events.fireKeySequence(codeElement, goog.events.KeyCodes.ENTER);
  assertTrue(callbackCalled);
}


function testInitPhoneConfirmationCodeElement_clearErrorOnInput() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);
  var errorElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeErrorElement.call(component);

  // Show an error
  firebaseui.auth.ui.element.setValid(codeElement, false);
  firebaseui.auth.ui.element.show(errorElement, 'Invalid code');
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Type something
  goog.dom.forms.setValue(codeElement, '1');
  goog.testing.events.fireKeySequence(codeElement, goog.events.KeyCodes.ONE);

  // Error should be hidden
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertTrue(goog.dom.classlist.contains(codeElement, 'firebaseui-input'));
}


function testCheckAndGetPhoneConfirmationCode_empty() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);
  goog.dom.forms.setValue(codeElement, '');

  assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
      .checkAndGetPhoneConfirmationCode.call(component));
}


function testCheckAndGetPhoneConfirmationCode_valid() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var validCodes = [
    '123456',
    '000000',
    '999999',
    '000123',  // Leading zeros
    '100000',
    '012345'
  ];

  validCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    var result = firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component);
    assertEquals(code, result);
  });
}


function testCheckAndGetPhoneConfirmationCode_tooShort() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var shortCodes = [
    '1',
    '12',
    '123',
    '1234',
    '12345'
  ];

  shortCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_tooLong() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var longCodes = [
    '1234567',
    '12345678',
    '123456789',
    '1234567890'
  ];

  longCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_nonNumeric() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var invalidCodes = [
    'abcdef',
    'a12345',
    '12345a',
    '123a56',
    '12 456',  // Space
    '12-456',  // Dash
    '12.456',  // Dot
    '12,456',  // Comma
    '12:456'   // Colon
  ];

  invalidCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_whitespace() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);

  // Test with leading/trailing whitespace
  goog.dom.forms.setValue(codeElement, '  123456  ');

  var result = firebaseui.auth.ui.element.phoneConfirmationCode
      .checkAndGetPhoneConfirmationCode.call(component);

  // Should be trimmed and valid
  assertEquals('123456', result);
}


function testCheckAndGetPhoneConfirmationCode_whitespaceOnly() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var whitespaceCodes = [
    '   ',
    '\t',
    '\n',
    ' \t\n ',
    '      '
  ];

  whitespaceCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_specialCharacters() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var specialCodes = [
    '!@#$%^',
    '123!56',
    '(12345)',
    '[12345]',
    '{12345}',
    '123*56',
    '123#56',
    '123&56'
  ];

  specialCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_negativeNumbers() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var negativeCodes = [
    '-12345',
    '12-345',
    '123-45'
  ];

  negativeCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_plusSign() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var plusCodes = [
    '+12345',
    '12+345',
    '123456+'
  ];

  plusCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_xssProtection() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '\'OR 1=1--',
    '" OR "1"="1'
  ];

  xssPayloads.forEach(function(payload) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, payload);

    // Should safely reject (not 6 digits)
    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_sqlInjection() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var sqlPayloads = [
    "'; DROP TABLE users--",
    '1\' OR \'1\' = \'1',
    'admin\'--',
    '\' OR 1=1--'
  ];

  sqlPayloads.forEach(function(payload) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, payload);

    // Should safely reject
    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_unicodeDigits() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  // Test unicode digits (should only accept ASCII digits 0-9)
  var unicodeCodes = [
    '১২৩৪৫৬',  // Bengali digits
    '۱۲۳۴۵۶',  // Persian digits
    '௧௨௩௪௫௬',  // Tamil digits
    '୧୨୩୪୫୬'   // Oriya digits
  ];

  unicodeCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    // Should reject (only ASCII 0-9 allowed)
    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_mixedWhitespace() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);

  // Test with various whitespace types
  goog.dom.forms.setValue(codeElement, '\t 123456 \n');

  var result = firebaseui.auth.ui.element.phoneConfirmationCode
      .checkAndGetPhoneConfirmationCode.call(component);

  // Should be trimmed and valid
  assertEquals('123456', result);
}


function testCheckAndGetPhoneConfirmationCode_zeroPadded() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var zeroPaddedCodes = [
    '000000',
    '000001',
    '000123',
    '001234',
    '012345'
  ];

  zeroPaddedCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    var result = firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component);

    // Should be valid with leading zeros preserved
    assertEquals(code, result);
  });
}


function testCheckAndGetPhoneConfirmationCode_boundaryValues() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);

  // Test minimum valid code
  goog.dom.forms.setValue(codeElement, '000000');
  assertEquals('000000', firebaseui.auth.ui.element.phoneConfirmationCode
      .checkAndGetPhoneConfirmationCode.call(component));

  // Test maximum valid code
  goog.dom.forms.setValue(codeElement, '999999');
  assertEquals('999999', firebaseui.auth.ui.element.phoneConfirmationCode
      .checkAndGetPhoneConfirmationCode.call(component));
}


function testCheckAndGetPhoneConfirmationCode_floatingPoint() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var floatingPointCodes = [
    '123.456',
    '12.3456',
    '1234.56',
    '123456.',
    '.123456'
  ];

  floatingPointCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    // Should reject (only pure digits allowed)
    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_scientificNotation() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var scientificCodes = [
    '1e5',
    '1.23e5',
    '123e3'
  ];

  scientificCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    // Should reject
    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testCheckAndGetPhoneConfirmationCode_htmlEntities() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var htmlEntityCodes = [
    '&lt;123456&gt;',
    '&#49;&#50;&#51;&#52;&#53;&#54;',
    '&amp;12345'
  ];

  htmlEntityCodes.forEach(function(code) {
    var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
        .getPhoneConfirmationCodeElement.call(component);
    goog.dom.forms.setValue(codeElement, code);

    // Should reject (not pure 6 digits)
    assertNull(firebaseui.auth.ui.element.phoneConfirmationCode
        .checkAndGetPhoneConfirmationCode.call(component));
  });
}


function testPhoneConfirmationCodeElement_typeAttribute() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);

  // Verify it's a text input type
  assertEquals('text', codeElement.type);
}


function testPhoneConfirmationCode_multipleClearErrors() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);
  var errorElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeErrorElement.call(component);

  // Show error
  firebaseui.auth.ui.element.setValid(codeElement, false);
  firebaseui.auth.ui.element.show(errorElement, 'Error 1');

  // Type to clear
  goog.dom.forms.setValue(codeElement, '1');
  goog.testing.events.fireKeySequence(codeElement, goog.events.KeyCodes.ONE);
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Show error again
  firebaseui.auth.ui.element.setValid(codeElement, false);
  firebaseui.auth.ui.element.show(errorElement, 'Error 2');

  // Type to clear again
  goog.dom.forms.setValue(codeElement, '12');
  goog.testing.events.fireKeySequence(codeElement, goog.events.KeyCodes.TWO);
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
}


function testPhoneConfirmationCode_validationDoesNotModifyInput() {
  firebaseui.auth.ui.element.phoneConfirmationCode
      .initPhoneConfirmationCodeElement.call(component);

  var codeElement = firebaseui.auth.ui.element.phoneConfirmationCode
      .getPhoneConfirmationCodeElement.call(component);

  var testCode = '  123456  ';
  goog.dom.forms.setValue(codeElement, testCode);

  // Call validation
  firebaseui.auth.ui.element.phoneConfirmationCode
      .checkAndGetPhoneConfirmationCode.call(component);

  // Original input should not be modified
  assertEquals(testCode, goog.dom.forms.getValue(codeElement));
}
