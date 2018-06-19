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
 * @fileoverview Tests for the phone entry page.
 */

goog.provide('firebaseui.auth.ui.page.PhoneSignInStartTest');
goog.setTestOnly('firebaseui.auth.ui.page.PhoneSignInStartTest');

goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.PhoneNumberTestHelper');
goog.require('firebaseui.auth.ui.element.RecaptchaTestHelper');
goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.PhoneSignInStart');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');


var root;
var component;
var phoneNumberTestHelper =
    new firebaseui.auth.ui.element.PhoneNumberTestHelper().registerTests();
var recaptchaTestHelper =
    new firebaseui.auth.ui.element.RecaptchaTestHelper().registerTests();
var formTestHelper =
    new firebaseui.auth.ui.element.FormTestHelper().registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();
var tosPpTestHelper =
    new firebaseui.auth.ui.element.TosPpTestHelper().registerTests();


/**
 * @param {boolean} enableVisibleRecaptcha Whether to enable a visible reCAPTCHA
 *     or an invisible one otherwise.
 * @param {?string} tosUrl The ToS URL.
 * @param {?string} privacyPolicyUrl The Privacy Policy URL.
 * @param {?string=} opt_countryId The ID (e164_key) of the country to
 *     pre-select.
 * @param {?string=} opt_nationalNumber The national number to pre-fill.
 * @return {!goog.ui.Component} The rendered PhoneSignInStart component.
 */
function createComponent(enableVisibleRecaptcha, tosUrl, privacyPolicyUrl,
    opt_countryId, opt_nationalNumber) {
  var component = new firebaseui.auth.ui.page.PhoneSignInStart(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      enableVisibleRecaptcha, tosUrl, privacyPolicyUrl, false,
      opt_countryId, opt_nationalNumber);
  component.render(root);
  phoneNumberTestHelper.setComponent(component);
  recaptchaTestHelper.setComponent(component);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
  tosPpTestHelper.setComponent(component);
  return component;
}


function setUp() {
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = createComponent(true, 'http://localhost/tos',
      'http://localhost/privacy_policy');
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(root);
}


function testPhoneSignInStart_visibleAndInvisibleRecaptcha() {
  component.dispose();
  // With invisible reCAPTCHA.
  component = createComponent(false);
  assertNull(component.getRecaptchaElement());
  assertNull(component.getRecaptchaErrorElement());
  // With visible reCAPTCHA.
  component.dispose();
  component = createComponent(true);
  assertNotNull(component.getRecaptchaElement());
  assertNotNull(component.getRecaptchaErrorElement());
}


function testPhoneSignInStart_prefillValue() {
  component.dispose();

  component = createComponent(false, null, null, '45-DK-0', '6505550101');

  // The prefilled number should be returned.
  assertEquals('+456505550101', component.getPhoneNumberValue()
      .getPhoneNumber());
  assertEquals('6505550101', component.getPhoneNumberElement().value);
}


function testPhoneSignInStart_footer() {
  component.dispose();
  component = createComponent(false, 'http://localhost/tos',
      'http://localhost/privacy_policy');
  tosPpTestHelper.assertPhoneFooter('http://localhost/tos',
      'http://localhost/privacy_policy');
  component.dispose();
  component = createComponent(false, null, null);
  tosPpTestHelper.assertPhoneFooter(null, null);
}


function testPhoneSignInStart_fullMessage() {
  component.dispose();
  component = new firebaseui.auth.ui.page.PhoneSignInStart(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      false,
      'http://localhost/tos',
      'http://localhost/privacy_policy',
      true);
  component.render(root);
  tosPpTestHelper.setComponent(component);
  tosPpTestHelper.assertPhoneFullMessage('http://localhost/tos',
      'http://localhost/privacy_policy');
  component.dispose();
}


function testPhoneSignInStart_fullMessage_noUrl() {
  component.dispose();
  component = new firebaseui.auth.ui.page.PhoneSignInStart(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      false,
      null,
      null,
      true);
  component.render(root);
  tosPpTestHelper.setComponent(component);
  tosPpTestHelper.assertPhoneFullMessage(null, null);
  component.dispose();
}


function testInitialFocus_phoneNumber() {
  component.dispose();
  component = createComponent(true);
  assertEquals(
      component.getPhoneNumberElement(),
      goog.dom.getActiveElement(document));
}


function testFocusOnPhoneNumber_invisibleRecaptcha() {
  component.dispose();
  component = createComponent(false);
  goog.testing.events.fireKeySequence(
      component.getPhoneNumberElement(), goog.events.KeyCodes.ENTER);
  assertEquals(
      component.getSubmitElement(),
      goog.dom.getActiveElement(document));
}


function testFocusOnPhoneNumber_visibleRecaptcha() {
  component.dispose();
  component = createComponent(true);
  goog.testing.events.fireKeySequence(
      component.getPhoneNumberElement(), goog.events.KeyCodes.ENTER);
  assertNotEquals(
      component.getSubmitElement(),
      goog.dom.getActiveElement(document));
}


function testSubmitOnSubmitElementEnter() {
  component.dispose();
  component = createComponent(true);
  goog.testing.events.fireKeySequence(
      component.getSubmitElement(), goog.events.KeyCodes.ENTER);
  formTestHelper.assertSubmitted();
}


function testPhoneSignInStart_pageEvents() {
  // Run page event tests.
  var pageTestHelper = new firebaseui.auth.ui.page.PageTestHelper();
  // Initialize component.
  component = new firebaseui.auth.ui.page.PhoneSignInStart(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      true);
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testPhoneSignInStart_getPageId() {
  assertEquals('phoneSignInStart', component.getPageId());
}
