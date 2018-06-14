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
 * @fileoverview Test for federated sign-in handler.
 */

goog.provide('firebaseui.auth.widget.handler.FederatedSignInTest');
goog.setTestOnly('firebaseui.auth.widget.handler.FederatedSignInTest');

goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleCallback');
goog.require('firebaseui.auth.widget.handler.handleFederatedSignIn');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');


function testHandleFederatedSignIn() {
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  testAuth.assertSignInWithRedirect(
      [expectedProvider]);
  return testAuth.process();
}


function testHandleFederatedSignIn_cordova() {
  // Test federated sign-in success from a Cordova environment.
  // Add additional scopes to test they are properly passed to sign-in method.
  // Simulate a Cordova environment.
  simulateCordovaEnvironment();
  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  testAuth.assertSignInWithRedirect(
      [expectedProvider]);
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


function testHandleFederatedSignIn_error_cordova() {
  // Test federated sign-in error from a Cordova environment.
  // Add additional scopes to test they are properly passed to sign-in method.
  // Simulate a Cordova environment.
  simulateCordovaEnvironment();
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  testAuth.assertSignInWithRedirect(
      [expectedProvider]);
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


function testHandleFederatedSignIn_noLoginHint() {
  // Add additional scopes to test they are properly passed to sign-in method.
  // As this is not google.com, no customParameters will be set.
  var expectedProvider =
      getExpectedProviderWithCustomParameters('facebook.com');
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'facebook.com');
  assertFederatedLinkingPage();
  submitForm();
  testAuth.assertSignInWithRedirect(
      [expectedProvider]);
  return testAuth.process();
}


function testHandleFederatedSignIn_popup_success() {
  // Successful federated sign in with popup.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  var cred  = {
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  // User should be signed in.
  testAuth.setUser({
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  });
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      {
        'user': testAuth.currentUser,
        'credential': cred
      });
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
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
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleFederatedSignIn_popup_success_multipleClicks() {
  // Test multiple clicks in sign in with popup.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  // Click again, the second call will override the first.
  submitForm();
  var cred  = {
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  // User should be signed in.
  testAuth.setUser({
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  });
  // Firebase auth will cancel this call.
  testAuth.assertSignInWithPopup(
      [expectedProvider], null,
      {'code': 'auth/cancelled-popup-request'});
  // This will be processed.
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      {
        'user': testAuth.currentUser,
        'credential': cred
      });
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
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
    // No info bar message shown.
    assertNoInfoBarMessage();
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleFederatedSignIn_popup_cancelled() {
  // Test sign in with popup flow when the popup is cancelled.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  // User cancels the popup.
  testAuth.assertSignInWithPopup(
      [expectedProvider], null,
      {'code': 'auth/popup-closed-by-user'});
  return testAuth.process().then(function() {
    // No info bar message shown.
    assertNoInfoBarMessage();
    // User remains on the same page.
    assertFederatedLinkingPage();
  });
}


function testHandleFederatedSignIn_reset() {
  // Test when reset is called after federated sign-in handler called.
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  app.getAuth().assertSignOut([]);
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandleFederatedSignIn_error() {
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();

  testAuth.assertSignInWithRedirect([expectedProvider], null, internalError);
  return testAuth.process().then(function() {
    // On error, show a message on info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleFederatedSignIn_popup_recoverableError() {
  // Test federated sign in with popup when recoverable error thrown.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  // Sign in with popup returns a recoverable error.
  var error = {'code': 'auth/network-request-failed'};
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Remain on same page and display the error in info bar.
    assertFederatedLinkingPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  });
}


function testHandleFederatedSignIn_popup_userCancelled() {
  // Test federated sign in with popup when user denies permissions.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  // Sign in with popup returns a recoverable error.
  var error = {'code': 'auth/user-cancelled'};
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Remain on same page and display the error in info bar.
    assertFederatedLinkingPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  });
}


function testHandleFederatedSignIn_popup_popupBlockedError() {
  // Test federated sign in with popup when popup blocked.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();

  // Sign in with popup is blocked.
  var error = {'code': 'auth/popup-blocked'};
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Remain on same page and try to sign in with redirect.
    assertFederatedLinkingPage();
    // Fallback to sign in with redirect.
    testAuth.assertSignInWithRedirect([expectedProvider]);
    return testAuth.process();
  });
}


function testHandleFederatedSignIn_popup_popupBlockedError_redirectError() {
  // Test federated sign in with popup when popup is blocked and redirect fails.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();

  // Sign in with popup blocked.
  var error = {'code': 'auth/popup-blocked'};
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Remain on same page and try to sign in with redirect.
    assertFederatedLinkingPage();
    // Sign in with redirect fallback. Simulate redirect error.
    testAuth.assertSignInWithRedirect([expectedProvider], null, internalError);
    return testAuth.process();
  }).then(function() {
    // Remain on the same page.
    assertFederatedLinkingPage();
    // On error, show a message on info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleFederatedSignIn_popup_unrecoverableError() {
  // Test federated sign in with popup when unrecoverable error returned.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to sign-in method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': 'user@gmail.com',
    'prompt': 'select_account'
  });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();

  // Sign in with popup returns unrecoverable error.
  testAuth.assertSignInWithPopup([expectedProvider], null, internalError);
  return testAuth.process().then(function() {
    // Navigate to provider sign in page and displays the error in info bar.
    assertProviderSignInPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleFederatedSignIn_inProcessing() {
  var expectedProvider = getExpectedProviderWithCustomParameters(
      'google.com',
      {
        'login_hint': 'user@gmail.com'
      });
  firebaseui.auth.widget.handler.handleFederatedSignIn(
      app, container, 'user@gmail.com', 'google.com');
  assertFederatedLinkingPage();
  submitForm();
  delayForBusyIndicatorAndAssertIndicatorShown();
  // Click submit again.
  submitForm();
  testAuth.assertSignInWithRedirect(
      [expectedProvider], null, internalError);
  return testAuth.process().then(function() {
    // On error, show a message on info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    assertBusyIndicatorHidden();

    // Submit again.
    submitForm();

    testAuth.assertSignInWithRedirect([expectedProvider]);
    return testAuth.process();
  });
}
