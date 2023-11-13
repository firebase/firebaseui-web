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
 * @fileoverview Test for phone sign in start handler.
 */

goog.provide('firebaseui.auth.widget.handler.PhoneSignInStartTest');
goog.setTestOnly('firebaseui.auth.widget.handler.PhoneSignInStartTest');

goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.PhoneNumber');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} Required for page navigation. */
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInFinish');
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInStart');
/** @suppress {extraRequire} Required for page navigation after form
 *      cancellation to work. */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleUnauthorizedUser');
/** @suppress {extraRequire} Required for test helpers. */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.testing.events');


/**
 * @param {string} operationType The operation type.
 * @param {boolean} isNewUser Whether the user is new.
 * @return {!firebase.auth.ConfirmationResult} The mock confirmation result
 *     object.
 */
function createMockConfirmationResult(operationType, isNewUser) {
  return {
    'confirm': function(code) {
      assertEquals('123456', code);
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
 * @return {!firebase.auth.ConfirmationResult} The mock confirmation result that
 *     throws the expected error on code confirmation.
 */
function createMockConfirmationResultWithError(error) {
  return {
    'confirm': function(code) {
      assertEquals('123456', code);
      return goog.Promise.reject(error);
    }
  };
}


function testHandlePhoneSignInStart_visible() {
  // Tests successful visible reCAPTCHA flow.
  // Enable visible reCAPTCHA.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ]
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  assertPhoneFooter(tosCallback, 'http://localhost/privacy_policy');
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Try first without phone number.
    submitForm();
    // Error should be shown that the phone number is missing.
    assertEquals(
        firebaseui.auth.soy2.strings.errorInvalidPhoneNumber().toString(),
        getPhoneNumberErrorMessage());
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Submit without solving reCAPTCHA.
    submitForm();
    // reCAPTCHA error should show.
    // Error should be shown that the reCAPTCHA response is missing.
    assertEquals(
        firebaseui.auth.soy2.strings.errorMissingRecaptchaResponse()
            .toString(),
        getRecaptchaErrorMessage());
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    // Submit again. This time, it wills succeed.
    submitForm();
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number triggered.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  }).then(function() {
    // No grecaptcha reset called.
    assertEquals(0, goog.global['grecaptcha'].reset.getCallCount());
    // Code sent dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeSent().toString());
    // Wait for one second. Confirm code entry page rendered.
    mockClock.tick(firebaseui.auth.widget.handler.SENDING_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    assertPhoneSignInFinishPage();
    // Assert countdown matches delay param.
    assertResendCountdown('0:' +
        firebaseui.auth.widget.handler.RESEND_DELAY_SECONDS);
    // Simulate correct code provided.
    goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
    // Submit form.
    submitForm();
    // Give enough time for code to process.
    return goog.Promise.resolve();
  }).then(function() {
    // Code verified dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
    // Wait for one second. Sign in success URL redirect should occur after.
    mockClock.tick(firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    // Successful sign in.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePhoneSignInStart_anonymousUpgrade_success() {
  externalAuth.setUser(anonymousUser);
  // Enable visible reCAPTCHA and auto anonymous upgrade.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ],
    'autoUpgradeAnonymousUsers': true,
    'tosUrl': undefined,
    'privacyPolicyUrl': undefined
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  assertTosPpFooter(null, null);
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Try first without phone number.
    submitForm();
    // Error should be shown that the phone number is missing.
    assertEquals(
        firebaseui.auth.soy2.strings.errorInvalidPhoneNumber().toString(),
        getPhoneNumberErrorMessage());
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Submit without solving reCAPTCHA.
    submitForm();
    // reCAPTCHA error should show.
    // Error should be shown that the reCAPTCHA response is missing.
    assertEquals(
        firebaseui.auth.soy2.strings.errorMissingRecaptchaResponse()
            .toString(),
        getRecaptchaErrorMessage());
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    // Submit again. This time, it wills succeed.
    submitForm();
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    // Trigger onAuthStateChanged listener.
    externalAuth.runAuthChangeHandler();
    var mockConfirmationResult = createMockConfirmationResult('link', false);
    // Link with phone number triggered.
    externalAuth.currentUser.assertLinkWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  }).then(function() {
    // No grecaptcha reset called.
    assertEquals(0, goog.global['grecaptcha'].reset.getCallCount());
    // Code sent dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeSent().toString());
    // Wait for one second. Confirm code entry page rendered.
    mockClock.tick(firebaseui.auth.widget.handler.SENDING_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    assertPhoneSignInFinishPage();
    // Assert countdown matches delay param.
    assertResendCountdown('0:' +
        firebaseui.auth.widget.handler.RESEND_DELAY_SECONDS);
    // Simulate correct code provided.
    goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
    // Submit form.
    submitForm();
    // Give enough time for code to process.
    return goog.Promise.resolve();
  }).then(function() {
    // Code verified dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
    // Wait for one second. Sign in success URL redirect should occur after.
    mockClock.tick(firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    // Successful sign in.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePhoneSignInStart_anonymousUpgrade_credInUseError() {
  externalAuth.setUser(anonymousUser);
  // Enable visible reCAPTCHA and auto anonymous upgrade.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ],
    'autoUpgradeAnonymousUsers': true
  });
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
  // Mock confirmation result which throws credential in use error.
  var mockConfirmationResult =
      createMockConfirmationResultWithError(expectedError);
  // Expected signInFailure FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      cred);
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Only phone provider is configured, phoneSignInStart is the first page, full
  // message should be displayed.
  assertPhoneFullMessage(tosCallback, 'http://localhost/privacy_policy');
  // Only phone provider is configured, cancel button should be hidden.
  assertNull(getCancelButton());
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Try first without phone number.
    submitForm();
    // Error should be shown that the phone number is missing.
    assertEquals(
        firebaseui.auth.soy2.strings.errorInvalidPhoneNumber().toString(),
        getPhoneNumberErrorMessage());
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Submit without solving reCAPTCHA.
    submitForm();
    // reCAPTCHA error should show.
    // Error should be shown that the reCAPTCHA response is missing.
    assertEquals(
        firebaseui.auth.soy2.strings.errorMissingRecaptchaResponse()
            .toString(),
        getRecaptchaErrorMessage());
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    // Submit again. This time, it wills succeed.
    submitForm();
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    // Trigger onAuthStateChanged listener.
    externalAuth.runAuthChangeHandler();
    // Link with phone number triggered.
    externalAuth.currentUser.assertLinkWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  }).then(function() {
    // No grecaptcha reset called.
    assertEquals(0, goog.global['grecaptcha'].reset.getCallCount());
    // Code sent dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeSent().toString());
    // Wait for one second. Confirm code entry page rendered.
    mockClock.tick(firebaseui.auth.widget.handler.SENDING_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    assertPhoneSignInFinishPage();
    // Assert countdown matches delay param.
    assertResendCountdown('0:' +
        firebaseui.auth.widget.handler.RESEND_DELAY_SECONDS);
    // Simulate correct code provided.
    goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
    // Submit form.
    submitForm();
    // Give enough time for code to process.
    return goog.Promise.resolve();
  }).then(function() {
    // No info bar message.
    assertNoInfoBarMessage();
    // signInFailure callback triggered with expected FirebaseUI error.
    assertSignInFailure(expectedMergeError);
  });
}


function testHandlePhoneSignInStart_anonymousUpgrade_signInError() {
  externalAuth.setUser(anonymousUser);
  // Enable visible reCAPTCHA and auto anonymous upgrade.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ],
    'autoUpgradeAnonymousUsers': true,
    'tosUrl': undefined,
    'privacyPolicyUrl': undefined
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  assertPhoneFullMessage(null, null);
  // Only phone provider is configured, cancel button should be hidden.
  assertNull(getCancelButton());
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(5);
    // Return expected widget ID.
    return 5;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    submitForm();
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    // Trigger onAuthStateChanged listener.
    externalAuth.runAuthChangeHandler();
    // Link with phone number triggered. Simulate an error thrown.
    externalAuth.currentUser.assertLinkWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        null,
        internalError);
    return externalAuth.process();
  }).then(function() {
    // reCAPTCHA should be reset as the token has already been used.
    assertEquals(1, goog.global['grecaptcha'].reset.getCallCount());
    // Reset should be called with the expected widget ID.
    assertEquals(
        5, goog.global['grecaptcha'].reset.getLastCall().getArgument(0));
    // No dialog shown.
    assertNoDialog();
    // Should remain on the page and display the expected error.
    assertPhoneSignInStartPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandlePhoneSignInStart_resetBeforeCodeEntry() {
  // Tests successful visible reCAPTCHA flow and reset before code entry page is
  // rendered.
  // Enable visible reCAPTCHA.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ]
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    // Submit again. This time, it wills succeed.
    submitForm();
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number triggered.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  }).then(function() {
    // No grecaptcha reset called.
    assertEquals(0, goog.global['grecaptcha'].reset.getCallCount());
    // Code sent dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeSent().toString());
    // Simulate app reset.
    app.getAuth().assertSignOut([]);
    app.reset();
    // Code entry page should not get rendered after delay.
    // Wait for one second. Confirm code entry page rendered.
    mockClock.tick(firebaseui.auth.widget.handler.SENDING_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePhoneSignInStart_visible_expired() {
  // Tests successful visible reCAPTCHA flow with token expiring in the process.
  // Enable visible reCAPTCHA.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ]
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Simulate phone number provided.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    var expiredCallback =
        recaptchaVerifierInstance.getParameters()['expired-callback'];
    callback('RECAPTCHA_TOKEN');
    // Simulate reCAPTCHA expired before user clicks submit.
    expiredCallback();
    // Submit clicked.
    submitForm();
    // Error should be shown that the reCAPTCHA response is missing.
    assertEquals(
        firebaseui.auth.soy2.strings.errorMissingRecaptchaResponse()
            .toString(),
        getRecaptchaErrorMessage());
    // User solves reCAPTCHA again.
    callback('RECAPTCHA_TOKEN2');
    // Submit clicked.
    submitForm();
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number triggered.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  }).then(function() {
    // No grecaptcha reset called.
    assertEquals(0, goog.global['grecaptcha'].reset.getCallCount());
    // Code sent dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeSent().toString());
    // Wait for one second. Confirm code entry page rendered.
    mockClock.tick(firebaseui.auth.widget.handler.SENDING_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    assertPhoneSignInFinishPage();
    // Simulate correct code provided.
    goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
    // Submit form.
    submitForm();
    // Give enough time for code to process.
    return goog.Promise.resolve();
  }).then(function() {
    // Code verified dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
    // Wait for one second. Sign in success URL redirect should occur after.
    mockClock.tick(firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    // Successful sign in.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePhoneSignInStart_prefill() {
  // Tests a flow with a prefilled phone number.
  var phoneNumberValue = new firebaseui.auth.PhoneNumber(
      '45-DK-0', '1234567890');
  app.setConfig({'signInOptions': ['phone']});
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container, phoneNumberValue);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // The widget should be populated with the correct values.
  assertEquals('\u200e+45', getPhoneCountrySelectorElement().textContent);
  assertEquals(phoneNumberValue.nationalNumber, getPhoneInputElement().value);
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Submit the form. It should succeed because a phone number is pre-filled.
    submitForm();

    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number triggered.
    externalAuth.assertSignInWithPhoneNumber(
        ['+451234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  }).then(function() {
    // Code sent dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeSent().toString());
    // Wait for one second. Confirm code entry page rendered.
    mockClock.tick(firebaseui.auth.widget.handler.SENDING_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    assertPhoneSignInFinishPage();
  });
}


function testHandlePhoneSignInStart_defaultCountry() {
  // Set the default country to the UK.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'defaultCountry': 'gb'
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country, but the national
  // number input should still be empty.
  assertEquals('\u200e+44', getPhoneCountrySelectorElement().textContent);
  assertEquals('', getPhoneInputElement().value);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Enter a phone number.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');

    // Submit the form.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+441234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_whitelistedCountries() {
  // Whitelisted +1 countries and GB. Default should be set to US since no
  // default country provided.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'whitelistedCountries': ['+44', 'US']
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country, but the national
  // number input should still be empty.
  assertEquals('\u200e+1', getPhoneCountrySelectorElement().textContent);
  assertEquals('', getPhoneInputElement().value);
  // Clicks the country selector button and only the whitelisted country buttons
  // should be shown.
  goog.testing.events.fireClickSequence(getPhoneCountrySelectorElement());
  var actualKeys = getKeysForCountrySelectorButtons();
  assertArrayEquals(
      ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0', '1-US-0'], actualKeys);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Enter a phone number.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');

    // Submit the form.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_whitelistedCountries_defaultCountry() {
  // Whitelisted +1 countries and GB. Default should be set to GB.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'defaultCountry': 'gb',
      'whitelistedCountries': ['+44', 'US']
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country, but the national
  // number input should still be empty.
  assertEquals('\u200e+44', getPhoneCountrySelectorElement().textContent);
  assertEquals('', getPhoneInputElement().value);
  // Clicks the country selector button and only the whitelisted country buttons
  // should be shown.
  goog.testing.events.fireClickSequence(getPhoneCountrySelectorElement());
  var actualKeys = getKeysForCountrySelectorButtons();
  assertArrayEquals(
      ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0', '1-US-0'], actualKeys);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Enter a phone number.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');

    // Submit the form.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+441234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_blacklistedCountries() {
  // Blacklisted US. Default should be set to the available first country(AF)
  // since default country US is blacklisted.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'blacklistedCountries': ['US']
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country, but the national
  // number input should still be empty. Since default country US is
  // blacklisted, the code of first available country is shown, which is AF.
  // Verifies that default country is not set to US since it's blacklisted.
  assertNotEquals('\u200e+1', getPhoneCountrySelectorElement().textContent);
  assertEquals('', getPhoneInputElement().value);
  // Clicks the country selector button and the blacklisted country buttons
  // should not be shown.
  goog.testing.events.fireClickSequence(getPhoneCountrySelectorElement());
  var actualKeys = getKeysForCountrySelectorButtons();
  assertNotContains('1-US-0', actualKeys);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Enter a phone number.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');

    // Submit the form.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+931234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_blacklistedCountries_loginHint() {
  // Blacklisted US. Default should be set to the first +44 country.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'loginHint': '+441234567890',
      'blacklistedCountries': ['US']
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country, but the national
  // number input should still be empty.
  assertEquals('\u200e+44', getPhoneCountrySelectorElement().textContent);
  assertEquals('1234567890', getPhoneInputElement().value);
  // Clicks the country selector button and the blacklisted country buttons
  // should not be shown.
  goog.testing.events.fireClickSequence(getPhoneCountrySelectorElement());
  var actualKeys = getKeysForCountrySelectorButtons();
  assertNotContains('1-US-0', actualKeys);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Enter a phone number.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');

    // Submit the form.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+441234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_unsupportedCountryProvided() {
  // Blacklisted US. Default should be set to the first +44 country.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'whitelistedCountries': ['US']
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country, but the national
  // number input should still be empty.
  assertEquals('\u200e+1', getPhoneCountrySelectorElement().textContent);
  assertEquals('', getPhoneInputElement().value);
  // Clicks the country selector button and only the whitelisted country buttons
  // should be shown.
  goog.testing.events.fireClickSequence(getPhoneCountrySelectorElement());
  var actualKeys = getKeysForCountrySelectorButtons();
  assertArrayEquals(['1-US-0'], actualKeys);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Enter a phone number with unsupported country code +44.
    goog.dom.forms.setValue(getPhoneNumberElement(), '+447123123456');
    // Submit the form.
    submitForm();
    assertPhoneSignInStartPage();
    // Phone number should be cleared.
    assertEquals('', goog.dom.forms.getValue(getPhoneNumberElement()));
    // Error message should be displayed to user.
    assertEquals(
        firebaseui.auth.soy2.strings.errorUnsupportedCountryCode().toString(),
        getPhoneNumberErrorMessage());
    assertNoInfoBarMessage();
  });
}


function testHandlePhoneSignInStart_defaultNationalNumber_phoneOnlyProvider() {
  // Set phone number only provider with US as the default country.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'defaultNationalNumber': '1234567890'
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country and national
  // number. As no default country is provided in the config. US (+1) is
  // selected automatically.
  assertEquals('\u200e+1', getPhoneCountrySelectorElement().textContent);
  assertEquals('1234567890', getPhoneInputElement().value);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    // Submit the form.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_defaultCompleteNumber_phoneOnlyProvider() {
  // Test with phone number as only provider but set the default country to UK.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      // Pass default country.
      'defaultCountry': 'gb',
      // Pass default national number.
      'defaultNationalNumber': '1234567890'
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country (+44) and national
  // number.
  assertEquals('\u200e+44', getPhoneCountrySelectorElement().textContent);
  assertEquals('1234567890', getPhoneInputElement().value);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    // Submit the form.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+441234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_defaultCompleteNumber_multipleProviders() {
  // Test with multiple providers and default country and national number.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      // Pass default country.
      'defaultCountry': 'gb',
      // Pass default national number.
      'defaultNationalNumber': '1234567890'
    },
    // Pass additional provider.
    {
      'provider': 'google.com'
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(app, container);
  assertPhoneSignInStartPage();

  // The widget should be populated with the correct country only and keep
  // the national number blank as multiple providers are used.
  assertEquals('\u200e+44', getPhoneCountrySelectorElement().textContent);
  assertEquals('', getPhoneInputElement().value);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Enter a phone number.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');

    // Submit the form.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+441234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_defaultAndPrefill() {
  // Tests a flow with a prefilled phone number. This should take precedence
  // over the default country.
  var phoneNumberValue = new firebaseui.auth.PhoneNumber(
      '45-DK-0', '1234567890');
  // Set the default country to the UK.
  // The default config fields will be ignored.
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'defaultCountry': 'gb',
      'defaultNationalNumber': '11111111'
    }]
  });
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container, phoneNumberValue);
  assertPhoneSignInStartPage();

  // The widget should show Denmark, not the UK.
  assertEquals('\u200e+45', getPhoneCountrySelectorElement().textContent);
  assertEquals(phoneNumberValue.nationalNumber, getPhoneInputElement().value);

  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
  recaptchaVerifierInstance.assertRender([], 0);
  return recaptchaVerifierInstance.process().then(function() {
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');

    // Submit the form. It should succeed because a phone number is pre-filled.
    submitForm();
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number should be triggered with the correct country
    // code.
    externalAuth.assertSignInWithPhoneNumber(
        ['+451234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  });
}


function testHandlePhoneSignInStart_invisible_clickAction() {
  // Tests successful invisible reCAPTCHA flow triggered with click action.
  // Enable invisible reCAPTCHA.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'invisible'}
      }
    ]
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getSubmitButton(),
      {'type': 'image', 'size': 'invisible'},
      app.getExternalAuth().app);
  // No visible reCAPTCHA.
  assertNull(getRecaptchaElement());
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Form submitted.
    submitForm();
    // As this is invisible, button click should display the reCAPTCHA challenge
    // if it is required or just resolve silently.
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number triggered.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  }).then(function() {
    // No grecaptcha reset called.
    assertEquals(0, goog.global['grecaptcha'].reset.getCallCount());
    // Code sent dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeSent().toString());
    // Wait for one second. Confirm code entry page rendered.
    mockClock.tick(firebaseui.auth.widget.handler.SENDING_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    assertPhoneSignInFinishPage();
    // Confirm expected parameters passed to code entry page.
    // Simulate correct code provided.
    goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
    // Submit form.
    submitForm();
    // Give enough time for code to process.
    return goog.Promise.resolve();
  }).then(function() {
    // Code verified dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
    // Wait for one second. Sign in success URL redirect should occur after.
    mockClock.tick(firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    // Successful sign in.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePhoneSignInStart_invisible_keyAction() {
  // Tests successful invisible reCAPTCHA flow triggered with key action.
  // Enable invisible reCAPTCHA.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'invisible'}
      }
    ]
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getSubmitButton(),
      {'type': 'image', 'size': 'invisible'},
      app.getExternalAuth().app);
  // No visible reCAPTCHA.
  assertNull(getRecaptchaElement());
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Form submitted via enter key. This will force a programmatic click.
    submitFormWithEnterAction();
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    var mockConfirmationResult = createMockConfirmationResult('signIn', false);
    // Sign in with phone number triggered.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        mockConfirmationResult);
    return externalAuth.process();
  }).then(function() {
    // No grecaptcha reset called.
    assertEquals(0, goog.global['grecaptcha'].reset.getCallCount());
    // Code sent dialog shown.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeSent().toString());
    // Wait for one second. Confirm code entry page rendered.
    mockClock.tick(firebaseui.auth.widget.handler.SENDING_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    assertPhoneSignInFinishPage();
    // Simulate correct code provided.
    goog.dom.forms.setValue(getPhoneConfirmationCodeElement(), '123456');
    // Submit form.
    submitForm();
    // Give enough time for code to process.
    return goog.Promise.resolve();
  }).then(function() {
    // Code verified dialog shown on success.
    assertDialog(firebaseui.auth.soy2.strings.dialogCodeVerified().toString());
    // Wait for one second. Sign in success URL redirect should occur after.
    mockClock.tick(firebaseui.auth.widget.handler.CODE_SUCCESS_DIALOG_DELAY);
    assertNoDialog();
    // Successful sign in.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePhoneSignInStart_cancel() {
  // Tests phone start sign in with cancel button being clicked.
  // Enable visible reCAPTCHA.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ]
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Click cancel.
    clickSecondaryLink();
    // reCAPTCHA should be cleared.
    recaptchaVerifierInstance.assertClear();
    // Should return to provider sign in page.
    assertProviderSignInPage();
    // No grecaptcha reset called.
    assertEquals(0, goog.global['grecaptcha'].reset.getCallCount());
  });
}


function testHandlePhoneSignInStart_renderError() {
  // Tests phone sign in start flow with reCAPTCHA rendering error.
  // Enable visible reCAPTCHA.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ]
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering. This will throw an error.
  recaptchaVerifierInstance.assertRender([], null, internalError);
  return recaptchaVerifierInstance.process().then(function() {
    // No dialog should be shown.
    assertNoDialog();
    // Should go back to provider sign in page and display the error.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    assertProviderSignInPage();
  });
}


function testHandlePhoneSignInStart_signInError() {
  // Tests phone sign in start flow with phone verification error.
  // Enable visible reCAPTCHA.
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
      },
      {
        provider: 'phone',
        recaptchaParameters: {'type': 'image', 'size': 'compact'}
      }
    ]
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with expected parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(),
      {'type': 'image', 'size': 'compact'},
      app.getExternalAuth().app);
  // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(5);
    // Return expected widget ID.
    return 5;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Recaptcha rendered at this point.
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Simulate reCAPTCHA solved.
    var callback = recaptchaVerifierInstance.getParameters()['callback'];
    callback('RECAPTCHA_TOKEN');
    submitForm();
    // Loading dialog shown.
    assertDialog(
        firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());
    // Sign in with phone number triggered. Simulate an error thrown.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance],
        null,
        internalError);
    return externalAuth.process();
  }).then(function() {
    // reCAPTCHA should be reset as the token has already been used.
    assertEquals(1, goog.global['grecaptcha'].reset.getCallCount());
    // Reset should be called with the expected widget ID.
    assertEquals(
        5, goog.global['grecaptcha'].reset.getLastCall().getArgument(0));
    // No dialog shown.
    assertNoDialog();
    // Should remain on the page and display the expected error.
    assertPhoneSignInStartPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandlePhoneSignInStart_tooManyRequests() {
  // Tests phone sign in start flow when the user has sent too many SMS codes.
  var error = {'code': 'auth/too-many-requests'};

  app.setConfig({
    'signInOptions': ['phone']
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with default parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
   // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Simulate phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Simulate reCAPTCHA solved.
    recaptchaVerifierInstance.getParameters()['callback']('RECAPTCHA_TOKEN');
    submitForm();
    // Sign in with phone number triggered. Simulate an error thrown.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance], null, error);
    return externalAuth.process();
  }).then(function() {
    // Should remain on the page and display the expected error.
    assertPhoneSignInStartPage();
    assertInfoBarMessage(firebaseui.auth.soy2.strings
        .errorTooManyRequestsPhoneNumber().toString());
  });
}


function testHandlePhoneSignInStart_invalidPhoneNumberErrorCode() {
  // Tests phone sign in start flow when the user provided an invalid phone
  // number.
  var error = {'code': 'auth/invalid-phone-number'};

  app.setConfig({
    'signInOptions': ['phone']
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with default parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
   // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Simulate invalid phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Simulate reCAPTCHA solved.
    recaptchaVerifierInstance.getParameters()['callback']('RECAPTCHA_TOKEN');
    submitForm();
    // Sign in with phone number triggered. Simulate expected error thrown.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance], null, error);
    return externalAuth.process();
  }).then(function() {
    // Should remain on the page and display the expected invalid phone number
    // error inline.
    assertPhoneSignInStartPage();
    assertEquals(
        firebaseui.auth.soy2.strings.errorInvalidPhoneNumber().toString(),
        getPhoneNumberErrorMessage());
    assertNoInfoBarMessage();
  });
}


function testHandlePhoneSignInStart_adminRestrictedOperation_errorPage() {
  // Test phone sign in start flow when getting admin restricted operation
  // error and adminRestrictedOperation status set to true.
  app.setConfig({
    'signInOptions': ['phone', 'google.com'],
    'adminRestrictedOperation': adminRestrictedOperationConfig,
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with default parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
   // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Simulate invalid phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Simulate reCAPTCHA solved.
    recaptchaVerifierInstance.getParameters()['callback']('RECAPTCHA_TOKEN');
    submitForm();
    // Sign in with phone number triggered. Simulate expected error thrown.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance], null,
        adminRestrictedOperationError);
    return externalAuth.process();
  }).then(function() {
    // Verify unauthorized user page is rendered.
    assertUnauthorizedUserPage();
    // Assert cancel button is rendered.
    assertNotNull(getCancelButton());
    // Assert admin email is rendered.
    assertAdminEmail(expectedAdminEmail);
    // Assert help link is rendered.
    assertHelpLink();
    // Click cancel.
    clickSecondaryLink();
    // Verify that clicking back button goes back to the phone sign in starting
    // page.
    assertPhoneSignInStartPage();
    // Reset current rendered widget page.
    app.getAuth().assertSignOut([]);
    app.reset();
  });
}


function testHandlePhoneSignInStart_adminRestrictedOperation_infoBarError() {
  // Test phone sign in start flow when getting admin restricted operation
  // error and adminRestrictedOperation status set to false.
  let modifiedAdminRestrictedOperationConfig =
      Object.assign({}, adminRestrictedOperationConfig);
  modifiedAdminRestrictedOperationConfig.status = false;
  app.setConfig({
    'signInOptions': ['phone'],
    'adminRestrictedOperation': modifiedAdminRestrictedOperationConfig,
  });
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // Confirm reCAPTCHA initialized with default parameters.
  recaptchaVerifierInstance.assertInitializedWithParameters(
      getRecaptchaElement(), {}, app.getExternalAuth().app);
   // reCAPTCHA should be rendering.
  recaptchaVerifierInstance.assertRender([], function() {
    // Simulate grecaptcha loaded.
    simulateGrecaptchaLoaded(0);
    // Return expected widget ID.
    return 0;
  });
  return recaptchaVerifierInstance.process().then(function() {
    // Simulate invalid phone number inputted.
    goog.dom.forms.setValue(getPhoneNumberElement(), '1234567890');
    // Simulate reCAPTCHA solved.
    recaptchaVerifierInstance.getParameters()['callback']('RECAPTCHA_TOKEN');
    submitForm();
    // Sign in with phone number triggered. Simulate expected error thrown.
    externalAuth.assertSignInWithPhoneNumber(
        ['+11234567890', recaptchaVerifierInstance], null,
        adminRestrictedOperationError);
    return externalAuth.process();
  }).then(function() {
    // Should remain on the page and display admin restricted operation error
    // in the info bar.
    assertPhoneSignInStartPage();
    assertInfoBarMessage(firebaseui.auth.widget.handler.common.getErrorMessage(
        adminRestrictedOperationError));
  });
}


function testHandlePhoneSignInStart_reset() {
  // Test when reset is called after phone sign-in start handler called.
  // Render phone sign in start UI.
  firebaseui.auth.widget.handler.handlePhoneSignInStart(
      app, container);
  // Confirm expected page rendered.
  assertPhoneSignInStartPage();
  // This is called and will be cancelled.
  recaptchaVerifierInstance.assertRender([], 0);
  // Reset current rendered widget page.
  app.getAuth().assertSignOut([]);
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}
