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

/** @fileoverview Defines all configurations used by FirebaseUI widget. */

goog.module('firebaseui.auth.widget.Config');
goog.module.declareLegacyNamespace();

const AuthConfig = goog.require('firebaseui.auth.Config');
const AuthUIError = goog.require('firebaseui.auth.AuthUIError');
const PhoneNumber = goog.require('firebaseui.auth.PhoneNumber');
const Uri = goog.require('goog.Uri');
const country = goog.require('firebaseui.auth.data.country');
const googArray = goog.require('goog.array');
const googObject = goog.require('goog.object');
const idp = goog.require('firebaseui.auth.idp');
const log = goog.require('firebaseui.auth.log');
const util = goog.require('firebaseui.auth.util');
const utils = goog.require('goog.uri.utils');


/** Application configuration settings. */
class Config {
  constructor() {
    /** @const @private {!AuthConfig} The AuthUI config object. */
    this.config_ = new AuthConfig();
    // Define FirebaseUI widget configurations and convenient getters.
    // TODO: This is deprecated and should be removed by Jan 31st, 2021.
    this.config_.define('acUiConfig');
    this.config_.define('autoUpgradeAnonymousUsers');
    this.config_.define('callbacks');
    /**
     * Determines which credential helper to use. By default,
     * no credentialHelper is selected.
     */
    this.config_.define(
        'credentialHelper',
        Config.CredentialHelper.NONE);
    /**
     * Determines whether to immediately redirect to the provider's site or
     * instead show the default 'Sign in with Provider' button when there
     * is only a single federated provider in signInOptions. In order for this
     * option to take effect, the signInOptions must only hold a single
     * federated provider (like 'google.com') and signInFlow must be set to
     * 'redirect'.
     */
    this.config_.define('immediateFederatedRedirect', false);
    this.config_.define('popupMode', false);
    this.config_.define('privacyPolicyUrl');
    /** Determines the redirect URL query key. */
    this.config_.define(
        'queryParameterForSignInSuccessUrl', 'signInSuccessUrl');
    this.config_.define('queryParameterForWidgetMode', 'mode');
    /**
     * Determines the sign-in flow, 'popup' or 'redirect'. The former will use
     * signInWithPopup where as the latter will use the default
     * signInWithRedirect when a federated sign-in is triggered.
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
  }

  /**
   * Gets the widget URL for a specific mode.
   * The 'widgetUrl' configuration is required for this method.
   * @param {?Config.WidgetMode=} mode The mode for the widget.
   * @return {string} The URL of the callback widget.
   */
  getRequiredWidgetUrl(mode = undefined) {
    const url = /** @type {string} */ (this.config_.getRequired('widgetUrl'));
    return this.widgetUrlForMode_(url, mode);
  }

  /**
   * Gets the widget URL for a specific mode.
   * If the 'widgetUrl' configuration is not set, current URL is used as the
   * base URL for the widget.
   * @param {?Config.WidgetMode=} mode The mode for the widget.
   * @return {string} The URL of the callback widget.
   */
  getWidgetUrl(mode = undefined) {
    const url = /** @type {string|undefined} */ (
        this.config_.get('widgetUrl')) ||
        // If no widget URL is provided, use the current one.
        util.getCurrentUrl();
    return this.widgetUrlForMode_(url, mode);
  }

  /**
   * Gets the callback URL for IdP. It always returns an absolute URL.
   * @return {string} The callback URL.
   */
  getIdpCallbackUrl() {
    return Uri.resolve(
        window.location.href, this.getWidgetUrl()).toString();
  }

  /**
   * @param {string} baseUrl The base URL of the widget.
   * @param {?Config.WidgetMode=} mode The mode for the widget.
   * @return {string} The URL of the widget for a specific mode.
   * @private
   */
  widgetUrlForMode_(baseUrl, mode = undefined) {
    if (mode) {
      const key = this.getQueryParameterForWidgetMode();
      return utils.setParam(baseUrl, key, mode);
    } else {
      return baseUrl;
    }
  }

  /** @return {string} The sign-in URL of the site. */
  getSignInSuccessUrl() {
    return /** @type {string} */ (this.config_.get('signInSuccessUrl'));
  }

  /** @return {boolean} Whether to auto upgrade anonymous users. */
  autoUpgradeAnonymousUsers() {
    const autoUpgradeAnonymousUsers =
        !!this.config_.get('autoUpgradeAnonymousUsers');
    // Confirm signInFailure callback is provided when anonymous upgrade is
    // enabled. This is required to provide a means of recovery for merge
    // conflict flows.
    if (autoUpgradeAnonymousUsers && !this.getSignInFailureCallback()) {
      log.error('Missing "signInFailure" callback: ' +
          '"signInFailure" callback needs to be provided when ' +
          '"autoUpgradeAnonymousUsers" is set to true.');
    }
    return autoUpgradeAnonymousUsers;
  }

  /**
   * Returns the normalized list of valid user-enabled IdPs.
   * The user may specify each IdP as just a provider ID or as an object
   * containing provider ID and additional scopes; this method converts all
   * entries to the object format and filters out entries with invalid
   * providers.
   * @return {!Array<?Object>} The normalized sign-in options.
   * @private
   */
  getSignInOptions_() {
    const signInOptions = this.config_.get('signInOptions') || [];
    const normalizedOptions = [];
    for (let i = 0; i < signInOptions.length; i++) {
      const providerConfig = signInOptions[i];

      // If the config is not in object format, convert to object format.
      const normalizedConfig = goog.isObject(providerConfig) ?
          providerConfig : {'provider': providerConfig};

      if (normalizedConfig['provider']) {
        normalizedOptions.push(normalizedConfig);
      }
    }
    return normalizedOptions;
  }

  /**
   * Returns the normalized signInOptions for the specified provider.
   * @param {string} providerId The provider id whose signInOptions are to be
   *     returned.
   * @return {?Object} The normalized sign-in options for the specified
   *     provider.
   * @private
   */
  getSignInOptionsForProvider_(providerId) {
    const signInOptions = this.getSignInOptions_();
    // For each sign-in option.
    for (let i = 0; i < signInOptions.length; i++) {
      // Check if current option matches provider ID.
      if (signInOptions[i]['provider'] === providerId) {
        return signInOptions[i];
      }
    }
    return null;
  }

  /**
   * @return {!Array<string>} The list of supported IdPs including password
   *     special IdP.
   */
  getProviders() {
    return googArray.map(
        this.getSignInOptions_(), (option) => option['provider']);
  }

  /**
   * @param {string} providerId The provider id whose sign in provider config
   *     is to be returned.
   * @return {?Config.ProviderConfig} The list of sign in provider configs for
   *     supported IdPs.
   */
  getConfigForProvider(providerId) {
    const providerConfigs = this.getProviderConfigs();
    for (let i = 0; i < providerConfigs.length; i++) {
      // Check if current option matches provider ID.
      if (providerConfigs[i]['providerId'] === providerId) {
        return providerConfigs[i];
      }
    }
    return null;
  }

  /**
   * Returns all available provider configs. For built-in providers, provider
   * display name, button color and icon URL are fixed and cannot be overridden.
   * @return {!Array<!Config.ProviderConfig>} The list of supported IdP configs.
   */
  getProviderConfigs() {
    return googArray.map(this.getSignInOptions_(), (option) => {
      if (idp.isSupportedProvider(option['provider']) ||
          googArray.contains(
              UI_SUPPORTED_PROVIDERS,
              option['provider'])) {
        // The login hint key is also automatically set for built-in providers
        // that support it.
        const providerConfig = {
          providerId: option['provider'],
          // Since developers may be using G-Suite for Google sign in or
          // want to label email/password as their own provider, we should
          // allow customization of these attributes.
          providerName: option['providerName'] || null,
          fullLabel: option['fullLabel'] || null,
          buttonColor: option['buttonColor'] || null,
          iconUrl: option['iconUrl'] ?
              util.sanitizeUrl(option['iconUrl']) : null,
        };
        for (const key in providerConfig) {
          if (providerConfig[key] === null) {
            delete providerConfig[key];
          }
        }
        return providerConfig;
      } else {
        return {
          providerId: option['provider'],
          providerName: option['providerName'] || null,
          fullLabel: option['fullLabel'] || null,
          buttonColor: option['buttonColor'] || null,
          iconUrl: option['iconUrl'] ?
              util.sanitizeUrl(option['iconUrl']) : null,
          loginHintKey: option['loginHintKey'] || null,
        };
      }
    });
  }

  /**
   * @return {?string} The googleyolo configuration client ID if available.
   */
  getGoogleYoloClientId() {
    const signInOptions = this.getSignInOptionsForProvider_(
        firebase.auth.GoogleAuthProvider.PROVIDER_ID);
    if (signInOptions &&
        signInOptions['clientId'] &&
        this.getCredentialHelper() === Config.CredentialHelper.GOOGLE_YOLO) {
      return signInOptions['clientId'] || null;
    }
    return null;
  }

  /**
   * @return {boolean} Whether the user should be prompted to select an
   *     account.
   */
  isAccountSelectionPromptEnabled() {
    // This is only applicable to Google. If prompt is set, googleyolo retrieve
    // is disabled. Auto sign-in should be manually disabled.
    // Get Google custom parameters.
    const googleCustomParameters = this.getProviderCustomParameters(
        firebase.auth.GoogleAuthProvider.PROVIDER_ID);
    // Google custom parameters must have prompt set to select_account,
    // otherwise account selection prompt is considered disabled.
    return !!(googleCustomParameters &&
              googleCustomParameters['prompt'] === 'select_account');
  }

  /**
   * Returns the corresponding Firebase Auth provider ID for the googleyolo
   * authMethod provided.
   * @param {?string} authMethod The googleyolo authMethod whose corresponding
   *     Firebase provider ID is to be returned.
   * @return {?string} The corresponding Firebase provider ID if available.
   */
  getProviderIdFromAuthMethod(authMethod) {
    let providerId = null;
    // For each supported provider.
    googArray.forEach(this.getSignInOptions_(), (option) => {
      // Check for matching authMethod.
      if (option['authMethod'] === authMethod) {
        // Get the providerId for that provider.
        providerId = option['provider'];
      }
    });
    // Return the corresponding provider ID.
    return providerId;
  }

  /**
   * @return {?Object<string, *>} The filtered reCAPTCHA parameters used when
   *     phone auth provider is enabled. If none provided, null is returned.
   */
  getRecaptchaParameters() {
    let recaptchaParameters = null;
    googArray.forEach(this.getSignInOptions_(), (option) => {
      if (option['provider'] == firebase.auth.PhoneAuthProvider.PROVIDER_ID &&
          // Confirm valid object.
          goog.isObject(option['recaptchaParameters']) &&
          !Array.isArray(option['recaptchaParameters'])) {
        // Clone original object.
        recaptchaParameters = googObject.clone(option['recaptchaParameters']);
      }
    });
    if (recaptchaParameters) {
      // Keep track of all blacklisted keys passed by the developer.
      const blacklistedKeys = [];
      // Go over all blacklisted keys and remove them from the original object.
      googArray.forEach(
          BLACKLISTED_RECAPTCHA_KEYS,
          (key) => {
            if (typeof recaptchaParameters[key] !== 'undefined') {
              blacklistedKeys.push(key);
              delete recaptchaParameters[key];
            }
          });
      // Log a warning for invalid keys.
      // This will show on each call.
      if (blacklistedKeys.length) {
        log.warning(
            'The following provided "recaptchaParameters" keys are not ' +
            'allowed: ' + blacklistedKeys.join(', '));
      }
    }
    return recaptchaParameters;
  }

  /**
   * @param {string} providerId The provider id whose additional scopes are to
   *     be returned.
   * @return {!Array<string>} The list of additional scopes for specified
   *     provider.
   */
  getProviderAdditionalScopes(providerId) {
    // Get provided sign-in options for specified provider.
    const signInOptions = this.getSignInOptionsForProvider_(providerId);
    const scopes = signInOptions && signInOptions['scopes'];
    return Array.isArray(scopes) ? scopes : [];
  }

  /**
   * @param {string} providerId The provider id whose custom parameters are to
   *     be returned.
   * @return {?Object} The custom parameters for the current provider.
   */
  getProviderCustomParameters(providerId) {
    // Get provided sign-in options for specified provider.
    const signInOptions = this.getSignInOptionsForProvider_(providerId);
    // Get customParameters for that provider if available.
    const customParameters = signInOptions && signInOptions['customParameters'];
    // Custom parameters must be an object.
    if (goog.isObject(customParameters)) {
      // Clone original custom parameters.
      const clonedCustomParameters = googObject.clone(customParameters);
      // Delete login_hint from Google provider as it could break the flow.
      if (providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID) {
        delete clonedCustomParameters['login_hint'];
      }
      // Delete login from GitHub provider as it could break the flow.
      if (providerId === firebase.auth.GithubAuthProvider.PROVIDER_ID) {
        delete clonedCustomParameters['login'];
      }
      return clonedCustomParameters;
    }
    return null;
  }

  /**
   * Returns the default country to select for phone authentication.
   * @return {?string} The default naional number, or null if phone auth is not
   *     enabled.
   */
  getPhoneAuthDefaultNationalNumber() {
    const signInOptions = this.getSignInOptionsForProvider_(
        firebase.auth.PhoneAuthProvider.PROVIDER_ID);
    // Check if loginHint passed. If so, get the national number from there.
    // If no defaultNationalNumber passed, use this value instead.
    let defaultPhoneNumber = null;
    if (signInOptions && typeof (signInOptions['loginHint']) === 'string') {
      defaultPhoneNumber = PhoneNumber.fromString(
          /** @type {string} */ (signInOptions['loginHint']));
    }
    return (signInOptions && signInOptions['defaultNationalNumber']) ||
        (defaultPhoneNumber && defaultPhoneNumber.nationalNumber) || null;
  }

  /**
   * Returns the default country to select for phone authentication.
   * @return {?country.Country} The default country, or null if phone auth is
   *     not enabled or the country is not found.
   */
  getPhoneAuthDefaultCountry() {
    const signInOptions = this.getSignInOptionsForProvider_(
        firebase.auth.PhoneAuthProvider.PROVIDER_ID);
    const iso2 = signInOptions && signInOptions['defaultCountry'] || null;
    const countries = iso2 && country.getCountriesByIso2(iso2);
    // Check if loginHint passed. If so, get the country ID from there.
    // If no defaultCountry passed, use this value instead.
    let defaultPhoneNumber = null;
    if (signInOptions && typeof (signInOptions['loginHint']) === 'string') {
      defaultPhoneNumber = PhoneNumber.fromString(
          /** @type {string} */ (signInOptions['loginHint']));
    }
    // If there are multiple entries, pick the first one.
    return (countries && countries[0]) ||
        (defaultPhoneNumber && defaultPhoneNumber.getCountry()) || null;
  }

  /**
   * Returns the available countries for phone authentication.
   * @return {?Array<!country.Country>} The available country list, or null if
   *     phone Auth is not enabled.
   */
  getPhoneAuthAvailableCountries() {
    const signInOptions = this.getSignInOptionsForProvider_(
        firebase.auth.PhoneAuthProvider.PROVIDER_ID);
    if (!signInOptions) {
      return null;
    }
    const whitelistedCountries = signInOptions['whitelistedCountries'];
    const blacklistedCountries = signInOptions['blacklistedCountries'];
    // First validate the input.
    if (typeof whitelistedCountries !== 'undefined' &&
        (!Array.isArray(whitelistedCountries) ||
         whitelistedCountries.length == 0)) {
      throw new Error('WhitelistedCountries must be a non-empty array.');
    }
    if (typeof blacklistedCountries !== 'undefined' &&
        (!Array.isArray(blacklistedCountries))) {
      throw new Error('BlacklistedCountries must be an array.');
    }
    // If both whitelist and blacklist are provided, throw error.
    if (whitelistedCountries && blacklistedCountries) {
      throw new Error(
          'Both whitelistedCountries and blacklistedCountries are provided.');
    }
    // If no whitelist or blacklist provided, return all available countries.
    if (!whitelistedCountries && !blacklistedCountries) {
      return country.COUNTRY_LIST;
    }
    let countries = [];
    const availableCountries = [];
    if (whitelistedCountries) {
      // Whitelist is provided.
      const whitelistedCountryMap = {};
      for (let i = 0; i < whitelistedCountries.length; i++) {
        countries = country
            .getCountriesByE164OrIsoCode(whitelistedCountries[i]);
        // Remove duplicate and overlaps by putting into a map.
        for (let j = 0; j < countries.length; j++) {
          whitelistedCountryMap[countries[j].e164_key] = countries[j];
        }
      }
      for (let countryKey in whitelistedCountryMap) {
         if (whitelistedCountryMap.hasOwnProperty(countryKey)) {
           availableCountries.push(whitelistedCountryMap[countryKey]);
         }
      }
      return availableCountries;
    } else {
      const blacklistedCountryMap = {};
      for (let i = 0; i < blacklistedCountries.length; i++) {
        countries = country
            .getCountriesByE164OrIsoCode(blacklistedCountries[i]);
        // Remove duplicate and overlaps by putting into a map.
        for (let j = 0; j < countries.length; j++) {
          blacklistedCountryMap[countries[j].e164_key] = countries[j];
        }
      }
      for (let k = 0; k < country.COUNTRY_LIST.length; k++) {
        if (!googObject.containsKey(
                blacklistedCountryMap,
                country.COUNTRY_LIST[k].e164_key)) {
          availableCountries.push(country.COUNTRY_LIST[k]);
        }
      }
      return availableCountries;
    }
  }

  /** @return {string} The query parameter name for widget mode. */
  getQueryParameterForWidgetMode() {
    return /** @type {string} */ (
        this.config_.getRequired('queryParameterForWidgetMode'));
  }

  /** @return {string} The redirect URL query parameter. */
  getQueryParameterForSignInSuccessUrl() {
    return /** @type {string} */ (
        this.config_.getRequired('queryParameterForSignInSuccessUrl'));
  }

  /** @return {string} The name of the website. */
  getSiteName() {
    return /** @type {string} */ (this.config_.getRequired('siteName'));
  }

  /**
   * @return {?function()} The ToS callback for the site. If URL is provided,
   *     wraps the URL with a callback function.
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
   * @return {?function()} The Privacy Policy callback for the site. If URL is
   * provided, wraps the URL with a callback function.
   */
  getPrivacyPolicyUrl() {
    const tosUrl = this.config_.get('tosUrl') || null;
    const privacyPolicyUrl = this.config_.get('privacyPolicyUrl') || null;
    if (privacyPolicyUrl && !tosUrl) {
      log.warning(
          'Term of Service URL is missing, the link will not be displayed.');
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
   * @return {boolean} Whether the display name should be displayed. Defaults
   *     to true.
   */
  isDisplayNameRequired() {
    // Get provided sign-in options for specified provider.
    const signInOptions = this.getSignInOptionsForProvider_(
        firebase.auth.EmailAuthProvider.PROVIDER_ID);

    if (signInOptions &&
        typeof signInOptions['requireDisplayName'] !== 'undefined') {
      return /** @type {boolean} */ (!!signInOptions['requireDisplayName']);
    }
    return true;
  }

  /**
   * @return {boolean} Whether email link sign-in is allowed. Defaults to false.
   */
  isEmailLinkSignInAllowed() {
    // Get provided sign-in options for specified provider.
    const signInOptions = this.getSignInOptionsForProvider_(
        firebase.auth.EmailAuthProvider.PROVIDER_ID);

    return !!(signInOptions && signInOptions['signInMethod'] ===
              firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD);
  }

  /**
   * @return {boolean} Whether password sign-in is allowed. Defaults to true.
   */
  isEmailPasswordSignInAllowed() {
    return !this.isEmailLinkSignInAllowed();
  }

  /** @return {boolean} Whether same device is forced for email link sign-in. */
  isEmailLinkSameDeviceForced() {
    // Get provided sign-in options for specified provider.
    const signInOptions = this.getSignInOptionsForProvider_(
        firebase.auth.EmailAuthProvider.PROVIDER_ID);

    return !!(signInOptions && signInOptions['forceSameDevice']);
  }

  /**
   * @return {?firebase.auth.ActionCodeSettings} The ActionCodeSettings if
   *     email link sign-in is enabled. Null is returned otherwise.
   */
  getEmailLinkSignInActionCodeSettings() {
    if (this.isEmailLinkSignInAllowed()) {
      const actionCodeSettings = {
        'url': util.getCurrentUrl(),
        'handleCodeInApp': true,
      };
      // Get provided sign-in options for specified provider.
      const signInOptions = this.getSignInOptionsForProvider_(
          firebase.auth.EmailAuthProvider.PROVIDER_ID);
      if (signInOptions &&
          typeof signInOptions['emailLinkSignIn'] === 'function') {
        googObject.extend(
            actionCodeSettings,
            signInOptions['emailLinkSignIn']());
      }
      // URL could be provided using a relative path.
      actionCodeSettings['url'] = Uri.resolve(
          util.getCurrentUrl(),
          actionCodeSettings['url']).toString();
      return actionCodeSettings;
    }
    return null;
  }

  /** @return {boolean} Whether to prefer popup mode. */
  getPopupMode() {
    return !!this.config_.get('popupMode');
  }

  /**
   * Determines whether to show the 'nascar' sign-in buttons screen or
   * immediately redirect to the provider's site when there is only a single
   * federated provider in signInOptions. In order for this option to take
   * effect, the signInOptions must only hold a single federated provider (like
   * 'google.com') and signInFlow must be set to 'redirect'.
   * @return {boolean} Whether to skip the 'nascar' screen or not.
   */
  federatedProviderShouldImmediatelyRedirect() {
    const immediateFederatedRedirect = !!this.config_.get(
        'immediateFederatedRedirect');
    const providers = this.getProviders();
    const signInFlow = this.getSignInFlow();
    return immediateFederatedRedirect &&
        providers.length == 1 &&
        idp.isFederatedSignInMethod(providers[0]) &&
        signInFlow == Config.SignInFlow.REDIRECT;
  }

  /** @return {!Config.SignInFlow} The current sign-in flow. */
  getSignInFlow() {
    const signInFlow = this.config_.get('signInFlow');
    // Make sure the select flow is a valid one.
    for (let key in Config.SignInFlow) {
      if (Config.SignInFlow[key] == signInFlow) {
        // Return valid flow.
        return Config.SignInFlow[key];
      }
    }
    // Default to redirect flow.
    return Config.SignInFlow.REDIRECT;
  }

  /**
   * @return {?function()} The callback to invoke when the widget UI is shown.
   */
  getUiShownCallback() {
    return /** @type {?function()} */ (
        this.getCallbacks_()['uiShown'] || null);
  }

  /**
   * @return {?function(?string, ?string)} The callback to invoke when the
   *     widget UI is changed. Two parameters are passed, the from page
   *     identifier and the to page identifier.
   */
  getUiChangedCallback() {
    return /** @type {?function(?string, ?string)} */ (
        this.getCallbacks_()['uiChanged'] || null);
  }

  /**
   * @return {?Config.signInSuccessCallback} The callback to invoke when the
   *     user signs in successfully. The signed in firebase user is passed
   *     into the callback. A second parameter, the Auth credential is also
   *     returned if available from the sign in with redirect response. An
   *     optional third parameter, the redirect URL, is also returned if that
   *     value is set in storage. If it returns `true`, the widget will
   *     continue to redirect the page to `signInSuccessUrl`. Otherwise, the
   *     widget stops after it returns.
   */
  getSignInSuccessCallback() {
    return /** @type {?Config.signInSuccessCallback} */ (
        this.getCallbacks_()['signInSuccess'] || null);
  }

  /**
   * @return {?Config.signInSuccessWithAuthResultCallback} The callback to
   *     invoke when the user signs in successfully. The Auth result is passed
   *     into the callback, which includes current user, credential to sign in
   *     to external Auth instance, additional user info and operation type.
   *     An optional second parameter, the redirect URL, is also returned if
   *     that value is set in storage. If it returns `true`, the widget will
   *     continue to redirect the page to `signInSuccessUrl`. Otherwise, the
   *     widget stops after it returns.
   */
  getSignInSuccessWithAuthResultCallback() {
    return (
        /** @type {?Config.signInSuccessWithAuthResultCallback} */ (
        this.getCallbacks_()['signInSuccessWithAuthResult'] || null));
  }

  /**
   * @return {?Config.signInFailureCallback} The callback to invoke when the
   *     user fails to sign in.
   */
  getSignInFailureCallback() {
    return /** @type {?Config.signInFailureCallback} */ (
        this.getCallbacks_()['signInFailure'] || null);
  }

  /**
   * @return {!Object} The callback configuration.
   * @private
   */
  getCallbacks_() {
    return /** @type {!Object} */ (this.config_.get('callbacks') || {});
  }

  /**
   * @return {!Config.CredentialHelper} The credential helper to use.
   */
  getCredentialHelper() {
    // Always use none for non http or https environment.
    // This could change when we support other credential helpers. This is
    // unlikely though as smartlock also checks the domain and will not work in
    // such environments.
    if (!util.isHttpOrHttps()) {
      return Config.CredentialHelper.NONE;
    }
    const credentialHelper = this.config_.get('credentialHelper');

    // Manually set deprecated accountchooser.com to none.
    if (credentialHelper === Config.CredentialHelper.ACCOUNT_CHOOSER_COM) {
      return Config.CredentialHelper.NONE;
    }

    // Make sure the credential helper is valid.
    for (let key in Config.CredentialHelper) {
      if (Config.CredentialHelper[key] === credentialHelper) {
        // Return valid flow.
        return Config.CredentialHelper[key];
      }
    }
    // Default to using none.
    return Config.CredentialHelper.NONE;
  }

  /**
   * Resolves configurations that are implied/restricted by other configs.
   * @private
   */
  resolveImplicitConfig_() {
    if (util.isMobileBrowser()) {
      // On mobile we should not use popup
      this.config_.update('popupMode', false);
    }
  }

  /**
   * Sets the configurations.
   * @param {Object} config The configurations.
   */
  setConfig(config) {
    for (let name in config) {
      try {
        this.config_.update(name, config[name]);
      } catch (e) {
        log.error(`Invalid config: "${name}"`);
      }
    }
    this.resolveImplicitConfig_();
    this.getPhoneAuthAvailableCountries();
  }

  /**
   * Updates the configuration and its descendants with the given value.
   * @param {string} name The name of the configuration.
   * @param {*} value The value of the configuration.
   */
  update(name, value) {
    this.config_.update(name, value);
    this.getPhoneAuthAvailableCountries();
  }
}

/**
 * The different credentials helper available.
 * @enum {string}
 */
Config.CredentialHelper = {
  // TODO: accountchooser.com is no longer supported. Remove by Jan 31st, 2021.
  ACCOUNT_CHOOSER_COM: 'accountchooser.com',
  GOOGLE_YOLO: 'googleyolo',
  NONE: 'none',
};

/**
 * Provider ID for continue as guest sign in option.
 * @const {string}
 */
Config.ANONYMOUS_PROVIDER_ID = 'anonymous';

/**
 * @typedef {{
 *   user: (?firebase.User),
 *   credential: (?firebase.auth.AuthCredential),
 *   operationType: (?string|undefined),
 *   additionalUserInfo: (?firebase.auth.AdditionalUserInfo|undefined)
 * }}
 */
Config.AuthResult;

/**
 * The configuration sign-in success callback.
 * @typedef {function(
 *     !firebase.User, ?firebase.auth.AuthCredential=, string=): boolean}
 */
Config.signInSuccessCallback;

/**
 * The configuration sign-in success callback which takes AuthResult as input.
 * @typedef {function(!Config.AuthResult, string=): boolean}
 */
Config.signInSuccessWithAuthResultCallback;

/**
 * The configuration sign-in failure callback.
 * @typedef {function(!AuthUIError): (!Promise<void>|void)}
 */
Config.signInFailureCallback;

/**
 * The type of sign-in flow.
 * @enum {string}
 */
Config.SignInFlow = {
  POPUP: 'popup',
  REDIRECT: 'redirect',
};

/**
 * The provider config object for generic providers.
 * providerId: The provider ID.
 * providerName: The display name of the provider.
 * fullLabel: The full button label. If both providerName and fullLabel are
 * provided, we will use fullLabel for long name and providerName for short
 * name.
 * buttonColor: The color of the sign in button.
 * iconUrl: The URL of the icon on sign in button.
 * loginHintKey: The name to use for the optional login hint parameter.
 * @typedef {{
 *   providerId: string,
 *   fullLabel: (?string|undefined),
 *   providerName: (?string|undefined),
 *   buttonColor: (?string|undefined),
 *   iconUrl: (?string|undefined),
 *   loginHintKey: (?string|undefined)
 * }}
 */
Config.ProviderConfig;

/**
 * Enums for callback widget mode. Please alphabetize by names.
 * @enum {string}
 */
Config.WidgetMode = {
  CALLBACK: 'callback',
  RECOVER_EMAIL: 'recoverEmail',
  RESET_PASSWORD: 'resetPassword',
  REVERT_SECOND_FACTOR_ADDITION: 'revertSecondFactorAddition',
  SELECT: 'select',
  SIGN_IN: 'signIn',
  VERIFY_AND_CHANGE_EMAIL: 'verifyAndChangeEmail',
  VERIFY_EMAIL: 'verifyEmail',
};

/**
 * FirebaseUI supported providers in sign in option.
 * @const {!Array<string>}
 */
const UI_SUPPORTED_PROVIDERS = ['anonymous'];

/**
 * @const @type {!Array<string>} List of blacklisted reCAPTCHA parameter
 *     keys.
 */
const BLACKLISTED_RECAPTCHA_KEYS = [
  'sitekey', 'tabindex', 'callback', 'expired-callback'];

exports = Config;
