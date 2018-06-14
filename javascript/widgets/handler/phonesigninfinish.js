/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Phone sign in code verification page handler.
 */

goog.provide('firebaseui.auth.widget.handler.handlePhoneSignInFinish');

goog.require('firebaseui.auth.PhoneNumber');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.progressDialog');
goog.require('firebaseui.auth.ui.page.PhoneSignInFinish');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles the verification of the phone number the user is trying to
 * authenticate with. This handler takes in a confirmationResult, asks the user
 * to provide the verification code and then verifies the code to complete the
 * sign in operation.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {!firebaseui.auth.PhoneNumber} phoneNumberValue
 *     The value of the phone number input.
 * @param {number} resendDelay The resend delay.
 * @param {!firebaseui.auth.PhoneAuthResult} phoneAuthResult The phone Auth
 *     result used to verify the code on.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.handlePhoneSignInFinish = function(
    app, container, phoneNumberValue, resendDelay, phoneAuthResult,
    opt_infoBarMessage) {
  // This is a placeholder for now.
  // Render the phone sign in start page component.
  var component = new firebaseui.auth.ui.page.PhoneSignInFinish(
      // On change phone number click.
      function() {
        component.dispose();
        // Render previous phone sign in start page.
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.PHONE_SIGN_IN_START, app,
            container, phoneNumberValue);
      },
      // On submit.
      function() {
        firebaseui.auth.widget.handler.onPhoneSignInFinishSubmit_(
            app, component, phoneNumberValue, phoneAuthResult);
      },
      // On cancel.
      function() {
        // Go back to start sign in handler.
        component.dispose();
        firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
      },
      // On resend.
      function() {
        component.dispose();
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.PHONE_SIGN_IN_START, app,
            container, phoneNumberValue);
      },
      phoneNumberValue.getPhoneNumber(),
      resendDelay,
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


/**
 * @const {number} The delay in milliseconds to keep the code verified
 *     dialog on display before completing sign in.
 */
firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY = 1000;


/**
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.PhoneSignInFinish} component The UI
 *     component.
 * @param {!firebaseui.auth.PhoneNumber} phoneNumberValue
 *     The value of the phone number input.
 * @param {!Object} phoneAuthResult The phone Auth result used to verify
 *     the code on.
 * @private
 */
firebaseui.auth.widget.handler.onPhoneSignInFinishSubmit_ = function(
    app, component, phoneNumberValue, phoneAuthResult) {
  var showInvalidCode = function(errorMessage) {
    // No code provided.
    component.getPhoneConfirmationCodeElement().focus();
    firebaseui.auth.ui.element.setValid(
        component.getPhoneConfirmationCodeElement(), false);
    firebaseui.auth.ui.element.show(
        component.getPhoneConfirmationCodeErrorElement(), errorMessage);
  };
  // Get code.
  var verificationCode = component.checkAndGetPhoneConfirmationCode();
  // If missing, focus code element, show the relevant error and exit.
  if (!verificationCode) {
    showInvalidCode(
        firebaseui.auth.soy2.strings.errorInvalidConfirmationCode().toString());
    return;
  }

  // Display the progress dialog while the code is being sent.
  component.showProgressDialog(
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(phoneAuthResult.confirm, phoneAuthResult)),
      [verificationCode],
      // On success a user credential is returned.
      function(userCredential) {
        component.dismissDialog();
        // Show code verified dialog.
        component.showProgressDialog(
            firebaseui.auth.ui.element.progressDialog.State.DONE,
            firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
        // Keep on display for long enough to be seen.
        var codeVerifiedTimer = setTimeout(function() {
          // Dismiss dialog and dispose of component before completing sign-in.
          component.dismissDialog();
          component.dispose();
          var authResult = /** @type {!firebaseui.auth.AuthResult} */ ({
            // User already signed on external instance.
            'user': app.getExternalAuth().currentUser,
            // Phone Auth operations do not return a credential.
            'credential': null,
            'operationType': userCredential['operationType'],
            'additionalUserInfo': userCredential['additionalUserInfo']
          });
          firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
              app, component, authResult, true);
        }, firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY);
        // On reset, clear timeout.
        app.registerPending(function() {
          // Dismiss dialog if still visible.
          if (component) {
            component.dismissDialog();
          }
          clearTimeout(codeVerifiedTimer);
        });
      },
      // On code verification failure.
      function(error) {
        if (error['name'] && error['name'] == 'cancel') {
          // Close dialog.
          component.dismissDialog();
          return;
        }
        // Get error message.
        var errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(error);
        // Some errors are recoverable while others require resending the code.
        switch (error['code']) {
          case 'auth/credential-already-in-use':
            // Do nothing when anonymous user is getting upgraded.
            // Developer should handle this in signInFailure callback.
            component.dismissDialog();
            break;
          case 'auth/code-expired':
            // Expired code requires sending another request.
            // Render previous phone sign in start page and display error in
            // the info bar.
            var container = component.getContainer();
            // Close dialog.
            component.dismissDialog();
            component.dispose();
            firebaseui.auth.widget.handler.handle(
                firebaseui.auth.widget.HandlerName.PHONE_SIGN_IN_START, app,
                container, phoneNumberValue, errorMessage);
            break;
          case 'auth/missing-verification-code':
          case 'auth/invalid-verification-code':
            // Close dialog.
            component.dismissDialog();
            // As these errors are related to the code provided, it is better
            // to display inline.
            showInvalidCode(errorMessage);
            break;
          default:
            // Close dialog.
            component.dismissDialog();
            // Stay on the same page for all other errors and display error in
            // info bar.
            component.showInfoBar(errorMessage);
            break;
        }
      }));
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.PHONE_SIGN_IN_FINISH,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handlePhoneSignInFinish));
