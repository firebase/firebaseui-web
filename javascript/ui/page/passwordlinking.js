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
 * @fileoverview UI component for the password account linking page.
 */

goog.provide('firebaseui.auth.ui.page.PasswordLinking');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.password');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('goog.asserts');
goog.requireType('goog.dom.DomHelper');


/**
 * Password linking UI component.
 */
firebaseui.auth.ui.page.PasswordLinking =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {string} email The user's email.
   * @param {function()} onSubmitClick Callback to invoke when the submit button
   *     is clicked.
   * @param {function()} onForgotClick Callback to invoke when the forgot
   *     password link is clicked.
   * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
   *     Privacy Policy link is clicked.
   * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(
      email, onSubmitClick, onForgotClick, opt_tosCallback,
      opt_privacyPolicyCallback, opt_domHelper) {
    super(
        firebaseui.auth.soy2.page.passwordLinking, {email: email},
        opt_domHelper, 'passwordLinking', {
          tosCallback: opt_tosCallback,
          privacyPolicyCallback: opt_privacyPolicyCallback
        });
    this.onSubmitClick_ = onSubmitClick;
    this.onForgotClick_ = onForgotClick;
  }

  /** @override */
  enterDocument() {
    this.initPasswordElement();
    this.initFormElement(this.onSubmitClick_, this.onForgotClick_);
    // Submit on enter in password element.
    this.submitOnEnter(this.getPasswordElement(), this.onSubmitClick_);
    this.getPasswordElement().focus();
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onSubmitClick_ = null;
    super.disposeInternal();
  }

  /** @return {string} The email address of the account. */
  checkAndGetEmail() {
    return goog.asserts.assertString(firebaseui.auth.ui.element.getInputValue(
        this.getElementByClass('firebaseui-id-email')));
  }
};


goog.mixin(
    firebaseui.auth.ui.page.PasswordLinking.prototype,
    /** @lends {firebaseui.auth.ui.page.PasswordLinking.prototype} */
    {
      // For password.
      getPasswordElement:
          firebaseui.auth.ui.element.password.getPasswordElement,
      getPasswordErrorElement:
          firebaseui.auth.ui.element.password.getPasswordErrorElement,
      initPasswordElement:
          firebaseui.auth.ui.element.password.initPasswordElement,
      checkAndGetPassword:
          firebaseui.auth.ui.element.password.checkAndGetPassword,

      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });
