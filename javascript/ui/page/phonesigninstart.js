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
goog.require('firebaseui.auth.ui.element.dialog');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.phoneNumber');
goog.require('firebaseui.auth.ui.element.recaptcha');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('goog.dom.selection');
goog.requireType('firebaseui.auth.data.country.LookupTree');
goog.requireType('goog.dom.DomHelper');


/**
 * UI component for the user to enter their phone number.
 */
firebaseui.auth.ui.page.PhoneSignInStart =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {function(?)} onSubmitClick Callback to invoke when enter key (or
   *     its equivalent) is detected on submission.
   * @param {boolean} enableVisibleRecaptcha Whether to enable visible
   *     reCAPTCHA.
   * @param {?function(?)=} opt_onCancelClick Callback to invoke when cancel
   *     button is clicked.
   * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
   *     Privacy Policy link is clicked.
   * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
   *     message of Term of Service and Privacy Policy.
   * @param {?firebaseui.auth.data.country.LookupTree=} opt_lookupTree The
   *     country lookup prefix tree to search country code with.
   * @param {?string=} opt_countryId The ID (e164_key) of the country to
   *     pre-select.
   * @param {?string=} opt_nationalNumber The national number to pre-fill.
   * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(
      onSubmitClick, enableVisibleRecaptcha, opt_onCancelClick, opt_tosCallback,
      opt_privacyPolicyCallback, opt_displayFullTosPpMessage, opt_lookupTree,
      opt_countryId, opt_nationalNumber, opt_domHelper) {
    var nationalNumber = opt_nationalNumber || null;
    super(
        firebaseui.auth.soy2.page.phoneSignInStart, {
          enableVisibleRecaptcha: enableVisibleRecaptcha,
          nationalNumber: nationalNumber,
          displayCancelButton: !!opt_onCancelClick,
          displayFullTosPpMessage: !!opt_displayFullTosPpMessage
        },
        opt_domHelper, 'phoneSignInStart', {
          tosCallback: opt_tosCallback,
          privacyPolicyCallback: opt_privacyPolicyCallback
        });
    /** @private @const {?string} The default country to select. */
    this.countryId_ = opt_countryId || null;
    /** @private {boolean} Whether to enable visible reCAPTCHA. */
    this.enableVisibleRecaptcha_ = enableVisibleRecaptcha;
    /** @private {?function(?)} On submit click callback. */
    this.onSubmitClick_ = onSubmitClick;
    /** @private {?function(?)} On cancel click callback. */
    this.onCancelClick_ = opt_onCancelClick || null;
    /**
     * @private {?firebaseui.auth.data.country.LookupTree} The country
     *     lookup prefix tree to search country code with.
     */
    this.lookupTree_ = opt_lookupTree || null;
  }

  /** @override */
  enterDocument() {
    this.initPhoneNumberElement(this.lookupTree_, this.countryId_);
    // Handle a click on the submit button or cancel button.
    this.initFormElement(
        /** @type {function(?)} */ (this.onSubmitClick_),
        this.onCancelClick_ || undefined);
    this.setupFocus_();
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onSubmitClick_ = null;
    this.onCancelClick_ = null;
    super.disposeInternal();
  }

  /**
   * Sets up the focus order and auto focus.
   * @private
   */
  setupFocus_() {
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
        this.getSubmitElement(),
        /** @type {function()} */ (this.onSubmitClick_));
    // Auto focus the phone input and put the cursor at the end.
    this.getPhoneNumberElement().focus();
    goog.dom.selection.setCursorPosition(
        this.getPhoneNumberElement(),
        (this.getPhoneNumberElement().value || '').length);
  }
};


goog.mixin(
    firebaseui.auth.ui.page.PhoneSignInStart.prototype,
    /** @lends {firebaseui.auth.ui.page.PhoneSignInStart.prototype} */
    {
      // For country selector list.
      getDialogElement:
          firebaseui.auth.ui.element.dialog.getDialogElement,
      // For phone number input.
      getPhoneNumberElement:
          firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement,
      getPhoneNumberErrorElement:
          firebaseui.auth.ui.element.phoneNumber.getPhoneNumberErrorElement,
      initPhoneNumberElement:
          firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement,
      getPhoneNumberValue:
          firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue,
      getCountrySelectorElement:
           firebaseui.auth.ui.element.phoneNumber.getCountrySelectorElement,

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
