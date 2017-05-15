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
 * @fileoverview Tests for pendingemailcredential.js.
 */

goog.provide('firebaseui.auth.PendingEmailCredentialTest');

goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.PendingEmailCredentialTest');


var credential;
var pendingEmailCredential;
var pendingEmailCredential2;
var pendingEmailCredentialObject;
var pendingEmailCredentialObject2;
var firebase = firebase || {};


function setUp() {
  // Mock credential.
  firebase['auth'] = firebase['auth'] || {
    'GoogleAuthProvider' : {
      'credential' : function(idToken, accessToken) {
        assertEquals(credential['idToken'], idToken);
        assertEquals(credential['accessToken'], accessToken);
        return credential;
      },
      'PROVIDER_ID': 'google.com'
    }
  };
  credential = {
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  pendingEmailCredential = new firebaseui.auth.PendingEmailCredential(
      'user@example.com', credential);
  pendingEmailCredentialObject  = {
    'email': 'user@example.com',
    'credential': {
      'providerId': 'google.com',
      'accessToken': 'ACCESS_TOKEN'
    }
  };
  pendingEmailCredential2 =
      new firebaseui.auth.PendingEmailCredential('other@example.com');
  pendingEmailCredentialObject2  = {
    'email': 'other@example.com',
    'credential': null
  };
}


function tearDown() {
  credential = null;
  pendingEmailCredential = null;
  pendingEmailCredential2 = null;
  pendingEmailCredentialObject = null;
  pendingEmailCredentialObject2 = null;
}


function testPendingEmailCredential() {
  assertEquals('user@example.com', pendingEmailCredential.getEmail());
  assertObjectEquals(credential, pendingEmailCredential.getCredential());
  assertEquals('other@example.com', pendingEmailCredential2.getEmail());
  assertNull(pendingEmailCredential2.getCredential());
}


function testToPlainObject() {
  assertObjectEquals(
      pendingEmailCredentialObject,
      pendingEmailCredential.toPlainObject());
  assertObjectEquals(
      pendingEmailCredentialObject2,
      pendingEmailCredential2.toPlainObject());
}


function testFromPlainObject() {
  assertObjectEquals(
      pendingEmailCredential,
      firebaseui.auth.PendingEmailCredential.fromPlainObject(
          pendingEmailCredentialObject));
  assertObjectEquals(
      pendingEmailCredential2,
      firebaseui.auth.PendingEmailCredential.fromPlainObject(
          pendingEmailCredentialObject2));
  assertNull(firebaseui.auth.PendingEmailCredential.fromPlainObject({}));
}
