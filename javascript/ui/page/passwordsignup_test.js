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
 * @fileoverview Tests for the password sign-up page.
 */

goog.provide('firebaseui.auth.ui.page.PasswordSignUpTest');
goog.setTestOnly('firebaseui.auth.ui.page.PasswordSignUpTest');

goog.require('firebaseui.auth.ui.element.EmailTestHelper');
goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.NameTestHelper');
goog.require('firebaseui.auth.ui.element.NewPasswordTestHelper');
goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.PasswordSignUp');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.requireType('goog.ui.Component');


var mockClock;
var root;
var component;
var tosCallback;
var privacyPolicyCallback;
var emailTestHelper = new firebaseui.auth.ui.element.EmailTestHelper().
    excludeTests('testOnEnter_', 'testOnTextChanged_').
    registerTests();
var nameTestHelper =
    new firebaseui.auth.ui.element.NameTestHelper().registerTests();
var newPasswordTestHelper =
    new firebaseui.auth.ui.element.NewPasswordTestHelper().registerTests();
var formTestHelper =
    new firebaseui.auth.ui.element.FormTestHelper().registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();
var tosPpTestHelper =
    new firebaseui.auth.ui.element.TosPpTestHelper().registerTests();
var pageTestHelper =
    new firebaseui.auth.ui.page.PageTestHelper().registerTests();

/**
 * @param {boolean} requireDisplayName Whether to show the display name.
 * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
 *     is clicked.
 * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
 *     Privacy Policy link is clicked.
 * @param {string=} opt_name The name to prefill.
 * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
 *     message of Term of Service and Privacy Policy.
 * @return {!goog.ui.Component} The rendered PhoneSignInFinish component.
 */
function createComponent(
    requireDisplayName, opt_tosCallback, opt_privacyPolicyCallback, opt_name,
    opt_displayFullTosPpMessage) {
  var component = new firebaseui.auth.ui.page.PasswordSignUp(
      requireDisplayName,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      'user@example.com',
      opt_name,
      opt_tosCallback,
      opt_privacyPolicyCallback,
      opt_displayFullTosPpMessage);
  component.render(root);
  emailTestHelper.setComponent(component);
  nameTestHelper.setComponent(component);
  newPasswordTestHelper.setComponent(component);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
  tosPpTestHelper.setComponent(component);
  // Reset previous state of tosPp helper.
  tosPpTestHelper.resetState();
  pageTestHelper.setClock(mockClock).setComponent(component);
  return component;
}


function setUp() {
  // Set up clock.
  mockClock = new goog.testing.MockClock();
  mockClock.install();
  tosCallback = goog.bind(
      firebaseui.auth.ui.element.TosPpTestHelper.prototype.onTosLinkClick,
      tosPpTestHelper);
  privacyPolicyCallback = goog.bind(
      firebaseui.auth.ui.element.TosPpTestHelper.prototype.onPpLinkClick,
      tosPpTestHelper);
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = createComponent(true, tosCallback, privacyPolicyCallback);
}


function tearDown() {
  // Tear down clock.
  mockClock.tick(Infinity);
  mockClock.reset();
  component.dispose();
  goog.dom.removeNode(root);
}


function testInitialFocus_email() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = new firebaseui.auth.ui.page.PasswordSignUp(
      true,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  component.render(root);
  assertEquals(
      component.getEmailElement(),
      goog.dom.getActiveElement(document));
}


function testInitialFocus_nameIsRequired() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  assertEquals(
      component.getNameElement(),
      goog.dom.getActiveElement(document));
}


function testInitialFocus_nameIsNotRequired() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = createComponent(false);
  assertNull(component.getNameElement());
}


function testInitialFocus_newPassword() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = createComponent(
      true, tosCallback, privacyPolicyCallback, 'John Doe');
  assertEquals(
      component.getNewPasswordElement(),
      goog.dom.getActiveElement(document));
  tosPpTestHelper.setComponent(component);
  tosPpTestHelper.assertFooter(tosCallback, privacyPolicyCallback);
}


function testFocusOnEmailEnter_nameIsRequired() {
  goog.testing.events.fireKeySequence(
      component.getEmailElement(), goog.events.KeyCodes.ENTER);
  assertEquals(
      component.getNameElement(),
      goog.dom.getActiveElement(document));
}


function testFocusOnEmailEnter_nameIsNotRequired() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = new firebaseui.auth.ui.page.PasswordSignUp(
      false,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  component.render(root);

  // When name is not present, the focus should move to
  // password field on pressing enter.
  goog.testing.events.fireKeySequence(
      component.getEmailElement(), goog.events.KeyCodes.ENTER);
  assertEquals(
      component.getNewPasswordElement(),
      goog.dom.getActiveElement(document));
}


function testFocusToNewPasswordOnNameEnter() {
  goog.testing.events.fireKeySequence(
      component.getNameElement(), goog.events.KeyCodes.ENTER);
  assertEquals(
      component.getNewPasswordElement(),
      goog.dom.getActiveElement(document));
}


function testSubmitOnNewPasswordEnter() {
  component.dispose();
  component = createComponent(true); // No ToS.
  goog.testing.events.fireKeySequence(
      component.getNewPasswordElement(), goog.events.KeyCodes.ENTER);
  formTestHelper.assertSubmitted();
  tosPpTestHelper.assertFooter(null, null);
}


function testPasswordSignUp_fullMessage() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = createComponent(
      true, tosCallback, privacyPolicyCallback, undefined, true);
  tosPpTestHelper.assertFullMessage(
      tosCallback, privacyPolicyCallback);
}


function testPasswordSignUp_fullMessage_noUrl() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = createComponent(true, null, null, undefined, true);
  tosPpTestHelper.assertFullMessage(null, null);
}


function testPasswordSignUp_pageEvents() {
  // Run page event tests.
  // Initialize component.
  component = new firebaseui.auth.ui.page.PasswordSignUp(
      true,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testPasswordSignUp_getPageId() {
  assertEquals('passwordSignUp', component.getPageId());
}
