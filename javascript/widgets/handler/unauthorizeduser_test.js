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
  // Test user email not rendered in the unauthorized page when the user email
  // is not passed to the handler.
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
  // Test user email rendered in the unauthorized page when the user email is
  // passed to the handler.
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


function testHandleUnauthorizedUser_clickBackButton_phoneAuthProvider() {
  // Test phone sign in start page is rendered when clicking cancel button on
  // unauthorized page for phone auth provider.
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
  assertPhoneSignInStartPage();
}


function testHandleUnauthorizedUser_adminRestrictedOperation_otherProvider() {
  // Test unauthorized user page is rendered when admin restricted error is
  // returned and adminRestrictedOperationConfig status is set to true on
  // non-email provider.
  const adminEmailForEmailSignInDisabled = 'emailSignInDisabled@example.com';
  const adminEmailForAdminRestrictedOperation = 'adminRestricted@example.com';
  const disableSignUpConfig = {
    'status': true,
    'adminEmail': adminEmailForEmailSignInDisabled,
  };
  const adminRestrictedConfig = {
    'status': true,
    'adminEmail': adminEmailForAdminRestrictedOperation,
  };
  app.updateConfig('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': true,
      'disableSignUp': disableSignUpConfig,
    },
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ]);
  app.updateConfig('adminRestrictedOperation', adminRestrictedConfig);
  firebaseui.auth.widget.handler.handleUnauthorizedUser(
      app, container, 'user@gmail.com',
      firebase.auth.GoogleAuthProvider.PROVIDER_ID);
  // Verify unauthorized user page is rendered.
  assertUnauthorizedUserPage();
  // Assert cancel button is rendered.
  assertNotNull(getCancelButton());
  // Assert adminRestrictedOperation configured admin email is rendered.
  assertAdminEmail(adminEmailForAdminRestrictedOperation);
}


function testHandleUnauthorizedUser_emailSignInConfig_firstPriorityExecuted() {
  // Test only emailSignInDisabledConfig is processed and corresponding admin
  // email is rendered on unauthorized user page when admin restricted error is
  // returned, on condition of both emailSignInDisabledConfig and
  // adminRestrictedOperationConfig status set to true for email provider.
  const adminEmailForEmailSignInDisabled = 'emailSignInDisabled@example.com';
  const adminEmailForAdminRestrictedOperation = 'adminRestricted@example.com';
  const disableSignUpConfig = {
    'status': true,
    'adminEmail': adminEmailForEmailSignInDisabled,
  };
  const adminRestrictedConfig = {
    'status': true,
    'adminEmail': adminEmailForAdminRestrictedOperation,
  };
  app.updateConfig('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': true,
      'disableSignUp': disableSignUpConfig,
    }
  ]);
  app.updateConfig('adminRestrictedOperation', adminRestrictedConfig);
  firebaseui.auth.widget.handler.handleUnauthorizedUser(
      app, container, 'user@example.com',
      firebase.auth.EmailAuthProvider.PROVIDER_ID);
  // Verify unauthorized user page is rendered.
  assertUnauthorizedUserPage();
  // Assert cancel button is rendered.
  assertNotNull(getCancelButton());
  // Assert emailSignInDisabled configured admin email is rendered.
  assertAdminEmail(adminEmailForEmailSignInDisabled);
}


function testHandleUnauthorizedUser_onlyAdminRestrictedOperationAllowed() {
  // Test only adminRestrictedOperationConfig is processed and corresponding
  // admin email is rendered on unauthorized user page when admin restricted
  // error is returned, on condition of only adminRestrictedOperationConfig
  // status set to true for email provider.
  const adminEmailForEmailSignInDisabled = 'emailSignInDisabled@example.com';
  const adminEmailForAdminRestrictedOperation = 'adminRestricted@example.com';
  const disableSignUpConfig = {
    'status': false,
    'adminEmail': adminEmailForEmailSignInDisabled,
  };
  const adminRestrictedConfig = {
    'status': true,
    'adminEmail': adminEmailForAdminRestrictedOperation,
  };
  app.updateConfig('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': true,
      'disableSignUp': disableSignUpConfig,
    }
  ]);
  app.updateConfig('adminRestrictedOperation', adminRestrictedConfig);
  firebaseui.auth.widget.handler.handleUnauthorizedUser(
      app, container, 'user@example.com',
      firebase.auth.EmailAuthProvider.PROVIDER_ID);
  // Verify unauthorized user page is rendered.
  assertUnauthorizedUserPage();
  // Assert cancel button is rendered.
  assertNotNull(getCancelButton());
  // Assert adminRestrictedOperation configured admin email is rendered.
  assertAdminEmail(adminEmailForAdminRestrictedOperation);
}


function testHandleUnauthorizedUser_clickHelpLink() {
  // Test help link is opened when clicking on unauthorized user page.
  assertNull(app.getConfig().getEmailProviderHelpLinkCallBack());
  assertNull(app.getConfig().getEmailProviderAdminEmail());
  const helpLink = 'https://www.example.com/trouble_signing_in';
  const adminEmail = 'admin@example.com';
  app.updateConfig('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': true,
      'disableSignUp': {
        'status': true,
        'helpLink': helpLink,
        'adminEmail': adminEmail,
      }
    }
  ]);
  assertNotNull(app.getConfig().getEmailProviderHelpLinkCallBack());
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
