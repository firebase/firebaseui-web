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
 * @fileoverview Tests for dispatcher.js
 */

goog.provide('firebaseui.auth.widget.dispatcherTest');

goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.CredentialHelper');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.testing.FakeAcClient');
goog.require('firebaseui.auth.testing.FakeAppClient');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.dispatcher');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

goog.setTestOnly('firebaseui.auth.widget.dispatcherTest');


var app;
var appId = 'glowing-heat-3485';
var accountchooser = {};
var stub = new goog.testing.PropertyReplacer();
var testAc;
var testUtil;
var uiShownCallbackCount = 0;
var expectedSessionId = 'SESSION_ID_STRING';
var getApp;
var externalAuthApp;
var testAuth;
var firebase = {};


function uiShownCallback() {
    uiShownCallbackCount++;
}


function setUp() {
  // Used to initialize internal Auth instance.
  firebase = {};
  firebase.initializeApp = function(options, name) {
    return new firebaseui.auth.testing.FakeAppClient(options, name);
  };
  // Initialize external Firebase app.
  externalAuthApp = new firebaseui.auth.testing.FakeAppClient();
  // Pass installed external Firebase Auth instance.
  app = new firebaseui.auth.AuthUI(externalAuthApp.auth().install(), appId);
  // Install internal instance.
  testAuth = app.getAuth().install();
  uiShownCallbackCount = 0;
  app.setConfig({
    queryParameterForWidgetMode: 'mode',
    widgetUrl: 'http://localhost/firebase',
    'credentialHelper': firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
  });
  // Record all selectFromAccountChooser calls.
  stub.set(
      firebaseui.auth.widget.handler.common,
      'selectFromAccountChooser',
      goog.testing.recordFunction(
          firebaseui.auth.widget.handler.common.selectFromAccountChooser));
  testAc = new firebaseui.auth.testing.FakeAcClient().install();
  // Record all widget handler calls.
  for (var handlerName in firebaseui.auth.widget.HandlerName) {
    stub.set(
        firebaseui.auth.widget.handlers_,
        firebaseui.auth.widget.HandlerName[handlerName],
        goog.testing.recordFunction());
  }
  // Remove redirect URL from storage.
  firebaseui.auth.storage.removeRedirectUrl(app.getAppId());
  // Reset query parameter for sign-in success URL to default.
  app.updateConfig(
      'queryParameterForSignInSuccessUrl', 'signInSuccessUrl');
  // Reset accountchooser.com force UI shown flag.
  firebaseui.auth.widget.handler.common.acForceUiShown_ = false;
  // Assume widget already rendered and Auth UI global reference set.
  stub.replace(
      firebaseui.auth.AuthUI,
      'getAuthUi',
      function() {
        return app;
      });
  // Simulate accountchooser.com client loaded.
  stub.set(
      firebaseui.auth.widget.handler.common,
      'loadAccountchooserJs',
      function(app, callback, opt_forceUiShownCallback) {
        firebaseui.auth.widget.handler.common.acForceUiShown_ =
            !!opt_forceUiShownCallback;
        callback();
      });
  // Current rendered FirebaseUI getter.
  getApp = function() {
    return app;
  };
}


function tearDown() {
  stub.reset();
  if (testAc) {
    testAc.uninstall();
  }
  // Uninstall internal and external Auth instance.
  externalAuthApp.auth().uninstall();
  if (testAuth) {
    testAuth.uninstall();
  }
  if (testUtil) {
    testUtil.uninstall();
  }
}


/**
 * Test helper used to check that selectFromAccountChooser was called with the
 * expected parameters.
 *
 * @param {!firebaseui.auth.AuthUI} app The FirebaseUI app instance.
 * @param {!Element} container The container DOM element for the handler.
 * @param {boolean=} opt_disableSelectOnEmpty Whether to disable selecting an
 *     account when there are no pending results.
 * @param {string=} opt_callbackUrl The URL to return to when the flow finishes.
 *     The default is current URL.
 */
function assertSelectFromAccountChooserInvoked(
    app, container, opt_disableSelectOnEmpty, opt_callbackUrl) {
  var selectFromAccountChooser =
      firebaseui.auth.widget.handler.common.selectFromAccountChooser;
  assertEquals(
      1,
      selectFromAccountChooser.getCallCount());
  assertEquals(
      app,
      selectFromAccountChooser.getLastCall().getArgument(0)());
  assertEquals(
      container,
      selectFromAccountChooser.getLastCall().getArgument(1));
  assertEquals(
      opt_disableSelectOnEmpty,
      selectFromAccountChooser.getLastCall().getArgument(2));
  assertEquals(
      opt_callbackUrl,
      selectFromAccountChooser.getLastCall().getArgument(3));
}


/**
 * Asserts correct handler with correct parameter called.
 * @param {!firebaseui.auth.widget.HandlerName} handlerName The handler name
 *     called.
 * @param {...*} var_args Additional arguments to assert, relevant to handler.
 */
function assertHandlerInvoked(handlerName, var_args) {
  var handler =
      firebaseui.auth.widget.handlers_[handlerName];
  // Assert expected handler called.
  assertEquals(
      1,
      handler.getCallCount());
  // Assert expected parameters used for handler.
  for (var i = 0; i < arguments.length - 1; i++) {
    assertEquals(
      arguments[i + 1],
      handler.getLastCall().getArgument(i));
  }
}


function testGetMode() {
  var url = 'http://localhost/callback?mode=select';
  assertEquals(
      firebaseui.auth.widget.Config.WidgetMode.SELECT,
      firebaseui.auth.widget.dispatcher.getMode_(app, url));
}


function testGetRedirectUrl() {
  var redirectUrl = 'http://www.example.com';
  // No redirect URL available.
  var url = 'http://localhost/callback?mode=select';
  assertEquals(null,
      firebaseui.auth.widget.dispatcher.getRedirectUrl_(app, url));
  // Set current page URL to include a redirect URL.
  url = 'http://localhost/callback?mode=select&signInSuccessUrl=' +
      encodeURIComponent(redirectUrl);
  // Check that the redirect URL is successfully retrieved.
  assertEquals(
      redirectUrl,
      firebaseui.auth.widget.dispatcher.getRedirectUrl_(app, url));

  // Change the query parameter for redirect URL.
  app.updateConfig(
      'queryParameterForSignInSuccessUrl', 'continue');
  // Confirm that previous redirect URL no longer valid.
  assertEquals(null,
      firebaseui.auth.widget.dispatcher.getRedirectUrl_(app, url));
  // Update the query parameter for redirect URL.
  url = 'http://localhost/callback?mode=select&continue=' +
       encodeURIComponent(redirectUrl);
  // Confirm redirect URL using new query parameter is successfully retrieved.
  assertEquals(
      redirectUrl,
      firebaseui.auth.widget.dispatcher.getRedirectUrl_(app, url));
}


function testGetMode_noMode() {
  // No fragment, no query, should return callback mode.
  var url = 'http://localhost/callback';
  assertEquals(
      firebaseui.auth.widget.Config.WidgetMode.CALLBACK,
      firebaseui.auth.widget.dispatcher.getMode_(app, url));
  // Unsupported query but no mode, should return callback.
  url = 'http://localhost/callback?query=value';
  assertEquals(
      firebaseui.auth.widget.Config.WidgetMode.CALLBACK,
      firebaseui.auth.widget.dispatcher.getMode_(app, url));
  // No query but fragment provided should return callback.
  url = 'http://localhost/callback#fragment';
  assertEquals(
      firebaseui.auth.widget.Config.WidgetMode.CALLBACK,
      firebaseui.auth.widget.dispatcher.getMode_(app, url));
}


function testGetMode_unrecognizedMode() {
  var url = 'http://localhost/callback?mode=What';
  assertEquals(
      firebaseui.auth.widget.Config.WidgetMode.CALLBACK,
      firebaseui.auth.widget.dispatcher.getMode_(app, url));
}


function testGetMode_nonDefaultModeParameter() {
  app.setConfig({
    queryParameterForWidgetMode: 'action'
  });
  var url = 'http://localhost/callback?action=resetPassword';
  assertEquals(
      firebaseui.auth.widget.Config.WidgetMode.RESET_PASSWORD,
      firebaseui.auth.widget.dispatcher.getMode_(app, url));
}


function testGetActionCode() {
  var url = 'http://location/callback?mode=forgot&oobCode=12345';
  assertEquals('12345', firebaseui.auth.widget.dispatcher.getActionCode_(url));
}


function setModeAndUrlParams(mode, opt_params) {
  stub.set(firebaseui.auth.widget.dispatcher, 'getMode_', function() {
    return mode;
  });
  var params = opt_params || {};
  stub.set(firebaseui.auth.widget.dispatcher, 'getRequiredUrlParam_',
      function(name) {
    return goog.asserts.assertString(params[name]);
  });
  stub.set(firebaseui.auth.widget.dispatcher, 'getOptContext_', function() {
    return params['context'];
  });
}


function testDispatchOperation_noStorageSupport_elementNotFound() {
  // Test dispatchOperation with missing element.
  // Simulate web storage unavailability.
  stub.set(firebaseui.auth.storage, 'isAvailable', function() {return false;});
  // Test correct error message thrown when widget element not found.
  try {
    firebaseui.auth.widget.dispatcher.dispatchOperation(app, '#notFound');
    fails('Should have thrown an error!');
  } catch (e) {
    // Confirm correct error message thrown.
    assertEquals(
        e.message,
        'Could not find the FirebaseUI widget element on the page.');
  }
}


function testDispatchOperation_withStorageSupport_elementNotFound() {
  // Test dispatchOperation with missing element.
  // Test correct error message thrown when widget element not found.
  try {
    firebaseui.auth.widget.dispatcher.dispatchOperation(app, '#notFound');
    fails('Should have thrown an error!');
  } catch (e) {
    // Confirm correct error message thrown.
    assertEquals(
        e.message,
        'Could not find the FirebaseUI widget element on the page.');
  }
}


function testDispatchOperation_noStorageSupport() {
  var element = goog.dom.createElement('div');
  var expectedErrorMessage = 'The browser you are using does not support Web ' +
      'Storage. Please try again in a different browser.';
  // Detect call to handle unrecoverable error, and confirm container and error
  // message passed.
  var called = false;
  stub.set(
      firebaseui.auth.widget.handler.common,
      'handleUnrecoverableError',
      function(app, container, errorMessage) {
        called = true;
        assertEquals(element, container);
        assertEquals(expectedErrorMessage, errorMessage);
      });
  // Simulate web storage unavailability.
  stub.set(firebaseui.auth.storage, 'isAvailable', function() {return false;});
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  assertTrue(called);
}


function testDispatchOperation_unhandled() {
  var element = goog.dom.createElement('div');
  setModeAndUrlParams('unhandled');
  assertThrows(function() {
    firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  });
}


function testDispatchOperation_select() {
  app.setConfig({
    'callbacks': {
      'uiShown': uiShownCallback
    }
  });
  assertEquals(uiShownCallbackCount, 0);
  var element = goog.dom.createElement('div');
  setModeAndUrlParams(firebaseui.auth.widget.Config.WidgetMode.SELECT);
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  assertSelectFromAccountChooserInvoked(app, element, true, undefined);
  assertEquals(uiShownCallbackCount, 1);
  // Force UI shown callback should be set to true.
  assertTrue(firebaseui.auth.widget.handler.common.acForceUiShown_);
  // Callback handler should be invoked.
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.CALLBACK, app, element);

  // accountchooser.com client should be initialized at this point.
  // Call dispatchOperation again.
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  // Provider sign-in invoked directly.
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN, app, element);
  // UI shown callback should be triggered again.
  assertEquals(uiShownCallbackCount, 2);
}


function testDispatchOperation_acDisabled() {
  // Disable credential helpers and add uiShownCallback.
  app.setConfig({
    'credentialHelper': firebaseui.auth.CredentialHelper.NONE,
    'callbacks': {
      'uiShown': uiShownCallback
    }
  });
  // Skip select.
  testAc.setSkipSelect(true);
  testAc.setAvailability(false);
  assertEquals(uiShownCallbackCount, 0);
  var element = goog.dom.createElement('div');
  setModeAndUrlParams(firebaseui.auth.widget.Config.WidgetMode.SELECT);
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  assertSelectFromAccountChooserInvoked(app, element, true, undefined);
  // Callback handler should be invoked.
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.CALLBACK, app, element);
  assertEquals(uiShownCallbackCount, 1);
  // Force UI shown callback should be set to true.
  assertTrue(firebaseui.auth.widget.handler.common.acForceUiShown_);

  // accountchooser.com client should be initialized at this point.
  // Call dispatchOperation again.
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  // Provider sign-in invoked directly.
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN, app, element);
  // UI shown callback should be triggered again.
  assertEquals(uiShownCallbackCount, 2);
}


function testDispatchOperation_selectWithRedirectUrl() {
  var element = goog.dom.createElement('div');
  setModeAndUrlParams(firebaseui.auth.widget.Config.WidgetMode.SELECT);
  // Redirect URL.
  var redirectUrl = 'http://www.example.com';
  // Simulate redirect URL above being available in URL.
  stub.set(
      goog.uri.utils,
      'getParamValue',
      function(url, queryParameterForSignInSuccessUrl) {
        return redirectUrl;
      });
  // No redirect URL.
  assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  assertSelectFromAccountChooserInvoked(app, element, true, undefined);
  // Redirect URL should be set now in storage.
  assertTrue(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
  // Confirm it is the correct value.
  assertEquals(
      redirectUrl,
      firebaseui.auth.storage.getRedirectUrl(app.getAppId()));
  // Force UI shown callback should be set to true.
  assertTrue(firebaseui.auth.widget.handler.common.acForceUiShown_);
  // Callback handler should be invoked.
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.CALLBACK, app, element);
}


function testDispatchOperation_callbackWithRedirectUrl() {
  var element = goog.dom.createElement('div');
  // Set current mode to callback mode.
  setModeAndUrlParams(firebaseui.auth.widget.Config.WidgetMode.CALLBACK);
  // Redirect URL.
  var redirectUrl = 'http://www.example.com';
  // Simulate redirect URL above being available in URL.
  stub.set(
      goog.uri.utils,
      'getParamValue',
      function(url, queryParameterForSignInSuccessUrl) {
        return redirectUrl;
      });
  // No redirect URL.
  assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  // Redirect URL should be set now in storage.
  assertTrue(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
  // Confirm it is the correct value.
  assertEquals(
      redirectUrl,
      firebaseui.auth.storage.getRedirectUrl(app.getAppId()));
  // Callback handler should be invoked.
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.CALLBACK, app, element);
}


function testDispatchOperation_noMode_providerFirst() {
  var element = goog.dom.createElement('div');
  setModeAndUrlParams(null);
  try {
    firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
    fail('Mode should always be provided!');
  } catch(e) {
    assertEquals('Unhandled widget operation.', e.message);
  }
}


function testDispatchOperation_callback() {
  var element = goog.dom.createElement('div');
  setModeAndUrlParams(firebaseui.auth.widget.Config.WidgetMode.CALLBACK);
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.CALLBACK,
      app,
      element);
}


function testDispatchOperation_revokeChangeEmail() {
  var element = goog.dom.createElement('div');
  setModeAndUrlParams(
      firebaseui.auth.widget.Config.WidgetMode.RECOVER_EMAIL,
      {'oobCode': 'ACTION_CODE'});
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.EMAIL_CHANGE_REVOCATION,
      app,
      element,
      'ACTION_CODE');
}


function testDispatchOperation_verifyEmail() {
  var element = goog.dom.createElement('div');
  setModeAndUrlParams(
      firebaseui.auth.widget.Config.WidgetMode.VERIFY_EMAIL,
      {'oobCode': 'ACTION_CODE'});
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.EMAIL_VERIFICATION,
      app,
      element,
      'ACTION_CODE');
}


function testDispatchOperation_resetPassword() {
  var element = goog.dom.createElement('div');
  setModeAndUrlParams(
      firebaseui.auth.widget.Config.WidgetMode.RESET_PASSWORD,
      {'oobCode': 'ACTION_CODE'});
  firebaseui.auth.widget.dispatcher.dispatchOperation(app, element);
  assertHandlerInvoked(
      firebaseui.auth.widget.HandlerName.PASSWORD_RESET,
      app,
      element,
      'ACTION_CODE');
}

