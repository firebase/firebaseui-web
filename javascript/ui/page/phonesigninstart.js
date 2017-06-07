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
 * @fileoverview UI component for the phone entry page.
 */

goog.provide('firebaseui.auth.ui.page.PhoneSignInStart');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.phoneNumber');
goog.require('firebaseui.auth.ui.element.recaptcha');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('goog.dom.selection');



/**
 * UI component for the user to enter their phone number.
 * @param {function(?)} onSubmitClick Callback to invoke when enter key (or its
 *     equivalent) is detected on submission.
 * @param {function(?)} onCancelClick Callback to invoke when cancel button
 *     is clicked.
 * @param {boolean} enableVisibleRecaptcha Whether to enable visible reCAPTCHA.
 * @param {?string=} opt_countryId The ID (e164_key) of the country to
 *     pre-select.
 * @param {?string=} opt_nationalNumber The national number to pre-fill.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.PhoneSignInStart = function(
    onSubmitClick,
    onCancelClick,
    enableVisibleRecaptcha,
    opt_countryId,
    opt_nationalNumber,
    opt_domHelper) {
  var nationalNumber = opt_nationalNumber || null;
  firebaseui.auth.ui.page.PhoneSignInStart.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.phoneSignInStart,
      {
        enableVisibleRecaptcha: enableVisibleRecaptcha,
        nationalNumber: nationalNumber
      },
      opt_domHelper,
      'phoneSignInStart');
  /** @private @const {?string} The default country to select. */
  this.countryId_ = opt_countryId || null;
  /** @private {boolean} Whether to enable visible reCAPTCHA. */
  this.enableVisibleRecaptcha_ = enableVisibleRecaptcha;
  /** @private {?function(?)} On submit click callback. */
  this.onSubmitClick_ = onSubmitClick;
  /** @private {?function(?)} On cancel click callback. */
  this.onCancelClick_ = onCancelClick;
};
goog.inherits(
    firebaseui.auth.ui.page.PhoneSignInStart, firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.PhoneSignInStart.prototype.enterDocument = function() {
  this.initPhoneNumberElement(this.countryId_);
  // Handle a click on the submit button or cancel button.
  this.initFormElement(
      /** @type {function(?)} */ (this.onSubmitClick_),
      /** @type {function(?)} */ (this.onCancelClick_));
  this.setupFocus_();
  firebaseui.auth.ui.page.PhoneSignInStart.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.PhoneSignInStart.prototype.disposeInternal =
    function() {
  this.onSubmitClick_ = null;
  this.onCancelClick_ = null;
  firebaseui.auth.ui.page.PhoneSignInStart.base(this, 'disposeInternal');
};


/**
 * Sets up the focus order and auto focus.
 * @private
 */
firebaseui.auth.ui.page.PhoneSignInStart.prototype.setupFocus_ = function() {
  // Focus order.
  if (!this.enableVisibleRecaptcha_) {
    // When reCAPTCHA is not visible shift focus to submit button.
    this.focusToNextOnEnter(
        this.getPhoneNumberElement(), this.getSubmitElement());
  }
  // Otherwise, can't force focus on visible reCAPTCHA.

  // Do not submit directly on phone input enter since an invisible reCAPTCHA
  // must be triggered by a button click, otherwise it may force a visible
  // challenge.
  this.submitOnEnter(
      this.getSubmitElement(), /** @type {function()} */ (this.onSubmitClick_));
  // Auto focus the phone input and put the cursor at the end.
  this.getPhoneNumberElement().focus();
  goog.dom.selection.setCursorPosition(
      this.getPhoneNumberElement(),
      (this.getPhoneNumberElement().value || '').length);
};


goog.mixin(
    firebaseui.auth.ui.page.PhoneSignInStart.prototype,
    /** @lends {firebaseui.auth.ui.page.PhoneSignInStart.prototype} */
    {
      // For phone number input.
      getPhoneNumberElement:
          firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement,
      getPhoneNumberErrorElement:
          firebaseui.auth.ui.element.phoneNumber.getPhoneNumberErrorElement,
      initPhoneNumberElement:
          firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement,
      getPhoneNumberValue:
          firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue,

      // For visible reCAPTCHA.
      getRecaptchaElement:
          firebaseui.auth.ui.element.recaptcha.getRecaptchaElement,
      getRecaptchaErrorElement:
          firebaseui.auth.ui.element.recaptcha.getRecaptchaErrorElement,

      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });
