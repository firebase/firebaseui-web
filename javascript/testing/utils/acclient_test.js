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
 * @fileoverview Tests for acclient.js.
 */

goog.provide('firebaseui.auth.acClientTest');

goog.require('firebaseui.auth.Account');
goog.require('firebaseui.auth.acClient');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers.ObjectEquals');
goog.require('goog.testing.recordFunction');

goog.setTestOnly('firebaseui.auth.acClientTest');


var mock;
var stubs;


// Fake accountchooser.com API.
var accountchooser = {};
accountchooser.Api = function() {};
accountchooser.Api.init = function() {
  return new accountchooser.Api;
};

var account = new firebaseui.auth.Account('user@example.com');
var acAccount = {
  'email': 'user@example.com',
  'displayName': null,
  'photoUrl': null,
  'providerId': null
};

var onEmpty;
var onAccountSelected;
var onAddAccount;


function setUp() {
  mock = new goog.testing.MockControl();
  stubs = new goog.testing.PropertyReplacer();

  onEmpty = mock.createFunctionMock('onEmpty');
  onAccountSelected = mock.createFunctionMock('onAccountSelected');
  onAddAccount = mock.createFunctionMock('onAddAccount');
  firebaseui.auth.acClient.api_ = null;
}


function tearDown() {
  mock.$tearDown();
  stubs.reset();

  mock = null;
  stubs = null;
}


function testIsUnavailable() {
  // Check unavailable is true when error passed.
  assertTrue(
      firebaseui.auth.acClient.isUnavailable_(
          firebaseui.auth.acClient.DummyApi.UNAVAILABLE_ERROR_));
  // When no error is passed, unavailable is false.
  assertFalse(firebaseui.auth.acClient.isUnavailable_());
}


function testInit() {
  stubs.set(accountchooser.Api, 'init',
      goog.testing.recordFunction(accountchooser.Api.init));

  var providers = ['google.com', 'facebook.com'];
  var language = 'zh-CN';
  var uiConfig = {'favicon': 'http://localhost/favicon.ico'};
  // For select account
  onAccountSelected(new goog.testing.mockmatchers.ObjectEquals(account));
  // For add account and error
  onAddAccount(true).$times(2);

  mock.$replayAll();

  assertFalse(firebaseui.auth.acClient.isInitialized());
  firebaseui.auth.acClient.init(
      onEmpty,
      onAccountSelected,
      onAddAccount,
      providers,
      language,
      uiConfig);

  assertTrue(firebaseui.auth.acClient.isInitialized());
  assertEquals(1, accountchooser.Api.init.getCallCount());
  assertEquals(1, accountchooser.Api.init.getLastCall().getArguments().length);
  assertTrue(firebaseui.auth.acClient.api_ instanceof accountchooser.Api);
  var config = accountchooser.Api.init.getLastCall().getArgument(0);
  assertEquals(onEmpty, config['callbacks']['empty']);
  assertEquals(onEmpty, config['callbacks']['store']);
  assertEquals(onEmpty, config['callbacks']['update']);
  assertEquals(language, config['language']);
  assertEquals(uiConfig, config['ui']);
  assertEquals(providers, config['providers']);
  config['callbacks']['select']({'account': acAccount});
  config['callbacks']['select']({'addAccount': true});
  config['callbacks']['select'](undefined, {'error': 1});

  mock.$verifyAll();
}


function testTrySelectAccount() {
  firebaseui.auth.acClient.api_ = {};
  var callback;
  stubs.set(firebaseui.auth.acClient.api_, 'checkEmpty', function(f) {
    callback = f;
  });
  stubs.set(firebaseui.auth.acClient.api_, 'select', mock.createFunctionMock(
      'select'));
  var config = new goog.testing.mockmatchers.ObjectEquals(
      {'clientCallbackUrl': 'http://localhost'});
  // For not empty
  firebaseui.auth.acClient.api_.select([], config).$times(1);
  // For empty and error
  var onSkipSelect = mock.createFunctionMock('onSkipSelect');
  // isAvailable is true.
  onSkipSelect(true).$times(2);

  mock.$replayAll();

  firebaseui.auth.acClient.trySelectAccount(onSkipSelect, undefined,
      'http://localhost');
  // Not empty
  callback(false);
  // Error
  callback(undefined, {error: 1});
  // Empty
  callback(true);

  mock.$verifyAll();
}


function testTrySelectAccount_localAccounts() {
  firebaseui.auth.acClient.api_ = {};
  var callback;
  stubs.set(firebaseui.auth.acClient.api_, 'checkEmpty', function(f) {
    callback = f;
  });
  stubs.set(firebaseui.auth.acClient.api_, 'select', mock.createFunctionMock(
      'select'));
  var localAccounts = new goog.testing.mockmatchers.ObjectEquals(
      [acAccount]);
  var config = new goog.testing.mockmatchers.ObjectEquals(
      {'clientCallbackUrl': 'http://localhost'});
  // For not empty
  firebaseui.auth.acClient.api_.select(localAccounts, config).$times(1);
  // For empty and error
  var onSkipSelect = mock.createFunctionMock('onSkipSelect');

  mock.$replayAll();

  firebaseui.auth.acClient.trySelectAccount(onSkipSelect, [account],
      'http://localhost');

  mock.$verifyAll();
  assertUndefined(callback);
}


function testTrySelectAccount_notInitialized() {
  assertThrows(function() {
    firebaseui.auth.acClient.trySelectAccount(goog.nullFunction);
  });
}


function testTryStoreAccount_store() {
  firebaseui.auth.acClient.api_ = {};
  var storeCallback;
  stubs.set(firebaseui.auth.acClient.api_, 'checkAccountExist',
      function(account, f) {
    storeCallback = f;
  });
  stubs.set(firebaseui.auth.acClient.api_, 'store', mock.createFunctionMock(
      'store'));
  var updateCallback;
  stubs.set(firebaseui.auth.acClient.api_, 'checkShouldUpdate',
      function(account, f) {
    updateCallback = f;
  });
  stubs.set(firebaseui.auth.acClient.api_, 'update', mock.createFunctionMock(
      'update'));
  var onSkipStore = mock.createFunctionMock('onSkipStore');

  var storeAccounts = new goog.testing.mockmatchers.ObjectEquals(
      [acAccount]);
  var config = new goog.testing.mockmatchers.ObjectEquals(
      {'clientCallbackUrl': 'http://localhost'});

  // For not existing.
  firebaseui.auth.acClient.api_.store(storeAccounts, config).$times(1);
  // For error.
  // isAvailable is true.
  onSkipStore(true).$times(1);

  mock.$replayAll();

  firebaseui.auth.acClient.tryStoreAccount(account, onSkipStore,
      'http://localhost');
  // Not existing and error.
  assertNotUndefined(storeCallback);
  storeCallback(false);
  storeCallback(undefined, {'error': 1});
  // checkShouldUpdate shouldn't be called.
  assertUndefined(updateCallback);

  mock.$verifyAll();
}


function testTryStoreAccount_update() {
  firebaseui.auth.acClient.api_ = {};
  var storeCallback;
  stubs.set(firebaseui.auth.acClient.api_, 'checkAccountExist',
      function(account, f) {
    storeCallback = f;
  });
  stubs.set(firebaseui.auth.acClient.api_, 'store', mock.createFunctionMock(
      'store'));
  var updateCallback;
  stubs.set(firebaseui.auth.acClient.api_, 'checkShouldUpdate',
      function(account, f) {
    updateCallback = f;
  });
  stubs.set(firebaseui.auth.acClient.api_, 'update', mock.createFunctionMock(
      'update'));
  var onSkipStore = mock.createFunctionMock('onSkipStore');

  var updateAccount = new goog.testing.mockmatchers.ObjectEquals(
      acAccount);
  var config = new goog.testing.mockmatchers.ObjectEquals(
      {'clientCallbackUrl': 'http://localhost'});

  // For should update.
  firebaseui.auth.acClient.api_.update(updateAccount, config).$times(1);
  // For error.
  // isAvailable is true.
  onSkipStore(true).$times(1);

  mock.$replayAll();

  firebaseui.auth.acClient.tryStoreAccount(account, onSkipStore,
      'http://localhost');
  // Existing account.
  assertNotUndefined(storeCallback);
  storeCallback(true);
  // checkShouldUpdate should be called.
  assertNotUndefined(updateCallback);
  // Should update and error.
  updateCallback(true);
  updateCallback(undefined, {'error': 1});

  mock.$verifyAll();
}


function testTryStoreAccount_onSkipStore() {
  firebaseui.auth.acClient.api_ = {};
  var storeCallback;
  stubs.set(firebaseui.auth.acClient.api_, 'checkAccountExist',
      function(account, f) {
    storeCallback = f;
  });
  stubs.set(firebaseui.auth.acClient.api_, 'store', mock.createFunctionMock(
      'store'));
  var updateCallback;
  stubs.set(firebaseui.auth.acClient.api_, 'checkShouldUpdate',
      function(account, f) {
    updateCallback = f;
  });
  stubs.set(firebaseui.auth.acClient.api_, 'update', mock.createFunctionMock(
      'update'));
  var onSkipStore = mock.createFunctionMock('onSkipStore');
  // isAvailable is true.
  onSkipStore(true).$times(1);

  mock.$replayAll();

  firebaseui.auth.acClient.tryStoreAccount(account, onSkipStore,
      'http://localhost');
  // Existing account.
  assertNotUndefined(storeCallback);
  storeCallback(true);
  // checkShouldUpdate should be called.
  assertNotUndefined(updateCallback);
  // Shouldn't update.
  updateCallback(false);

  mock.$verifyAll();
}


function testTryStoreAccount_notInitialized() {
  assertThrows(function() {
    firebaseui.auth.acClient.tryStoreAccount(account, goog.nullFunction);
  });
}


function testInit_dummyApi() {
  onEmpty().$times(1);
  mock.$replayAll();
  setUpDummyApi();
  mock.$verifyAll();
}


function testTrySelectAccount_dummyApi() {
  onEmpty().$times(1);
  mock.$replayAll();
  setUpDummyApi();
  mock.$verifyAll();

  mock.$resetAll();
  var onSkip = mock.createFunctionMock('onSkip');
  // Dummy api, accountchooser.com is not available.
  onSkip(false).$times(1);
  mock.$replayAll();
  firebaseui.auth.acClient.trySelectAccount(onSkip);
  mock.$verifyAll();
}


function testTryStoreAccount_dummyApi() {
  onEmpty().$times(1);
  mock.$replayAll();
  setUpDummyApi();
  mock.$verifyAll();

  mock.$resetAll();
  var onSkip = mock.createFunctionMock('onSkip');
  // Dummy api, accountchooser.com is not available.
  onSkip(false).$times(1);
  mock.$replayAll();
  firebaseui.auth.acClient.tryStoreAccount(account, onSkip);
  mock.$verifyAll();
}


function setUpDummyApi() {
  stubs.set(goog.global, 'accountchooser', undefined);
  assertFalse(firebaseui.auth.acClient.isInitialized());
  firebaseui.auth.acClient.init(onEmpty, onAccountSelected, onAddAccount);
  assertTrue(firebaseui.auth.acClient.isInitialized());
}
