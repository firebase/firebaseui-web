/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Test for phone sign in finish handler.
 */

goog.provide('firebaseui.auth.widget.handler.PhoneSignInFinishTest');
goog.setTestOnly('firebaseui.auth.widget.handler.PhoneSignInFinishTest');

goog.require('firebaseui.auth.PhoneNumber');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInFinish');
/** @suppress {extraRequire} Required for page navigation. */
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInStart');
/** @suppress {extraRequire} Required for page navigation. */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
/** @suppress {extraRequire} Required for test helpers. */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.Promise');
goog.require('goog.dom.forms');



var phoneNumberValue = new firebaseui.auth.PhoneNumber('45-DK-0', '6505550101');
var resendDelaySeconds = 10;

// Mock confirmation result.
var mockConfirmationResult = {
  'confirm': function(code) {
    assertEquals('123456', code);
    // Simulate user signed in.
    app.getExternalAuth().setUser(
        {'phone': '+11234567890', 'displayName': 'John Smith'});
    return goog.Promise.resolve();
  }
};


/**
 * @param {!Object} error The expected error to throw on confirmation.
 * @return {!Object} The mock confirmation result that throws the expected error
 *     on code confirmation.
 */
function createMockConfirmationResultWithError(error) {
  return {
    'confirm': function(code) {
      assertEquals('123456', code);
      return goog.Promise.reject(error);
    }
  };
}


function testHandlePhoneSignInFinish_success_signInSuccessUrl() {
  // Test successful code entry with signInSuccessUrl provided.
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockConfirmationResult);
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Try to submit form without code being provided.
  submitForm();
  // Inline error message shown.
  assertEquals(
      firebaseui.auth.soy2.strings.errorInvalidConfirmationCode().toString(),
      getPhoneConfirmationCodeErrorMessage());
  // Simulate code provided.
  goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
  // Submit form.
  submitForm();
  // Loading dialog shown.
  assertDialog(
      firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
  return goog.Promise.resolve().then(function() {
    // Code verified dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
    // Wait for one second. Sign in success URL redirect should occur after.
    mockClock.tick(firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Successful sign in.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePhoneSignInFinish_success_signInSuccessCallback() {
  // Test successful code entry with signInSuccess callback provided.
  // Provide a sign in success callback.
  app.setConfig({'callbacks': {'signInSuccess': signInSuccessCallback(false)}});
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockConfirmationResult);
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Simulate code provided.
  goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
  // Submit form.
  submitForm();
  // Loading dialog shown.
  assertDialog(
      firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
  return goog.Promise.resolve().then(function() {
    // Code verified dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
    // Wait for one second. Sign in success callback should be called after.
    mockClock.tick(firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Successful sign in.
    // SignInCallback is called. No phone credential is passed and expected user
    // is logged in.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser, null, undefined);
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePhoneSignInFinish_success_resetBeforeCompletion() {
  // Tests reset being called right before the verified dialog is dismissed.
  app.setConfig({'callbacks': {'signInSuccess': signInSuccessCallback(false)}});
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockConfirmationResult);
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Simulate code provided.
  goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
  // Submit form.
  submitForm();
  // Loading dialog shown.
  assertDialog(
      firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
  return goog.Promise.resolve().then(function() {
    // Code verified dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
    // Simulate app reset.
    app.reset();
    // Dialog should be dismissed, even though no time passed.
    assertNoDialog();
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePhoneSignInFinish_error_codeExpired() {
  // Test when expired code error is thrown during code verification, previous
  // phone sign in start page is rendered with the error message.
  var expectedError = {
    'code': 'auth/code-expired',
    'message': 'Expired verification code provided!'
  };
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      createMockConfirmationResultWithError(expectedError));
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Simulate code provided.
  goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
  // Submit form.
  submitForm();
  // Loading dialog should show.
  assertDialog(
      firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
  return goog.Promise.resolve().then(function() {
    // Dialog should be dismissed.
    assertNoDialog();
    // Phone sign in start page should be rendered.
    assertPhoneSignInStartPage();
    // Phone number should be prefilled.
    assertEquals('\u200e+45', getPhoneCountrySelectorElement().textContent);
    assertEquals(phoneNumberValue.nationalNumber, getPhoneInputElement().value);
    // Recaptcha should be rendered.
    recaptchaVerifierInstance.assertRender([], 0);
    // Expected info bar message.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError));
    return recaptchaVerifierInstance.process();
  });
}


function testHandlePhoneSignInFinish_error_invalidVerificationCode() {
  // Test when invalid code error is thrown during code verification, no
  // page navigation occurs and only an inline error message is shown.
  var expectedError = {
    'code': 'auth/invalid-verification-code',
    'message': 'Invalid verification code provided!'
  };
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      createMockConfirmationResultWithError(expectedError));
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Simulate code provided.
  goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
  // Submit form.
  submitForm();
  // Loading dialog should show.
  assertDialog(
      firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
  return goog.Promise.resolve().then(function() {
    // Dialog should be dismissed.
    assertNoDialog();
    // No info bar message.
    assertNoInfoBarMessage();
    // Inline error message shown.
    assertEquals(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError),
        getPhoneConfirmationCodeErrorMessage());
    // Should remain on the same page.
    assertPhoneSignInFinishPage();
  });
}


function testHandlePhoneSignInFinish_error_miscError() {
  // Test when an unexpected error is thrown during code verification, no
  // page navigation occurs and only an info bar message is shown.
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      createMockConfirmationResultWithError(internalError));
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Simulate code provided.
  goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
  // Submit form.
  submitForm();
  // Loading dialog should show.
  assertDialog(
      firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
  return goog.Promise.resolve().then(function() {
    // Dialog should be dismissed.
    assertNoDialog();
    // Expected info bar message.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    // Should remain on the same page.
    assertPhoneSignInFinishPage();
  });
}


function testHandlePhoneSignInFinish_onChangePhoneNumberClick() {
  // Test when change phone number button is clicked in code entry page that the
  // phone sign in start page is rendered.
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockConfirmationResult);
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Click change phone number link.
  clickChangePhoneNumberLink();
  // Phone sign in start page should be rendered with the correct phone number
  // prefilled.
  assertPhoneSignInStartPage();
  assertEquals('\u200e+45', getPhoneCountrySelectorElement().textContent);
  assertEquals(phoneNumberValue.nationalNumber, getPhoneInputElement().value);
  // Recaptcha should be rendered.
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process();
}


function testHandlePhoneSignInFinish_onCancel() {
  // Test when cancel button is clicked in code entry page that the provider
  // sign in page is rendered.
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockConfirmationResult);
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Click cancel.
  clickSecondaryLink();
  // Should return to provider sign in page.
  assertProviderSignInPage();
}


function testHandlePhoneSignInFinishStart_reset() {
  // Test when reset is called after phone sign-in finish handler called.
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockConfirmationResult);
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandlePhoneSignInFinish_onResendClick() {
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockConfirmationResult);
  assertPhoneSignInFinishPage();

  // Advance clock to reveal resend link.
  mockClock.tick(resendDelaySeconds);

  // Assert resend navigation takes you back to start page with phone prefilled.
  clickResendLink();
  assertPhoneSignInStartPage();
  assertEquals('\u200e+45', getPhoneCountrySelectorElement().textContent);
  assertEquals(phoneNumberValue.nationalNumber, getPhoneInputElement().value);

  // Recaptcha should be rendered.
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process();
}
