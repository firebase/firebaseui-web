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
 * @fileoverview Tests for exports_app.js - verifies all public API symbols
 * are properly exported.
 */

goog.provide('firebaseui.auth.ExportsTest');
goog.setTestOnly('firebaseui.auth.ExportsTest');

goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.FirebaseUiHandler');
goog.require('firebaseui.auth.exports');
goog.require('firebaseui.auth.widget.Config');
goog.require('goog.Promise');
goog.require('goog.testing.jsunit');


function testExports_AuthUI_exported() {
  // Verify firebaseui.auth.AuthUI is exported.
  assertNotUndefined(firebaseui.auth.AuthUI);
  assertEquals('function', typeof firebaseui.auth.AuthUI);
}


function testExports_AuthUI_getInstance_exported() {
  // Verify AuthUI.getInstance static method is exported.
  assertNotUndefined(firebaseui.auth.AuthUI.getInstance);
  assertEquals('function', typeof firebaseui.auth.AuthUI.getInstance);
}


function testExports_AuthUI_prototype_disableAutoSignIn_exported() {
  // Verify AuthUI.prototype.disableAutoSignIn is exported.
  assertNotUndefined(firebaseui.auth.AuthUI.prototype.disableAutoSignIn);
  assertEquals(
      'function',
      typeof firebaseui.auth.AuthUI.prototype.disableAutoSignIn);
}


function testExports_AuthUI_prototype_start_exported() {
  // Verify AuthUI.prototype.start is exported.
  assertNotUndefined(firebaseui.auth.AuthUI.prototype.start);
  assertEquals('function', typeof firebaseui.auth.AuthUI.prototype.start);
}


function testExports_AuthUI_prototype_setConfig_exported() {
  // Verify AuthUI.prototype.setConfig is exported.
  assertNotUndefined(firebaseui.auth.AuthUI.prototype.setConfig);
  assertEquals('function', typeof firebaseui.auth.AuthUI.prototype.setConfig);
}


function testExports_AuthUI_prototype_signIn_exported() {
  // Verify AuthUI.prototype.signIn is exported.
  assertNotUndefined(firebaseui.auth.AuthUI.prototype.signIn);
  assertEquals('function', typeof firebaseui.auth.AuthUI.prototype.signIn);
}


function testExports_AuthUI_prototype_reset_exported() {
  // Verify AuthUI.prototype.reset is exported.
  assertNotUndefined(firebaseui.auth.AuthUI.prototype.reset);
  assertEquals('function', typeof firebaseui.auth.AuthUI.prototype.reset);
}


function testExports_AuthUI_prototype_delete_exported() {
  // Verify AuthUI.prototype.delete is exported.
  assertNotUndefined(firebaseui.auth.AuthUI.prototype['delete']);
  assertEquals('function', typeof firebaseui.auth.AuthUI.prototype['delete']);
}


function testExports_AuthUI_prototype_isPendingRedirect_exported() {
  // Verify AuthUI.prototype.isPendingRedirect is exported.
  assertNotUndefined(firebaseui.auth.AuthUI.prototype.isPendingRedirect);
  assertEquals(
      'function',
      typeof firebaseui.auth.AuthUI.prototype.isPendingRedirect);
}


function testExports_FirebaseUiHandler_exported() {
  // Verify firebaseui.auth.FirebaseUiHandler is exported.
  assertNotUndefined(firebaseui.auth.FirebaseUiHandler);
  assertEquals('function', typeof firebaseui.auth.FirebaseUiHandler);
}


function testExports_FirebaseUiHandler_prototype_selectTenant_exported() {
  // Verify FirebaseUiHandler.prototype.selectTenant is exported.
  assertNotUndefined(
      firebaseui.auth.FirebaseUiHandler.prototype.selectTenant);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.selectTenant);
}


function testExports_FirebaseUiHandler_prototype_getAuth_exported() {
  // Verify FirebaseUiHandler.prototype.getAuth is exported.
  assertNotUndefined(firebaseui.auth.FirebaseUiHandler.prototype.getAuth);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.getAuth);
}


function testExports_FirebaseUiHandler_prototype_startSignIn_exported() {
  // Verify FirebaseUiHandler.prototype.startSignIn is exported.
  assertNotUndefined(
      firebaseui.auth.FirebaseUiHandler.prototype.startSignIn);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.startSignIn);
}


function testExports_FirebaseUiHandler_prototype_reset_exported() {
  // Verify FirebaseUiHandler.prototype.reset is exported.
  assertNotUndefined(firebaseui.auth.FirebaseUiHandler.prototype.reset);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.reset);
}


function testExports_FirebaseUiHandler_prototype_showProgressBar_exported() {
  // Verify FirebaseUiHandler.prototype.showProgressBar is exported.
  assertNotUndefined(
      firebaseui.auth.FirebaseUiHandler.prototype.showProgressBar);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.showProgressBar);
}


function testExports_FirebaseUiHandler_prototype_hideProgressBar_exported() {
  // Verify FirebaseUiHandler.prototype.hideProgressBar is exported.
  assertNotUndefined(
      firebaseui.auth.FirebaseUiHandler.prototype.hideProgressBar);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.hideProgressBar);
}


function testExports_FirebaseUiHandler_prototype_completeSignOut_exported() {
  // Verify FirebaseUiHandler.prototype.completeSignOut is exported.
  assertNotUndefined(
      firebaseui.auth.FirebaseUiHandler.prototype.completeSignOut);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.completeSignOut);
}


function testExports_FirebaseUiHandler_prototype_handleError_exported() {
  // Verify FirebaseUiHandler.prototype.handleError is exported.
  assertNotUndefined(
      firebaseui.auth.FirebaseUiHandler.prototype.handleError);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.handleError);
}


function testExports_FirebaseUiHandler_prototype_processUser_exported() {
  // Verify FirebaseUiHandler.prototype.processUser is exported.
  assertNotUndefined(
      firebaseui.auth.FirebaseUiHandler.prototype.processUser);
  assertEquals(
      'function',
      typeof firebaseui.auth.FirebaseUiHandler.prototype.processUser);
}


function testExports_AuthUIError_exported() {
  // Verify firebaseui.auth.AuthUIError is exported.
  assertNotUndefined(firebaseui.auth.AuthUIError);
  assertEquals('function', typeof firebaseui.auth.AuthUIError);
}


function testExports_AuthUIError_prototype_toJSON_exported() {
  // Verify AuthUIError.prototype.toJSON is exported.
  assertNotUndefined(firebaseui.auth.AuthUIError.prototype.toJSON);
  assertEquals(
      'function',
      typeof firebaseui.auth.AuthUIError.prototype.toJSON);
}


function testExports_AuthUIError_correctType() {
  // Verify AuthUIError can be instantiated and has correct properties.
  var error = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      'Test error message');

  assertNotNull(error);
  assertTrue(error instanceof Error);
  assertTrue(error instanceof firebaseui.auth.AuthUIError);
  assertEquals(
      'firebaseui/anonymous-upgrade-merge-conflict',
      error.code);
  assertEquals('Test error message', error.message);
}


function testExports_AuthUIError_toJSON() {
  // Verify AuthUIError.toJSON works correctly.
  var error = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      'Test error message');

  var json = error.toJSON();
  assertNotNull(json);
  assertEquals('firebaseui/anonymous-upgrade-merge-conflict', json['code']);
  assertEquals('Test error message', json['message']);
}


function testExports_CredentialHelper_GOOGLE_YOLO_exported() {
  // Verify firebaseui.auth.CredentialHelper.GOOGLE_YOLO is exported.
  assertNotUndefined(firebaseui.auth.CredentialHelper);
  assertNotUndefined(firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
  assertEquals(
      'googleyolo',
      firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
}


function testExports_CredentialHelper_NONE_exported() {
  // Verify firebaseui.auth.CredentialHelper.NONE is exported.
  assertNotUndefined(firebaseui.auth.CredentialHelper);
  assertNotUndefined(firebaseui.auth.CredentialHelper.NONE);
  assertEquals('none', firebaseui.auth.CredentialHelper.NONE);
}


function testExports_CredentialHelper_values() {
  // Verify CredentialHelper has the expected values.
  assertEquals(
      firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO,
      firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
  assertEquals(
      firebaseui.auth.widget.Config.CredentialHelper.NONE,
      firebaseui.auth.CredentialHelper.NONE);
}


function testExports_AnonymousAuthProvider_PROVIDER_ID_exported() {
  // Verify firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID is exported.
  assertNotUndefined(firebaseui.auth.AnonymousAuthProvider);
  assertNotUndefined(firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID);
  assertEquals('anonymous', firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID);
}


function testExports_AnonymousAuthProvider_value() {
  // Verify AnonymousAuthProvider.PROVIDER_ID has the expected value.
  assertEquals(
      firebaseui.auth.widget.Config.ANONYMOUS_PROVIDER_ID,
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID);
}


function testExports_Promise_catch_exported() {
  // Verify goog.Promise.prototype.catch is exported.
  var promise = goog.Promise.resolve('test');
  assertNotUndefined(promise['catch']);
  assertEquals('function', typeof promise['catch']);
}


function testExports_Promise_catch_functionality() {
  // Verify Promise.catch works correctly.
  var errorCaught = false;
  var testError = new Error('Test error');

  var promise = goog.Promise.reject(testError)['catch'](function(error) {
    errorCaught = true;
    assertEquals(testError, error);
  });

  return promise.then(function() {
    assertTrue(errorCaught);
  });
}


function testExports_Promise_finally_exported() {
  // Verify goog.Promise.prototype.finally is exported.
  var promise = goog.Promise.resolve('test');
  assertNotUndefined(promise['finally']);
  assertEquals('function', typeof promise['finally']);
}


function testExports_Promise_finally_functionality() {
  // Verify Promise.finally works correctly.
  var finallyCalled = false;

  var promise = goog.Promise.resolve('test')['finally'](function() {
    finallyCalled = true;
  });

  return promise.then(function() {
    assertTrue(finallyCalled);
  });
}


function testExports_Promise_finally_onError() {
  // Verify Promise.finally is called even when promise is rejected.
  var finallyCalled = false;

  var promise = goog.Promise.reject(new Error('test'))['finally'](function() {
    finallyCalled = true;
  })['catch'](function() {
    // Catch the error to prevent test failure.
  });

  return promise.then(function() {
    assertTrue(finallyCalled);
  });
}


function testExports_allAuthUIMethodsAccessible() {
  // Comprehensive test to verify all AuthUI methods are accessible.
  var methods = [
    'disableAutoSignIn',
    'start',
    'setConfig',
    'signIn',
    'reset',
    'delete',
    'isPendingRedirect'
  ];

  for (var i = 0; i < methods.length; i++) {
    var method = methods[i];
    assertNotUndefined(
        firebaseui.auth.AuthUI.prototype[method],
        'AuthUI.prototype.' + method + ' should be defined');
    assertEquals(
        'function',
        typeof firebaseui.auth.AuthUI.prototype[method],
        'AuthUI.prototype.' + method + ' should be a function');
  }
}


function testExports_allFirebaseUiHandlerMethodsAccessible() {
  // Comprehensive test to verify all FirebaseUiHandler methods are accessible.
  var methods = [
    'selectTenant',
    'getAuth',
    'startSignIn',
    'reset',
    'showProgressBar',
    'hideProgressBar',
    'completeSignOut',
    'handleError',
    'processUser'
  ];

  for (var i = 0; i < methods.length; i++) {
    var method = methods[i];
    assertNotUndefined(
        firebaseui.auth.FirebaseUiHandler.prototype[method],
        'FirebaseUiHandler.prototype.' + method + ' should be defined');
    assertEquals(
        'function',
        typeof firebaseui.auth.FirebaseUiHandler.prototype[method],
        'FirebaseUiHandler.prototype.' + method + ' should be a function');
  }
}


function testExports_publicAPIStructure() {
  // Test that the overall public API structure is correct.

  // firebaseui namespace should exist.
  assertNotUndefined(firebaseui);

  // firebaseui.auth namespace should exist.
  assertNotUndefined(firebaseui.auth);

  // Main classes should exist.
  assertNotUndefined(firebaseui.auth.AuthUI);
  assertNotUndefined(firebaseui.auth.FirebaseUiHandler);
  assertNotUndefined(firebaseui.auth.AuthUIError);

  // Constants should exist.
  assertNotUndefined(firebaseui.auth.CredentialHelper);
  assertNotUndefined(firebaseui.auth.AnonymousAuthProvider);
}


function testExports_constantTypes() {
  // Verify exported constants have correct types.

  // CredentialHelper should be an object with string values.
  assertEquals('object', typeof firebaseui.auth.CredentialHelper);
  assertEquals('string', typeof firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
  assertEquals('string', typeof firebaseui.auth.CredentialHelper.NONE);

  // AnonymousAuthProvider should be an object with PROVIDER_ID.
  assertEquals('object', typeof firebaseui.auth.AnonymousAuthProvider);
  assertEquals(
      'string',
      typeof firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID);
}


function testExports_staticMethods() {
  // Verify static methods are exported correctly.

  // AuthUI.getInstance should be a static method.
  assertTrue(firebaseui.auth.AuthUI.hasOwnProperty('getInstance'));
  assertEquals('function', typeof firebaseui.auth.AuthUI.getInstance);
}


function testExports_noExtraUnexpectedExports() {
  // Verify we're not accidentally exporting internal symbols.
  // This test checks that the exported namespace doesn't have unexpected
  // properties that should remain internal.

  // These should NOT be exported (internal implementation details).
  assertUndefined(firebaseui.auth.widget);

  // Note: firebaseui.auth.CredentialHelper and AnonymousAuthProvider
  // are intentionally exported, so they should exist.
  assertNotUndefined(firebaseui.auth.CredentialHelper);
  assertNotUndefined(firebaseui.auth.AnonymousAuthProvider);
}


function testExports_AuthUIError_withCredential() {
  // Test that AuthUIError can be created with a credential.
  var mockCredential = {
    providerId: 'google.com',
    signInMethod: 'google.com'
  };

  var error = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      'Merge conflict',
      mockCredential);

  assertNotNull(error);
  assertEquals('firebaseui/anonymous-upgrade-merge-conflict', error.code);
  assertEquals('Merge conflict', error.message);
  assertEquals(mockCredential, error.credential);
}


function testExports_AuthUIError_withoutCredential() {
  // Test that AuthUIError can be created without a credential.
  var error = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      'Merge conflict');

  assertNotNull(error);
  assertEquals('firebaseui/anonymous-upgrade-merge-conflict', error.code);
  assertEquals('Merge conflict', error.message);
  assertNull(error.credential);
}


function testExports_Promise_chainable() {
  // Test that exported Promise methods are chainable.
  var promise = goog.Promise.resolve('test')
      ['catch'](function() {})
      ['finally'](function() {});

  assertNotNull(promise);
  assertTrue(promise instanceof goog.Promise);
}
