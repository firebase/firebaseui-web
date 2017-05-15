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
