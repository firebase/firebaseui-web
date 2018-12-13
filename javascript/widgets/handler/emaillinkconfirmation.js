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
 * @fileoverview Email link sign-in confirmation handler used to ask user for
 * email to complete email link sign-in for different device flows.
 */

goog.provide('firebaseui.auth.widget.handler.handleEmailLinkConfirmation');

goog.require('firebaseui.auth.ui.page.EmailLinkSignInConfirmation');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles email confirmation when user opens a sign-in link on a different
 * device. The user is asked to provide their email before sign-in completion.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} link The link containing the OTP.
 * @param {function(!firebaseui.auth.AuthUI, !Element, string, string)}
 *     onContinue The callback to trigger with the email provided by the user.
 * @param {?string=} opt_email The email to prefill.
 * @param {?string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.handleEmailLinkConfirmation = function(
    app, container, link, onContinue, opt_email, opt_infoBarMessage) {
  var component = new firebaseui.auth.ui.page.EmailLinkSignInConfirmation(
      // On email enter.
      function() {
        var email = component.checkAndGetEmail();
        if (!email) {
          component.getEmailElement().focus();
          return;
        }
        component.dispose();
        onContinue(app, container, email, link);
      },
      // On cancel, redirect back to sign-in.
      function() {
        component.dispose();
        firebaseui.auth.widget.handler.common.handleSignInStart(
             app, container, opt_email || undefined);
      },
      opt_email || undefined,
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  // Show info bar if necessary.
  if (opt_infoBarMessage) {
    component.showInfoBar(opt_infoBarMessage);
  }
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.EMAIL_LINK_CONFIRMATION,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleEmailLinkConfirmation));
