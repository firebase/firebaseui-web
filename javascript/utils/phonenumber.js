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

goog.provide('firebaseui.auth.PhoneNumber');

goog.require('firebaseui.auth.data.country');
goog.require('goog.string');


/**
 * Represents a phone number.
 * @param {string} countryId The ID of the phone number's country.
 * @param {string} nationalNumber The phone number without country code.
 * @constructor @final @struct
 */
firebaseui.auth.PhoneNumber = function(countryId, nationalNumber) {
  /** @const {string} */
  this.countryId = countryId;
  /** @const {string} */
  this.nationalNumber = nationalNumber;
};


/** @const {string} The ID of the default country (currently USA). */
firebaseui.auth.PhoneNumber.DEFAULT_COUNTRY_ID = '1-US-0';


/**
 * Converts a phone number string to a firebaseui.auth.PhoneNumber object.
 * Returns null if invalid.
 * @param {string} phoneNumberStr The full phone number string.
 * @return {?firebaseui.auth.PhoneNumber} The corresponding
 *     `firebaseui.auth.PhoneNumber` representation.
 */
firebaseui.auth.PhoneNumber.fromString = function(phoneNumberStr) {
  // Ideally libPhoneNumber should be used to parse the phone number string but
  // that dependency is too large to bundle with FirebaseUI-web, so we will
  // attempt a best effort approach to parse the 2 components.
  var trimmedPhoneNumber = goog.string.trim(phoneNumberStr);
  // Get matching countries if national number countains it.
  var countries = firebaseui.auth.data.country.LOOKUP_TREE.search(
      trimmedPhoneNumber);
  if (countries.length > 0) {
    var countryId;
    // Parse the country ID and national number components.
    // If the country code is +1, use US as default code.
    // Otherwise, just pick the first country.
    if (countries[0].e164_cc == '1') {
      countryId = firebaseui.auth.PhoneNumber.DEFAULT_COUNTRY_ID;
    } else {
      countryId = countries[0].e164_key;
    }
    // Get the national number. Add the + char to the e164_cc string.
    var nationalNumber =
        trimmedPhoneNumber.substr(countries[0].e164_cc.length + 1);
    // Return the phone number object.
    return new firebaseui.auth.PhoneNumber(
        countryId, goog.string.trim(nationalNumber));
  }
  return null;
};


/**
 * @return {string} The full phone number.
 */
firebaseui.auth.PhoneNumber.prototype.getPhoneNumber = function() {
  var countryData = firebaseui.auth.data.country.getCountryByKey(
      this.countryId);
  if (!countryData) {
    throw new Error('Country ID ' + this.countryId + ' not found.');
  }
  return '+' + countryData.e164_cc + this.nationalNumber;
};


/**
 * @return {?firebaseui.auth.data.country.Country} The country corresponding to
 *     the phone number's country ID.
 */
firebaseui.auth.PhoneNumber.prototype.getCountry = function() {
  return firebaseui.auth.data.country.getCountryByKey(
      this.countryId);
};
