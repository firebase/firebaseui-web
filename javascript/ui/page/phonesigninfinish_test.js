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
 * @fileoverview Tests for the phone confirmation code entry page.
 */

goog.provide('firebaseui.auth.ui.page.PhoneSignInFinishTest');
goog.setTestOnly('firebaseui.auth.ui.page.PhoneSignInFinishTest');

goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.PhoneConfirmationCodeTestHelper');
goog.require('firebaseui.auth.ui.element.ResendTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.PhoneSignInFinish');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');


var mockClock;
var root;
var component;
var phoneNumber = '+13115552368';
var wasChangePhoneLinkClicked;
var onChangePhoneClick;
var wasResendLinkClicked;
var onResendClick;
var phoneConfirmationCodeTestHelper =
    new firebaseui.auth.ui.element.PhoneConfirmationCodeTestHelper()
        .registerTests();
var formTestHelper =
    new firebaseui.auth.ui.element.FormTestHelper().registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();
var resendTestHelper =
    new firebaseui.auth.ui.element.ResendTestHelper().registerTests();

function setUp() {
  // Set up clock.
  mockClock = new goog.testing.MockClock();
  mockClock.install();

  wasChangePhoneLinkClicked = false;
  onChangePhoneClick = function() {
    wasChangePhoneLinkClicked = true;
  };
  wasResendLinkClicked = false;
  onResendClick = function() {
    wasResendLinkClicked = true;
  };
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = createComponent(phoneNumber);
}

function tearDown() {
  // Tear down clock.
  mockClock.tick(Infinity);
  mockClock.reset();
  mockClock.uninstall();

  component.dispose();
  goog.dom.removeNode(root);
}


/**
 * @param {!string} phoneNumber The phone number being confirmed.
 * @param {number=} opt_delay The resend delay.
 * @return {!goog.ui.Component} The rendered PhoneSignInFinish component.
 */
function createComponent(phoneNumber, opt_delay) {
  var component = new firebaseui.auth.ui.page.PhoneSignInFinish(
      onChangePhoneClick,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      onResendClick, phoneNumber, opt_delay || 0);
  phoneConfirmationCodeTestHelper.setComponent(component);
  formTestHelper.setComponent(component);
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
  resendTestHelper.setComponent(component);
  resendTestHelper.resetState();
  component.render(root);
  return component;
}


/**
 * Asserts the resend link is hidden.
 * @param {!goog.ui.Component} component The PhoneSignInFinish component.
 * @param {boolean} isHidden True to assert hidden; false to assert visible.
 */
function assertResendLinkIsHidden(component, isHidden) {
  var el = component.getResendLink();
  assertEquals(isHidden, goog.dom.classlist.contains(el, 'firebaseui-hidden'));
}


/**
 * Asserts the resend countdown is hidden.
 * @param {!goog.ui.Component} component The PhoneSignInFinish component.
 * @param {boolean} isHidden True to assert hidden; false to assert visible.
 */
function assertResendCountdownIsHidden(component, isHidden) {
  var el = component.getResendCountdown();
  assertEquals(isHidden, goog.dom.classlist.contains(el, 'firebaseui-hidden'));
}


/**
 * Asserts the resend countdown indicates the given time remaining.
 * @param {!goog.ui.Component} component The PhoneSignInFinish component.
 * @param {number} timeRemaining The time remaining.
 */
function assertResendCountdown(component, timeRemaining) {
  var el = component.getResendCountdown();
  var expected = 'Resend code in ' + timeRemaining;
  var actual = goog.dom.getTextContent(el);
  assertEquals(expected, actual);
}


function testPhoneSignInFinish_componentRendering() {
  component.dispose();
  component = createComponent(phoneNumber);
  assertNotNull(component.getChangePhoneNumberElement());
  assertNotNull(component.getPhoneConfirmationCodeElement());
  assertNotNull(component.getPhoneConfirmationCodeErrorElement());
}


function testPhoneSignInFinish_initialFocus() {
  component.dispose();
  component = createComponent(phoneNumber);
  assertEquals(
      component.getPhoneConfirmationCodeElement(),
      goog.dom.getActiveElement(document));
}


function testPhoneSignInFinish_changePhoneNumberLink() {
  component.dispose();
  component = createComponent(phoneNumber);
  var link = component.getChangePhoneNumberElement();
  assertFalse(wasChangePhoneLinkClicked);
  goog.testing.events.fireClickSequence(link);
  assertTrue(wasChangePhoneLinkClicked);
}


function testPhoneSignInFinish_resendLink() {
  component.dispose();
  component = createComponent(phoneNumber);
  var link = component.getResendLink();
  assertFalse(wasResendLinkClicked);
  goog.testing.events.fireClickSequence(link);
  assertTrue(wasResendLinkClicked);
}


function testPhoneSignInFinish_timer() {
  component.dispose();

  component = createComponent(phoneNumber, 10);

  assertResendLinkIsHidden(component, true);
  assertResendCountdownIsHidden(component, false);

  // Assert double-digit display.
  assertResendCountdown(component, '0:10');

  // Assert single-digit display.
  mockClock.tick(1000);
  assertResendCountdown(component, '0:09');

  // Assert we only show whole seconds.
  mockClock.tick(500);
  assertResendCountdown(component, '0:09');

  // Assert link/countdown are toggled when timer expires.
  mockClock.tick(9000);
  assertResendLinkIsHidden(component, false);
  assertResendCountdownIsHidden(component, true);
}


function testPhoneSignInFinish_submitOnEnter() {
  component.dispose();
  component = createComponent(phoneNumber);
  goog.testing.events.fireKeySequence(
      component.getPhoneConfirmationCodeElement(), goog.events.KeyCodes.ENTER);
  formTestHelper.assertSubmitted();
}


function testSubmitOnSubmitElementClick() {
  component.dispose();
  component = createComponent(phoneNumber);
  var button = component.getSubmitElement();
  goog.testing.events.fireClickSequence(button);
  formTestHelper.assertSubmitted();
}


function testPhoneSignInFinish_pageEvents() {
  var pageTestHelper = new firebaseui.auth.ui.page.PageTestHelper();
  component = new firebaseui.auth.ui.page.PhoneSignInFinish(
      onChangePhoneClick,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      onResendClick, phoneNumber, 0);
  pageTestHelper.runTests(component, root);
}


function testPhoneSignInFinish_getPageId() {
  assertEquals('phoneSignInFinish', component.getPageId());
}
