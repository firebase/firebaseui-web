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
 * @fileoverview Handles the case where the expected email and the email
 * returned from the federated IdP do not match. The user could get into this
 * state in the following cases:
 *
 * Linking scenario:
 * 1. User creates an account by signing in with Google with foo@gmail.com.
 * 2. User signs out.
 * 3. User tries to sign in with Facebook with an account with email
 *    foo@gmail.com.
 * 4. Backend returns needs-confirmation error. Client tells user that the user
 *    needs to sign in with Google with foo@gmail.com to link the accounts.
 * 5. User enters the Google Sign In flow, but signs in with a different email
 *    bar@gmail.com.
 * We detect this and show a warning to make sure the user actually wants to
 * sign in with bar@gmail.com and not foo@gmail.com. It is not possible to link
 * the former Facebook account to the bar@gmail.com as it has the same email
 * address than an existing account.
 *
 * Sign-in scenario:
 * 1. User creates an account by signing in with Google with foo@gmail.com.
 * 2. User signs out.
 * 3. User tries to sign in with email and password, using foo@gmail.com.
 * 4. We detects it corresponds to a federated account, and redirect the user
 *    to federated sign in for Google.
 * 5. User enters the Google Sign In flow, but signs in with a different email
 *    bar@gmail.com.
 * We detect this and show a warning to make sure the user actually wants to
 * sign in with bar@gmail.com and not foo@gmail.com.
 */

goog.provide('firebaseui.auth.widget.handler.handleEmailMismatch');

goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.page.EmailMismatch');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');



/**
 * Handles the email mismatch case in verifyAssertion response.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {!firebaseui.auth.AuthResult} authResult The Auth result object.
 */
firebaseui.auth.widget.handler.handleEmailMismatch = function(
    app, container, authResult) {
  // Render the UI.
  var pendingEmailCredential =
      firebaseui.auth.storage.getPendingEmailCredential(app.getAppId());
  if (!pendingEmailCredential) {
    // If no pending email credential, it's an error and the user should be
    // redirected to the sign-in page.
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
    return;
  }
  var component = new firebaseui.auth.ui.page.EmailMismatch(
      authResult['user']['email'],
      pendingEmailCredential.getEmail(),
      // On submit.
      function() {
        // The user accepts to sign in with the provider even if the original
        // email does not correspond.
        firebaseui.auth.widget.handler.handleEmailMismatchContinue_(
            app, component, authResult);
      }, function() {
        // On cancel.
        firebaseui.auth.widget.handler.handleEmailMismatchCancel_(
            app,
            component,
            /** @type {!firebaseui.auth.PendingEmailCredential} */ (
                pendingEmailCredential),
            authResult['credential']['providerId']);
      },
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


/**
 * Handles when the user clicks on continue.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component.
 * @param {!firebaseui.auth.AuthResult} authResult The Auth result object.
 * @private
 */
firebaseui.auth.widget.handler.handleEmailMismatchContinue_ =
    function(app, component, authResult) {
  // Do not dispose of component yet as error could still occur in setLoggedIn
  // and new component may need to be rendered.
  firebaseui.auth.storage.removePendingEmailCredential(app.getAppId());
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, component, authResult);
};


/**
 * Handles when the user cancels.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component.
 * @param {!firebaseui.auth.PendingEmailCredential} pendingEmailCredential The
 *     pending email/credential originally used.
 * @param {string} providerId The original providerId that was just used.
 * @private
 */
firebaseui.auth.widget.handler.handleEmailMismatchCancel_ =
    function(app, component, pendingEmailCredential, providerId) {
  var container = component.getContainer();
  component.dispose();
  if (pendingEmailCredential.getCredential()) {
    // Redirects back to federated linking.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.FEDERATED_LINKING,
        app,
        container,
        pendingEmailCredential.getEmail(),
        providerId);
  } else {
    // Redirects back to federated sign-in.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.FEDERATED_SIGN_IN,
        app,
        container,
        pendingEmailCredential.getEmail(),
        providerId);
  }
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.EMAIL_MISMATCH,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleEmailMismatch));
