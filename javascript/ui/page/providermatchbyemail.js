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

/** @fileoverview UI component for matching providers by the given email. */

goog.module('firebaseui.auth.ui.page.ProviderMatchByEmail');
goog.module.declareLegacyNamespace();

const Base = goog.require('firebaseui.auth.ui.page.Base');
const DomHelper = goog.requireType('goog.dom.DomHelper');
const email = goog.require('firebaseui.auth.ui.element.email');
const form = goog.require('firebaseui.auth.ui.element.form');
const page = goog.require('firebaseui.auth.soy2.page');
const selection = goog.require('goog.dom.selection');

/**
 * UI component to match a user's inputted email with the associated sign-in
 * methods.
 */
class ProviderMatchByEmail extends Base {
  /**
   * @param {function()} onEmailEnter Callback to invoke when enter key
   *     (or its equivalent) is detected.
   * @param {?function()=} tosCallback The optional callback to invoke when the
   *     ToS link is clicked.
   * @param {?function()=} privacyPolicyCallback The optional callback to
   *     invoke when the Privacy Policy link is clicked.
   * @param {?DomHelper=} domHelper Optional DOM helper.
   */
  constructor(
      onEmailEnter, tosCallback = undefined, privacyPolicyCallback = undefined,
      domHelper = undefined) {
    super(
        page.providerMatchByEmail,
        undefined, domHelper, 'providerMatchByEmail', {
          tosCallback: tosCallback,
          privacyPolicyCallback: privacyPolicyCallback,
        });
    this.onEmailEnter_ = onEmailEnter;
  }

  /** @override */
  enterDocument() {
    this.initEmailElement(this.onEmailEnter_);
    // Handle a click on the submit button button.
    this.initFormElement(this.onEmailEnter_);
    this.setupFocus_();
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onEmailEnter_ = null;
    super.disposeInternal();
  }

  /**
   * Sets up the focus order and auto focus.
   * @private
   */
  setupFocus_() {
    // Auto focus the email input and put the cursor at the end.
    this.getEmailElement().focus();
    selection.setCursorPosition(
        this.getEmailElement(), (this.getEmailElement().value || '').length);
  }
}

goog.mixin(
    ProviderMatchByEmail.prototype,
    /** @lends {ProviderMatchByEmail.prototype} */
    {
      // For email.
      getEmailElement: email.getEmailElement,
      getEmailErrorElement: email.getEmailErrorElement,
      initEmailElement: email.initEmailElement,
      getEmail: email.getEmail,
      checkAndGetEmail: email.checkAndGetEmail,

      // For form.
      getSubmitElement: form.getSubmitElement,
      initFormElement: form.initFormElement,
    });

exports = ProviderMatchByEmail;

