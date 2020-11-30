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
 * @fileoverview UI component for the email change revocation page.
 */

goog.provide('firebaseui.auth.ui.page.EmailChangeRevoke');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');
goog.requireType('goog.dom.DomHelper');


/**
 * Email change revocation UI component.
 */
firebaseui.auth.ui.page.EmailChangeRevoke =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {string} email The original email to revert back to.
   * @param {function()} onResetPasswordClick Callback to invoke when the reset
   *     password link is clicked.
   * @param {function()=} opt_onContinueClick Callback to invoke when the
   *     continue button is clicked.
   * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(email, onResetPasswordClick, opt_onContinueClick, opt_domHelper) {
    super(
        firebaseui.auth.soy2.page.emailChangeRevokeSuccess,
        {email: email, allowContinue: !!opt_onContinueClick}, opt_domHelper,
        'emailChangeRevoke');
    this.onResetPasswordClick_ = onResetPasswordClick;
    this.onContinueClick_ = opt_onContinueClick || null;
  }

  /** @override */
  enterDocument() {
    var self = this;
    // Handle action event for 'change your password immediately' link.
    firebaseui.auth.ui.element.listenForActionEvent(
        this, this.getResetPasswordElement(), function(e) {
          self.onResetPasswordClick_();
        });
    if (this.onContinueClick_) {
      this.initFormElement(this.onContinueClick_);
      this.getSubmitElement().focus();
    }
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onContinueClick_ = null;
    this.onResetPasswordClick_ = null;
    super.disposeInternal();
  }

  /**
   * @return {Element} The reset password link.
   */
  getResetPasswordElement() {
    return this.getElementByClass('firebaseui-id-reset-password-link');
  }
};


goog.mixin(
    firebaseui.auth.ui.page.EmailChangeRevoke.prototype,
    /** @lends {firebaseui.auth.ui.page.EmailChangeRevoke.prototype} */
    {
      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });
