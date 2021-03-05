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
 * @fileoverview Email link sign-in callback handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleEmailLinkSignInCallback');

goog.require('firebaseui.auth.ActionCodeUrlBuilder');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.progressDialog');
goog.require('firebaseui.auth.ui.page.Blank');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
/**
 * @suppress {extraRequire} Required for handling anonymous user mismatch error.
 */
goog.require('firebaseui.auth.widget.handler.handleAnonymousUserMismatch');
/**
 * @suppress {extraRequire} Required for handling different device error.
 */
goog.require('firebaseui.auth.widget.handler.handleDifferentDeviceError');
/**
 * @suppress {extraRequire} Required for handling confirmation when email is
 *     missing.
 */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkConfirmation');
/**
 * @suppress {extraRequire} Required for handling different device provider
 *     linking.
 */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkNewDeviceLinking');
goog.require('goog.Promise');
goog.requireType('firebaseui.auth.ui.page.Base');


/**
 * Handles email link sign-in completion. Decides whether to allow sign-in
 * completion, ask the user for email, ask for consent when completing sign-in
 * without linking, etc.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} link The link containing the OTP.
 * @param {?string=} opt_email The email address of the account if
 *     available.
 * @param {boolean=} opt_skipCodeCheck Whether to skip code check. This prevents
 *     multiple checks in the same flow. For example, this flow could trigger
 *     email confirmation and then email confirmation would redirect here.
 *     There is no need to check again in this case.
 */
firebaseui.auth.widget.handler.handleEmailLinkSignInCallback = function(
    app, container, link, opt_email, opt_skipCodeCheck) {
  // Render the UI.
  var component = new firebaseui.auth.ui.page.Blank();
  var urlBuilder = new firebaseui.auth.ActionCodeUrlBuilder(link);
  var oobCode = urlBuilder.getOobCode() || '';
  var sessionId = urlBuilder.getSessionId() || '';
  var forceSameDevice = urlBuilder.getForceSameDevice();
  var anonymousUid = urlBuilder.getAnonymousUid();
  var providerId = urlBuilder.getProviderId();
  // If the email link flow starts with a tenant ID, use the same tenant ID to
  // finish the flow.
  var tenantId = urlBuilder.getTenantId();
  app.setTenantId(tenantId);
  var isNewDevice = !firebaseui.auth.storage.hasEmailForSignIn(app.getAppId());
  var email = opt_email || firebaseui.auth.storage.getEmailForSignIn(
      sessionId, app.getAppId());
  var pendingCredential = firebaseui.auth.storage.getEncryptedPendingCredential(
      sessionId, app.getAppId());
  var credential = pendingCredential && pendingCredential.getCredential();
  // Linking required and the stored credential does not match expected
  // provider ID.
  if (providerId && credential && credential['providerId'] !== providerId) {
    credential = null;
  }
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);

  var onError = function(error) {
    var errorMessage = undefined;
    if (error && error['name'] && error['name'] == 'cancel') {
      return;
    }
    component.dispose();
    // Custom internal errors.
    switch (error && error['message']) {
      case 'anonymous-user-not-found':
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.DIFFERENT_DEVICE_ERROR,
            app,
            container);
        break;
      case 'anonymous-user-mismatch':
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.ANONYMOUS_USER_MISMATCH,
            app,
            container);
        break;
      case 'pending-credential-not-found':
        // Linking required and no pending credential found.
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.EMAIL_LINK_NEW_DEVICE_LINKING,
            app,
            container,
            link,
            // Provider continue callback to get back the modified link without
            // provider ID.
            firebaseui.auth.widget.handler.continueEmailLinkSignIn_);
        break;
      default:
        // Show all other errors in nascar screen info bar.
        if (error) {
          errorMessage =
              firebaseui.auth.widget.handler.common.getErrorMessage(error);
        }
        firebaseui.auth.widget.handler.common.handleSignInStart(
            app, container, undefined, errorMessage);
    }
  };

  var checkActionCodeAndGetUser = function() {
    var anonymousUserPromise = goog.Promise.resolve(null);
    if ((anonymousUid && isNewDevice) || (isNewDevice && forceSameDevice)) {
      // Anonymous user with different device flow or regular sign in flow with
      // same device requirement on different device.
      anonymousUserPromise = goog.Promise.reject(
          new Error('anonymous-user-not-found'));
    } else {
      // This is not an expensive operation (no network request), so it is safe
      // to call it each time this handler is triggered.
      anonymousUserPromise = app.getUpgradeableEmailLinkUser(link)
          .then(function(user) {
            if (providerId && !credential) {
              throw new Error('pending-credential-not-found');
            }
            return user;
          });
    }
    var userToUpgrade = null;
    return anonymousUserPromise.then(function(user) {
      userToUpgrade = user;
      // User found or no anonymous upgrade needed.
      return !!opt_skipCodeCheck ?
          null : app.getAuth().checkActionCode(oobCode);
    }).then(function() {
      return userToUpgrade;
    });
  };

  app.registerPending(component.executePromiseRequest(
      checkActionCodeAndGetUser,
      [],
      function(user) {
        if (email) {
          firebaseui.auth.widget.handler.completeEmailLinkSignIn_(
              app, component, email, link, credential,
              /** @type {?firebase.User} */ (user));
        } else {
          if (forceSameDevice) {
            component.dispose();
            firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.DIFFERENT_DEVICE_ERROR,
              app,
              container);
          } else {
            component.dispose();
            // On email confirmation, call this handler again with
            // skipCodeCheck set to true.
            firebaseui.auth.widget.handler.handle(
                firebaseui.auth.widget.HandlerName.EMAIL_LINK_CONFIRMATION,
                app,
                container,
                link,
                firebaseui.auth.widget.handler.completeEmailConfirmation_);
            }
        }
      },
      onError));
};


/**
 * Processes the email provided by the user during email link confirmation.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} email The email address entered by the user.
 * @param {string} link The link containing the OTP.
 * @private
 */
firebaseui.auth.widget.handler.completeEmailConfirmation_ = function(
    app, container, email, link) {
  // Skip action code checking. Action code checking is always run before asking
  // user for email confirmation.
  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link, email, true);
};


/**
 * Processes the provided link for linking. This is used when link is opened on
 * a different device and provider linking in required. After the user confirms
 * they want to continue without linking, this callback is triggered with the
 * modified link not requiring linking.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} link The link containing the OTP.
 * @private
 */
firebaseui.auth.widget.handler.continueEmailLinkSignIn_ = function(
    app, container, link) {
  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
};


/**
 * @const {number} The delay in milliseconds to keep the sign-in success
 *     dialog on display before completing sign-in.
 */
firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY = 1000;


/**
 * Handles email link sign-in completion.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The UI component.
 * @param {string} email The email address of the account.
 * @param {string} link The link containing the OTP.
 * @param {?firebase.auth.AuthCredential=} credential The pending credential to
 *     link if available.
 * @param {?firebase.User=} user The user to upgrade if available.
 * @return {!firebase.Promise<*>}
 * @private
 */
firebaseui.auth.widget.handler.completeEmailLinkSignIn_ = function(
    app, component, email, link, credential, user) {
  var container = component.getContainer();
  // Display the progress dialog while the user is being signed in or upgraded.
  component.showProgressDialog(
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
  var signInPromise = user ?
      app.upgradeWithEmailLink(user, email, link, credential) :
      app.signInWithEmailLink(email, link, credential);
  var timer = null;
  var p = signInPromise
      .then(function(authResult) {
        // Clear credentials and email on success.
        firebaseui.auth.storage.removeEncryptedPendingCredential(
            app.getAppId());
        firebaseui.auth.storage.removeEmailForSignIn(app.getAppId());
        // Clear UI.
        component.dismissDialog();
        component.showProgressDialog(
            firebaseui.auth.ui.element.progressDialog.State.DONE,
            firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
        // Trigger completion callback after some delay showing the sign in
        // success dialog.
        timer = setTimeout(function() {
          component.dismissDialog();
          firebaseui.auth.widget.handler.common
              .setLoggedInWithAuthResult(app, component, authResult, true);
        }, firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
        // If the UI is reset, the timer should be cleared and any visible UI
        // dismissed.
        app.registerPending(function() {
          if (component) {
            component.dismissDialog();
            component.dispose();
          }
          clearTimeout(timer);
        });
      }, function(error) {
        component.dismissDialog();
        component.dispose();
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        const normalizedError =
            firebaseui.auth.widget.handler.common.normalizeError(error);
        let errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(
                normalizedError);
        if (normalizedError['code'] == 'auth/email-already-in-use' ||
            normalizedError['code'] == 'auth/credential-already-in-use') {
          // Clear credentials and email before handing off credential to
          // developer.
          firebaseui.auth.storage.removeEncryptedPendingCredential(
              app.getAppId());
          firebaseui.auth.storage.removeEmailForSignIn(app.getAppId());
        } else if (normalizedError['code'] == 'auth/invalid-email') {
          // User provided an invalid email. Ask for confirmation again.
          // On email confirmation, call this handler again with
          // skipCodeCheck set to true.
          errorMessage =
              firebaseui.auth.soy2.strings.errorMismatchingEmail().toString();
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.EMAIL_LINK_CONFIRMATION,
              app,
              container,
              link,
              firebaseui.auth.widget.handler.completeEmailConfirmation_,
              null,
              errorMessage);
        } else {
          firebaseui.auth.widget.handler.common.handleSignInStart(
              app, container, email, errorMessage);
        }
      });
  app.registerPending(p);
  return p;
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.EMAIL_LINK_SIGN_IN_CALLBACK,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleEmailLinkSignInCallback));
