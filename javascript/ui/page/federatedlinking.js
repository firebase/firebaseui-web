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
 * @fileoverview UI component for the federated account linking page.
 */

goog.provide('firebaseui.auth.ui.page.FederatedLinking');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');
goog.requireType('goog.dom.DomHelper');


/**
 * Federated account linking UI component.
 */
firebaseui.auth.ui.page.FederatedLinking =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {string} email The user's email.
   * @param {?} providerConfig The provider config of the IdP we should
   *     use for sign in.
   * @param {function()} onSubmitClick Callback to invoke when the submit button
   *     is clicked.
   * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
   *     Privacy Policy link is clicked.
   * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(
      email, providerConfig, onSubmitClick, opt_tosCallback,
      opt_privacyPolicyCallback, opt_domHelper) {
    super(
        firebaseui.auth.soy2.page.federatedLinking,
        {email: email, providerConfig: providerConfig}, opt_domHelper,
        'federatedLinking', {
          tosCallback: opt_tosCallback,
          privacyPolicyCallback: opt_privacyPolicyCallback
        });
    this.onSubmitClick_ = onSubmitClick;
  }

  /** @override */
  enterDocument() {
    this.initFormElement(this.onSubmitClick_);
    this.getSubmitElement().focus();
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onSubmitClick_ = null;
    super.disposeInternal();
  }
};


goog.mixin(
    firebaseui.auth.ui.page.FederatedLinking.prototype,
    /** @lends {firebaseui.auth.ui.page.FederatedLinking.prototype} */
    {
      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });
