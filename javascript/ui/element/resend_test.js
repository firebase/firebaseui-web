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
 * @fileoverview Tests for resend.js
 */

goog.provide('firebaseui.auth.ui.element.resendTest');
goog.setTestOnly('firebaseui.auth.ui.element.resendTest');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.resend');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new goog.ui.Component();
  container.innerHTML =
      '<div class="firebaseui-id-resend-countdown">Countdown</div>' +
      '<a class="firebaseui-id-resend-link firebaseui-hidden">Resend</a>';
  component.decorate(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetResendCountdown() {
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  assertNotNull(countdown);
  assertEquals('Countdown', goog.dom.getTextContent(countdown));
}


function testGetResendCountdown_notPresent() {
  container.innerHTML = '<a class="firebaseui-id-resend-link">Resend</a>';
  component = new goog.ui.Component();
  component.decorate(container);

  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  assertNull(countdown);
}


function testGetResendLink() {
  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  assertNotNull(link);
  assertEquals('Resend', goog.dom.getTextContent(link));
}


function testGetResendLink_notPresent() {
  container.innerHTML = '<div class="firebaseui-id-resend-countdown">Countdown</div>';
  component = new goog.ui.Component();
  component.decorate(container);

  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  assertNull(link);
}


function testHideResendCountdown() {
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  // Initially visible
  assertFalse(firebaseui.auth.ui.element.isShown(countdown));

  // Show it first
  firebaseui.auth.ui.element.show(countdown);
  assertTrue(firebaseui.auth.ui.element.isShown(countdown));

  // Hide it
  firebaseui.auth.ui.element.resend.hideResendCountdown.call(component);
  assertFalse(firebaseui.auth.ui.element.isShown(countdown));
}


function testShowResendLink() {
  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  // Initially hidden
  assertFalse(firebaseui.auth.ui.element.isShown(link));

  // Show it
  firebaseui.auth.ui.element.resend.showResendLink.call(component);
  assertTrue(firebaseui.auth.ui.element.isShown(link));
}


function testUpdateResendCountdown_singleDigit() {
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 5);

  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  var text = goog.dom.getTextContent(countdown);
  assertTrue(text.indexOf('0:05') >= 0);
}


function testUpdateResendCountdown_doubleDigit() {
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 45);

  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  var text = goog.dom.getTextContent(countdown);
  assertTrue(text.indexOf('0:45') >= 0);
}


function testUpdateResendCountdown_zero() {
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 0);

  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  var text = goog.dom.getTextContent(countdown);
  assertTrue(text.indexOf('0:00') >= 0);
}


function testUpdateResendCountdown_largeNumber() {
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 59);

  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  var text = goog.dom.getTextContent(countdown);
  assertTrue(text.indexOf('0:59') >= 0);
}


function testUpdateResendCountdown_sequentialUpdates() {
  // Simulate countdown from 10 to 0
  for (var i = 10; i >= 0; i--) {
    firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, i);

    var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
        component);
    var text = goog.dom.getTextContent(countdown);

    if (i >= 10) {
      assertTrue(text.indexOf('0:' + i) >= 0);
    } else {
      assertTrue(text.indexOf('0:0' + i) >= 0);
    }
  }
}


function testResendWorkflow_countdownToLink() {
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);
  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  // Initially, countdown is shown, link is hidden
  firebaseui.auth.ui.element.show(countdown);
  assertFalse(firebaseui.auth.ui.element.isShown(link));

  // Update countdown a few times
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 3);
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 2);
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 1);
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 0);

  // Hide countdown and show link
  firebaseui.auth.ui.element.resend.hideResendCountdown.call(component);
  firebaseui.auth.ui.element.resend.showResendLink.call(component);

  assertFalse(firebaseui.auth.ui.element.isShown(countdown));
  assertTrue(firebaseui.auth.ui.element.isShown(link));
}


function testHideResendCountdown_alreadyHidden() {
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  // Already hidden
  assertFalse(firebaseui.auth.ui.element.isShown(countdown));

  // Hide again (should not throw)
  firebaseui.auth.ui.element.resend.hideResendCountdown.call(component);
  assertFalse(firebaseui.auth.ui.element.isShown(countdown));
}


function testShowResendLink_alreadyShown() {
  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  // Show it
  firebaseui.auth.ui.element.resend.showResendLink.call(component);
  assertTrue(firebaseui.auth.ui.element.isShown(link));

  // Show again (should not throw)
  firebaseui.auth.ui.element.resend.showResendLink.call(component);
  assertTrue(firebaseui.auth.ui.element.isShown(link));
}


function testUpdateResendCountdown_negativeNumber() {
  // Test with negative number (edge case)
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, -1);

  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  // Should still update without throwing error
  assertNotNull(countdown);
}


function testUpdateResendCountdown_boundary9to10() {
  // Test the boundary between single and double digit formatting
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 10);
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);
  var text10 = goog.dom.getTextContent(countdown);
  assertTrue(text10.indexOf('0:10') >= 0);

  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 9);
  var text9 = goog.dom.getTextContent(countdown);
  assertTrue(text9.indexOf('0:09') >= 0);
}


function testUpdateResendCountdown_multipleDigits() {
  // Test with numbers that would be 3 digits (minutes)
  // The function formats as "0:XX" so large numbers might be unexpected
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 99);

  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  // Should still work without error
  assertNotNull(goog.dom.getTextContent(countdown));
}


function testResendLink_textContent() {
  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  assertEquals('Resend', goog.dom.getTextContent(link));
}


function testResendCountdown_initialState() {
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);
  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  // Check initial state from setUp
  assertEquals('Countdown', goog.dom.getTextContent(countdown));
  assertEquals('Resend', goog.dom.getTextContent(link));
}


function testUpdateResendCountdown_preservesElement() {
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);
  var originalElement = countdown;

  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 30);

  var countdownAfterUpdate = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  // Should be the same element
  assertEquals(originalElement, countdownAfterUpdate);
}


function testHideShowCycle() {
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);
  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  // Show countdown, hide link
  firebaseui.auth.ui.element.show(countdown);
  assertFalse(firebaseui.auth.ui.element.isShown(link));

  // Hide countdown, show link
  firebaseui.auth.ui.element.resend.hideResendCountdown.call(component);
  firebaseui.auth.ui.element.resend.showResendLink.call(component);

  assertFalse(firebaseui.auth.ui.element.isShown(countdown));
  assertTrue(firebaseui.auth.ui.element.isShown(link));

  // Hide link, show countdown again
  firebaseui.auth.ui.element.hide(link);
  firebaseui.auth.ui.element.show(countdown);

  assertTrue(firebaseui.auth.ui.element.isShown(countdown));
  assertFalse(firebaseui.auth.ui.element.isShown(link));
}


function testUpdateResendCountdown_float() {
  // Test with float number (should be handled)
  firebaseui.auth.ui.element.resend.updateResendCountdown.call(component, 5.7);

  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);

  // Should still create a countdown message
  assertNotNull(goog.dom.getTextContent(countdown));
}


function testResendElements_independentState() {
  var countdown = firebaseui.auth.ui.element.resend.getResendCountdown.call(
      component);
  var link = firebaseui.auth.ui.element.resend.getResendLink.call(component);

  // Show countdown
  firebaseui.auth.ui.element.show(countdown);
  assertTrue(firebaseui.auth.ui.element.isShown(countdown));

  // Link should still be in its original state (hidden)
  assertFalse(firebaseui.auth.ui.element.isShown(link));

  // Show link
  firebaseui.auth.ui.element.resend.showResendLink.call(component);
  assertTrue(firebaseui.auth.ui.element.isShown(link));

  // Countdown should still be shown (they're independent)
  assertTrue(firebaseui.auth.ui.element.isShown(countdown));
}
