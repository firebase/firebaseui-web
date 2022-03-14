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
 * @fileoverview Tests for phoneauthresult.js
 */

goog.provide('firebaseui.auth.PhoneAuthResultTest');

goog.require('firebaseui.auth.PhoneAuthResult');
goog.require('goog.Promise');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

goog.setTestOnly();


function testPhoneAuthResult_defaultErrorHandler() {
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE'
  };
  var confirmationResult = {
    'verificationId': '1234567890',
    'confirm': goog.testing.recordFunction(function(code) {
      assertEquals('123456', code);
      return goog.Promise.reject(expectedError);
    })
  };
  // Test default error handler.
  var phoneAuthResult = new firebaseui.auth.PhoneAuthResult(confirmationResult);
  assertEquals(confirmationResult, phoneAuthResult.getConfirmationResult());
  return phoneAuthResult.confirm('123456').then(fail, function(error) {
    assertEquals(1, confirmationResult.confirm.getCallCount());
    assertObjectEquals(expectedError, error);
  });
}


function testPhoneAuthResult_success() {
  var cred = {
    'providerId': 'phone',
    'verificationId': '123456abc',
    'verificationCode': '123456'
  };
  var expectedUserCredential = {
    'user': {'uid': '1234567890'},
    'credential': cred,
    'operationType': 'signIn'
  };
  var confirmationResult = {
    'verificationId': '1234567890',
    'confirm': goog.testing.recordFunction(function(code) {
      assertEquals('123456', code);
      return goog.Promise.resolve(expectedUserCredential);
    })
  };
  var phoneAuthResult = new firebaseui.auth.PhoneAuthResult(confirmationResult);
  assertEquals(confirmationResult, phoneAuthResult.getConfirmationResult());
  return phoneAuthResult.confirm('123456').then(function(userCredential) {
    assertEquals(expectedUserCredential, userCredential);
  });
}


function testPhoneAuthResult_errorHandlerProvided() {
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE'
  };
  var confirmationResult = {
    'verificationId': '1234567890',
    'confirm': goog.testing.recordFunction(function(code) {
      assertEquals('123456', code);
      return goog.Promise.reject(expectedError);
    })
  };
  // Test with provided error handler.
  var errorHandler = goog.testing.recordFunction(function(error) {
    assertEquals(1, confirmationResult.confirm.getCallCount());
    assertEquals(expectedError, error);
    throw error;
  });
  var phoneAuthResult = new firebaseui.auth.PhoneAuthResult(
      confirmationResult, errorHandler);
  assertEquals(confirmationResult, phoneAuthResult.getConfirmationResult());
  return phoneAuthResult.confirm('123456').then(fail, function(error) {
    assertEquals(1, errorHandler.getCallCount());
    assertEquals(expectedError, errorHandler.getLastCall().getArgument(0));
    assertEquals(expectedError, error);
  });
}
