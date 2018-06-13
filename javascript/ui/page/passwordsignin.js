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
 * @fileoverview UI component for the password sign-in page.
 */

goog.provide('firebaseui.auth.ui.page.PasswordSignIn');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.email');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.password');
goog.require('firebaseui.auth.ui.element.tospp');
goog.require('firebaseui.auth.ui.page.Base');



/**
 * Password sign-in UI component.
 * @param {function()} onSubmitClick Callback to invoke when the submit button
 *     is clicked.
 * @param {function()} onForgotClick Callback to invoke when the forgot password
 *     link is clicked.
 * @param {string=} opt_email The email to prefill.
 * @param {?string=} opt_tosUrl The ToS URL.
 * @param {?string=} opt_privacyPolicyUrl The Privacy Policy URL.
 * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
 *     message of Term of Service and Privacy Policy.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.PasswordSignIn = function(
    onSubmitClick,
    onForgotClick,
    opt_email,
    opt_tosUrl,
    opt_privacyPolicyUrl,
    opt_displayFullTosPpMessage,
    opt_domHelper) {
  firebaseui.auth.ui.page.PasswordSignIn.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.passwordSignIn,
      {
        email: opt_email,
        displayFullTosPpMessage: !!opt_displayFullTosPpMessage
      },
      opt_domHelper,
      'passwordSignIn',
      {
        tosUrl: opt_tosUrl,
        privacyPolicyUrl: opt_privacyPolicyUrl
      });
  this.onSubmitClick_ = onSubmitClick;
  this.onForgotClick_ = onForgotClick;
};
goog.inherits(firebaseui.auth.ui.page.PasswordSignIn,
    firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.PasswordSignIn.prototype.enterDocument = function() {
  this.initEmailElement();
  this.initPasswordElement();
  this.initFormElement(this.onSubmitClick_, this.onForgotClick_);
  this.focusToNextOnEnter(this.getEmailElement(), this.getPasswordElement());
  // Submit if enter pressed in password element.
  this.submitOnEnter(this.getPasswordElement(), this.onSubmitClick_);
  // Auto focus.
  if (!firebaseui.auth.ui.element.getInputValue(this.getEmailElement())) {
    this.getEmailElement().focus();
  } else {
    this.getPasswordElement().focus();
  }
  firebaseui.auth.ui.page.PasswordSignIn.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.PasswordSignIn.prototype.disposeInternal = function() {
  this.onSubmitClick_ = null;
  this.onForgotClick_ = null;
  firebaseui.auth.ui.page.PasswordSignIn.base(this, 'disposeInternal');
};


goog.mixin(
    firebaseui.auth.ui.page.PasswordSignIn.prototype,
    /** @lends {firebaseui.auth.ui.page.PasswordSignIn.prototype} */
    {
      // For email.
      getEmailElement:
          firebaseui.auth.ui.element.email.getEmailElement,
      getEmailErrorElement:
          firebaseui.auth.ui.element.email.getEmailErrorElement,
      initEmailElement:
          firebaseui.auth.ui.element.email.initEmailElement,
      getEmail:
          firebaseui.auth.ui.element.email.getEmail,
      checkAndGetEmail:
          firebaseui.auth.ui.element.email.checkAndGetEmail,

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
          firebaseui.auth.ui.element.form.initFormElement,

      // For ToS and Privacy Policy.
      getTosPpElement:
          firebaseui.auth.ui.element.tospp.getTosPpElement,
      getTosLinkElement:
          firebaseui.auth.ui.element.tospp.getTosLinkElement,
      getPpLinkElement:
          firebaseui.auth.ui.element.tospp.getPpLinkElement,
      getTosPpListElement:
          firebaseui.auth.ui.element.tospp.getTosPpListElement
    });
