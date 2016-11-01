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
 * @fileoverview Tests for account.js.
 */

goog.provide('firebaseui.auth.AccountTest');

goog.require('firebaseui.auth.Account');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.idpTest');


var account = new firebaseui.auth.Account(
    'user@example.com',
    'John Doe',
    'http://localhost/picture.png',
    'google.com');


var obj = {
  'email': 'user@example.com',
  'displayName': 'John Doe',
  'photoUrl': 'http://localhost/picture.png',
  'providerId': 'google.com'
};


function testAccountProperties() {
  assertEquals('user@example.com', account.getEmail());
  assertEquals('John Doe', account.getDisplayName());
  assertEquals('http://localhost/picture.png', account.getPhotoUrl());
  assertEquals('google.com', account.getProviderId());
}


function testToPlainObject() {
  assertObjectEquals(obj, account.toPlainObject());
}


function testFromPlainObject() {
  assertObjectEquals(account, firebaseui.auth.Account.fromPlainObject(obj));
}
