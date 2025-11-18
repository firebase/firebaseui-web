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
 * @fileoverview Tests for name.js
 */

goog.provide('firebaseui.auth.ui.element.nameTest');
goog.setTestOnly('firebaseui.auth.ui.element.nameTest');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.name');
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

  // Create a component with name input and error elements
  component = new goog.ui.Component();
  container.innerHTML =
      '<input type="text" class="firebaseui-id-name firebaseui-input">' +
      '<div class="firebaseui-id-name-error firebaseui-hidden"></div>';
  component.decorate(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetNameElement() {
  var nameElement = firebaseui.auth.ui.element.name.getNameElement.call(component);
  assertNotNull(nameElement);
  assertTrue(goog.dom.classlist.contains(nameElement, 'firebaseui-id-name'));
}


function testGetNameErrorElement() {
  var errorElement = firebaseui.auth.ui.element.name.getNameErrorElement.call(
      component);
  assertNotNull(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement,
      'firebaseui-id-name-error'));
}


function testCheckAndGetName_empty() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.name.getNameElement.call(component), '');

  assertNull(firebaseui.auth.ui.element.name.checkAndGetName.call(component));

  var nameElement = firebaseui.auth.ui.element.name.getNameElement.call(component);
  var errorElement = firebaseui.auth.ui.element.name.getNameErrorElement.call(
      component);

  assertTrue(goog.dom.classlist.contains(nameElement,
      'firebaseui-input-invalid'));
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertEquals(firebaseui.auth.soy2.strings.errorMissingName().toString(),
      goog.dom.getTextContent(errorElement));
}


function testCheckAndGetName_valid() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  var testNames = [
    'John Doe',
    'Jane',
    'Mary-Jane Watson',
    "O'Brien",
    'José García',
    'Mohammed ibn Abdullah',
    '李明',  // Chinese
    'Владимир Путин',  // Russian
    'Jean-François'
  ];

  testNames.forEach(function(name) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.name.getNameElement.call(component), name);

    assertEquals(name,
        firebaseui.auth.ui.element.name.checkAndGetName.call(component));

    var nameElement = firebaseui.auth.ui.element.name.getNameElement.call(
        component);
    var errorElement = firebaseui.auth.ui.element.name.getNameErrorElement.call(
        component);

    assertTrue(goog.dom.classlist.contains(nameElement, 'firebaseui-input'));
    assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  });
}


function testCheckAndGetName_whitespaceOnly() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  var whitespaceNames = ['   ', '\t', '\n', ' \t\n ', '     '];

  whitespaceNames.forEach(function(name) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.name.getNameElement.call(component), name);

    assertNull(firebaseui.auth.ui.element.name.checkAndGetName.call(component));

    var nameElement = firebaseui.auth.ui.element.name.getNameElement.call(
        component);
    var errorElement = firebaseui.auth.ui.element.name.getNameErrorElement.call(
        component);

    assertTrue(goog.dom.classlist.contains(nameElement,
        'firebaseui-input-invalid'));
    assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
    assertEquals(firebaseui.auth.soy2.strings.errorMissingName().toString(),
        goog.dom.getTextContent(errorElement));
  });
}


function testCheckAndGetName_trimWhitespace() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Names with leading/trailing whitespace should be trimmed
  var nameWithSpaces = '  John Doe  ';
  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.name.getNameElement.call(component),
      nameWithSpaces);

  assertEquals('John Doe',
      firebaseui.auth.ui.element.name.checkAndGetName.call(component));
}


function testCheckAndGetName_internalWhitespace() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Names with internal whitespace should be preserved
  var nameWithInternalSpaces = 'John   Doe';
  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.name.getNameElement.call(component),
      nameWithInternalSpaces);

  assertEquals('John   Doe',
      firebaseui.auth.ui.element.name.checkAndGetName.call(component));
}


function testInitNameElement_clearErrorOnInput() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  var nameElement = firebaseui.auth.ui.element.name.getNameElement.call(
      component);
  var errorElement = firebaseui.auth.ui.element.name.getNameErrorElement.call(
      component);

  // Trigger error
  goog.dom.forms.setValue(nameElement, '');
  firebaseui.auth.ui.element.name.checkAndGetName.call(component);
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Type something
  goog.dom.forms.setValue(nameElement, 'J');
  goog.testing.events.fireKeySequence(nameElement, goog.events.KeyCodes.J);

  // Error should be hidden
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertTrue(goog.dom.classlist.contains(nameElement, 'firebaseui-input'));
}


function testNameValidation_specialCharacters() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Test names with special characters
  var specialNames = [
    'John-Doe',
    "O'Brien",
    'Mary.Jane',
    'John Doe Jr.',
    'José',
    'François',
    'Müller'
  ];

  specialNames.forEach(function(name) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.name.getNameElement.call(component), name);
    assertEquals(name,
        firebaseui.auth.ui.element.name.checkAndGetName.call(component));
  });
}


function testNameValidation_numbers() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Names with numbers should be allowed
  var namesWithNumbers = [
    'John123',
    'User 1',
    '42 Name'
  ];

  namesWithNumbers.forEach(function(name) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.name.getNameElement.call(component), name);
    assertNotNull(firebaseui.auth.ui.element.name.checkAndGetName.call(component));
  });
}


function testNameValidation_maxLength() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Test very long name
  var longName = 'a'.repeat(500);
  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.name.getNameElement.call(component), longName);
  assertEquals(longName,
      firebaseui.auth.ui.element.name.checkAndGetName.call(component));
}


function testNameValidation_singleCharacter() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Single character names should be valid
  var singleCharNames = ['A', 'Z', '李', 'Ω'];

  singleCharNames.forEach(function(name) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.name.getNameElement.call(component), name);
    assertEquals(name,
        firebaseui.auth.ui.element.name.checkAndGetName.call(component));
  });
}


function testNameValidation_xssProtection() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Test potential XSS payloads as names (should be safely handled)
  var xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    '<iframe src="javascript:alert(1)"></iframe>'
  ];

  xssPayloads.forEach(function(payload) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.name.getNameElement.call(component), payload);
    // Should not throw and should return a valid value (trimmed and sanitized)
    var result = firebaseui.auth.ui.element.name.checkAndGetName.call(component);
    assertNotNull(result);
    // The result should be the payload itself (validation doesn't filter HTML)
    assertEquals(payload, result);
  });
}


function testNameValidation_emptyAfterTrim() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Names that become empty after trimming should be invalid
  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.name.getNameElement.call(component),
      '     ');

  assertNull(firebaseui.auth.ui.element.name.checkAndGetName.call(component));

  var errorElement = firebaseui.auth.ui.element.name.getNameErrorElement.call(
      component);
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
}


function testNameValidation_mixedWhitespace() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Test names with mixed whitespace characters
  var name = '\t John \n Doe \r';
  goog.dom.forms.setValue(
      firebaseui.auth.ui.element.name.getNameElement.call(component), name);

  var result = firebaseui.auth.ui.element.name.checkAndGetName.call(component);
  assertNotNull(result);
  // Should be trimmed but internal whitespace preserved
  assertTrue(result.indexOf('John') >= 0);
  assertTrue(result.indexOf('Doe') >= 0);
}


function testNameValidation_unicodeCharacters() {
  firebaseui.auth.ui.element.name.initNameElement.call(component);

  // Test various unicode characters
  var unicodeNames = [
    '名前',  // Japanese
    '이름',  // Korean
    'नाम',  // Hindi
    'اسم',  // Arabic
    'שם',  // Hebrew
    'Имя',  // Russian
    '🙂 Happy'  // Emoji
  ];

  unicodeNames.forEach(function(name) {
    goog.dom.forms.setValue(
        firebaseui.auth.ui.element.name.getNameElement.call(component), name);
    assertNotNull(firebaseui.auth.ui.element.name.checkAndGetName.call(component));
  });
}
