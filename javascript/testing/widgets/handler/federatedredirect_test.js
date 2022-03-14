/*
 * Copyright 2019 Google Inc. All Rights Reserved.
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
 * @fileoverview Test for federated redirect handler.
 */

goog.provide('firebaseui.auth.widget.handler.FederatedRedirectTest');
goog.setTestOnly('firebaseui.auth.widget.handler.FederatedRedirectTest');

goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handleFederatedRedirect');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');


function testHandleFederatedRedirect() {
  // Add additional scopes to test they are properly passed to the redirect
  // method. No login_hint is expected since the user's email address is not
  // provided (the email address won't be available because the UI is being
  // skipped entirely).
  app.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [{
      'provider': 'google.com',
      'scopes': ['googl1', 'googl2'],
      'customParameters': {'prompt': 'select_account'}
    }],
    'signInFlow':'redirect'
  });
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});

  // Call the handler and expect a blank page and the redirect to start.
  firebaseui.auth.widget.handler.handleFederatedRedirect(app, container);
  assertBlankPage();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
}


function testHandleFederatedSignIn_signInHint() {
  // Test handleFederatedRedirect when signInHint is passed in start.
  const prefilledEmail = 'user@example.com';
  const expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.setCustomParameters({'login_hint': prefilledEmail});

  app.startWithSignInHint(
      container,
      {
        signInOptions: ['google.com'],
        credentialHelper: 'none',
        immediateFederatedRedirect: true,
      },
      {
        emailHint: prefilledEmail,
      });

  assertBlankPage();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(() => {
    // Clean up the AuthUI instance.
    testAuth.assertSignOut([]);
    app.delete();
    return testAuth.process();
  });
}


function testHandleFederatedRedirect_prefilledEmail() {
  // Test handleFederatedRedirect with prefilled email.
  app.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [{
      'provider': 'google.com',
      'scopes': ['googl1', 'googl2'],
      'customParameters': {'prompt': 'select_account'}
    }],
    'signInFlow':'redirect'
  });
  const prefilledEmail = 'user@example.com';
  const expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({
    'prompt': 'select_account',
    // The prefilled email should be passed to IdP as login_hint.
    'login_hint': prefilledEmail,
  });

  // Call the handler and expect a blank page and the redirect to start.
  firebaseui.auth.widget.handler.handleFederatedRedirect(
      app, container, prefilledEmail);
  assertBlankPage();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
}


function testHandleFederatedRedirect_error() {
  // Add additional scopes to test they are properly passed to the redirect
  // method.
   app.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [{
      'provider': 'google.com',
      'scopes': ['googl1', 'googl2'],
      'customParameters': {'prompt': 'select_account'}
    }],
    'signInFlow':'redirect'
  });
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});

  // Call the handler and expect the 'nascar' screen to show due to failure.
  firebaseui.auth.widget.handler.handleFederatedRedirect(app, container);
  assertBlankPage();
  testAuth.assertSignInWithRedirect([expectedProvider], null, internalError);
  return testAuth.process().then(function() {
    assertProviderSignInPage();
    // On error, expect the info bar to show a message.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleFederatedRedirect_cordova() {
  // Test federated redirect success from a Cordova environment.
  simulateCordovaEnvironment();
  var cred = createMockCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  // Add additional scopes to test they are properly passed to the redirect
  // method.
  app.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [{
      'provider': 'google.com',
      'scopes': ['googl1', 'googl2'],
      'customParameters': {'prompt': 'select_account'}
    }],
    'signInFlow':'redirect'
  });
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});

  // Call the handler and expect a blank page and the redirect to start.
  firebaseui.auth.widget.handler.handleFederatedRedirect(app, container);
  assertBlankPage();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(function() {
    testAuth.setUser({
      'email': federatedAccount.getEmail(),
      'displayName': federatedAccount.getDisplayName()
    });
    testAuth.assertGetRedirectResult(
        [],
        {
          'user': testAuth.currentUser,
          'credential': cred
        });
    return testAuth.process();
  }).then(function() {
    assertCallbackPage();
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [testAuth.currentUser],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleFederatedRedirect_error_cordova() {
  // Test federated redirect error from a Cordova environment.
  simulateCordovaEnvironment();
  // Add additional scopes to test they are properly passed to the redirect
  // method.
  app.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [{
      'provider': 'google.com',
      'scopes': ['googl1', 'googl2'],
      'customParameters': {'prompt': 'select_account'}
    }],
    'signInFlow':'redirect'
  });
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});

  // Call the handler and expect the 'nascar' screen to show due to failure.
  firebaseui.auth.widget.handler.handleFederatedRedirect(app, container);
  assertBlankPage();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(function() {
    testAuth.assertGetRedirectResult(
        [],
        null,
        internalError);
    return testAuth.process();
  }).then(function() {
    // Navigate to provider sign in page and display the error in info bar.
    assertProviderSignInPage();
    // Confirm error message shown in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}
