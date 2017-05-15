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
 * @fileoverview Tests for idp.js.
 */

goog.provide('firebaseui.auth.idpTest');

goog.require('firebaseui.auth.idp');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

goog.setTestOnly('firebaseui.auth.idpTest');


var firebase = {};


function setUp() {
  // Record all calls to AuthProvider.credential
  firebase.auth = {};
  for (var providerId in firebaseui.auth.idp.AuthProviders) {
    firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]] = {
      'PROVIDER_ID': providerId,
      'credential': goog.testing.recordFunction(function() {
        // Return something.
        return providerId;
      })
    };
  }
}


function tearDown() {
  firebase = {};
}


function testIsSupportedProvider() {
  assertTrue(firebaseui.auth.idp.isSupportedProvider('password'));
  assertTrue(firebaseui.auth.idp.isSupportedProvider('google.com'));
  assertTrue(firebaseui.auth.idp.isSupportedProvider('facebook.com'));
  assertTrue(firebaseui.auth.idp.isSupportedProvider('github.com'));
  assertTrue(firebaseui.auth.idp.isSupportedProvider('twitter.com'));

  assertFalse(firebaseui.auth.idp.isSupportedProvider('Google'));
  assertFalse(firebaseui.auth.idp.isSupportedProvider('google'));
  assertFalse(firebaseui.auth.idp.isSupportedProvider('yahoo.com'));
  assertFalse(firebaseui.auth.idp.isSupportedProvider('foobar'));
}


/**
 * Asserts the credential is initialized with correct OAuth response.
 * @param {!Object} provider The provider object.
 * @param {!Array<string>} oauthParams The OAuth params used to initialize the
 *     credential.
 * @param {!Object} ref The credential reference.
 */
function assertCredential(provider, oauthParams, ref) {
  assertNotNullNorUndefined(ref);
  var parameters = provider.credential.getLastCall().getArguments();
  assertEquals(oauthParams.length, parameters.length);
  // Confirm the expected parameters passed when initializing the credential.
  for (var i = 0; i < parameters.length; i++) {
    assertEquals(oauthParams[i], parameters[i]);
  }
}


function testGetAuthCredential_google() {
  var cred = {
    'providerId': 'google.com',
    'idToken': 'ID_TOKEN',
    'accessToken': 'ACCESS_TOKEN'
  };
  var ref = firebaseui.auth.idp.getAuthCredential(cred);
  assertCredential(
      firebase.auth.GoogleAuthProvider,
      ['ID_TOKEN', 'ACCESS_TOKEN'],
      ref);
}


function testGetAuthCredential_facebook() {
  var cred = {
    'providerId': 'facebook.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  var ref = firebaseui.auth.idp.getAuthCredential(cred);
  assertCredential(
      firebase.auth.FacebookAuthProvider,
      ['ACCESS_TOKEN'],
      ref);
}


function testGetAuthCredential_twitter() {
  var cred = {
    'providerId': 'twitter.com',
    'accessToken': 'ACCESS_TOKEN',
    'secret': 'SECRET'
  };
  var ref = firebaseui.auth.idp.getAuthCredential(cred);
  assertCredential(
      firebase.auth.TwitterAuthProvider,
      ['ACCESS_TOKEN', 'SECRET'],
      ref);
}


function testGetAuthCredential_github() {
  var cred = {
    'providerId': 'github.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  var ref = firebaseui.auth.idp.getAuthCredential(cred);
  assertCredential(
      firebase.auth.GithubAuthProvider,
      ['ACCESS_TOKEN'],
      ref);
}


function testGetAuthCredential_invalid() {
  var cred = {
    'providerId': 'unknown.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  assertNull(firebaseui.auth.idp.getAuthCredential(cred));
  assertNull(firebaseui.auth.idp.getAuthCredential({}));
}
