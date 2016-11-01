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
 * @fileoverview UI component for the password reset page.
 */

goog.provide('firebaseui.auth.ui.page.PasswordReset');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.newPassword');
goog.require('firebaseui.auth.ui.page.Base');



/**
 * Password reset UI component.
 * @param {string} email The email to prefill.
 * @param {function()} onSubmitClick Callback to invoke when the submit button
 *     is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.PasswordReset = function(email, onSubmitClick,
    opt_domHelper) {
  firebaseui.auth.ui.page.PasswordReset.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.passwordReset,
      {email: email},
      opt_domHelper,
      'passwordReset');
  this.onSubmitClick_ = onSubmitClick;
};
goog.inherits(firebaseui.auth.ui.page.PasswordReset,
    firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.PasswordReset.prototype.enterDocument = function() {
  this.initNewPasswordElement();
  this.initFormElement(this.onSubmitClick_);
  this.submitOnEnter(this.getNewPasswordElement(), this.onSubmitClick_);
  this.getNewPasswordElement().focus();
  firebaseui.auth.ui.page.PasswordReset.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.PasswordReset.prototype.disposeInternal = function() {
  this.onSubmitClick_ = null;
  firebaseui.auth.ui.page.PasswordReset.base(this, 'disposeInternal');
};


goog.mixin(
    firebaseui.auth.ui.page.PasswordReset.prototype,
    /** @lends {firebaseui.auth.ui.page.PasswordReset.prototype} */
    {
      // For new password.
      getNewPasswordElement:
          firebaseui.auth.ui.element.newPassword.getNewPasswordElement,
      getNewPasswordErrorElement:
          firebaseui.auth.ui.element.newPassword.getNewPasswordErrorElement,
      getPasswordToggleElement:
          firebaseui.auth.ui.element.newPassword.getPasswordToggleElement,
      initNewPasswordElement:
          firebaseui.auth.ui.element.newPassword.initNewPasswordElement,
      checkAndGetNewPassword:
          firebaseui.auth.ui.element.newPassword.checkAndGetNewPassword,

      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });
