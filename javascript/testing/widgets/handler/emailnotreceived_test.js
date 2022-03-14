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
 * @fileoverview Test for email not received handler.
 */

goog.provide('firebaseui.auth.widget.handler.EmailNotReceivedTest');
goog.setTestOnly('firebaseui.auth.widget.handler.EmailNotReceivedTest');

goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInSent');
goog.require('firebaseui.auth.widget.handler.handleEmailNotReceived');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.testing.recordFunction');


function testHandleEmailNotReceived_resend() {
  // Test resend email link.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings();
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailNotReceived(
      app, container, 'user@example.com', cancelButtonCallback);
  assertEmailNotReceivedPage();

  // Click resend button.
  clickResendEmailLink();
  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    // Verify that email has been stored after resending email link.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    // Email link sent page should be rendered.
    assertEmailLinkSignInSentPage();

    // Verfiy that the onCancelClick handler is passed to email link sign in
    // sent page.
    assertEquals(0, cancelButtonCallback.getCallCount());
    // Click cancel button.
    clickSecondaryLink();
    assertEquals(1, cancelButtonCallback.getCallCount());
    assertComponentDisposed();
  });
}


function testHandleEmailNotReceived_resend_error() {
  // Test resending email link throws error.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings();
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailNotReceived(
      app, container, 'user@example.com', cancelButtonCallback);
  assertEmailNotReceivedPage();

  // Click resend button.
  clickResendEmailLink();
  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings], null, internalError);
    return testAuth.process();
  }).then(function() {
    // Verify that email is not stored.
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // The same page should remain visible.
    assertEmailNotReceivedPage();
    // Confirm expected error message shown in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleEmailNotReceived_resend_pendingCredential() {
  // Test resend email link with pending credential.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
     'user@example.com', credential);
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, pendingEmailCred.getCredential().providerId);
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailNotReceived(
      app, container, 'user@example.com', cancelButtonCallback,
      pendingEmailCred);
  assertEmailNotReceivedPage();

  // Click resend button.
  clickResendEmailLink();
  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    // Verify that pending credential and email are stored after resending.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getEncryptedPendingCredential(
            'SESSIONID', app.getAppId()));
    assertEmailLinkSignInSentPage();

    // Verfiy that the onCancelClick handler is passed to email link sign in
    // sent page.
    assertEquals(0, cancelButtonCallback.getCallCount());
    // Click cancel button.
    clickSecondaryLink();
    assertEquals(1, cancelButtonCallback.getCallCount());
    assertComponentDisposed();
  });
}


function testHandleEmailNotReceived_resend_pendingCredential_anonUpgrade() {
  // Test resend email link with pending credential for anonymous upgrade flow.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
     'user@example.com', credential);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, pendingEmailCred.getCredential().providerId, anonymousUser['uid']);
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailNotReceived(
      app, container, 'user@example.com', cancelButtonCallback,
      pendingEmailCred);
  assertEmailNotReceivedPage();

  // Click resend button.
  clickResendEmailLink();
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  return externalAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    // Verify that pending credential and email are stored after resending.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getEncryptedPendingCredential(
            'SESSIONID', app.getAppId()));
    assertEmailLinkSignInSentPage();

    // Verfiy that the onCancelClick handler is passed to email link sign in
    // sent page.
    assertEquals(0, cancelButtonCallback.getCallCount());
    // Click cancel button.
    clickSecondaryLink();
    assertEquals(1, cancelButtonCallback.getCallCount());
    assertComponentDisposed();
  });
}


function testHandleEmailNotReceived_back() {
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var cancelButtonCallback = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailNotReceived(
      app, container, 'user@example.com', cancelButtonCallback);
  // Click back button.
  clickSecondaryLink();
  // Verify that click back button goes back to the starting page.
  assertProviderSignInPage();
}
