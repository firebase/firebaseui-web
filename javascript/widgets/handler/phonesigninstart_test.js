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

goog.require('firebaseui.auth.PhoneNumber');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} Required for page navigation. */
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInFinish');
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInStart');
/** @suppress {extraRequire} Required for page navigation after form
 *      cancellation to work. */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
/** @suppress {extraRequire} Required for test helpers. */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.forms');


// Mock confirmation result.
var mockConfirmationResult = {
  'confirm': function(code) {
    assertEquals('123456', code);
    return goog.Promise.resolve();
  }
};


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
  app.setConfig({
    'signInOptions': [{
      'provider': 'phone',
      'defaultCountry': 'gb'
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
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}
