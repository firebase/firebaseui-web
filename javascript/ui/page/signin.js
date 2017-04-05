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
goog.require('firebaseui.auth.ui.page.Base');
goog.require('goog.dom.selection');



/**
 * UI component for the user to enter their email.
 * @param {function()} onEmailEnter Callback to invoke when enter key (or its
 *     equivalent) is detected.
 * @param {function()} onCancelClick Callback to invoke when cancel button
 *     is clicked.
 * @param {string=} opt_email The email to prefill.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.SignIn = function(
    onEmailEnter,
    onCancelClick,
    opt_email,
    opt_domHelper) {
  firebaseui.auth.ui.page.SignIn.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.signIn,
      {email: opt_email},
      opt_domHelper,
      'signIn');
  this.onEmailEnter_ = onEmailEnter;
  this.onCancelClick_ = onCancelClick;
};
goog.inherits(firebaseui.auth.ui.page.SignIn, firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.SignIn.prototype.enterDocument = function() {
  this.initEmailElement(this.onEmailEnter_);
  var self = this;
  // Handle a click on the submit button or cancel button.
  this.initFormElement(this.onEmailEnter_, this.onCancelClick_);
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
          firebaseui.auth.ui.element.form.initFormElement
    });
