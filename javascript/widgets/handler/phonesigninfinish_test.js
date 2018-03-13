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

goog.require('firebaseui.auth.PhoneAuthResult');
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
goog.require('goog.testing.recordFunction');



var phoneNumberValue = new firebaseui.auth.PhoneNumber('45-DK-0', '6505550101');
var resendDelaySeconds = 10;

/**
 * @param {string} operationType The operation type.
 * @param {boolean} isNewUser Whether the user is new.
 * @return {!firebaseui.auth.PhoneAuthResult} The mock phone Auth result object.
 */
function createMockPhoneAuthResultResult(operationType, isNewUser) {
  return {
    'confirm': function(code) {
      assertEquals('123456', code);
      // Simulate user signed in.
      app.getExternalAuth().setUser(
          {'phone': '+11234567890', 'displayName': 'John Smith'});
      return goog.Promise.resolve({
        'user': app.getExternalAuth().currentUser,
        'credential': null,
        'operationType': operationType,
        'additionalUserInfo':  {'providerId': 'phone', 'isNewUser': isNewUser}
      });
    }
  };
}


/**
 * @param {!Object} error The expected error to throw on confirmation.
 * @return {!firebaseui.auth.PhoneAuthResult} The mock phone Auth result that
 *     throws the expected error on code confirmation.
 */
function createMockPhoneAuthResultWithError(error) {
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
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', false);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
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


function testHandlePhoneSignInFinish_anonymousUpgrade_success() {
  externalAuth.setUser(anonymousUser);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('link', false);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
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


function testHandlePhoneSignInFinish_anonUpgrade_signInSuccessWithAuthResult() {
  externalAuth.setUser(anonymousUser);
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    },
    'autoUpgradeAnonymousUsers': true
  });
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('link', false);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
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
    var expectedAuthResult = {
      'user': app.getExternalAuth().currentUser,
      // No phone credential is passed.
      'credential': null,
      // Operation type should be link for anonymous upgrade.
      'operationType': 'link',
      'additionalUserInfo':  {'providerId': 'phone', 'isNewUser': false}
    };
    testUtil.assertGoTo('http://localhost/home');
    // Successfully upgraded to Phone user.
    // SignInWithAuthResultCallback is called. No phone credential is passed
    // and expected user is logged in.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult, undefined);
  });
}


function testHandlePhoneSignInFinish_anonymousUpgrade_credentialInUseError() {
  externalAuth.setUser(anonymousUser);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  var cred = {
    'providerId': 'phone',
    'verificationId': '123456abc',
    'verificationCode': '123456'
  };
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE',
    'phoneNumber': '+11234567890',
    'credential': cred
  };
  var mockConfirmationResult = {
    'confirm': function(code) {
      assertEquals('123456', code);
      return goog.Promise.reject(expectedError);
    }
  };
  var errorHandler = goog.testing.recordFunction(function(error) {
    assertEquals(expectedError, error);
    throw error;
  });
  var phoneAuthResult = new firebaseui.auth.PhoneAuthResult(
      mockConfirmationResult, errorHandler);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      phoneAuthResult);
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
    // No info bar message.
    assertNoInfoBarMessage();
    // Verifies that error handler got called.
    assertEquals(1, errorHandler.getCallCount());
  });
}


function testHandlePhoneSignInFinish_anonymousUpgrade_invalidCodeError() {
  externalAuth.setUser(anonymousUser);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  var expectedError = {
    'code': 'auth/invalid-verification-code',
    'message': 'MESSAGE'
  };
  var mockConfirmationResult = {
    'confirm': function(code) {
      assertEquals('123456', code);
      return goog.Promise.reject(expectedError);
    }
  };
  var errorHandler = goog.testing.recordFunction(function(error) {
    assertEquals(expectedError, error);
    throw error;
  });
  var phoneAuthResult = new firebaseui.auth.PhoneAuthResult(
      mockConfirmationResult, errorHandler);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      phoneAuthResult);
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
    // No info bar message.
    assertNoInfoBarMessage();
    // Verifies that error handler got called.
    assertEquals(1, errorHandler.getCallCount());
  });
}


function testHandlePhoneSignInFinish_success_signInSuccessCallback() {
  // Test successful code entry with signInSuccess callback provided.
  // Provide a sign in success callback.
  app.setConfig({'callbacks': {'signInSuccess': signInSuccessCallback(false)}});
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', false);
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
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
    app.getAuth().assertSignOut([]);
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePhoneSignInFinish_signInSuccessWithAuthResultCallback() {
  // Test successful code entry with signInSuccessWithAuthResult callback
  // provided.
  // Provide a sign in success with Auth result callback.
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', true);
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
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
    var expectedAuthResult = {
      'user': app.getExternalAuth().currentUser,
      // No phone credential is passed.
      'credential': null,
      'operationType': 'signIn',
      'additionalUserInfo':  {'providerId': 'phone', 'isNewUser': true}
    };
    testUtil.assertGoTo('http://localhost/home');
    // Successful sign in.
    // SignInWithAuthResultCallback is called. No phone credential is passed
    // and expected user is logged in.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult, undefined);
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePhoneSignInFinish_success_resetBeforeCompletion() {
  // Tests reset being called right before the verified dialog is dismissed.
  app.setConfig({'callbacks': {'signInSuccess': signInSuccessCallback(false)}});
  // Render phone sign in finish UI.
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', false);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
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
    app.getAuth().assertSignOut([]);
    app.reset();
    // Dialog should be dismissed, even though no time passed.
    assertNoDialog();
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePhoneSignInFinish_signInSuccessWithAuthResult_reset() {
  // Tests reset being called right before the verified dialog is dismissed.
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(false)
    }
  });
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', false);
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
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
    app.getAuth().assertSignOut([]);
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
  // Test any passed default data ignored.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      // Pass default country.
      'defaultCountry': 'gb',
      // Pass default national number.
      'defaultNationalNumber': '1234567890'
    }]
  });
  // Render phone sign in finish UI.
  // Phone number provided here has higher priority over the config defaults.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      createMockPhoneAuthResultWithError(expectedError));
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
    // Phone number should be prefilled. Defaults should be ignored.
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
      createMockPhoneAuthResultWithError(expectedError));
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
      createMockPhoneAuthResultWithError(internalError));
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
  // Test any passed default data ignored.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      // Pass default country.
      'defaultCountry': 'gb',
      // Pass default national number.
      'defaultNationalNumber': '1234567890'
    }]
  });
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', false);
  // Render phone sign in finish UI.
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Click change phone number link.
  clickChangePhoneNumberLink();
  // Phone sign in start page should be rendered with the correct phone number
  // prefilled and not the config provided defaults.
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
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', false);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
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
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', false);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
  // Confirm expected page rendered.
  assertPhoneSignInFinishPage();
  // Reset current rendered widget page.
  app.getAuth().assertSignOut([]);
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandlePhoneSignInFinish_onResendClick() {
  // Test any passed default data ignored.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      // Pass default country.
      'defaultCountry': 'gb',
      // Pass default national number.
      'defaultNationalNumber': '1234567890'
    }]
  });
  var mockPhoneAuthResult = createMockPhoneAuthResultResult('signIn', false);
  firebaseui.auth.widget.handler.handlePhoneSignInFinish(
      app, container, phoneNumberValue, resendDelaySeconds,
      mockPhoneAuthResult);
  assertPhoneSignInFinishPage();

  // Advance clock to reveal resend link.
  mockClock.tick(resendDelaySeconds);

  // Assert resend navigation takes you back to start page with phone prefilled.
  clickResendLink();
  assertPhoneSignInStartPage();
  // Defaults ignored.
  assertEquals('\u200e+45', getPhoneCountrySelectorElement().textContent);
  assertEquals(phoneNumberValue.nationalNumber, getPhoneInputElement().value);

  // Recaptcha should be rendered.
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process();
}
