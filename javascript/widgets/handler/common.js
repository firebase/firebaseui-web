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
 * @fileoverview Common functions shared by handlers.
 */
goog.forwardDeclare('firebaseui.auth.AuthUI');

goog.provide('firebaseui.auth.OAuthResponse');
goog.provide('firebaseui.auth.widget.handler.common');

goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.RedirectStatus');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('firebaseui.auth.ui.page.PasswordLinking');
goog.require('firebaseui.auth.ui.page.PasswordSignIn');
goog.require('firebaseui.auth.ui.page.UnrecoverableError');
goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('goog.Promise');
goog.require('goog.array');


/**
 * @typedef {{
 *   oauthAccessToken: (null|string|undefined),
 *   oauthExpireIn: (null|number|undefined),
 *   oauthAuthorizationCode: (null|string|undefined)
 * }}
 */
firebaseui.auth.OAuthResponse;

/**
 * Normalizes the error. This is useful for mapping certain errors to different
 * errors.
 * When no mapping is needed, the same error is returned.
 * This is currently used to map 'auth/invalid-credential' code to
 * 'auth/user-cancelled' when users do not grant access permission to
 * Microsoft work account.
 * @param {*} error The original error.
 * @return {*} The normalized error.
 * @package
 */
firebaseui.auth.widget.handler.common.normalizeError =
    function(error) {
  if (error['code'] === 'auth/invalid-credential' &&
      error['message'] &&
      error['message'].indexOf('error=consent_required') !== -1) {
    return {code: 'auth/user-cancelled'};
  }
  return error;
};

/**
 * Sets the user as signed in with Auth result. Signs in on external Auth
 * instance if not already signed in and then invokes
 * signInSuccessWithAuthResult callback.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used and that has a user signed in.
 * @param {firebaseui.auth.ui.page.Base} component The UI component.
 * @param {!firebaseui.auth.widget.Config.AuthResult} authResult The Auth
 *     result, which includes current user, credential to sign in to external
 *     Auth instance, additional user info and operation type.
 * @param {boolean=} opt_alreadySignedIn Whether user already signed in on
 *     external Auth instance. If true, current user on external Auth instance
 *     should be passed in from Auth result. Should be true for anonymous
 *     upgrade flow and phone Auth flow since user already logged in on
 *     external Auth instnace.
 * @return {!goog.Promise} A promise that resolves on login completion.
 * @package
 */
firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult =
    function(app, component, authResult, opt_alreadySignedIn) {
  // Revert language code at this point to ensure languageCode changes are
  // reverted before callbacks are triggered.
  app.revertLanguageCode();
  if (!!opt_alreadySignedIn) {
    firebaseui.auth.widget.handler.common
        .setUserLoggedInExternalWithAuthResult_(
            app,
            component,
            authResult);
    return goog.Promise.resolve();
  }
  // This should not occur.
  if (!authResult['credential']) {
    throw new Error('No credential found!');
  }
  // For any error, display in info bar message.
  var onError = function(error) {
    // Ignore error if cancelled by the client.
    if (error['name'] && error['name'] == 'cancel') {
      return;
    }
    // Check if the error was due to an expired credential.
    // This may happen in the email mismatch case where the user waits more
    // than an hour and then proceeds to sign in with the expired credential.
    // Display the relevant error message in this case and return the user to
    // the sign-in start page.
    if (firebaseui.auth.widget.handler.common.isCredentialExpired(error)) {
      var container = component.getContainer();
      // Dispose any existing component.
      component.dispose();
      // Call widget sign-in start handler with the expired credential error.
      firebaseui.auth.widget.handler.common.handleSignInStart(
          app,
          container,
          undefined,
          firebaseui.auth.soy2.strings.errorExpiredCredential().toString());
    } else {
      var errorMessage = (error && error['message']) || '';
      if (error['code']) {
        // Firebase Auth error.
        // Errors thrown by anonymous upgrade should not be displayed in
        // info bar.
        if (error['code'] == 'auth/email-already-in-use' ||
            error['code'] == 'auth/credential-already-in-use') {
          return;
        }
        errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(error);
      }
      // Show error message in the info bar.
      component.showInfoBar(errorMessage);
    }
  };
  // In some cases like email mismatch, the temporary user may be signed out.
  // In that case, get the current temporary user directly.
  // For anonymous upgrade, use the user from AuthResult passed in.
  var tempUser = app.getAuth().currentUser || authResult['user'];
  if (!tempUser) {
    // Shouldn't happen as we're only calling this method internally.
    throw new Error('User not logged in.');
  }
  // Sign out from internal Auth instance before signing in to external
  // instance.
  try {
    var signOutAndSignInPromise = app.finishSignInAndRetrieveDataWithAuthResult(
        authResult);
  } catch (e) {
    // This error will likely occur during development.
    // Log error with stack trace in console and display the error code or
    // message in the information bar.
    // Otherwise, the error thrown will get suppressed downstream and the
    // developer will have no way to determine what happened.
    // https://github.com/firebase/firebaseui-web/issues/408
    firebaseui.auth.log.error(e['code'] || e['message'], e);
    component.showInfoBar(e['code'] || e['message']);
    return goog.Promise.resolve();
  }
  var signInSuccessPromise = signOutAndSignInPromise
      .then(function(outputAuthResult) {
        firebaseui.auth.widget.handler.common
            .setUserLoggedInExternalWithAuthResult_(
                app, component, outputAuthResult);
      }, onError)
    // Catch error when signInSuccessUrl is required and not provided.
    .then(undefined, onError);
  app.registerPending(signOutAndSignInPromise);
  return goog.Promise.resolve(signInSuccessPromise);
};


/**
 * Completes the sign in operation assuming the current user is already signed
 * in on the external auth instance. This routine will not try to remember the
 * user account.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used and that has a user signed in.
 * @param {firebaseui.auth.ui.page.Base} component The UI component.
 * @param {!firebase.User} user The current user, provided signed in on the
 *     external auth instance.
 * @param {?firebase.auth.AuthCredential} credential The auth credential
 *     object.
 * @private
 */
firebaseui.auth.widget.handler.common.setUserLoggedInExternal_ =
    function(app, component, user, credential) {
  // Finish the flow by redirecting to sign-in success URL.
  var callback = app.getConfig().getSignInSuccessCallback();
  // Get redirect URL if it exists in non persistent storage.
  // If sign-in success callback defined, pass redirect URL as third
  // parameter.
  // If not defined, override signInSuccessUrl with redirect URL value.
  var redirectUrl = firebaseui.auth.storage.getRedirectUrl(
      app.getAppId()) || undefined;
  // Clear redirect URL from storage if available.
  firebaseui.auth.storage.removeRedirectUrl(app.getAppId());
  // Whether widget is redirecting. Initialize to false.
  var isRedirecting = false;
  if (firebaseui.auth.util.hasOpener()) {
    // Popup sign in.
    if (!callback ||
        callback(
            /** @type {!firebase.User} */ (user),
            credential,
            redirectUrl)) {
      // Whether sign-in widget is redirecting.
      isRedirecting = true;
      // signInSuccessUrl is only required if there's no callback or it
      // returns true, and if there's no redirectUrl present.
      firebaseui.auth.util.openerGoTo(
          firebaseui.auth.widget.handler.common.getSignedInRedirectUrl_(
              app, redirectUrl));
    }
    if (!callback) {
      // If the developer supplies a callback, do not close the popup
      // window. Should be closed manually by the developer.
      firebaseui.auth.util.close(window);
    }
  } else {
    // Normal sign in.
    if (!callback ||
        callback(
            /** @type {!firebase.User} */ (user),
            credential,
            redirectUrl)) {
      // Sign-in widget is redirecting.
      isRedirecting = true;
      // signInSuccessUrl is only required if there's no callback or it
      // returns true, and if there's no redirectUrl present.
      firebaseui.auth.util.goTo(
          firebaseui.auth.widget.handler.common.getSignedInRedirectUrl_(
              app, redirectUrl));
    }
  }
  // Dispose UI if not already disposed and not redirecting.
  // If the widget is redirecting, it provides better UX to keep the loader
  // showing until the page redirects. Otherwise, (most likely operating in
  // single page mode), hide any remaining widget UI component.
  if (!isRedirecting) {
    app.reset();
  }
};


/**
 * Completes the sign in operation assuming the current user is already signed
 * in on the external Auth instance. This routine will not try to remember the
 * user account.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used and that has a user signed in.
 * @param {firebaseui.auth.ui.page.Base} component The UI component.
 * @param {!firebaseui.auth.widget.Config.AuthResult} authResult The Auth
 *     result, which includes current user, credential to sign in to external
 *     Auth instance, additional user info and operation type.
 * @private
 */
firebaseui.auth.widget.handler.common.setUserLoggedInExternalWithAuthResult_ =
    function(app, component, authResult) {
  // Already signed in on external Auth instance. Auth result should
  // contain the current signed in user on external Auth instance.
  // This should not occur.
  if (!authResult['user']) {
    throw new Error('No user found');
  }
  var signInSuccessWithAuthResultCallback =
      app.getConfig().getSignInSuccessWithAuthResultCallback();
  var signInSuccessCallback = app.getConfig().getSignInSuccessCallback();
  // If both old and new signInSuccess callbacks are provided, warn in console
  // that only new callback will be invoked.
  if (signInSuccessCallback && signInSuccessWithAuthResultCallback) {
    var callbackWarning = 'Both signInSuccess and ' +
        'signInSuccessWithAuthResult callbacks are provided. Only ' +
        'signInSuccessWithAuthResult callback will be invoked.';
    firebaseui.auth.log.warning(callbackWarning);
  }
  // If signInSuccessWithAuthResult callback is not provided, fallback to the
  // old signInSuccess callback. To be removed once the signInSuccess callback
  // is removed.
  if (!signInSuccessWithAuthResultCallback) {
    firebaseui.auth.widget.handler.common.setUserLoggedInExternal_(
        app, component, authResult['user'], authResult['credential']);
  } else {
    var callback = app.getConfig().getSignInSuccessWithAuthResultCallback();
    // Finish the flow by redirecting to sign-in success URL.
    // Get redirect URL if it exists in non persistent storage.
    // If signInSuccessWithAuthResult callback defined, pass redirect URL as
    // second parameter.
    // If not defined, override signInSuccessUrl with redirect URL value.
    var redirectUrl = firebaseui.auth.storage.getRedirectUrl(
        app.getAppId()) || undefined;
    // Clear redirect URL from storage if available.
    firebaseui.auth.storage.removeRedirectUrl(app.getAppId());
    // Whether widget is redirecting. Initialize to false.
    var isRedirecting = false;
    if (firebaseui.auth.util.hasOpener()) {
      // Popup sign in.
      if (!callback || callback(authResult, redirectUrl)) {
        // Whether sign-in widget is redirecting.
        isRedirecting = true;
        // signInSuccessUrl is only required if there's no callback or it
        // returns true, and if there's no redirectUrl present.
        firebaseui.auth.util.openerGoTo(
            firebaseui.auth.widget.handler.common.getSignedInRedirectUrl_(
                app, redirectUrl));
      }
      if (!callback) {
        // If the developer supplies a callback, do not close the popup
        // window. Should be closed manually by the developer.
        firebaseui.auth.util.close(window);
      }
    } else {
      // Normal sign in.
      if (!callback || callback(authResult, redirectUrl)) {
        // Sign-in widget is redirecting.
        isRedirecting = true;
        // signInSuccessUrl is only required if there's no callback or it
        // returns true, and if there's no redirectUrl present.
        firebaseui.auth.util.goTo(
            firebaseui.auth.widget.handler.common.getSignedInRedirectUrl_(
                app, redirectUrl));
      }
    }
    // Dispose UI if not already disposed and not redirecting.
    // If the widget is redirecting, it provides better UX to keep the loader
    // showing until the page redirects. Otherwise, (most likely operating in
    // single page mode), hide any remaining widget UI component.
    if (!isRedirecting) {
      app.reset();
    }
  }
};


/**
 * Returns the redirect URL for a successful sign-in, when required. It will
 * raise an error if none is found.
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance.
 * @param {string=} opt_redirectUrl An optional redirect URL coming from
 *     temporary storage.
 * @return {string} The redirect URL to use.
 * @private
 */
firebaseui.auth.widget.handler.common.getSignedInRedirectUrl_ =
    function(app, opt_redirectUrl) {
  var redirectUrl = opt_redirectUrl || app.getConfig().getSignInSuccessUrl();
  if (!redirectUrl) {
    throw new Error('No redirect URL has been found. You must either specify ' +
        'a signInSuccessUrl in the configuration, pass in a redirect URL to t' +
        'he widget URL, or return false from the callback.');
  }
  return redirectUrl;
};


/**
 * Gets the display message for the error code.
 * @param {*} error The error.
 * @return {string} The display error message.
 * @package
 */
firebaseui.auth.widget.handler.common.getErrorMessage = function(error) {
  // Try to get an error message from the strings file, or fall back to the
  // error message from the Firebase SDK if none is found.
  var message =
      firebaseui.auth.soy2.strings.error({code: error['code']}).toString();
  if (message) {
    return message;
  }
  // Tries to parse the JSON. If successful, display a generic error message.
  try {
    JSON.parse(error['message']);
    firebaseui.auth.log.error('Internal error: ' + error['message']);
    return firebaseui.auth.soy2.strings.internalError().toString();
  } catch(e) {
    // Otherwise the message must contain some info.
    return error['message'];
  }
};


/**
 * Returns whether the error provided corresponds to a sign-in attempt with an
 * expired OAuth credential.
 * @param {*} error The error.
 * @return {boolean} Whether the error returned is due to the OAuth credential
 *     being expired.
 * @package
 */
firebaseui.auth.widget.handler.common.isCredentialExpired = function(error) {
  // Check if the error is thrown due to the OAuth credential being expired.
  // In that case an internal error code is thrown and the server response is
  // serialized.
  // TODO: update this error check when Firebase auth backend provides a
  // dedicated error code instead of this hack.
  var message = error['message'];
  try {
    // Check if the error message is a serialized json.
    var errorDetails = JSON.parse(message);
    // If so parse the internal message in the error.
    var internalMessage = (errorDetails['error'] || {})['message'] || '';
    // Expired Facebook access token:
    // "invalid access_token, error code 43."
    // Expired Google access token:
    // "Invalid Idp Response: access_token is invalid"
    // Look for invalid access_token pattern.
    var re = new RegExp('invalid.+(access|id)_token');
    var matches = internalMessage.toLowerCase().match(re);
    if (matches && matches.length) {
      // Match found, return true.
      return true;
    }
  } catch(e) {}
  return false;
};


/**
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {string} providerId The provider ID of the selected IdP.
 * @param {?string=} opt_email The optional email to try to sign in with.
 * @return {!firebase.auth.AuthProvider} The corresponding Firebase Auth
 *     provider with additional scopes and custom parameters.
 * @private
 */
firebaseui.auth.widget.handler.common.getAuthProvider_ = function(
    app, providerId, opt_email) {
  // Construct provider and pass additional scopes.
  var provider = firebaseui.auth.idp.getAuthProvider(providerId);
  // Provider must be provided for any action to be taken.
  if (!provider) {
    // This shouldn't happen.
    throw new Error('Invalid Firebase Auth provider!');
  }
  // Get additional scopes for requested provider.
  var additionalScopes =
      app.getConfig().getProviderAdditionalScopes(providerId);
  // Some providers like Twitter do not accept additional scopes.
  if (provider['addScope']) {
    // Add every requested additional scope to the provider.
    for (var i = 0; i < additionalScopes.length; i++) {
      provider['addScope'](additionalScopes[i]);
    }
  }
  // Get custom parameters for the selected provider.
  var customParameters =
      app.getConfig().getProviderCustomParameters(providerId) || {};
  // Some providers accept an email address as a login hint. If the email is
  // set and if the provider supports it, add it to the custom paramaters.
  if (opt_email) {
    var loginHintKey;
    // Since the name of the parameter is known for Google and GitHub, set this
    // automatically. Google and GitHub are the only default providers which
    // support a login hint.
    if (providerId == firebase.auth.GoogleAuthProvider.PROVIDER_ID) {
      loginHintKey = 'login_hint';
    } else if (providerId == firebase.auth.GithubAuthProvider.PROVIDER_ID) {
      loginHintKey = 'login';
    } else {
      // For other providers, check if the name is set in the configuration.
      var providerConfig = app.getConfig().getConfigForProvider(providerId);
      loginHintKey = providerConfig && providerConfig.loginHintKey;
    }
    // If the hint is set, add the email to the custom parameters.
    if (loginHintKey) {
      customParameters[loginHintKey] = opt_email;
    }
  }
  // Set the custom parameters if applicable for the current provider.
  if (provider.setCustomParameters) {
    provider.setCustomParameters(customParameters);
  }
  return provider;
};


/**
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component.
 * @param {string} providerId The provider ID of the selected IdP.
 * @param {?string=} opt_email The optional email to try to sign in with.
 * @package
 */
firebaseui.auth.widget.handler.common.federatedSignIn = function(
    app, component, providerId, opt_email) {
  var container = component.getContainer();
  var providerSigninFailedCallback = function(error) {
    // Removes the pending redirect status being set previously
    // if sign-in with redirect fails.
    firebaseui.auth.storage.removeRedirectStatus(app.getAppId());
    // TODO: align redirect and popup flow error handling for similar errors.
    // Ignore error if cancelled by the client.
    if (error['name'] && error['name'] == 'cancel') {
      return;
    }
    firebaseui.auth.log.error('signInWithRedirect: ' + error['code']);
    var errorMessage = firebaseui.auth.widget.handler.common.getErrorMessage(
          error);
    // If the page was previously blank because the 'nascar' screen is being
    // skipped, then the provider sign-in 'nascar' screen needs to be shown
    // along with the error message. Otherwise, the error message can simply
    // be added to the info bar.
    if (component.getPageId() == 'blank' &&
        app.getConfig().federatedProviderShouldImmediatelyRedirect()) {
      component.dispose();
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
          app,
          container,
          errorMessage);
    } else {
      component.showInfoBar(errorMessage);
    }
  };
  // Error handler for signInWithPopup and getRedirectResult on Cordova.
  var signInResultErrorCallback = function(error) {
    // Clear pending redirect status if redirect on Cordova fails.
    firebaseui.auth.storage.removeRedirectStatus(app.getAppId());
    // Ignore error if cancelled by the client.
    if (error['name'] && error['name'] == 'cancel') {
      return;
    }
    // Normalize the error.
    const normalizedError =
        firebaseui.auth.widget.handler.common.normalizeError(error);
    switch (normalizedError['code']) {
      case 'auth/popup-blocked':
        // Popup blocked, switch to redirect flow as fallback.
         processRedirect();
        break;
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        // When popup is closed or when the user clicks another button,
        // do nothing.
        break;
      case 'auth/credential-already-in-use':
        // Do nothing when anonymous user is getting updated.
        // Developer should handle this in signInFailure callback.
        break;
      case 'auth/network-request-failed':
      case 'auth/too-many-requests':
      case 'auth/user-cancelled':
        // For no action errors like network error, just display in info
        // bar in current component. A second attempt could still work.
        component.showInfoBar(
            firebaseui.auth.widget.handler.common.getErrorMessage(
                normalizedError));
        break;
      default:
        // Either linking required errors or errors that are
        // unrecoverable.
        component.dispose();
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.CALLBACK,
            app,
            container,
            goog.Promise.reject(normalizedError));
        break;
    }
  };
  // Initialize the corresponding provider.
  var provider = firebaseui.auth.widget.handler.common.getAuthProvider_(
      app, providerId, opt_email);
  // Redirect processor.
  var processRedirect = function() {
    var redirectStatus = new firebaseui.auth.RedirectStatus(app.getTenantId());
    firebaseui.auth.storage.setRedirectStatus(redirectStatus, app.getAppId());
    app.registerPending(component.executePromiseRequest(
        /** @type {function (): !goog.Promise} */ (
            goog.bind(app.startSignInWithRedirect, app)),
        [provider],
        function() {
          // Only run below logic if the environment is potentially a Cordova
          // environment. This check is not required but will minimize the
          // need to change existing tests that assertSignInWithRedirect.
          if (firebaseui.auth.util.getScheme() !== 'file:') {
            return;
          }
          // This will resolve in a Cordova environment. Result should be
          // obtained from getRedirectResult and then treated like a
          // signInWithPopup operation.
          return app.registerPending(app.getRedirectResult()
              .then(function(result) {
                // Pass result in promise to callback handler.
                component.dispose();
                // Removes pending redirect status if sign-in with redirect
                // resolves in Cordova environment.
                firebaseui.auth.storage.removeRedirectStatus(
                    app.getAppId());
                firebaseui.auth.widget.handler.handle(
                    firebaseui.auth.widget.HandlerName.CALLBACK,
                    app,
                    container,
                    goog.Promise.resolve(result));
              }, signInResultErrorCallback));
        },
        providerSigninFailedCallback));
  };
  // Get the sign-in flow.
  var isRedirectMode = app.getConfig().getSignInFlow() ==
      firebaseui.auth.widget.Config.SignInFlow.REDIRECT;
  if (isRedirectMode) {
    // Redirect flow.
    processRedirect();
  } else {
    // Popup flow.
    // During rpc, no progress bar should be displayed.
    app.registerPending(app.startSignInWithPopup(provider).then(
        function(result) {
          // Pass result in promise to callback handler.
          component.dispose();
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.CALLBACK,
              app,
              container,
              goog.Promise.resolve(result));
        }, signInResultErrorCallback));
  }
};


/**
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component.
 * @package
 */
firebaseui.auth.widget.handler.common.handleSignInAnonymously = function(
    app, component) {
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.startSignInAnonymously, app)),
      [],
      function(userCredential) {
        component.dispose();
        return firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
            app,
            component,
            /** @type {!firebaseui.auth.widget.Config.AuthResult} */(
                userCredential),
            true);
      },
      function(error) {
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        firebaseui.auth.log.error('ContinueAsGuest: ' + error['code']);
        var errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(error);
        component.showInfoBar(errorMessage);
      }));
};


/**
 * Handles sign-in with a One-Tap credential.
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The UI component.
 * @param {?SmartLockCredential} credential The googleyolo credential if
 *     available.
 * @return {!goog.Promise<boolean>} Whether sign-in completed
 *     successfully or a promise that resolve on sign-in completion. It resolves
 *     with true on success, false otherwise.
 * @package
 */
firebaseui.auth.widget.handler.common.handleGoogleYoloCredential =
    function(app, component, credential) {
  /**
   * Sign in with a Firebase Auth credential.
   * @param {!firebase.auth.AuthCredential} firebaseCredential The Firebase Auth
   *     credential.
   * @return {!goog.Promise<boolean>}
   */
  var signInWithCredential = function(firebaseCredential) {
    var status = false;
    var p = component.executePromiseRequest(
        /** @type {function (): !goog.Promise} */ (
            goog.bind(app.startSignInWithCredential, app)),
        [firebaseCredential],
        function(result) {
          var container = component.getContainer();
          component.dispose();
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.CALLBACK,
              app,
              container,
              goog.Promise.resolve(result));
          status = true;
        },
        function(error) {
          if (error['name'] && error['name'] == 'cancel') {
            return;
          } else if (error &&
                     error['code'] == 'auth/credential-already-in-use') {
            // Do nothing when anonymous user is getting updated.
            // Developer should handle this in signInFailure callback.
            return;
          } else if (error &&
                     error['code'] == 'auth/email-already-in-use' &&
                     error['email'] && error['credential']) {
            // Email already in use error should trigger account linking flow.
            // Pass error to callback handler to trigger that flow.
            var container = component.getContainer();
            component.dispose();
            firebaseui.auth.widget.handler.handle(
                firebaseui.auth.widget.HandlerName.CALLBACK,
                app,
                container,
                goog.Promise.reject(error));
            return;
          }
          var errorMessage =
              firebaseui.auth.widget.handler.common.getErrorMessage(error);
          // Show error message in the info bar.
          component.showInfoBar(errorMessage);
        });
    app.registerPending(p);
    return p.then(function() {
      // Status needs to be returned.
      return status;
    }, function(error) {
      return false;
    });
  };
  /**
   * Sign in with a provider ID.
   * @param {string} providerId The Firebase Auth provider ID to sign-in with.
   * @param {?string=} opt_email The optional email to sign-in with.
   * @return {!goog.Promise<boolean>}
   */
  var signInWithProvider = function(providerId, opt_email) {
    // If popup flow enabled, this will fail and fallback to redirect.
    // TODO: Optimize to force redirect mode only.
    // For non-Google providers (not supported yet). This may end up signing the
    // user with a provider using different email. Even for Google, a user can
    // override the login_hint, but that should be fine as it is the user's
    // choice.
    firebaseui.auth.widget.handler.common.federatedSignIn(
        app, component, providerId, opt_email);
    return goog.Promise.resolve(true);
  };
  // ID token credential available and supported Firebase Auth provider also
  // available.
  if (credential &&
      credential.credential &&
      credential.clientId === app.getConfig().getGoogleYoloClientId()) {
    // ID token available.
    // Only Google has API to sign-in with an ID token.
    if (app.getConfig().getProviderAdditionalScopes(
            firebase.auth.GoogleAuthProvider.PROVIDER_ID).length) {
      let email;
      try {
        // New one-tap API does not return the credential identitifer.
        // Parse email from Google ID token.
        const components  = credential.credential.split('.');
        const payloadDecoded = JSON.parse(atob(components[1]));
        email = payloadDecoded['email'];
      } catch (e) {
        // Ignore
      }
      // Scopes available, OAuth flow with additional scopes required.
      return signInWithProvider(
          firebase.auth.GoogleAuthProvider.PROVIDER_ID, email);
    } else {
      // Scopes not requested. Sign in with ID token directly.
      return signInWithCredential(firebase.auth.GoogleAuthProvider.credential(
          credential.credential));
    }
  } else if (credential) {
    // Unsupported credential.
    // Show error message in the info bar. This is typically caught during
    // development. The developer is expected to only enable One-Tap providers
    // that are supported by FirebaseUI.
    component.showInfoBar(
        firebaseui.auth.soy2.strings.errorUnsupportedCredential().toString());
  }
  return goog.Promise.resolve(false);
};


/**
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {firebaseui.auth.ui.page.PasswordLinking|
 *     firebaseui.auth.ui.page.PasswordSignIn}
 *     component The UI component.
 * @package
 */
firebaseui.auth.widget.handler.common.verifyPassword =
    function(app, component) {
  // Check fields are valid.
  var email = component.checkAndGetEmail();
  var password = component.checkAndGetPassword();
  if (!email) {
    component.getEmailElement().focus();
    return;
  }
  if (!password) {
    component.getPasswordElement().focus();
    return;
  }
  // Initialize an internal temporary password credential. This will be used
  // to signInWithCredential to the developer provided auth instance on success.
  // This credential will never be passed to developer or stored internally.
  var emailPassCred =
      firebase.auth.EmailAuthProvider.credential(email, password);

  var showInvalidEmail = function(error) {
    firebaseui.auth.ui.element.setValid(component.getEmailElement(), false);
    firebaseui.auth.ui.element.show(component.getEmailErrorElement(),
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  };

  var showInvalidPassword = function(error) {
    firebaseui.auth.ui.element.setValid(component.getPasswordElement(), false);
    firebaseui.auth.ui.element.show(component.getPasswordErrorElement(),
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  };

  var showInfoBarWithError = function(error) {
    component.showInfoBar(
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  };

  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.startSignInWithEmailAndPassword, app)),
      [email, password],
      function(userCredential) {
        var authResult = (
            /** @type {!firebaseui.auth.widget.Config.AuthResult} */ ({
              'user': userCredential['user'],
              // Password credential is needed to complete sign-in to the
              // original Auth instance.
              'credential': emailPassCred,
              'operationType': userCredential['operationType'],
              'additionalUserInfo': userCredential['additionalUserInfo']
            }));
        return firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
            app, component, authResult);
      },
      function(error) {
        // Ignore error if cancelled by the client.
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        switch (error['code']) {
          case 'auth/email-already-in-use':
            // Do nothing when anonymous user is getting updated.
            // Developer should handle this in signInFailure callback.
            break;
          case 'auth/email-exists':
            showInvalidEmail(error);
            break;
          case 'auth/too-many-requests':
          case 'auth/wrong-password':
            showInvalidPassword(error);
            break;
          default:
            firebaseui.auth.log.error('verifyPassword: ' + error['message']);
            showInfoBarWithError(error);
            break;
        }
      }
  ));
};


/**
 * Displays an unrecoverable error message.
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {!string} errorMessage The detailed error message to be displayed.
 */
firebaseui.auth.widget.handler.common.handleUnrecoverableError = function(
    app, container, errorMessage) {
  // Render the UI.
  var component = new firebaseui.auth.ui.page.UnrecoverableError(errorMessage);
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


/**
 * Helper function to check if a FirebaseUI instance only supports password
 * providers.
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @return {boolean} Whether only password providers are supported by the app's
 *     current configuration.
 */
firebaseui.auth.widget.handler.common.isPasswordProviderOnly = function(app) {
  var providers = app.getConfig().getProviders();
  return providers.length == 1 &&
      providers[0] == firebase.auth.EmailAuthProvider.PROVIDER_ID;
};


/**
 * Helper function to check if a FirebaseUI instance only supports phone
 * providers.
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @return {boolean} Whether only phone providers are supported by the app's
 *     current configuration.
 */
firebaseui.auth.widget.handler.common.isPhoneProviderOnly = function(app) {
  var providers = app.getConfig().getProviders();
  return providers.length == 1 &&
      providers[0] == firebase.auth.PhoneAuthProvider.PROVIDER_ID;
};


/**
 * Calls the appropriate sign-in start handler depending on display mode.
 *
 * @param {?firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {?Element} container The container DOM element.
 * @param {string=} email The optional email to prefill.
 * @param {string=} infoBarMessage The optional message to show on info bar.
 */
firebaseui.auth.widget.handler.common.handleSignInStart = function(
    app, container, email = undefined, infoBarMessage = undefined) {
  if (firebaseui.auth.widget.handler.common.isPasswordProviderOnly(app)) {
    if (infoBarMessage) {
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.SIGN_IN,
          app,
          container,
          email,
          infoBarMessage);
    } else {
      // Email auth provider is the only option, trigger that flow immediately
      // instead of just showing a single sign-in with email button.
      firebaseui.auth.widget.handler.common.handleSignInWithEmail(
          app, container, email);
    }
  } else if (
      app && firebaseui.auth.widget.handler.common.isPhoneProviderOnly(app) &&
      !infoBarMessage) {
    // Avoid an infinite loop by only skipping to phone auth if there's no
    // error on phone auth rendering, eg recaptcha error when network down,
    // which would trigger an info bar message.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PHONE_SIGN_IN_START, app, container);
  } else if (app &&
      app.getConfig().federatedProviderShouldImmediatelyRedirect() &&
      !infoBarMessage) {
    // If there is an info bar message available, the 'nascar' screen cannot be
    // skipped since the message or error must be shown to the user.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.FEDERATED_REDIRECT,
        app,
        container,
        email);
  } else {
    // For all other cases, show the provider sign-in screen along with any
    // info bar messages that need to be shown to the user.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        container,
        infoBarMessage,
        email);
  }
};


/**
 * Starts the email first flow, when the user has provided her email.
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {firebaseui.auth.ui.page.Base} component The UI component.
 * @param {string} email The user's email
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.common.handleStartEmailFirstFlow =
    function(app, component, email, opt_infoBarMessage) {
  var container = component.getContainer();
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.getAuth().fetchSignInMethodsForEmail, app.getAuth())),
      [email],
      function(signInMethods) {
        signInMethods = /** @type {!Array<string>} */ (signInMethods);
        component.dispose();
        firebaseui.auth.widget.handler.common
            .handleSignInFetchSignInMethodsForEmail(
                app,
                container,
                signInMethods,
                email,
                undefined,
                opt_infoBarMessage);
      },
      function(error) {
        // The email provided could be an invalid one or some other error
        // could occur.
        var errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(
                error);
        component.showInfoBar(errorMessage);
      }
  ));
};


/**
 * Calls the appropriate handler on fetchSignInMethodsForEmail after sign-in.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {!Array<string>} signInMethods The list of sign in methods for the
 *     user's email.
 * @param {string} email The email to prefill.
 * @param {string=} opt_displayName The optional display name to prefill.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
 *     message of Term of Service and Privacy Policy.
 */
firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail =
    function(
        app,
        container,
        signInMethods,
        email,
        opt_displayName,
        opt_infoBarMessage,
        opt_displayFullTosPpMessage) {
  // Does the account exist?
  if (!signInMethods.length && app.getConfig().isEmailPasswordSignInAllowed()) {
    // Account does not exist and password sign-in method is enabled. Go to
    // password sign up and populate available fields.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PASSWORD_SIGN_UP,
        app,
        container,
        email,
        opt_displayName,
        undefined,
        opt_displayFullTosPpMessage);
  } else if (!signInMethods.length &&
             app.getConfig().isEmailLinkSignInAllowed()) {
    // Account does not exist and email link sign-in method is enabled. Send
    // email link to sign in.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.SEND_EMAIL_LINK_FOR_SIGN_IN,
        app,
        container,
        email,
        function() {
          // Clicking back button goes back to sign in page.
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.SIGN_IN,
              app,
              container);
        });
  } else if (goog.array.contains(signInMethods,
      firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD)) {
    // Existing Password account.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PASSWORD_SIGN_IN,
        app,
        container,
        email,
        opt_displayFullTosPpMessage);
  } else if ((signInMethods.length == 1) && (signInMethods[0] ===
      firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD)) {
    if (app.getConfig().isEmailLinkSignInAllowed()) {
      // Existing email link account.
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.SEND_EMAIL_LINK_FOR_SIGN_IN,
          app,
          container,
          email,
          function() {
            // Clicking back button goes back to sign in page.
            firebaseui.auth.widget.handler.handle(
                firebaseui.auth.widget.HandlerName.SIGN_IN,
                app,
                container);
          });
    } else {
      // Email link sign-in is the only option for this user but it is not
      // supported in the current app configuration.
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.UNSUPPORTED_PROVIDER,
          app,
          container,
          email);
    }
  } else {
    // Federated Account.
    // The account exists, and is a federated identity account.
    // We store the pending email in case the user tries to use an account with
    // a different email.
    var federatedSignInMethod =
        firebaseui.auth.idp.getFirstFederatedSignInMethod(
            signInMethods, app.getConfig().getProviders());
    if (federatedSignInMethod) {
      var pendingEmailCredential =
          new firebaseui.auth.PendingEmailCredential(email);
      firebaseui.auth.storage.setPendingEmailCredential(
          pendingEmailCredential, app.getAppId());
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.FEDERATED_SIGN_IN,
          app,
          container,
          email,
          federatedSignInMethod,
          opt_infoBarMessage);
    } else {
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.UNSUPPORTED_PROVIDER,
          app,
          container,
          email);
    }
  }

};


/**
 * Handles sending email link for either sign in or link. If pending
 * credential is passed, send email for link. Otherwise, send email for sign in.
 *
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.Base} component The current UI component.
 * @param {string} email The user's email.
 * @param {function()} onCancelClick Callback to invoke when the back button is
 *     clicked in email link sign in sent page.
 * @param {function(*)} onError Callback to invoke when error occurs while
 *     sending the sign in email link.
 * @param {?firebaseui.auth.PendingEmailCredential=} opt_pendingCredential The
 *     pending credential to link to a successfully signed in user.
 */
firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn = function(
    app, component, email, onCancelClick, onError, opt_pendingCredential) {
  var container = component.getContainer();
  var onSuccess = function() {
    component.dispose();
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.EMAIL_LINK_SIGN_IN_SENT,
        app,
        container,
        email,
        onCancelClick,
        opt_pendingCredential);
  };
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.sendSignInLinkToEmail, app)),
      [email, opt_pendingCredential],
      onSuccess,
      onError));
};


/**
 * Handle sign-in with email and password click.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string=} opt_email The email to prefill.
 */
firebaseui.auth.widget.handler.common.handleSignInWithEmail =
    function(app, container, opt_email) {
  // If not available, go to the sign-in screen and no UI
  // shown callback. If email is prefilled, skip the sign-in screen.
  if (opt_email) {
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PREFILLED_EMAIL_SIGN_IN,
        app,
        container,
        opt_email);
  } else {
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.SIGN_IN,
        app,
        container);
  }
};
