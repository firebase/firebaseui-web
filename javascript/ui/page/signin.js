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
 * @fileoverview UI component for the email entry page.
 */

goog.provide('firebaseui.auth.ui.page.SignIn');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.email');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.tospp');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('goog.dom.selection');



/**
 * UI component for the user to enter their email.
 * @param {function()} onEmailEnter Callback to invoke when enter key (or its
 *     equivalent) is detected.
 * @param {?function()=} opt_onCancelClick Callback to invoke when cancel button
 *     is clicked.
 * @param {string=} opt_email The email to prefill.
 * @param {?string=} opt_tosUrl The ToS URL.
 * @param {?string=} opt_privacyPolicyUrl The Privacy Policy URL.
 * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
 *     message of Term of Service and Privacy Policy.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.SignIn = function(
    onEmailEnter,
    opt_onCancelClick,
    opt_email,
    opt_tosUrl,
    opt_privacyPolicyUrl,
    opt_displayFullTosPpMessage,
    opt_domHelper) {
  firebaseui.auth.ui.page.SignIn.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.signIn,
      {
        email: opt_email,
        displayCancelButton: !!opt_onCancelClick,
        displayFullTosPpMessage: !!opt_displayFullTosPpMessage
      },
      opt_domHelper,
      'signIn',
      {
        tosUrl: opt_tosUrl,
        privacyPolicyUrl: opt_privacyPolicyUrl
      });
  this.onEmailEnter_ = onEmailEnter;
  this.onCancelClick_ = opt_onCancelClick;
};
goog.inherits(firebaseui.auth.ui.page.SignIn, firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.SignIn.prototype.enterDocument = function() {
  this.initEmailElement(this.onEmailEnter_);
  // Handle a click on the submit button or cancel button.
  this.initFormElement(this.onEmailEnter_, this.onCancelClick_ || undefined);
  this.setupFocus_();
  firebaseui.auth.ui.page.SignIn.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.SignIn.prototype.disposeInternal = function() {
  this.onEmailEnter_ = null;
  this.onCancelClick_ = null;
  firebaseui.auth.ui.page.SignIn.base(this, 'disposeInternal');
};


/**
 * Sets up the focus order and auto focus.
 * @private
 */
firebaseui.auth.ui.page.SignIn.prototype.setupFocus_ = function() {
  // Auto focus the email input and put the cursor at the end.
  this.getEmailElement().focus();
  goog.dom.selection.setCursorPosition(
      this.getEmailElement(), (this.getEmailElement().value || '').length);
};


goog.mixin(
    firebaseui.auth.ui.page.SignIn.prototype,
    /** @lends {firebaseui.auth.ui.page.SignIn.prototype} */
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

      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement,

      // For tos pp.
      getTosPpElement:
          firebaseui.auth.ui.element.tospp.getTosPpElement,
      getTosLinkElement:
          firebaseui.auth.ui.element.tospp.getTosLinkElement,
      getPpLinkElement:
          firebaseui.auth.ui.element.tospp.getPpLinkElement,
      getTosPpListElement:
          firebaseui.auth.ui.element.tospp.getTosPpListElement
    });
