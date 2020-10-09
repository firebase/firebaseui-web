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
 * @fileoverview Test for provider sign-in handler.
 */

goog.provide('firebaseui.auth.widget.handler.ProviderSignInTest');
goog.setTestOnly('firebaseui.auth.widget.handler.ProviderSignInTest');

goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} Required for multiple app rendering test. */
goog.require('firebaseui.auth.widget.handler.handleCallback');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handlePasswordLinking');
goog.require('firebaseui.auth.widget.handler.handlePasswordRecovery');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignUp');
/** @suppress {extraRequire} Required for page navigation after sign in with
 *      phone number triggered. */
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInStart');
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.testing.events');


var buttons;
var signInOptions;


/**
 * Sets up the provider sign-in page and verifies it was rendered correctly.
 * @param {!firebaseui.auth.widget.Config.SignInFlow} flow The sign-in flow.
 * @param {boolean=} ignoreConfig Whether to ignore config setting assuming
 *     it was set externally.
 * @param {boolean=} enableOneTap Whether One-Tap sign-in is enabled.
 * @param {boolean=} disableAdditionalScopes Whether to disable additional
 *     scopes.
 * @param {string=} email The optional email to prefill.
 */
function setupProviderSignInPage(
    flow, ignoreConfig = false, enableOneTap = false,
    disableAdditionalScopes = false, email = undefined) {
  // Test provider sign-in handler.
  signInOptions = [{
    'provider': 'google.com',
    'scopes': !!disableAdditionalScopes ? [] : ['googl1', 'googl2'],
    'customParameters': {'prompt': 'select_account'},
    'authMethod': 'https://accounts.google.com',
    'clientId': '1234567890.apps.googleusercontent.com'
  }, 'facebook.com', 'password', 'phone', 'anonymous', {
    'provider': 'oidc.provider',
    'providerName': 'OIDC Provider',
    'buttonColor': '#2F2F2F',
    'iconUrl': '<icon-url>',
    'scopes': ['scope1', 'scope2'],
    'customParameters': {'param': 'value'},
  }];
  if (!ignoreConfig) {
    app.setConfig({
      'signInOptions': signInOptions,
      'signInFlow': flow,
      'credentialHelper': !!enableOneTap ?
          firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO :
          firebaseui.auth.widget.Config.CredentialHelper.ACCOUNT_CHOOSER_COM
    });
  }
  // Set sign-in options.
  app.updateConfig('signInOptions', signInOptions);
  firebaseui.auth.widget.handler.handleProviderSignIn(
      app, container, undefined, email);
  assertProviderSignInPage();
  buttons = getIdpButtons();
  assertEquals(signInOptions.length, buttons.length);
  assertEquals('google.com', goog.dom.dataset.get(buttons[0], 'providerId'));
  assertEquals('facebook.com', goog.dom.dataset.get(buttons[1], 'providerId'));
  assertEquals('password', goog.dom.dataset.get(buttons[2], 'providerId'));
  assertEquals('phone', goog.dom.dataset.get(buttons[3], 'providerId'));
  assertTosPpFullMessage(tosCallback, 'http://localhost/privacy_policy');
}


function testHandleProviderSignIn() {
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // One-Tap should not be cancelled yet.
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);
  // One-Tap sign-in should be cancelled on IdP click.
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());

  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
}


function testHandleProviderSignIn_noTosPpUrl() {
  // Test provider sign-in handler when no ToS/PP is provided.
  signInOptions = ['google.com', 'facebook.com', 'password', 'phone'];
  app.setConfig({
    'signInOptions': signInOptions,
    'signInFlow': 'redirect',
    'tosUrl': undefined,
    'privacyPolicyUrl': undefined
  });
  firebaseui.auth.widget.handler.handleProviderSignIn(app, container);
  assertProviderSignInPage();
  buttons = getIdpButtons();
  assertEquals(signInOptions.length, buttons.length);
  assertEquals('google.com', goog.dom.dataset.get(buttons[0], 'providerId'));
  assertEquals('facebook.com', goog.dom.dataset.get(buttons[1], 'providerId'));
  assertEquals('password', goog.dom.dataset.get(buttons[2], 'providerId'));
  assertEquals('phone', goog.dom.dataset.get(buttons[3], 'providerId'));
  assertTosPpFullMessage(null, null);
}


function testHandleProviderSignIn_oneTap_handledSuccessfully_withScopes() {
  // The expected Firebase Auth provider to signInWithRedirect with.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({
    'prompt': 'select_account',
    'login_hint': 'user@example.com'
  });
  // Render the provider sign-in page with additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true);
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get the One-Tap credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful credential provided by One-Tap.
  var p = handler(app, app.getCurrentComponent(), googleYoloIdTokenCredential)
      .then(function(status) {
        assertTrue(status);
      });
  // signInWithRedirect should be called with the expected provider.
  testAuth.assertSignInWithRedirect([expectedProvider]);
  testAuth.process().then(function() {
    // Any pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
  return p;
}


function testHandleProviderSignIn_oneTap_anonymousUpgrade_withScopes() {
  // The expected Firebase Auth provider to linkWithRedirect with.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({
    'prompt': 'select_account',
    'login_hint': 'user@example.com'
  });
  // Render the provider sign-in page with additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true);
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user initially signed in on the external Auth instance.
  externalAuth.setUser(anonymousUser);
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get the One-Tap credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful credential provided by One-Tap.
  var p = handler(app, app.getCurrentComponent(), googleYoloIdTokenCredential)
      .then(function(status) {
        assertTrue(status);
      });
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // linkWithRedirect should be called with the expected provider.
  externalAuth.currentUser.assertLinkWithRedirect([expectedProvider]);
  externalAuth.process().then(function() {
    // Any pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
  return p;
}


function testHandleProviderSignIn_oneTap_unhandled_withoutScopes() {
  // Render the provider sign-in page with no additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true, true);
  // Provider sign in page should be rendered.
  assertProviderSignInPage();
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get the googleyolo credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful credential provided by One-Tap.
  var expectedHandlerStatus = false;
  handler(app, app.getCurrentComponent(), googleYoloIdTokenCredential)
      .then(function(status) {
        expectedHandlerStatus = status;
      });
  // Since no additional scopes are requested,
  // signInWithCredential should be called to handle the
  // ID token returned by googleyolo.
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Simulate an error encountered in signInWithCredential.
  testAuth.assertSignInWithCredential(
      [expectedCredential],
      null,
      internalError);
  return testAuth.process().then(function() {
    // The same page should remain visible.
    assertProviderSignInPage();
    // handler should return false.
    assertFalse(expectedHandlerStatus);
    // Confirm expected error message shown in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleProviderSignIn_oneTap_unhandledCredential() {
  // Render the provider sign-in page with no additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true, true);
  // Provider sign in page should be rendered.
  assertProviderSignInPage();
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get googleyolo credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful unsupported credential provided by One-Tap.
  var expectedHandlerStatus = false;
  handler(app, app.getCurrentComponent(), googleYoloOtherCredential)
      .then(function(status) {
        expectedHandlerStatus = status;
      });
  // Since the returned googleyolo credential is not supported, user should
  // remain on the same page, handler should return false and the expected error
  // message should be displayed in the info bar.
  return testAuth.process().then(function() {
    assertProviderSignInPage();
    assertFalse(expectedHandlerStatus);
    assertInfoBarMessage(
        firebaseui.auth.soy2.strings.errorUnsupportedCredential().toString());
  });
}


function testHandleProviderSignIn_oneTap_handledSuccessfully_withoutScopes() {
  // Render the provider sign-in page with no additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true, true);
  // Confirm provider sign in page rendered.
  assertProviderSignInPage();
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get googleyolo credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful credential provided by One-Tap.
  var expectedHandlerStatus = false;
  handler(app, app.getCurrentComponent(), googleYoloIdTokenCredential)
      .then(function(status) {
        expectedHandlerStatus = status;
      });
  // Since no additional scopes are requested,
  // signInWithCredential should be called to handle the
  // ID token returned by googleyolo.
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // The Firebase Auth mock OAuth credential to return.
  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'idToken': googleYoloIdTokenCredential.credential
  });
  // Mock signed in user.
  testAuth.setUser({
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  });
  // signInWithCredential should be called with the expected
  // credential and simulate a successful sign in operation.
  testAuth.assertSignInWithCredential(
      [expectedCredential],
      {
        'user': testAuth.currentUser,
        'credential': cred
      });
  return testAuth.process().then(function() {
    // Callback page should be rendered while the result is being processed.
    assertCallbackPage();
    return testAuth.process();
  }).then(function() {
    // signOut should be called on the internal Auth instance.
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Set user on the external Auth instance.
    externalAuth.assertUpdateCurrentUser(
        [testAuth.currentUser],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    // Confirm googleyolo handler successful.
    assertTrue(expectedHandlerStatus);
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleProviderSignIn_oneTap_upgradeAnonymous_withoutScopes() {
  // Render the provider sign-in page with no additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true, true);
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user initially signed in on external Auth instance.
  externalAuth.setUser(anonymousUser);
  var expectedUser = {
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  };
  // Confirm provider sign in page rendered.
  assertProviderSignInPage();
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get googleyolo credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful credential provided by One-Tap.
  var expectedHandlerStatus = false;
  handler(app, app.getCurrentComponent(), googleYoloIdTokenCredential)
      .then(function(status) {
        expectedHandlerStatus = status;
      });
  // Since no additional scopes are requested,
  // linkWithCredential should be called to handle the
  // ID token returned by googleyolo.
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // linkWithCredential should be called with the expected
  // credential and simulate a successful sign in operation.
  externalAuth.currentUser.assertLinkWithCredential(
      [expectedCredential],
      function() {
        // Simulate non-anonymous user successfully signed in.
        externalAuth.setUser(expectedUser);
        return {
          'user': expectedUser,
          'credential': expectedCredential
        };
      });
  return externalAuth.process().then(function() {
    // Callback page should be rendered while the result is being processed.
    assertCallbackPage();
    // signOut should be called on the internal Auth instance.
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Confirm googleyolo handler successful.
    assertTrue(expectedHandlerStatus);
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleProviderSignIn_oneTap_upgradeAnon_noScopes_credInUse() {
  // Render the provider sign-in page with no additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true, true);
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user initially signed in on the external Auth instance.
  externalAuth.setUser(anonymousUser);
  // Confirm provider sign in page rendered.
  assertProviderSignInPage();
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get googleyolo credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful credential provided by One-Tap.
  var expectedHandlerStatus = false;
  handler(app, app.getCurrentComponent(), googleYoloIdTokenCredential)
      .then(function(status) {
        expectedHandlerStatus = status;
      });
  // Since no additional scopes are requested,
  // linkWithCredential should be called to handle the
  // ID token returned by googleyolo.
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Expected linkWithCredential error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': expectedCredential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      expectedCredential);
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // linkWithCredential should be called with the expected
  // credential and simulate the expected error thrown.
  externalAuth.currentUser.assertLinkWithCredential(
      [expectedCredential],
      null,
      expectedError);
  return externalAuth.process().then(function() {
    // No info bar message shown.
    assertNoInfoBarMessage();
    // signInFailure triggered with expected error.
    assertSignInFailure(expectedMergeError);
    // googleyolo handler should have resolved with false status.
    assertFalse(expectedHandlerStatus);
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
}


function testHandleProviderSignIn_oneTap_upgradeAnon_noScopes_fedEmailInUse() {
  // Render the provider sign-in page with no additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true, true);
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user initially signed in on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // Confirm provider sign in page rendered.
  assertProviderSignInPage();
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get googleyolo credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful credential provided by One-Tap.
  var expectedHandlerStatus = false;
  handler(app, app.getCurrentComponent(), googleYoloIdTokenCredential)
      .then(function(status) {
        expectedHandlerStatus = status;
      });
  // Since no additional scopes are requested,
  // linkWithCredential should be called to handle the
  // ID token returned by googleyolo.
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Expected linkWithRedirect error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'credential': expectedCredential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(),
      firebase.auth.GoogleAuthProvider.credential(
          googleYoloIdTokenCredential.credential, null));
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // linkWithCredential should be called with the expected
  // credential and simulate an email already in use error.
  externalAuth.currentUser.assertLinkWithCredential(
      [expectedCredential],
      null,
      expectedError);
  return externalAuth.process().then(function() {
    // Callback page should be rendered while the result is being processed.
    assertCallbackPage();
    // Simulate existing email belongs to a federated Facebook account.
    testAuth.assertFetchSignInMethodsForEmail(
        [federatedAccount.getEmail()], ['facebook.com']);
    return testAuth.process();
  }).then(function() {
    // The pending credential should be saved here.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getPendingEmailCredential(app.getAppId()));
    // Federated linking page should be rendered with expected email.
    assertFederatedLinkingPage(federatedAccount.getEmail());
    assertFalse(expectedHandlerStatus);
  });
}


function testHandleProviderSignIn_oneTap_upgradeAnon_noScopes_passEmailInUse() {
  // Render the provider sign-in page with no additional scopes and googleyolo
  // enabled and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, true, true);
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user initially signed in on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // Confirm provider sign in page rendered.
  assertProviderSignInPage();
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getCallCount());
  // Get googleyolo credential handler.
  var handler = firebaseui.auth.AuthUI.prototype.showOneTapSignIn.getLastCall()
      .getArgument(0);
  // Confirm expected handler.
  assertEquals(
      firebaseui.auth.widget.handler.common.handleGoogleYoloCredential,
      handler);
  // Simulate successful credential provided by One-Tap.
  var expectedHandlerStatus = false;
  handler(app, app.getCurrentComponent(), googleYoloIdTokenCredential)
      .then(function(status) {
        expectedHandlerStatus = status;
      });
  // Since no additional scopes are requested,
  // linkWithCredential should be called to handle the
  // ID token returned by googleyolo.
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Expected linkWithRedirect error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'credential': expectedCredential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(),
      firebase.auth.GoogleAuthProvider.credential(
          googleYoloIdTokenCredential.credential, null));
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // linkWithCredential should be called with the expected
  // credential and simulate an email already in user error thrown.
  externalAuth.currentUser.assertLinkWithCredential(
      [expectedCredential],
      null,
      expectedError);
  return externalAuth.process().then(function() {
    // Callback page should be rendered while the result is being processed.
    assertCallbackPage();
    // Simulate email belongs to existing password account.
    testAuth.assertFetchSignInMethodsForEmail(
        [federatedAccount.getEmail()], ['password']);
    return testAuth.process();
  }).then(function() {
    // The pending email credential should be cleared at this point.
    // Password linking does not require a redirect so no need to save it
    // anyway.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Password linking page rendered.
    assertPasswordLinkingPage(federatedAccount.getEmail());
    assertFalse(expectedHandlerStatus);
  });
}


function testHandleProviderSignIn_popup_success() {
  // Test successful provider sign-in with popup.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  // User should be signed in.
  testAuth.setUser({
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  });
  var cred  = {
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  // Sign in with popup triggered.
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
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleProviderSignIn_popup_success_prefilledEmail() {
  // Test successful provider sign-in with popup with prefilled email.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  const prefilledEmail = federatedAccount.getEmail();
  const expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({
    'prompt': 'select_account',
    // The prefilled email should be passed to IdP as login_hint.
    'login_hint': prefilledEmail,
  });
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup', false, false, false, prefilledEmail);
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  // User should be signed in.
  testAuth.setUser({
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  });
  const cred  = {
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  // Sign in with popup triggered.
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
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleProviderSignIn_popup_success_oidc() {
  // Test successful OIDC provider sign-in with popup.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  // Set config signInSuccessWithAuthResult callback with false return value.
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(false)
    }
  });
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('oidc.provider');
  expectedProvider.addScope('scope1');
  expectedProvider.addScope('scope2');
  expectedProvider.setCustomParameters({'param': 'value'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the OIDC sign-in button.
  goog.testing.events.fireClickSequence(buttons[5]);

  // User should be signed in.
  testAuth.setUser({
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  });
  var cred  = {
    'providerId': 'oidc.provider',
    'idToken': 'OIDC_ID_TOKEN',
    'rawNonce': 'NONCE'
  };
  // Sign in with popup triggered.
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      {
        'user': testAuth.currentUser,
        'credential': cred,
        'operationType': 'signIn',
        'additionalUserInfo': {
          'providerId': 'oidc.provider',
          'isNewUser': false
        }
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
    testAuth.assertSignOut([]);
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    var expectedAuthResult = {
      'user': externalAuth.currentUser,
      // Federated credential should be exposed to callback.
      'credential': cred,
      'operationType': 'signIn',
      'additionalUserInfo': {
        'providerId': 'oidc.provider',
        'isNewUser': false
      }
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(expectedAuthResult);
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandleProviderSignIn_popup_success_multipleClicks() {
  // Test successful provider sign-in with popup when button clicked multiple
  // times.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);
  // Click again, the second call should override the first.
  goog.testing.events.fireClickSequence(buttons[0]);

  // User should be signed in.
  testAuth.setUser({
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  });
  var cred  = {
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  // Sign in with popup triggered.
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
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleProviderSignIn_popup_cancelled() {
  // Test sign in with popup flow when the popup is cancelled.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Test provider sign-in handler.
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);
  // User cancels the popup.
  testAuth.assertSignInWithPopup(
      [expectedProvider], null,
      {'code': 'auth/popup-closed-by-user'});
  return testAuth.process().then(function() {
    // No info bar message shown.
    assertNoInfoBarMessage();
    // User remains on the same page.
    assertProviderSignInPage();
  });
}


function testHandleProviderSignIn_popup_unrecoverableError() {
  // Test provider sign-in with popup when unrecoverable error detected.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  // Unrecoverable error in sign in with popup.
  testAuth.assertSignInWithPopup([expectedProvider], null, internalError);
  return testAuth.process().then(function() {
    // Any pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Redirect to provider sign-in page.
    assertProviderSignInPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleProviderSignIn_popup_recoverableError() {
  // Test provider sign-in with popup when recoverable error returned.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  // Recoverable error in sign in with popup.
  var error = {'code': 'auth/network-request-failed'};
  testAuth.assertSignInWithPopup([expectedProvider], null, error);
  return testAuth.process().then(function() {
    // Redirect to provider sign-in page.
    assertProviderSignInPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(error));
  });
}


function testHandleProviderSignIn_popup_popupBlockedError() {
  // Test provider sign-in with popup when popup blocked.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  // Sign in with popup blocked.
  var error = {'code': 'auth/popup-blocked'};
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Stays on provider sign-in page.
    assertProviderSignInPage();
    // Fallback to signInWithRedirect.
    testAuth.assertSignInWithRedirect([expectedProvider]);
    return testAuth.process();
  }).then(function() {
    // Any pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
}


function testHandleProviderSignIn_popup_popupBlockedError_redirectError() {
  // Test provider sign-in with popup when popup is blocked and redirect fails.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  // Sign in with popup blocked.
  var error = {'code': 'auth/popup-blocked'};
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      error);
  return testAuth.process().then(function() {
    // Stays on provider sign-in page.
    assertProviderSignInPage();
    // Simulate redirect error in signInWithRedirect fallback.
    testAuth.assertSignInWithRedirect([expectedProvider], null, internalError);
    return testAuth.process();
  }).then(function() {
    // Remain on same page.
    assertProviderSignInPage();
    // On error, show a message on info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleProviderSignIn_popup_federatedLinkingRequired() {
  // Test provider sign-in with popup when federated linking required.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(), cred);
  // Sign in with popup triggers linking flow.
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      {
        'code': 'auth/account-exists-with-different-credential',
        'email': federatedAccount.getEmail(),
        'credential': cred
      });
  testAuth.assertFetchSignInMethodsForEmail(
      [federatedAccount.getEmail()], ['google.com']);
  return testAuth.process().then(function() {
    // The pending credential should be saved here.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getPendingEmailCredential(app.getAppId()));
    // Federated linking triggered.
    assertFederatedLinkingPage(federatedAccount.getEmail());
  });
}


function testHandleProviderSignIn_popup_passwordLinkingRequired() {
  // Test provider sign-in with popup when password linking required.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  // Sign in with popup and password linking triggered.
  testAuth.assertSignInWithPopup(
      [expectedProvider],
      null,
      {
        'code': 'auth/account-exists-with-different-credential',
        'email': passwordAccount.getEmail(),
        'credential': cred
      });
  testAuth.assertFetchSignInMethodsForEmail(
      [passwordAccount.getEmail()], ['password']);
  return testAuth.process().then(function() {
    // The pending email credential should be cleared at this point.
    // Password linking does not require a redirect so no need to save it
    // anyway.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Password linking page rendered.
    assertPasswordLinkingPage(federatedAccount.getEmail());
  });
}


function testHandleProviderSignIn_reset() {
  // Test reset after provider sign-in handler called.
  firebaseui.auth.widget.handler.handleProviderSignIn(app, container);
  assertProviderSignInPage();
  testAuth.assertSignOut([]);
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
  return testAuth.process();
}


function testHandleProviderSignIn_signInWithPhoneNumber() {
  // Test when sign in with phone number is clicked, that the relevant handler
  // is triggered.
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Click the fourth button, which is sign in with phone button.
  goog.testing.events.fireClickSequence(buttons[3]);
  // Phone sign in start page should be rendered.
  assertPhoneSignInStartPage();
  // Recaptcha should be rendered.
  recaptchaVerifierInstance.assertRender([], 0);
  recaptchaVerifierInstance.process();
}


function testHandleProviderSignIn_continueAsGuest_success() {
  // Test when continue as guest is clicked, that the relevant handler
  // is triggered.
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Click the fifth button, which is continue as guest button.
  goog.testing.events.fireClickSequence(buttons[4]);
  // Progress bar should be showed after clicking the button.
  delayForBusyIndicatorAndAssertIndicatorShown();
  // Sign In Anonymously triggered on external instance.
  externalAuth.assertSignInAnonymously(
      [],
      {
        'user': anonymousUser,
        'credential': null
      });
  return externalAuth.process().then(function() {
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleProviderSignIn_continueAsGuest_error() {
  // Test when continue as guest is clicked, signInAnonymously returns an error.
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Click the fifth button, which is continue as guest button.
  goog.testing.events.fireClickSequence(buttons[4]);

  var expectedError = {
    'code': 'auth/operation-not-allowed',
    'message': 'MESSAGE'
  };
  // Sign In Anonymously triggered on external instance.
  externalAuth.assertSignInAnonymously(
      [],
      null,
      expectedError);
  return externalAuth.process().then(function() {
    // On error, show a message on info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError));
  });
}


function testHandleProviderSignIn_signInWithIdp() {
  // Test provider sign-in handler when sign in with IdP clicked.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes(
      {'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Click the first button, which is sign in with Google button.
  goog.testing.events.fireClickSequence(buttons[0]);

  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
}


function testHandleProviderSignIn_signInWithIdp_redirect_prefilledEmail() {
  // Test provider sign-in handler when sign in with IdP is clicked with
  // prefilled email.
  const prefilledEmail = 'user@example.com';
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  const expectedProvider = getExpectedProviderWithScopes({
    'prompt': 'select_account',
    // The prefilled email should be passed to IdP as login_hint.
    'login_hint': prefilledEmail,
  });
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect', false, false, false, prefilledEmail);
  // Click the first button, which is sign in with Google button.
  goog.testing.events.fireClickSequence(buttons[0]);

  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
}


function testHandleProviderSignIn_signInWithIdp_cordova() {
  // Test provider sign-in handler when sign in with IdP clicked in a Cordova
  // environment.
  // Simulate a Cordova environment.
  simulateCordovaEnvironment();
  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes(
      {'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Click the first button, which is sign in with Google button.
  goog.testing.events.fireClickSequence(buttons[0]);

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


function testHandleProviderSignIn_signInWithIdp_error_cordova() {
  // Test provider sign-in handler when sign in with IdP clicked in a Cordova
  // environment and an error occurs.
  // Simulate a Cordova environment.
  simulateCordovaEnvironment();
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = getExpectedProviderWithScopes(
      {'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Click the first button, which is sign in with Google button.
  goog.testing.events.fireClickSequence(buttons[0]);

  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(function() {
    testAuth.assertGetRedirectResult(
        [],
        null,
        internalError);
    return testAuth.process();
  }).then(function() {
    // Provider sign in page should remain displayed.
    assertProviderSignInPage();
    // Confirm error message shown in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleProviderSignIn_signInWithIdp_error() {
  // Test provider sign-in handler when sign in with IdP clicked and
  // createAuthUri request returns an error.
  var expectedProvider = getExpectedProviderWithScopes(
      {'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Click the first button, which is sign in with Google button.
  goog.testing.events.fireClickSequence(buttons[0]);
  testAuth.assertSignInWithRedirect([expectedProvider], null, internalError);
  return testAuth.process().then(function() {
    // On error, show a message on info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleProviderSignIn_signInWithEmail() {
  // Test provider sign-in handler when sign in with email is clicked and
  // credential helpers are disabled in configuration.
  // Disable any credential helper.
  app.setConfig({
    'signInOptions': signInOptions,
    'credentialHelper': firebaseui.auth.widget.Config.CredentialHelper.NONE,
    'callbacks': {
      'uiShown': uiShownCallback
    }
  });
  assertEquals(uiShownCallbackCount, 0);
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // Sign-in page should show.
  assertSignInPage();
  // UI shown callback should not be shown.
  assertEquals(uiShownCallbackCount, 0);
}


function testHandleProviderSignIn_signInWithEmail_prefilledEmail() {
  // Test provider sign-in handler when sign in with email is clicked with
  // prefilled email.
  // Disable any credential helper.
  app.setConfig({
    'signInOptions': signInOptions,
    'credentialHelper': firebaseui.auth.widget.Config.CredentialHelper.NONE,
  });
  const prefilledEmail = 'user@example.com';
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true, false, false, prefilledEmail);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);

  testAuth.assertFetchSignInMethodsForEmail(
        ['user@example.com'],
        []);
  return testAuth.process().then(() => {
    // Password sign-up page should be shown.
    assertPasswordSignUpPage();
    // The prefilled email should be populated in the email entry.
    assertEquals(prefilledEmail, getEmailElement().value);
    return testAuth.process();
  });
}


function testHandleProviderSignIn_signInHint_signInWithEmail() {
  // Test sign in with email in provider sign-in handler with signInHint.
  const prefilledEmail = 'user@example.com';
  app.startWithSignInHint(
      container,
      {
        signInOptions: ['google.com', 'password'],
        credentialHelper: firebaseui.auth.widget.Config.CredentialHelper.NONE,
      },
      {
        emailHint: prefilledEmail,
      });

  assertProviderSignInPage();
  const buttons = getIdpButtons();
  assertEquals(2, buttons.length);
  assertEquals('google.com', goog.dom.dataset.get(buttons[0], 'providerId'));
  assertEquals('password', goog.dom.dataset.get(buttons[1], 'providerId'));

  // Click the sign in with email button.
  goog.testing.events.fireClickSequence(buttons[1]);

  testAuth.assertFetchSignInMethodsForEmail(
        ['user@example.com'],
        ['password']);
  return testAuth.process().then(() => {
    // Password sign-in page should be shown.
    assertPasswordSignInPage();
    // The prefilled email should be populated in the email entry.
    assertEquals(prefilledEmail, getEmailElement().value);
    // Clean up the AuthUI instance.
    testAuth.assertSignOut([]);
    app.delete();
    return testAuth.process();
  });
}


function testHandleProviderSignIn_signInHint_signInWithIdp_popup() {
  // Test sign in with IdP popup mode in provider sign-in handler with
  // signInHint.
  const prefilledEmail = 'user@example.com';
  const expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.setCustomParameters({
    // The prefilled email should be passed to IdP as login_hint.
    'login_hint': prefilledEmail,
  });

  app.startWithSignInHint(
      container,
      {
        signInOptions: ['google.com', 'password'],
        credentialHelper: firebaseui.auth.widget.Config.CredentialHelper.NONE,
        signInFlow: 'popup',
      },
      {
        emailHint: prefilledEmail,
      });

  assertProviderSignInPage();
  const buttons = getIdpButtons();
  assertEquals(2, buttons.length);
  assertEquals('google.com', goog.dom.dataset.get(buttons[0], 'providerId'));
  assertEquals('password', goog.dom.dataset.get(buttons[1], 'providerId'));

  // Click the sign in with IdP button.
  goog.testing.events.fireClickSequence(buttons[0]);

  // User should be signed in.
  testAuth.setUser({
    'email': prefilledEmail,
    'displayName': federatedAccount.getDisplayName()
  });
  const cred  = {
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  };
  // Sign in with popup triggered.
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
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');

    // Clean up the AuthUI instance.
    testAuth.assertSignOut([]);
    app.delete();
    return testAuth.process();
  });
}


function testHandleProviderSignIn_signInHint_signInWithIdp_redirect() {
  // Test sign in with IdP redirect mode in provider sign-in handler with
  // signInHint.
  const prefilledEmail = 'user@example.com';
  const expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.setCustomParameters({
    // The prefilled email should be passed to IdP as login_hint.
    'login_hint': prefilledEmail,
  });

  app.startWithSignInHint(
      container,
      {
        signInOptions: ['google.com', 'password'],
        credentialHelper: firebaseui.auth.widget.Config.CredentialHelper.NONE,
      },
      {
        emailHint: prefilledEmail,
      });

  assertProviderSignInPage();
  const buttons = getIdpButtons();
  assertEquals(2, buttons.length);
  assertEquals('google.com', goog.dom.dataset.get(buttons[0], 'providerId'));
  assertEquals('password', goog.dom.dataset.get(buttons[1], 'providerId'));

  // Click the sign in with IdP button.
  goog.testing.events.fireClickSequence(buttons[0]);

  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(() => {
    // Clean up the AuthUI instance.
    testAuth.assertSignOut([]);
    app.delete();
    return testAuth.process();
  });
}


function testHandleProviderSignIn_anonymousUpgrade_popup_success() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Test successful anonymous upgrade with popup flow.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // linkWithPopup on external Auth user should be triggered.
  externalAuth.currentUser.assertLinkWithPopup(
    [expectedProvider],
    function() {
      // Non-anonymous user should be signed in.
      externalAuth.setUser({
        'email': federatedAccount.getEmail(),
        'displayName': federatedAccount.getDisplayName()
      });
      return {
        'user': externalAuth.currentUser,
        'credential': cred
      };
    });
  return externalAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleProviderSignIn_anonymousUpgrade_popup_error() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Test upgrade failure with popup flow.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  // Expected linkWithPopup error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': cred,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      cred);
  // Simulate anonymous user on external instance.
  externalAuth.setUser(anonymousUser);
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // linkWithPopup called on external user and error simulated.
  externalAuth.currentUser.assertLinkWithPopup(
      [expectedProvider],
      null,
      expectedError);
  return externalAuth.process().then(function() {
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // signInFailure triggered with expected error.
    assertSignInFailure(expectedMergeError);
  });
}


function testHandleProviderSignIn_anonymousUpgrade_redirect_success() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Test successful sign in with redirect flow.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  externalAuth.setUser(anonymousUser);
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);
  externalAuth.runAuthChangeHandler();
  externalAuth.currentUser.assertLinkWithRedirect(
    [expectedProvider]);
  return externalAuth.process();
}


function testHandleProviderSignIn_anonymousUpgrade_redirect_error() {
  var expectedError = {'code': 'auth/network-request-failed'};
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Test successful sign in with redirect flow.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  externalAuth.setUser(anonymousUser);
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);
  externalAuth.runAuthChangeHandler();
  externalAuth.currentUser.assertLinkWithRedirect(
    [expectedProvider],
    null,
    expectedError);
  return externalAuth.process().then(function() {
    // Remain on provider sign-in page.
    assertProviderSignInPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError));
  });
}


function testHandleProviderSignIn_anonUpgrade_popup_emailInUse_fedLinking() {
  // Test provider sign-in with popup when federated linking required and an
  // eligible anonymous user is available for upgrade. Test when existing email
  // belongs to a federated account.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  // Expected linkWithPopup error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'credential': cred,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(), cred);
  // Trigger initial onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // Link with popup on external anonymous user triggers linking flow.
  externalAuth.currentUser.assertLinkWithPopup(
      [expectedProvider],
      null,
      expectedError);
  return externalAuth.process().then(function() {
    // Simulate existing account is a federated Facebook account.
    testAuth.assertFetchSignInMethodsForEmail(
        [federatedAccount.getEmail()], ['facebook.com']);
    return testAuth.process();
  }).then(function() {
    // The pending credential should be saved here.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getPendingEmailCredential(app.getAppId()));
    // Federated linking triggered.
    assertFederatedLinkingPage(federatedAccount.getEmail());
  });
}


function testHandleProviderSignIn_anonUpgrade_popup_emailInUse_passLinking() {
  // Test provider sign-in with popup when federated linking required and an
  // eligible anonymous user is available for upgrade. Test when existing email
  // belongs to a password account.
  // Add additional scopes to test that they are properly passed to the sign-in
  // method.
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({'prompt': 'select_account'});
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('popup');
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  var cred  = firebaseui.auth.idp.getAuthCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  // Expected linkWithPopup error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'credential': cred,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(), cred);
  // Trigger initial onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // Link with popup on external anonymous user triggers linking flow.
  externalAuth.currentUser.assertLinkWithPopup(
      [expectedProvider],
      null,
      expectedError);
  return externalAuth.process().then(function() {
    // Simulate existing account is a password account.
    testAuth.assertFetchSignInMethodsForEmail(
        [federatedAccount.getEmail()], ['password']);
    return testAuth.process();
  }).then(function() {
    // The pending email credential should be cleared at this point.
    // Password linking does not require a redirect so no need to save it
    // anyway.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Password linking page rendered.
    assertPasswordLinkingPage(federatedAccount.getEmail());
  });
}
