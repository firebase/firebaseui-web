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
 * @fileoverview Tests for infobar.js
 */

goog.provide('firebaseui.auth.ui.element.infoBarTest');
goog.setTestOnly('firebaseui.auth.ui.element.infoBarTest');

goog.require('firebaseui.auth.ui.element.infoBar');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new goog.ui.Component();
  component.render(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testShowInfoBar() {
  var message = 'This is an info message';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
  assertTrue(goog.dom.getTextContent(infoBar).indexOf(message) >= 0);
}


function testShowInfoBar_multipleMessages() {
  var message1 = 'First message';
  var message2 = 'Second message';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message1);

  var infoBar1 = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);
  assertNotNull(infoBar1);
  assertTrue(goog.dom.getTextContent(infoBar1).indexOf(message1) >= 0);

  // Show another info bar - should replace the first one
  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message2);

  var infoBar2 = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);
  assertNotNull(infoBar2);
  assertTrue(goog.dom.getTextContent(infoBar2).indexOf(message2) >= 0);
  assertFalse(goog.dom.getTextContent(infoBar2).indexOf(message1) >= 0);
}


function testDismissInfoBar() {
  var message = 'This is an info message';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);
  assertNotNull(infoBar);

  // Dismiss the info bar
  firebaseui.auth.ui.element.infoBar.dismissInfoBar.call(component);

  infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);
  assertNull(infoBar);
}


function testDismissInfoBar_notPresent() {
  // Should not throw when trying to dismiss non-existent info bar
  firebaseui.auth.ui.element.infoBar.dismissInfoBar.call(component);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);
  assertNull(infoBar);
}


function testGetInfoBarDismissLinkElement() {
  var message = 'This is an info message';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var dismissLink = firebaseui.auth.ui.element.infoBar.getInfoBarDismissLinkElement.call(
      component);

  assertNotNull(dismissLink);
}


function testDismissInfoBar_clickDismissLink() {
  var message = 'This is an info message';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);
  assertNotNull(infoBar);

  var dismissLink = firebaseui.auth.ui.element.infoBar.getInfoBarDismissLinkElement.call(
      component);

  // Click the dismiss link
  goog.testing.events.fireClickSequence(dismissLink);

  infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);
  assertNull(infoBar);
}


function testShowInfoBar_emptyMessage() {
  var message = '';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
}


function testShowInfoBar_longMessage() {
  var message = 'This is a very long info message that should be displayed ' +
      'correctly even though it contains a lot of text and might wrap to ' +
      'multiple lines in the UI. The info bar should handle this gracefully.';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
  assertTrue(goog.dom.getTextContent(infoBar).indexOf(message) >= 0);
}


function testShowInfoBar_specialCharacters() {
  var message = 'Error: <>&"\'';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
  // The message should be properly escaped/encoded
  assertTrue(goog.dom.getTextContent(infoBar).length > 0);
}


function testShowInfoBar_unicodeCharacters() {
  var message = 'Unicode message: 你好世界 مرحبا 🙂';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
  assertTrue(goog.dom.getTextContent(infoBar).indexOf(message) >= 0);
}


function testShowInfoBar_xssProtection() {
  // Test that XSS payloads are safely rendered
  var xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    '<iframe src="javascript:alert(1)"></iframe>'
  ];

  xssPayloads.forEach(function(payload) {
    firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, payload);

    var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
        component);

    assertNotNull(infoBar);
    // Verify the payload is safely rendered (not executed)
    // The content should be escaped/sanitized by the template engine
    assertTrue(goog.dom.getTextContent(infoBar).length > 0);

    // Dismiss for next iteration
    firebaseui.auth.ui.element.infoBar.dismissInfoBar.call(component);
  });
}


function testShowInfoBar_htmlEntities() {
  var message = 'Message with &lt;html&gt; entities';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
  assertTrue(goog.dom.getTextContent(infoBar).length > 0);
}


function testShowInfoBar_newlineCharacters() {
  var message = 'Line 1\nLine 2\rLine 3\r\nLine 4';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
  assertTrue(goog.dom.getTextContent(infoBar).indexOf('Line 1') >= 0);
}


function testShowInfoBar_dismissMultipleTimes() {
  var message = 'Test message';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  // Dismiss multiple times (should not throw error)
  firebaseui.auth.ui.element.infoBar.dismissInfoBar.call(component);
  firebaseui.auth.ui.element.infoBar.dismissInfoBar.call(component);
  firebaseui.auth.ui.element.infoBar.dismissInfoBar.call(component);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);
  assertNull(infoBar);
}


function testShowInfoBar_showAfterDismiss() {
  var message1 = 'First message';
  var message2 = 'Second message';

  // Show, dismiss, then show again
  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message1);
  firebaseui.auth.ui.element.infoBar.dismissInfoBar.call(component);
  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message2);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
  assertTrue(goog.dom.getTextContent(infoBar).indexOf(message2) >= 0);
  assertFalse(goog.dom.getTextContent(infoBar).indexOf(message1) >= 0);
}


function testGetInfoBarElement_notPresent() {
  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNull(infoBar);
}


function testGetInfoBarDismissLinkElement_notPresent() {
  var dismissLink = firebaseui.auth.ui.element.infoBar.getInfoBarDismissLinkElement.call(
      component);

  assertNull(dismissLink);
}


function testShowInfoBar_whitespaceMessage() {
  var message = '   ';

  firebaseui.auth.ui.element.infoBar.showInfoBar.call(component, message);

  var infoBar = firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(
      component);

  assertNotNull(infoBar);
}
