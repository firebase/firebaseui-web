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
 * @fileoverview Tests for storage.js.
 */

goog.provide('firebaseui.auth.storageTest');

goog.require('firebaseui.auth.Account');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.storage.mechanism.HTML5SessionStorage');
goog.require('goog.storage.mechanism.mechanismfactory');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.storageTest');


var account = new firebaseui.auth.Account(
    'user@example.com', 'Test User', 'http://example.com/avatar.jpg');
var account2 = new firebaseui.auth.Account(
    'user2@example.com', 'Test User2', 'http://example.com/avatar2.jpg');
var stubs = new goog.testing.PropertyReplacer();
var appId = 'glowing-heat-3485';
var appId2 = 'flowing-water-9731';


function setUp() {
  goog.storage.mechanism.mechanismfactory.createHTML5LocalStorage(
      firebaseui.auth.storage.NAMESPACE_).clear();
  goog.storage.mechanism.mechanismfactory.createHTML5SessionStorage(
      firebaseui.auth.storage.NAMESPACE_).clear();
}


function tearDown() {
  stubs.reset();
}


function testIsAvailable() {
  // localStorage and sessionStorage available.
  stubs.set(
      goog.storage.mechanism.HTML5LocalStorage.prototype,
      'isAvailable',
      function() {return true;});
  stubs.set(
      goog.storage.mechanism.HTML5SessionStorage.prototype,
      'isAvailable',
      function() {return true;});
  // Storage is available.
  assertTrue(firebaseui.auth.storage.isAvailable());

  // localStorage not available.
  stubs.set(
      goog.storage.mechanism.HTML5LocalStorage.prototype,
      'isAvailable',
      function() {return false;});
  // Storage is not available.
  assertFalse(firebaseui.auth.storage.isAvailable());

  // sessionStorage not available.
  stubs.set(
      goog.storage.mechanism.HTML5LocalStorage.prototype,
      'isAvailable',
      function() {return true;});
  stubs.set(
      goog.storage.mechanism.HTML5SessionStorage.prototype,
      'isAvailable',
      function() {return false;});
  // Storage is not available.
  assertFalse(firebaseui.auth.storage.isAvailable());

  // Both not available.
  stubs.set(
      goog.storage.mechanism.HTML5LocalStorage.prototype,
      'isAvailable',
      function() {return false;});
  // Storage is not available.
  assertFalse(firebaseui.auth.storage.isAvailable());
}


function testGetSetRemoveRedirectUrl() {
  assertFalse(firebaseui.auth.storage.hasRedirectUrl());

  firebaseui.auth.storage.setRedirectUrl('http://www.example.com');
  assertTrue(firebaseui.auth.storage.hasRedirectUrl());
  assertEquals('http://www.example.com',
      firebaseui.auth.storage.getRedirectUrl());

  firebaseui.auth.storage.removeRedirectUrl();
  assertFalse(firebaseui.auth.storage.hasRedirectUrl());
}


function testGetSetRemoveRedirectUrl_withAppId() {
  assertFalse(firebaseui.auth.storage.hasRedirectUrl(appId));
  assertFalse(firebaseui.auth.storage.hasRedirectUrl(appId2));

  firebaseui.auth.storage.setRedirectUrl('http://www.example.com', appId);
  firebaseui.auth.storage.setRedirectUrl('http://www.example2.com', appId2);
  assertTrue(firebaseui.auth.storage.hasRedirectUrl(appId));
  assertTrue(firebaseui.auth.storage.hasRedirectUrl(appId2));
  assertEquals('http://www.example.com', firebaseui.auth.storage.getRedirectUrl(
      appId));
  assertEquals(
      'http://www.example2.com',
      firebaseui.auth.storage.getRedirectUrl(appId2));

  firebaseui.auth.storage.removeRedirectUrl(appId);
  assertFalse(firebaseui.auth.storage.hasRedirectUrl(appId));
  assertTrue(firebaseui.auth.storage.hasRedirectUrl(appId2));
  firebaseui.auth.storage.removeRedirectUrl(appId2);
  assertFalse(firebaseui.auth.storage.hasRedirectUrl(appId2));
}


function testHasIsSetRememberAccount() {
  assertFalse(firebaseui.auth.storage.hasRememberAccount());
  assertFalse(firebaseui.auth.storage.isRememberAccount());

  firebaseui.auth.storage.setRememberAccount(false);
  assertTrue(firebaseui.auth.storage.hasRememberAccount());
  assertFalse(firebaseui.auth.storage.isRememberAccount());

  firebaseui.auth.storage.setRememberAccount(true);
  assertTrue(firebaseui.auth.storage.hasRememberAccount());
  assertTrue(firebaseui.auth.storage.isRememberAccount());
}


function testHasIsSetRememberAccount_withAppId() {
  assertFalse(firebaseui.auth.storage.hasRememberAccount(appId));
  assertFalse(firebaseui.auth.storage.hasRememberAccount(appId2));
  assertFalse(firebaseui.auth.storage.isRememberAccount(appId));
  assertFalse(firebaseui.auth.storage.isRememberAccount(appId2));

  firebaseui.auth.storage.setRememberAccount(false, appId);
  firebaseui.auth.storage.setRememberAccount(true, appId2);
  assertTrue(firebaseui.auth.storage.hasRememberAccount(appId));
  assertTrue(firebaseui.auth.storage.hasRememberAccount(appId2));
  assertFalse(firebaseui.auth.storage.isRememberAccount(appId));
  assertTrue(firebaseui.auth.storage.isRememberAccount(appId2));

  firebaseui.auth.storage.setRememberAccount(true, appId);
  firebaseui.auth.storage.setRememberAccount(false, appId2);
  assertTrue(firebaseui.auth.storage.hasRememberAccount(appId));
  assertTrue(firebaseui.auth.storage.hasRememberAccount(appId2));
  assertTrue(firebaseui.auth.storage.isRememberAccount(appId));
  assertFalse(firebaseui.auth.storage.isRememberAccount(appId2));
}


function testRememberAccountAndGetRemoveRememberedAccounts() {
  assertObjectEquals([], firebaseui.auth.storage.getRememberedAccounts());

  var account1 = new firebaseui.auth.Account('user1@example.com', 'Test User1');
  firebaseui.auth.storage.rememberAccount(account1);
  assertObjectEquals([account1],
      firebaseui.auth.storage.getRememberedAccounts());

  var account2 = new firebaseui.auth.Account('user2@example.com', 'Test User2');
  firebaseui.auth.storage.rememberAccount(account2);
  assertObjectEquals(
      [account2, account1], firebaseui.auth.storage.getRememberedAccounts());

  // Same email as account1 but with a providerId.
  var account3 = new firebaseui.auth.Account(
      'user1@example.com', 'Test User1', null, 'google.com');
  firebaseui.auth.storage.rememberAccount(account3);
  assertObjectEquals(
      [account3, account2, account1],
      firebaseui.auth.storage.getRememberedAccounts());

  // Same as account2 but with a new displayName.
  var account4 = new firebaseui.auth.Account('user2@example.com',
      'New Test User2');
  firebaseui.auth.storage.rememberAccount(account4);
  assertObjectEquals(
      [account4, account3, account1],
      firebaseui.auth.storage.getRememberedAccounts());

  // Re-add account1.
  firebaseui.auth.storage.rememberAccount(account1);
  assertObjectEquals(
      [account1, account4, account3],
      firebaseui.auth.storage.getRememberedAccounts());

  firebaseui.auth.storage.removeRememberedAccounts();
  assertObjectEquals([], firebaseui.auth.storage.getRememberedAccounts());
}


function testRememberAccountAndGetRemoveRememberedAccounts_withAppId() {
  assertObjectEquals([], firebaseui.auth.storage.getRememberedAccounts(appId));
  assertObjectEquals([], firebaseui.auth.storage.getRememberedAccounts(appId2));

  var account1 = new firebaseui.auth.Account('user1@example.com', 'Test User1');
  var account2 = new firebaseui.auth.Account('user2@example.com', 'Test User2');
  var account3 = new firebaseui.auth.Account(
      'user3@example.com', 'Test User3', null, 'google.com');
  var account4 = new firebaseui.auth.Account('user4@example.com',
      'New Test User4');
  firebaseui.auth.storage.rememberAccount(account1, appId);
  assertObjectEquals([account1], firebaseui.auth.storage.getRememberedAccounts(
      appId));

  firebaseui.auth.storage.rememberAccount(account2, appId);
  assertObjectEquals(
      [account2, account1],
      firebaseui.auth.storage.getRememberedAccounts(appId));

  firebaseui.auth.storage.rememberAccount(account3, appId2);
  assertObjectEquals(
      [account3],
      firebaseui.auth.storage.getRememberedAccounts(appId2));

  firebaseui.auth.storage.rememberAccount(account4, appId2);
  assertObjectEquals(
      [account4, account3],
      firebaseui.auth.storage.getRememberedAccounts(appId2));

  // Re-add account1.
  firebaseui.auth.storage.rememberAccount(account1, appId);
  assertObjectEquals(
      [account1, account2],
      firebaseui.auth.storage.getRememberedAccounts(appId));

  firebaseui.auth.storage.removeRememberedAccounts(appId);
  assertObjectEquals([], firebaseui.auth.storage.getRememberedAccounts(appId));
  assertObjectEquals(
      [account4, account3],
      firebaseui.auth.storage.getRememberedAccounts(appId2));
  firebaseui.auth.storage.removeRememberedAccounts(appId2);
  assertObjectEquals([], firebaseui.auth.storage.getRememberedAccounts(appId2));
}


function testGetSetRemoveEmailPendingCredential_withAppId() {
  // Just pass the credential object through for the test.
  stubs.replace(
      firebaseui.auth.idp,
      'getAuthCredential',
      function(obj) {return obj;});
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(appId));
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(appId2));

  var cred = {
    'providerId': 'google.com',
    'idToken': 'ID_TOKEN'
  };
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      'user@example.com', cred);
  var cred2 = {
    'providerId': 'facebook.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  var pendingEmailCred2 = new firebaseui.auth.PendingEmailCredential(
      'other@example.com', cred2);
  firebaseui.auth.storage.setPendingEmailCredential(pendingEmailCred, appId);
  firebaseui.auth.storage.setPendingEmailCredential(pendingEmailCred2, appId2);
  assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(appId));
  assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(appId2));
  assertObjectEquals(
      pendingEmailCred,
      firebaseui.auth.storage.getPendingEmailCredential(appId));
  assertObjectEquals(
      pendingEmailCred2,
      firebaseui.auth.storage.getPendingEmailCredential(appId2));

  firebaseui.auth.storage.removePendingEmailCredential(appId);
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(appId));
  assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(appId2));
  firebaseui.auth.storage.removePendingEmailCredential(appId2);
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(appId2));
}


function testGetSetRemovePendingRedirectStatus() {
  assertFalse(firebaseui.auth.storage.hasPendingRedirectStatus());

  firebaseui.auth.storage.setPendingRedirectStatus();
  assertTrue(firebaseui.auth.storage.hasPendingRedirectStatus());

  firebaseui.auth.storage.removePendingRedirectStatus();
  assertFalse(firebaseui.auth.storage.hasPendingRedirectStatus());
}


function testGetSetRemovePendingRedirectStatus_withAppId() {
  assertFalse(firebaseui.auth.storage.hasPendingRedirectStatus(appId));
  assertFalse(firebaseui.auth.storage.hasPendingRedirectStatus(appId2));

  firebaseui.auth.storage.setPendingRedirectStatus(appId);
  firebaseui.auth.storage.setPendingRedirectStatus(appId2);
  assertTrue(firebaseui.auth.storage.hasPendingRedirectStatus(appId));
  assertTrue(firebaseui.auth.storage.hasPendingRedirectStatus(appId2));

  firebaseui.auth.storage.removePendingRedirectStatus(appId);
  assertFalse(firebaseui.auth.storage.hasPendingRedirectStatus(appId));
  assertTrue(firebaseui.auth.storage.hasPendingRedirectStatus(appId2));
  firebaseui.auth.storage.removePendingRedirectStatus(appId2);
  assertFalse(firebaseui.auth.storage.hasPendingRedirectStatus(appId2));
}
