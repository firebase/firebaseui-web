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

goog.provide('firebaseui.auth.OAuthResponse');
goog.provide('firebaseui.auth.widget.handler.common');

goog.require('firebaseui.auth.Account');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.acClient');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.sni');
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
goog.require('goog.net.jsloader');

goog.forwardDeclare('firebaseui.auth.AuthUI');


/**
 * @typedef {{
 *   oauthAccessToken: (null|string|undefined),
 *   oauthExpireIn: (null|number|undefined),
 *   oauthAuthorizationCode: (null|string|undefined)
 * }}
 */
firebaseui.auth.OAuthResponse;


/**
 * @define {string} The accountchooser.com client library URL.
 */
var ACCOUNTCHOOSER_SRC = '//www.gstatic.com/accountchooser/client.js';


/**
 * @private {boolean} Whether uiShown callback should be triggered on callback
 *     in accountchooser.com select or add account regardless of
 *     accountchooser.com availability.
 */
firebaseui.auth.widget.handler.common.acForceUiShown_ = false;


/**
 * @private {?goog.Promise} The promise that resolves when accountchooser.com
 *     client is loaded.
 */
firebaseui.auth.widget.handler.common.acLoader_ = null;


/**
 * Loads the accountchooser.com client library if it is not loaded before and
 * the user agent supports SNI.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {function()} callback The callback to invoke once it's loaded.
 * @param {boolean=} opt_forceUiShownCallback Whether to force uiShown callback
 *     when accountchooser.com is unavailable.
 */
firebaseui.auth.widget.handler.common.loadAccountchooserJs = function(
    app,
    callback,
    opt_forceUiShownCallback) {
  firebaseui.auth.widget.handler.common.acForceUiShown_ =
      !!opt_forceUiShownCallback;
  // Load accountchooser.com client once and make sure callback waits until
  // client is loaded.
  if (!firebaseui.auth.widget.handler.common.acLoader_) {
    if (typeof accountchooser == 'undefined' &&
        firebaseui.auth.sni.isSupported()) {
      // Not yet loaded but supported.
      firebaseui.auth.widget.handler.common.acLoader_ = goog.Promise.resolve(
          goog.net.jsloader.load(ACCOUNTCHOOSER_SRC)).thenCatch(function() {});
    } else {
      // Either not supported by the browser or externally loaded.
      firebaseui.auth.widget.handler.common.acLoader_ = goog.Promise.resolve();
    }
  }
  // On ready, run callback.
  firebaseui.auth.widget.handler.common.acLoader_.then(callback, callback);
};


/**
 * Checks if an accountchooser.com invoked callback is available. If so, run it
 * and passed a reference to the continue function, otherwise run the
 * continue function directly.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {function()} continueCallback The continue function to run after
 *     invoking the accountchooser.com invoked callback.
 */
firebaseui.auth.widget.handler.common.accountChooserInvoked = function(
    app, continueCallback) {
  // Get accountchooser.com invoked callback.
  var acInvokedCallback = app.getConfig().getAccountChooserInvokedCallback();
  if (acInvokedCallback) {
    // If accountchooser.com invoked callback provided, call it while passing
    // continue function to it.
    acInvokedCallback(continueCallback);
  } else {
    // No accountchooser.com invoked callback provided, continue callback.
    continueCallback();
  }
};


/**
 * Checks if an accountchooser.com result callback is available. If so, run it
 * while passing the result code to it.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {firebaseui.auth.widget.Config.AccountChooserResult} result The
 *     accountchooser.com result code.
 * @param {function()} continueCallback The continue callback.
 */
firebaseui.auth.widget.handler.common.accountChooserResult = function(
    app, result, continueCallback) {
  // Get accountchooser.com result callback.
  var acResultCallback = app.getConfig().getAccountChooserResultCallback();
  // If available, call it and pass the result code to it.
  if (acResultCallback) {
    acResultCallback(result, continueCallback);
  } else {
    // No accountchooser.com result callback is provided, continue callback if
    // provided.
    continueCallback();
  }
};


/**
 * The callback to run when there is no pending accountchooser.com response.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element for the handler.
 * @param {function()} uiShownCallback The uiShown callback URL to run when UI
 *     is shown.
 * @param {boolean=} opt_disableSelectOnEmpty Whether to disable selecting an
 *     account when there are no pending results.
 * @param {string=} opt_callbackUrl The URL to return to when the flow finishes.
 *     The default is current URL.
 * @private
 */
firebaseui.auth.widget.handler.common.handleAcEmptyResponse_ = function(
    app,
    container,
    uiShownCallback,
    opt_disableSelectOnEmpty,
    opt_callbackUrl) {
  if (!!opt_disableSelectOnEmpty) {
    // No pending accountchooser.com response, provider sign-in or callback
    // handler should be rendered.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.CALLBACK, app, container);
    // UI shown callback should be triggered.
    if (firebaseui.auth.widget.handler.common.acForceUiShown_) {
      uiShownCallback();
    }
  } else {
    // If there is no pending accountchooser.com response and provider sign in
    // is not to be rendered, try to select account from accountchooser.com.
    // Do not redirect to accountchooser.com directly, instead package routine
    // in continue callback function to be passed to accountchooser.com invoked
    // handler.
    var continueCallback = function() {
      firebaseui.auth.acClient.trySelectAccount(
          function(isAvailable) {
            // On empty response, post accountchooser.com result (either empty
            // or unavailable).
            firebaseui.auth.widget.handler.common.accountChooserResult(
                app,
                isAvailable ?
                   firebaseui.auth.widget.Config.AccountChooserResult.EMPTY :
                   firebaseui.auth.widget.Config.AccountChooserResult
                   .UNAVAILABLE,
                function() {
                  firebaseui.auth.widget.handler.handle(
                      firebaseui.auth.widget.HandlerName.SIGN_IN, app,
                      container);
                  // If accountchooser.com is available or uiShown callback is
                  // forced, run uiShown callback.
                  if (isAvailable ||
                      firebaseui.auth.widget.handler.common.acForceUiShown_) {
                    uiShownCallback();
                  }
                });
          },
          firebaseui.auth.storage.getRememberedAccounts(app.getAppId()),
          opt_callbackUrl);
    };
    // Handle accountchooser.com invoked callback, pass continue callback for
    // selected account on accountchooser.com.
    firebaseui.auth.widget.handler.common.accountChooserInvoked(app,
        continueCallback);
  }
};


/**
 * The callback to run when there is no pending accountchooser.com response.
 *
 * @param {firebaseui.auth.Account} account The account selected in
 *     accountchooser.com.
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element for the handler.
 * @param {function()} uiShownCallback The uiShown callback URL to run when UI
 *     is shown.
 * @private
 */
firebaseui.auth.widget.handler.common.handleAcAccountSelectedResponse_ =
    function(account, app, container, uiShownCallback) {
  var errorHandler = function(error) {
    var errorMessage = firebaseui.auth.widget.handler.common.getErrorMessage(
        error);
    // Depending on display mode, render relevant start page.
    firebaseui.auth.widget.handler.common.handleSignInStart(
        app,
        container,
        undefined,
        errorMessage);
    uiShownCallback();
  };
  var continueCallback = function() {
    // If user selects an account from accountchooser.com, we shouldn't remember
    // it locally. Otherwise, it will be out of sync if the user deletes it from
    // accountchooser.com.
    firebaseui.auth.storage.setRememberAccount(false, app.getAppId());
    app.registerPending(app.getAuth().fetchProvidersForEmail(account.getEmail())
        .then(function(providers) {
          firebaseui.auth.widget.handler.common
              .handleSignInFetchProvidersForEmail(
              app,
              container,
              providers,
              account.getEmail(),
              account.getDisplayName() || undefined);
          uiShownCallback();
        }, errorHandler));
  };
  // Pass continue function to accountchooser.com result handler.
  // Post accountchooser.com result: account selected.
  firebaseui.auth.widget.handler.common.accountChooserResult(
      app,
      firebaseui.auth.widget.Config.AccountChooserResult.ACCOUNT_SELECTED,
      continueCallback);
};


/**
 * The callback to run when add account is selected in accountchooser.com
 * response.
 *
 * @param {boolean} isAvailable Whether accountchooser.com is available.
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element for the handler.
 * @param {function()} uiShownCallback The uiShown callback URL to run when UI
 *     is shown.
 * @private
 */
firebaseui.auth.widget.handler.common.handleAcAddAccountResponse_ =
    function(isAvailable, app, container, uiShownCallback) {
  var continueCallback = function() {
    // This could be triggered even when accountchooser.com is unavailable.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.SIGN_IN, app, container);
    if (isAvailable || firebaseui.auth.widget.handler.common.acForceUiShown_) {
      uiShownCallback();
    }
  };
  // Post accountchooser.com result: new account added or unavailable.
  firebaseui.auth.widget.handler.common.accountChooserResult(
      app,
      isAvailable ?
        firebaseui.auth.widget.Config.AccountChooserResult.ADD_ACCOUNT :
        firebaseui.auth.widget.Config.AccountChooserResult.UNAVAILABLE,
      continueCallback);
};


/**
 * Selects account from accountchooser.
 *
 * @param {function():?firebaseui.auth.AuthUI} getApp The current FirebaseUI
 *     instance getter whose configuration is used.
 * @param {Element} container The container DOM element for the handler.
 * @param {boolean=} opt_disableSelectOnEmpty Whether to disable selecting an
 *     account when there are no pending results.
 * @param {string=} opt_callbackUrl The URL to return to when the flow finishes.
 *     The default is current URL.
 */
firebaseui.auth.widget.handler.common.selectFromAccountChooser = function(
    getApp,
    container,
    opt_disableSelectOnEmpty,
    opt_callbackUrl) {
  var uiShownCallback = function() {
    var app = getApp();
    if (!app) {
      return;
    }
    var callback = app.getConfig().getUiShownCallback();
    if (callback) {
      callback();
    }
  };
  firebaseui.auth.acClient.init(
      function() {
        var app = getApp();
        if (!app) {
          return;
        }
        firebaseui.auth.widget.handler.common.handleAcEmptyResponse_(
            app,
            container,
            uiShownCallback,
            opt_disableSelectOnEmpty,
            opt_callbackUrl);
      },
      // Handle the account returned from accountchooser.com.
      function(account) {
        var app = getApp();
        if (!app) {
          return;
        }
        firebaseui.auth.widget.handler.common.handleAcAccountSelectedResponse_(
            account, app, container, uiShownCallback);
      },
      // Handle adding an account.
      function(isAvailable) {
        var app = getApp();
        if (!app) {
          return;
        }
        firebaseui.auth.widget.handler.common.handleAcAddAccountResponse_(
            isAvailable, app, container, uiShownCallback);
      },
      // Don't pass the supported provider list to accountchooser.com since
      // Firebase doesn't need the provider meta info from accountchooser.
      undefined,
      goog.LOCALE,
      getApp() && getApp().getConfig().getAcUiConfig());
};


/**
 * Sets the user as signed in.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used and that has a user signed in.
 * @param {firebaseui.auth.ui.page.Base} component The UI component.
 * @param {?firebase.auth.AuthCredential} credential The auth credential
 *     object.
 * @param {?firebase.User=} opt_user The current temporary user, provided if
 *     the user was already signed out from the temporary auth instance.
 * @param {boolean=} opt_alreadySignedIn Whether user already signed in on
 *     external auth instance.
 * @package
 */
firebaseui.auth.widget.handler.common.setLoggedIn =
    function(app, component, credential, opt_user, opt_alreadySignedIn) {
  if (!!opt_alreadySignedIn) {
    // Already signed in on external auth instance.
    firebaseui.auth.widget.handler.common.setUserLoggedInExternal_(
        app,
        component,
        /** @type {!firebase.User} */ (app.getExternalAuth().currentUser),
        credential);
    return;
  }
  // This should not occur.
  if (!credential) {
    throw new Error('No credential found!');
  }
  var outputCred = credential;
  // If the passed credential is a password credential, do not return it to the
  // developer in signInSuccess callback.
  if (credential['providerId'] &&
      credential['providerId'] == 'password') {
    // Do not return password credential to developer.
    outputCred = null;
  }
  // For any error, display in info bar message.
  var onError = function(error) {
    // Ignore error if cancelled by the client.
    if (error['name'] && error['name'] == 'cancel') {
      return;
    }
    // Check if the error was due to an expired credential.
    // This may happen in the email mismatch case where the user waits more than
    // an hour and then proceeds to sign in with the expired credential.
    // Display the relevant error message in this case and return the user to
    // the sign-in start page.
    if (firebaseui.auth.widget.handler.common.isCredentialExpired(error)) {
      var container = component.getContainer();
      // DIspose any existing component.
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
        // Firebase auth error.
        errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(error);
      }
      // Show error message in the info bar.
      component.showInfoBar(errorMessage);
    }
  };
  // In some cases like email mismatch, the temporary user may be signed out.
  // In that case, get the current temporary user directly.
  var tempUser = app.getAuth().currentUser || opt_user;
  if (!tempUser) {
    // Shouldn't happen as we're only calling this method internally.
    throw new Error('User not logged in.');
  }
  // Sign out from internal auth instance before signing in to external
  // instance.
  app.registerPending(app.getAuth().signOut().then(function() {
    // Save before signing in to developer's auth instance to make sure account
    // is saved without risking interruption from onAuthStateChanged.
    var account = new firebaseui.auth.Account(
        tempUser['email'],
        tempUser['displayName'],
        tempUser['photoURL'],
        outputCred && outputCred['providerId']);

    // Remember account. If there is no user preference, remember account by
    // default.
    if (!firebaseui.auth.storage.hasRememberAccount(app.getAppId()) ||
        firebaseui.auth.storage.isRememberAccount(app.getAppId())) {
      firebaseui.auth.storage.rememberAccount(account, app.getAppId());
    }
    firebaseui.auth.storage.removeRememberAccount(app.getAppId());
    // After successful sign out from internal instance, sign in with credential
    // to the developer provided auth instance. Use the credential passed.
    app.registerPending(app.getExternalAuth().signInWithCredential(
        /** @type {!firebase.auth.AuthCredential} */ (credential))
        .then(function(user) {
          firebaseui.auth.widget.handler.common.setUserLoggedInExternal_(
              app, component, user, outputCred);
          // Catch error when signInSuccessUrl is required and not provided.
        }, onError).then(function() {}, onError));
  }, onError));
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
  if (provider && provider['addScope']) {
    // Add every requested additional scope to the provider.
    for (var i = 0; i < additionalScopes.length; i++) {
      provider['addScope'](additionalScopes[i]);
    }
  }
  // Get custom parameters for the selected provider.
  var customParameters =
      app.getConfig().getProviderCustomParameters(providerId);
  // If Google provider is requested and email is specified, pass OAuth
  // parameter login_hint with that email.
  // Only Google supports this parameter.
  if (providerId == firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
      // Only pass login_hint when email available.
      opt_email) {
    // In case no custom parameters are provided for google.com.
    customParameters = customParameters || {};
    // Add the login_hint.
    customParameters['login_hint'] = opt_email;
  }
  // Add custom OAuth parameters if applicable for the current provider.
  if (customParameters && provider && provider.setCustomParameters) {
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
    // TODO: align redirect and popup flow error handling for similar errors.
    // Ignore error if cancelled by the client.
    if (error['name'] && error['name'] == 'cancel') {
      return;
    }
    firebaseui.auth.log.error('signInWithRedirect: ' + error['code']);
    var errorMessage = firebaseui.auth.widget.handler.common.getErrorMessage(
        error);
    component.showInfoBar(errorMessage);
  };

  // Initialize the corresponding provider.
  var provider = firebaseui.auth.widget.handler.common.getAuthProvider_(
      app, providerId, opt_email);
  // Redirect processor.
  var processRedirect = function() {
    app.registerPending(component.executePromiseRequest(
        /** @type {function (): !goog.Promise} */ (
            goog.bind(app.getAuth().signInWithRedirect, app.getAuth())),
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
          return app.registerPending(app.getAuth().getRedirectResult()
              .then(function(result) {
                // Pass result in promise to callback handler.
                component.dispose();
                firebaseui.auth.widget.handler.handle(
                    firebaseui.auth.widget.HandlerName.CALLBACK,
                    app,
                    container,
                    goog.Promise.resolve(result));
              }, providerSigninFailedCallback));
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
    app.registerPending(app.getAuth().signInWithPopup(provider).then(
        function(result) {
          // Pass result in promise to callback handler.
          component.dispose();
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.CALLBACK,
              app,
              container,
              goog.Promise.resolve(result));
        },
        function(error) {
          // Ignore error if cancelled by the client.
          if (error['name'] && error['name'] == 'cancel') {
            return;
          }
          switch (error['code']) {
            case 'auth/popup-blocked':
              // Popup blocked, switch to redirect flow as fallback.
               processRedirect();
              break;
            case 'auth/popup-closed-by-user':
            case 'auth/cancelled-popup-request':
              // When popup is closed or when the user clicks another button,
              // do nothing.
              break;
            case 'auth/network-request-failed':
            case 'auth/too-many-requests':
            case 'auth/user-cancelled':
              // For no action errors like network error, just display in info
              // bar in current component. A second attempt could still work.
              component.showInfoBar(
                  firebaseui.auth.widget.handler.common.getErrorMessage(error));
              break;
            default:
              // Either linking required errors or errors that are
              // unrecoverable.
              component.dispose();
              firebaseui.auth.widget.handler.handle(
                  firebaseui.auth.widget.HandlerName.CALLBACK,
                  app,
                  container,
                  goog.Promise.reject(error));
              break;
          }
        }));
  }
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
          goog.bind(app.getAuth().signInWithEmailAndPassword, app.getAuth())),
      [email, password],
      function(user) {
        // Pass password credential to complete sign-in to the original auth
        // instance.
        firebaseui.auth.widget.handler.common.setLoggedIn(
            app, component, emailPassCred);
      },
      function(error) {
        // Ignore error if cancelled by the client.
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        switch (error['code']) {
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
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string=} opt_email The email to prefill.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.common.handleSignInStart = function(
    app, container, opt_email, opt_infoBarMessage) {
  if (firebaseui.auth.widget.handler.common.isPasswordProviderOnly(app)) {
    // If info bar message is available, do not go to accountchooser.com since
    // this is a result of some error in the flow and the error message must be
    // displayed.
    if (opt_infoBarMessage) {
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.SIGN_IN,
          app,
          container,
          opt_email,
          opt_infoBarMessage);
    } else {
      // Email auth provider is the only option, trigger that flow immediately
      // instead of just showing a single sign-in with email button.
      firebaseui.auth.widget.handler.common.handleSignInWithEmail(
          app, container, opt_email);
    }
  } else if (
      app && firebaseui.auth.widget.handler.common.isPhoneProviderOnly(app) &&
      !opt_infoBarMessage) {
    // Avoid an infinite loop by only skipping to phone auth if there's no
    // error on phone auth rendering, eg recaptcha error when network down,
    // which would trigger an info bar message.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PHONE_SIGN_IN_START, app, container);
  } else {
    // For all other cases, show the provider sign-in screen.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        container,
        opt_infoBarMessage);
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
          goog.bind(app.getAuth().fetchProvidersForEmail, app.getAuth())),
      [email],
      function(providers) {
        providers = /** @type {!Array<string>} */ (providers);
        firebaseui.auth.storage.setRememberAccount(
            app.getConfig().isAccountChooserEnabled(),
            app.getAppId());
        component.dispose();
        firebaseui.auth.widget.handler.common
            .handleSignInFetchProvidersForEmail(
                app,
                container,
                providers,
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
 * Calls the appropriate handler on fetchProviderForEmail after sign-in.
 *
 * @param {firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {!Array<string>} providers The list of providers for the user's email.
 * @param {string} email The email to prefill.
 * @param {string=} opt_displayName The optional display name to prefill.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.common.handleSignInFetchProvidersForEmail =
    function(
        app,
        container,
        providers,
        email,
        opt_displayName,
        opt_infoBarMessage) {
  // Does the account exist?
  if (!providers.length) {
    // Account does not exist, go to password sign up and populate
    // available fields.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PASSWORD_SIGN_UP,
        app,
        container,
        email,
        opt_displayName);
  } else if (goog.array.contains(
      providers, firebase.auth.EmailAuthProvider.PROVIDER_ID)) {
    // Password account.
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.PASSWORD_SIGN_IN,
        app,
        container,
        email);
  } else {
    // Federated Account.
    // The account exists, and is a federated identity account.
    // We store the pending email in case the user tries to use an account with
    // a different email.
    var pendingEmailCredential =
        new firebaseui.auth.PendingEmailCredential(email);
    firebaseui.auth.storage.setPendingEmailCredential(
        pendingEmailCredential, app.getAppId());
    firebaseui.auth.widget.handler.handle(
        firebaseui.auth.widget.HandlerName.FEDERATED_SIGN_IN,
        app,
        container,
        email,
        providers[0],
        opt_infoBarMessage);
  }
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
  // accountchooser.com not enabled, trigger accountChooserResult callback and
  // then go to the sign-in page.
  if (!app.getConfig().isAccountChooserEnabled()) {
    // No redirect, so uiShown should not be triggered.
    firebaseui.auth.widget.handler.common.acForceUiShown_ = false;
    var continueCallback = function() {
      firebaseui.auth.widget.handler.common.accountChooserResult(
          app,
          firebaseui.auth.widget.Config.AccountChooserResult.UNAVAILABLE,
          function() {
            // If not available, go to the sign-in screen and no UI
            // shown callback.
            firebaseui.auth.widget.handler.handle(
                firebaseui.auth.widget.HandlerName.SIGN_IN,
                app,
                container,
                opt_email);
          });
    };
    // Handle accountchooser.com invoked callback, pass continue callback
    // for selected account on accountchooser.com.
    firebaseui.auth.widget.handler.common.accountChooserInvoked(
        app, continueCallback);
  } else {
    // Sign in with email, try to select account from accountchooser.com.
    // Do not force uiShown callback if accountchooser.com unavailable since UI
    // shown callback is already triggered.
    firebaseui.auth.widget.handler.common.loadAccountchooserJs(
        app,
        function() {
          // accountchooser.com already intialized, select account, on empty,
          // render the sign-in page.
          // Add callback URL since in case there is an idp callback error and
          // provider sign-in is rendered. When the user clicks sign-in with
          // email, the widget select URL is cleared from any idp related URL
          // data. Otherwise, on return from accountchooser.com, the error would
          // show again instead of redirecting to the sign-in page.
          if (firebaseui.auth.acClient.isInitialized()) {
            // Do not redirect to accountchooser.com directly, instead package
            // routine in continue callback function to be passed to
            // accountchooser.com invoked handler.
            var continueCallback = function() {
              firebaseui.auth.acClient.trySelectAccount(
                  function(isAvailable) {
                    // On empty response, post accountchooser.com result (either
                    // empty or unavailable).
                    var AccountChooserResult =
                        firebaseui.auth.widget.Config.AccountChooserResult;
                    firebaseui.auth.widget.handler.common.accountChooserResult(
                        app,
                        isAvailable ?
                          AccountChooserResult.EMPTY :
                          AccountChooserResult.UNAVAILABLE,
                        function() {
                          // If not available, go to the sign-in screen and no
                          // UI shown callback.
                          firebaseui.auth.widget.handler.handle(
                              firebaseui.auth.widget.HandlerName.SIGN_IN,
                              app,
                              container,
                              opt_email);
                        });
                  },
                  firebaseui.auth.storage.getRememberedAccounts(app.getAppId()),
                  app.getConfig().getWidgetUrl(
                      firebaseui.auth.widget.Config.WidgetMode.SELECT));
            };
            // Handle accountchooser.com invoked callback, pass continue
            // callback for selected account on accountchooser.com.
            firebaseui.auth.widget.handler.common.accountChooserInvoked(
                app, continueCallback);
          } else {
            // If accountchooser.com client is not initialized, initialize it.
            // On empty response, try to select an account.
            // If accountchooser.com is available, this will trigger a UI shown
            // callback, otherwise no uiShown callback triggered (force UI
            // shown callback is set to false).
            firebaseui.auth.widget.handler.common.selectFromAccountChooser(
                app.getAuthUiGetter(),
                container,
                false,
                app.getConfig().getWidgetUrl(
                    firebaseui.auth.widget.Config.WidgetMode.SELECT));
          }
        }, false);
  }
};
