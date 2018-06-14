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
 * @fileoverview Test for sign-in handler.
 */

goog.provide('firebaseui.auth.widget.handler.SignInTest');
goog.setTestOnly('firebaseui.auth.widget.handler.SignInTest');

goog.require('firebaseui.auth.CredentialHelper');
goog.require('firebaseui.auth.storage');
/** @suppress {extraRequire} Required for page navigation to work. */
goog.require('firebaseui.auth.widget.handler.handleFederatedSignIn');
goog.require('firebaseui.auth.widget.handler.handlePasswordRecovery');
/** @suppress {extraRequire} Required for page navigation to work. */
goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');


function testHandleSignIn() {
  // Test with signInOptions containing additional scopes and confirm oauthScope
  // field correctly populated in createAuthUri request.
  app.updateConfig('signInOptions', signInOptionsWithScopes);
  firebaseui.auth.widget.handler.handleSignIn(app, container);
  assertSignInPage();
  assertTosPpFooter('http://localhost/tos', 'http://localhost/privacy_policy');

  // Now email input has 'user', which is not a valid email address.
  var emailInput = getEmailElement();
  goog.dom.forms.setValue(emailInput, 'user');
  emailInput.focus();
  var inputEvent = new goog.testing.events.Event(
      goog.events.EventType.INPUT, emailInput);
  inputEvent.keyCode = goog.events.KeyCodes.R;
  goog.testing.events.fireBrowserEvent(inputEvent);

  // Enter key ignored.
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);
  assertSignInPage();

  // Now email input has 'user@example.com', which is a valid email address.
  goog.dom.forms.setValue(emailInput, 'user@example.com');
  emailInput.focus();
  inputEvent = new goog.testing.events.Event(
      goog.events.EventType.INPUT, emailInput);
  inputEvent.keyCode = goog.events.KeyCodes.M;
  goog.testing.events.fireBrowserEvent(inputEvent);

  // Enter key triggers fetchSignInMethodsForEmail.
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);

  testAuth.assertFetchSignInMethodsForEmail(
      ['user@example.com'],
      ['password']);
  return testAuth.process().then(function() {
    assertPasswordSignInPage();
    assertTrue(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
  });
}


function testHandleSignIn_cancelButtonClick_multipleProviders() {
  app.setConfig({
    'tosUrl': undefined,
    'privacyPolicyUrl': undefined
  });
  firebaseui.auth.widget.handler.handleSignIn(app, container);
  assertSignInPage();
  assertTosPpFooter(null, null);
  // Click cancel.
  clickSecondaryLink();
  // Provider sign in page should be rendered.
  assertProviderSignInPage();
}


function testHandleSignIn_cancelButtonClick_emailProviderOnly() {
  // Simulate existing password account selected in accountchooser.com.
  testAc.setSelectedAccount(passwordAccount);
  app.updateConfig('signInOptions', ['password']);
  firebaseui.auth.widget.handler.handleSignIn(
      app, container, passwordAccount.getEmail());
  assertSignInPage();
  // Only password provider is the configured, signIn page is the first page,
  // full message should be displayed.
  assertTosPpFullMessage(
      'http://localhost/tos', 'http://localhost/privacy_policy');
  // Click cancel.
  clickSecondaryLink();
  // handleSignInWithEmail should be called underneath.
  // If accountchoose.com is enabled, page will redirect to it.
  testAuth.assertFetchSignInMethodsForEmail(
      [passwordAccount.getEmail()],
      ['password']);
  testAuth.process().then(function() {
    assertPasswordSignInPage();
    var emailInput = getEmailElement();
    assertEquals(
        passwordAccount.getEmail(), goog.dom.forms.getValue(emailInput));
  });
}


function testHandleSignIn_acDisabled_emailProviderOnly() {
  // Simulate accountchooser.com disabled and email provider only.
  // No cancel button should be displayed.
  app.setConfig({
    'credentialHelper': firebaseui.auth.CredentialHelper.NONE,
    'signInOptions': [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    'tosUrl': undefined,
    'privacyPolicyUrl': undefined
  });
  firebaseui.auth.widget.handler.handleSignIn(
      app, container, passwordAccount.getEmail());
  assertSignInPage();
  assertTosPpFullMessage(null, null);
  // No cancel button.
  assertNull(getCancelButton());
}


function testHandleSignIn_acEnabled_emailProviderOnly() {
  // Simulate accountchooser.com enabled and email provider only.
  // Cancel button should still be displayed.
  app.setConfig({
    'credentialHelper': firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
    'signInOptions': [firebase.auth.EmailAuthProvider.PROVIDER_ID]
  });
  firebaseui.auth.widget.handler.handleSignIn(
      app, container, passwordAccount.getEmail());
  assertSignInPage();
  assertTosPpFullMessage(
      'http://localhost/tos', 'http://localhost/privacy_policy');
  // Cancel button available.
  assertNotNull(getCancelButton());
}


function testHandleSignIn_acDisabled_multiProviders() {
  // Simulate accountchooser.com disabled and multiple auth providers.
  // Cancel button should still be displayed.
  app.setConfig({
    'credentialHelper': firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
    'signInOptions': [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ]
  });
  firebaseui.auth.widget.handler.handleSignIn(
      app, container, passwordAccount.getEmail());
  assertSignInPage();
  assertTosPpFooter('http://localhost/tos', 'http://localhost/privacy_policy');
  // Cancel button available.
  assertNotNull(getCancelButton());
}


function testHandleSignIn_accountLookupError() {
  // Test when account lookup throws an error.
  var expectedError = {
    'code': 'auth/invalid-email',
    'message': 'The email address is badly formatted.'
  };
  app.updateConfig('signInOptions', signInOptionsWithScopes);
  firebaseui.auth.widget.handler.handleSignIn(app, container);
  assertSignInPage();

  // Now email input has 'user', which is not a valid email address.
  var emailInput = getEmailElement();
  // Pass an invalid email that will pass client side validation.
  goog.dom.forms.setValue(emailInput, 'me.@google.com');
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);
  assertSignInPage();

  // Enter key triggers fetchSignInMethodsForEmail.
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);

  testAuth.assertFetchSignInMethodsForEmail(
      ['me.@google.com'],
      null,
      expectedError);
  return testAuth.process().then(function() {
    // Should remain on the same page.
    assertSignInPage();
    // Account should not be remembered.
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    // Error message should be displayed in the info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError));
  });
}


function testHandleSignIn_reset() {
  // Test when reset is called after sign-in handler called.
  firebaseui.auth.widget.handler.handleSignIn(app, container);
  assertSignInPage();
  // Reset current rendered widget page.
  app.getAuth().assertSignOut([]);
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandleSignIn_federatedSignIn() {
  firebaseui.auth.widget.handler.handleSignIn(app, container);
  assertSignInPage();
  var emailInput = getEmailElement();
  goog.dom.forms.setValue(emailInput, 'user@example.com');
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);
  testAuth.assertFetchSignInMethodsForEmail(
      ['user@example.com'],
      ['google.com']);
  return testAuth.process().then(function() {
    assertFederatedLinkingPage();
  });
}


function testHandleSignIn_accountChooserDisabled() {
  // Test that when credential helpers are disabled, remember account is not
  // shown and is disabled.
  app.updateConfig('credentialHelper', firebaseui.auth.CredentialHelper.NONE);
  firebaseui.auth.widget.handler.handleSignIn(app, container);
  assertSignInPage();
  var emailInput = getEmailElement();
  goog.dom.forms.setValue(emailInput, 'user@example.com');
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);

  testAuth.assertFetchSignInMethodsForEmail(
      ['user@example.com'],
      ['password']);
  return testAuth.process().then(function() {
    assertPasswordSignInPage();
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
  });
}


function testHandleSignIn_inProcessing() {
  // Test with signInOptions containing additional scopes and confirm oauthScope
  // field correctly populated in createAuthUri request.
  app.updateConfig('signInOptions', signInOptionsWithScopes);
  firebaseui.auth.widget.handler.handleSignIn(app, container);
  assertSignInPage();
  var emailInput = getEmailElement();
  // Enable indicator.
  goog.dom.forms.setValue(emailInput, 'user@example.com');
  emailInput.focus();
  var inputEvent = new goog.testing.events.Event(
      goog.events.EventType.INPUT, emailInput);
  inputEvent.keyCode = goog.events.KeyCodes.M;
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);
  delayForBusyIndicatorAndAssertIndicatorShown();

  testAuth.assertFetchSignInMethodsForEmail(
      ['user@example.com'], null, {
        'code': 'auth/internal-error'
      });
  return testAuth.process()
      .then(function() {
        assertBusyIndicatorHidden();

        // Submit again.
        goog.testing.events.fireKeySequence(emailInput,
            goog.events.KeyCodes.ENTER);
        testAuth.assertFetchSignInMethodsForEmail(
            ['user@example.com'],
            ['password']);
        return testAuth.process();
      })
      .then(function() {
        assertPasswordSignInPage();
      });
}
