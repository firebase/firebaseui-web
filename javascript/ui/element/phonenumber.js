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
goog.require('goog.dom.forms');
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
  return this.getElementByClass('firebaseui-id-phone-number');
};


/**
 * @return {?Element}
 * @this {goog.ui.Component}
 * @private
 */
element.phoneNumber.getCountrySelectorFlagElement_ = function() {
  return this.getElementByClass('firebaseui-id-country-selector-flag');
};


/**
 * @return {?Element}
 * @this {goog.ui.Component}
 * @private
 */
element.phoneNumber.getCountrySelectorCodeElement_ = function() {
  return this.getElementByClass('firebaseui-id-country-selector-code');
};


/**
 * @return {?Element}
 * @this {goog.ui.Component}
 * @private
 */
element.phoneNumber.getCountrySelectorElement_ = function() {
  return this.getElementByClass('firebaseui-id-country-selector');
};


/**
 * @return {?Element} The error message element for the phone number input.
 * @this {goog.ui.Component}
 */
element.phoneNumber.getPhoneNumberErrorElement = function() {
  return this.getElementByClass('firebaseui-id-phone-number-error');
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
    // Get national number.
    var nationalNumber = goog.string.trim(
        element.getInputValue(phoneNumberElement) || '');
    // Get current country ID selected.
    var selectedCountry = firebaseui.auth.data.country.getCountryByKey(
        this.phoneNumberSelectedCountryId_);
    // Get matching countries if national number countains it.
    var countries =
        firebaseui.auth.data.country.LOOKUP_TREE.search(nationalNumber);
    // If country code provided with national number and it does not match the
    // selected one, update active selection..
    if (countries.length && countries[0].e164_cc != selectedCountry.e164_cc) {
      // Pick first one.
      var country = countries[0];
      element.phoneNumber.selectCountry.call(
          self,
          // For +1, use US as default.
          country.e164_cc == '1' ? element.phoneNumber.DEFAULT_COUNTRY_ID :
          country.e164_key);
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
        element.phoneNumber.selectCountry.call(self, id, true);
        // Focus the phone number text input after a country is selected.
        self.getPhoneNumberElement().focus();
      }, this.phoneNumberSelectedCountryId_);
};


/**
 * Changes the active country in the country selector.
 * @param {string} id The ID of the country to select.
 * @param {boolean=} opt_overrideCountryCode Whether to override the country
 *     code if provided in the national number.
 * @this {goog.ui.Component}
 */
element.phoneNumber.selectCountry = function(id, opt_overrideCountryCode) {
  var country = firebaseui.auth.data.country.getCountryByKey(id);
  if (!country) {
    return;
  }
  // Override country code in national number if provided.
  if (!!opt_overrideCountryCode) {
    var nationalNumber = goog.string.trim(element.getInputValue(
        element.phoneNumber.getPhoneNumberElement.call(this)) || '');
    // Get current selected countries from the national number if available.
    var countries =
        firebaseui.auth.data.country.LOOKUP_TREE.search(nationalNumber);
    // If country code provided with national number and it does not match newly
    // selected code, replace it in the national number with the newly selected
    // country code.
    if (countries.length && countries[0].e164_cc != country.e164_cc) {
      // Update national number with newly selected code.
      nationalNumber = '+' + country.e164_cc +
          nationalNumber.substr(countries[0].e164_cc.length + 1);
      // Re-populate the number in the form.
      goog.dom.forms.setValue(
          element.phoneNumber.getPhoneNumberElement.call(this), nationalNumber);
    }
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
  // Get current selected countries from the national number if available.
  var countries =
    firebaseui.auth.data.country.LOOKUP_TREE.search(nationalNumber);
  // Get selected active country.
  var selectedCountry = firebaseui.auth.data.country.getCountryByKey(
      this.phoneNumberSelectedCountryId_);
  // If user manually changed the country code and it is the same country code
  // do not change it back.
  // This is useful when the user switches to the same country code but for a
  // different country. In that case we honor the user's selection.
  if (countries.length && countries[0].e164_cc != selectedCountry.e164_cc) {
    element.phoneNumber.selectCountry.call(this, countries[0].e164_key);
  }
  // Remove country code prefix from national number.
  if (countries.length) {
    nationalNumber = nationalNumber.substr(countries[0].e164_cc.length + 1);
  }
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
