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
 * @fileoverview Binds handlers for phone number UI element.
 */

goog.provide('firebaseui.auth.ui.element.phoneNumber');
goog.provide('firebaseui.auth.ui.firebaseui.auth.PhoneNumber');

goog.require('firebaseui.auth.PhoneNumber');
goog.require('firebaseui.auth.data.country');
goog.require('firebaseui.auth.data.country.COUNTRY_LIST');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.listBoxDialog');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.string');
goog.require('goog.ui.Component');



goog.scope(function() {
var element = firebaseui.auth.ui.element;


/** @const {string} The ID of the default country (currently USA). */
element.phoneNumber.DEFAULT_COUNTRY_ID = '1-US-0';


/**
 * @return {?Element} The phone number input.
 * @this {goog.ui.Component}
 */
element.phoneNumber.getPhoneNumberElement = function() {
  return this.getElementByClass(goog.getCssName('firebaseui-id-phone-number'));
};


/**
 * @return {?Element}
 * @this {goog.ui.Component}
 * @private
 */
element.phoneNumber.getCountrySelectorFlagElement_ = function() {
  return this.getElementByClass(
      goog.getCssName('firebaseui-id-country-selector-flag'));
};


/**
 * @return {?Element}
 * @this {goog.ui.Component}
 * @private
 */
element.phoneNumber.getCountrySelectorCodeElement_ = function() {
  return this.getElementByClass(
      goog.getCssName('firebaseui-id-country-selector-code'));
};


/**
 * @return {?Element}
 * @this {goog.ui.Component}
 * @private
 */
element.phoneNumber.getCountrySelectorElement_ = function() {
  return this.getElementByClass(
      goog.getCssName('firebaseui-id-country-selector'));
};


/**
 * @return {?Element} The error message element for the phone number input.
 * @this {goog.ui.Component}
 */
element.phoneNumber.getPhoneNumberErrorElement = function() {
  return this.getElementByClass(
      goog.getCssName('firebaseui-id-phone-number-error'));
};


/**
 * Initializes the phone number element.
 * @param {?string=} opt_countryId The ID of the country to pre-select.
 * @param {function()=} opt_onEnter Callback to invoke when the ENTER key is
 *     pressed.
 * @this {goog.ui.Component}
 */
element.phoneNumber.initPhoneNumberElement = function(opt_countryId,
    opt_onEnter) {
  var self = this;
  var phoneNumberElement = element.phoneNumber.getPhoneNumberElement.call(this);
  var countrySelectorElement = element.phoneNumber.getCountrySelectorElement_
      .call(this);
  var errorElement = element.phoneNumber.getPhoneNumberErrorElement.call(this);

  // Select a default country.
  var countryId = opt_countryId || element.phoneNumber.DEFAULT_COUNTRY_ID;
  element.phoneNumber.selectCountry.call(this, countryId);

  // Initialize the country selector button.
  element.listenForActionEvent(this, countrySelectorElement, function(e) {
    element.phoneNumber.handleCountrySelectorButtonClick_.call(self);
  });

  // Initialize the text input.
  element.listenForInputEvent(this, phoneNumberElement, function(e) {
    // Clear the error message.
    if (element.isShown(errorElement)) {
      element.setValid(phoneNumberElement, true);
      element.hide(errorElement);
    }
  });

  if (opt_onEnter) {
    element.listenForEnterEvent(this, phoneNumberElement, function(e) {
      opt_onEnter();
    });
  }
};


/**
 * Converts the list of countries to a format recognized by the list box
 * component.
 * @return {!Array<!element.listBoxDialog.Item>}
 * @this {goog.ui.Component}
 * @private
 */
element.phoneNumber.createListBoxItemList_ = function() {
  return goog.array.map(firebaseui.auth.data.country.COUNTRY_LIST,
      function(country) {
        return {
          id: country.e164_key,
          iconClass: 'firebaseui-flag ' +
              element.phoneNumber.getFlagClass_(country),
          label: country.name + ' ' +
              element.phoneNumber.makeDisplayableCountryCode_(country.e164_cc)
        };
      });
};


/**
 * Converts a country to the CSS class of that country's flag.
 * @param {!firebaseui.auth.data.country.Country} country
 * @return {string}
 * @private
 */
element.phoneNumber.getFlagClass_ = function(country) {
  return 'firebaseui-flag-' + country.iso2_cc;
};

/**
 * Handles a selection in the country selector dialog.
 * @this {goog.ui.Component}
 * @private
 */
element.phoneNumber.handleCountrySelectorButtonClick_ = function() {
  var self = this;
  firebaseui.auth.ui.element.listBoxDialog.showListBoxDialog.call(this,
      element.phoneNumber.createListBoxItemList_(),
      function(id) {
        element.phoneNumber.selectCountry.call(self, id);
        // Focus the phone number text input after a country is selected.
        self.getPhoneNumberElement().focus();
      }, this.phoneNumberSelectedCountryId_);
};


/**
 * Changes the active country in the country selector.
 * @param {string} id The ID of the country to select.
 * @this {goog.ui.Component}
 */
element.phoneNumber.selectCountry = function(id) {
  var country = firebaseui.auth.data.country.getCountryByKey(id);
  if (!country) {
    return;
  }

  var oldCountry = firebaseui.auth.data.country.getCountryByKey(
      this.phoneNumberSelectedCountryId_);
  this.phoneNumberSelectedCountryId_ = id;

  var flagElement = element.phoneNumber.getCountrySelectorFlagElement_
      .call(this);
  if (oldCountry) {
    goog.dom.classlist.remove(flagElement,
        element.phoneNumber.getFlagClass_(oldCountry));
  }
  goog.dom.classlist.add(flagElement,
      element.phoneNumber.getFlagClass_(country));

  // Update the text on the button.
  var buttonDisplayText = element.phoneNumber.makeDisplayableCountryCode_(
      country.e164_cc);
  goog.dom.setTextContent(
      element.phoneNumber.getCountrySelectorCodeElement_.call(this),
      buttonDisplayText);
};


/**
 * @return {?firebaseui.auth.PhoneNumber} The value of the phone number input.
 * @this {goog.ui.Component}
 */
element.phoneNumber.getPhoneNumberValue = function() {
  var nationalNumber = goog.string.trim(element.getInputValue(
      element.phoneNumber.getPhoneNumberElement.call(this)) || '');
  // If only country code provided, consider the phone number missing.
  if (!nationalNumber) {
    return null;
  }
  return new firebaseui.auth.PhoneNumber(this.phoneNumberSelectedCountryId_,
      nationalNumber);
};


/**
 * @param {string} countryCode The country code.
 * @return {string} A string displayable in UI to represent the country code.
 * @private
 */
element.phoneNumber.makeDisplayableCountryCode_ = function(countryCode) {
  // Add LTR marks since this should display like "+123" even in RTL languages.
  return '\u200e+' + countryCode;
};
});
