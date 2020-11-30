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

/** @fileoverview Tests for dispatcher.js */

goog.module('firebaseui.auth.widget.dispatcherTest');
goog.setTestOnly();

const AuthUI = goog.require('firebaseui.auth.AuthUI');
const Config = goog.require('firebaseui.auth.widget.Config');
const FakeAppClient = goog.require('firebaseui.auth.testing.FakeAppClient');
const FakeUtil = goog.require('firebaseui.auth.testing.FakeUtil');
const PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
const RedirectStatus = goog.require('firebaseui.auth.RedirectStatus');
const asserts = goog.require('goog.asserts');
const common = goog.require('firebaseui.auth.widget.handler.common');
const dispatcher = goog.require('firebaseui.auth.widget.dispatcher');
const dom = goog.require('goog.dom');
const idp = goog.require('firebaseui.auth.idp');
const recordFunction = goog.require('goog.testing.recordFunction');
const storage = goog.require('firebaseui.auth.storage');
const testSuite = goog.require('goog.testing.testSuite');
const widgetHandler = goog.require('firebaseui.auth.widget.handler');

let app;
const appId = 'glowing-heat-3485';
const stub = new PropertyReplacer();
let testUtil;
let uiShownCallbackCount = 0;
let externalAuthApp;
let testAuth;

/** Callback for tracking uiShown calls. */
function uiShownCallback() {
    uiShownCallbackCount++;
}

/**
 * Asserts correct handler with correct parameter called.
 * @param {!firebaseui.auth.widget.HandlerName} handlerName The handler name
 *     called.
 * @param {...*} var_args Additional arguments to assert, relevant to handler.
 */
function assertHandlerInvoked(handlerName, var_args) {
  const handler =
      firebaseui.auth.widget.handlers_[handlerName];
  // Assert expected handler called.
  assertEquals(
      1,
      handler.getCallCount());
  // Assert expected parameters used for handler.
  for (let i = 0; i < arguments.length - 1; i++) {
    assertEquals(
      arguments[i + 1],
      handler.getLastCall().getArgument(i));
  }
}

/**
 * @param {string} mode The dispatcher mode to simulate.
 * @param {?Object=} opt_params The parameters in the URL to simulate.
 */
function setModeAndUrlParams(mode, opt_params) {
  const params = opt_params || {};
  stub.replace(
      firebaseui.auth.util,
      'getCurrentUrl',
      () => {
        let currentUrl = 'https://www.example.com/';
        if (mode) {
          currentUrl += '?mode=' + encodeURIComponent(mode);
          for (let name in params) {
            currentUrl += `&${name}=` +
                encodeURIComponent(asserts.assertString(params[name]));
          }
        }
        return currentUrl;
      });
}

testSuite({
  setUp() {
    goog.global.firebase = {};
    const firebase = goog.global.firebase;
    // Used to initialize internal Auth instance.
    firebase.initializeApp =
        (options, name) => new FakeAppClient(options, name);
    // Build mock auth providers.
    firebase['auth'] = {};
    for (let key in idp.AuthProviders) {
      firebase['auth'][idp.AuthProviders[key]] = function() {
        this.scopes = [];
        this.customParameters = {};
      };
      firebase['auth'][idp.AuthProviders[key]].PROVIDER_ID = key;
      for (let method in idp.SignInMethods[key]) {
        firebase['auth'][idp.AuthProviders[key]][method] =
            idp.SignInMethods[key][method];
      }
      if (key != 'twitter.com' && key != 'password') {
        firebase['auth'][idp.AuthProviders[key]]
            .prototype.addScope = function(scope) {
          this.scopes.push(scope);
        };
      }
      if (key != 'password') {
        // Record setCustomParameters for all OAuth providers.
        firebase['auth'][idp.AuthProviders[key]]
            .prototype.setCustomParameters = function(customParameters) {
          this.customParameters = customParameters;
        };
      }
    }
    // Initialize external Firebase app.
    externalAuthApp = new FakeAppClient();
    // Pass installed external Firebase Auth instance.
    app = new AuthUI(externalAuthApp.auth().install(), appId);
    // Install internal instance.
    testAuth = app.getAuth().install();
    uiShownCallbackCount = 0;
    app.setConfig({
      queryParameterForWidgetMode: 'mode',
      widgetUrl: 'http://localhost/firebase',
      'credentialHelper':
          Config.CredentialHelper.NONE,
    });
    testUtil = new FakeUtil().install();
    // Record all widget handler calls.
    for (let handlerName in firebaseui.auth.widget.HandlerName) {
      stub.set(
          firebaseui.auth.widget.handlers_,
          firebaseui.auth.widget.HandlerName[handlerName],
          recordFunction());
    }
    // Remove redirect URL from storage.
    storage.removeRedirectUrl(app.getAppId());
    // Reset query parameter for sign-in success URL to default.
    app.updateConfig(
        'queryParameterForSignInSuccessUrl', 'signInSuccessUrl');
    // Assume widget already rendered and Auth UI global reference set.
    stub.replace(
        AuthUI,
        'getAuthUi',
        () => app);
  },

  tearDown() {
    stub.reset();
    // Uninstall internal and external Auth instance.
    externalAuthApp.auth().uninstall();
    if (testAuth) {
      testAuth.uninstall();
    }
    if (testUtil) {
      testUtil.uninstall();
    }
    // Reset AuthUI internals.
    AuthUI.resetAllInternals();
    testUtil.uninstall();
  },

  testGetMode() {
    const url = 'http://localhost/callback?mode=callback';
    assertEquals(
        Config.WidgetMode.CALLBACK,
        dispatcher.getMode(app, url));
  },

  testGetRedirectUrl() {
    const redirectUrl = 'http://www.example.com';
    // No redirect URL available.
    let url = 'http://localhost/callback?mode=signIn';
    assertEquals(null,
        dispatcher.getRedirectUrl(app, url));
    // Set current page URL to include a redirect URL.
    url = 'http://localhost/callback?mode=signIn&signInSuccessUrl=' +
        encodeURIComponent(redirectUrl);
    // Check that the redirect URL is successfully retrieved.
    assertEquals(
        redirectUrl,
        dispatcher.getRedirectUrl(app, url));

    // Update the query parameter for redirect URL.
    url = 'http://localhost/callback?mode=signIn&signInSuccessUrl=' +
        encodeURIComponent('javascript:doEvilStuff()');
    // Confirm redirect URL is successfully sanitized.
    assertEquals(
        'about:invalid#zClosurez',
        dispatcher.getRedirectUrl(app, url));

    // Change the query parameter for redirect URL.
    app.updateConfig(
        'queryParameterForSignInSuccessUrl', 'continue');
    // Confirm that previous redirect URL no longer valid.
    assertEquals(null,
        dispatcher.getRedirectUrl(app, url));
    // Update the query parameter for redirect URL.
    url = 'http://localhost/callback?mode=signIn&continue=' +
         encodeURIComponent(redirectUrl);
    // Confirm redirect URL using new query parameter is successfully retrieved.
    assertEquals(
        redirectUrl,
        dispatcher.getRedirectUrl(app, url));

    // Update the query parameter for redirect URL.
    url = 'http://localhost/callback?mode=signIn&continue=' +
        encodeURIComponent('javascript:doEvilStuff()');
    // Confirm redirect URL is successfully sanitized.
    assertEquals(
        'about:invalid#zClosurez',
        dispatcher.getRedirectUrl(app, url));
  },

  testGetMode_noMode() {
    // No fragment, no query, should return callback mode.
    let url = 'http://localhost/callback';
    assertEquals(
        Config.WidgetMode.CALLBACK,
        dispatcher.getMode(app, url));
    // Unsupported query but no mode, should return callback.
    url = 'http://localhost/callback?query=value';
    assertEquals(
        Config.WidgetMode.CALLBACK,
        dispatcher.getMode(app, url));
    // No query but fragment provided should return callback.
    url = 'http://localhost/callback#fragment';
    assertEquals(
        Config.WidgetMode.CALLBACK,
        dispatcher.getMode(app, url));
  },

  testGetMode_unrecognizedMode() {
    const url = 'http://localhost/callback?mode=What';
    assertEquals(
        Config.WidgetMode.CALLBACK,
        dispatcher.getMode(app, url));
  },

  testGetMode_nonDefaultModeParameter() {
    app.setConfig({
      queryParameterForWidgetMode: 'action',
    });
    const url = 'http://localhost/callback?action=resetPassword';
    assertEquals(
        Config.WidgetMode.RESET_PASSWORD,
        dispatcher.getMode(app, url));
  },

  testDispatchOperation_noStorageSupport_elementNotFound() {
    // Test dispatchOperation with missing element.
    // Simulate web storage unavailability.
    stub.set(storage, 'isAvailable', () => false);
    // Test correct error message thrown when widget element not found.
    try {
      dispatcher.dispatchOperation(app, '#notFound');
      fails('Should have thrown an error!');
    } catch (e) {
      // Confirm correct error message thrown.
      assertEquals(
          e.message,
          'Could not find the FirebaseUI widget element on the page.');
    }
  },

  testDispatchOperation_withStorageSupport_elementNotFound() {
    // Test dispatchOperation with missing element.
    // Test correct error message thrown when widget element not found.
    try {
      dispatcher.dispatchOperation(app, '#notFound');
      fails('Should have thrown an error!');
    } catch (e) {
      // Confirm correct error message thrown.
      assertEquals(
          e.message,
          'Could not find the FirebaseUI widget element on the page.');
    }
  },

  testDispatchOperation_noStorageSupport() {
    const element = dom.createElement('div');
    const expectedErrorMessage =
        'The browser you are using does not support Web ' +
        'Storage. Please try again in a different browser.';
    // Detect call to handle unrecoverable error, and confirm container and
    // error message passed.
    let called = false;
    stub.set(
        common,
        'handleUnrecoverableError',
        (app, container, errorMessage) => {
          called = true;
          assertEquals(element, container);
          assertEquals(expectedErrorMessage, errorMessage);
        });
    // Simulate web storage unavailability.
    stub.set(storage, 'isAvailable', () => false);
    dispatcher.dispatchOperation(app, element);
    assertTrue(called);
  },

  testDispatchOperation_select() {
    app.setConfig({
      'callbacks': {
        'uiShown': uiShownCallback,
      },
    });
    assertEquals(uiShownCallbackCount, 0);
    const element = dom.createElement('div');
    setModeAndUrlParams(Config.WidgetMode.SELECT);
    dispatcher.dispatchOperation(app, element);
    assertEquals(uiShownCallbackCount, 1);
    // Provider sign-in should be invoked.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        element);
  },

  testDispatchOperation_selectWithRedirectUrl() {
    const element = dom.createElement('div');
    // Redirect URL.
    const redirectUrl = 'http://www.example.com';
    // Simulate redirect URL above being available in URL.
    setModeAndUrlParams(Config.WidgetMode.SELECT, {
      'signInSuccessUrl': redirectUrl,
    });
    // No redirect URL.
    assertFalse(storage.hasRedirectUrl(app.getAppId()));
    dispatcher.dispatchOperation(app, element);
    // Redirect URL should be set now in storage.
    assertTrue(storage.hasRedirectUrl(app.getAppId()));
    // Confirm it is the correct value.
    assertEquals(
        redirectUrl,
        storage.getRedirectUrl(app.getAppId()));
    // Provider sign-in should be invoked.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        element);
  },

  testDispatchOperation_selectWithUnsafeRedirectUrl() {
    const element = dom.createElement('div');
    // Unsafe redirect URL.
    const redirectUrl = 'javascript:doEvilStuff()';
    // Simulate unsafe redirect URL above being available in URL.
    setModeAndUrlParams(Config.WidgetMode.SELECT, {
      'signInSuccessUrl': redirectUrl,
    });
    // No redirect URL.
    assertFalse(storage.hasRedirectUrl(app.getAppId()));
    dispatcher.dispatchOperation(app, element);
    // Redirect URL should be set now in storage.
    assertTrue(storage.hasRedirectUrl(app.getAppId()));
    // Confirm the sanitized value is returned.
    assertEquals(
        'about:invalid#zClosurez',
        storage.getRedirectUrl(app.getAppId()));
    // Provider sign-in should be invoked.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        element);
  },

  testDispatchOperation_callbackWithRedirectUrl() {
    const element = dom.createElement('div');
    // Redirect URL.
    const redirectUrl = 'http://www.example.com';
    // Set current mode to callback mode.
    // Simulate redirect URL above being available in URL.
    setModeAndUrlParams(Config.WidgetMode.CALLBACK, {
      'signInSuccessUrl': redirectUrl,
    });
    // Simulate app returning from redirect sign-in operation.
    const redirectStatus = new RedirectStatus();
    storage.setRedirectStatus(redirectStatus, app.getAppId());
    // No redirect URL.
    assertFalse(storage.hasRedirectUrl(app.getAppId()));
    dispatcher.dispatchOperation(app, element);
    // Redirect URL should be set now in storage.
    assertTrue(storage.hasRedirectUrl(app.getAppId()));
    // Confirm it is the correct value.
    assertEquals(
        redirectUrl,
        storage.getRedirectUrl(app.getAppId()));
    // Callback handler should be invoked.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.CALLBACK, app, element);
  },

  testDispatchOperation_callbackWithRedirectUrl_noPendingRedirect() {
    const element = dom.createElement('div');
    // Redirect URL.
    const redirectUrl = 'http://www.example.com';
    // Set current mode to callback mode.
    // Simulate redirect URL above being available in URL.
    setModeAndUrlParams(Config.WidgetMode.CALLBACK, {
      'signInSuccessUrl': redirectUrl,
    });
    // Simulate app not returning from redirect sign-in operation.
    storage.removeRedirectStatus(app.getAppId());
    // No redirect URL.
    assertFalse(storage.hasRedirectUrl(app.getAppId()));
    dispatcher.dispatchOperation(app, element);
    // Redirect URL should be set now in storage.
    assertTrue(storage.hasRedirectUrl(app.getAppId()));
    // Confirm it is the correct value.
    assertEquals(
        redirectUrl,
        storage.getRedirectUrl(app.getAppId()));
    // Provider sign in handler should be invoked.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN, app, element);
  },

  testDispatchOperation_callbackWithUnsafeRedirectUrl() {
    const element = dom.createElement('div');
    // Unsafe redirect URL.
    const redirectUrl = 'javascript:doEvilStuff()';
    // Simulate unsafe redirect URL above being available in URL.
    setModeAndUrlParams(Config.WidgetMode.SELECT, {
      'signInSuccessUrl': redirectUrl,
    });
    // Simulate app returning from redirect sign-in operation.
    const redirectStatus = new RedirectStatus();
    storage.setRedirectStatus(redirectStatus, app.getAppId());
    // No redirect URL.
    assertFalse(storage.hasRedirectUrl(app.getAppId()));
    dispatcher.dispatchOperation(app, element);
    // Redirect URL should be set now in storage.
    assertTrue(storage.hasRedirectUrl(app.getAppId()));
    // Confirm the sanitized value is returned.
    assertEquals(
        'about:invalid#zClosurez',
        storage.getRedirectUrl(app.getAppId()));
    // Provider sign-in handler should be invoked.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        element);
  },

  testDispatchOperation_noMode_providerFirst() {
    const element = dom.createElement('div');
    setModeAndUrlParams(null);
    // Simulate app returning from redirect sign-in operation.
    const redirectStatus = new RedirectStatus();
    storage.setRedirectStatus(redirectStatus, app.getAppId());
    dispatcher.dispatchOperation(app, element);
    // Callback handler should be invoked since no mode will result with
    // CALLBACK mode.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.CALLBACK, app, element);
  },

  testDispatchOperation_callback() {
    const element = dom.createElement('div');
    setModeAndUrlParams(Config.WidgetMode.CALLBACK);
    // Simulate app returning from redirect sign-in operation.
    const redirectStatus = new RedirectStatus();
    storage.setRedirectStatus(redirectStatus, app.getAppId());
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.CALLBACK,
        app,
        element);
  },

  testDispatchOperation_callback_noPendingRedirect() {
    const element = dom.createElement('div');
    setModeAndUrlParams(Config.WidgetMode.CALLBACK);
    // Simulate app not returning from redirect sign-in operation.
    storage.removeRedirectStatus(app.getAppId());
    dispatcher.dispatchOperation(app, element);
    // Provider sign in handler should be rendered.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        element);
  },

  testDispatchOperation_callback_signInHint() {
    // Test CALLBACK operation with signInHint.
    const element = dom.createElement('div');
    setModeAndUrlParams(Config.WidgetMode.CALLBACK);
    // Simulate app not returning from redirect sign-in operation.
    storage.removeRedirectStatus(app.getAppId());
    const signInHint = {
      emailHint: 'user@example.com',
    };

    // dispatchOperation is called underneath. Call startWithSignInHint in order
    // to pass signInHint.
    app.startWithSignInHint(element, {}, signInHint);
    // Provider sign in handler should be rendered with email hint.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        element,
        undefined,
        signInHint['emailHint']);
    testAuth.assertSignOut([]);
    app.delete();
    return testAuth.process();
  },

  testDispatchOperation_callback_signInHint_emailProvider() {
    // Test CALLBACK operation with signInHint when only email Auth provider is
    // enabled.
    const element = dom.createElement('div');
    setModeAndUrlParams(Config.WidgetMode.CALLBACK);
    // Simulate app not returning from redirect sign-in operation.
    storage.removeRedirectStatus(app.getAppId());
    const signInHint = {
      emailHint: 'user@example.com',
    };

    // dispatchOperation is called underneath. Call startWithSignInHint in order
    // to pass signInHint.
    app.startWithSignInHint(
        element,
        {
          signInOptions: ['password'],
          credentialHelper: Config.CredentialHelper.NONE,
        },
        signInHint);
    // Prefilled email sign in handler should be rendered with email hint.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PREFILLED_EMAIL_SIGN_IN,
        app,
        element,
        signInHint['emailHint']);
    testAuth.assertSignOut([]);
    app.delete();
    return testAuth.process();
  },

  testDispatchOperation_callback_canSkipNascarScreen() {
    // Checks to make sure that when immediateFederatedRedirect is true
    // and all the correct options are set, the 'nascar' sign-in screen will
    // be skipped.
    const element = dom.createElement('div');
    setModeAndUrlParams(Config.WidgetMode.CALLBACK);
    // Simulate app not returning from redirect sign-in operation.
    storage.removeRedirectStatus(app.getAppId());
    // In order for an immediate redirect to succeed all of the following
    // options must be set:
    app.setConfig({
      'immediateFederatedRedirect': true,
      'signInOptions': [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
      'signInFlow': Config.SignInFlow.REDIRECT,
    });
    dispatcher.dispatchOperation(app, element);
    // The federated redirect handler should trigger.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.FEDERATED_REDIRECT,
        app,
        element);
  },

  testDispatchOperation_callback_canShowNascarScreen() {
    // Checks to make sure that even if immediateFederatedRedirect is true
    // unless all the correct options are set, the 'nascar' sign-in screen will
    // not be skipped.
    const element = dom.createElement('div');
    setModeAndUrlParams(Config.WidgetMode.CALLBACK);
    // Simulate app not returning from redirect sign-in operation.
    storage.removeRedirectStatus(app.getAppId());
    // The immediate redirect should not be triggered (since there is more
    // than one federated provider and it is using a popup).
    app.setConfig({
      'immediateFederatedRedirect': true,
      'signInOptions': [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID],
      'signInFlow': Config.SignInFlow.POPUP,
    });
    dispatcher.dispatchOperation(app, element);
    // The normal provider sign in handler 'nascar' screen should be rendered.
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
        app,
        element);
  },

  testDispatchOperation_revokeChangeEmail() {
    const element = dom.createElement('div');
    setModeAndUrlParams(
        Config.WidgetMode.RECOVER_EMAIL,
        {'oobCode': 'ACTION_CODE'});
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.EMAIL_CHANGE_REVOCATION,
        app,
        element,
        'ACTION_CODE');
  },

  testDispatchOperation_verifyEmail() {
    const element = dom.createElement('div');
    setModeAndUrlParams(
        Config.WidgetMode.VERIFY_EMAIL,
        {'oobCode': 'ACTION_CODE'});
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.EMAIL_VERIFICATION,
        app,
        element,
        'ACTION_CODE');
  },

  testDispatchOperation_emailLinkSignIn() {
    const element = dom.createElement('div');
    setModeAndUrlParams(
        Config.WidgetMode.SIGN_IN,
        {'oobCode': 'ACTION_CODE', 'lang': 'en'});
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.EMAIL_LINK_SIGN_IN_CALLBACK,
        app,
        element,
        'https://www.example.com/?mode=signIn&oobCode=ACTION_CODE&lang=en');
    // Confirm history state replaced.
    testUtil.assertReplaceHistoryState(
        {
          'state': 'signIn',
          'mode': 'emailLink',
          'operation': 'clear',
        },
        // Same document title should be kept.
        document.title,
        // URL should be cleared from email sign-in related query params.
        'https://www.example.com/?lang=en');
  },

  testDispatchOperation_emailLinkSignIn_tenantId() {
    const element = dom.createElement('div');
    setModeAndUrlParams(
        Config.WidgetMode.SIGN_IN,
        {'oobCode': 'ACTION_CODE', 'lang': 'en', 'tenantId': 'TENANT_ID'});
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.EMAIL_LINK_SIGN_IN_CALLBACK,
        app,
        element,
        'https://www.example.com/?mode=signIn&oobCode=ACTION_CODE&lang=en&' +
        'tenantId=TENANT_ID');
    // Confirm history state replaced.
    testUtil.assertReplaceHistoryState(
        {
          'state': 'signIn',
          'mode': 'emailLink',
          'operation': 'clear',
        },
        // Same document title should be kept.
        document.title,
        // URL should be cleared from email sign-in related query params.
        'https://www.example.com/?lang=en');
    assertNull(app.getTenantId());  assertNull(app.getTenantId());
  },

  testDispatchOperation_verifyEmail_continueUrl() {
    const element = dom.createElement('div');
    const continueUrl = 'http://www.example.com/path/page?a=1#b=2';
    stub.replace(
        firebaseui.auth.util,
        'getCurrentUrl',
        () => 'http://example.firebaseapp.com/__/auth/action?mode=' +
              'verifyEmail&apiKey=API_KEY&oobCode=ACTION_CODE&continueUrl=' +
              encodeURIComponent(continueUrl));
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.EMAIL_VERIFICATION,
        app,
        element,
        'ACTION_CODE');
    // Get callback passed to verify email handler and confirm it redirects to
    // continue URL.
    const handler =
        firebaseui.auth.widget.handlers_[
          firebaseui.auth.widget.HandlerName.EMAIL_VERIFICATION];
    const continueCallback = handler.getLastCall().getArgument(3);
    continueCallback();
    testUtil.assertGoTo(continueUrl);
  },

  testDispatchOperation_verifyAndChangeEmail() {
    const element = dom.createElement('div');
    setModeAndUrlParams(
        Config.WidgetMode.VERIFY_AND_CHANGE_EMAIL,
        {'oobCode': 'ACTION_CODE'});
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.VERIFY_AND_CHANGE_EMAIL,
        app,
        element,
        'ACTION_CODE');
  },

  testDispatchOperation_verifyAndChangeEmail_continueUrl() {
    const element = dom.createElement('div');
    const continueUrl = 'http://www.example.com/path/page?a=1#b=2';
    stub.replace(
        firebaseui.auth.util,
        'getCurrentUrl',
        () => 'http://example.firebaseapp.com/__/auth/action?mode=' +
              'verifyAndChangeEmail&apiKey=API_KEY&oobCode=ACTION_CODE&' +
              'continueUrl=' + encodeURIComponent(continueUrl));
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.VERIFY_AND_CHANGE_EMAIL,
        app,
        element,
        'ACTION_CODE');
    // Get callback passed to verify and change email handler and confirm it
    // redirects to continue URL.
    const handler =
        firebaseui.auth.widget.handlers_[
          firebaseui.auth.widget.HandlerName.VERIFY_AND_CHANGE_EMAIL];
    const continueCallback = handler.getLastCall().getArgument(3);
    continueCallback();
    testUtil.assertGoTo(continueUrl);
  },

  testDispatchOperation_revertSecondFactorAddition() {
    const element = dom.createElement('div');
    setModeAndUrlParams(
        Config.WidgetMode.REVERT_SECOND_FACTOR_ADDITION,
        {'oobCode': 'ACTION_CODE'});
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.REVERT_SECOND_FACTOR_ADDITION,
        app,
        element,
        'ACTION_CODE');
  },

  testDispatchOperation_resetPassword() {
    const element = dom.createElement('div');
    setModeAndUrlParams(
        Config.WidgetMode.RESET_PASSWORD,
        {'oobCode': 'ACTION_CODE'});
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PASSWORD_RESET,
        app,
        element,
        'ACTION_CODE');
  },

  testDispatchOperation_resetPassword_continueUrl() {
    const element = dom.createElement('div');
    const continueUrl = 'http://www.example.com/path/page?a=1#b=2';
    stub.replace(
        firebaseui.auth.util,
        'getCurrentUrl',
        () => 'http://example.firebaseapp.com/__/auth/action?mode=' +
              'resetPassword&apiKey=API_KEY&oobCode=ACTION_CODE&continueUrl=' +
              encodeURIComponent(continueUrl));
    dispatcher.dispatchOperation(app, element);
    assertHandlerInvoked(
        firebaseui.auth.widget.HandlerName.PASSWORD_RESET,
        app,
        element,
        'ACTION_CODE');
    // Get callback passed to password reset handler and confirm it redirects to
    // continue URL.
    /** @suppress {missingRequire} */
    const handler =
        firebaseui.auth.widget.handlers_[
          firebaseui.auth.widget.HandlerName.PASSWORD_RESET];
    const continueCallback = handler.getLastCall().getArgument(3);
    continueCallback();
    testUtil.assertGoTo(continueUrl);
  },
});
