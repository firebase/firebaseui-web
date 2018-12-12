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
 * @fileoverview Test for email link sign in sent handler.
 */

goog.provide('firebaseui.auth.widget.handler.EmailLinkSignInSentTest');
goog.setTestOnly('firebaseui.auth.widget.handler.EmailLinkSignInSentTest');

goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInSent');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailNotReceived');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.testing.recordFunction');


function testHandleEmailLinkSignInSent_troubleGettingEmail() {
  // Test trouble getting email clicked.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings();
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkSignInSent(
      app, container, 'user@example.com', cancelButtonCallback);
  assertEmailLinkSignInSentPage();

  // Click trouble getting email button.
  clickTroubleGettingEmailLink();
  assertEmailNotReceivedPage();

  // Click resend button in email not received page.
  clickResendEmailLink();
  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    // Verify that email has been stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    // Email link sent page is displayed again after resending the email link.
    assertEmailLinkSignInSentPage();
    // Verfiy that the same onCancelClick handler is passed from email link
    // sign in sent page to email not received page and then back to email link
    // sign in sent page.
    assertEquals(0, cancelButtonCallback.getCallCount());
    clickSecondaryLink();
    assertEquals(1, cancelButtonCallback.getCallCount());
    assertComponentDisposed();
  });
}


function testHandleEmailLinkSignInSent_troubleGettingEmail_pendingCredential() {
  // Test trouble getting email clicked when pending credential is available.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
     'user@example.com', credential);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, 'facebook.com');
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkSignInSent(
      app, container, 'user@example.com', cancelButtonCallback,
      pendingEmailCred);
  assertEmailLinkSignInSentPage();

  // Click trouble getting email button.
  clickTroubleGettingEmailLink();
  assertEmailNotReceivedPage();

  // Click resend button in email not received page.
  clickResendEmailLink();
  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    // Verify that email has been stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
     // Pending credential should be encrypted and saved in cookie storage.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getEncryptedPendingCredential(
            'SESSIONID', app.getAppId()));
    // Email link sent page is displayed again after resending the email link.
    assertEmailLinkSignInSentPage();
    // Verfiy that the same onCancelClick handler is passed from email link
    // sign in sent page to email not received page and then back to email link
    // sign in sent page.
    assertEquals(0, cancelButtonCallback.getCallCount());
    clickSecondaryLink();
    assertEquals(1, cancelButtonCallback.getCallCount());
    assertComponentDisposed();
  });
}


function testHandleEmailLinkSignInSent_trouble_pendingCred_anonUpgrade() {
  // Test trouble getting email clicked when pending credential is available for
  // anonymous upgrade flow.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  var credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
     'user@example.com', credential);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, 'facebook.com', anonymousUser['uid']);
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkSignInSent(
      app, container, 'user@example.com', cancelButtonCallback,
      pendingEmailCred);
  assertEmailLinkSignInSentPage();

  // Click trouble getting email button.
  clickTroubleGettingEmailLink();
  assertEmailNotReceivedPage();

  // Click resend button in email not received page.
  clickResendEmailLink();
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  return externalAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    // Verify that email has been stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
     // Pending credential should be encrypted and saved in cookie storage.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getEncryptedPendingCredential(
            'SESSIONID', app.getAppId()));
    // Email link sent page is displayed again after resending the email link.
    assertEmailLinkSignInSentPage();
    // Verfiy that the same onCancelClick handler is passed from email link
    // sign in sent page to email not received page and then back to email link
    // sign in sent page.
    assertEquals(0, cancelButtonCallback.getCallCount());
    clickSecondaryLink();
    assertEquals(1, cancelButtonCallback.getCallCount());
    assertComponentDisposed();
  });
}


function testHandleEmailLinkSignInSent_back() {
  // Test back clicked.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkSignInSent(
      app, container, 'user@example.com', cancelButtonCallback);
  assertEmailLinkSignInSentPage();
  assertEquals(0, cancelButtonCallback.getCallCount());

  // Click cancel button.
  clickSecondaryLink();
  // On cancel handler should be triggered and current page should be disposed.
  assertEquals(1, cancelButtonCallback.getCallCount());
  assertComponentDisposed();
}
