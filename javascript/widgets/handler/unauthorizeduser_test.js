/*
 * Copyright 2021 Google Inc. All Rights Reserved.
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
 * @fileoverview Test for unauthorized user handler.
 */
goog.provide('firebaseui.auth.widget.handler.UnauthorizedUserTest');
goog.setTestOnly('firebaseui.auth.widget.handler.UnauthorizedUserTest');

goog.require('firebaseui.auth.widget.handler.handleUnauthorizedUser');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');


function testHandleUnauthorizedUser_clickBackButton_noPrefilledEmail() {
  firebaseui.auth.widget.handler.handleUnauthorizedUser(
      app, container, '', firebase.auth.EmailAuthProvider.PROVIDER_ID);
  // Verify unauthorized user page is rendered.
  assertUnauthorizedUserPage();
  // Verify no help link is rendered.
  assertNoHelpLink();
  // Assert cancel button is rendered.
  assertNotNull(getCancelButton());
  // Click back button.
  clickSecondaryLink();
  // Verify that clicking back button goes back to the starting page.
  assertSignInPage();
}


function testHandleUnauthorizedUser_clickBackButton_prefilledEmail() {
  const userEmail = 'user@example.com';
  firebaseui.auth.widget.handler.handleUnauthorizedUser(
      app, container, userEmail, firebase.auth.EmailAuthProvider.PROVIDER_ID);
  // Verify unauthorized user page is rendered.
  assertUnauthorizedUserPage();
  // Verify userEmail is displayed.
  assertPageContainsText(userEmail);
  // Verify no help link is rendered.
  assertNoHelpLink();
  // Assert cancel button is rendered.
  assertNotNull(getCancelButton());
  // Click back button.
  clickSecondaryLink();
  // Verify that clicking back button goes back to the starting page.
  assertSignInPage();
}


function testHandleUnauthorizedUser_clickBackButton_otherProvider() {
  // Call unauthorized user handler with non email password/link auth provider.
  firebaseui.auth.widget.handler.handleUnauthorizedUser(
      app, container, null,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID);
  // Verify unauthorized user page is rendered.
  assertUnauthorizedUserPage();
  // Verify no help link is rendered.
  assertNoHelpLink();
  // Assert cancel button is rendered.
  assertNotNull(getCancelButton());
  // Click back button.
  clickSecondaryLink();
  // Assert phone sign in start is called.
  assertProviderSignInPage();
}


function testHandleUnauthorizedUser_updateInfo() {
  assertNull(app.getConfig().getEmailProviderHelperLink());
  assertNull(app.getConfig().getEmailProviderAdminEmail());
  const helpLink = 'https://www.example.com/trouble_signing_in';
  const adminEmail = 'admin@example.com';
  app.updateConfig('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': true,
      'disableSignUp': {
        'status': false,
        'helpLink': helpLink,
        'adminEmail': adminEmail,
      }
    }
  ]);
  assertNotNull(app.getConfig().getEmailProviderHelperLink());
  assertNotNull(app.getConfig().getEmailProviderAdminEmail());
  firebaseui.auth.widget.handler.handleUnauthorizedUser(
      app, container, 'user@example.com',
      firebase.auth.EmailAuthProvider.PROVIDER_ID);
  // Verify unauthorized user page is rendered.
  assertUnauthorizedUserPage();
  // Assert cancel button is rendered.
  assertNotNull(getCancelButton());
  // Assert admin email is rendered.
  assertAdminEmail(adminEmail);
  // Assert help link is rendered.
  assertHelpLink();
  // Click help link.
  clickHelpLink();
  testUtil.assertOpen(helpLink, '_blank');
}

