/*
 * Copyright 2019 Google Inc. All Rights Reserved.
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
 * @fileoverview UI component for the revert second factor addition success
 * page.
 */

goog.provide('firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccess');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');
goog.requireType('goog.dom.DomHelper');


/**
 * Revert second factor addition success UI component.
 */
firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccess =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {string} factorId The factor ID of the second factor.
   * @param {function()} onResetPasswordClick Callback to invoke when the reset
   *     password link is clicked.
   * @param {?string=} phoneNumber The second factor phone number.
   * @param {function(): undefined=} onContinueClick Callback to invoke when the
   *     continue button is clicked.
   * @param {?goog.dom.DomHelper=} domHelper Optional DOM helper.
   */
  constructor(factorId, onResetPasswordClick, phoneNumber, onContinueClick,
              domHelper) {
    super(
        firebaseui.auth.soy2.page.revertSecondFactorAdditionSuccess,
        {
          factorId: factorId,
          phoneNumber: phoneNumber || null,
          allowContinue: !!onContinueClick
        },
        domHelper,
        'revertSecondFactorAdditionSuccess');
    this.onResetPasswordClick_ = onResetPasswordClick;
    this.onContinueClick_ = onContinueClick || null;
  }

  /** @override */
  enterDocument() {
    // Handle action event for 'change your password immediately' link.
    firebaseui.auth.ui.element.listenForActionEvent(
        this, this.getResetPasswordElement(), (e) => {
          this.onResetPasswordClick_();
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
   * @return {?Element} The reset password link.
   */
  getResetPasswordElement() {
    return this.getElementByClass('firebaseui-id-reset-password-link');
  }
};


goog.mixin(
    firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccess.prototype,
    /**
     * @lends
     * {firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccess.prototype}
     */
    {
      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });
