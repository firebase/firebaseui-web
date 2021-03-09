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

goog.require('firebaseui.auth.data.country.COUNTRY_LIST');
goog.require('firebaseui.auth.data.country.LOOKUP_TREE');
goog.require('firebaseui.auth.data.country.LookupTree');
goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.PhoneNumberTestHelper');
goog.require('firebaseui.auth.ui.element.RecaptchaTestHelper');
goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.PhoneSignInStart');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.requireType('goog.ui.Component');


var mockClock;
var root;
var component;
var tosCallback;
var privacyPolicyCallback;
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
var pageTestHelper =
    new firebaseui.auth.ui.page.PageTestHelper().registerTests();


/**
 * @param {boolean} enableVisibleRecaptcha Whether to enable a visible reCAPTCHA
 *     or an invisible one otherwise.
 * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
 *     is clicked.
 * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
 *     Privacy Policy link is clicked.
 * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
 *     message of Term of Service and Privacy Policy.
 * @param {?firebaseui.auth.data.country.LookupTree=} opt_lookupTree The country
 *     lookup prefix tree to search country code with.
 * @param {?string=} opt_countryId The ID (e164_key) of the country to
 *     pre-select.
 * @param {?string=} opt_nationalNumber The national number to pre-fill.
 * @return {!goog.ui.Component} The rendered PhoneSignInStart component.
 */
function createComponent(enableVisibleRecaptcha, opt_tosCallback,
    opt_privacyPolicyCallback, opt_displayFullTosPpMessage, opt_lookupTree,
    opt_countryId, opt_nationalNumber) {
  var component = new firebaseui.auth.ui.page.PhoneSignInStart(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      enableVisibleRecaptcha,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      opt_tosCallback,
      opt_privacyPolicyCallback,
      opt_displayFullTosPpMessage,
      opt_lookupTree,
      opt_countryId,
      opt_nationalNumber);
  component.render(root);
  phoneNumberTestHelper.setComponent(component);
  recaptchaTestHelper.setComponent(component);
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


function testPhoneSignInStart_visibleAndInvisibleRecaptcha() {
  component.dispose();
  // With invisible reCAPTCHA.
  component = createComponent(false);
  // Country selector defaults to US.
  assertEquals('\u200e+1', component.getCountrySelectorElement().textContent);
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

  component = createComponent(false, null, null, false, null,
                              '45-DK-0', '6505550101');

  // The prefilled number should be returned.
  assertEquals('+456505550101', component.getPhoneNumberValue()
      .getPhoneNumber());
  assertEquals('6505550101', component.getPhoneNumberElement().value);
}


function testPhoneSignInStart_provideCountries_noDefaultCountry() {
  // Tests that available countries is provided but no default country is
  // configured so the default country is set to the first available country.
  var nationalNumber = '6505550101';
  component.dispose();
  var countries = firebaseui.auth.data.country.COUNTRY_LIST.slice(1, 20);
  var lookupTree = new firebaseui.auth.data.country.LookupTree(countries);
  component = createComponent(false, null, null, false, lookupTree);
  var countrySelector = component.getCountrySelectorElement();
  // Default to the first country in the list provided since US is not in the
  // list and no default country being set.
  assertEquals('\u200e+' + countries[0].e164_cc, countrySelector.textContent);
  goog.testing.events.fireClickSequence(countrySelector);
  var buttons = goog.dom.getElementsByTagName(
      'button', component.getDialogElement());
  // Change to the second country in the list by clicking the second button.
  goog.testing.events.fireClickSequence(buttons[1]);
  assertEquals('\u200e+' + countries[1].e164_cc, countrySelector.textContent);

  var phoneInput = component.getPhoneNumberElement();
  goog.dom.forms.setValue(phoneInput, nationalNumber);
  var result = this.component.getPhoneNumberValue();
  assertEquals('+' + countries[1].e164_cc + nationalNumber,
               result.getPhoneNumber());
  assertEquals(nationalNumber, result.nationalNumber);
  assertEquals(countries[1].e164_key, result.countryId);

  // Change back to +358, the first country should be selected.
  goog.dom.forms.setValue(phoneInput, '+');
  phoneNumberTestHelper.fireInputEvent(
      phoneInput, goog.events.KeyCodes.PLUS_SIGN);
  // The second country should still be selected.
  assertEquals('\u200e+' + countries[1].e164_cc, countrySelector.textContent);
  goog.dom.forms.setValue(phoneInput, '+' + countries[0].e164_cc);
  phoneNumberTestHelper.fireInputEvent(
      phoneInput, goog.events.KeyCodes.NUM_THREE);
  phoneNumberTestHelper.fireInputEvent(
      phoneInput, goog.events.KeyCodes.NUM_FIVE);
  phoneNumberTestHelper.fireInputEvent(
      phoneInput, goog.events.KeyCodes.NUM_EIGHT);
  //The button content and icon should reflect the first country's code.
  assertEquals('\u200e+' + countries[0].e164_cc, countrySelector.textContent);
}


function testPhoneSignInStart_provideCountries_withDefaultCountry() {
  component.dispose();
  component = createComponent(false, null, null, false,
                              firebaseui.auth.data.country.LOOKUP_TREE,
                              '86-CN-0');
  var countrySelector = component.getCountrySelectorElement();
  // Should be default to China.
  assertEquals('\u200e+86', countrySelector.textContent);
}


function testPhoneSignInStart_defaultCountryNotAvailable() {
  // Tests that available countries are provided but default country is
  // not in the available country list so the default country is ignored.
  // Provides 1st to 20th countries in full country list and sets default to
  // 21st country. Verifies that default country will be set to 1st country
  // since the default country is not available.
  component.dispose();
  var countries = firebaseui.auth.data.country.COUNTRY_LIST.slice(0, 20);
  var lookupTree = new firebaseui.auth.data.country.LookupTree(countries);
  component = createComponent(false, null, null, false, lookupTree,
                              firebaseui.auth.data.country.COUNTRY_LIST[20]);
  var countrySelector = component.getCountrySelectorElement();
  // Default to the first country in the list provided since US is not in the
  // list and default countries is not available.
  assertEquals('\u200e+' + countries[0].e164_cc, countrySelector.textContent);
}


function testPhoneSignInStart_noOnCancelClick() {
  component.dispose();
  // Initialize component with no onCancelClick callback.
  component = new firebaseui.auth.ui.page.PhoneSignInStart(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      true,
      null);
  component.render(root);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  // Cancel button should be hidden.
  assertNull(component.getSecondaryLinkElement());
  // Submit button should be available.
  assertNotNull(component.getSubmitElement());
}


function testPhoneSignInStart_footer() {
  component.dispose();
  component = createComponent(false, tosCallback, privacyPolicyCallback);
  tosPpTestHelper.assertPhoneFooter(tosCallback, privacyPolicyCallback);
  component.dispose();
  component = createComponent(false, null, null);
  tosPpTestHelper.assertPhoneFooter(null, null);
}


function testPhoneSignInStart_fullMessage() {
  component.dispose();
  component = createComponent(false, tosCallback, privacyPolicyCallback, true);
  tosPpTestHelper.assertPhoneFullMessage(tosCallback, privacyPolicyCallback);
  component.dispose();
}


function testPhoneSignInStart_fullMessage_noUrl() {
  component.dispose();
  component = createComponent(false, null, null, true);
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
  // Initialize component.
  component = new firebaseui.auth.ui.page.PhoneSignInStart(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      true,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testPhoneSignInStart_getPageId() {
  assertEquals('phoneSignInStart', component.getPageId());
}
