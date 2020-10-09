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
goog.require('firebaseui.auth.RedirectStatus');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.util');
goog.require('goog.net.cookies');
goog.require('goog.object');
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
var mockCookieStorage = {};
var firebase = firebase || {};


function setUp() {
  mockCookieStorage = {};
  goog.storage.mechanism.mechanismfactory.createHTML5LocalStorage(
      firebaseui.auth.storage.NAMESPACE_).clear();
  goog.storage.mechanism.mechanismfactory.createHTML5SessionStorage(
      firebaseui.auth.storage.NAMESPACE_).clear();
  // Mock credential.
  firebase['auth'] = firebase['auth'] || {
    'AuthCredential': {
      'fromJSON': function(json) {
        return createMockCredential(json);
      }
    }
  };
}


function tearDown() {
  stubs.reset();
}


/**
 * Stubs the cookie setter/getter/remover and asserts the expected cookie config
 * is passed on each call.
 * @param {*} maxAge  The max age in seconds (from now). Use -1 to
 *     set a session cookie. If not provided, the default is -1
 *     (i.e. set a session cookie).
 * @param {*} path  The path of the cookie. If not present then this
 *     uses the full request path.
 * @param {*} domain  The domain of the cookie, or null to not
 *     specify a domain attribute (browser will use the full request host name).
 *     If not provided, the default is null (i.e. let browser use full request
 *     host name).
 * @param {*} secure Whether the cookie should only be sent over
 *     a secure channel.
 */
function initializeCookieStorageMock(maxAge, path, domain, secure) {
  // Initialize cookie storage mock.
  mockCookieStorage = {};
  stubs.replace(
      goog.net.cookies,
      'set',
      function(key, value, actualMaxAge, actualPath,
              actualDomain, actualSecure) {
        assertEquals(maxAge, actualMaxAge);
        assertEquals(path, actualPath);
        assertEquals(domain, actualDomain);
        assertEquals(secure, actualSecure);
        mockCookieStorage[key] = value;
      });
  stubs.replace(
      goog.net.cookies,
      'get',
      function(key) {
        return mockCookieStorage[key];
      });
  stubs.replace(
      goog.net.cookies,
      'remove',
      function(key, actualPath, actualDomain) {
        assertEquals(path, actualPath);
        assertEquals(domain, actualDomain);
        delete mockCookieStorage[key];
      });
}


/**
 * Returns a mock credential object with toJSON method.
 * @param {!Object} credentialObject
 * @return {!Object} The fake Auth credential.
 */
function createMockCredential(credentialObject) {
  var copy = goog.object.clone(credentialObject);
   goog.object.extend(credentialObject, {
     'toJSON': function() {
       return copy;
     }
   });
   return credentialObject;
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


function testGetSetRemoveEmailPendingCredential_withAppId() {
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(appId));
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(appId2));

  var cred = createMockCredential({
    'providerId': 'google.com',
    'idToken': 'ID_TOKEN'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      'user@example.com', cred);
  var cred2 = createMockCredential({
    'providerId': 'facebook.com',
    'accessToken': 'ACCESS_TOKEN'
  });
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



function testGetSetRemoveRedirectStatus() {
  assertFalse(firebaseui.auth.storage.hasRedirectStatus());
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(appId));

  var redirectStatus1 = new firebaseui.auth.RedirectStatus();
  var redirectStatus2 = new firebaseui.auth.RedirectStatus('TENANT_ID');
  firebaseui.auth.storage.setRedirectStatus(redirectStatus1);
  firebaseui.auth.storage.setRedirectStatus(redirectStatus2, appId);
  assertTrue(firebaseui.auth.storage.hasRedirectStatus());
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(appId));
  assertObjectEquals(
      redirectStatus1,
      firebaseui.auth.storage.getRedirectStatus());
  assertObjectEquals(
      redirectStatus2,
      firebaseui.auth.storage.getRedirectStatus(appId));

  firebaseui.auth.storage.removeRedirectStatus();
  assertFalse(firebaseui.auth.storage.hasRedirectStatus());
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(appId));
  firebaseui.auth.storage.removeRedirectStatus(appId);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(appId));
}


function testGetSetRemoveEmailForSignIn_withAppId() {
  initializeCookieStorageMock(3600, '/', null, false);
  assertFalse(firebaseui.auth.storage.hasEmailForSignIn(appId));
  assertFalse(firebaseui.auth.storage.hasEmailForSignIn(appId2));

  var key1 = firebaseui.auth.util.generateRandomAlphaNumericString(32);
  var key2 = firebaseui.auth.util.generateRandomAlphaNumericString(32);
  var email1 = 'user@example.com';
  var email2 = 'user@domain.com';

  firebaseui.auth.storage.setEmailForSignIn(key1, email1, appId);
  firebaseui.auth.storage.setEmailForSignIn(key2, email2, appId2);
  assertTrue(firebaseui.auth.storage.hasEmailForSignIn(appId));
  assertTrue(firebaseui.auth.storage.hasEmailForSignIn(appId2));
  assertEquals(
      email1,
      firebaseui.auth.storage.getEmailForSignIn(key1, appId));
  assertNull(firebaseui.auth.storage.getEmailForSignIn(key2, appId));
  assertEquals(
      email2,
      firebaseui.auth.storage.getEmailForSignIn(key2, appId2));
   assertNull(firebaseui.auth.storage.getEmailForSignIn(key1, appId2));

  firebaseui.auth.storage.removeEmailForSignIn(appId);
  assertFalse(firebaseui.auth.storage.hasEmailForSignIn(appId));
  assertTrue(firebaseui.auth.storage.hasEmailForSignIn(appId2));
  firebaseui.auth.storage.removeEmailForSignIn(appId2);
  assertFalse(firebaseui.auth.storage.hasEmailForSignIn(appId2));
}


function testGetSetRemoveEncryptedPendingCredential_withAppId() {
  initializeCookieStorageMock(3600, '/', null, false);
  assertFalse(firebaseui.auth.storage.hasEncryptedPendingCredential(appId));
  assertFalse(firebaseui.auth.storage.hasEncryptedPendingCredential(appId2));

  var key1 = firebaseui.auth.util.generateRandomAlphaNumericString(32);
  var key2 = firebaseui.auth.util.generateRandomAlphaNumericString(32);
  var cred = createMockCredential({
    'providerId': 'google.com',
    'idToken': 'ID_TOKEN'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      'user@example.com', cred);
  var cred2 = createMockCredential({
    'providerId': 'facebook.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  var pendingEmailCred2 = new firebaseui.auth.PendingEmailCredential(
      'other@example.com', cred2);
  firebaseui.auth.storage.setEncryptedPendingCredential(
      key1, pendingEmailCred, appId);
  firebaseui.auth.storage.setEncryptedPendingCredential(
      key2, pendingEmailCred2, appId2);
  assertTrue(firebaseui.auth.storage.hasEncryptedPendingCredential(appId));
  assertTrue(firebaseui.auth.storage.hasEncryptedPendingCredential(appId2));
  assertObjectEquals(
      pendingEmailCred,
      firebaseui.auth.storage.getEncryptedPendingCredential(key1, appId));
  assertNull(
      firebaseui.auth.storage.getEncryptedPendingCredential(key2, appId));
  assertObjectEquals(
      pendingEmailCred2,
      firebaseui.auth.storage.getEncryptedPendingCredential(key2, appId2));
  assertNull(
      firebaseui.auth.storage.getEncryptedPendingCredential(key1, appId2));

  firebaseui.auth.storage.removeEncryptedPendingCredential(appId);
  assertFalse(firebaseui.auth.storage.hasEncryptedPendingCredential(appId));
  assertTrue(firebaseui.auth.storage.hasEncryptedPendingCredential(appId2));
  firebaseui.auth.storage.removeEncryptedPendingCredential(appId2);
  assertFalse(firebaseui.auth.storage.hasEncryptedPendingCredential(appId2));
}
