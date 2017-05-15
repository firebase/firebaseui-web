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
 * @fileoverview Tests for auth.js
 */

goog.provide('firebaseui.auth.AuthTest');

goog.require('firebaseui.auth.testing.FakeAppClient');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.AuthTest');


var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();
var app;
var auth;


function setUp() {
  app = new firebaseui.auth.testing.FakeAppClient({
    'apiKey': 'API_KEY',
    'authDomain': 'example.firebaseapp.com'
  }, 'app1');
  auth = app.auth();
}


function testFakeAppClient() {
  assertEquals('app1', app['name']);
  assertEquals('API_KEY', app['options']['apiKey']);
  assertEquals('example.firebaseapp.com', app['options']['authDomain']);
  assertEquals(auth['app'], app);
}


function testFakeAuthClient_success() {
  asyncTestCase.waitForSignals(3);
  auth.install();
  var email = 'user@example.com';
  var email2 = 'user2@example.com';
  var password = 'password';
  var user = {'uid': 'USER_ID'};
  // This block will be called in UI interactions.
  auth.fetchProvidersForEmail(email).then(function(arr) {
    return auth.signInWithEmailAndPassword(email, password)
        .then(function(user) {
          return auth.signOut();
        });
  }, function(error) {
    return auth.createUserWithEmailAndPassword(email, password);
  });
  auth.fetchProvidersForEmail(email2).thenCatch(function(error) {
    return auth.createUserWithEmailAndPassword(email2, password);
  });
  auth.sendPasswordResetEmail(email2).thenCatch(function(error) {
    return auth.signInWithEmailAndPassword(email2, password);
  });
  auth.checkActionCode('actionCode').then(function(result) {
    assertEquals(true, result);
    asyncTestCase.signal();
  });
  auth.applyActionCode('actionCode2').thenCatch(function(result) {
    assertEquals(false, result);
    asyncTestCase.signal();
  });

  // Simulate API calls in tests.
  auth.assertFetchProvidersForEmail([email], ['google.com', 'facebook.com']);
  auth.assertSignInWithEmailAndPassword([email, password], user);
  auth.assertSignOut([]);
  auth.assertFetchProvidersForEmail([email2], null, new Error());
  auth.assertCreateUserWithEmailAndPassword([email2, password], user);
  // It also works when passing in a function.
  auth.assertCheckActionCode(['actionCode'], function() {
    return goog.Promise.resolve(true);
  });
  auth.assertApplyActionCode(['actionCode2'], function() {
    return goog.Promise.reject(false);
  });
  auth.process().then(function() {
    // These asserts can also be chained with process.
    auth.assertSendPasswordResetEmail([email2], null, new Error());
    auth.assertSignInWithEmailAndPassword([email2, password], user);
    auth.process().then(function() {
      auth.uninstall();
      asyncTestCase.signal();
    });
  });
}


function testFakeAuthClient_setUser() {
  auth.install();
  assertNull(auth['currentUser']);

  auth.setUser({
    'uid': '123456',
    'email': 'user@example.com'
  });
  assertEquals('123456', auth['currentUser']['uid']);
  assertEquals('user@example.com', auth['currentUser']['email']);
  assertUndefined(auth['currentUser']['emailVerified']);

  auth.setUser({
    'uid': '789012',
    'displayName': 'John Smith'
  });
  assertEquals('789012', auth['currentUser']['uid']);
  assertEquals('John Smith', auth['currentUser']['displayName']);
  assertUndefined(auth['currentUser']['email']);

  auth.setUser(null);
  assertNull(auth['currentUser']);
}


function testFakeAuthClient_withUser_Success() {
  asyncTestCase.waitForSignals(1);
  // Test with combination of authentication and user methods.
  auth.install();
  // The following code will mimic the UI interactions flow.
  var newEmail = 'user@example.com';
  var actionCode = 'EMAIL_VERIFICATION_CODE';
  // User would be signed in somewhere.
  auth.setUser({'uid': '123456'});
  auth.currentUser.updateEmail(newEmail)
      .then(function() {
        return auth.currentUser.sendEmailVerification();
      })
      .then(function() {
        return auth.applyActionCode(actionCode);
      });
  // For testing, the following calls are used.
  auth.currentUser.assertUpdateEmail([newEmail]);
  auth.currentUser.assertSendEmailVerification([]);
  auth.assertApplyActionCode([actionCode]);
  auth.process().then(function() {
    auth.uninstall();
    asyncTestCase.signal();
  });
}


function testFakeAuthClient_expectedUncalledApiError() {
  asyncTestCase.waitForSignals(1);
  // Asserting a different API than the one actually called.
  auth.install();
  var email = 'user@example.com';
  var password = 'password';
  auth.signInWithEmailAndPassword(email, password);

  auth.assertSignOut([]);
  auth.process().then(function() {
    return auth.uninstall();
  }).thenCatch(function(e) {
    assertEquals(
        'missing API request: signOut', e.message);
    asyncTestCase.signal();
  });
}


function testFakeAuthClient_unexpectedApiError() {
  asyncTestCase.waitForSignals(1);
  // Forgetting to assert API calls that were actually called.
  auth.install();
  var email = 'user@example.com';
  var password = 'password';
  var user = {'uid': 'USER_ID'};
  auth.fetchProvidersForEmail(email).then(function(arr) {
    return auth.signInWithEmailAndPassword(email, password);
  }, function(error) {
    return auth.createUserWithEmailAndPassword(email, password);
  });
  // Simulate API calls.
  auth.assertFetchProvidersForEmail([email], ['google.com', 'facebook.com']);
  auth.process().then(function() {
    return auth.uninstall();
  }).thenCatch(function(e) {
    assertEquals(
        'unexpected API request(s): signInWithEmailAndPassword', e.message);
    asyncTestCase.signal();
  });
}


function testFakeAuthClient_runAuthChangeHandler() {
  var called1 = 0;
  var called2 = 0;
  var cb1 = function(passedUser) {
    assertEquals(auth['currentUser'], passedUser);
    called1++;
  };
  var cb2 = function(passedUser) {
    assertEquals(auth['currentUser'], passedUser);
    called2++;
  };
  auth.setUser({email: 'test@example.com'});
  // Add both listeners.
  var unsubscribe1 = auth.onAuthStateChanged(cb1);
  var unsubscribe2 = auth.onAuthStateChanged(cb2);
  // Trigger change.
  auth.runAuthChangeHandler();
  // Both listeners called.
  assertEquals(1, called1);
  assertEquals(1, called2);
  // Remove first listener.
  unsubscribe1();
  // Trigger change.
  auth.runAuthChangeHandler();
  // Second callback run only.
  assertEquals(1, called1);
  assertEquals(2, called2);
  // Remove remaining callback.
  unsubscribe2();
  // Trigger change.
  auth.runAuthChangeHandler();
  // No callback run.
  assertEquals(1, called1);
  assertEquals(2, called2);
}


function testFakeAuthClient_runIdTokenChangeHandler() {
  var called1 = 0;
  var called2 = 0;
  var cb1 = function(passedUser) {
    assertEquals(auth['currentUser'], passedUser);
    called1++;
  };
  var cb2 = function(passedUser) {
    assertEquals(auth['currentUser'], passedUser);
    called2++;
  };
  auth.setUser({email: 'test@example.com'});
  // Add both listeners.
  var unsubscribe1 = auth.onIdTokenChanged(cb1);
  var unsubscribe2 = auth.onIdTokenChanged(cb2);
  // Trigger change.
  auth.runIdTokenChangeHandler();
  // Both listeners called.
  assertEquals(1, called1);
  assertEquals(1, called2);
  // Remove first listener.
  unsubscribe1();
  // Trigger change.
  auth.runIdTokenChangeHandler();
  // Second callback run only.
  assertEquals(1, called1);
  assertEquals(2, called2);
  // Remove remaining callback.
  unsubscribe2();
  // Trigger change.
  auth.runIdTokenChangeHandler();
  // No callback run.
  assertEquals(1, called1);
  assertEquals(2, called2);
}
