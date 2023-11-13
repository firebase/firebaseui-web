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

goog.module('firebaseui.auth.widget.dispatcher');
goog.module.declareLegacyNamespace();


const AuthUI = goog.forwardDeclare('firebaseui.auth.AuthUI');
const Config = goog.require('firebaseui.auth.widget.Config');
const HandlerName = goog.require('firebaseui.auth.widget.HandlerName');
const asserts = goog.require('goog.asserts');
const common = goog.require('firebaseui.auth.widget.handler.common');
const handler = goog.require('firebaseui.auth.widget.handler');
const storage = goog.require('firebaseui.auth.storage');
const strings = goog.require('firebaseui.auth.soy2.strings');
const util = goog.require('firebaseui.auth.util');
const utils = goog.require('goog.uri.utils');


/**
 * The object used to put the public functions on and then export it. All the
 * public functions have to be exported from this object so that we can use.
 * property replacer to mock the function. For example:
 * dispatcher.foo = function() {
 *   dispatcher.bar();
 * };
 * exports = dispatcher;
 * So that in other files, you can replace dispatcher.bar property.
 *
 * Otherwise, if we do:
 * foo = function() {
 *   bar();
 * };
 * exports = { foo, bar };
 * In other files, replacing bar() on exported object will not change the
 * reference to the bar() used in this file.
 *
 * @const {!Object}
 */
const dispatcher = {};

/**
 * The description of the error message raised when the widget element is not
 * found during initialization.
 * @const {string}
 */
const ELEMENT_NOT_FOUND = 'Could not find the ' +
    'FirebaseUI widget element on the page.';


/**
 * Gets the widget mode from the given URL. If no URL is provided, the one for
 * the current page is used.
 * @param {!AuthUI} app The FirebaseUI instance.
 * @param {?string=} opt_url The URL from which to extract the mode.
 * @return {?Config.WidgetMode} The widget mode.
 */
dispatcher.getMode = function(app, opt_url) {
  const url = opt_url || util.getCurrentUrl();
  const modeParam = app.getConfig().getQueryParameterForWidgetMode();
  const modeString = utils.getParamValue(url, modeParam) || '';
  // Normalize the mode.
  const WidgetMode = Config.WidgetMode;
  for (let k in WidgetMode) {
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
 * @param {!AuthUI} app The FirebaseUI instance.
 * @param {?string=} opt_url the URL from which to extract the redirect URL.
 * @return {?string} The current redirect URL if available in the URL.
 */
dispatcher.getRedirectUrl = function (app, opt_url) {
  const url = opt_url || util.getCurrentUrl();
  const queryParameterForSignInSuccessUrl =
      app.getConfig().getQueryParameterForSignInSuccessUrl();
  // Return the value of sign-in success URL from parsed url.
  const redirectUrl =
      utils.getParamValue(url, queryParameterForSignInSuccessUrl);
  return redirectUrl ? util.sanitizeUrl(redirectUrl) : null;
};

/**
 * Dispatches the operation to the corresponding handler.
 * @param {!AuthUI} app The FirebaseUI instance.
 * @param {string|!Element} e The container element or the query selector.
 */
dispatcher.dispatchOperation = function (app, e) {
  // Check that web storage is available otherwise issue an error and exit.
  // Some browsers like safari private mode disable web storage.
  if (storage.isAvailable()) {
    doDispatchOperation(app, e);
  } else {
    // Web storage not supported, display appropriate message.
    // Get container element.
    const container = util.getElement(
        e, ELEMENT_NOT_FOUND);
    // Show unrecoverable error message.
    common.handleUnrecoverableError(
        app,
        container,
        strings.errorNoWebStorage().toString());
  }
};

/**
 * Gets the URL param identified by name from the given URL. If no URL is
 * provided, the one for the current page is used.
 * @param {string} paramName The name of the URL param.
 * @param {?string=} url The URL from which to extract the app ID.
 * @return {string} The param value.
 */
function getRequiredUrlParam(paramName, url = undefined) {
  return asserts.assertString(utils.getParamValue(
      url || util.getCurrentUrl(), paramName));
}

/**
 * Gets the action code from the given URL. If no URL is provided, the one for
 * the current page is used.
 * @param {?string=} url The URL from which to extract the app ID.
 * @return {string} The action code.
 */
function getActionCode(url = undefined) {
  return getRequiredUrlParam('oobCode',
      url);
}

/**
 * Gets the action code continue callback from the given URL. If no URL is
 * provided, no continue button is shown. This gives the user the ability to
 * go back to the application. This could open an FDL link which redirects to a
 * mobile app or to a web page. If no continue URL is available, no button is
 * shown.
 * @param {?string=} url The URL from which to extract the continue URL.
 * @return {?function()} The continue callback that will redirect the page back
 *     to the app. If none available, null is returned.
 */
function getContinueCallback(url = undefined) {
  const continueUrl = utils.getParamValue(
       url || util.getCurrentUrl(), 'continueUrl');
  // If continue URL detected, return a callback URL to redirect to it.
  if (continueUrl) {
    return () => {
      util.goTo(/** @type {string} */ (continueUrl));
    };
  }
  return null;
}

/**
 * Gets the provider ID from the given URL. If no URL is provided, the one for
 * the current page is used.
 * @param {?string=} url The URL from which to extract the app ID.
 * @return {string} The provider ID.
 */
function getProviderId(url = undefined) {
  return getRequiredUrlParam('providerId',
      url);
}

/**
 * @param {!AuthUI} app The FirebaseUI instance.
 * @param {string|!Element} e The container element or the query selector.
 */
function doDispatchOperation(app, e) {
  const container = util.getElement(
        e, ELEMENT_NOT_FOUND);
  // TODO: refactor dispatcher to simplify and move logic externally.
  const redirectUrl = dispatcher.getRedirectUrl(app);
  switch (dispatcher.getMode(app)) {
    case Config.WidgetMode.CALLBACK:
      // If redirect URL available, save in non persistent storage.
      // Developer could directly go to
      // http://www.widgetpage.com/?signInSuccessUrl=http%3A%2F%2Fwww.google.com
      // On success this should redirect to google.com the same as when
      // mode=select is passed in query parameters.
      if (redirectUrl) {
        storage.setRedirectUrl(redirectUrl, app.getAppId());
      }
      // Avoid UI flicker if there is no pending redirect.
      if (app.isPendingRedirect()) {
        handler.handle(
            HandlerName.CALLBACK, app, container);
      } else {
        // No pending redirect. Skip callback screen.
        common.handleSignInStart(
            app,
            container,
            // Pass sign-in email hint if available.
            app.getSignInEmailHint());
      }
      break;

    case Config.WidgetMode.RESET_PASSWORD:
      handler.handle(
          HandlerName.PASSWORD_RESET,
          app,
          container,
          getActionCode(),
          // Check if continue URL is available. if so, display a button to
          // redirect to it.
          getContinueCallback());
      break;

    case Config.WidgetMode.RECOVER_EMAIL:
      handler.handle(
          HandlerName.EMAIL_CHANGE_REVOCATION,
          app,
          container,
          getActionCode());
      break;

    case Config.WidgetMode.REVERT_SECOND_FACTOR_ADDITION:
      handler.handle(
          HandlerName.REVERT_SECOND_FACTOR_ADDITION,
          app,
          container,
          getActionCode());
      break;

    case Config.WidgetMode.VERIFY_EMAIL:
      handler.handle(
          HandlerName.EMAIL_VERIFICATION,
          app,
          container,
          getActionCode(),
          // Check if continue URL is available. if so, display a button to
          // redirect to it.
          getContinueCallback());
      break;

    case Config.WidgetMode.VERIFY_AND_CHANGE_EMAIL:
      handler.handle(
          HandlerName.VERIFY_AND_CHANGE_EMAIL,
          app,
          container,
          getActionCode(),
          // Check if continue URL is available. if so, display a button to
          // redirect to it.
          getContinueCallback());
      break;

    case Config.WidgetMode.SIGN_IN:
      // Complete signin.
      handler.handle(
          HandlerName.EMAIL_LINK_SIGN_IN_CALLBACK,
          app,
          container,
          util.getCurrentUrl());
      // Clear URL from email sign-in related query parameters to avoid
      // re-running on reload.
      app.clearEmailSignInState();
      break;

    case Config.WidgetMode.SELECT:
      // If redirect URL available, save in non-persistent storage.
      if (redirectUrl) {
        storage.setRedirectUrl(redirectUrl, app.getAppId());
      }
      // Renders provider sign-in or simulates sign in with email click in the
      // beginning sign-in page.
      common.handleSignInStart(app, container);
      break;

    default:
      // firebaseui.auth.widget.dispatcher.getMode() guaranteed to return a
      // valid mode. Reaching here means we have an unhandled operation.
      throw new Error('Unhandled widget operation.');
  }
  // By default, UI is shown so invoke the uiShown callback.
  const uiShownCallback = app.getConfig().getUiShownCallback();
  if (uiShownCallback) {
    uiShownCallback();
  }
}

exports = dispatcher;
