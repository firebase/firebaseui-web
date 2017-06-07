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
goog.require('firebaseui.auth.CredentialHelper');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.acClient');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} Required for multiple app rendering test. */
goog.require('firebaseui.auth.widget.handler.handleCallback');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
/** @suppress {extraRequire} Required for accountchooser.com fed account
 *      selection. */
goog.require('firebaseui.auth.widget.handler.handleFederatedSignIn');
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
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');


var buttons;
var signInOptions;


/**
 * Sets up the provider sign-in page and verifies it was rendered correctly.
 * @param {!firebaseui.auth.widget.Config.SignInFlow} flow The sign-in flow.
 * @param {boolean=} opt_ignoreConfig Whether to ignore config setting assuming
 *     it was set externally.
 */
function setupProviderSignInPage(flow, opt_ignoreConfig) {
  // Test provider sign-in handler.
  signInOptions = [{
    'provider': 'google.com',
    'scopes': ['googl1', 'googl2'],
    'customParameters': {'prompt': 'select_account'}
  }, 'facebook.com', 'password', 'phone'];
  if (!opt_ignoreConfig) {
    app.setConfig({
      'signInOptions': signInOptions,
      'signInFlow': flow
    });
  }
  // Set sign-in options.
  app.updateConfig('signInOptions', signInOptions);
  firebaseui.auth.widget.handler.handleProviderSignIn(app, container);
  assertProviderSignInPage();
  buttons = getIdpButtons();
  assertEquals(signInOptions.length, buttons.length);
  assertEquals('google.com', goog.dom.dataset.get(buttons[0], 'providerId'));
  assertEquals('facebook.com', goog.dom.dataset.get(buttons[1], 'providerId'));
  assertEquals('password', goog.dom.dataset.get(buttons[2], 'providerId'));
  assertEquals('phone', goog.dom.dataset.get(buttons[3], 'providerId'));
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
  // Click the first button, which is Google IdP.
  goog.testing.events.fireClickSequence(buttons[0]);

  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process();
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
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
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
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [cred], externalAuth.currentUser);
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
  testAuth.assertFetchProvidersForEmail(
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
  testAuth.assertFetchProvidersForEmail(
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
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
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


function testHandleProviderSignIn_signInWithEmail_unregisteredPassAcct() {
  // Test provider sign-in handler when sign in with email is clicked and an
  // unregistered password account is selected in accountchooser.com.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  testAc.setSelectedAccount(passwordAccount);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()],
      []);
  testAuth.process().then(function() {
    // Unregistered password account should be treated as password sign up in
    // provider first display mode.
    assertPasswordSignUpPage();
    assertEquals(
        passwordAccount.getEmail(),
        goog.dom.forms.getValue(getEmailElement()));
    assertEquals(
        passwordAccount.getDisplayName(),
        goog.dom.forms.getValue(getNameElement()));
    assertTrue(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    // Force UI shown callback should be set to false.
    assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
  });
}


function testHandleProviderSignIn_acCallbacks_acInitialized() {
  // Test provider sign-in mode with accountchooser.com callbacks provided.
  // Test when accountchooser.com client js is already initialized.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Render the provider sign-in page and confirm it was rendered correctly.
  setupProviderSignInPage('redirect');
  // Simulate empty response from accountchooser.com click.
  testAc.setSkipSelect(true);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // Sign-in page should show.
  assertSignInPage();
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
  // Force UI shown callback should be set to false.
  assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);

  // Enter an email and submit.
  var emailInput = getEmailElement();
  goog.dom.forms.setValue(emailInput, 'user@example.com');
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);
  testAuth.assertFetchProvidersForEmail(
      ['user@example.com'],
      ['password']);
  return testAuth.process().then(function() {
    assertPasswordSignInPage();

    // Now that accountchooser.com is initialized, test again. Navigate user
    // back to provider sign-in and click again.

    // Click problem signing in.
    clickSecondaryLink();
    assertPasswordRecoveryPage();

    // Cancel button clicked.
    goog.testing.events.fireClickSequence(
        goog.dom.getElementByClass('firebaseui-id-secondary-link', container));
    // Should go back to provider sign-in page.
    assertProviderSignInPage();
    buttons = getIdpButtons();
    // Set accountchooser.com callbacks.
    app.setConfig({
      'callbacks': {
        'accountChooserResult': accountChooserResultCallback,
        'accountChooserInvoked': accountChooserInvokedCallback
      }
    });
    // Click the third button, which is sign in with email button.
    goog.testing.events.fireClickSequence(buttons[2]);
    // Confirm accountChooserInvoked callback is called, and run on
    // continue function.
    assertAndRunAccountChooserInvokedCallback();
    // Empty response returned from accountchooser.com.
    assertAndRunAccountChooserResultCallback('empty');
    // Try select should be called.
    testAc.assertTrySelectAccount(
        firebaseui.auth.storage.getRememberedAccounts(app.getAppId()),
        'http://localhost/firebaseui-widget?mode=select');
    // Sign-in page should show.
    assertSignInPage();
    // Force UI shown callback should be set to false.
    assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
  });
}


function testHandleProviderSignIn_acCallbacks_unavailable() {
  // Test provider sign-in handler when sign in with email is clicked and
  // credential helpers are disabled with accountchooser.com callbacks provided.
  testAc.setSkipSelect(true);
  testAc.setAvailability(false);
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Set accountchooser.com callbacks.
  app.setConfig({
    'signInOptions': signInOptions,
    'credentialHelper': firebaseui.auth.CredentialHelper.NONE,
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // Confirm accountChooserInvoked callback is called, and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // accountchooser.com unavailable.
  assertAndRunAccountChooserResultCallback('unavailable');
  // The sign-in page should show.
  assertSignInPage();
  // Force UI shown callback should be set to false.
  assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
}


function testHandleProviderSignIn_acCallbacks_empty() {
  // Test provider sign-in handler when sign in with email is clicked and
  // accountchooser.com is empty with accountchooser.com callbacks provided.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Set accountchooser.com callbacks.
  app.setConfig({
    'signInOptions': signInOptions,
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Simulate empty response from accountchooser.com returned.
  testAc.setSkipSelect(true);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // Confirm accountChooserInvoked callback is called, and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Empty result returned from accountchooser.com.
  assertAndRunAccountChooserResultCallback('empty');
  // Sign-in page should show.
  assertSignInPage();
  // Force UI shown callback should be set to false.
  assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
}


function testHandleProviderSignIn_acCallbacks_newPasswordAccount() {
  // Test provider sign-in handler with accountchooser.com callbacks provided
  // when sign in with email is clicked and a new password account is selected
  // from accountchooser.com.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Set accountchooser.com callbacks.
  app.setConfig({
    'signInOptions': signInOptions,
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Simulate password account selected from accountchooser.com.
  testAc.setSelectedAccount(passwordAccount);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // No pending accountchooser.com response which will trigger try select.
  testAc.forceOnEmpty();
  // Confirm accountChooserInvoked callback is called, and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Existing account selected logged.
  assertAndRunAccountChooserResultCallback('accountSelected');
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()],
      []);
  return testAuth.process().then(function() {
    // New password account should be treated as password sign up in
    // provider first display mode.
    assertPasswordSignUpPage();
    assertEquals(
        passwordAccount.getEmail(),
        goog.dom.forms.getValue(getEmailElement()));
    assertEquals(
        passwordAccount.getDisplayName(),
        goog.dom.forms.getValue(getNameElement()));
    // Force UI shown callback should be set to false.
    assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
  });
}


function testHandleProviderSignIn_acCallbacks_existingFederatedAccount() {
  // Test provider first mode select from accountchooser.com when
  // accountchooser.com callbacks are provided.
  // Test when a federated account is selected from accountchooser.com.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Set accountchooser.com callbacks.
  app.setConfig({
    'signInOptions': signInOptionsWithScopes,
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Simulate existing federated account selected from accountchooser.com.
  testAc.setSelectedAccount(federatedAccount);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // No pending accountchooser.com response which will trigger try select.
  testAc.forceOnEmpty();
  // Confirm accountChooserInvoked callback is called, and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Existing account selected logged.
  assertAndRunAccountChooserResultCallback('accountSelected');
  testAuth.assertFetchProvidersForEmail(
      [federatedAccount.getEmail()],
      ['google.com']);
  return testAuth.process().then(function() {
    assertFederatedLinkingPage(federatedAccount.getEmail());
    assertTrue(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    // Force UI shown callback should be set to false.
    assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
  });
}


function testHandleProviderSignIn_acCallbacks_addAccount() {
  // Test provider first mode select from accountchooser.com when
  // accountchooser.com callbacks are provided.
  // Test when "Add Account" is selected from accountchooser.com.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Set accountchooser.com callbacks.
  app.setConfig({
    'signInOptions': signInOptions,
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Simulate "Add Account" in accountchooser.com click.
  testAc.setAddAccount();
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // No pending accountchooser.com response which will trigger try select.
  testAc.forceOnEmpty();
  // Confirm accountChooserInvoked callback is called, and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Add account selected logged.
  assertAndRunAccountChooserResultCallback('addAccount');
  // Sign-in page should show.
  assertSignInPage();
  // Force UI shown callback should be set to false.
  assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
}


function testHandleProviderSignIn_signInWithEmail_registeredPassAcct() {
  // Test provider sign-in handler when sign in with email is clicked and a
  // registered password account is selected in accountchooser.com.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Test with signInOptions containing additional scopes and confirm oauthScope
  // field correctly populated in createAuthUri request.
  // Set display mode to provider first (provider first only used for that case.
  app.setConfig({
    'signInOptions': signInOptionsWithScopes
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  testAc.setSelectedAccount(passwordAccount);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()],
      ['password']);
  return testAuth.process().then(function() {
    assertPasswordSignInPage();
    assertEquals(
        passwordAccount.getEmail(), goog.dom.forms.getValue(getEmailElement()));
    assertEquals(0, getIdpButtons().length);
    assertTrue(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    // Force UI shown callback should be set to false.
    assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
  });
}


function testHandleProviderSignIn_signInWithEmail_registeredFedAcct() {
  // Test provider sign-in handler when sign in with email is clicked and a
  // registered federated account is selected in accountchooser.com.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Test with signInOptions containing additional scopes.
  app.setConfig({
    'signInOptions': signInOptionsWithScopes,
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  testAc.setSelectedAccount(federatedAccount);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  testAuth.assertFetchProvidersForEmail(
      [federatedAccount.getEmail()],
      ['google.com']);
  return testAuth.process().then(function() {
    assertFederatedLinkingPage(federatedAccount.getEmail());
    // Force UI shown callback should be set to false.
    assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
  });
}


function testHandleProviderSignIn_signInWithEmail_error() {
  // Test provider sign-in handler when sign in with email request returns
  // error.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Test with signInOptions containing additional scopes.
  app.setConfig({
    'signInOptions': signInOptionsWithScopes,
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  testAc.setSelectedAccount(federatedAccount);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);

  testAuth.assertFetchProvidersForEmail(
      [federatedAccount.getEmail()], null, internalError);
  return testAuth.process().then(function() {
    // Unregistered federated account should be treated as password sign up in
    // provider first display mode.
    assertProviderSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    // Force UI shown callback should be set to false.
    assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
  });
}


function testHandleProviderSignIn_signInWithEmail_addAccount() {
  // Test provider sign-in handler when sign in with email is clicked and add
  // account is selected in accountchooser.com.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Test with signInOptions containing additional scopes.
  app.setConfig({
    'signInOptions': signInOptionsWithScopes,
    'callbacks': {
      'uiShown': uiShownCallback
    }
  });
  assertEquals(uiShownCallbackCount, 0);
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Simulate add account in accountchooser.com click.
  testAc.setAddAccount();
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // Sign-in page should show.
  assertSignInPage();
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
  assertEquals(uiShownCallbackCount, 1);
  // Force UI shown callback should be set to false.
  assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
}


function testHandleProviderSignIn_signInWithEmail_skipAccount() {
  // Test provider sign-in handler when sign in with email is clicked and
  // accountchooser.com is skipped.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Test with signInOptions containing additional scopes.
  app.setConfig({
    'signInOptions': signInOptionsWithScopes,
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Simulate empty response from accountchooser.com click.
  testAc.setSkipSelect(true);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // Sign-in page should show.
  assertSignInPage();
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
  // Force UI shown callback should be set to false.
  assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
}


function testHandleProviderSignIn_signInWithEmail_acInitialized() {
  // Test provider sign-in handler when sign in with email is clicked and
  // accountchooser.com client js is already initialized.
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Test with signInOptions containing additional scopes.
  app.setConfig({
    'signInOptions': signInOptionsWithScopes,
  });
  // Render provider sign-in using previous config.
  setupProviderSignInPage('redirect', true);
  // Simulate empty response from accountchooser.com click.
  testAc.setSkipSelect(true);
  // Click the third button, which is sign in with email button.
  goog.testing.events.fireClickSequence(buttons[2]);
  // Sign-in page should show.
  assertSignInPage();
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
  // Force UI shown callback should be set to false.
  assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);

  // Now that accountchooser.com is initialized, test again. Navigate user back
  // to provider sign-in and click again.

  // Enter an email and submit.
  var emailInput = getEmailElement();
  goog.dom.forms.setValue(emailInput, 'user@example.com');
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);
  testAuth.assertFetchProvidersForEmail(
      ['user@example.com'],
      ['password']);
  return testAuth.process().then(function() {
    assertPasswordSignInPage();

    // Click problem signing in.
    clickSecondaryLink();
    assertPasswordRecoveryPage();

    // Cancel button clicked.
    goog.testing.events.fireClickSequence(
        goog.dom.getElementByClass('firebaseui-id-secondary-link', container));

    // Should go back to provider sign-in page.
    assertProviderSignInPage();
    buttons = getIdpButtons();
    // Click the third button, which is sign in with email button.
    goog.testing.events.fireClickSequence(buttons[2]);
    // Try select should be called.
    testAc.assertTrySelectAccount(
        firebaseui.auth.storage.getRememberedAccounts(app.getAppId()),
        'http://localhost/firebaseui-widget?mode=select');
    // On skip, skip select called.
    assertSignInPage();
    // Force UI shown callback should be set to false.
    assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
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
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [cred], externalAuth.currentUser);
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


function testHandleProviderSignIn_signInWithEmail_acDisabled() {
  // Test provider sign-in handler when sign in with email is clicked and
  // credential helpers are disabled in configuration.
  // Skip select.
  testAc.setSkipSelect(true);
  testAc.setAvailability(false);
  // Assume force UI shown callback set to true. It should be set to false in
  // the routine below.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = true;
  // Disable any credential helper.
  app.setConfig({
    'signInOptions': signInOptions,
    'credentialHelper': firebaseui.auth.CredentialHelper.NONE,
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
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
  // No accountchooser.com, so UI shown callback should not be shown.
  assertEquals(uiShownCallbackCount, 0);
  // Force UI shown callback should be set to false.
  assertFalse(firebaseui.auth.widget.handler.common.acForceUiShown_);
}


function testHandleProviderSignIn_accountChooserSelect_appChange() {
  // Test when selectAccountChooser is first called with a different app,
  // then a new app is initialized, and try select is called. The second app's
  // config should be used.
  testStubs.reset();
  // Simulate empty response from accountchooser.com click.
  testAc.setSkipSelect(true);
  // Initialize another test app. Install external instance.
  var app2 = new firebaseui.auth.AuthUI(externalAuth.install(), 'appId2');
  // Install internal instance.
  var testAuth2 = app2.getAuth().install();
  // Simulate current SELECT mode.
  testStubs.set(
      firebaseui.auth.widget.dispatcher,
      'getMode_',
      function(app) {
        return firebaseui.auth.widget.Config.WidgetMode.SELECT;
      });
  // Simulate accountchooser.com is loaded.
  testStubs.set(
      firebaseui.auth.widget.handler.common,
      'loadAccountchooserJs',
      function(app, callback, opt_forceUiShownCallback) {
        callback();
      });
  // Save remembered account for each app.
  firebaseui.auth.storage.rememberAccount(federatedAccount, app.getAppId());
  firebaseui.auth.storage.rememberAccount(passwordAccount, app2.getAppId());
  // accountchooser.com client not yet initialized at this point.
  assertFalse(firebaseui.auth.acClient.isInitialized());
  // Initialize first app.
  app.start(container, {
    'signInSuccessUrl': 'http://localhost/home',
    'widgetUrl': 'http://localhost/firebaseui-widget',
    'signInOptions': ['google.com', 'facebook.com', 'password'],
    'siteName': 'Test Site',
    'popupMode': false,
    'tosUrl': 'http://localhost/tos',
    'credentialHelper': firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
  });
  // Callback page should be rendered.
  assertCallbackPage();
  // accountchooser.com client initialized at this point.
  assertTrue(firebaseui.auth.acClient.isInitialized());
  // First app's AuthUI widget is now rendered.
  assertEquals(app, firebaseui.auth.AuthUI.getAuthUi());
  // Reset app.
  app.reset();
  // Render second app.
  var signInOptions = ['google.com', 'password'];
  app2.start(container, {
    'widgetUrl': 'http://localhost/firebaseui-widget2',
    'signInOptions': signInOptions
  });
  // Second app's AuthUI widget is now rendered.
  assertEquals(app2, firebaseui.auth.AuthUI.getAuthUi());
  // Since accountchooser.com client is already initialized, provider sign in
  // rendered directly.
  assertProviderSignInPage();
  var buttons = getIdpButtons();
  assertEquals(signInOptions.length, buttons.length);
  assertEquals('google.com', goog.dom.dataset.get(buttons[0], 'providerId'));
  assertEquals('password', goog.dom.dataset.get(buttons[1], 'providerId'));
  // Click the sign in with email button.
  goog.testing.events.fireClickSequence(buttons[1]);
  // Confirm app2 remembered accounts.
  assertArrayEquals(
      [passwordAccount],
      firebaseui.auth.storage.getRememberedAccounts(app2.getAppId()));
  // The widgetUrl provided by app2 should be used as well as app2 remembered
  // account.
  testAc.assertTrySelectAccount(
      firebaseui.auth.storage.getRememberedAccounts(app2.getAppId()),
      'http://localhost/firebaseui-widget2?mode=select');
  // Sign-in page should show.
  assertSignInPage();
  // Sign in with existing email account.
  var emailInput = getEmailElement();
  goog.dom.forms.setValue(emailInput, 'user@example.com');
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);

  testAuth2.assertFetchProvidersForEmail(
      ['user@example.com'],
      ['password']);
  // Account not yet saved.
  assertFalse(firebaseui.auth.storage.isRememberAccount(app2.getAppId()));
  return testAuth2.process().then(function() {
    // Password sign-in page should be rendered and account should be saved for
    // app2.
    assertPasswordSignInPage();
    assertTrue(firebaseui.auth.storage.isRememberAccount(app2.getAppId()));
    // Uninstall internal and external auth instances.
    app2.getAuth().uninstall();
    app2.getExternalAuth().uninstall();
  });
}
