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
 * @fileoverview Test for federated linking handler.
 */

goog.provide('firebaseui.auth.widget.handler.FederatedLinkingTest');
goog.setTestOnly('firebaseui.auth.widget.handler.FederatedLinkingTest');

goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleCallback');
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.Promise');


var credential = null;


/**
 * Creates and saves the credentials, necessary for the view to load.
 */
function setPendingEmailCredentials() {
  // Pending credential stored.
  credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      passwordAccount.getEmail(), credential);
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCred, app.getAppId());
}


function testHandleFederatedLinking() {
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
}


function testHandleFederatedLinking_noLoginHint() {
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  // As this is not google.com, no customParameters will be set.
  var expectedProvider =
      getExpectedProviderWithCustomParameters('github.com');
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'github.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
}


function testHandleFederatedLinking_noLoginHint_upgradeAnonymous() {
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  // As this is not google.com, no customParameters will be set.
  var expectedProvider =
      getExpectedProviderWithCustomParameters('github.com');
  // Simulate pending email credentials.
  setPendingEmailCredentials();
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'github.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // Assert signInWithRedirect called on internal Auth instance with expected
  // provider.
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
}


function testHandleFederatedLinking_noLoginHint_cordova() {
  // Test federated linking successful flow in a Cordova environment.
  // Simulate a Cordova environment.
  simulateCordovaEnvironment();
  var githubCred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'github.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  // As this is not google.com, no customParameters will be set.
  var expectedProvider =
      getExpectedProviderWithCustomParameters('github.com');
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'github.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(function() {
    testAuth.setUser({
      'email': federatedAccount.getEmail(),
      'displayName': federatedAccount.getDisplayName()
    });
    // Sign-in complete with GitHub.
    testAuth.assertGetRedirectResult(
        [],
        {
          'user': testAuth.currentUser,
          'credential': githubCred
        });
    return testAuth.process();
  }).then(function() {
    assertCallbackPage();
    var userCredential = {
      'user': testAuth.currentUser,
      'credential': credential,
      'operationType': 'link',
      'additionalUserInfo': {'providerId': 'facebook.com', 'isNewUser': false}
    };
    // Saved pending credential loaded from storage and linked to current user.
    testAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential], userCredential);
    return testAuth.process();
  }).then(function() {
    // Signout from internal auth instance.
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


function testHandleFederatedLinking_noLoginHint_error_cordova() {
  // Test federated linking error flow in a Cordova environment.
  // Simulate a Cordova environment.
  simulateCordovaEnvironment();
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  // As this is not google.com, no customParameters will be set.
  var expectedProvider =
      getExpectedProviderWithCustomParameters('github.com');
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'github.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(function() {
    testAuth.assertGetRedirectResult(
        [],
        null,
        internalError);
    return testAuth.process();
  }).then(function() {
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Navigate to provider sign in page and display the error in info bar.
    assertProviderSignInPage();
    // Confirm error message shown in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleFederatedLinking_popup_success() {
  // Test successful federated linking in popup flow.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
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
  // Sign in with popup should be called.
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      {
        'user': testAuth.currentUser,
        'credential': cred
      });
  return testAuth.process().then(function() {
    var userCredential = {
      'user': testAuth.currentUser,
      'credential': credential,
      'operationType': 'link',
      'additionalUserInfo': {'providerId': 'facebook.com', 'isNewUser': false}
    };
    // Linking should be triggered with pending credential.
    testAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential], userCredential);
    return testAuth.process();
    // Sign out from internal instance and then sign in with passed credential
    // to external instance.
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
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleFederatedLinking_popup_upgradeAnonymous() {
  // Test successful federated linking in popup flow when an eligible anonymous
  // user is available for upgrade.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  // Existing account credential.
  var cred  = {
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  // Expected linkWithCredential error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': credential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      credential);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // Sign in with popup should be called on internal Auth instance.
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      function() {
        // User should be signed in.
        testAuth.setUser({
          'email': federatedAccount.getEmail(),
          'displayName': federatedAccount.getDisplayName()
        });
        return {
          'user': testAuth.currentUser,
          'credential': cred
        };
      });
  return testAuth.process().then(function() {
    // Linking should be triggered with pending credential on internal Auth
    // instance user.
    testAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential],
        {
          'user': testAuth.currentUser,
          'credential': credential,
          'operationType': 'link',
          'additionalUserInfo': {
            'providerId': 'facebook.com',
            'isNewUser': false
          }
        });
    return testAuth.process();
    // Sign out from internal instance and then sign in with passed credential
    // to external instance.
  }).then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Existing credential linking to anonymous user should fail with expected
    // error.
    externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential],
        null,
        expectedError);
    return externalAuth.process();
  }).then(function() {
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // No info bar message shown.
    assertNoInfoBarMessage();
    // signInFailure triggered with expected error.
    assertSignInFailure(expectedMergeError);
  });
}


function testHandleFederatedLinking_popup_success_multipleClicks() {
  // Test successful federated linking in popup flow when multiple clicks are
  // triggered.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
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
  return testAuth.process().then(function() {
    var userCredential = {
      'user': testAuth.currentUser,
      'credential': credential,
      'operationType': 'link',
      'additionalUserInfo': {'providerId': 'facebook.com', 'isNewUser': false}
    };
    // Linking should be triggered with pending credential.
    testAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential], userCredential);
    return testAuth.process();
    // Sign out from internal instance and then sign in with passed credential
    // to external instance.
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
    // No info bar message shown.
    assertNoInfoBarMessage();
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleFederatedLinking_reset() {
  // Test when reset is called after federated linking rendering.
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  app.getAuth().assertSignOut([]);
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
  // No pending email credential.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
      app.getAppId()));
}


function testHandleFederatedLinking_noPendingCredential() {
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  // Provider sign-in page should show.
  assertProviderSignInPage();
}


function testHandleFederatedLinking_noPendingCredential_popup() {
  // In popup flow, when no pending credential found, provider sign-in page
  // should be rendered.
  app.updateConfig('signInFlow', 'popup');
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  // Provider sign-in page should show.
  assertProviderSignInPage();
}


function testHandleFederatedLinking_error() {
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();

  testAuth.assertSignInWithRedirect([expectedProvider], null, internalError);
  return testAuth.process().then(function() {
    // On error, show a message on info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleFederatedLinking_popup_recoverableError() {
  // Test recoverable error in federated linking popup flow.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  // This error should only cause an info bar message to display.
  var error = {'code': 'auth/too-many-requests'};
  // Sign in with popup called.
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Pending credential should not be cleared from storage.
    assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Remain on same page and display the error in info bar.
    assertFederatedLinkingPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  });
}


function testHandleFederatedLinking_popup_userCancelled() {
  // Test federated sign in with popup when user denies permissions.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  // This error should only cause an info bar message to display.
  var error = {'code': 'auth/user-cancelled'};
  // Sign in with popup called.
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Pending credential should not be cleared from storage.
    assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Remain on same page and display the error in info bar.
    assertFederatedLinkingPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  });
}


function testHandleFederatedLinking_popup_unrecoverableError() {
  // Test unrecoverable error in federated linking popup flow.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();

  // Sign in with popup called. Unrecoverable error returned.
  testAuth.assertSignInWithPopup([expectedProvider], null, internalError);
  return testAuth.process().then(function() {
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Navigate to provider sign-in page and display the error in info bar.
    assertProviderSignInPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleFederatedLinking_popup_popupBlockedError() {
  // Test when federated linking in popup flow triggers a popup blocked error.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
 // Sign in with popup triggers popup blocked error.
  var error = {'code': 'auth/popup-blocked'};
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Pending credential should not be cleared from storage.
    assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Remain on same page and try to sign in with redirect.
    assertFederatedLinkingPage();
    // Fallback to sign in with redirect.
    testAuth.assertSignInWithRedirect([expectedProvider]);
    return testAuth.process();
  });
}


function testHandleFederatedLinking_popup_popupBlockedError_redirectError() {
  // Test federated linking in popup flow when popup is blocked and sign in
  // with redirect fails.
  app.updateConfig('signInFlow', 'popup');
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  // Trigger popup blocked in sign in with popup request.
  var error = {'code': 'auth/popup-blocked'};
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Pending credential should not be cleared from storage.
    assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Remain on same page and try to sign in with redirect.
    assertFederatedLinkingPage();
    // Simulate redirect error.
    testAuth.assertSignInWithRedirect([expectedProvider], null, internalError);
    return testAuth.process();
  }).then(function() {
    // Should remain on the same page.
    assertFederatedLinkingPage();
    // On error, show a message on info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleFederatedLinking_inProcessing() {
  // Add additional scopes to test they are properly passed to the sign-in
  // method.
  app.updateConfig('signInOptions', signInOptionsWithScopes);
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  return goog.Promise.resolve()
      .then(function() {
        submitForm();
        delayForBusyIndicatorAndAssertIndicatorShown();
        // Click submit again.
        submitForm();
        // Only one request sent.
        testAuth.assertSignInWithRedirect(
            [expectedProvider], null, internalError);
        return testAuth.process();
      })
      .then(function() {
        assertBusyIndicatorHidden();
        // Submit again.
        submitForm();
        testAuth.assertSignInWithRedirect([expectedProvider]);
        return testAuth.process();
      });
}


function testHandleFederatedLinking_popup_cancelled() {
  // Test sign in with popup flow when the popup is cancelled.
  app.updateConfig('signInFlow', 'popup');
  var expectedProvider = getExpectedProviderWithScopes({
    'login_hint': federatedAccount.getEmail(),
    'prompt': 'select_account'
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handleFederatedLinking(
      app, container, federatedAccount.getEmail(), 'google.com');
  assertFederatedLinkingPage(federatedAccount.getEmail());
  submitForm();
  // User cancels the popup.
  testAuth.assertSignInWithPopup(
      [expectedProvider], null,
      {'code': 'auth/popup-closed-by-user'});
  return testAuth.process().then(function() {
    // Pending credential should not be cleared from storage.
    assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // No info bar message shown.
    assertNoInfoBarMessage();
    // User remains on the same page.
    assertFederatedLinkingPage();
  });
}
