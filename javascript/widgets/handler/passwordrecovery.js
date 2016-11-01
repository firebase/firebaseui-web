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
 * @fileoverview Password recovery handler.
 */

goog.provide('firebaseui.auth.widget.handler.handlePasswordRecovery');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.page.PasswordRecovery');
goog.require('firebaseui.auth.ui.page.PasswordRecoveryEmailSent');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles password recovery.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string=} opt_email The email address of the account.
 * @param {boolean=} opt_disableCancel Whether to disable the cancel link.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.handlePasswordRecovery = function(
    app, container, opt_email, opt_disableCancel, opt_infoBarMessage) {
  var onCancel = function() {
    component.dispose();
    // On cancel, return to widget start page.
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
  };
  // Render the UI.
  var component = new firebaseui.auth.ui.page.PasswordRecovery(
      // On submit.
      function() {
        firebaseui.auth.widget.handler.onPasswordRecoverySubmit_(app,
            component);
      },
      // On cancel.
      opt_disableCancel ? undefined : onCancel,
      opt_email);
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  // Show info bar if necessary.
  if (opt_infoBarMessage) {
    component.showInfoBar(opt_infoBarMessage);
  }
};


/**
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {firebaseui.auth.ui.page.PasswordRecovery} component The UI component.
 * @private
 */
firebaseui.auth.widget.handler.onPasswordRecoverySubmit_ =
    function(app, component) {
  // Check fields are valid.
  var email = component.checkAndGetEmail();
  if (!email) {
    component.getEmailElement().focus();
    return;
  }

  var container = component.getContainer();
  var emailSentSuccessCallback = function() {
    // Render the notification UI.
    component.dispose();
    // Do not show a continue button since the only option here is to
    // click the action link in email to proceed with the login process.
    // This has also been implemented to avoid sending back the user to
    // the web login page when the app is embedded in a webview (used for
    // password reset).
    var noticeComponent = new firebaseui.auth.ui.page.PasswordRecoveryEmailSent(
        /** @type {!string} */ (email),
        function() {
          // Return to start page after the password recovery flow.
          noticeComponent.dispose();
          firebaseui.auth.widget.handler.common.handleSignInStart(app,
              container);
        });
    noticeComponent.render(container);
    // Set current UI component.
    app.setCurrentComponent(noticeComponent);
  };
  var emailSentFailedCallback = function(error) {
    firebaseui.auth.ui.element.setValid(component.getEmailElement(), false);
    firebaseui.auth.ui.element.show(component.getEmailErrorElement(),
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  };


  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.getAuth().sendPasswordResetEmail, app.getAuth())),
      [email],
      emailSentSuccessCallback, emailSentFailedCallback));
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.PASSWORD_RECOVERY,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handlePasswordRecovery));
