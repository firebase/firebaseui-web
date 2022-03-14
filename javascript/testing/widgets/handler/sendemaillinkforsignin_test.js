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
 * @fileoverview Test for send email link for sign in handler.
 */

goog.provide('firebaseui.auth.widget.handler.SendEmailLinkForSignInTest');
goog.setTestOnly('firebaseui.auth.widget.handler.SendEmailLinkForSignInTest');

goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInSent');
goog.require('firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleUnauthorizedUser');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.dom.forms');
goog.require('goog.testing.recordFunction');


function testHandleSendEmailLinkForSignIn() {
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings();
  var cancelButtonCallback = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn(
      app, container, 'user@example.com', cancelButtonCallback);
  assertCallbackPage();
  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    assertEmailLinkSignInSentPage();
    // Email for email link sign in should be stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
  });
}


function testHandleSendEmailLinkForSignIn_anonymousUpgrade() {
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // Anonymous user's uid should be set on the email link.
  var expectedActionCodeSettings = buildActionCodeSettings(
      null, null, anonymousUser['uid']);
  var cancelButtonCallback = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn(
      app, container, 'user@example.com', cancelButtonCallback);
  assertCallbackPage();
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  return externalAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    assertEmailLinkSignInSentPage();
    // Email for email link sign in should be stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
  });
}


function testHandleSendEmailLinkForSignIn_internalError() {
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings();
  var cancelButtonCallback = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn(
      app, container, 'user@example.com', cancelButtonCallback);
  assertCallbackPage();
  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings], null, internalError);
    return testAuth.process();
  }).then(function() {
    // Go back to the sign in page for error cases.
    assertSignInPage();
    // Verfiy email is prefilled.
    assertEquals(
        'user@example.com', goog.dom.forms.getValue(getEmailElement()));
    // Show error in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleSendEmailLinkForSignIn_adminRestrictedOperationError() {
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  app.updateConfig('adminRestrictedOperation', adminRestrictedOperationConfig);
  const expectedActionCodeSettings = buildActionCodeSettings();
  const cancelButtonCallback = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn(
      app, container, 'user@example.com', cancelButtonCallback);
  assertCallbackPage();
  return testAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings], null,
        adminRestrictedOperationError);
    return testAuth.process();
  }).then(function() {
    // Verify unauthorized user page is rendered.
    assertUnauthorizedUserPage();
    // Assert cancel button is rendered.
    assertNotNull(getCancelButton());
    // Assert admin email is rendered.
    assertAdminEmail(expectedAdminEmail);
    // Assert help link is rendered.
    assertHelpLink();
    // Click back button.
    clickSecondaryLink();
    // Verify that clicking back button goes back to the email sign in page.
    assertSignInPage();
  });
}
