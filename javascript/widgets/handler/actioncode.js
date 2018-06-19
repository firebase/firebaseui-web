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
 * @fileoverview Handlers for action code.
 */

goog.provide('firebaseui.auth.widget.handler.handleEmailChangeRevocation');
goog.provide('firebaseui.auth.widget.handler.handleEmailVerification');
goog.provide('firebaseui.auth.widget.handler.handlePasswordReset');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.page.EmailChangeRevoke');
goog.require('firebaseui.auth.ui.page.EmailChangeRevokeFailure');
goog.require('firebaseui.auth.ui.page.EmailVerificationFailure');
goog.require('firebaseui.auth.ui.page.EmailVerificationSuccess');
goog.require('firebaseui.auth.ui.page.PasswordRecoveryEmailSent');
goog.require('firebaseui.auth.ui.page.PasswordReset');
goog.require('firebaseui.auth.ui.page.PasswordResetFailure');
goog.require('firebaseui.auth.ui.page.PasswordResetSuccess');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles password reset.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string} actionCode The password reset action code.
 * @param {?function()=} opt_onContinueClick Callback to invoke when the
 *     continue button is clicked. If not provided, no continue button is
 *     displayed.
 */
firebaseui.auth.widget.handler.handlePasswordReset = function(
    app, container, actionCode, opt_onContinueClick) {
  // Call resetPassword first to get the email address.
  app.registerPending(
      app.getAuth()
          .verifyPasswordResetCode(actionCode)
          .then(
              function(email) {
                // Show reset password UI.
                var component = new firebaseui.auth.ui.page.PasswordReset(
                    email, function() {
                      firebaseui.auth.widget.handler.resetPassword_(
                          app, container, component, actionCode,
                          opt_onContinueClick);
                    });
                component.render(container);
                // Set current UI component.
                app.setCurrentComponent(component);
              },
              function(error) {
                firebaseui.auth.widget.handler.handlePasswordResetFailure_(
                    app, container);
              }));
};


/**
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {firebaseui.auth.ui.page.PasswordReset} component The UI component.
 * @param {string} actionCode The password reset action code.
 * @param {?function()=} opt_onContinueClick Callback to invoke when the
 *     continue button is clicked. If not provided, no continue button is
 *     displayed.
 * @private
 */
firebaseui.auth.widget.handler.resetPassword_ = function(
    app, container, component, actionCode, opt_onContinueClick) {
  var newPassword = component.checkAndGetNewPassword();
  if (!newPassword) {
    return;
  }
  var currentComponent = component;
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.getAuth().confirmPasswordReset, app.getAuth())),
      [actionCode, newPassword],
      function(resp) {
        currentComponent.dispose();
        var component = new firebaseui.auth.ui.page.PasswordResetSuccess(
            opt_onContinueClick);
        component.render(container);
        // Set current UI component.
        app.setCurrentComponent(component);
      },
      function(error) {
        // Sign out user and show password reset failure.
        firebaseui.auth.widget.handler.handlePasswordResetFailure_(
            app, container, component, /** @type {Error} */ (error));
      }));
};


/**
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {firebaseui.auth.ui.page.PasswordReset=} opt_component Current UI
 *     component.
 * @param {Error=} opt_error The error received from the backend.
 * @private
 */
firebaseui.auth.widget.handler.handlePasswordResetFailure_ = function(
    app, container, opt_component, opt_error) {
  var errorCode = opt_error && opt_error['code'];
  if (errorCode == 'auth/weak-password') {
    // Handles this error differently as it just requires to display a message
    // to the user to use a longer password.
    var errorMessage =
        firebaseui.auth.widget.handler.common.getErrorMessage(opt_error);
    firebaseui.auth.ui.element.setValid(
        opt_component.getNewPasswordElement(), false);
    firebaseui.auth.ui.element.show(
        opt_component.getNewPasswordErrorElement(), errorMessage);
    opt_component.getNewPasswordElement().focus();
    return;
  }

  if (opt_component) {
    opt_component.dispose();
  }
  var component = new firebaseui.auth.ui.page.PasswordResetFailure();
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


/**
 * Handles email change revocation action code.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string} actionCode The new email verification action code.
 */
firebaseui.auth.widget.handler.handleEmailChangeRevocation = function(
    app, container, actionCode) {
  var email = null;
  // Gets the email related to the code.
  app.registerPending(
      app.getAuth()
          .checkActionCode(actionCode)
          .then(function(info) {
            email = info['data']['email'];
            // Then applies it.
            return app.getAuth().applyActionCode(actionCode);
          })
          .then(
              function() {
                firebaseui.auth.widget.handler
                    .handleEmailChangeRevocationSuccess_(app, container, email);
              },
              function(error) {
                firebaseui.auth.widget.handler
                    .handleEmailChangeRevocationFailure_(app, container);
              }));
};


/**
 * Handles email change revocation success.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string} email The old email to revert to.
 * @private
 */
firebaseui.auth.widget.handler.handleEmailChangeRevocationSuccess_ =
    function(app, container, email) {
  var component = new firebaseui.auth.ui.page.EmailChangeRevoke(
      email,
      function () {
        app.registerPending(component.executePromiseRequest(
            /** @type {function (): !goog.Promise} */ (
                goog.bind(app.getAuth().sendPasswordResetEmail, app.getAuth())),
            [email],
            function() {
              // Reset password code sent.
              component.dispose();
              component =
                  new firebaseui.auth.ui.page.PasswordRecoveryEmailSent(
                      email,
                      undefined,
                      app.getConfig().getTosUrl(),
                      app.getConfig().getPrivacyPolicyUrl());
              component.render(container);
              // Set current UI component.
              app.setCurrentComponent(component);
            }, function(error) {
              // Failed to send reset password code.
              component.showInfoBar(
                  firebaseui.auth.soy2.strings.errorSendPasswordReset()
                  .toString());
            }));
      });
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


/**
 * Handles email change revocation failure.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @private
 */
firebaseui.auth.widget.handler.handleEmailChangeRevocationFailure_ =
    function(app, container) {
  var component = new firebaseui.auth.ui.page.EmailChangeRevokeFailure();
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


/**
 * Handles email verification action code.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string} actionCode The email verification action code.
 * @param {?function()=} opt_onContinueClick Callback to invoke when the
 *     continue button is clicked. If not provided, no continue button is
 *     displayed.
 */
firebaseui.auth.widget.handler.handleEmailVerification = function(
    app, container, actionCode, opt_onContinueClick) {
  app.registerPending(
      app.getAuth()
          .applyActionCode(actionCode)
          .then(
              function() {
                var component =
                    new firebaseui.auth.ui.page.EmailVerificationSuccess(
                        opt_onContinueClick);
                component.render(container);
                // Set current UI component.
                app.setCurrentComponent(component);
              },
              function(error) {
                var component =
                    new firebaseui.auth.ui.page.EmailVerificationFailure();
                component.render(container);
                // Set current UI component.
                app.setCurrentComponent(component);
              }));
};


// Register handlers.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.PASSWORD_RESET,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handlePasswordReset));

firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.EMAIL_CHANGE_REVOCATION,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleEmailChangeRevocation));

/** @suppress {missingRequire} */
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.EMAIL_VERIFICATION,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleEmailVerification));
