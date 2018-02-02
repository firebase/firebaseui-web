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
 * @fileoverview Fake accountchooser.com client for testing.
 */

goog.module('firebaseui.auth.testing.FakeAcClient');
goog.module.declareLegacyNamespace();
goog.setTestOnly();

var Account = goog.require('firebaseui.auth.Account');
var Disposable = goog.require('goog.Disposable');
var PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
var acClient = goog.require('firebaseui.auth.acClient');


/**
 * Fake accountchooser.com client class.
 * @constructor
 * @extends {Disposable}
 */
var FakeAcClient = function() {
  this.selectTried_ = false;
  this.skipSelect_ = false;
  this.preSkip_ = null;
  this.available_ = true;
  this.localAccounts_ = null;
  this.acResult_ = null;
  this.initialized_ = false;
  this.callbackUrl_ = null;
  this.onEmptyResponse_ = null;
};
goog.inherits(FakeAcClient, Disposable);


/**
 * Installs the fake accountchooser.com client.
 * @return {!FakeAcClient} The fake accountchooser.com
 *     client.
 */
FakeAcClient.prototype.install = function() {
  var r = this.replacer_ = new PropertyReplacer();
  r.set(acClient, 'isInitialized',
      goog.bind(this.isInitialized_, this));
  r.set(acClient, 'init', goog.bind(this.init_, this));
  r.set(
      acClient,
      'trySelectAccount',
      goog.bind(this.trySelectAccount_, this));
  return this;
};


/** Removes the fake accountchooser.com client hooks. */
FakeAcClient.prototype.uninstall = function() {
  this.localAccounts_ = null;
  this.acResult_ = null;
  this.selectTried_ = false;
  this.initialized_ = false;
  this.callbackUrl_ = null;
  this.onEmptyResponse_ = null;
  if (this.replacer_) {
    this.replacer_.reset();
    this.replacer_ = null;
  }
};


/** @override */
FakeAcClient.prototype.disposeInternal = function() {
  this.uninstall();
  FakeAcClient.base(this, 'disposeInternal');
};


/**
 * Sets whether accountchooser.com is available or not.
 * @param {boolean} available Whether accountchooser.com is available.
 */
FakeAcClient.prototype.setAvailability =
    function(available) {
  this.available_ = available;
};


/**
 * Sets whether to skip selecting an account.
 * @param {boolean} skip Whether to skip selecting an account.
 * @param {function()=} opt_preSkip Callback to invoke before onSkip callback.
 */
FakeAcClient.prototype.setSkipSelect = function(skip, opt_preSkip) {
  this.skipSelect_ = skip;
  if (skip) {
    this.preSkip_ = opt_preSkip || null;
  }
};


/**
 * Sets the response from accountchooser.com to a selected account.
 * @param {!Account} account The selected account.
 */
FakeAcClient.prototype.setSelectedAccount =
    function(account) {
  this.acResult_ = account;
};


/** Sets the response from accountchooser.com as add account. */
FakeAcClient.prototype.setAddAccount = function() {
  this.acResult_ = 'Add account';
};


/**
 * @see firebaseui.auth.acClient.isInitialized
 * @return {boolean} Whether accountchooser.com API client is initialized.
 * @private
 */
FakeAcClient.prototype.isInitialized_ = function() {
  return this.initialized_;
};


/**
 * Simulates when accountchooser.com is initially called and an empty response
 * is returned.
 */
FakeAcClient.prototype.forceOnEmpty = function() {
  if (this.onEmptyResponse_) {
    this.onEmptyResponse_();
  }
};


/**
 * @see firebaseui.auth.acClient.init
 * @private
 */
FakeAcClient.prototype.init_ = function(
    opt_onEmptyResponse,
    opt_onAccountSelected,
    opt_onAddAccount,
    opt_providers,
    opt_language,
    opt_uiConfig) {
  this.onEmptyResponse_ = opt_onEmptyResponse;
  this.initialized_ = true;
  if (this.acResult_ == null) {
    opt_onEmptyResponse();
  } else if (this.acResult_ instanceof Account) {
    opt_onAccountSelected(
        /** @type {!Account} */(this.acResult_));
  } else if (this.acResult_ == 'Add account') {
    opt_onAddAccount(this.available_);
  } else {
    throw new Error('unknown accountchooser result.');
  }
};


/**
 * @see firebaseui.auth.acClient.trySelectAccount
 * @private
 */
FakeAcClient.prototype.trySelectAccount_ = function(
    onSkipSelect, opt_localAccounts, opt_callbackUrl) {
  this.selectTried_ = true;
  this.localAccounts_ = opt_localAccounts;
  this.callbackUrl_ = opt_callbackUrl;
  if (this.skipSelect_) {
    if (this.preSkip_) {
      this.preSkip_();
    }
    onSkipSelect(this.available_);
  }
};


/**
 * Asserts the client has tried to select an account from accountchooser.com.
 * @param {?Array<!Account>=} opt_localAccounts Local account
 *     list.
 * @param {string=} opt_callbackUrl The URL to return to when the flow finishes.
 *     The default is current URL.
 */
FakeAcClient.prototype.assertTrySelectAccount =
    function(opt_localAccounts, opt_callbackUrl) {
  assertTrue(this.selectTried_);
  if (opt_localAccounts) {
    assertArrayEquals(opt_localAccounts, this.localAccounts_);
  } else {
    assertTrue(this.localAccounts_ == null);
  }
  if (opt_callbackUrl) {
    assertEquals(opt_callbackUrl, this.callbackUrl_);
  } else {
    assertTrue(this.callbackUrl_ == null);
  }
};

exports = FakeAcClient;
