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
 * @fileoverview Email not received handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleEmailNotReceived');

goog.require('firebaseui.auth.ui.page.EmailNotReceived');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.requireType('firebaseui.auth.PendingEmailCredential');


/**
 * Handles email not received.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} email The email address of the account.
 * @param {function()} onCancelClick Callback to invoke when the back button is
 *     clicked in email link sign in sent page.
 * @param {?firebaseui.auth.PendingEmailCredential=} opt_pendingCredential The
 *     pending credential to link to a successfully signed in user.
 */
firebaseui.auth.widget.handler.handleEmailNotReceived = function(
    app, container, email, onCancelClick, opt_pendingCredential) {
  var component = new firebaseui.auth.ui.page.EmailNotReceived(
      // On resend link click.
      function() {
        firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn(
            app,
            component,
            email,
            onCancelClick,
            function(error) {
              // The email provided could be an invalid one or some other error
              // could occur.
              var errorMessage =
                  firebaseui.auth.widget.handler.common.getErrorMessage(error);
              component.showInfoBar(errorMessage);
            },
            opt_pendingCredential);
      },
      // On back button click.
      function() {
        component.dispose();
        firebaseui.auth.widget.handler.common.handleSignInStart(
            app,
            container,
            email);
      },
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.EMAIL_NOT_RECEIVED,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleEmailNotReceived));
