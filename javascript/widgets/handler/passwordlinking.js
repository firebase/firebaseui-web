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
 * @fileoverview Password account linking handler.
 */

goog.provide('firebaseui.auth.widget.handler.handlePasswordLinking');

goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.page.PasswordLinking');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');



/**
 * Handles password account linking.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string} email The email that was entered instead of password.
 */
firebaseui.auth.widget.handler.handlePasswordLinking = function(
    app, container, email) {
  var pendingEmailCredential =
      firebaseui.auth.storage.getPendingEmailCredential(app.getAppId());
  // No need to store the credential anymore at this point. Delete it quickly.
  firebaseui.auth.storage.removePendingEmailCredential(app.getAppId());
  var pendingCredential =
      pendingEmailCredential && pendingEmailCredential.getCredential();
  if (!pendingCredential) {
    // If no pending credential, it's an error and the user should be redirected
    // to the sign-in page.
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
    return;
  }
  // Render the UI.
  var component = new firebaseui.auth.ui.page.PasswordLinking(
      email,
      // On submit.
      function() {
        firebaseui.auth.widget.handler.onPasswordLinkingSubmit_(
            app,
            component,
            email,
            /** @type {!firebase.auth.AuthCredential} */ (pendingCredential));
      },
      // On recover password link click.
      function() {
        firebaseui.auth.widget.handler.onPasswordRecoveryClicked_(
            app, container, component, email);
      },
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


/**
 * Handles the linking flow once the user has entered his password.
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {firebaseui.auth.ui.page.PasswordLinking} component The UI component.
 * @param {string} email The user's email.
 * @param {!firebase.auth.AuthCredential} pendingCredential The pending
 *     credential to link to a successfully signed in user.
 * @private
 */
firebaseui.auth.widget.handler.onPasswordLinkingSubmit_ =
    function(app, component, email, pendingCredential) {
  var password = component.checkAndGetPassword();
  if (!password) {
    component.getPasswordElement().focus();
    return;
  }

  var showInvalidPassword = function(error) {
    firebaseui.auth.ui.element.setValid(component.getPasswordElement(), false);
    firebaseui.auth.ui.element.show(component.getPasswordErrorElement(),
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  };

  var showInfoBarWithError = function(error) {
    component.showInfoBar(
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  };

  // Tries to sign in with the email and the password entered by the user.
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.signInWithExistingEmailAndPasswordForLinking, app)),
      [email, password],
      function(userCredential) {
        var p = userCredential['user'].linkAndRetrieveDataWithCredential(
            pendingCredential)
            .then(function(linkedUserCredential) {
              var linkedAuthResult =
                /** @type {!firebaseui.auth.AuthResult} */ ({
                'user': linkedUserCredential['user'],
                'credential': pendingCredential,
                'operationType': linkedUserCredential['operationType'],
                'additionalUserInfo': linkedUserCredential['additionalUserInfo']
              });
              // Wait for setLoggedInWithAuthResult promise to resolve before
              // hiding progress bar.
              return firebaseui.auth.widget.handler.common
                  .setLoggedInWithAuthResult(app, component, linkedAuthResult);
            });
        app.registerPending(p);
        return p;
      }, function(error) {
        // Ignore error if cancelled by the client.
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        switch (error['code']) {
          case 'auth/wrong-password':
            showInvalidPassword(error);
            break;
          case 'auth/too-many-requests':
            showInfoBarWithError(error);
            break;
          default:
            firebaseui.auth.log.error(
                'signInWithEmailAndPassword: ' + error['message']);
            showInfoBarWithError(error);
            break;
        }
      }));
};


/**
 * Redirects the user to the password recovery page.
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {firebaseui.auth.ui.page.PasswordLinking} component The UI component.
 * @param {string} email The user's email.
 * @private
 */
firebaseui.auth.widget.handler.onPasswordRecoveryClicked_ =
    function(app, container, component, email) {
  component.dispose();
  firebaseui.auth.widget.handler.handle(
      firebaseui.auth.widget.HandlerName.PASSWORD_RECOVERY, app, container,
      email);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.PASSWORD_LINKING,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handlePasswordLinking));
