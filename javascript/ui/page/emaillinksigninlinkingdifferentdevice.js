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
 * @fileoverview UI component for the email link sign in linking different
 *     device page.
 */

goog.provide('firebaseui.auth.ui.page.EmailLinkSignInLinkingDifferentDevice');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');
goog.requireType('goog.dom.DomHelper');


/**
 * Email link sign in linking different device UI component.
 */
firebaseui.auth.ui.page.EmailLinkSignInLinkingDifferentDevice =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {?} providerConfig The provider config of the IdP we should
   *     use for sign in.
   * @param {function()} onContinueClick Callback to invoke when the continue
   *     button is clicked.
   * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
   *     Privacy Policy link is clicked.
   * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(
      providerConfig, onContinueClick, opt_tosCallback,
      opt_privacyPolicyCallback, opt_domHelper) {
    // Extend base page class and render Email link sign in linking different
    // device soy template.
    super(
        firebaseui.auth.soy2.page.emailLinkSignInLinkingDifferentDevice,
        {providerConfig: providerConfig}, opt_domHelper,
        'emailLinkSignInLinkingDifferentDevice', {
          tosCallback: opt_tosCallback,
          privacyPolicyCallback: opt_privacyPolicyCallback
        });
    this.onContinueClick_ = onContinueClick;
  }

  /** @override */
  enterDocument() {
    this.initFormElement(this.onContinueClick_);
    this.getSubmitElement().focus();
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onContinueClick_ = null;
    super.disposeInternal();
  }
};


goog.mixin(
    firebaseui.auth.ui.page.EmailLinkSignInLinkingDifferentDevice.prototype,
    /**
     * @lends
     * {firebaseui.auth.ui.page.EmailLinkSignInLinkingDifferentDevice.prototype}
     */
    {
      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });
