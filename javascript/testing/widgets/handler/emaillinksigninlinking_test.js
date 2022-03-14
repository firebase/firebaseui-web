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
 * @fileoverview Test for email link sign in linking handler.
 */

goog.provide('firebaseui.auth.widget.handler.EmailLinkSignInLinkingTest');
goog.setTestOnly('firebaseui.auth.widget.handler.EmailLinkSignInLinkingTest');

goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInLinking');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInSent');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');


var pendingEmailCred = null;

/**
 * Creates and saves the credentials, necessary for the view to load.
 */
function setPendingEmailCredentials() {
  // Pending credential stored.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
     'user@example.com', credential);
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCred, app.getAppId());
}


function testHandleEmailLinkSignInLinking() {
  setPendingEmailCredentials();
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, 'facebook.com');

  firebaseui.auth.widget.handler.handleEmailLinkSignInLinking(
      app, container, 'user@example.com');
  assertEmailLinkSignInLinkingPage('user@example.com', 'Facebook');

  // Click sign in button.
  submitForm();

  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    assertEmailLinkSignInSentPage();
    // Pending credential should be deleted.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Email for email link sign in should be stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    // Pending credential should be encrypted and saved in cookie storage.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getEncryptedPendingCredential(
            'SESSIONID', app.getAppId()));
  });
}


function testHandleEmailLinkSignInLinking_anonymousUpgrade() {
  // Test email link linking handler for anonymous upgrade flow.
  setPendingEmailCredentials();
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, 'facebook.com', anonymousUser['uid']);

  firebaseui.auth.widget.handler.handleEmailLinkSignInLinking(
      app, container, 'user@example.com');
  assertEmailLinkSignInLinkingPage('user@example.com', 'Facebook');

  // Click sign in button.
  submitForm();

  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  return externalAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    assertEmailLinkSignInSentPage();
    // Pending credential should be deleted.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Email for email link sign in should be stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    // Pending credential should be encrypted and saved in cookie storage.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getEncryptedPendingCredential(
            'SESSIONID', app.getAppId()));
  });
}


function testHandleEmailLinkSignInLinking_networkError() {
  // Test that if network error is thrown while sending the email, it should
  // remain on the same page so user can re-try.
  setPendingEmailCredentials();
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, 'facebook.com');
  var networkError = {
    'code': 'auth/network-request-failed',
    'message': 'MESSAGE.'
  };

  firebaseui.auth.widget.handler.handleEmailLinkSignInLinking(
      app, container, 'user@example.com');
  assertEmailLinkSignInLinkingPage('user@example.com', 'Facebook');

  // Click sign in button.
  submitForm();

  return testAuth.process().then(function() {
    // Simulate network error is thrown.
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings], null, networkError);
    return testAuth.process();
  }).then(function() {
    // If network error is thrown, it should remain on the same page.
    assertEmailLinkSignInLinkingPage('user@example.com', 'Facebook');
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(networkError));
    // Pending credential and email for email link sign in should be cleared.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(
        firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
  });
}


function testHandleEmailLinkSignInLinking_error() {
  setPendingEmailCredentials();
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, 'facebook.com');

  firebaseui.auth.widget.handler.handleEmailLinkSignInLinking(
      app, container, 'user@example.com');
  assertEmailLinkSignInLinkingPage('user@example.com', 'Facebook');

  // Click sign in button.
  submitForm();

  return testAuth.process().then(function() {
    // Simulate internal error is thrown.
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings], null, internalError);
    return testAuth.process();
  }).then(function() {
    // Go back to the starting page for error cases.
    assertProviderSignInPage();
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    // Pending credential and email for email link sign in should be cleared.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(
        firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
  });
}
