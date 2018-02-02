/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview FirebaseUI phone Auth result.
 */

goog.provide('firebaseui.auth.PhoneAuthResult');

goog.require('goog.Promise');


/**
 * Wrapper object for firebase.auth.ConfirmationResult with additional error
 * handler for confirm method.
 * @param {!firebase.auth.ConfirmationResult} confirmationResult The
 *     confirmation result from phone Auth.
 * @param {(function(!Error):!goog.Promise)=} opt_errorHandler The error handler
 *     for confirm method.
 * @constructor
 */
firebaseui.auth.PhoneAuthResult = function(
    confirmationResult, opt_errorHandler) {
  /**
   * @const @private {!firebase.auth.ConfirmationResult} The confirmation result
   *     from a phone number sign-in or link.
   */
  this.confirmationResult_ = confirmationResult;
  /**
   * @const @private {function(*):*} The error handler for confirm method.
   *     If not provided, the error will be rethrown.
   */
  this.errorHandler_ = opt_errorHandler || function(error) {throw error;};
  /** @const {string} The verification ID in confirmation result. */
  this.verificationId = confirmationResult['verificationId'];

};


/**
 * @param {string} verificationCode The verification code.
 * @return {!goog.Promise<!firebase.auth.UserCredential>} The user credential.
 */
firebaseui.auth.PhoneAuthResult.prototype.confirm = function(verificationCode) {
  return goog.Promise.resolve(
      this.confirmationResult_.confirm(verificationCode))
      .thenCatch(this.errorHandler_);
};


/**
 * @return {!firebase.auth.ConfirmationResult} The confirmation result.
 */
firebaseui.auth.PhoneAuthResult.prototype.getConfirmationResult = function() {
  return this.confirmationResult_;
};




