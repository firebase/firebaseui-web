/*
 * Copyright 2019 Google Inc. All Rights Reserved.
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
 * @fileoverview Test for prefilled email sign in handler.
 */

goog.provide('firebaseui.auth.widget.handler.PrefilledEmailSignInTest');
goog.setTestOnly('firebaseui.auth.widget.handler.PrefilledEmailSignInTest');

goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handlePrefilledEmailSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');


function testHandlePrefilledEmailSignIn_paaswordSignUp() {
  // Test password sign-up with prefilled email flow.
  const prefilledEmail = 'user@example.com';
  firebaseui.auth.widget.handler.handlePrefilledEmailSignIn(
      app, container, prefilledEmail);

  assertBlankPage();
  testAuth.assertFetchSignInMethodsForEmail(
      [prefilledEmail],
      []);
  return testAuth.process().then(() => {
    // Password sign-up page should be shown.
    assertPasswordSignUpPage();
    // The prefilled email should be populated in the email entry.
    assertEquals(prefilledEmail, getEmailElement().value);
    assertTosPpFooter(tosCallback, 'http://localhost/privacy_policy');
    return testAuth.process();
  });
}


function testHandlePrefilledEmailSignIn_passwordSignIn() {
  // Test password sign-in with prefilled email flow.
  const prefilledEmail = 'user@example.com';
  firebaseui.auth.widget.handler.handlePrefilledEmailSignIn(
      app, container, prefilledEmail);

  assertBlankPage();
  testAuth.assertFetchSignInMethodsForEmail(
      [prefilledEmail],
      ['password']);
  return testAuth.process().then(() => {
    // Password sign-in page should be shown.
    assertPasswordSignInPage();
    // The prefilled email should be populated in the email entry.
    assertEquals(prefilledEmail, getEmailElement().value);
    assertTosPpFooter(tosCallback, 'http://localhost/privacy_policy');
    return testAuth.process();
  });
}


function testHandlePrefilledEmailSignIn_federatedSignIn() {
  // Test federated sign-in with prefilled email flow.
  const prefilledEmail = 'user@example.com';
  firebaseui.auth.widget.handler.handlePrefilledEmailSignIn(
      app, container, prefilledEmail);

  assertBlankPage();
  testAuth.assertFetchSignInMethodsForEmail(
      [prefilledEmail],
      ['google.com']);
  return testAuth.process().then(() => {
    // Federated linking page should be shown.
    assertFederatedLinkingPage();
    assertTosPpFooter(tosCallback, 'http://localhost/privacy_policy');
    return testAuth.process();
  });
}


function testHandlePrefilledEmailSignIn_error() {
  // Test prefilled email error flow.
  const prefilledEmail = 'user@example.com';
  firebaseui.auth.widget.handler.handlePrefilledEmailSignIn(
      app, container, prefilledEmail);

  assertBlankPage();
  testAuth.assertFetchSignInMethodsForEmail(
      [prefilledEmail],
      null,
      internalError);
  return testAuth.process().then(() => {
    // Sign in page should be displayed with error message.
    assertSignInPage();
    // On error, expect the info bar to show a message.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    // The prefilled email should be populated in the email entry.
    assertEquals(prefilledEmail, getEmailElement().value);
    return testAuth.process();
  });
}


function testHandleSignIn_signInHint() {
  // Test handleSignIn with signInHint.
  const prefilledEmail = 'user@example.com';
  app.startWithSignInHint(
      container,
      {
        signInOptions: ['password'],
        credentialHelper: 'none',
      },
      {
        emailHint: prefilledEmail,
      });

  assertBlankPage();
  testAuth.assertFetchSignInMethodsForEmail(
      [prefilledEmail],
      ['password']);
  return testAuth.process().then(() => {
    // Password sign-in page should be shown.
    assertPasswordSignInPage();
    // The prefilled email should be populated in the email entry.
    assertEquals(prefilledEmail, getEmailElement().value);
    assertTosPpFullMessage(tosCallback, 'http://localhost/privacy_policy');
    // Clean up the AuthUI instance.
    testAuth.assertSignOut([]);
    app.delete();
    return testAuth.process();
  });
}
