/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview Tests for authuierror.js
 */

goog.provide('firebaseui.auth.AuthUIErrorTest');

goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.soy2.strings');
goog.require('goog.testing.jsunit');

goog.setTestOnly();


function testAuthUIError() {
  var authCredential = {'accessToken': 'googleAccessToken',
      'providerId': 'google.com'};
  var error = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT, undefined,
      authCredential);
  assertEquals('firebaseui/anonymous-upgrade-merge-conflict', error['code']);
  assertEquals(
      firebaseui.auth.soy2.strings.errorAuthUI(
          {code: error['code']}).toString(),
      error['message']);
  // Test toJSON(). Do not expose credential in JSON object.
  assertObjectEquals({
    code: error['code'],
    message: error['message'],
  }, error.toJSON());
  // Make sure JSON.stringify works and uses underlying toJSON.
  assertEquals(JSON.stringify(error), JSON.stringify(error.toJSON()));
}


function testAuthUIError_customMessage() {
  var authCredential = {'accessToken': 'googleAccessToken',
      'providerId': 'google.com'};
  var error = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT, 'merge conflict error',
      authCredential);
  assertEquals('firebaseui/anonymous-upgrade-merge-conflict', error['code']);
  assertEquals('merge conflict error', error['message']);
  // Test toJSON(). Do not expose credential in JSON object.
  assertObjectEquals({
    code: error['code'],
    message: error['message'],
  }, error.toJSON());
  // Make sure JSON.stringify works and uses underlying toJSON.
  assertEquals(JSON.stringify(error), JSON.stringify(error.toJSON()));
}
