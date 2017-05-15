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
goog.require('firebaseui.auth.ui.page.Base');


/**
 * UI component for the user to enter a phone confirmation code.
 * @param {function()} onChangePhoneNumberClick Callback to invoke when change
 *     phone number link is clicked.
 * @param {function()} onSubmitClick Callback to invoke when enter key (or its
 *     equivalent) is detected on submission.
 * @param {function()} onCancelClick Callback to invoke when cancel button
 *     is clicked.
 * @param {string} phoneNumber the phone number to confirm.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.PhoneSignInFinish = function(
    onChangePhoneNumberClick, onSubmitClick, onCancelClick, phoneNumber,
    opt_domHelper) {
  firebaseui.auth.ui.page.PhoneSignInFinish.base(
      this, 'constructor', firebaseui.auth.soy2.page.phoneSignInFinish,
      {phoneNumber: phoneNumber}, opt_domHelper, 'phoneSignInFinish');
  /** @private {string} the phone number to confirm. */
  this.phoneNumber_ = phoneNumber;
  /** @private {?function()} On edit click callback. */
  this.onChangePhoneNumberClick_ = onChangePhoneNumberClick;
  /** @private {?function()} On submit click callback. */
  this.onSubmitClick_ = onSubmitClick;
  /** @private {?function()} On cancel click callback. */
  this.onCancelClick_ = onCancelClick;
};
goog.inherits(
    firebaseui.auth.ui.page.PhoneSignInFinish, firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.PhoneSignInFinish.prototype.enterDocument = function() {
  var self = this;
  // Handle change phone number click
  firebaseui.auth.ui.element.listenForActionEvent(
      this, this.getChangePhoneNumberElement(), function(e) {
        self.onChangePhoneNumberClick_();
      });
  // Submit if user taps enter while confirmation code element has focus
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
  firebaseui.auth.ui.page.PhoneSignInFinish.base(this, 'disposeInternal');
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
  return this.getElementByClass(
      goog.getCssName('firebaseui-id-change-phone-number-link'));
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

      // For form.
      getSubmitElement: firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement: firebaseui.auth.ui.element.form.initFormElement
    });
