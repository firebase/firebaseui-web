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
 * @fileoverview Dispatches FirebaseUI widget operation to the correct handler.
 */

goog.provide('firebaseui.auth.widget.dispatcher');

goog.require('firebaseui.auth.acClient');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('goog.asserts');
goog.require('goog.uri.utils');

goog.forwardDeclare('firebaseui.auth.AuthUI');


/**
 * The description of the error message raised when the widget element is not
 * found during initialization.
 * @const {string}
 * @private
 */
firebaseui.auth.widget.dispatcher.ELEMENT_NOT_FOUND_ = 'Could not find the ' +
    'FirebaseUI widget element on the page.';


/**
 * Gets the widget mode from the given URL. If no URL is provided, the one for
 * the current page is used.
 *
 * @param {!firebaseui.auth.AuthUI} app The FirebaseUI instance.
 * @param {?string=} opt_url The URL from which to extract the mode.
 * @return {?firebaseui.auth.widget.Config.WidgetMode} The widget mode.
 */
firebaseui.auth.widget.dispatcher.getMode = function(app, opt_url) {
  var url = opt_url || firebaseui.auth.util.getCurrentUrl();
  var modeParam = app.getConfig().getQueryParameterForWidgetMode();
  var modeString = goog.uri.utils.getParamValue(url, modeParam) || '';
  // Normalize the mode.
  var WidgetMode = firebaseui.auth.widget.Config.WidgetMode;
  for (var k in WidgetMode) {
    if (WidgetMode[k].toLowerCase() == modeString.toLowerCase()) {
      return WidgetMode[k];
    }
  }
  // If mode is missing or unrecognized, fallback to CALLBACK mode.
  return WidgetMode.CALLBACK;
};


/**
 * Gets the redirect URL from the given URL. If no URL is provided, the one for
 * the current page is used.
 *
 * @param {!firebaseui.auth.AuthUI} app The FirebaseUI instance.
 * @param {?string=} opt_url the URL from which to extract the redirect URL.
 * @return {?string} The current redirect URL if available in the URL.
 */
firebaseui.auth.widget.dispatcher.getRedirectUrl = function(app, opt_url) {
  var url = opt_url || firebaseui.auth.util.getCurrentUrl();
  var queryParameterForSignInSuccessUrl =
      app.getConfig().getQueryParameterForSignInSuccessUrl();
  // Return the value of sign-in success URL from parsed url.
  var redirectUrl =
      goog.uri.utils.getParamValue(url, queryParameterForSignInSuccessUrl);
  return redirectUrl ? firebaseui.auth.util.sanitizeUrl(redirectUrl) : null;
};


/**
 * Gets the URL param identified by name from the given URL. If no URL is
 * provided, the one for the current page is used.
 *
 * @param {string} paramName The name of the URL param.
 * @param {?string=} opt_url The URL from which to extract the app ID.
 * @return {string} The param value.
 * @private
 */
firebaseui.auth.widget.dispatcher.getRequiredUrlParam_ = function(paramName,
    opt_url) {
  return goog.asserts.assertString(goog.uri.utils.getParamValue(
      opt_url || firebaseui.auth.util.getCurrentUrl(), paramName));
};


/**
 * Gets the action code from the given URL. If no URL is provided, the one for
 * the current page is used.
 *
 * @param {?string=} opt_url The URL from which to extract the app ID.
 * @return {string} The action code.
 * @private
 */
firebaseui.auth.widget.dispatcher.getActionCode_ = function(opt_url) {
  return firebaseui.auth.widget.dispatcher.getRequiredUrlParam_('oobCode',
      opt_url);
};


/**
 * Gets the action code continue callback from the given URL. If no URL is
 * provided, no continue button is shown. This gives the user the ability to
 * go back to the application. This could open an FDL link which redirects to a
 * mobile app or to a web page. If no continue URL is available, no button is
 * shown.
 *
 * @param {?string=} opt_url The URL from which to extract the continue URL.
 * @return {?function()} The continue callback that will redirect the page back
 *     to the app. If none available, null is returned.
 * @private
 */
firebaseui.auth.widget.dispatcher.getContinueCallback_ = function(opt_url) {
  var continueUrl = goog.uri.utils.getParamValue(
       opt_url || firebaseui.auth.util.getCurrentUrl(), 'continueUrl');
  // If continue URL detected, return a callback URL to redirect to it.
  if (continueUrl) {
    return function() {
      firebaseui.auth.util.goTo(/** @type {string} */ (continueUrl));
    };
  }
  return null;
};


/**
 * Gets the provider ID from the given URL. If no URL is provided, the one for
 * the current page is used.
 *
 * @param {?string=} opt_url The URL from which to extract the app ID.
 * @return {string} The provider ID.
 * @private
 */
firebaseui.auth.widget.dispatcher.getProviderId_ = function(opt_url) {
  return firebaseui.auth.widget.dispatcher.getRequiredUrlParam_('providerId',
      opt_url);
};


/**
 * Dispatches the operation to the corresponding handler.
 *
 * @param {!firebaseui.auth.AuthUI} app The FirebaseUI instance.
 * @param {string|!Element} e The container element or the query selector.
 */
firebaseui.auth.widget.dispatcher.dispatchOperation = function(app, e) {
  // Check that web storage is available otherwise issue an error and exit.
  // Some browsers like safari private mode disable web storage.
  if (firebaseui.auth.storage.isAvailable()) {
    firebaseui.auth.widget.dispatcher.doDispatchOperation_(app, e);
  } else {
    // Web storage not supported, display appropriate message.
    // Get container element.
    var container = firebaseui.auth.util.getElement(
        e, firebaseui.auth.widget.dispatcher.ELEMENT_NOT_FOUND_);
    // Show unrecoverable error message.
    firebaseui.auth.widget.handler.common.handleUnrecoverableError(
        app,
        container,
        firebaseui.auth.soy2.strings.errorNoWebStorage().toString());
  }
};


/**
 * @param {!firebaseui.auth.AuthUI} app The FirebaseUI instance.
 * @param {string|!Element} e The container element or the query selector.
 * @private
 */
firebaseui.auth.widget.dispatcher.doDispatchOperation_ = function(app, e) {
  var container = firebaseui.auth.util.getElement(
        e, firebaseui.auth.widget.dispatcher.ELEMENT_NOT_FOUND_);

  // TODO: refactor dispatcher to simplify and move logic externally.
  switch (firebaseui.auth.widget.dispatcher.getMode(app)) {
    case firebaseui.auth.widget.Config.WidgetMode.CALLBACK:
      // If redirect URL available, save in non persistent storage.
      // Developer could directly go to
      // http://www.widgetpage.com/?signInSuccessUrl=http%3A%2F%2Fwww.google.com
      // On success this should redirect to google.com the same as when
      // mode=select is passed in query parameters.
      var redirectUrl = firebaseui.auth.widget.dispatcher.getRedirectUrl(app);
      if (redirectUrl) {
        firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
      }
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.CALLBACK, app, container);
      break;

    case firebaseui.auth.widget.Config.WidgetMode.RESET_PASSWORD:
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.PASSWORD_RESET,
          app,
          container,
          firebaseui.auth.widget.dispatcher.getActionCode_(),
          // Check if continue URL is available. if so, display a button to
          // redirect to it.
          firebaseui.auth.widget.dispatcher.getContinueCallback_());
      break;

    case firebaseui.auth.widget.Config.WidgetMode.RECOVER_EMAIL:
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.EMAIL_CHANGE_REVOCATION,
          app,
          container,
          firebaseui.auth.widget.dispatcher.getActionCode_());
      break;

    case firebaseui.auth.widget.Config.WidgetMode.VERIFY_EMAIL:
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.EMAIL_VERIFICATION,
          app,
          container,
          firebaseui.auth.widget.dispatcher.getActionCode_(),
          // Check if continue URL is available. if so, display a button to
          // redirect to it.
          firebaseui.auth.widget.dispatcher.getContinueCallback_());
      break;

    case firebaseui.auth.widget.Config.WidgetMode.SELECT:
      // If redirect URL available, save in non-persistent storage.
      var redirectUrl = firebaseui.auth.widget.dispatcher.getRedirectUrl(app);
      if (redirectUrl) {
        firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
      }

      if (firebaseui.auth.acClient.isInitialized()) {
        // Renders provider sign-in or simulates sign in with email click.
        firebaseui.auth.widget.handler.common.handleSignInStart(
            app,
            container);
        break;
      } else {
        // Even if accountchooser.com is unavailable as a credential helper,
        // force UI shown callback since this is the first page to display. If
        // empty, render callback handler and do not try to select an account.
        firebaseui.auth.widget.handler.common.loadAccountchooserJs(
          app,
          function() {
            firebaseui.auth.widget.handler.common.selectFromAccountChooser(
                app.getAuthUiGetter(),
                container,
                true);
          },
          // Force UI shown callback to trigger since this is the first UI to be
          // displayed on the page.
          true);
        // uiShown Callback is handled by selectFromAccountChooser.
        return;
      }

    default:
      // firebaseui.auth.widget.dispatcher.getMode() guaranteed to return a
      // valid mode. Reaching here means we have an unhandled operation.
      throw new Error('Unhandled widget operation.');
  }
  // By default, UI is shown so invoke the uiShown callback.
  var uiShownCallback = app.getConfig().getUiShownCallback();
  if (uiShownCallback) {
    uiShownCallback();
  }
};
