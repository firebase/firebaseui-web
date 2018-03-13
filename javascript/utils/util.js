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
 * @fileoverview Common utilities.
 */

goog.provide('firebaseui.auth.util');

goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.html.SafeUrl');
goog.require('goog.userAgent');
goog.require('goog.window');


/**
 * Navigates the current page to the given URL.
 * It simply wraps the window.location.assign and is meant for testing since
 * some browsers don't allow overwriting of the native object.
 *
 * @param {string} url The target URL.
 * @param {?Window=} opt_win Optional window whose location is to be reassigned.
 */
firebaseui.auth.util.goTo = function(url, opt_win) {
  var win = opt_win || window;
  // Sanitize URL before redirect.
  win.location.assign(firebaseui.auth.util.sanitizeUrl(url));
};


/**
 * @param {string} url The plain unsafe URL.
 * @return {string} The sanitized safe version of the provided URL.
 */
firebaseui.auth.util.sanitizeUrl = function(url) {
  return goog.html.SafeUrl.unwrap(goog.html.SafeUrl.sanitize(url));
};


/** @return {?string} The current URL scheme. */
firebaseui.auth.util.getScheme = function() {
  return window.location && window.location.protocol;
};


/** @return {boolean} Whether current scheme is HTTP or HTTPS. */
firebaseui.auth.util.isHttpOrHttps = function() {
  return firebaseui.auth.util.getScheme() === 'http:' ||
      firebaseui.auth.util.getScheme() === 'https:';
};


/**
 * Navigates to the previous page.
 * It simply wraps the window.history.back and is meant for testing since
 * some browsers don't allow to overwrite the native object.
 */
firebaseui.auth.util.goBack = function() {
  window.history.back();
};


/**
  * Navigates the opener page (parent window) to the given URL.
  * It simply wraps the window.opener.location.assign and is meant for testing
  * since some browsers don't allow to overwrite the native object.
  *
  * @param {string} url The target URL.
  * @param {?Window=} opt_win Optional window whose parent's location is to
  *     be reassigned.
  */
firebaseui.auth.util.openerGoTo = function(url, opt_win) {
  var win = opt_win || window;
  // Sanitize URL before redirect.
  win.opener.location.assign(firebaseui.auth.util.sanitizeUrl(url));
};


/**
 * Detects whether there is an opener (parent) window whose location is
 * reassignable.
 *
 * @return {boolean} The opener window.
 */
firebaseui.auth.util.hasOpener = function() {
  // TODO: consider completely removing this ability and just always redirecting
  // the current page.
  try {
    // Some browsers do not allow reassignment of the location of the opener if
    // the url is a different origin than the current one. Confirm hostname and
    // protocol match between current page and opener.
    return !!(window.opener &&
        window.opener.location &&
        window.opener.location.assign &&
        window.opener.location.hostname === window.location.hostname &&
        window.opener.location.protocol === window.location.protocol);
  } catch (e) {}
  return false;
};


/**
 * Detects mobile browser.
 *
 * @return {boolean} True if the browser is on mobile.
 */
firebaseui.auth.util.isMobileBrowser = function() {
  return goog.userAgent.MOBILE;
};


/**
 * Detects CORS support.
 *
 * @return {boolean} True if the browser supports CORS.
 */
firebaseui.auth.util.supportsCors = function() {
  // Among all supported browsers, onluy IE8 and IE9 don't support CORS.
  return !goog.userAgent.IE || // Not IE.
      !goog.userAgent.DOCUMENT_MODE || // No document mode == IE Edge
      goog.userAgent.DOCUMENT_MODE > 9;
};


/**
 * The default timeout for browser redirecting in mobile flow.
 *
 * @const {number}
 * @private
 */
firebaseui.auth.util.BROWSER_REDIRECT_TIMEOUT_ = 500;


/**
 * Closes a window.
 * @param {Window} window The window to close.
 */
firebaseui.auth.util.close = function(window) {
  window.close();
};


/**
 * Opens a popup window.
 * @param {string=} opt_url initial URL of the popup window
 * @param {string=} opt_name title of the popup
 * @param {number=} opt_width width of the popup
 * @param {number=} opt_height height of the popup
 */
firebaseui.auth.util.popup =
    function(opt_url, opt_name, opt_width, opt_height) {
  var width = opt_width || 500;
  var height = opt_height || 600;
  var top = (window.screen.availHeight - height) / 2;
  var left = (window.screen.availWidth - width) / 2;
  var options = {
    'width': width,
    'height': height,
    'top': top > 0 ? top : 0,
    'left': left > 0 ? left : 0,
    'location': true,
    'resizable': true,
    'statusbar': true,
    'toolbar': false
  };
  if (opt_name) {
    options['target'] = opt_name;
  }
  goog.window.popup(opt_url || 'about:blank', options);
};


/**
 * Gets the element in the current document by the query selector.
 * If an Element is passed in, it is returned.
 * An `Error` is thrown if the element can not be found.
 *
 * @param {string|Element} element The element or the query selector.
 * @param {string=} opt_notFoundDesc Error description when element not
 *     found.
 * @return {Element} The HTML element.
 */
firebaseui.auth.util.getElement = function(element, opt_notFoundDesc) {
  element = goog.dom.isElement(element) ?
      element : document.querySelector(String(element));
  if (element == null) {
    // If more detailed description provided it, use it instead of default
    // description.
    var notFoundDesc = opt_notFoundDesc || 'Cannot find element.';
    throw new Error(notFoundDesc);
  }
  return /** @type {Element} */ (element);
};


/**
 * @return {string} The current location URL.
 */
firebaseui.auth.util.getCurrentUrl = function() {
  return window.location.href;
};


/**
 * @return {string} The country code in canonical Unicode format.
 */
firebaseui.auth.util.getUnicodeLocale = function() {
  return goog.LOCALE.replace(/_/g, '-');
};


/**
 * @return {!goog.Promise<void>} A promise that resolves when DOM is ready.
 */
firebaseui.auth.util.onDomReady = function() {
  var resolver = null;
  return new goog.Promise(function(resolve, reject) {
    var doc = goog.global.document;
    // If document already loaded, resolve immediately.
    if (doc.readyState == 'complete') {
      resolve();
    } else {
      // Document not ready, wait for load before resolving.
      // Save resolver, so we can remove listener in case it was externally
      // cancelled.
      resolver = function() {
        resolve();
      };
      goog.events.listenOnce(window, goog.events.EventType.LOAD, resolver);
    }
  }).thenCatch(function(error) {
    // In case this promise was cancelled, make sure it unlistens to load.
    goog.events.unlisten(window, goog.events.EventType.LOAD, resolver);
    throw error;
  });
};
