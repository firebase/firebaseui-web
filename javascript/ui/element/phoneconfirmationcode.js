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
 * @fileoverview Binds handlers for phone confirmation code UI element.
 */

goog.provide('firebaseui.auth.ui.element.phoneConfirmationCode');

goog.require('firebaseui.auth.ui.element');
goog.require('goog.string');
goog.require('goog.ui.Component');


goog.scope(function() {
var element = firebaseui.auth.ui.element;


/**
 * @return {?Element} The confirmation code input.
 * @this {goog.ui.Component}
 */
element.phoneConfirmationCode.getPhoneConfirmationCodeElement = function() {
  return this.getElementByClass('firebaseui-id-phone-confirmation-code');
};


/**
 * @return {?Element} The error message element for the confirmation code input.
 * @this {goog.ui.Component}
 */
element.phoneConfirmationCode.getPhoneConfirmationCodeErrorElement =
    function() {
  return this.getElementByClass('firebaseui-id-phone-confirmation-code-error');
};


/**
 * Initializes the phone confirmation code element.
 * @param {function()=} opt_onEnter Callback to invoke when the ENTER key is
 *     pressed.
 * @this {goog.ui.Component}
 */
element.phoneConfirmationCode.initPhoneConfirmationCodeElement = function(
    opt_onEnter) {
  var confirmationCodeElement =
      element.phoneConfirmationCode.getPhoneConfirmationCodeElement.call(this);
  var errorElement =
      element.phoneConfirmationCode.getPhoneConfirmationCodeErrorElement.call(
          this);
  element.listenForInputEvent(this, confirmationCodeElement, function(e) {
    // Clear the error message.
    if (element.isShown(errorElement)) {
      element.setValid(confirmationCodeElement, true);
      element.hide(errorElement);
    }
  });
  if (opt_onEnter) {
    element.listenForEnterEvent(this, confirmationCodeElement, function(e) {
      opt_onEnter();
    });
  }
};


/**
 * @return {?string} The confirmation code if valid
 * @this {goog.ui.Component}
 */
element.phoneConfirmationCode.checkAndGetPhoneConfirmationCode = function() {
  var code = goog.string.trim(
      element.getInputValue(
          element.phoneConfirmationCode.getPhoneConfirmationCodeElement.call(
              this)) ||
      '');
  if (element.phoneConfirmationCode.isValidVerificationCode_(code)) {
    return code;
  } else {
    return null;
  }
};

/**
 * @param {string} verificationCode The code entered by the user.
 * @return {boolean} True if the given code is any six digit number.
 * @private
 */
element.phoneConfirmationCode.isValidVerificationCode_ = function(
    verificationCode) {
  return /^\d{6}$/.test(verificationCode);
};
});
