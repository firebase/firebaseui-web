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

goog.require('firebaseui.auth.soy2.element');
goog.require('firebaseui.auth.soy2.page');
/** @suppress {extraRequire} Required for initViewer helper function. */
goog.require('firebaseui.auth.soy2.viewHelper');
goog.require('goog.dom');
goog.require('goog.soy');
goog.require('goog.testing.jsunit');


var IJ_DATA_ = {
  'defaultIconUrls': {
    'google.com': '../image/google.svg',
    'github.com': '../image/github.svg',
    'facebook.com': '../image/facebook.svg',
    'twitter.com': '../image/twitter.svg',
    'password': '../image/mail.svg',
    'phone': '../image/phone.svg',
    'anonymous': '../image/anonymous.svg',
    'microsoft.com': '../image/microsoft.svg',
    'yahoo.com': '../image/yahoo.svg',
    'apple.com': '../image/apple.svg',
    'saml': '../image/saml.svg',
    'oidc': '../image/oidc.svg',
  },
  'defaultButtonColors': {
    'google.com': '#ffffff',
    'github.com': '#333333',
    'facebook.com': '#3b5998',
    'twitter.com': '#55acee',
    'password': '#db4437',
    'phone': '#02bd7e',
    'anonymous': '#f4b400',
    'microsoft.com': '#2F2F2F',
    'yahoo.com': '#720E9E',
    'apple.com': '#000000',
    'saml': '#007bff',
    'oidc': '#007bff',
  },
  'defaultProviderNames': {
    'google.com': 'Google',
    'github.com': 'GitHub',
    'facebook.com': 'Facebook',
    'twitter.com': 'Twitter',
    'password': 'Password',
    'phone': 'Phone',
    'anonymous': 'Guest',
    'microsoft.com': 'Microsoft',
    'yahoo.com': 'Yahoo',
    'apple.com': 'Apple',
  },
  'tosCallback': function() {
    window.location.assign('/tos');
  },
  'privacyPolicyCallback': function() {
    window.location.assign('/privacyPolicy');
  },
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


function testBlank() {
  var root = goog.dom.getElement('blank');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.blank, {}, IJ_DATA_);
}

function testBlank_busy() {
  var root = goog.dom.getElement('blank-busy');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.blank, {}, IJ_DATA_);
  var busy = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.busyIndicator, {useSpinner: true});
  root.children[0].appendChild(busy);
}


function testSpinner() {
  var root = goog.dom.getElement('spinner');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.spinner, {}, IJ_DATA_);
}


function testEmailLinkSignInSent() {
  var root = goog.dom.getElement('email-link-sign-in-sent');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailLinkSignInSent, {
        'email': 'user@example.com'
      },
      IJ_DATA_);
}


function testEmailNotReceived() {
  var root = goog.dom.getElement('email-not-received');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailNotReceived, {},
      IJ_DATA_);
}


function testEmailLinkSignInConfirmation() {
  var root = goog.dom.getElement('email-link-sign-in-confirmation');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailLinkSignInConfirmation,
      {'email': 'user@example.com'},
      IJ_DATA_);
}


function testDifferentDeviceError() {
  var root = goog.dom.getElement('different-device-error');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.differentDeviceError, {},
      IJ_DATA_);
}


function testAnonymousUserMismatch() {
  var root = goog.dom.getElement('anonymous-user-mismatch');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.anonymousUserMismatch, {},
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


function testEmailLinkSignInLinking() {
  var root = goog.dom.getElement('email-link-sign-in-linking');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailLinkSignInLinking, {
        email: 'user@example.com',
        providerConfig:  {
          providerId: 'facebook.com',
          providerName: null,
          buttonColor: null,
          iconUrl: null
        }
      },
      IJ_DATA_);
}


function testEmailLinkSignInLinkingDifferentDevice() {
  var root = goog.dom.getElement('email-link-sign-in-linking-different-device');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.emailLinkSignInLinkingDifferentDevice, {
        providerConfig:  {
          providerId: 'facebook.com'
        }
      },
      IJ_DATA_);
}


function testFederatedLinking() {
  var root = goog.dom.getElement('federated-linking');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.federatedLinking, {
        email: 'user@example.com',
        siteName: 'Example Site',
        providerConfig:  {
          providerId: 'facebook.com'
        }
      },
      IJ_DATA_);
}


function testUnsupportedProvider() {
  var root = goog.dom.getElement('unsupported-provider');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.unsupportedProvider, {
        'email': 'user@example.com'
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


function testVerifyAndChangeEmailSuccess() {
  var root = goog.dom.getElement('verify-and-change-email-success');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.verifyAndChangeEmailSuccess,
      {'email': 'user@example.com', 'allowContinue': true});
}


function testVerifyAndChangeEmailSuccessNoContinue() {
  var root = goog.dom.getElement('verify-and-change-email-success-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.verifyAndChangeEmailSuccess,
      {'email': 'user@example.com', 'allowContinue': false});
}


function testVerifyAndChangeEmailFailure() {
  var root = goog.dom.getElement('verify-and-change-email-failure');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.verifyAndChangeEmailFailure,
      {'allowContinue': true});
}


function testVerifyAndChangeEmailFailureNoContinue() {
  var root = goog.dom.getElement('verify-and-change-email-failure-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.verifyAndChangeEmailFailure,
      {'allowContinue': false});
}


function testRevertSecondFactorAdditionSuccessPhone() {
  var root = goog.dom.getElement('revert-second-factor-addition-success-phone');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.revertSecondFactorAdditionSuccess,
      {
        'factorId': 'phone',
        'phoneNumber': '+*******1234',
        'allowContinue': true
      });
}


function testRevertSecondFactorAdditionSuccessDefault() {
  var root = goog.dom.getElement(
      'revert-second-factor-addition-success-default');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.revertSecondFactorAdditionSuccess,
      {
        'factorId': 'unknown',
        'allowContinue': true
      });
}


function testRevertSecondFactorAdditionSuccessNoContinue() {
  var root = goog.dom.getElement(
      'revert-second-factor-addition-success-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.revertSecondFactorAdditionSuccess,
      {
        'factorId': 'phone',
        'phoneNumber': '+*******1234',
        'allowContinue': false
      });
}


function testRevertSecondFactorAdditionFailure() {
  var root = goog.dom.getElement('revert-second-factor-addition-failure');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.revertSecondFactorAdditionFailure,
      {'allowContinue': true});
}


function testRevertSecondFactorAdditionFailureNoContinue() {
  var root = goog.dom.getElement(
      'revert-second-factor-addition-failure-no-continue');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.revertSecondFactorAdditionFailure,
      {'allowContinue': false});
}


function testRecoverableError() {
  var root = goog.dom.getElement('recoverable-error');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.recoverableError,
      {
        'errorMessage': 'A network error (such as timeout, interrupted ' +
            'connection or unreachable host) has occurred.',
        'allowRetry': true
      },
      IJ_DATA_);
}


function testRecoverableError_noRetryButton() {
  var root = goog.dom.getElement('recoverable-error-no-retry-button');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.recoverableError,
      {
        'errorMessage': 'A network error (such as timeout, interrupted ' +
            'connection or unreachable host) has occurred.',
        'allowRetry': false
      },
      IJ_DATA_);
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
        'providerConfigs': [
          {
            providerId: 'password'
          },
          {
            providerId: 'phone'
          },
          {
            providerId: 'google.com'
          },
          {
            providerId: 'github.com'
          },
          {
            providerId: 'facebook.com'
          },
          {
            providerId: 'twitter.com'
          },
          {
            providerId: 'anonymous'
          },
          {
            providerId: 'microsoft.com',
            providerName: 'Microsoft',
            buttonColor: '#FFB6C1',
            iconUrl: 'icon-url',
            loginHintKey: 'login_hint'
          }]
      },
      IJ_DATA_);
}


function testProviderSignIn_buttonCustomization() {
  var root = goog.dom.getElement('provider-sign-in-customization');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.providerSignIn, {
        'providerConfigs': [
          {
            providerId: 'password',
            fullName: 'Login with password',
            providerName: 'Password',
          },
          {
            providerId: 'phone',
            fullName: 'Phone login',
            providerName: 'Phone Number',
          },
          {
            providerId: 'google.com',
            fullName: 'ACME Login',
            providerName: 'ACME',
          },
          {
            providerId: 'anonymous',
            fullName: 'Create account later',
            providerName: 'Skip',
          },
          {
            providerId: 'microsoft.com',
            providerName: 'Microsoft',
            buttonColor: '#FFB6C1',
            iconUrl: 'icon-url',
            loginHintKey: 'login_hint'
          },
          {
            providerId: 'oidc.provider',
            providerName: 'MyOidcIdp',
            fullLabel: 'Employee Login',
            buttonColor: '#ff00ff',
            iconUrl: 'icon-url'
          }]
      },
      IJ_DATA_);
}


function testProviderSignIn_busy() {
  var root = goog.dom.getElement('provider-sign-in-busy');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.providerSignIn, {
        'providerConfigs': [
          {
            providerId: 'password'
          },
          {
            providerId: 'phone'
          },
          {
            providerId: 'google.com'
          },
          {
            providerId: 'github.com'
          },
          {
            providerId: 'facebook.com'
          },
          {
            providerId: 'twitter.com'
          },
          {
            providerId: 'anonymous'
          },
          {
            providerId: 'microsoft.com',
            providerName: 'Microsoft',
            buttonColor: '#FFB6C1',
            iconUrl: 'icon-url',
            loginHintKey: 'login_hint'
          }]
      },
      IJ_DATA_);
  var busy = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.busyIndicator, {useSpinner: true});
  root.children[0].appendChild(busy);
}


function testPhoneSignInStartInvisibleRecaptcha() {
  var root = goog.dom.getElement('phone-sign-in-start-invisible-recaptcha');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInStart,
      {enableVisibleRecaptcha: false, displayCancelButton: true}, IJ_DATA_);
}


function testPhoneSignInStartVisibleRecaptcha() {
  var root = goog.dom.getElement('phone-sign-in-start-visible-recaptcha');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInStart,
      {enableVisibleRecaptcha: true, displayCancelButton: true}, IJ_DATA_);
  loadRecaptcha(root);
}


function testPhoneSignInStart_fullMessage() {
  var root = goog.dom.getElement('phone-sign-in-start-full-message');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInStart,
      {
        enableVisibleRecaptcha: false,
        displayCancelButton: true,
        displayFullTosPpMessage: true
      }, IJ_DATA_);
}


function testPhoneSignInStart_noCancelButton() {
  var root = goog.dom.getElement('phone-sign-in-start-no-cancel-button');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.phoneSignInStart,
      {enableVisibleRecaptcha: false, displayCancelButton: false}, IJ_DATA_);
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


function testSignOut() {
  var root = goog.dom.getElement('sign-out');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.signOut, {}, IJ_DATA_);
}


function testTenantSelect() {
  const root = goog.dom.getElement('select-tenant');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.selectTenant, {
        tenantConfigs: [
          {
            tenantId: 'TENANT_ID',
            displayName: 'Contractor A',
            buttonColor: '#FFB6C1',
            iconUrl: 'icon-url',
          },
          {
            tenantId: null,
            displayName: 'ACME',
            buttonColor: '#53B2BF',
            iconUrl: 'icon-url',
          },
          {
            tenantId: 'TENANT_1',
            fullLabel: 'Contractor Login',
            displayName: 'OIDC',
            buttonColor: '#4666FF',
            iconUrl: 'icon-url',
          },
          {
            tenantId: 'TENANT_2',
            fullLabel: null,
            displayName: 'ACME Corp',
            buttonColor: '#2F2B2E',
            iconUrl: 'icon-url',
          },
        ],
      },
      IJ_DATA_);
}


function testTenantSelect_noTenants() {
  const root = goog.dom.getElement('select-tenant-no-tenants');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.selectTenant, {
        tenantConfigs: [],
      },
      IJ_DATA_);
}


function testProviderMatchByEmail() {
  var root = goog.dom.getElement('provider-match-by-email');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.page.providerMatchByEmail, {}, IJ_DATA_);
}
