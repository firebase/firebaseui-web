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
 * @fileoverview Password sign up handler.
 */

goog.provide('firebaseui.auth.widget.handler.handlePasswordSignUp');

goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.page.PasswordSignUp');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('goog.string');


/**
 * Handles password sign up.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string=} opt_email The email address of the account.
 * @param {string=} opt_name The display name of the account.
 * @param {boolean=} opt_disableCancel Whether to disable the cancel link.
 * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
 *     message of Term of Service and Privacy Policy.
 */
firebaseui.auth.widget.handler.handlePasswordSignUp = function(
    app, container, opt_email, opt_name, opt_disableCancel,
    opt_displayFullTosPpMessage) {
  var onCancel = function() {
    component.dispose();
    // On cancel return to widget start page.
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
  };
  // Render the UI.
  var component = new firebaseui.auth.ui.page.PasswordSignUp(
      app.getConfig().isDisplayNameRequired(),
      // On submit.
      function() {
        firebaseui.auth.widget.handler.onSignUpSubmit_(app, component);
      },
      // On cancel.
      opt_disableCancel ? undefined : onCancel,
      opt_email,
      opt_name,
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl(),
      opt_displayFullTosPpMessage);
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


/**
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {firebaseui.auth.ui.page.PasswordSignUp} component The UI component.
 * @private
 */
firebaseui.auth.widget.handler.onSignUpSubmit_ = function(app, component) {
  var requireDisplayName = app.getConfig().isDisplayNameRequired();

  // Check fields are valid.
  var email = component.checkAndGetEmail();

  var name = null;
  if (requireDisplayName) {
    name = component.checkAndGetName();
  }

  var password = component.checkAndGetNewPassword();
  if (!email) {
    component.getEmailElement().focus();
    return;
  }
  if (requireDisplayName) {
    if (name) {
      name = goog.string.htmlEscape(name);
    } else {
      component.getNameElement().focus();
      return;
    }
  }
  if (!password) {
    component.getNewPasswordElement().focus();
    return;
  }
  // Initialize an internal temporary password credential. This will be used
  // to signInWithCredential to the developer provided auth instance on success.
  // This credential will never be passed to developer or stored internally.
  var emailPassCred =
      firebase.auth.EmailAuthProvider.credential(email, password);
  // Sign up new account.
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.startCreateUserWithEmailAndPassword, app)
          ),
      [email, password],
      function(userCredential) {
        var authResult = /** @type {!firebaseui.auth.AuthResult} */ ({
          'user': userCredential['user'],
          // Password credential is needed for signing in on external instance.
          'credential': emailPassCred,
          'operationType': userCredential['operationType'],
          'additionalUserInfo': userCredential['additionalUserInfo']
        });
        if (requireDisplayName) {
          // Sign up successful. We can now set the name.
          var p = userCredential['user'].updateProfile({'displayName': name})
              .then(function() {
                return firebaseui.auth.widget.handler.common
                    .setLoggedInWithAuthResult(app, component, authResult);
              });
          app.registerPending(p);
          return p;
        } else {
          return firebaseui.auth.widget.handler.common
              .setLoggedInWithAuthResult(app, component, authResult);
        }
      },
      function(error) {
        // Ignore error if cancelled by the client.
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        var errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(error);
        switch (error['code']) {
          case 'auth/email-already-in-use':
            // Check if the user is locked out of their account or just display
            // the email exists error.
            return firebaseui.auth.widget.handler.onEmailExists_(
                app, component, /** @type {string} */ (email), error);
            break;

          case 'auth/too-many-requests':
            errorMessage = firebaseui.auth.soy2.strings
                .errorTooManyRequestsCreateAccount().toString();
          case 'auth/operation-not-allowed':
          case 'auth/weak-password':
            firebaseui.auth.ui.element.setValid(
                component.getNewPasswordElement(),
                false);
            firebaseui.auth.ui.element.show(
                component.getNewPasswordErrorElement(),
                errorMessage);
            break;

          default:
            firebaseui.auth.log.error(
                'setAccountInfo: ' + goog.json.serialize(error));
            component.showInfoBar(errorMessage);
            break;
        }
      }));
};


/**
 * Process the email exists error.
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {firebaseui.auth.ui.page.PasswordSignUp} component The UI component.
 * @param {string} email The current email.
 * @param {*} emailExistsError The email exists error.
 * @return {!firebase.Promise} The promise that resolves when email exists error
 *     is handled.
 * @private
 */
firebaseui.auth.widget.handler.onEmailExists_ =
    function(app, component, email, emailExistsError) {
  // If a provider already exists, just display the error and focus the email
  // element.
  var onSignInMethodExists = function() {
    var errorMessage =
        firebaseui.auth.widget.handler.common.getErrorMessage(emailExistsError);
    firebaseui.auth.ui.element.setValid(component.getEmailElement(), false);
    firebaseui.auth.ui.element.show(
        component.getEmailErrorElement(), errorMessage);
    component.getEmailElement().focus();
  };
  var p = app.getAuth().fetchSignInMethodsForEmail(email)
      .then(function(signInMethods) {
        // No sign in method found.
        if (!signInMethods.length) {
          var container = component.getContainer();
          component.dispose();
          // Edge case. No sign in method for current email and backend is
          // returning an error that the email is already in use.
          // An anonymous user must exist with the same email. Provide a
          // way for the user to recover their account.
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.PASSWORD_RECOVERY,
              app,
              container,
              email,
              // Allow the user to cancel.
              false,
              // Display a message to explain to the user what happened.
              firebaseui.auth.soy2.strings.errorAnonymousEmailBlockingSignIn()
                .toString());
        } else {
          // A sign in method already exists, just display the error.
          onSignInMethodExists();
        }
      }, function(error) {
        // If an error occurs while fetching sign in methods, just display the
        // email exists error.
        onSignInMethodExists();
      });
  app.registerPending(p);
  return p;
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.PASSWORD_SIGN_UP,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handlePasswordSignUp));
