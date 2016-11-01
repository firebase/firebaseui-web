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
 * @fileoverview UI component for the notice pages.
 */

goog.provide('firebaseui.auth.ui.page.EmailChangeEmailSent');
goog.provide('firebaseui.auth.ui.page.EmailChangeRevokeFailure');
goog.provide('firebaseui.auth.ui.page.EmailVerificationFailure');
goog.provide('firebaseui.auth.ui.page.EmailVerificationSuccess');
goog.provide('firebaseui.auth.ui.page.Notice');
goog.provide('firebaseui.auth.ui.page.PasswordChangeSuccess');
goog.provide('firebaseui.auth.ui.page.PasswordRecoveryEmailSent');
goog.provide('firebaseui.auth.ui.page.PasswordResetFailure');
goog.provide('firebaseui.auth.ui.page.PasswordResetSuccess');
goog.provide('firebaseui.auth.ui.page.UnrecoverableError');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');



/**
 * A UI component represnting a notice.
 * @param {function(ARG_TYPES, null=, Object.<string, *>=):*} template The Soy
 *     template for the component.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {function()=} opt_onContinueClick Callback to invoke when the continue
 *    button is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {string=} opt_uiLabel The optional UI label.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 * @template ARG_TYPES
 */
firebaseui.auth.ui.page.Notice = function(
    template,
    opt_templateData,
    opt_onContinueClick,
    opt_domHelper,
    opt_uiLabel) {
  firebaseui.auth.ui.page.Notice.base(
      this,
      'constructor',
      template,
      opt_templateData,
      opt_domHelper,
      opt_uiLabel || 'notice');
  this.onContinueClick_ = opt_onContinueClick || null;
};
goog.inherits(firebaseui.auth.ui.page.Notice, firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.Notice.prototype.enterDocument = function() {
  if (this.onContinueClick_) {
    this.initFormElement(this.onContinueClick_);
    this.getSubmitElement().focus();
  }
  firebaseui.auth.ui.page.Notice.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.Notice.prototype.disposeInternal = function() {
  this.onContinueClick_ = null;
  firebaseui.auth.ui.page.Notice.base(this, 'disposeInternal');
};


goog.mixin(
    firebaseui.auth.ui.page.Notice.prototype,
    /** @lends {firebaseui.auth.ui.page.Notice.prototype} */
    {
      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement
    });



/**
 * Password recovery email sent notice UI component.
 * @param {string} email The email to which the recovery email has been sent.
 * @param {function()=} opt_onContinueClick Callback to invoke when the continue
 *     button is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Notice}
 */
firebaseui.auth.ui.page.PasswordRecoveryEmailSent = function(
    email, opt_onContinueClick, opt_domHelper) {
  firebaseui.auth.ui.page.PasswordRecoveryEmailSent.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.passwordRecoveryEmailSent,
      {
        email: email,
        allowContinue: !!opt_onContinueClick
      },
      opt_onContinueClick,
      opt_domHelper,
      'passwordRecoveryEmailSent');
};
goog.inherits(firebaseui.auth.ui.page.PasswordRecoveryEmailSent,
    firebaseui.auth.ui.page.Notice);


/**
 * Email verification success notice UI component.
 * @param {function()=} opt_onContinueClick Callback to invoke when the continue
 *     button is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Notice}
 */
firebaseui.auth.ui.page.EmailVerificationSuccess = function(
    opt_onContinueClick, opt_domHelper) {
  firebaseui.auth.ui.page.EmailVerificationSuccess.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.emailVerificationSuccess,
      {
        allowContinue: !!opt_onContinueClick
      },
      opt_onContinueClick,
      opt_domHelper,
      'emailVerificationSuccess');
};
goog.inherits(firebaseui.auth.ui.page.EmailVerificationSuccess,
    firebaseui.auth.ui.page.Notice);



/**
 * Email verification failure notice UI component.
 * @param {function()=} opt_onContinueClick Callback to invoke when the continue
 *     button is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Notice}
 */
firebaseui.auth.ui.page.EmailVerificationFailure = function(
    opt_onContinueClick, opt_domHelper) {
  firebaseui.auth.ui.page.EmailVerificationFailure.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.emailVerificationFailure,
      {
        allowContinue: !!opt_onContinueClick
      },
      opt_onContinueClick,
      opt_domHelper,
      'emailVerificationFailure');
};
goog.inherits(firebaseui.auth.ui.page.EmailVerificationFailure,
    firebaseui.auth.ui.page.Notice);



/**
 * Password reset success notice UI component.
 * @param {function()=} opt_onContinueClick Callback to invoke when the continue
 *     button is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Notice}
 */
firebaseui.auth.ui.page.PasswordResetSuccess = function(
    opt_onContinueClick, opt_domHelper) {
  firebaseui.auth.ui.page.PasswordResetSuccess.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.passwordResetSuccess,
      {
        allowContinue: !!opt_onContinueClick
      },
      opt_onContinueClick,
      opt_domHelper,
      'passwordResetSuccess');
};
goog.inherits(firebaseui.auth.ui.page.PasswordResetSuccess,
    firebaseui.auth.ui.page.Notice);



/**
 * Password reset failure notice UI component.
 * @param {function()=} opt_onContinueClick Callback to invoke when the continue
 *     button is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Notice}
 */
firebaseui.auth.ui.page.PasswordResetFailure = function(
    opt_onContinueClick, opt_domHelper) {
  firebaseui.auth.ui.page.PasswordResetFailure.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.passwordResetFailure,
      {
        allowContinue: !!opt_onContinueClick
      },
      opt_onContinueClick,
      opt_domHelper,
      'passwordResetFailure');
};
goog.inherits(firebaseui.auth.ui.page.PasswordResetFailure,
    firebaseui.auth.ui.page.Notice);


/**
 * Email change revoke failure notice UI component.
 * @param {function()=} opt_onContinueClick Callback to invoke when the continue
 *     button is clicked.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Notice}
 */
firebaseui.auth.ui.page.EmailChangeRevokeFailure = function(
    opt_onContinueClick, opt_domHelper) {
  firebaseui.auth.ui.page.EmailChangeRevokeFailure.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.emailChangeRevokeFailure,
      {
        allowContinue: !!opt_onContinueClick
      },
      opt_onContinueClick,
      opt_domHelper,
      'emailChangeRevokeFailure');
};
goog.inherits(firebaseui.auth.ui.page.EmailChangeRevokeFailure,
    firebaseui.auth.ui.page.Notice);



/**
 * Unrecoverable error notice UI component.
 * @param {string} errorMessage The detailed error message to be displayed.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Notice}
 */
firebaseui.auth.ui.page.UnrecoverableError =
    function(errorMessage, opt_domHelper) {
  // Unrecoverable error notice has no continue button.
  firebaseui.auth.ui.page.UnrecoverableError.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.unrecoverableError,
      {errorMessage: errorMessage},
      undefined,
      opt_domHelper,
      'unrecoverableError');
};
goog.inherits(firebaseui.auth.ui.page.UnrecoverableError,
    firebaseui.auth.ui.page.Notice);
