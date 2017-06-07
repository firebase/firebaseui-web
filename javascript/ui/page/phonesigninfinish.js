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
 * @fileoverview UI component for the phone confirmation code entry page.
 */

goog.provide('firebaseui.auth.ui.page.PhoneSignInFinish');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.phoneConfirmationCode');
goog.require('firebaseui.auth.ui.element.resend');
goog.require('firebaseui.auth.ui.page.Base');


/**
 * UI component for the user to enter a phone confirmation code.
 * @param {function()} onChangePhoneNumberClick Callback to invoke when change
 *     phone number link is clicked.
 * @param {function()} onSubmitClick Callback to invoke when enter key (or its
 *     equivalent) is detected on submission.
 * @param {function()} onCancelClick Callback to invoke when cancel button
 *     is clicked.
 * @param {function()} onResendClick Callback to invoke when resend link
 *     is clicked.
 * @param {string} phoneNumber the phone number to confirm.
 * @param {number} resendDelay The resend delay.
 * @param {?string=} opt_tosUrl The Terms of Service URL from the developer.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.PhoneSignInFinish = function(
    onChangePhoneNumberClick, onSubmitClick, onCancelClick, onResendClick,
    phoneNumber, resendDelay, opt_tosUrl, opt_domHelper) {
  firebaseui.auth.ui.page.PhoneSignInFinish.base(
      this, 'constructor', firebaseui.auth.soy2.page.phoneSignInFinish,
      {
        phoneNumber: phoneNumber,
        tosUrl: opt_tosUrl
      },
      opt_domHelper, 'phoneSignInFinish');
  /** @private {string} the phone number to confirm. */
  this.phoneNumber_ = phoneNumber;
  /** @private {number} The resend delay. */
  this.resendDelay_ = resendDelay;
  /** @private {?goog.Timer} A resend timer with a one-second interval. */
  this.resendTimer_ = new goog.Timer(1000);
  /** @private {number} The seconds remaining before enabling resend. */
  this.secondsRemaining_ = resendDelay;
  /** @private {?function()} On edit click callback. */
  this.onChangePhoneNumberClick_ = onChangePhoneNumberClick;
  /** @private {?function()} On submit click callback. */
  this.onSubmitClick_ = onSubmitClick;
  /** @private {?function()} On cancel click callback. */
  this.onCancelClick_ = onCancelClick;
  /** @private {?function()} On resend click callback. */
  this.onResendClick_ = onResendClick;
};
goog.inherits(
    firebaseui.auth.ui.page.PhoneSignInFinish, firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.PhoneSignInFinish.prototype.enterDocument = function() {
  var self = this;
  // Init countdown.
  this.updateResendCountdown(this.resendDelay_);
  goog.events.listen(
      this.resendTimer_, goog.Timer.TICK, this.handleTickEvent_, false, this);
  this.resendTimer_.start();
  // Handle change phone number click.
  firebaseui.auth.ui.element.listenForActionEvent(
      this, this.getChangePhoneNumberElement(), function(e) {
        self.onChangePhoneNumberClick_();
      });
  // Handle resend click.
  firebaseui.auth.ui.element.listenForActionEvent(
      this, this.getResendLink(), function(e) {
        self.onResendClick_();
      });
  // Submit if user taps enter while confirmation code element has focus.
  this.initPhoneConfirmationCodeElement(
      /** @type {function()} */ (this.onSubmitClick_));
  // Handle a click on the submit button or cancel button.
  this.initFormElement(
      /** @type {function()} */ (this.onSubmitClick_),
      /** @type {function()} */ (this.onCancelClick_));
  this.setupFocus_();
  firebaseui.auth.ui.page.PhoneSignInFinish.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.PhoneSignInFinish.prototype.disposeInternal =
    function() {
  this.onChangePhoneNumberClick_ = null;
  this.onSubmitClick_ = null;
  this.onCancelClick_ = null;
  this.onResendClick_ = null;
  // Dispose of countdown.
  this.resendTimer_.stop();
  goog.events.unlisten(
      this.resendTimer_, goog.Timer.TICK, this.handleTickEvent_);
  this.resendTimer_ = null;
  firebaseui.auth.ui.page.PhoneSignInFinish.base(this, 'disposeInternal');
};


/**
 * Handles clock tick events.
 * @private
 */
firebaseui.auth.ui.page.PhoneSignInFinish.prototype.handleTickEvent_ =
    function() {
  this.secondsRemaining_ -= 1;
  if (this.secondsRemaining_ > 0) {
    this.updateResendCountdown(this.secondsRemaining_);
  } else {
    this.resendTimer_.stop();
    goog.events.unlisten(
        this.resendTimer_, goog.Timer.TICK, this.handleTickEvent_);
    this.hideResendCountdown();
    this.showResendLink();
  }
};


/**
 * Sets up the focus order and auto focus.
 * @private
 */
firebaseui.auth.ui.page.PhoneSignInFinish.prototype.setupFocus_ = function() {
  this.getPhoneConfirmationCodeElement().focus();
};


/**
 * @return {?Element} The change phone number link.
 */
firebaseui.auth.ui.page.PhoneSignInFinish.prototype
    .getChangePhoneNumberElement = function() {
  return this.getElementByClass('firebaseui-id-change-phone-number-link');
};


goog.mixin(
    firebaseui.auth.ui.page.PhoneSignInFinish.prototype,
    /** @lends {firebaseui.auth.ui.page.PhoneSignInFinish.prototype} */
    {
      // For confirmation code input.
      getPhoneConfirmationCodeElement:
          firebaseui.auth.ui.element.phoneConfirmationCode
              .getPhoneConfirmationCodeElement,
      getPhoneConfirmationCodeErrorElement:
          firebaseui.auth.ui.element.phoneConfirmationCode
              .getPhoneConfirmationCodeErrorElement,
      initPhoneConfirmationCodeElement:
          firebaseui.auth.ui.element.phoneConfirmationCode
              .initPhoneConfirmationCodeElement,
      checkAndGetPhoneConfirmationCode:
          firebaseui.auth.ui.element.phoneConfirmationCode
              .checkAndGetPhoneConfirmationCode,
      getResendCountdown: firebaseui.auth.ui.element.resend.getResendCountdown,
      updateResendCountdown:
          firebaseui.auth.ui.element.resend.updateResendCountdown,
      hideResendCountdown:
          firebaseui.auth.ui.element.resend.hideResendCountdown,
      getResendLink: firebaseui.auth.ui.element.resend.getResendLink,
      showResendLink: firebaseui.auth.ui.element.resend.showResendLink,

      // For form.
      getSubmitElement: firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement: firebaseui.auth.ui.element.form.initFormElement
    });
