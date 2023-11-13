/*
 * Copyright 2019 Google Inc. All Rights Reserved.
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

/** @fileoverview Defines all configurations used by FirebaseUI handler. */

goog.module('firebaseui.auth.widget.UiHandlerConfig');
goog.module.declareLegacyNamespace();

const AuthConfig = goog.require('firebaseui.auth.Config');
const log = goog.require('firebaseui.auth.log');
const util = goog.require('firebaseui.auth.util');


/** The UI handler configuration settings. */
class UiHandlerConfig {
  constructor(config) {
    /** @const @private {!AuthConfig} The AuthUI config object. */
    this.config_ = new AuthConfig();
    // The Auth domain of the Auth instance.
    this.config_.define('authDomain');
    // The display mode for tenant selection, default to 'optionFirst'.
    this.config_.define(
        'displayMode', UiHandlerConfig.DisplayMode.OPTION_FIRST);
    // The UI configuration for each tenant.
    this.config_.define('tenants');
    // The callbacks configuration.
    this.config_.define('callbacks');
    // The terms of service URL configuration for tenant selection UI.
    this.config_.define('tosUrl');
    // The privacy policy URL configuration for tenant selection UI.
    this.config_.define('privacyPolicyUrl');
    this.setConfig(config);
  }

  /**
   * Validates and sets the plain configuration settting object.
   * @param {!Object} config The configuration setting object.
   */
  setConfig(config) {
    for (let name in config) {
      if (config.hasOwnProperty(name)) {
        try {
          this.config_.update(name, config[name]);
        } catch (e) {
          log.error(`Invalid config: "${name}"`);
        }
      }
    }
  }

  /**
   * Returns the project-level Auth domain. Throws error if not provided
   * in the configuration.
   * @return {string} The Auth domain.
   */
  getAuthDomain() {
    const authDomain = this.config_.get('authDomain');
    if (!authDomain) {
      throw new Error('Invalid project configuration: authDomain is required!');
    }
    return /** @type {string} */ (authDomain);
  }

  /**
   * Returns the display mode for the tenant selction flow. Default to
   * option first mode.
   * @return {!UiHandlerConfig.DisplayMode} The display mode.
   */
  getDisplayMode() {
    const displayMode = this.config_.get('displayMode');
    // Make sure the display mode is valid.
    for (let key in UiHandlerConfig.DisplayMode) {
      if (UiHandlerConfig.DisplayMode[key] === displayMode) {
        // Return valid flow.
        return UiHandlerConfig.DisplayMode[key];
      }
    }
    // Default to option first mode.
    return UiHandlerConfig.DisplayMode.OPTION_FIRST;
  }

  /**
   * Returns the callback configuration object.
   * @return {!Object} The callback configuration.
   * @private
   */
  getCallbacks_() {
    return /** @type {!Object} */ (this.config_.get('callbacks') || {});
  }

  /**
   * Returns the signInUiShown callback. It is triggered when the sign-in UI
   * is shown. The tenant ID is passed.
   * @return {?function(?string)} The signInUiShown callback, null if not
   *     available.
   */
  getSignInUiShownCallback() {
    return /** @type {?function(?string)} */ (
        this.getCallbacks_()['signInUiShown'] || null);
  }

  /**
   * Returns the selectTenantUiShown callback. It is triggered when the
   * select provider UI is shown.
   * @return {?function()} The selectTenantUiShown callback, null if not
   *     available.
   */
  getSelectTenantUiShownCallback() {
    return /** @type {?function()} */ (
        this.getCallbacks_()['selectTenantUiShown'] || null);
  }

  /**
   * Returns the selectTenantUiHidden callback. It is triggered when the
   * select provider UI is hidden.
   * @return {?function()} The selectTenantUiHidden callback, null if not
   *     available.
   */
  getSelectTenantUiHiddenCallback() {
    return /** @type {?function()} */ (
        this.getCallbacks_()['selectTenantUiHidden'] || null);
  }

  /**
   * Returns the beforeSignInSuccess callback. It is triggered before the user
   * signs in successfully. The user signing in is passed.
   * @return {?function(!firebase.User)} The beforeSignInSuccess callback,
   *     null if not available.
   */
  getBeforeSignInSuccessCallback() {
    return /** @type {?function(!firebase.User)} */ (
        this.getCallbacks_()['beforeSignInSuccess'] || null);
  }

  /**
   * Returns the terms of service callback. Returns null if either terms of
   * service or privacy policy is not configured.
   * @return {?function()} The terms of service callback for the tenant
   *     selection UI. If URL is provided, wraps the URL with a callback
   *     function.
   */
  getTosUrl() {
    const tosUrl = this.config_.get('tosUrl') || null;
    const privacyPolicyUrl = this.config_.get('privacyPolicyUrl') || null;
    if (tosUrl && !privacyPolicyUrl) {
      log.warning(
          'Privacy Policy URL is missing, the link will not be displayed.');
    }
    if (tosUrl && privacyPolicyUrl) {
      if (typeof tosUrl === 'function') {
        return /** @type {function()} */ (tosUrl);
      } else if (typeof tosUrl === 'string') {
        return () => {
          util.open(
              /** @type {string} */ (tosUrl),
              util.isCordovaInAppBrowserInstalled() ?
              '_system' : '_blank');
        };
      }
    }
    return null;
  }

  /**
   * Returns the privacy policy callback. Returns null if either terms of
   * service or privacy policy is not configured.
   * @return {?function()} The privacy policy callback for the tenant selection
   *     UI. If URL is provided, wraps the URL with a callback function.
   */
  getPrivacyPolicyUrl() {
    const tosUrl = this.config_.get('tosUrl') || null;
    const privacyPolicyUrl = this.config_.get('privacyPolicyUrl') || null;
    if (privacyPolicyUrl && !tosUrl) {
      log.warning(
          'Terms of Service URL is missing, the link will not be displayed.');
    }
    if (tosUrl && privacyPolicyUrl) {
      if (typeof privacyPolicyUrl === 'function') {
          return /** @type {function()} */ (privacyPolicyUrl);
      } else if (typeof privacyPolicyUrl === 'string') {
        return () => {
          util.open(
              /** @type {string} */ (privacyPolicyUrl),
              util.isCordovaInAppBrowserInstalled() ?
              '_system' : '_blank');
        };
      }
    }
    return null;
  }

  /**
   * Validates the tenant ID or the top-level project config key.
   * @param {string} tenantId The tenantId or top-level project config key.
   */
  validateTenantId(tenantId) {
    const uiConfigs = this.config_.get('tenants');
    if (!uiConfigs ||
        (!uiConfigs.hasOwnProperty(tenantId) &&
         !uiConfigs.hasOwnProperty(
             UiHandlerConfig.ConfigKeys.DEFAULT_CONFIG_KEY))) {
      throw new Error('Invalid tenant configuration!');
    }
  }

  /**
   * Validates the tenant ID provided and returns the config object for the
   * specific tenant.
   * @param {string} tenantId The tenantId or top-level project config key.
   * @return {!Object} The config object of the tenant.
   * @private
   */
  getTenantConfig_(tenantId) {
    this.validateTenantId(tenantId);
    const uiConfigs = this.config_.get('tenants');
    return uiConfigs[tenantId] ||
        uiConfigs[UiHandlerConfig.ConfigKeys.DEFAULT_CONFIG_KEY];
  }

  /**
   * Returns the providers enabled for the given tenant. If email is provided,
   * only returns the providers that match with the given email. Note that if
   * email is passed but no hd is available, the associated provider is
   * still returned.
   * @param {string} tenantId The tenant ID or project-level config key.
   * @param {?string=} email The optional email used to match providers.
   * @return {!Array<string>} The list of enabled provider IDs.
   */
  getProvidersForTenant(tenantId, email = undefined) {
    const uiConfigs = this.config_.get('tenants');
    if (!uiConfigs) {
      throw new Error('Invalid tenant configuration!');
    }
    const providers = [];
    const tenantConfig =
        uiConfigs[tenantId] ||
        uiConfigs[UiHandlerConfig.ConfigKeys.DEFAULT_CONFIG_KEY];
    if (!tenantConfig) {
      log.error(`Invalid tenant configuration: `+
                `${tenantId} is not configured!`);
      return providers;
    }
    const signInOptions = tenantConfig['signInOptions'];
    if (!signInOptions) {
      throw new Error(
          'Invalid tenant configuration: signInOptions are invalid!');
    }
    signInOptions.forEach((option) => {
      if (typeof option === 'string') {
        // No hd configured, treat like a match for any email.
        providers.push(option);
      } else if (typeof option['provider'] === 'string') {
        const hd = option['hd'];
        // If hd is configured, match the email with the hd.
        if (hd && email) {
          const regex = hd instanceof RegExp ?
              hd : new RegExp('@' + hd.replace('.', '\\.') + '$');
          if (regex.test(email)) {
            providers.push(option['provider']);
          }
        } else {
           // No hd configured, treat like a match for any email.
          providers.push(option['provider']);
        }
      } else {
        log.error(
            `Invalid tenant configuration: signInOption ` +
            `${JSON.stringify(option)} is invalid!`);
      }
    });
    return providers;
  }

  /**
   * Returns the config object of the specific tenant for the sign-in flow.
   * @param {string} tenantId The tenant ID or project-level config key.
   * @param {?Array<string>=} providerIds The optional eligible provider IDs.
   * @return {!Object} The sign in UI config object for the tenant.
   */
  getSignInConfigForTenant(tenantId, providerIds = undefined) {
    const signInConfig = this.filterTenantConfig_(
        tenantId,
        UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS);
    // If eligible providers are provided, only returns eligible providers in
    // the sign in options.
    const signInOptions = signInConfig['signInOptions'];
    if (signInOptions && providerIds) {
      const eligibleOptions = signInOptions.filter((option) => {
        if (typeof option === 'string') {
          return providerIds.includes(option);
        } else {
          return providerIds.includes(option['provider']);
        }
      });
      signInConfig['signInOptions'] = eligibleOptions;
    }
    return signInConfig;
  }

  /**
   * Returns the tenant selection button config object for the option first
   * tenant selection screen. Returns null if tenant button is not configured.
   * @param {string} tenantId The tenant ID or project-level config key.
   * @return {?Object} The tenant selection button config object for the tenant.
   */
  getSelectionButtonConfigForTenant(tenantId) {
    const uiConfigs = this.config_.get('tenants');
    if (!uiConfigs) {
      throw new Error('Invalid tenant configuration!');
    }
    const tenantConfig =
        uiConfigs[tenantId] ||
        uiConfigs[UiHandlerConfig.ConfigKeys.DEFAULT_CONFIG_KEY];
    if (!tenantConfig) {
      log.error(`Invalid tenant configuration: `+
                `${tenantId} is not configured!`);
      return null;
    }
    // The button config key cannot have the quote mark, since the key name will
    // be renamed in the soy template.
    return {
      tenantId: tenantId !== UiHandlerConfig.ConfigKeys.TOP_LEVEL_CONFIG_KEY ?
          tenantId : null,
      fullLabel: tenantConfig['fullLabel'] || null,
      displayName: tenantConfig['displayName'],
      iconUrl: tenantConfig['iconUrl'],
      buttonColor: tenantConfig['buttonColor'],
    };
  }

  /**
   * Filters the tenant configuration object by the provided keys.
   * @param {string} tenantId The tenant ID or project-level config key.
   * @param {!Array<string>} keys The array of property keys used to filter the
   *     properties.
   * @param {!Object=} baseConfig The optional base config object.
   * @return {!Object} The copy of the config object for the tenant filtered
   *     by the keys.
   * @private
   */
  filterTenantConfig_(tenantId, keys, baseConfig = {}) {
    const uiConfig = this.getTenantConfig_(tenantId);
    return util.filterProperties(
        /** @type {!Object} */ (uiConfig), keys, baseConfig);
  }
}

/**
 * The config keys needed for sign-in.
 * @const {!Array<string>}
 */
UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS = [
  'immediateFederatedRedirect',
  'privacyPolicyUrl',
  'signInFlow',
  'signInOptions',
  'tosUrl',
];

/**
 * The different display modes for tenant selection available.
 * @enum {string}
 */
UiHandlerConfig.DisplayMode = {
  OPTION_FIRST: 'optionFirst',
  IDENTIFIER_FIRST: 'identifierFirst',
};

/**
 * The UI configuration keys.
 * @enum {string}
 */
UiHandlerConfig.ConfigKeys = {
  // The UI configuration key for default configuration.
  DEFAULT_CONFIG_KEY: '*',
  // The UI configuration key for top-level project.
  TOP_LEVEL_CONFIG_KEY: '_',
};

exports = UiHandlerConfig;
