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
 * @fileoverview Tests for pages.soy.
 */

goog.provide('firebaseui.auth.soy2.pageTest');
goog.setTestOnly('firebaseui.auth.soy2.pageTest');

goog.require('firebaseui.auth.soy2.page');
/** @suppress {extraRequire} Required for initViewer helper function. */
goog.require('firebaseui.auth.soy2.viewHelper');
goog.require('goog.dom');
goog.require('goog.soy');
goog.require('goog.testing.jsunit');


var IJ_DATA_ = {
  'googleLogo': '../image/google.svg',
  'githubLogo': '../image/github.svg',
  'facebookLogo': '../image/facebook.svg',
  'twitterLogo': '../image/twitter.svg',
  'passwordLogo': '../image/mail.svg',
  'phoneLogo': '../image/phone.svg',
  'tosUrl': 'tos',
  'privacyPolicyUrl': 'privacy_policy'
};


function setUpPage() {
  initViewer('pages.soy');
}


function tearDownPage() {
  if (window['componentHandler'] &&
      window['componentHandler']['upgradeAllRegistered']) {
    window['componentHandler']['upgradeAllRegistered']();
  }
}


function testSignIn() {
  var root = goog.dom.getElement('sign-in');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.signIn, {'displayCancelButton': true},
      IJ_DATA_);
}


function testSignIn_infoBar() {
  var root = goog.dom.getElement('sign-in-info-bar');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.signIn, {'displayCancelButton': true},
      IJ_DATA_);
  var message = 'You are currently logged into a different account on Google' +
      '. Please select another account or visit Google to login to the ' +
      'desired one.';
  var infoBar = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.infoBar, {'message': message});
  root.children[0].appendChild(infoBar);
}


function testSignIn_busy() {
  var root = goog.dom.getElement('sign-in-busy');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.signIn,
      {'email': 'user@example.com', 'displayCancelButton': true},
      IJ_DATA_);
  var busy = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.busyIndicator, null);
  root.children[0].appendChild(busy);
}


function testSignIn_noCancelButton() {
  var root = goog.dom.getElement('sign-in-no-cancel-button');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.signIn,
      {'email': 'user@example.com', 'displayCancelButton': false},
      IJ_DATA_);
}

function testSignIn_fullMessage() {
  var root = goog.dom.getElement('sign-in-full-message');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.signIn,
      {
        'email': 'user@example.com',
        'displayCancelButton': true,
        'displayFullTosPpMessage': true
      }, IJ_DATA_);
}


function testSignIn_footerOnly() {
  var root = goog.dom.getElement('sign-in-footer-only');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.signIn,
      {
        'email': 'user@example.com',
        'displayCancelButton': true,
        'displayFullTosPpMessage': false
      }, IJ_DATA_);
}


function testPasswordSignIn() {
  var root = goog.dom.getElement('password-sign-in');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordSignIn,
      {'email': 'user@example.com'}, IJ_DATA_);
}


function testPasswordSignIn_fullMessage() {
  var root = goog.dom.getElement('password-sign-in-full-message');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordSignIn,
      {
        'email': 'user@example.com',
        'displayFullTosPpMessage': true
      }, IJ_DATA_);
}


function testPasswordSignUp() {
  var root = goog.dom.getElement('password-sign-up');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordSignUp, {
        'email': 'user@example.com',
        'requireDisplayName': true,
        'allowCancel': true
      },
      IJ_DATA_);
}


function testPasswordSignUp_noDisplayName() {
  var root = goog.dom.getElement('password-sign-up-no-name');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordSignUp, {
        'email': 'user@example.com',
        'requireDisplayName': false,
        'allowCancel': true
      },
      IJ_DATA_);
}


function testPasswordSignUp_fullMessage() {
  var root = goog.dom.getElement('password-sign-up-tos');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordSignUp, {
        'email': 'user@example.com',
        'allowCancel': true,
        'displayFullTosPpMessage': true
      },
      IJ_DATA_);
}


function testPasswordRecovery() {
  var root = goog.dom.getElement('password-recovery');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordRecovery,
      {'email': 'user@example.com', 'allowCancel': true}, IJ_DATA_);
}


function testPasswordRecoveryEmailSent() {
  var root = goog.dom.getElement('password-recovery-email-sent');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordRecoveryEmailSent,
      {'email': 'user@example.com', 'allowContinue': true}, IJ_DATA_);
}


function testPasswordRecoveryEmailSentNoContinue() {
  var root = goog.dom.getElement('password-recovery-email-sent-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordRecoveryEmailSent,
      {'email': 'user@example.com', 'allowContinue': false}, IJ_DATA_);
}


function testCallback() {
  var root = goog.dom.getElement('callback');
  goog.soy.renderElement(root, firebaseui.auth.soy2.page.callback);
}


function testPasswordLinking() {
  var root = goog.dom.getElement('password-linking');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordLinking, {
        'email': 'user@example.com',
        'siteName': 'Example Site',
        'providerId': 'google.com'
      },
      IJ_DATA_);
}


function testFederatedLinking() {
  var root = goog.dom.getElement('federated-linking');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.federatedLinking, {
        'email': 'user@example.com',
        'siteName': 'Example Site',
        'providerId': 'google.com'
      },
      IJ_DATA_);
}


function testPasswordReset() {
  var root = goog.dom.getElement('password-reset');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordReset,
      {'email': 'user@example.com'});
}


function testPasswordResetSuccess() {
  var root = goog.dom.getElement('password-reset-success');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordResetSuccess,
      {'allowContinue': true});
}


function testPasswordResetSuccessNoContinue() {
  var root = goog.dom.getElement('password-reset-success-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordResetSuccess,
      {'allowContinue': false});
}


function testPasswordResetFailure() {
  var root = goog.dom.getElement('password-reset-failure');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordResetFailure,
      {'allowContinue': true});
}


function testPasswordResetFailureNoContinue() {
  var root = goog.dom.getElement('password-reset-failure-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.passwordResetFailure,
      {'allowContinue': false});
}


function testEmailChangeRevocationSuccess() {
  var root = goog.dom.getElement('email-change-revocation-success');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailChangeRevokeSuccess,
      {'email': 'user@example.com', 'allowContinue': true});
}


function testEmailChangeRevocationSuccessNoContinue() {
  var root = goog.dom.getElement('email-change-revocation-success-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailChangeRevokeSuccess,
      {'email': 'user@example.com', 'allowContinue': false});
}

function testEmailChangeRevocationFailure() {
  var root = goog.dom.getElement('email-change-revocation-failure');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailChangeRevokeFailure,
      {'allowContinue': true});
}


function testEmailChangeRevocationFailureNoContinue() {
  var root = goog.dom.getElement('email-change-revocation-failure-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailChangeRevokeFailure,
      {'allowContinue': false});
}


function testEmailVerificationSuccess() {
  var root = goog.dom.getElement('email-verification-success');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailVerificationSuccess,
      {'allowContinue': true});
}


function testEmailVerificationSuccessNoContinue() {
  var root = goog.dom.getElement('email-verification-success-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailVerificationSuccess,
      {'allowContinue': false});
}


function testEmailVerificationFailure() {
  var root = goog.dom.getElement('email-verification-failure');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailVerificationFailure,
      {'allowContinue': true});
}


function testEmailVerificationFailureNoContinue() {
  var root = goog.dom.getElement('email-verification-failure-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailVerificationFailure,
      {'allowContinue': false});
}


function testUnrecoverableError() {
  var root = goog.dom.getElement('unrecoverable-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.page.unrecoverableError, {
    'errorMessage': 'The browser you are using does not support Web ' +
        'Storage. Please try again in a different browser.'
  });
}


function testEmailMismatch() {
  var root = goog.dom.getElement('email-mismatch');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailMismatch,
      {'userEmail': 'user@example.com', 'pendingEmail': 'other@example.com'},
      IJ_DATA_);
}


function testProviderSignIn() {
  var root = goog.dom.getElement('provider-sign-in');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.providerSignIn, {
        'providerIds':
            ['password', 'phone', 'google.com', 'github.com', 'facebook.com']
      },
      IJ_DATA_);
}


function testPhoneSignInStartInvisibleRecaptcha() {
  var root = goog.dom.getElement('phone-sign-in-start-invisible-recaptcha');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInStart,
      {enableVisibleRecaptcha: false}, IJ_DATA_);
}


function testPhoneSignInStartVisibleRecaptcha() {
  var root = goog.dom.getElement('phone-sign-in-start-visible-recaptcha');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInStart,
      {enableVisibleRecaptcha: true}, IJ_DATA_);
  loadRecaptcha(root);
}


function testPhoneSignInStart_fullMessage() {
  var root = goog.dom.getElement('phone-sign-in-start-full-message');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInStart,
      {
        enableVisibleRecaptcha: false,
        displayFullTosPpMessage: true
      }, IJ_DATA_);
}


function testPhoneSignInFinish() {
  var root = goog.dom.getElement('phone-sign-in-finish');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInFinish,
      {
        phoneNumber: '+13115552368'
      },
      IJ_DATA_);
  var countdown = goog.dom.getElementByClass(
      'firebaseui-id-resend-countdown', root);
  goog.dom.setTextContent(countdown, 'Resend code in 0:11');
}


function testPhoneSignInFinish_noTos() {
  var root = goog.dom.getElement('phone-sign-in-finish-no-tos');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInFinish,
      {
        phoneNumber: '+13115552368'
      }, IJ_DATA_);
}
