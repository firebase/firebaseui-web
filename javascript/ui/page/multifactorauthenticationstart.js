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

goog.provide('firebaseui.auth.ui.page.MultiFactorAuthenticationStart');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.dialog');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.multiFactorInfo');
goog.require('firebaseui.auth.ui.element.recaptcha');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('goog.dom.selection');
goog.requireType('goog.dom.DomHelper');


/**
 * UI component for the user to choose their phone number to start multi factor authentication.
 */
firebaseui.auth.ui.page.MultiFactorAuthenticationStart =
    class extends firebaseui.auth.ui.page.Base {
  /**
 * @param {Array<firebase.auth.MultiFactorInfo>} mfaInfoList Multi factor info list.
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
 * @param {?string=} opt_mfaInfoUid The value of the mfa info uid to prefill.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 */
  constructor(
    mfaInfoList, onSubmitClick, enableVisibleRecaptcha, opt_onCancelClick, opt_tosCallback,
      opt_privacyPolicyCallback, opt_displayFullTosPpMessage, opt_mfaInfoUid, opt_domHelper) {
    super(
        firebaseui.auth.soy2.page.multiFactorAuthenticationStart, {
          enableVisibleRecaptcha: enableVisibleRecaptcha,
          displayCancelButton: !!opt_onCancelClick,
          displayFullTosPpMessage: !!opt_displayFullTosPpMessage
        },
        opt_domHelper, 'multiFactorAuthenticationStart', {
          tosCallback: opt_tosCallback,
          privacyPolicyCallback: opt_privacyPolicyCallback
        });
    /** @private @const {Array<firebase.auth.MultiFactorInfo>} Multi factor info list. */
    this.mfaInfoList_ = mfaInfoList;
    /** @private @const {?string} The default mfa info uid to select. */
    this.mfaInfoUid_ = opt_mfaInfoUid || null;
    /** @private {boolean} Whether to enable visible reCAPTCHA. */
    this.enableVisibleRecaptcha_ = enableVisibleRecaptcha;
    /** @private {?function(?)} On submit click callback. */
    this.onSubmitClick_ = onSubmitClick;
    /** @private {?function(?)} On cancel click callback. */
    this.onCancelClick_ = opt_onCancelClick || null;
  }

  /** @override */
  enterDocument() {
    this.initMultiFactorHintElement(this.mfaInfoList_, this.mfaInfoUid_);
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
          this.getMFAInfoSelectorElement(), this.getSubmitElement());
    }
    // Otherwise, can't force focus on visible reCAPTCHA.

    // Do not submit directly on phone input enter since an invisible reCAPTCHA
    // must be triggered by a button click, otherwise it may force a visible
    // challenge.
    this.submitOnEnter(
        this.getSubmitElement(),
        /** @type {function()} */ (this.onSubmitClick_));
  }
};


goog.mixin(
    firebaseui.auth.ui.page.MultiFactorAuthenticationStart.prototype,
    /** @lends {firebaseui.auth.ui.page.MultiFactorAuthenticationStart.prototype} */
    {
      // For multi factor info selector list.
      getDialogElement:
          firebaseui.auth.ui.element.dialog.getDialogElement,

      // For multi factor info selector.
      getMFAInfoSelectorElement:
          firebaseui.auth.ui.element.multiFactorInfo.getMFAInfoSelectorElement,
      getMFAInfoErrorElement:
          firebaseui.auth.ui.element.multiFactorInfo.getMFAInfoErrorElement,
      initMultiFactorHintElement:
          firebaseui.auth.ui.element.multiFactorInfo.initMultiFactorHintElement,
      getMFAInfoValue:
          firebaseui.auth.ui.element.multiFactorInfo.getMFAInfoValue,

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
