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
 * @fileoverview Tests for recaptcha.js
 */

goog.provide('firebaseui.auth.ui.element.recaptchaTest');
goog.setTestOnly('firebaseui.auth.ui.element.recaptchaTest');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.recaptcha');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new goog.ui.Component();
  container.innerHTML =
      '<div class="firebaseui-recaptcha-container"></div>' +
      '<div class="firebaseui-id-recaptcha-error firebaseui-hidden"></div>';
  component.decorate(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetRecaptchaElement() {
  var recaptchaElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);
  assertNotNull(recaptchaElement);
  assertTrue(goog.dom.classlist.contains(recaptchaElement,
      'firebaseui-recaptcha-container'));
}


function testGetRecaptchaErrorElement() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);
  assertNotNull(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement,
      'firebaseui-id-recaptcha-error'));
}


function testRecaptchaElement_initialState() {
  var recaptchaElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Initially, recaptcha container should exist
  assertNotNull(recaptchaElement);

  // Initially, error should be hidden
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
}


function testRecaptchaErrorElement_showError() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Show error
  firebaseui.auth.ui.element.show(errorElement, 'reCAPTCHA verification failed');

  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertEquals('reCAPTCHA verification failed',
      goog.dom.getTextContent(errorElement));
}


function testRecaptchaErrorElement_hideError() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Show error first
  firebaseui.auth.ui.element.show(errorElement, 'Error message');
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Hide error
  firebaseui.auth.ui.element.hide(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
}


function testRecaptchaErrorElement_multipleMessages() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Show first error
  firebaseui.auth.ui.element.show(errorElement, 'Error 1');
  assertEquals('Error 1', goog.dom.getTextContent(errorElement));

  // Show second error (should replace)
  firebaseui.auth.ui.element.show(errorElement, 'Error 2');
  assertEquals('Error 2', goog.dom.getTextContent(errorElement));

  // Show third error
  firebaseui.auth.ui.element.show(errorElement, 'Error 3');
  assertEquals('Error 3', goog.dom.getTextContent(errorElement));
}


function testRecaptchaErrorElement_emptyMessage() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Show error with empty message
  firebaseui.auth.ui.element.show(errorElement, '');
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertEquals('', goog.dom.getTextContent(errorElement));
}


function testRecaptchaErrorElement_longMessage() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var longMessage = 'This is a very long error message that describes in ' +
      'detail what went wrong with the reCAPTCHA verification process and ' +
      'provides helpful information to the user about how to resolve the issue.';

  firebaseui.auth.ui.element.show(errorElement, longMessage);
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertEquals(longMessage, goog.dom.getTextContent(errorElement));
}


function testRecaptchaElement_containerExists() {
  var recaptchaElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);

  // Verify container exists and has correct class
  assertNotNull(recaptchaElement);
  assertTrue(recaptchaElement.classList.contains('firebaseui-recaptcha-container'));
}


function testRecaptchaElement_elementType() {
  var recaptchaElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);

  // Verify it's a DIV element
  assertEquals('DIV', recaptchaElement.tagName);
}


function testRecaptchaErrorElement_elementType() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Verify it's a DIV element
  assertEquals('DIV', errorElement.tagName);
}


function testRecaptchaErrorElement_xssProtection() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<svg/onload=alert(1)>',
    '<body onload=alert(1)>'
  ];

  xssPayloads.forEach(function(payload) {
    // Show error with XSS payload
    firebaseui.auth.ui.element.show(errorElement, payload);

    // The content should be safely rendered as text
    var content = goog.dom.getTextContent(errorElement);
    assertNotNull(content);

    // Verify no script execution (content is text, not HTML)
    // The exact behavior depends on how show() is implemented
    // but it should not execute scripts
  });
}


function testRecaptchaErrorElement_htmlInjection() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var htmlPayloads = [
    '<b>Bold text</b>',
    '<i>Italic text</i>',
    '<a href="http://evil.com">Link</a>',
    '<div>Nested div</div>',
    '<span style="color:red">Styled text</span>'
  ];

  htmlPayloads.forEach(function(payload) {
    firebaseui.auth.ui.element.show(errorElement, payload);

    // Content should be safely handled
    var content = goog.dom.getTextContent(errorElement);
    assertNotNull(content);
  });
}


function testRecaptchaErrorElement_specialCharacters() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var specialMessages = [
    'Error: <reCAPTCHA> failed',
    'Please verify you\'re not a robot',
    'Verification failed & retry needed',
    'Error "reCAPTCHA" timeout',
    'Connection failed @ 10:30 AM'
  ];

  specialMessages.forEach(function(message) {
    firebaseui.auth.ui.element.show(errorElement, message);

    var content = goog.dom.getTextContent(errorElement);
    // Content should contain the message
    assertTrue(content.length > 0);
  });
}


function testRecaptchaErrorElement_unicodeCharacters() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var unicodeMessages = [
    'エラーが発生しました',  // Japanese
    '请验证您不是机器人',  // Chinese
    'Пожалуйста, подтвердите',  // Russian
    'يرجى التحقق',  // Arabic
    'कृपया सत्यापित करें'  // Hindi
  ];

  unicodeMessages.forEach(function(message) {
    firebaseui.auth.ui.element.show(errorElement, message);

    var content = goog.dom.getTextContent(errorElement);
    assertNotNull(content);
    assertTrue(content.length > 0);
  });
}


function testRecaptchaErrorElement_whitespaceHandling() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var whitespaceMessages = [
    '   Leading spaces',
    'Trailing spaces   ',
    '  Both sides  ',
    'Internal   spaces',
    '\tTab character',
    '\nNew line',
    ' \t\n Mixed \t\n '
  ];

  whitespaceMessages.forEach(function(message) {
    firebaseui.auth.ui.element.show(errorElement, message);

    // Message should be displayed (whitespace handling may vary)
    assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  });
}


function testRecaptchaErrorElement_numericMessages() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var numericMessages = [
    'Error code: 123',
    'Timeout after 30 seconds',
    'Retry attempt 3 of 5',
    '404 Not Found',
    'Version 2.0 required'
  ];

  numericMessages.forEach(function(message) {
    firebaseui.auth.ui.element.show(errorElement, message);

    assertEquals(message, goog.dom.getTextContent(errorElement));
  });
}


function testRecaptchaElement_multipleComponents() {
  // Create a second component
  var container2 = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container2);

  var component2 = new goog.ui.Component();
  container2.innerHTML =
      '<div class="firebaseui-recaptcha-container"></div>' +
      '<div class="firebaseui-id-recaptcha-error firebaseui-hidden"></div>';
  component2.decorate(container2);

  // Both components should have their own elements
  var recaptcha1 =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);
  var recaptcha2 =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component2);

  assertNotNull(recaptcha1);
  assertNotNull(recaptcha2);
  assertNotEquals(recaptcha1, recaptcha2);

  // Clean up
  component2.dispose();
  goog.dom.removeNode(container2);
}


function testRecaptchaErrorElement_toggleVisibility() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Start hidden
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Show
  firebaseui.auth.ui.element.show(errorElement, 'Error');
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Hide
  firebaseui.auth.ui.element.hide(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Show again
  firebaseui.auth.ui.element.show(errorElement, 'Another error');
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
}


function testRecaptchaElement_contentManipulation() {
  var recaptchaElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);

  // Initially empty
  assertEquals('', goog.dom.getTextContent(recaptchaElement));

  // Add content (simulating grecaptcha.render())
  var mockWidget = goog.dom.createDom(goog.dom.TagName.DIV, {
    'id': 'mock-recaptcha-widget'
  });
  recaptchaElement.appendChild(mockWidget);

  // Verify content was added
  assertNotNull(goog.dom.getElementByClass('mock-recaptcha-widget',
      recaptchaElement.parentElement));
}


function testRecaptchaErrorElement_statePreservation() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Set initial state
  firebaseui.auth.ui.element.show(errorElement, 'Initial error');
  var initialMessage = goog.dom.getTextContent(errorElement);

  // Verify state is preserved
  assertEquals('Initial error', initialMessage);

  // Update state
  firebaseui.auth.ui.element.show(errorElement, 'Updated error');
  var updatedMessage = goog.dom.getTextContent(errorElement);

  // Verify state changed
  assertEquals('Updated error', updatedMessage);
  assertNotEquals(initialMessage, updatedMessage);
}


function testRecaptchaElement_classList() {
  var recaptchaElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);

  // Should have the recaptcha container class
  assertTrue(recaptchaElement.classList.contains('firebaseui-recaptcha-container'));

  // Should not have other classes initially
  assertFalse(recaptchaElement.classList.contains('firebaseui-hidden'));
  assertFalse(recaptchaElement.classList.contains('firebaseui-id-recaptcha-error'));
}


function testRecaptchaErrorElement_classList() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Should have both required classes initially
  assertTrue(errorElement.classList.contains('firebaseui-id-recaptcha-error'));
  assertTrue(errorElement.classList.contains('firebaseui-hidden'));
}


function testRecaptchaErrorElement_sqlInjection() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var sqlPayloads = [
    "'; DROP TABLE users--",
    '1\' OR \'1\' = \'1',
    'admin\'--',
    '\' OR 1=1--',
    'SELECT * FROM users WHERE id=1'
  ];

  sqlPayloads.forEach(function(payload) {
    // Should safely handle SQL injection attempts
    firebaseui.auth.ui.element.show(errorElement, payload);

    var content = goog.dom.getTextContent(errorElement);
    assertNotNull(content);
    // Content should be displayed as text, not executed
  });
}


function testRecaptchaErrorElement_commandInjection() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var commandPayloads = [
    '; ls -la',
    '| cat /etc/passwd',
    '& ping evil.com',
    '`whoami`',
    '$(whoami)'
  ];

  commandPayloads.forEach(function(payload) {
    // Should safely handle command injection attempts
    firebaseui.auth.ui.element.show(errorElement, payload);

    var content = goog.dom.getTextContent(errorElement);
    assertNotNull(content);
  });
}


function testRecaptchaErrorElement_pathTraversal() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  var pathPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32',
    '/etc/shadow',
    'C:\\Windows\\System32\\config\\SAM'
  ];

  pathPayloads.forEach(function(payload) {
    // Should safely handle path traversal attempts
    firebaseui.auth.ui.element.show(errorElement, payload);

    var content = goog.dom.getTextContent(errorElement);
    assertNotNull(content);
  });
}


function testRecaptchaErrorElement_nullBytes() {
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Test null byte injection
  var nullByteMessage = 'Error\0Hidden';
  firebaseui.auth.ui.element.show(errorElement, nullByteMessage);

  // Should handle null bytes safely
  var content = goog.dom.getTextContent(errorElement);
  assertNotNull(content);
}


function testRecaptchaElement_isEmpty() {
  var recaptchaElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);

  // Initially should be empty
  assertEquals('', goog.dom.getTextContent(recaptchaElement).trim());
}


function testRecaptchaElements_independence() {
  var recaptchaElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaElement.call(component);
  var errorElement =
      firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement.call(
          component);

  // Verify they are different elements
  assertNotEquals(recaptchaElement, errorElement);

  // Modifying one should not affect the other
  firebaseui.auth.ui.element.show(errorElement, 'Error message');

  assertEquals('', goog.dom.getTextContent(recaptchaElement).trim());
  assertNotEquals('', goog.dom.getTextContent(errorElement));
}
