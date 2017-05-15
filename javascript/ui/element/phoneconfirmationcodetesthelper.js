/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Helper class for testing the phone confirmation code
 * UI element.
 */

goog.provide('firebaseui.auth.ui.element.PhoneConfirmationCodeTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.PhoneConfirmationCodeTestHelper');
goog.require('firebaseui.auth.ui.element');
/** @suppress {extraRequire} Required for test helpers. */
goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.array');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');


goog.scope(function() {
var element = firebaseui.auth.ui.element;


/** @constructor */
element.PhoneConfirmationCodeTestHelper = function() {
  element.PhoneConfirmationCodeTestHelper.base(
      this, 'constructor', 'PhoneConfirmationCode');
};
goog.inherits(
    element.PhoneConfirmationCodeTestHelper, element.ElementTestHelper);


/** @override */
element.PhoneConfirmationCodeTestHelper.prototype.resetState = function() {
  element.setValid(this.component.getPhoneConfirmationCodeElement());
  goog.dom.forms.setValue(this.component.getPhoneConfirmationCodeElement(), '');
  element.hide(this.component.getPhoneConfirmationCodeErrorElement());
};


/** @private */
element.PhoneConfirmationCodeTestHelper.prototype
    .testGetPhoneConfirmationCodeElement_ = function() {
  assertNotNull(this.component.getPhoneConfirmationCodeElement());
};


/** @private */
element.PhoneConfirmationCodeTestHelper.prototype
    .testGetPhoneConfirmationCodeErrorElement_ = function() {
  assertNotNull(this.component.getPhoneConfirmationCodeErrorElement());
};


/** @private */
element.PhoneConfirmationCodeTestHelper.prototype
    .testCheckAndGetPhoneConfirmationCode_ = function() {
  var e = this.component.getPhoneConfirmationCodeElement();
  // Test error cases
  var invalidCodes = [
    '',         // empty
    '123',      // too short
    '1234567',  // too long
    'a12356',   // char
  ];
  goog.array.forEach(invalidCodes, function(code) {
    goog.dom.forms.setValue(e, code);
    assertNull(this.component.checkAndGetPhoneConfirmationCode());
  }, this);
  // Test success cases
  var validCodes = [
    '123456',
    '000123',  // leading zeroes
  ];
  goog.array.forEach(validCodes, function(code) {
    goog.dom.forms.setValue(e, code);
    assertNotNull(this.component.checkAndGetPhoneConfirmationCode());
  }, this);
};


/** @private */
element.PhoneConfirmationCodeTestHelper.prototype.testOnTextChangedClearError_ =
    function() {
  var confirmationCode = this.component.getPhoneConfirmationCodeElement();
  var error = this.component.getPhoneConfirmationCodeErrorElement();

  var errorMessage = 'Invalid confirmation code';

  // Show an error.
  element.setValid(confirmationCode, false);
  element.show(error, errorMessage);
  this.checkInputInvalid(confirmationCode);
  this.checkErrorShown(error, errorMessage);

  // Emulate that a '1' is typed in to the phone number input. The error should
  // be cleared.
  goog.dom.forms.setValue(confirmationCode, '1');
  this.fireInputEvent(confirmationCode, goog.events.KeyCodes.NUM_ONE);
  this.checkInputValid(confirmationCode);
  this.checkErrorHidden(error);
};
});
