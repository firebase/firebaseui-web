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


function testPhoneNumber_fromString() {
  // Empty string.
  assertNull(firebaseui.auth.PhoneNumber.fromString(''));

  // Missing plus sign.
  assertNull(firebaseui.auth.PhoneNumber.fromString('11234567890'));

  // Invalid.
  assertNull(firebaseui.auth.PhoneNumber.fromString('bla1234567890'));

  // Valid number with +1 code should always map to US.
  assertObjectEquals(
      new firebaseui.auth.PhoneNumber('1-US-0', '1234567890'),
      firebaseui.auth.PhoneNumber.fromString('+11234567890'));

  // Phone number with no national number should still be accepted.
  assertObjectEquals(
      new firebaseui.auth.PhoneNumber('1-US-0', ''),
      firebaseui.auth.PhoneNumber.fromString('+1'));

  // Other codes that are shared will just pick the first match instead of the
  // more likely 44-GB-0 country code.
  assertObjectEquals(
      new firebaseui.auth.PhoneNumber('44-GG-0', '1234567890'),
      firebaseui.auth.PhoneNumber.fromString('+441234567890'));

  // Parsing should not reformat the number.
  assertObjectEquals(
      new firebaseui.auth.PhoneNumber('1-US-0', '(123) 456-7890'),
      firebaseui.auth.PhoneNumber.fromString(' +1 (123) 456-7890 '));
  assertObjectEquals(
      new firebaseui.auth.PhoneNumber('1-US-0', '(123)456-7890'),
      firebaseui.auth.PhoneNumber.fromString('+1(123)456-7890'));

  // Parsing a country code that is only used by one country.
  assertObjectEquals(
      new firebaseui.auth.PhoneNumber('52-MX-0', '1234567890'),
      firebaseui.auth.PhoneNumber.fromString('+521234567890'));
}


function testPhoneNumber_getCountry() {
  var phoneNumber = new firebaseui.auth.PhoneNumber('52-MX-0', '1234567890');
  assertEquals('MX', phoneNumber.getCountry().iso2_cc);

  phoneNumber = new firebaseui.auth.PhoneNumber('1-US-0', '1234567890');
  assertEquals('US', phoneNumber.getCountry().iso2_cc);

  phoneNumber = new firebaseui.auth.PhoneNumber('invalid', '1234567890');
  assertNull(phoneNumber.getCountry());
}
