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



/**
 * Email mismatch UI component.
 * @param {string} userEmail The email returned by identity provider.
 * @param {string} pendingEmail The email formerly used to sign in.
 * @param {function()} onContinueClick Callback to invoke when the continue
 *     button is clicked.
 * @param {function()} onCancelClick Callback to invoke when the cancel
 *     button is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.EmailMismatch = function(
    userEmail, pendingEmail, onContinueClick, onCancelClick, opt_domHelper) {
  // Extend base page class and render email mismatch soy template.
  firebaseui.auth.ui.page.EmailMismatch.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.emailMismatch,
      {userEmail: userEmail, pendingEmail: pendingEmail},
      opt_domHelper,
      'emailMismatch');
  this.onContinueClick_ = onContinueClick;
  this.onCancelClick_ = onCancelClick;
};
goog.inherits(firebaseui.auth.ui.page.EmailMismatch,
    firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.EmailMismatch.prototype.enterDocument = function() {
  // Initialize form elements with their click handlers.
  this.initFormElement(this.onContinueClick_, this.onCancelClick_);
  // Set initial focus on the submit button.
  this.getSubmitElement().focus();
  firebaseui.auth.ui.page.EmailMismatch.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.EmailMismatch.prototype.disposeInternal = function() {
  this.onSubmitClick_ = null;
  this.onCancelClick_ = null;
  firebaseui.auth.ui.page.EmailMismatch.base(this, 'disposeInternal');
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
