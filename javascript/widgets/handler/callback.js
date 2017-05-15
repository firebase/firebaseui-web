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
 * @fileoverview Callback handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleCallback');

goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.page.Callback');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles the IDP callback.
 *
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {?goog.Promise<!firebase.auth.UserCredential>=} opt_result
 *     UserCredential from a redirect or popup sign in attempt.
 */
firebaseui.auth.widget.handler.handleCallback =
    function(app, container, opt_result) {
  // Render the UI.
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  // Get result either from passed result or from app's getRedirectResult.
  var resultObtainer = opt_result || app.getRedirectResult();
  app.registerPending(resultObtainer.then(function(result) {
    firebaseui.auth.widget.handler.handleCallbackResult_(app, component,
        result);
  }, function(error) {
    // A previous redirect operation was triggered and some error occured.
    // Test for need confirmation error and handle appropriately.
    // For all other errors, display info bar and show sign in screen.
    if (error &&
        // Single out need confirmation error as email-already-in-use and
        // credential-already-in-use will also return email and credential
        // and need to be handled differently.
        error['code'] == 'auth/account-exists-with-different-credential' &&
        error['email'] &&
        error['credential']) {
      // Save pending email credential.
      firebaseui.auth.storage.setPendingEmailCredential(
          /** @type {!firebaseui.auth.PendingEmailCredential} */ (
              firebaseui.auth.PendingEmailCredential.fromPlainObject(
                  /** @type {?Object} */ (error))),
          app.getAppId());
      firebaseui.auth.widget.handler.handleCallbackLinking_(
          app, component, error['email']);
    } else if (error && error['code'] == 'auth/user-cancelled') {
      // Should go back to the previous linking screen. A pending email
      // should be present, otherwise there's an error.
      var pendingCredential =
          firebaseui.auth.storage.getPendingEmailCredential(app.getAppId());
      var message =
          firebaseui.auth.widget.handler.common.getErrorMessage(error);
      // If there is a credential too, then the previous screen was federated
      // linking so we process the error as a linking flow.
      if (pendingCredential && pendingCredential.getCredential()) {
        firebaseui.auth.widget.handler.handleCallbackLinking_(
            app, component, pendingCredential.getEmail(), message);
      // Otherwise, the user had entered his email but a federated account
      // already existed. It had then triggered federated sign in, but the user
      // did not consent to the scopes. It then needs to restart the federated
      // sign in flow.
      } else if (pendingCredential) {
        firebaseui.auth.widget.handler.common.handleStartEmailFirstFlow(
          app, component, pendingCredential.getEmail(), message);
      } else {
        // Go to the sign-in page with info bar error.
        firebaseui.auth.widget.handler.handleCallbackFailure_(
            app, component, /** @type {!Error} */ (error));
      }
    } else if (error &&
        error['code'] == 'auth/operation-not-supported-in-this-environment' &&
        firebaseui.auth.widget.handler.common.isPasswordProviderOnly(app)) {
      // Operation is not supported in this environment but only password
      // provider is enabled. So allow this to proceed as a no redirect result.
      // This will allow developers using password sign-in in Cordova to use
      // FirebaseUI.
      firebaseui.auth.widget.handler.handleCallbackResult_(
          app,
          component,
          {
            'user': null,
            'credential': null
          });
    } else {
      // Go to the sign-in page with info bar error.
      firebaseui.auth.widget.handler.handleCallbackFailure_(
          app, component, /** @type {!Error} */ (error));
    }
  }));
};


/**
 * Handles callback when the getRedirectResult is successful.
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component if
 *     present.
 * @param {!firebase.auth.UserCredential} result The result from the
 *     getRedirectResult call.
 * @private
 */
firebaseui.auth.widget.handler.handleCallbackResult_ =
    function(app, component, result) {
  if (result['user']) {
    // Sign in or link with redirect was previously triggered.
    var pendingEmailCredential =
        firebaseui.auth.storage.getPendingEmailCredential(app.getAppId());
    // The email originally used before the federated sign in, if any.
    var pendingEmail =
        pendingEmailCredential && pendingEmailCredential.getEmail();
    // Test for email mismatch cases.
    if (pendingEmail &&
        !firebaseui.auth.widget.handler.hasUserEmailAddress_(
            result['user'], pendingEmail)) {
      // The user tried originally to sign in with a different
      // email than the one coming from the provider.
      firebaseui.auth.widget.handler.handleCallbackEmailMismatch_(
          app, component, result['user'], result['credential']);
      return;
    }
    var pendingCredential =
        pendingEmailCredential && pendingEmailCredential.getCredential();
    if (pendingCredential) {
      // Check if there is a pending auth credential. If so, complete the link
      // process and delete the pending credential.
      app.registerPending(result['user'].linkWithCredential(pendingCredential)
          .then(function(user) {
            // Linking successful, complete sign in, pass pending credentials
            // as the developer originally expected them in the sign in
            // attempt that triggered the link.
            firebaseui.auth.widget.handler.handleCallbackSuccess_(
                app,
                component,
                user,
                /** @type {!firebase.auth.AuthCredential} */ (
                    pendingCredential));
          },
          function(error) {
            // Go to the sign-in page with info bar error.
            firebaseui.auth.widget.handler.handleCallbackFailure_(
                app, component, error);
          }));
    } else {
      // No pending credential, complete sign in.
      firebaseui.auth.widget.handler.handleCallbackSuccess_(
          app, component, result['user'], result['credential']);
    }
  } else {
    // No previous redirect operation, go back to the sign-in page with no
    // error.
    var container = component.getContainer();
    component.dispose();
    // Clean the pending email credential, if any, to avoid keeping track of
    // a linking flow after the user has refreshed the page (i.e. when no more
    // redirect result).
    firebaseui.auth.storage.removePendingEmailCredential(app.getAppId());
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
  }
};


/**
 * Handles callback success.
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component if
 *     present.
 * @param {!firebase.User} user The signed in firebase user.
 * @param {!firebase.auth.AuthCredential} credential The auth credential
 *     object.
 * @private
 */
firebaseui.auth.widget.handler.handleCallbackSuccess_ =
    function(app, component, user, credential) {
  firebaseui.auth.storage.removePendingEmailCredential(app.getAppId());
  firebaseui.auth.widget.handler.common.setLoggedIn(app, component, credential);
};


/**
 * Handles callback failure.
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component if
 *     present.
 * @param {!Error} error The error that caused the failure.
 * @private
 */
firebaseui.auth.widget.handler.handleCallbackFailure_ =
    function(app, component, error) {
  var container = component.getContainer();
  firebaseui.auth.storage.removePendingEmailCredential(app.getAppId());
  var errorMessage =
      firebaseui.auth.widget.handler.common.getErrorMessage(error);
  component.dispose();
  // Call widget sign in start handler.
  firebaseui.auth.widget.handler.common.handleSignInStart(
      app, container, undefined, errorMessage);
};


/**
 * Handles callback linking required, fetching the available providers for the
 * user's email and using the correct handler based on the recommended provider.
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component.
 * @param {!string} email The user's email.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 * @private
 */
firebaseui.auth.widget.handler.handleCallbackLinking_ =
    function(app, component, email, opt_infoBarMessage) {
  var container = component.getContainer();
  app.registerPending(app.getAuth().fetchProvidersForEmail(email)
      .then(function(providers) {
        component.dispose();
        if (!providers.length) {
          // No ability to link. Clear pending email credential.
          firebaseui.auth.storage.removePendingEmailCredential(app.getAppId());
          // Edge case scenario: anonymous account exists with the current
          // email. Linking will be required and providers array will be empty.
          // Provide a way for user to recover. Only way is via password reset.
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
        } else if (providers[0] == 'password') {
          // In this scenario, there can't be any error message passed from a
          // auth/user-cancelled error, as the sign in method is password.
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.PASSWORD_LINKING,
              app,
              container,
              email);
        } else {
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.FEDERATED_LINKING,
              app,
              container,
              email,
              providers[0],
              opt_infoBarMessage);
        }
      }, function(error) {
        firebaseui.auth.widget.handler.handleCallbackFailure_(
              app, component, /** @type {!Error} */ (error));
      }));
};


/**
 * Handles email mismatch. Calls the email mismatch handler.
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component.
 * @param {!firebase.User} user The user returned from the provider.
 * @param {!firebase.auth.AuthCredential} credential The auth credential object.
 * @private
 */
firebaseui.auth.widget.handler.handleCallbackEmailMismatch_ =
    function(app, component, user, credential) {
  var container = component.getContainer();
  // On email mismatch, sign out the temporary user to avoid leaking this
  // temp auth session if the user decides to close the window.
  app.registerPending(app.getAuth().signOut().then(function() {
    component.dispose();
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.EMAIL_MISMATCH,
        app,
        container,
        user,
        credential);
  }, function(error) {
    // Ignore error if cancelled by the client.
    if (error['name'] && error['name'] == 'cancel') {
      return;
    }
    var errorMessage = firebaseui.auth.widget.handler.common.getErrorMessage(
        error['code']);
    component.showInfoBar(errorMessage);
  }));
};


/**
 * Tests whether the email address given is one of the user's email addresses.
 * @param {!firebase.User} user The user whose email addresses we're testing.
 * @param {string} email The email address to test.
 * @return {boolean}
 * @private
 */
firebaseui.auth.widget.handler.hasUserEmailAddress_ = function(user, email) {
  if (email == user['email']) {
    return true;
  }
  // Tests provider's email addresses.
  if (user['providerData']) {
    for (var i = 0; i < user['providerData'].length; i++) {
      var provider = user['providerData'][i];
      if (email == provider['email']) {
        return true;
      }
    }
  }
  return false;
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.CALLBACK,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleCallback));
