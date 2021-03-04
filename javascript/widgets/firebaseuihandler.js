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

/**
 * @fileoverview The authentication handler that implements the interface used
 * for IAP integration.
 */

goog.module('firebaseui.auth.FirebaseUiHandler');
goog.module.declareLegacyNamespace();

const AuthUI = goog.require('firebaseui.auth.AuthUI');
const Base = goog.require('firebaseui.auth.ui.page.Base');
const Config = goog.requireType('firebaseui.auth.Config');
const GoogPromise = goog.require('goog.Promise');
const ProviderMatchByEmail = goog.require('firebaseui.auth.ui.page.ProviderMatchByEmail');
const RecoverableError = goog.require('firebaseui.auth.ui.page.RecoverableError');
const SelectTenant = goog.require('firebaseui.auth.ui.page.SelectTenant');
const SignOut = goog.require('firebaseui.auth.ui.page.SignOut');
const Spinner = goog.require('firebaseui.auth.ui.page.Spinner');
const UiHandlerConfig = goog.require('firebaseui.auth.widget.UiHandlerConfig');
const dom = goog.require('goog.dom');
const element = goog.require('firebaseui.auth.ui.element');
const strings = goog.require('firebaseui.auth.soy2.strings');
const util = goog.require('firebaseui.auth.util');

/**
 * The interface that represents the Authentication Handler.
 * @interface
 */
class AuthenticationHandler {
  /**
   * Selects a tenant from the given tenant IDs. Returns the tenant ID of the
   * selected tenant and the underlying matching providers.
   * @param {!ProjectConfig} projectConfig The config object used to identify
   *     the project.
   * @param {!Array<string>} tenantIds The IDs of the tenants to select from.
   * @return {!GoogPromise<!SelectedTenantInfo>} The selected tenant and
   *     providers enabled for the tenant.
   */
  selectTenant(projectConfig, tenantIds) {}

  /**
   * Returns the Auth instance for the corresponding project/tenant pair.
   * @param {string} apiKey The API key.
   * @param {?string} tenantId The tenant ID, null for top-level project flow.
   * @return {!firebase.auth.Auth} The Auth instance for the given API key and
   *     tenant ID.
   */
  getAuth(apiKey, tenantId) {}

  /**
   * Starts sign in with the corresponding Auth instance. The sign in options
   * used are based on auth.tenantId.
   * @param {!firebase.auth.Auth} auth The Auth instance.
   * @param {!SelectedTenantInfo=} tenantInfo The optional selected tenant and
   *     the matching providers.
   * @return {!GoogPromise<!firebase.auth.UserCredential>}
   */
  startSignIn(auth, tenantInfo) {}

  /**
   * Renders the UI after user is signed out.
   * @return {!GoogPromise<void>}
   */
  completeSignOut() {}

  /**
   * Renders progress bar in the container if hidden.
   */
  showProgressBar() {}

  /**
   * Hides progress bar if visible.
   */
  hideProgressBar() {}

  /**
   * Displays the error message to the end users and provides tha ability to
   * retry for recoverable error.
   * @param {!Error|!CIAPError|!CIAPRetryError} error The error from CIAP.
   */
  handleError(error) {}

  /**
   * Handles additional processing on the user if callback is provided by the
   * developer.
   * @param {!firebase.User} user The signed in user to be processed.
   * @return {!GoogPromise<!firebase.User>} A promise that resolves when the
   *     processing is finished.
   */
  processUser(user) {}
}


/**
 * The CIAP Error interface. If the error is recoverable, it will have a retry
 * callback on the object.
 * @interface
 */
class CIAPError {
  constructor() {
    /**
     * The short error code.
     * @type {string}
     */
    this.code;
    /**
     * The human-readable error message.
     * @type {string}
     */
    this.message;
    /**
     * The HTTP error code number.
     * @type {number|undefined}
     */
    this.httpErrorCode;
    /**
     * The underlying reason error if available.
     * @type {!Error|undefined}
     */
    this.reason;
  }

  /**
   * Returns a JSON-serializable representation of the error.
   * @return {!Object} The plain object representation of the error.
   */
  toJSON() {}
}


/**
 * The CIAP recoverable error interface.
 * @extends {CIAPError}
 * @interface
 */
class CIAPRetryError {
  /**
   * The retry callback to recover from error.
   * @return {!Promise<void>} A promise that resolves on retry completion.
   */
  retry() {}
}


/**
 * Initializes an CIAP AuthenticationHandler with the Auth configuration and
 * UI configurations provided.
 * @implements {AuthenticationHandler}
 */
class FirebaseUiHandler {
  /**
   * @param {string|!Element} element The container element or the query
   *     selector.
   * @param {!Object<string,!CIAPHandlerConfig>} configs The
   *     configuration of the handler keyed by API key.
   */
  constructor(element, configs) {
    /** @private {!Element} The container element. */
    this.container_ = util.getElement(element);
    /**
     * @private {!Object<string, !UiHandlerConfig>} The configuration of the
     *     UI handler keyed by API keys.
     */
    this.configs_ = {};
    Object.keys(configs).forEach((apiKey) => {
      this.configs_[apiKey] = new UiHandlerConfig(configs[apiKey]);
    });
    /** @private {?AuthUI} The FirebaseUI instance if available. */
    this.ui_ = null;
    /**
     * @private {?firebase.auth.Auth} The Auth instance used to sign in with.
     *     This is used to keep track of the API key being used, which is
     *     needed for multi-project support.
     */
    this.signedInAuth_ = null;
    /** @private {?Spinner} The progress bar component. */
    this.progressBar_ = null;
    /** @private {?number} The ID of show progress bar timeout. */
    this.showProcessingTimeout_ = null;
    /** @private {?Base} The current UI component. */
    this.currentComponent_ = null;
    /** @private {?string} The handler's language code. */
    this.languageCode_ = null;
    Object.defineProperty(
        /** @type {!Object} */ (this),
        'languageCode',
        {
          /**
           * @return {?string} The current language code.
           * @this {!Object}
           */
          get() {
            return this.languageCode_;
          },
          /**
           * @param {?string} value The new language code.
           * @this {!Object}
           */
          set(value) {
            this.languageCode_ = value || null;
          },
          enumerable: false,
        });
  }

  /**
   * Selects a tenant from the given tenant IDs. Returns the tenant ID of the
   * selected tenant and the underlying matching providers.
   * @param {!ProjectConfig} projectConfig The config object used to identify
   *     the project.
   * @param {!Array<string>} tenantIds The IDs of the tenants to select from.
   * @return {!GoogPromise<!SelectedTenantInfo>} The selected tenant and
   *     providers enabled for the tenant.
   */
  selectTenant(projectConfig, tenantIds) {
    this.disposeCurrentComponent_();
    const apiKey = projectConfig['apiKey'];
    return new GoogPromise((resolve, reject) => {
      if (!this.configs_.hasOwnProperty(apiKey)) {
        const error =
            new Error('Invalid project configuration: API key is invalid!');
        // Add error code for localization.
        error['code'] = 'invalid-configuration';
        this.handleError(error);
        reject(error);
        return;
      }
      const selectTenantUiHidden =
          this.configs_[apiKey].getSelectTenantUiHiddenCallback();
      // Option first flow.
      if (this.configs_[apiKey].getDisplayMode() ===
          UiHandlerConfig.DisplayMode.OPTION_FIRST) {
        // Get the button configurations based on the given tenant IDs.
        const tenantButtonConfigs = [];
        tenantIds.forEach((tenantId) => {
          const buttonConfig =
              this.configs_[apiKey].getSelectionButtonConfigForTenant(
                  tenantId || UiHandlerConfig.ConfigKeys.TOP_LEVEL_CONFIG_KEY);
          if (buttonConfig) {
            tenantButtonConfigs.push(buttonConfig);
          }
        });
        // Resolver to return the SelectedTenantInfo based on the tenantId.
        const resolveWithTenantInfo = (tenantId) => {
          const selectedTenantInfo = {
            'tenantId': tenantId,
            'providerIds':
                this.configs_[apiKey].getProvidersForTenant(
                    tenantId ||
                    UiHandlerConfig.ConfigKeys.TOP_LEVEL_CONFIG_KEY),
          };
          resolve(selectedTenantInfo);
        };
        // If only one tenant is available, do not show the select tenant page.
        // Resolve with the only tenant and return immediately.
        if (tenantButtonConfigs.length === 1) {
          const tenantId = tenantButtonConfigs[0].tenantId;
          resolveWithTenantInfo(tenantId);
          return;
        } else {
          const onTenantClick = (tenantId) => {
            this.disposeCurrentComponent_();
            // Trigger the selectTenantUiHidden callback.
            if (selectTenantUiHidden) {
              selectTenantUiHidden();
            }
            resolveWithTenantInfo(tenantId);
          };
          this.currentComponent_ =
              new SelectTenant(onTenantClick, tenantButtonConfigs,
                               this.configs_[apiKey].getTosUrl(),
                               this.configs_[apiKey].getPrivacyPolicyUrl());
        }
      } else {
        // Identifier first flow.
        const onEmailEnter = () => {
          const email = this.currentComponent_.checkAndGetEmail();
          if (!email) {
            return;
          }
          for (let i = 0; i < tenantIds.length; i++) {
            const providers =
                this.configs_[apiKey].getProvidersForTenant(
                    tenantIds[i] ||
                    UiHandlerConfig.ConfigKeys.TOP_LEVEL_CONFIG_KEY,
                    email);
            // Resolve with the first matching tenant with available providers.
            if (providers.length !== 0) {
              const selectedTenantInfo = {
                'tenantId': tenantIds[i],
                'providerIds': providers,
                'email': email,
              };
              this.disposeCurrentComponent_();
              // Trigger the selectTenantUiHidden callback.
              if (selectTenantUiHidden) {
                selectTenantUiHidden();
              }
              resolve(selectedTenantInfo);
              return;
            }
          }
          // If no matching tenant found, show error message in info bar.
          this.currentComponent_.showInfoBar(
              getLocalizedErrorMessage('no-matching-tenant-for-email'));
        };
        this.currentComponent_ = new ProviderMatchByEmail(
            onEmailEnter,
            this.configs_[apiKey].getTosUrl(),
            this.configs_[apiKey].getPrivacyPolicyUrl());
      }
      this.currentComponent_.render(this.container_);
      // Trigger the selectTenantUiShown callback.
      const selectTenantUiShown =
          this.configs_[apiKey].getSelectTenantUiShownCallback();
      if (selectTenantUiShown) {
        selectTenantUiShown();
      }
    });
  }

  /**
   * Returns the Auth instance for the corresponding project/tenant pair.
   * @param {string} apiKey The API key.
   * @param {?string} tenantId The tenant ID, null for top-level project flow.
   * @return {!firebase.auth.Auth} The Auth instance for the given API key and
   *     tenant ID.
   * @override
   */
  getAuth(apiKey, tenantId) {
    if (!this.configs_.hasOwnProperty(apiKey)) {
      throw new Error('Invalid project configuration: API key is invalid!');
    }
    // The name of the firebase app. For tenant flow, use tenant ID, for
    // top-level project flow, use the default name "[DEFAULT]".
    const appName = tenantId || undefined;
    // Validates that the UI configuration is available. If tenant ID is null,
    // the top-level project UI configuration key TOP_LEVEL_CONFIG_KEY should
    // be available.
    this.configs_[apiKey].validateTenantId(
        tenantId || UiHandlerConfig.ConfigKeys.TOP_LEVEL_CONFIG_KEY);
    try {
      this.signedInAuth_ = firebase.app(appName).auth();
    } catch (e) {
      const options = {
        'apiKey': apiKey,
        'authDomain': this.configs_[apiKey].getAuthDomain(),
      };
      const app = firebase.initializeApp(options, appName);
      app.auth()['tenantId'] = tenantId;
      this.signedInAuth_ = app.auth();
    }
    return this.signedInAuth_;
  }

  /**
   * Starts sign in with the corresponding Auth instance. The sign in options
   * used are based on auth.tenantId.
   * @param {!firebase.auth.Auth} auth The Auth instance.
   * @param {!SelectedTenantInfo=} tenantInfo The optional selected tenant and
   *     the matching providers.
   * @return {!GoogPromise<!firebase.auth.UserCredential>}
   * @override
   */
  startSignIn(auth, tenantInfo = undefined) {
    return new GoogPromise((resolve, reject) => {
      const apiKey = auth['app']['options']['apiKey'];
      if (!this.configs_.hasOwnProperty(apiKey)) {
        reject(
            new Error('Invalid project configuration: API key is invalid!'));
      }
      const signInConfig =
          this.configs_[apiKey].getSignInConfigForTenant(
              auth['tenantId'] ||
              UiHandlerConfig.ConfigKeys.TOP_LEVEL_CONFIG_KEY,
              tenantInfo && tenantInfo['providerIds']);
      this.disposeCurrentComponent_();
      // Passes the sign-in related callbacks to FirebaseUI.
      const signInCallbacks = {};
      signInCallbacks['signInSuccessWithAuthResult'] = (userCredential) => {
        resolve(userCredential);
        return false;
      };
      const signInUiShownCallback =
          this.configs_[apiKey].getSignInUiShownCallback();
      let uiShown = false;
      signInCallbacks['uiChanged'] = (fromPageId, toPageId) => {
        // Processing redirect result.
        if (fromPageId === null && toPageId === 'callback') {
          // Hide callback page if available.
          const callbackElement = dom.getElementByClass(
              'firebaseui-id-page-callback', this.container_);
          if (callbackElement) {
            element.hide(callbackElement);
          }
          // Show spinner. This will trigger null -> spinner uiChanged.
          this.progressBar_ = new Spinner();
          this.progressBar_.render(this.container_);
        } else if (!uiShown &&
                   !(fromPageId === null && toPageId === 'spinner') &&
                   // Do not trigger callback for immediate federated redirect
                   // to IdP page.
                   (toPageId !== 'blank')) {
          // Remove spinner if still showing.
          if (this.progressBar_) {
            this.progressBar_.dispose();
            this.progressBar_ = null;
          }
          // Trigger the signInUiShown callback. This should be triggered once.
          uiShown = true;
          if (signInUiShownCallback) {
             signInUiShownCallback(auth['tenantId']);
          }
        }
      };
      signInConfig['callbacks'] = signInCallbacks;
      // Do not support `credentialHelper` for sign-in flow.
      signInConfig['credentialHelper'] = 'none';
      let signInHint;
      if (tenantInfo && tenantInfo['email']) {
        signInHint = {
          'emailHint': tenantInfo['email'],
        };
      }
      const startAuthUi = (signInConfig, signInHint) => {
        this.ui_ = new AuthUI(auth);
        this.ui_.startWithSignInHint(this.container_, signInConfig, signInHint);
      };
      // If the AuthUI instance is not null, delete it before re-initialization.
      if (this.ui_) {
        this.ui_.delete().then(() => {
          startAuthUi(signInConfig, signInHint);
        });
      } else {
        startAuthUi(signInConfig, signInHint);
      }
    });
  }

  /**
   * Resets the FirebaseUI handler and deletes the underlying FirebaseUI
   * instance. Calling startSignIn after reset should rerender the UI
   * successfully.
   * @return {!GoogPromise<void>} The promise that resolves when the instance is
   *     successfully reset.
   */
  reset() {
    return GoogPromise.resolve().then(() => {
      if (this.ui_) {
        this.ui_.delete();
      }
    }).then(() => {
      this.ui_ = null;
      this.disposeCurrentComponent_();
    });
  }

  /**
   * Returns the current FirebaseUI instance used for sign-in if available.
   * @return {?AuthUI}
   */
  getCurrentAuthUI() {
    return this.ui_;
  }

  /**
   * Renders progress bar in the container if hidden.
   * @override
   */
  showProgressBar() {
    if (this.progressBar_ || this.showProcessingTimeout_) {
      return;
    }
    this.showProcessingTimeout_ = window.setTimeout(() => {
      this.disposeCurrentComponent_();
      this.progressBar_ = new Spinner();
      this.currentComponent_ = this.progressBar_;
      this.progressBar_.render(this.container_);
      this.showProcessingTimeout_ = null;
    }, SHOW_PROCESSING_DELAY);
  }

  /**
   * Hides progress bar if visible.
   * @override
   */
  hideProgressBar() {
    window.clearTimeout(this.showProcessingTimeout_);
    this.showProcessingTimeout_ = null;
    if (this.progressBar_) {
      this.progressBar_.dispose();
      this.progressBar_ = null;
    }
  }

  /**
   * Renders the UI after user is signed out.
   * @return {!GoogPromise<void>}
   * @override
   */
  completeSignOut() {
    this.disposeCurrentComponent_();
    this.currentComponent_ = new SignOut();
    this.currentComponent_.render(this.container_);
    return GoogPromise.resolve();
  }

  /**
   * Removes the rendered UI component from display.
   * @private
   */
  disposeCurrentComponent_() {
    if (this.ui_) {
      this.ui_.reset();
    }
    this.hideProgressBar();
    if (this.currentComponent_) {
      this.currentComponent_.dispose();
    }
  }

  /**
   * Displays the error message to the end users and provides the ability to
   * retry for recoverable error.
   * @param {!Error|!CIAPError|!CIAPRetryError} error The error from CIAP.
   * @override @suppress {checkTypes} Suppress [] access error for now, will
   *     need to define CIAPError extern so that dot access will not be renamed.
   */
  handleError(error) {
    const message = getLocalizedErrorMessage(error['code']) || error['message'];
    this.disposeCurrentComponent_();
    let onRetryClick;
    if (error['retry'] && typeof error['retry'] === 'function') {
      onRetryClick = () => {
        this.reset();
        error['retry']();
      };
    }
    this.currentComponent_ =
        new RecoverableError(message, onRetryClick);
    this.currentComponent_.render(this.container_);
  }

  /**
   * Handles additional processing on the user if callback is provided by the
   * developer.
   * @param {!firebase.User} user The signed in user to be processed.
   * @return {!GoogPromise<!firebase.User>} A promise that resolves when the
   *     processing is finished.
   * @override
   */
  processUser(user) {
    return GoogPromise.resolve().then(() => {
      const apiKey = this.signedInAuth_ &&
        this.signedInAuth_['app']['options']['apiKey'];
      if (!this.configs_.hasOwnProperty(apiKey)) {
        throw new Error('Invalid project configuration: API key is invalid!');
      }
      this.configs_[apiKey].validateTenantId(
          user['tenantId'] || UiHandlerConfig.ConfigKeys.TOP_LEVEL_CONFIG_KEY);
      if (!this.signedInAuth_['currentUser'] ||
          (this.signedInAuth_['currentUser']['uid'] !== user['uid'])) {
        throw new Error(
            'The user being processed does not match the signed in user!');
      }
      const beforeSignInSuccessCallback =
          this.configs_[apiKey].getBeforeSignInSuccessCallback();
      return beforeSignInSuccessCallback ?
          beforeSignInSuccessCallback(user) : user;
    }).then((processedUser) => {
      // Checks that the user returned in callback has to be same as the
      // original one.
      if (processedUser['uid'] !== user['uid']) {
        throw new Error('User with mismatching UID returned.');
      }
      return processedUser;
    });
  }
}

/**
 * Returns the user-facing localized error message from the given error code.
 * Returns empty string if no error message is available for the given code.
 * @param {string} code The error code.
 * @return {string} The localized user-facing error message.
 */
function getLocalizedErrorMessage(code) {
  return strings.errorCIAP({code: code}).toString();
}

/**
 * The project level configuration object.
 * authDomain: The Auth domain.
 * tenants: The tenant level configuations keyed by tenant ID or '_' for
 *     top-level project config.
 * @typedef {{
 *   authDomain: string,
 *   tenants: !Object<string, !Config>
 * }}
 */
let CIAPHandlerConfig;

/**
 * The object used to identify the project.
 * projectId: The project ID.
 * apiKey: The API key.
 * @typedef {{
 *   projectId: string,
 *   apiKey: string,
 * }}
 */
let ProjectConfig;

/**
 * The matching tenant and providers enabled for the tenant.
 * email: The email being used to select the tenant.
 * tenantId: The ID of the tenant being selected.
 * providerIds: The providers available for the tenant.
 * @typedef {{
 *   email: (string|undefined),
 *   tenantId: ?string,
 *   providerIds: !Array<string>,
 * }}
 */
let SelectedTenantInfo;

/**
 * @const {number} The delay, in milliseconds, before the progress bar
 *     is shown.
 */
const SHOW_PROCESSING_DELAY = 500;

exports = FirebaseUiHandler;
