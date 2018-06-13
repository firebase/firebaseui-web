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
 * @fileoverview Helper functions for testing.
 */

goog.provide('firebaseui.auth.widget.handler.testHelper');
goog.setTestOnly('firebaseui.auth.widget.handler.testHelper');

goog.require('firebaseui.auth.Account');
goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.CredentialHelper');
goog.require('firebaseui.auth.OAuthResponse');
goog.require('firebaseui.auth.callback.signInSuccess');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.testing.FakeAcClient');
goog.require('firebaseui.auth.testing.FakeAppClient');
goog.require('firebaseui.auth.testing.FakeUtil');
goog.require('firebaseui.auth.testing.RecaptchaVerifier');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


var federatedIdToken = 'HEADER.eyJhdWQiOiAiY2xpZW50X2lkIiwgImVtYWlsIjogInVzZ' +
    'XJAZXhhbXBsZS5jb20iLCAicHJvdmlkZXJfaWQiOiAiZ29vZ2xlLmNvbSIsICJpc3MiOiAx' +
    'NDA0NjMzNDQyLCAiZXhwIjogMTUwNDYzMzQ0Mn0.SIGNATURE';
var federatedAccount = new firebaseui.auth.Account(
    'user@example.com', 'Federated User', null, 'google.com');
var passwordIdToken = 'HEADER.eyJhdWQiOiAiY2xpZW50X2lkIiwgImVtYWlsIjogInVzZX' +
    'JAZXhhbXBsZS5jb20iLCAiaXNzIjogMTQwNDYzMzQ0MiwgImV4cCI6IDE1MDQ2MzM0NDJ9.' +
    'SIGNATURE';
var passwordUser = {email: 'user@example.com', displayName: 'Password User'};
var federatedUserAccount = new firebaseui.auth.Account(
    'user@example.com', 'Federated User', null, 'google.com');
var federatedUser = {
  email: 'user@example.com',
  displayName: 'Federated User',
  providerData: [{
    'uid': 'FED_ID',
    'email': 'user@example.com',
    'displayName': 'Federated User',
    'providerId': 'google.com'
  }]
};
var passwordAccount =
    new firebaseui.auth.Account('user@example.com', 'Password User');

var oauthAccessToken = 'access token';
var oauthExpireIn = 3600;
var oauthAuthorizationCode = 'authorization code';
var oauthResponse = /** @type {?firebaseui.auth.OAuthResponse} */ ({
  'oauthAccessToken': oauthAccessToken,
  'oauthExpireIn': oauthExpireIn,
  'oauthAuthorizationCode': oauthAuthorizationCode
});

var internalError = {
  'code': 'auth/internal-error',
  'message': 'An internal error occurred.'
};
var operationNotSupportedError = {
  'code': 'auth/operation-not-supported-in-this-environment',
  'message': 'This operation is not supported in the environment this ' +
      'application is running on. "location.protocol" must be http, https ' +
      'or chrome-extension and web storage must be enabled.'
};
// googleyolo ID token credential.
var googleYoloIdTokenCredential = {
  'idToken': 'ID_TOKEN',
  'id': federatedAccount.getEmail(),
  'authMethod': 'https://accounts.google.com'
};
// googleyolo non ID token credential.
var googleYoloOtherCredential = {
  'id': federatedAccount.getEmail(),
  'authMethod': 'https://accounts.google.com'
};
// Mock anonymous user.
var anonymousUser = {
  uid: '1234567890',
  isAnonymous: true
};

var container;
var container2;
var testAc;
var testUtil;
var recaptchaVerifierInstance = null;
var externalAuthApp;
var externalAuth;
var testAuth;

var signInCallbackUser;
var signInCallbackCredential;
var signInCallbackAdditionalUserInfo;
var signInCallbackOperationType;
var signInCallbackRedirectUrl;
var uiShownCallbackCount;
var signInFailureCallback;

var callbackStub = new goog.testing.PropertyReplacer();

var signInOptionsWithScopes = [
  {
    'provider': 'google.com',
    'scopes': ['googl1', 'googl2'],
    'customParameters': {'prompt': 'select_account'}
  },
  {'provider': 'facebook.com', 'scopes': ['fb1', 'fb2']}, 'password'
];

var testStubs = new goog.testing.PropertyReplacer();
var mockClock = new goog.testing.MockClock();

var expectedSessionId = 'SESSION_ID_STRING';

var app;
var appId = 'glowing-heat-3485';

var accountChooserInvokedCallback;
var accountChooserResultCallback;
var authCredential;
var federatedCredential;

var firebase = {};
var getApp;
var testComponent;


function setUp() {
  // Used to initialize internal auth instance.
  firebase = {};
  firebase.initializeApp = function(options, name) {
    return new firebaseui.auth.testing.FakeAppClient(options, name);
  };
  // Developer provided auth instance.
  externalAuthApp = new firebaseui.auth.testing.FakeAppClient();
  // Install developer provided auth instance.
  externalAuth = externalAuthApp.auth().install();
  app = new firebaseui.auth.AuthUI(externalAuth, appId);
  // Install internal temporary auth instance.
  testAuth = app.getAuth().install();
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);
  // Test component used for setLoggedIn tests which requires a component.
  container2 = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container2);
  testComponent = new firebaseui.auth.ui.page.Base(function() {
    return '<div></div>';
  });
  // Render test component in container2.
  testComponent.render(container2);
  testAc = new firebaseui.auth.testing.FakeAcClient().install();
  testUtil = new firebaseui.auth.testing.FakeUtil().install();
  signInCallbackUser = undefined;
  signInCallbackRedirectUrl = undefined;
  signInCallbackCredential = undefined;
  signInCallbackAdditionalUserInfo = undefined;
  signInCallbackOperationType = undefined;
  uiShownCallbackCount = 0;
  // Define recorded signInFailure callback.
  signInFailureCallback = goog.testing.recordFunction(function() {
    return goog.Promise.resolve();
  });
  app.setConfig({
    'signInSuccessUrl': 'http://localhost/home',
    'widgetUrl': 'http://localhost/firebaseui-widget',
    'signInOptions': ['google.com', 'facebook.com', 'password'],
    'siteName': 'Test Site',
    'popupMode': false,
    'tosUrl': 'http://localhost/tos',
    'privacyPolicyUrl': 'http://localhost/privacy_policy',
    'credentialHelper': firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
    'callbacks': {
      'signInFailure': signInFailureCallback
    },

  });
  window.localStorage.clear();
  window.sessionStorage.clear();

  mockClock.install();
  // For testing simulate accountchooser.com js is loaded to prevent loading of
  // accountchooser.com js during loading and to call callback on load.
  accountchooser = {};
  // Reset accountchooser.com force UI shown flag.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = false;
  // For browsers that do not support CORS which rely on gapi for XHR, simulate
  // this capability so as to test XHR requests and responses properly.
  testStubs.set(firebaseui.auth.util, 'supportsCors', function() {
    return true;
  });
  // Record accountchooser.com callback calls.
  accountChooserInvokedCallback = goog.testing.recordFunction();
  accountChooserResultCallback = goog.testing.recordFunction();
  // Just pass the credential object through for the test.
  testStubs.replace(firebaseui.auth.idp, 'getAuthCredential', function(obj) {
    return obj;
  });
  // Build mock auth providers.
  firebase['auth'] = {};
  // Mock reCAPTCHA verifier.
  firebase.auth.RecaptchaVerifier = function(container, params, app) {
    // Install on initialization.
    recaptchaVerifierInstance =
        new firebaseui.auth.testing.RecaptchaVerifier(container, params, app);
    recaptchaVerifierInstance.install();
    return recaptchaVerifierInstance;
  };
  for (var key in firebaseui.auth.idp.AuthProviders) {
    firebase['auth'][firebaseui.auth.idp.AuthProviders[key]] = function() {
      this.scopes = [];
      this.customParameters = {};
    };
    firebase['auth'][firebaseui.auth.idp.AuthProviders[key]].PROVIDER_ID = key;
    for (var method in firebaseui.auth.idp.SignInMethods[key]) {
      firebase['auth'][firebaseui.auth.idp.AuthProviders[key]][method] =
          firebaseui.auth.idp.SignInMethods[key][method];
    }
    if (key != 'twitter.com' && key != 'password') {
      firebase['auth'][firebaseui.auth.idp.AuthProviders[key]]
          .prototype.addScope = function(scope) {
        this.scopes.push(scope);
      };
    }
    if (key != 'password') {
      // Record setCustomParameters for all OAuth providers.
      firebase['auth'][firebaseui.auth.idp.AuthProviders[key]]
          .prototype.setCustomParameters = function(customParameters) {
        this.customParameters = customParameters;
      };
    }
  }
  // Initialize after getAuthCredential stub.
  authCredential = firebaseui.auth.idp.getAuthCredential(
      {'accessToken': 'facebookAccessToken', 'providerId': 'facebook.com'});
  federatedCredential = firebaseui.auth.idp.getAuthCredential(
      {'accessToken': 'googleAccessToken', 'providerId': 'google.com'});
  // Simulate email auth provider credential.
  firebase['auth']['EmailAuthProvider'] =
      firebase['auth']['EmailAuthProvider'] || {};
  firebase['auth']['EmailAuthProvider']['credential'] = function(
      email, password) {
    return {'email': email, 'password': password, 'providerId': 'password'};
  };
  // Simulate Google Auth Provider credential.
  firebase['auth']['GoogleAuthProvider'] =
      firebase['auth']['GoogleAuthProvider'] || {};
  firebase['auth']['GoogleAuthProvider']['credential'] = function(
      idToken, accessToken) {
    return {
      'idToken': idToken,
      'accessToken': accessToken,
      'providerId': 'google.com'
    };
  };
  getApp = function() {
    return app;
  };
  // Assume widget already rendered and AuthUI global reference set.
  testStubs.replace(firebaseui.auth.AuthUI, 'getAuthUi', function() {
    return app;
  });
  // Simulate accountchooser.com loaded.
  testStubs.set(
      firebaseui.auth.widget.handler.common, 'loadAccountchooserJs',
      function(app, callback, opt_forceUiShownCallback) {
        firebaseui.auth.widget.handler.common.acForceUiShown_ =
            !!opt_forceUiShownCallback;
        callback();
      });
  // Mock dialog polyfill.
  window['dialogPolyfill'] = {
    'registerDialog': function(dialog) {
      dialog.open = false;
      dialog.showModal = function() {
        dialog.open = true;
      };
      dialog.close = function() {
        dialog.open = false;
      };
    }
  };
  // Remove any grecaptcha mocks.
  delete goog.global['grecaptcha'];
  // Record all calls to One-Tap show and cancel APIs.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'showOneTapSignIn',
      goog.testing.recordFunction());
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'cancelOneTapSignIn',
      goog.testing.recordFunction());
}


function tearDown() {
  testAc.uninstall();
  testUtil.uninstall();
  goog.dom.removeNode(container);
  goog.dom.removeNode(container2);
  callbackStub.reset();
  testStubs.reset();

  mockClock.tick(Infinity);
  mockClock.reset();
  mockClock.uninstall();

  // accountchooser.com js not loaded.
  accountchooser = null;
  // Uninstall internal and external auth instance.
  testAuth.uninstall();
  externalAuth.uninstall();
  // Uninstall reCAPTCHA verifier if available.
  if (recaptchaVerifierInstance) {
    recaptchaVerifierInstance.uninstall();
  }
  // Reset AuthUI internals.
  firebaseui.auth.AuthUI.resetAllInternals();
}


/**
 * Mocks grecaptcha API.
 * @param {number} widgetId The expected reCAPTCHA widget ID.
 */
function simulateGrecaptchaLoaded(widgetId) {
  goog.global['grecaptcha'] = {
    render: goog.testing.recordFunction(function() {
      return widgetId;
    }),
    getResponse: goog.testing.recordFunction(),
    reset: goog.testing.recordFunction()
  };
}


/** Simulates a Cordova environment. */
function simulateCordovaEnvironment() {
  testStubs.replace(
      firebaseui.auth.util,
      'getScheme',
      function() {
        return 'file:';
      });
}


/**
 * @param {?Object=} opt_customParameters The optional custom OAuth parameters
 *     to match if expected.
 * @return {!Object} The expected provider with custom parameters and scopes
 *     after updating signInOptions.
 */
function getExpectedProviderWithScopes(opt_customParameters) {
  // Add additional scopes to test they are properly passed to sign in method.
  app.updateConfig('signInOptions', signInOptionsWithScopes);
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  // Set custom parameters if provided on the expected provider.
  if (opt_customParameters) {
    expectedProvider.setCustomParameters(opt_customParameters);
  }
  return expectedProvider;
}


/**
 * @param {string} providerId The provider Id to initialize.
 * @param {?Object=} opt_customParameters The optional custom OAuth parameters
 *     to match if expected.
 * @return {!Object} The expected provider with custom parameters and no scopes.
 */
function getExpectedProviderWithCustomParameters(
    providerId, opt_customParameters) {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider(providerId);
  // Set custom parameters if provided on the expected provider.
  if (opt_customParameters) {
    expectedProvider.setCustomParameters(opt_customParameters);
  }
  return expectedProvider;
}


/**
 * Submits form on current page.
 */
function submitForm() {
  var submit = goog.dom.getElementByClass('firebaseui-id-submit', container);
  goog.testing.events.fireClickSequence(submit);
}


/**
 * Submits form on current page with an ENTER key action.
 */
function submitFormWithEnterAction() {
  var submit = goog.dom.getElementByClass('firebaseui-id-submit', container);
  goog.testing.events.fireKeySequence(submit, goog.events.KeyCodes.ENTER);
}


/**
 * Triggers a click on the change phone number link.
 */
function clickChangePhoneNumberLink() {
  var changePhoneNumberLink = goog.dom.getElementByClass(
      'firebaseui-id-change-phone-number-link', container);
  goog.testing.events.fireClickSequence(changePhoneNumberLink);
}


/**
 * Triggers a click on the resend link.
 */
function clickResendLink() {
  var el = goog.dom.getElementByClass('firebaseui-id-resend-link', container);
  goog.testing.events.fireClickSequence(el);
}


/**
 * Triggers a click on the secondary link element.
 */
function clickSecondaryLink() {
  var secondaryLink =
      goog.dom.getElementByClass('firebaseui-id-secondary-link', container);
  goog.testing.events.fireClickSequence(secondaryLink);
}


/** @return {?Element} The email element on the current page. */
function getEmailElement() {
  return goog.dom.getElementByClass('firebaseui-id-email', container);
}


/**
 * @return {?Element} The country selector button for the phone number input
 *     on the current page.
 */
function getPhoneCountrySelectorElement() {
  return goog.dom.getElementByClass(
      'firebaseui-id-country-selector', container);
}


/** @return {?Element} The phone number input element on the current page. */
function getPhoneInputElement() {
  return goog.dom.getElementByClass('firebaseui-id-phone-number', container);
}


/** @return {string} The content of the email error message. */
function getEmailErrorMessage() {
  var element =
      goog.dom.getElementByClass('firebaseui-id-email-error', container);
  assertFalse(goog.dom.classlist.contains(element, 'firebaseui-hidden'));
  return goog.dom.getTextContent(element);
}


/** @return {?Element} The arrow indicator element on the current page. */
function getIndicatorElement() {
  return goog.dom.getElementByClass('firebaseui-id-arrow-indicator', container);
}


function getProblemSignInLinkElement() {
  return goog.dom.getElementByClass('firebaseui-id-problem-sign-in', container);
}


function getPasswordElement() {
  return goog.dom.getElementByClass('firebaseui-id-password', container);
}

function getPasswordErrorMessage() {
  var element =
      goog.dom.getElementByClass('firebaseui-id-password-error', container);
  assertFalse(goog.dom.classlist.contains(element, 'firebaseui-hidden'));
  return goog.dom.getTextContent(element);
}


function getNameElement() {
  return goog.dom.getElementByClass('firebaseui-id-name', container);
}


function getNewPasswordElement() {
  return goog.dom.getElementByClass('firebaseui-id-new-password', container);
}


function getNewPasswordErrorMessage() {
  var element =
      goog.dom.getElementByClass('firebaseui-id-new-password-error', container);
  assertFalse(goog.dom.classlist.contains(element, 'firebaseui-hidden'));
  return goog.dom.getTextContent(element);
}


function getIdpButtons() {
  return goog.dom.getElementsByClass('firebaseui-id-idp-button', container);
}


function getAccountChips() {
  return goog.dom.getElementsByClass('firebaseui-id-account-chip', container);
}


function getRemoveLinkedAccountsLinks() {
  return goog.dom.getElementsByClass('firebaseui-id-remove-idp', container);
}


function getEmailInfoContainer() {
  return goog.dom.getElementByClass(
      'firebaseui-id-email-info-container', container);
}


function getPasswordInfoContainer() {
  return goog.dom.getElementByClass(
      'firebaseui-id-password-info-container', container);
}


function getLinkedAccountsContainer() {
  return goog.dom.getElementByClass(
      'firebaseui-id-linked-accounts-container', container);
}


/**
 * @return {?Element} The submit button on the current page within container.
 */
function getSubmitButton() {
  return goog.dom.getElementByClass('firebaseui-id-submit', container);
}


/**
 * @return {?Element} The cancel button on the current page within container.
 */
function getCancelButton() {
  return goog.dom.getElementByClass('firebaseui-id-secondary-link', container);
}


/**
 * @return {?Element} The reset password link element in the container.
 */
function getResetPasswordLinkElement() {
  return goog.dom.getElementByClass(
      'firebaseui-id-reset-password-link', container);
}


/**
 * @return {?Element} The phone element in the container.
 */
function getPhoneNumberElement() {
  return goog.dom.getElementByClass('firebaseui-id-phone-number', container);
}


/**
 * @return {?Element} The reCAPTCHA element in the container.
 */
function getRecaptchaElement() {
  return goog.dom.getElementByClass(
      'firebaseui-recaptcha-container', container);
}


/** @return {?string} The phone number error message. */
function getPhoneNumberErrorMessage() {
  var element =
      goog.dom.getElementByClass('firebaseui-id-phone-number-error', container);
  assertFalse(goog.dom.classlist.contains(element, 'firebaseui-hidden'));
  return goog.dom.getTextContent(element);
}


/** @return {?string} The reCAPTCHA error message. */
function getRecaptchaErrorMessage() {
  var element =
      goog.dom.getElementByClass('firebaseui-id-recaptcha-error', container);
  assertFalse(goog.dom.classlist.contains(element, 'firebaseui-hidden'));
  return goog.dom.getTextContent(element);
}


/** @return {?Element} The confirmation code element in the container. */
function getPhoneConfirmationCodeElement() {
  return goog.dom.getElementByClass(
      'firebaseui-id-phone-confirmation-code', container);
}


/** @return {?string} The phone code verification error message. */
function getPhoneConfirmationCodeErrorMessage() {
  var element = goog.dom.getElementByClass(
      'firebaseui-id-phone-confirmation-code-error', container);
  assertFalse(goog.dom.classlist.contains(element, 'firebaseui-hidden'));
  return goog.dom.getTextContent(element);
}


/**
 * @param {?string} tosUrl
 * @param {?string} privacyPolicyUrl
 */
function assertTosPpFullMessage(tosUrl, privacyPolicyUrl) {
  var element = goog.dom.getElementByClass('firebaseui-tos', container);
  if (!tosUrl && !privacyPolicyUrl) {
    assertNull(element);
  } else {
    assertTrue(element.classList.contains('firebaseui-tospp-full-message'));
    var tosLinkElement = goog.dom.getElementByClass(
      'firebaseui-tos-link', container);
    var ppLinkElement = goog.dom.getElementByClass(
      'firebaseui-pp-link', container);
    assertEquals(tosUrl, tosLinkElement.href);
    assertEquals(privacyPolicyUrl, ppLinkElement.href);
  }
}


/**
 * @param {?string} tosUrl
 * @param {?string} privacyPolicyUrl
 */
function assertTosPpFooter(tosUrl, privacyPolicyUrl) {
  var element = goog.dom.getElementByClass('firebaseui-tos-list', container);
  if (!tosUrl && !privacyPolicyUrl) {
    assertNull(element);
  } else {
    assertTrue(element.classList.contains('firebaseui-tos-list'));
    var tosLinkElement = goog.dom.getElementByClass(
      'firebaseui-tos-link', container);
    var ppLinkElement = goog.dom.getElementByClass(
      'firebaseui-pp-link', container);
    assertEquals(tosUrl, tosLinkElement.href);
    assertEquals(privacyPolicyUrl,ppLinkElement.href);
  }
}


/**
 * @param {?string} tosUrl
 * @param {?string} privacyPolicyUrl
 */
function assertPhoneFullMessage(tosUrl, privacyPolicyUrl) {
  var element = goog.dom.getElementByClass('firebaseui-tos', container);
  assertTrue(element.classList.contains('firebaseui-phone-tos'));
  var tosLinkElement = goog.dom.getElementByClass(
      'firebaseui-tos-link', container);
  var ppLinkElement = goog.dom.getElementByClass(
      'firebaseui-pp-link', container);
  if (!tosUrl && !privacyPolicyUrl) {
    assertNull(tosLinkElement);
    assertNull(ppLinkElement);
  } else {
    assertEquals(tosUrl, tosLinkElement.href);
    assertEquals(privacyPolicyUrl, ppLinkElement.href);
  }
}


/**
 * @param {?string} tosUrl
 * @param {?string} privacyPolicyUrl
 */
function assertPhoneFooter(tosUrl, privacyPolicyUrl) {
  var element = goog.dom.getElementByClass('firebaseui-tos', container);
  assertTrue(element.classList.contains('firebaseui-phone-sms-notice'));
  assertTosPpFooter(tosUrl, privacyPolicyUrl);
}


/**
 * @param {string} message The message that is expected to be displayed in the
 *     info bar.
 * @param {?firebaseui.auth.ui.page.Base=} opt_component Optional component to
 *     check that info bar is displayed within. Default container is used if not
 *     specified.
 */
function assertInfoBarMessage(message, opt_component) {
  var element = goog.dom.getElementByClass(
      'firebaseui-id-info-bar',
      opt_component ? opt_component.getContainer() : container);
  assertContains(message, goog.dom.getTextContent(element));
}


/** Asserts that there is no info bar message currently displayed. */
function assertNoInfoBarMessage() {
  var element = goog.dom.getElementByClass('firebaseui-id-info-bar', container);
  assertNull(element);
}


/**
 * Asserts that the busy indicator is shown after a short delay. The delay
 * exists so that pages that load quickly will not flash a loading bar.
 */
function delayForBusyIndicatorAndAssertIndicatorShown() {
  mockClock.tick(500);
  var element =
      goog.dom.getElementByClass('firebaseui-id-busy-indicator', container);
  assertNotNull(element);
}


function assertBusyIndicatorHidden() {
  var element =
      goog.dom.getElementByClass('firebaseui-id-busy-indicator', container);
  assertNull(element);
}


function assertCallbackPage() {
  assertPage_(container, 'firebaseui-id-page-callback');
}


/**
 * Asserts the page contains the text given.
 * @param {string} text Text that should be present in the page.
 */
function assertPageContainsText(text) {
  var element = goog.dom.getElementByClass('firebaseui-text', container);
  assertContains(text, goog.dom.getTextContent(element));
}


/**
 * Asserts that password linking page is displayed. If an email is provided, it
 * checks that the email is populated in the page body.
 * @param {string=} opt_email Optional email to check.
 * @param {string=} opt_idpDisplayName Optional idp display name to check.
 */
function assertPasswordLinkingPage(opt_email, opt_idpDisplayName) {
  assertPage_(container, 'firebaseui-id-page-password-linking');
  if (opt_email) {
    assertPageContainsText(opt_email);
  }
  if (opt_idpDisplayName) {
    assertPageContainsText(opt_idpDisplayName);
  }
}


/**
 * Asserts federated linking page is displayed. If an email is provided, it
 * checks that the email is populated in the page body.
 * @param {string=} opt_email Optional email to check.
 */
function assertFederatedLinkingPage(opt_email) {
  assertPage_(container, 'firebaseui-id-page-federated-linking');
  if (opt_email) {
    assertPageContainsText(opt_email);
  }
}


function assertSignInPage() {
  assertPage_(container, 'firebaseui-id-page-sign-in');
}


function assertPasswordSignInPage() {
  assertPage_(container, 'firebaseui-id-page-password-sign-in');
}


function assertPasswordSignUpPage() {
  assertPage_(container, 'firebaseui-id-page-password-sign-up');
}


function assertPasswordRecoveryPage() {
  assertPage_(container, 'firebaseui-id-page-password-recovery');
}


function assertPasswordRecoveryEmailSentPage() {
  assertPage_(container, 'firebaseui-id-page-password-recovery-email-sent');
}


function assertPasswordResetPage() {
  assertPage_(container, 'firebaseui-id-page-password-reset');
}


/** Asserts that password reset success page is displayed. */
function assertPasswordResetSuccessPage() {
  assertPage_(container, 'firebaseui-id-page-password-reset-success');
}


/** Asserts that password reset failure page is displayed. */
function assertPasswordResetFailurePage() {
  assertPage_(container, 'firebaseui-id-page-password-reset-failure');
}


/** Asserts that email change revocation success page is displayed. */
function assertEmailChangeRevokeSuccessPage() {
  assertPage_(container, 'firebaseui-id-page-email-change-revoke-success');
}


/** Asserts that email change revocation failure page is displayed. */
function assertEmailChangeRevokeFailurePage() {
  assertPage_(container, 'firebaseui-id-page-email-change-revoke-failure');
}


function assertEmailVerificationSuccessPage() {
  assertPage_(container, 'firebaseui-id-page-email-verification-success');
}


function assertEmailVerificationFailurePage() {
  assertPage_(container, 'firebaseui-id-page-email-verification-failure');
}


function assertSignInButtonPage() {
  assertPage_(container, 'firebaseui-id-page-sign-in-button');
}


function assertUserCardPage() {
  assertPage_(container, 'firebaseui-id-page-user-card');
}


function assertEmailInfoPage(container) {
  assertPage_(container, 'firebaseui-id-page-email-info');
}


function assertEmailChangePage(container) {
  assertPage_(container, 'firebaseui-id-page-email-change');
}


function assertEmailChangeEmailSentPage(container) {
  assertPage_(container, 'firebaseui-id-page-email-change-email-sent');
}


function assertPasswordInfoPage(container) {
  assertPage_(container, 'firebaseui-id-page-password-info');
}


function assertPasswordChangePage(container) {
  assertPage_(container, 'firebaseui-id-page-password-change');
}


function assertPasswordChangeSuccessPage(container) {
  assertPage_(container, 'firebaseui-id-page-password-change-success');
}


function assertLinkedAccountsPage(container) {
  assertPage_(container, 'firebaseui-id-page-linked-accounts');
}


/**
 * Asserts that email change revoke success page is rendered in the container
 * provided.
 * @param {!Element} container The html element container of widget.
 */
function assertEmailChangeRevokeSuccess(container) {
  assertPage_(container, 'firebaseui-id-page-email-change-revoke-success');
}


/**
 * Asserts that email change revoke failure page is rendered in the container
 * provided.
 * @param {!Element} container The html element container of widget.
 */
function assertEmailChangeRevokeFailure(container) {
  assertPage_(container, 'firebaseui-id-page-email-change-revoke-failure');
}


/**
 * Asserts that the email mismatch page is displayed with the corresponding
 * user email and pending email.
 * @param {string} userEmail The idp returned email to verify.
 * @param {string} pendingEmail The pending email to verify.
 */
function assertEmailMismatchPage(userEmail, pendingEmail) {
  // Constructed expected title message.
  var titleMessage = 'Continue with ' + userEmail + '?';
  // Asserts that email mismatch page is displayed.
  assertPage_(container, 'firebaseui-id-page-email-mismatch');
  // Ensures the correct subtitle and text are displayed.
  var element = goog.dom.getElementByClass('firebaseui-subtitle', container);
  assertContains(titleMessage, goog.dom.getTextContent(element));
  assertPageContainsText(pendingEmail);
}


function assertEmailChangeVerifyPage(email) {
  // Asserts that email change verify page is rendered with the correct email
  // populated.
  assertPage_(container, 'firebaseui-id-page-email-change-verify');
  assertEquals(email, goog.dom.forms.getValue(getEmailElement()));
}


function assertProviderSignInPage() {
  assertPage_(container, 'firebaseui-id-page-provider-sign-in');
}


/** Asserts that the phone sign in start page is rendered. */
function assertPhoneSignInStartPage() {
  assertPage_(container, 'firebaseui-id-page-phone-sign-in-start');
}


/** Asserts that the phone sign in code entry page is rendered. */
function assertPhoneSignInFinishPage() {
  assertPage_(container, 'firebaseui-id-page-phone-sign-in-finish');
}


/**
 * Asserts that the dialog is rendered with the expected message.
 * @param {string} message The message shown.
 */
function assertDialog(message) {
  assertEquals(1, goog.dom.getElementsByTagName('dialog').length);
  var dialogElement = goog.dom.getElementsByTagName('dialog')[0];
  assertTrue(
      goog.dom.classlist.contains(dialogElement, 'firebaseui-id-dialog'));
  assertContains(message, goog.dom.getTextContent(dialogElement));
}


/**
 * Asserts that no dialog is rendered.
 */
function assertNoDialog() {
  assertEquals(0, goog.dom.getElementsByTagName('dialog').length);
}


/**
 * Asserts that a specific page is shown.
 * @param {!Element} container The html element container of widget.
 * @param {string} idClass The class name of the page.
 * @private
 */
function assertPage_(container, idClass) {
  assertEquals(1, container.children.length);
  var page = container.children[0];
  assertTrue(goog.dom.classlist.contains(page, idClass));
}


/**
 * @param {boolean} redirect The return status of the success callback.
 * @param {boolean=} opt_manualRedirect Whether the developer manually
 *     redirects to redirectUrl.
 * @return {!firebaseui.auth.callback.signInSuccess} sign in success callback
 *     function.
 */
function signInSuccessCallback(redirect, opt_manualRedirect) {
  return function(user, credential, redirectUrl) {
    // Save sign in callback parameters to confirm callback invoked.
    signInCallbackUser = user;
    signInCallbackRedirectUrl = redirectUrl;
    signInCallbackCredential = credential;
    // Developer manually redirects and redirect URL available.
    if (opt_manualRedirect && redirectUrl) {
      firebaseui.auth.util.goTo(redirectUrl);
    }
    return redirect;
  };
}


/**
 * @param {?firebase.User} user The signed in user.
 * @param {?firebase.auth.AuthCredential=} opt_credential The auth credential.
 * @param {string=} opt_redirectUrl The redirect URL if available.
 */
function assertSignInSuccessCallbackInvoked(
    user, opt_credential, opt_redirectUrl) {
  assertObjectEquals(user, signInCallbackUser);
  assertObjectEquals(opt_credential, signInCallbackCredential);
  assertEquals(opt_redirectUrl, signInCallbackRedirectUrl);
}


/**
 * @param {boolean} redirect The return status of the success callback.
 * @param {boolean=} opt_manualRedirect Whether the developer manually
 *     redirects to redirectUrl.
 * @return {!firebaseui.auth.callback.signInSuccessWithAuthResult} sign in
 *     success with auth result callback function.
 */
function signInSuccessWithAuthResultCallback(redirect, opt_manualRedirect) {
  return function(authResult, redirectUrl) {
    // Save sign in callback parameters to confirm callback invoked.
    signInCallbackUser = authResult.user;
    signInCallbackRedirectUrl = redirectUrl;
    signInCallbackCredential = authResult.credential;
    signInCallbackAdditionalUserInfo = authResult.additionalUserInfo;
    signInCallbackOperationType = authResult.operationType;
    // Developer manually redirects and redirect URL available.
    if (opt_manualRedirect && redirectUrl) {
      firebaseui.auth.util.goTo(redirectUrl);
    }
    return redirect;
  };
}


/**
 * @param {!fireabaseui.auth.AuthResult} authResult The returned auth result.
 * @param {string=} opt_redirectUrl The redirect URL if available.
 */
function assertSignInSuccessWithAuthResultCallbackInvoked(
    authResult, opt_redirectUrl) {
  assertObjectEquals(authResult.user, signInCallbackUser);
  assertObjectEquals(authResult.credential, signInCallbackCredential);
  assertObjectEquals(authResult.additionalUserInfo,
                     signInCallbackAdditionalUserInfo);
  assertEquals(authResult.operationType, signInCallbackOperationType);
  assertEquals(opt_redirectUrl, signInCallbackRedirectUrl);
}


/** Asserts that container is cleared. */
function assertComponentDisposed() {
  assertEquals(0, container.children.length);
}


function uiShownCallback() {
  uiShownCallbackCount++;
}


function assertUiShownCallbackInvoked() {
  assertEquals(1, uiShownCallbackCount);
}


/**
 * Asserts that UI shown callback is not invoked.
 */
function assertUiShownCallbackNotInvoked() {
  assertEquals(0, uiShownCallbackCount);
}


/**
 * Asserts that unrecoverable error page is rendered and the error message is
 * displayed.
 * @param {string} errorMessage The error message to be asserted.
 */
function assertUnrecoverableErrorPage(errorMessage) {
  assertPage_(container, 'firebaseui-id-page-unrecoverable-error');
  assertPageContainsText(errorMessage);
}


/**
 * Asserts that accountChooserInvoked callback is called and runs
 * continue function passed.
 */
function assertAndRunAccountChooserInvokedCallback() {
  assertEquals(1, accountChooserInvokedCallback.getCallCount());
  var onContinue = accountChooserInvokedCallback.getLastCall().getArgument(0);
  // On continue should be passed.
  assertNotNull(onContinue);
  onContinue();
}


/**
 * Asserts that accountChooserResult callback is called with provided type
 * and runs continue function.
 *
 * @param {firebaseui.auth.widget.Config.AccountChooserResult} type The result
 *     type to test for.
 */
function assertAndRunAccountChooserResultCallback(type) {
  assertEquals(1, accountChooserResultCallback.getCallCount());
  assertEquals(type, accountChooserResultCallback.getLastCall().getArgument(0));
  var onContinue = accountChooserResultCallback.getLastCall().getArgument(1);
  // On continue should be passed.
  assertNotNull(onContinue);
  onContinue();
}


/**
 * Asserts the resend countdown indicates the given time remaining.
 * @param {number} timeRemaining The time remaining.
 */
function assertResendCountdown(timeRemaining) {
  var el =
      goog.dom.getElementByClass('firebaseui-id-resend-countdown', container);
  var expected = firebaseui.auth.soy2.strings
                 .resendCountdown({timeRemaining: timeRemaining})
                 .toString();
  var actual = goog.dom.getTextContent(el);
  assertEquals(expected, actual);
}


/**
 * Asserts signInFailure callback called with expected error.
 * @param {?Object|undefined} expectedError The expected error passed to
 *     signInFailure callback.
 */
function assertSignInFailure(expectedError) {
  // Confirm signInFailure callback triggered with expected argument.
  assertEquals(1, signInFailureCallback.getCallCount());
  assertObjectEquals(
      expectedError, signInFailureCallback.getLastCall().getArgument(0));
  // Sign in success should not be called.
  assertUndefined(signInCallbackUser);
}
