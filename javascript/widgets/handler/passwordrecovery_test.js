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
 * @fileoverview Test for password recovery handler.
 */

goog.provide('firebaseui.auth.widget.handler.PasswordRecoveryTest');
goog.setTestOnly('firebaseui.auth.widget.handler.PasswordSignInTest');

goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handlePasswordRecovery');
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');


function testHandlePasswordRecovery() {
  firebaseui.auth.widget.handler.handlePasswordRecovery(
      app, container, passwordAccount.getEmail());
  assertPasswordRecoveryPage();
  submitForm();

  testAuth.assertSendPasswordResetEmail(
      [passwordAccount.getEmail()]);
  return testAuth.process().then(function() {
    assertPasswordRecoveryEmailSentPage();
    submitForm();
    assertProviderSignInPage();
  });
}


function testHandlePasswordRecovery_infoBarMessage() {
  firebaseui.auth.widget.handler.handlePasswordRecovery(
      app, container, passwordAccount.getEmail(), false, 'Error occurred!');
  assertPasswordRecoveryPage();
  // Info bar message should be shown.
  assertInfoBarMessage('Error occurred!');
  submitForm();

  testAuth.assertSendPasswordResetEmail(
      [passwordAccount.getEmail()]);
  return testAuth.process().then(function() {
    assertPasswordRecoveryEmailSentPage();
    submitForm();
    assertProviderSignInPage();
  });
}


function testHandlePasswordRecovery_reset() {
  // Test reset after calling password recovery handler.
  firebaseui.auth.widget.handler.handlePasswordRecovery(
      app, container, passwordAccount.getEmail());
  assertPasswordRecoveryPage();
  // Reset the current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandlePasswordRecovery_cancel_providerFirst() {
  firebaseui.auth.widget.handler.handlePasswordRecovery(
      app, container, passwordAccount.getEmail());
  assertPasswordRecoveryPage();

  goog.testing.events.fireClickSequence(
      goog.dom.getElementByClass('firebaseui-id-secondary-link', container));
  // Provider sign-in page should show.
  assertProviderSignInPage();
}


function testHandlePasswordRecovery_error() {
  var error = {'code': 'auth/user-not-found'};
  firebaseui.auth.widget.handler.handlePasswordRecovery(
      app, container, passwordAccount.getEmail());
  assertPasswordRecoveryPage();
  submitForm();
  testAuth.assertSendPasswordResetEmail(
      [passwordAccount.getEmail()], null, error);
  return testAuth.process().then(function() {
    // On error, show a message on info bar.
    assertPasswordRecoveryPage();
    assertEquals(
        firebaseui.auth.widget.handler.common.getErrorMessage(error),
        getEmailErrorMessage());
  });
}


function testHandlePasswordRecovery_emailEmpty() {
  firebaseui.auth.widget.handler.handlePasswordRecovery(app, container);
  assertPasswordRecoveryPage();
  submitForm();
  // No submission without email.
  assertPasswordRecoveryPage();
}


function testHandlePasswordRecovery_emailInvalid() {
  firebaseui.auth.widget.handler.handlePasswordRecovery(app, container,
      'user@');
  assertPasswordRecoveryPage();
  submitForm();
  // No submission with invalid email.
  assertPasswordRecoveryPage();
}


function testHandlePasswordRecovery_inProccessing() {
  firebaseui.auth.widget.handler.handlePasswordRecovery(
      app, container, passwordAccount.getEmail());
  assertPasswordRecoveryPage();
  submitForm();
  // Click submit again.
  submitForm();
  // Only one request sent.
  testAuth.assertSendPasswordResetEmail(
      [passwordAccount.getEmail()], null, new Error());
  return testAuth.process().then(function() {
    assertBusyIndicatorHidden();

    // Submit again.
    submitForm();
    testAuth.assertSendPasswordResetEmail(
      [passwordAccount.getEmail()]);
    return testAuth.process();
  }).then(function() {
    assertPasswordRecoveryEmailSentPage();
    submitForm();
    assertProviderSignInPage();
  });
}
