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
 * @fileoverview Helper class for testing the phone number UI element.
 */

goog.provide('firebaseui.auth.ui.element.PhoneNumberTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.PhoneNumberTestHelper');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.dialog');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.PhoneNumberTestHelper = function() {
  element.PhoneNumberTestHelper.base(this, 'constructor', 'PhoneNumber');

  window['dialogPolyfill'] = {
    'registerDialog': function(dialog) {
      dialog.showModal = function() {};
      dialog.close = function() {};
    }
  };
};
goog.inherits(element.PhoneNumberTestHelper, element.ElementTestHelper);


/** @override */
element.PhoneNumberTestHelper.prototype.resetState = function() {
  this.selectCountry(element.phoneNumber.DEFAULT_COUNTRY_ID);

  element.setValid(this.component.getPhoneNumberElement());
  goog.dom.forms.setValue(this.component.getPhoneNumberElement(), '');
  element.hide(this.component.getPhoneNumberErrorElement());
};


/**
 * @param {string} e164Key The e164_key of the country to select, as defined
 * in javascript/data/country.js.
 */
element.PhoneNumberTestHelper.prototype.selectCountry = function(e164Key) {
  element.phoneNumber.selectCountry.call(this.component, e164Key);
};


/** @private */
element.PhoneNumberTestHelper.prototype.testGetPhoneNumberElement_ =
    function() {
  assertNotNull(this.component.getPhoneNumberElement());
};


/** @private */
element.PhoneNumberTestHelper.prototype.testGetPhoneNumberErrorElement_ =
    function() {
  assertNotNull(this.component.getPhoneNumberErrorElement());
};


/** @private */
element.PhoneNumberTestHelper.prototype.testGetPhoneNumber_ = function() {
  var nationalNumber = '6505550101';
  var countryCode = '+1';

  // Test getPhoneNumber using the default country code.
  var e = this.component.getPhoneNumberElement();
  goog.dom.forms.setValue(e, nationalNumber);
  var result = this.component.getPhoneNumberValue();
  assertEquals(countryCode + nationalNumber, result.getPhoneNumber());
  assertEquals(nationalNumber, result.nationalNumber);
  assertEquals(element.phoneNumber.DEFAULT_COUNTRY_ID, result.countryId);
  goog.dom.forms.setValue(e, '');
  // As only country code provided, this is considered missing.
  assertNull(this.component.getPhoneNumberValue());
};


/** @private */
element.PhoneNumberTestHelper.prototype.testOnTextChangedClearError_ =
    function() {
  var phoneNumber = this.component.getPhoneNumberElement();
  var error = this.component.getPhoneNumberErrorElement();

  var errorMessage = 'Invalid phone number';

  // Show an error.
  element.setValid(phoneNumber, false);
  element.show(error, errorMessage);
  this.checkInputInvalid(phoneNumber);
  this.checkErrorShown(error, errorMessage);

  // Emulate that a '1' is typed in to the phone number input. The error should
  // be cleared.
  goog.dom.forms.setValue(phoneNumber, '1');
  this.fireInputEvent(phoneNumber, goog.events.KeyCodes.NUM_ONE);
  this.checkInputValid(phoneNumber);
  this.checkErrorHidden(error);
};


/** @private */
element.PhoneNumberTestHelper.prototype.testChangeCountry_ =
    function() {
  var nationalNumber = '6505550101';
  var nationalNumber2 = '6505552323';

  // Change the country to Denmark.
  // Open the country selector.
  var countrySelector = this.getCountrySelectorElement_();
  goog.testing.events.fireClickSequence(countrySelector);
  // Check that the Denmark button is there, and click it.
  var denmarkButton = this.getDialogButtonContainingText_('Denmark');
  assertNotNull(denmarkButton);
  assertEquals('Denmark \u200e+45', denmarkButton.textContent);
  goog.testing.events.fireClickSequence(denmarkButton);

  // The button content and icon should be updated.
  assertEquals('\u200e+45', countrySelector.textContent);
  assertTrue(goog.dom.classlist.contains(this.getCountrySelectorFlagElement_(),
      'firebaseui-flag-DK'));

  // The phone input should now be focused.
  var phoneInput = this.component.getPhoneNumberElement();
  assertEquals(document.activeElement, phoneInput);

  // The returned phone number should have a Denmark country code (+45).
  goog.dom.forms.setValue(phoneInput, nationalNumber);
  var result = this.component.getPhoneNumberValue();
  assertEquals('+45' + nationalNumber, result.getPhoneNumber());
  assertEquals(nationalNumber, result.nationalNumber);
  assertEquals('45-DK-0', result.countryId);
  goog.dom.forms.setValue(phoneInput, '');

  // Now, change the country to France.
  // Open the country selector.
  var countrySelector = this.getCountrySelectorElement_();
  goog.testing.events.fireClickSequence(countrySelector);
  // Check that the France button is there, and click it.
  var franceButton = this.getDialogButtonContainingText_('France');
  assertNotNull(franceButton);
  assertEquals('France \u200e+33', franceButton.textContent);
  goog.testing.events.fireClickSequence(franceButton);

  // The button content should be updated.
  assertEquals('\u200e+33', countrySelector.textContent);
  assertFalse(goog.dom.classlist.contains(this.getCountrySelectorFlagElement_(),
      'firebaseui-flag-DK'));
  assertTrue(goog.dom.classlist.contains(this.getCountrySelectorFlagElement_(),
      'firebaseui-flag-FR'));

  // The returned phone number should have a France country code (+33).
  var phoneInput = this.component.getPhoneNumberElement();
  goog.dom.forms.setValue(phoneInput, nationalNumber2);
  var result = this.component.getPhoneNumberValue();
  assertEquals('+33' + nationalNumber2, result.getPhoneNumber());
  assertEquals(nationalNumber2, result.nationalNumber);
  goog.dom.forms.setValue(phoneInput, '');
};


/**
 * @return {?Element} The country selector button.
 * @private
 */
element.PhoneNumberTestHelper.prototype.getCountrySelectorElement_ =
    function() {
  return this.component.getElementByClass(
      goog.getCssName('firebaseui-id-country-selector'));
};


/**
 * @return {?Element} The country selector button.
 * @private
 */
element.PhoneNumberTestHelper.prototype.getCountrySelectorFlagElement_ =
    function() {
  return this.component.getElementByClass(
      goog.getCssName('firebaseui-id-country-selector-flag'));
};


/**
 * Gets a button in the currently displayed dialog that contains the given
 * string.
 * @param {string} text The text to search for.
 * @return {?Element}
 * @private
 */
element.PhoneNumberTestHelper.prototype.getDialogButtonContainingText_ =
    function(text) {
  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement
      .call(this.component);
  var buttons = goog.dom.getElementsByTagName('button', dialog);
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent.indexOf(text) !== -1) {
      return buttons[i];
    }
  }
  return null;
};
});
