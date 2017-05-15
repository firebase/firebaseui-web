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
 * @fileoverview Tests for phonenumber.js.
 */

goog.provide('firebaseui.auth.PhoneNumberTest');

goog.require('firebaseui.auth.PhoneNumber');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.PhoneNumberTest');


function testPhoneNumber() {
  var countryId = '45-DK-0';
  var nationalNumber = '6505550101';
  var phoneNumber = new firebaseui.auth.PhoneNumber(countryId, nationalNumber);
  assertEquals(countryId, phoneNumber.countryId);
  assertEquals(nationalNumber, phoneNumber.nationalNumber);
  assertEquals('+45' + nationalNumber, phoneNumber.getPhoneNumber());
}


function testPhoneNumber_badCountryId() {
  var countryId = 'iAmInvalid';
  var nationalNumber = '6505550101';
  var phoneNumber = new firebaseui.auth.PhoneNumber(countryId, nationalNumber);
  assertThrows(function() {
    phoneNumber.getPhoneNumber();
  });
}
