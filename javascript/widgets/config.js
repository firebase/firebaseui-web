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
 * @fileoverview Defines all configurations used by FirebaseUI widget.
 */

goog.provide('firebaseui.auth.CredentialHelper');
goog.provide('firebaseui.auth.callback.signInSuccess');
goog.provide('firebaseui.auth.widget.Config');

goog.require('firebaseui.auth.Config');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.util');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.uri.utils');



/**
 * Application configuration settings.
 * @constructor
 */
firebaseui.auth.widget.Config = function() {
  this.config_ = new firebaseui.auth.Config();
  // Define FirebaseUI widget configurations and convenient getters.
  this.config_.define('acUiConfig');
  this.config_.define('callbacks');
  /**
   * Determines which credential helper to use. Currently, only
   * accountchooser.com is available and it is set by default.
   */
  this.config_.define(
      'credentialHelper',
      firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM);
  this.config_.define('popupMode', false);
  /**
   * Determines the redirect URL query key.
   */
  this.config_.define('queryParameterForSignInSuccessUrl', 'signInSuccessUrl');
  this.config_.define('queryParameterForWidgetMode', 'mode');
  /**
   * Determines the sign-in flow, 'popup' or 'redirect'. The former will use
   * signInWithPopup where as the latter will use the default signInWithRedirect
   * when a federated sign-in is triggered.
   */
  this.config_.define('signInFlow');
  /**
   * Determines the list of IdPs for handling federated sign-in as well as
   * password account sign-up explicitly. The developer can also request
   * additional scopes.
   */
  this.config_.define('signInOptions');
  this.config_.define('signInSuccessUrl');
  this.config_.define('siteName');
  this.config_.define('tosUrl');
  this.config_.define('widgetUrl');
};


/**
 * The different credentials helper available, currently only
 * accountchooser.com.
 *
 * @enum {string}
 */
firebaseui.auth.CredentialHelper = {
  ACCOUNT_CHOOSER_COM: 'accountchooser.com',
  NONE: 'none'
};


/**
 * The configuration sign-in success callback.
 * @typedef {function(
 *     !firebase.User, ?firebase.auth.AuthCredential=, string=): boolean}
 */
firebaseui.auth.callback.signInSuccess;


/**
 * The accountchooser.com result codes.
 *
 * @enum {string}
 */
firebaseui.auth.widget.Config.AccountChooserResult = {
  EMPTY: 'empty',
  UNAVAILABLE: 'unavailable',
  ACCOUNT_SELECTED: 'accountSelected',
  ADD_ACCOUNT: 'addAccount'
};


/**
 * The type of sign-in flow.
 *
 * @enum {string}
 */
firebaseui.auth.widget.Config.SignInFlow = {
  POPUP: 'popup',
  REDIRECT: 'redirect'
};


/** @return {?Object} The UI configuration for accountchooser.com. */
firebaseui.auth.widget.Config.prototype.getAcUiConfig = function() {
  return /** @type {?Object} */ (this.config_.get('acUiConfig') || null);
};


/**
 * Enums for callback widget mode. Please alphabetize by names.
 * @enum {string}
 */
firebaseui.auth.widget.Config.WidgetMode = {
  CALLBACK: 'callback',
  RECOVER_EMAIL: 'recoverEmail',
  RESET_PASSWORD: 'resetPassword',
  SELECT: 'select',
  VERIFY_EMAIL: 'verifyEmail'
};


/**
 * Gets the widget URL for a specific mode.
 * The 'widgetUrl' configuration is required for this method.
 *
 * @param {?firebaseui.auth.widget.Config.WidgetMode=} opt_mode The mode for the
 *     widget.
 * @return {string} The URL of the callback widget.
 */
firebaseui.auth.widget.Config.prototype.getRequiredWidgetUrl =
    function(opt_mode) {
  var url = /** @type {string} */ (this.config_.getRequired('widgetUrl'));
  return this.widgetUrlForMode_(url, opt_mode);
};


/**
 * Gets the widget URL for a specific mode.
 * If the 'widgetUrl' configuration is not set, current URL is used as the
 * base URL for the widget.
 *
 * @param {?firebaseui.auth.widget.Config.WidgetMode=} opt_mode The mode for the
 *     widget.
 * @return {string} The URL of the callback widget.
 */
firebaseui.auth.widget.Config.prototype.getWidgetUrl = function(opt_mode) {
  var url = /** @type {string|undefined} */ (this.config_.get('widgetUrl'));
  if (!url) {
    // Use current location.
    // Remove all query parameters and fragment.
    var currentUri = goog.Uri.parse(window.location.href);
    url = currentUri.setFragment('').setQuery('').toString();
  }
  return this.widgetUrlForMode_(url, opt_mode);
};


/**
 * Gets the callback URL for IdP. It always returns an absolute URL.
 * @return {string} The callback URL.
 */
firebaseui.auth.widget.Config.prototype.getIdpCallbackUrl = function() {
  return goog.Uri.resolve(
      window.location.href, this.getWidgetUrl()).toString();
};


/**
 * @param {string} baseUrl The base URL of the widget.
 * @param {?firebaseui.auth.widget.Config.WidgetMode=} opt_mode The mode for the
 *     widget.
 * @return {string} The URL of the widget for a specific mode.
 * @private
 */
firebaseui.auth.widget.Config.prototype.widgetUrlForMode_ = function(baseUrl,
    opt_mode) {
  if (opt_mode) {
    var key = this.getQueryParameterForWidgetMode();
    return goog.uri.utils.setParam(baseUrl, key, opt_mode);
  } else {
    return baseUrl;
  }
};


/** @return {string} The sign-in URL of the site. */
firebaseui.auth.widget.Config.prototype.getSignInSuccessUrl = function() {
  return /** @type {string} */ (this.config_.get('signInSuccessUrl'));
};


/**
 * Returns the normalized list of valid user-enabled IdPs.
 *
 * The user may specify each IdP as just a provider ID or as an object
 * containing provider ID and additional scopes; this method converts all
 * entries to the object format and filters out entries with invalid providers.
 *
 * @return {!Array<?Object>} The normalized sign-in options.
 * @private
 */
firebaseui.auth.widget.Config.prototype.getSignInOptions_ = function() {
  var signInOptions = this.config_.get('signInOptions') || [];
  var normalizedOptions = [];
  for (var i = 0; i < signInOptions.length; i++) {
    var providerConfig = signInOptions[i];

    // If the config is not in object format, convert to object format.
    var normalizedConfig = goog.isObject(providerConfig) ?
        providerConfig : {'provider': providerConfig};

    if (firebaseui.auth.idp.isSupportedProvider(normalizedConfig['provider'])) {
      normalizedOptions.push(normalizedConfig);
    }
  }
  return normalizedOptions;
};


/**
 * @return {!Array<string>} The list of supported IdPs including password
 *     special IdP.
 */
firebaseui.auth.widget.Config.prototype.getProviders = function() {
  return goog.array.map(this.getSignInOptions_(), function(option) {
    return option['provider'];
  });
};


/**
 * @param {!string} providerId The provider id whose additional scopes are to be
 *     returned.
 * @return {!Array<string>} The list of additional scopes for specified
 *     provider.
 */
firebaseui.auth.widget.Config.prototype.getProviderAdditionalScopes =
    function(providerId) {
  var signInOptions = this.getSignInOptions_();
  for (var i = 0; i < signInOptions.length; i++) {
    if (signInOptions[i]['provider'] === providerId) {
      var scopes = signInOptions[i]['scopes'];
      return goog.isArray(scopes) ? scopes : [];
    }
  }
  return [];
};


/** @return {string} The query parameter name for widget mode. */
firebaseui.auth.widget.Config.prototype.getQueryParameterForWidgetMode =
    function() {
  return /** @type {string} */ (
      this.config_.getRequired('queryParameterForWidgetMode'));
};


/** @return {string} The redirect URL query parameter. */
firebaseui.auth.widget.Config.prototype.getQueryParameterForSignInSuccessUrl =
    function() {
  return /** @type {string} */ (
      this.config_.getRequired('queryParameterForSignInSuccessUrl'));
};


/** @return {string} The name of the website. */
firebaseui.auth.widget.Config.prototype.getSiteName = function() {
  return /** @type {string} */ (this.config_.getRequired('siteName'));
};


/** @return {?string} The ToS URL for the site. */
firebaseui.auth.widget.Config.prototype.getTosUrl = function() {
  return /** @type {?string} */ (this.config_.get('tosUrl') || null);
};


/**
 * @return {boolean} Whether the display name should be displayed.
 * Defaults to true.
 */
firebaseui.auth.widget.Config.prototype.isDisplayNameRequired = function() {
  var signInOptions = this.getSignInOptions_();

  for (var i = 0; i < signInOptions.length; i++) {
    if (signInOptions[i]['provider'] == firebase.auth.EmailAuthProvider.PROVIDER_ID
        && typeof signInOptions[i]['requireDisplayName'] !== 'undefined') {
      return /** @type {boolean} */ (!!signInOptions[i]['requireDisplayName']);
    }
  }
  return true;
};


/** @return {boolean} Whether to prefer popup mode. */
firebaseui.auth.widget.Config.prototype.getPopupMode = function() {
  return !!this.config_.get('popupMode');
};


/**
 * @return {!firebaseui.auth.widget.Config.SignInFlow} The current sign-in
 *     flow.
 */
firebaseui.auth.widget.Config.prototype.getSignInFlow = function() {
  var signInFlow = this.config_.get('signInFlow');
  // Make sure the select flow is a valid one.
  for (var key in firebaseui.auth.widget.Config.SignInFlow) {
    if (firebaseui.auth.widget.Config.SignInFlow[key] == signInFlow) {
      // Return valid flow.
      return firebaseui.auth.widget.Config.SignInFlow[key];
    }
  }
  // Default to redirect flow.
  return firebaseui.auth.widget.Config.SignInFlow.REDIRECT;
};


/** @return {?function()} The callback to invoke when the widget UI is shown. */
firebaseui.auth.widget.Config.prototype.getUiShownCallback = function() {
  return /** @type {?function()} */ (
      this.getCallbacks_()['uiShown'] || null);
};


/**
 * @return {?function(?string, ?string)} The callback to invoke when the widget
 *     UI is changed. Two parameters are passed, the from page identifier and
 *     the to page identifier.
 */
firebaseui.auth.widget.Config.prototype.getUiChangedCallback = function() {
  return /** @type {?function(?string, ?string)} */ (
      this.getCallbacks_()['uiChanged'] || null);
};


/**
 * @return {?function(?function())} The callback to invoke right when
 *     accountchooser.com is triggered, a continue function is passed and this
 *     should be called when the callback is completed, typically asynchronously
 *     to proceed to accountchooser.com.
 */
firebaseui.auth.widget.Config.prototype.getAccountChooserInvokedCallback =
    function() {
  return /** @type {?function(?function())} */ (
      this.getCallbacks_()['accountChooserInvoked'] || null);
};


/**
 * @return {?function(?firebaseui.auth.widget.Config.AccountChooserResult,
 *     ?function())} The callback to invoke on return from accountchooser.com
 *     invocation. The code result string is passed.
 */
firebaseui.auth.widget.Config.prototype.getAccountChooserResultCallback =
    function() {
  /**
   * @type {?function(?firebaseui.auth.widget.Config.AccountChooserResult,
   *     ?function())}
   */
  var callback = this.getCallbacks_()['accountChooserResult'] || null;
  return callback;
};


/**
 * @return {?firebaseui.auth.callback.signInSuccess} The callback to invoke when
 *     the user signs in successfully. The signed in firebase user is passed
 *     into the callback. A second parameter, the Auth credential is also
 *     returned if available from the sign in with redirect response.
 *     An optional third parameter, the redirect URL, is also returned if that
 *     value is set in storage. If it returns {@code true}, the widget will
 *     continue to redirect the page to {@code signInSuccessUrl}. Otherwise, the
 *     widget stops after it returns.
 */
firebaseui.auth.widget.Config.prototype.getSignInSuccessCallback = function() {
  return /** @type {?firebaseui.auth.callback.signInSuccess} */ (
      this.getCallbacks_()['signInSuccess'] || null);
};


/**
 * @return {!Object} The callback configuration.
 * @private
 */
firebaseui.auth.widget.Config.prototype.getCallbacks_ = function() {
  return /** @type {!Object} */ (this.config_.get('callbacks') || {});
};


/**
 * TODO: for now, only accountchooser.com is available and all logic related to
 * credential helper relies on it, so this method is provided for ease of use.
 * It should be removed in the future when FirebaseUI supports several
 * credential helpers.
 *
 * @return {boolean} Whether accountchooser.com is enabled.
 */
firebaseui.auth.widget.Config.prototype.isAccountChooserEnabled = function() {
  return this.getCredentialHelper() ==
      firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM;
};

/**
 * @return {!firebaseui.auth.CredentialHelper} The credential helper to use.
 */
firebaseui.auth.widget.Config.prototype.getCredentialHelper = function() {
  var credentialHelper = this.config_.get('credentialHelper');
  // Make sure the credential helper is valid.
  for (var key in firebaseui.auth.CredentialHelper) {
    if (firebaseui.auth.CredentialHelper[key] == credentialHelper) {
      // Return valid flow.
      return firebaseui.auth.CredentialHelper[key];
    }
  }
  // Default to using accountchooser.com.
  return firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM;
};


/**
 * Resolves configurations that are implied/restricted by other configs.
 *
 * @private
 */
firebaseui.auth.widget.Config.prototype.resolveImplicitConfig_ = function() {
  if (firebaseui.auth.util.isMobileBrowser()) {
    // On mobile we should not use popup
    this.config_.update('popupMode', false);
  }
};


/**
 * Sets the configurations.
 *
 * @param {Object} config The configurations.
 */
firebaseui.auth.widget.Config.prototype.setConfig = function(config) {
  for (var name in config) {
    try {
      this.config_.update(name, config[name]);
    } catch (e) {
      firebaseui.auth.log.error('Invalid config: "' + name + '"');
    }
  }
  this.resolveImplicitConfig_();
};


/**
 * Updates the configuration and its descendants with the given value.
 *
 * @param {string} name The name of the configuration.
 * @param {*} value The value of the configuration.
 */
firebaseui.auth.widget.Config.prototype.update = function(name, value) {
  this.config_.update(name, value);
};
