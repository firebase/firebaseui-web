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
 * @fileoverview UI component for the email not received page.
 */

goog.provide('firebaseui.auth.ui.page.EmailNotReceived');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');
goog.requireType('goog.dom.DomHelper');


/**
 * Email not received UI component.
 */
firebaseui.auth.ui.page.EmailNotReceived =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {function()} onResendClick Callback to invoke when the resend link
   *     is clicked.
   * @param {function()} onCancelClick Callback to invoke when the cancel button
   *     is clicked.
   * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
   *     Privacy Policy link is clicked.
   * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(
      onResendClick, onCancelClick, opt_tosCallback, opt_privacyPolicyCallback,
      opt_domHelper) {
    // Extend base page class and render email not received soy template.
    super(
        firebaseui.auth.soy2.page.emailNotReceived, undefined, opt_domHelper,
        'emailNotReceived', {
          tosCallback: opt_tosCallback,
          privacyPolicyCallback: opt_privacyPolicyCallback
        });
    this.onResendClick_ = onResendClick;
    this.onCancelClick_ = onCancelClick;
  }

  /** @override */
  enterDocument() {
    var self = this;
    // Handle action event for cancel button.
    firebaseui.auth.ui.element.listenForActionEvent(
        this, this.getSecondaryLinkElement(), function(e) {
          self.onCancelClick_();
        });
    // Handle action event for resend link.
    firebaseui.auth.ui.element.listenForActionEvent(
        this, this.getResendLink(), function(e) {
          self.onResendClick_();
        });
    // Set initial focus on the cancel button.
    this.getSecondaryLinkElement().focus();
    super.enterDocument();
  }

  /**
   * @return {?Element} The resend email link.
   */
  getResendLink() {
    return this.getElementByClass('firebaseui-id-resend-email-link');
  }

  /** @override */
  disposeInternal() {
    this.onResendClick_ = null;
    this.onCancelClick_ = null;
    super.disposeInternal();
  }
};


goog.mixin(
    firebaseui.auth.ui.page.EmailNotReceived.prototype,
    /** @lends {firebaseui.auth.ui.page.EmailNotReceived.prototype} */
    {
      // For form.
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement
    });
