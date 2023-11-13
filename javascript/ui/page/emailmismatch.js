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
 * @fileoverview UI component for the email mismatch page.
 */

goog.provide('firebaseui.auth.ui.page.EmailMismatch');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');
goog.requireType('goog.dom.DomHelper');


/**
 * Email mismatch UI component.
 */
firebaseui.auth.ui.page.EmailMismatch =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {string} userEmail The email returned by identity provider.
   * @param {string} pendingEmail The email formerly used to sign in.
   * @param {function()} onContinueClick Callback to invoke when the continue
   *     button is clicked.
   * @param {function()} onCancelClick Callback to invoke when the cancel
   *     button is clicked.
   * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
   *     Privacy Policy link is clicked.
   * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(
      userEmail, pendingEmail, onContinueClick, onCancelClick, opt_tosCallback,
      opt_privacyPolicyCallback, opt_domHelper) {
    // Extend base page class and render email mismatch soy template.
    super(
        firebaseui.auth.soy2.page.emailMismatch,
        {userEmail: userEmail, pendingEmail: pendingEmail}, opt_domHelper,
        'emailMismatch', {
          tosCallback: opt_tosCallback,
          privacyPolicyCallback: opt_privacyPolicyCallback
        });
    this.onContinueClick_ = onContinueClick;
    this.onCancelClick_ = onCancelClick;
    /** @type {?} */
    this.onSubmitClick_;
  }

  /** @override */
  enterDocument() {
    // Initialize form elements with their click handlers.
    this.initFormElement(this.onContinueClick_, this.onCancelClick_);
    // Set initial focus on the submit button.
    this.getSubmitElement().focus();
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onSubmitClick_ = null;
    this.onCancelClick_ = null;
    super.disposeInternal();
  }
};


goog.mixin(
    firebaseui.auth.ui.page.EmailMismatch.prototype,
    /** @lends {firebaseui.auth.ui.page.EmailMismatch.prototype} */
    {
      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });
