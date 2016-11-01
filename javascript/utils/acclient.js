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
 * @fileoverview A wrapper of accountchooser.com APIs.
 */

goog.provide('firebaseui.auth.acClient');

goog.require('firebaseui.auth.Account');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.asserts');


/**
 * @type {accountchooser.Api}
 * @private
 */
firebaseui.auth.acClient.api_ = null;


/**
 * @return {boolean} Whether accountchooser.com API client is initialized.
 */
firebaseui.auth.acClient.isInitialized = function() {
  return !!firebaseui.auth.acClient.api_;
};


/**
 * @param {Object=} opt_error The error returned by the accountchooser.com
 *     client.
 * @return {boolean} Whether accountchooser.com is unavailable (true) or
 *     available (false).
 * @private
 */
firebaseui.auth.acClient.isUnavailable_ = function(opt_error) {
  return !!(opt_error &&
      opt_error['code'] == -32000 &&
      opt_error['message'] == 'Service unavailable');
};


/**
 * Initializes the accountchooser.com API object. Only the first call
 * initializes the client and subsequent calls return immediately.
 *
 * @param {function()=} opt_onEmptyResponse The callback function that is
 *     invoked when there is no response from accountchooser.com.
 * @param {function(firebaseui.auth.Account)=} opt_onAccountSelected The
 *     callback function invoked when an account is selected from
 *     accountchooser.com.
 * @param {function(boolean)=} opt_onAddAccount The callback function invoked
 *     when add account button is clicked in accountchooser.com. A boolean
 *     availability flag is passed. It is true if accountchooser.com is
 *     available, false otherwise.
 * @param {Array<string>=} opt_providers The accepted IdP list.
 * @param {?string=} opt_language The display language for accountchooser.com.
 * @param {Object=} opt_uiConfig The UI configuration for accountchooser.com.
 */
firebaseui.auth.acClient.init = function(
    opt_onEmptyResponse,
    opt_onAccountSelected,
    opt_onAddAccount,
    opt_providers,
    opt_language,
    opt_uiConfig) {
  // Only initialize once.
  if (firebaseui.auth.acClient.isInitialized()) {
    return;
  }

  // Save the add account callback for later use.
  var selectCallback = function(resp, opt_error) {
    if (resp && resp['account'] && opt_onAccountSelected) {
      opt_onAccountSelected(
          firebaseui.auth.Account.fromPlainObject(resp['account']));
    } else if (opt_onAddAccount) {
      // Check if accountchooser.com is available and pass to add account.
      var isUnavailable = firebaseui.auth.acClient.isUnavailable_(opt_error);
      // Either an error happened or user clicked the add account button.
      opt_onAddAccount(!isUnavailable);
    }
  };

  var config = {
    'callbacks': {
      'empty': opt_onEmptyResponse,
      'select': selectCallback,
      // Discard the result of store and update which we don't care. Instead it
      // should act like there is no response, hence the opt_onEmptyResponse.
      'store': opt_onEmptyResponse,
      'update': opt_onEmptyResponse
    },
    'language': opt_language || '',
    'providers': opt_providers,
    'ui': opt_uiConfig
  };
  if (typeof accountchooser != 'undefined' &&
      accountchooser.Api &&
      accountchooser.Api.init) {
    firebaseui.auth.acClient.api_ = accountchooser.Api.init(config);
  } else {
    firebaseui.auth.acClient.api_ = new firebaseui.auth.acClient.DummyApi(
        config);
    firebaseui.auth.acClient.api_.fireOnEmpty();
  }
};


/**
 * Starts the flow to select an account from accountchooser.com.
 * It first checks whether accountchooser.com has accounts. If not,
 * {@code onSkipSelect} is called instead of redirecting to accountchooser.com.
 *
 * @param {function(boolean)} onSkipSelect The callback function invoked when
 *     the account selection can be skipped. A boolean availability flag is
 *     passed. It is true if accountchooser.com is available, false otherwise.
 * @param {Array<firebaseui.auth.Account>} opt_localAccounts The local account
 *     list to pass to accountchooser.com.
 * @param {string=} opt_callbackUrl The URL to return to when the flow finishes.
 *     The default is current URL.
 */
firebaseui.auth.acClient.trySelectAccount = function(
    onSkipSelect, opt_localAccounts, opt_callbackUrl) {
  goog.asserts.assert(firebaseui.auth.acClient.isInitialized());
  var select = function() {
    var callbackUrl =
        goog.Uri.resolve(window.location.href, opt_callbackUrl).toString();
    firebaseui.auth.acClient.api_.select(
        goog.array.map(opt_localAccounts || [], function(account) {
          return account.toPlainObject();
        }),
        {'clientCallbackUrl': callbackUrl});
  };
  if (opt_localAccounts && opt_localAccounts.length) {
    select();
  } else {
    firebaseui.auth.acClient.api_.checkEmpty(function(empty, error) {
      if (!empty && !error) {
        select();
      } else {
        var isUnavailable = firebaseui.auth.acClient.isUnavailable_(error);
        onSkipSelect(!isUnavailable);
      }
    });
  }
};


/**
 * Starts the flow to store or update an account into accountchooser.com.
 * It first checks whether the account needs to be stored or updated. If not,
 * the {@code onSkipStore} is called instead of redirecting to
 * accountchooser.com.
 *
 * @param {firebaseui.auth.Account} account The account to add.
 * @param {function(boolean)} onSkipStore The callback function invoked when the
 *     account storing can be skipped. A boolean availability flag is passed. It
 *     is true if accountchooser.com is available, false otherwise.
 * @param {string=} opt_callbackUrl The URL to return to when the flow finishes.
 *     If not provided, the current one is used.
 */
firebaseui.auth.acClient.tryStoreAccount =
    function(account, onSkipStore, opt_callbackUrl) {
  goog.asserts.assert(firebaseui.auth.acClient.isInitialized());
  var options = {};
  if (opt_callbackUrl) {
    options['clientCallbackUrl'] =
      goog.Uri.resolve(window.location.href, opt_callbackUrl).toString();
  }
  var acAccount = account.toPlainObject();
  firebaseui.auth.acClient.api_.checkAccountExist(acAccount,
      function(exist, error) {
    if (!exist && !error) {
      // It doens't exist in accountchooser.com.
      firebaseui.auth.acClient.api_.store([acAccount], options);
    } else if (!error) {
      // It exists. Check whether we should update it.
      firebaseui.auth.acClient.api_.checkShouldUpdate(
          acAccount,
          function(update, error) {
            if (update) {
              // Should update the account.
              firebaseui.auth.acClient.api_.update(
                  account.toPlainObject(),
                  options);
            } else {
              var isUnavailable = firebaseui.auth.acClient.isUnavailable_(
                  error);
              onSkipStore(!isUnavailable);
            }
          });
    } else {
      var isUnavailable = firebaseui.auth.acClient.isUnavailable_(error);
      onSkipStore(!isUnavailable);
    }
  });
};


/**
 * A dummy accountchooser.com API implmentation which is used if
 * accountchooser.com is not available, for instance, the user agent doesn't
 * support SNI.
 *
 * @param {Object} config The configuration.
 * @constructor
 * @implements {accountchooser.Api}
 */
firebaseui.auth.acClient.DummyApi = function(config) {
  this.config_ = config;
  this.config_['callbacks'] = this.config_['callbacks'] || {};
};


/**
 * Triggers the onEmpty callback.
 */
firebaseui.auth.acClient.DummyApi.prototype.fireOnEmpty = function() {
  if (goog.isFunction(this.config_['callbacks']['empty'])) {
    this.config_['callbacks']['empty']();
  }
};


/**
 * The accountchooser.com service unavailable error.
 * @const {Object}
 * @private
 */
firebaseui.auth.acClient.DummyApi.UNAVAILABLE_ERROR_ = {
  'code': -32000,
  'message': 'Service unavailable',
  'data': 'Service is unavailable.'
};


/**
 * Stores the accounts. The callback is always invoked with a service
 * unavailable error.
 *
 * @param {Array<Object>} accounts The accounts to store.
 * @param {Object=} opt_config The optional client configuration.
 */
firebaseui.auth.acClient.DummyApi.prototype.store =
    function(accounts, opt_config) {
  if (goog.isFunction(this.config_['callbacks']['store'])) {
    this.config_['callbacks']['store'](
        undefined, firebaseui.auth.acClient.DummyApi.UNAVAILABLE_ERROR_);
  }
};


/**
 * Selects account. The callback is always invoked with a service unavailable
 * error.
 *
 * @param {Array<Object>} accounts The local accounts to select.
 * @param {Object=} opt_config The optional client configuration.
 */
firebaseui.auth.acClient.DummyApi.prototype.select =
    function(accounts, opt_config) {
  if (goog.isFunction(this.config_['callbacks']['select'])) {
    this.config_['callbacks']['select'](
        undefined, firebaseui.auth.acClient.DummyApi.UNAVAILABLE_ERROR_);
  }
};


/**
 * Updates the account. The callback is always invoked with a service
 * unavailable error.
 *
 * @param {Object} account The account to update.
 * @param {Object=} opt_config The optional client configuration.
 */
firebaseui.auth.acClient.DummyApi.prototype.update =
    function(account, opt_config) {
  if (goog.isFunction(this.config_['callbacks']['update'])) {
    this.config_['callbacks']['update'](
        undefined, firebaseui.auth.acClient.DummyApi.UNAVAILABLE_ERROR_);
  }
};


/**
 * Checkes if accountchooser.com is disabled. The callback is always invoked
 * with a {@code true}.
 *
 * @param {function(boolean=, Object=)} callback The callback function.
 */
firebaseui.auth.acClient.DummyApi.prototype.checkDisabled = function(callback) {
  callback(true);
};


/**
 * Checkes if the accountchooser.com is empty. The callback is always invoked
 * with a service unavailable error.
 *
 * @param {function(boolean=, Object=)} callback The callback function.
 */
firebaseui.auth.acClient.DummyApi.prototype.checkEmpty = function(callback) {
  callback(undefined, firebaseui.auth.acClient.DummyApi.UNAVAILABLE_ERROR_);
};


/**
 * Checkes if the account is in accountchooser.com. The callback is always
 * invoked with a service unavailable error.
 *
 * @param {Object} account The account to check.
 * @param {function(boolean=, Object=)} callback The callback function.
 */
firebaseui.auth.acClient.DummyApi.prototype.checkAccountExist =
    function(account, callback) {
  callback(undefined, firebaseui.auth.acClient.DummyApi.UNAVAILABLE_ERROR_);
};


/**
 * Checkes if the account should be updated. The callback is always invoked with
 * a service unavailable error.
 *
 * @param {Object} account The account to check.
 * @param {function(boolean=, Object=)} callback The callback function.
 */
firebaseui.auth.acClient.DummyApi.prototype.checkShouldUpdate =
    function(account, callback) {
  callback(undefined, firebaseui.auth.acClient.DummyApi.UNAVAILABLE_ERROR_);
};
