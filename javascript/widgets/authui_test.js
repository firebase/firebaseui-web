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
 * @fileoverview Tests for app.js
 */

goog.provide('firebaseui.auth.AuthUITest');

goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.CredentialHelper');
goog.require('firebaseui.auth.GoogleYolo');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.testing.FakeAppClient');
goog.require('firebaseui.auth.testing.FakeUtil');
goog.require('firebaseui.auth.ui.page.Callback');
goog.require('firebaseui.auth.ui.page.ProviderSignIn');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.dispatcher');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleCallback');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.object');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

goog.setTestOnly('firebaseui.auth.AuthUITest');


var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();


// Test application instances.
var app;
var app1;
var app2;
var app3;
// Test configuration objects.
var config1;
var config2;
var config3;
var config4;
// Test stubs for handlers and widget dispatcher.
var testStubs = new goog.testing.PropertyReplacer();
// Container elements for sign-in button and widget rendering.
var container1;
var container2;
var container3;
// Test util for goto utilities.
var testUtil;
// Firebase Auth test tokens.
var passwordIdToken1 = 'HEADER1.eyJhdWQiOiAiY2xpZW50X2lkIiwgImVtYWlsIjogInVz' +
    'ZXJAZXhhbXBsZS5jb20iLCAiaXNzIjogMTQwNDYzMzQ0MiwgImV4cCI6IDE1MDQ2MzM0NDJ' +
    '9.SIGNATURE1';
var passwordIdToken2 = 'HEADER2.eyJhdWQiOiAiY2xpZW50X2lkIiwgImVtYWlsIjogInVz' +
    'ZXJAZXhhbXBsZS5jb20iLCAiaXNzIjogMTQwNDYzMzQ0MiwgImV4cCI6IDE1MDQ2MzM0NDJ' +
    '9.SIGNATURE2';
var passwordIdToken3 = 'HEADER3.eyJhdWQiOiAiY2xpZW50X2lkIiwgImVtYWlsIjogInVz' +
    'ZXJAZXhhbXBsZS5jb20iLCAiaXNzIjogMTQwNDYzMzQ0MiwgImV4cCI6IDE1MDQ2MzM0NDJ' +
    '9.SIGNATURE3';

var testApp;
var testApp1;
var testApp2;
var testApp3;

var testAuth;
var testAuth1;
var testAuth2;
var testAuth3;

var firebase = {};
var options = {
  'apiKey': 'API_KEY',
  'authDomain': 'subdomain.firebaseapp.com'
};
// Mock googleyolo ID token credential.
var googleYoloIdTokenCredential = {
  'idToken': 'ID_TOKEN',
  'id': 'user@example.com',
  'authMethod': 'https://accounts.google.com'
};
var mockControl;
var ignoreArgument;
var expectedUser = {
  uid: '1234567890',
  email: 'user@example.com',
  displayName: 'Federated User',
  providerData: [{
    'uid': 'FED_ID',
    'email': 'user@example.com',
    'displayName': 'Federated User',
    'providerId': 'google.com'
  }, {
    'uid': 'user@example.com',
    'email': 'user@example.com',
    'providerId': 'password'
  }]
};
var expectedCredential =
    {'accessToken': 'googleAccessToken', 'providerId': 'google.com'};
var expectedAdditionalUserInfo = {
  'profile': {
    'kind': 'plus#person',
    'displayName': 'John Doe',
    'name': {
      'givenName': 'John',
      'familyName': 'Doe'
    }
  },
  'providerId': 'google.com',
  'isNewUser': false
};
var expectedUserCredential = {
  'user': expectedUser,
  'credential': expectedCredential,
  'operationType': 'signIn',
  'additionalUserInfo': expectedAdditionalUserInfo
};
var pendingCredential =
    {'accessToken': 'fbAccessToken', 'providerId': 'facebook.com'};
var pendingEmailCredential = new firebaseui.auth.PendingEmailCredential(
    expectedUser.email, pendingCredential);
var expectedProvider = null;
var anonymousUpgradeConfig = null;
var anonymousUser = {
  uid: '1234567890',
  isAnonymous: true
};


/**
 * @param {!Element} container The container element to check.
 * @param {string} cssName The css class name to check for.
 * Asserts the element provided has a child with the provided css name.
 */
function assertHasCssClass(container, cssName) {
  var page = container.children[0];
  assertTrue(goog.dom.classlist.contains(page,  goog.getCssName(cssName)));
}


function setUp() {
  // Used to initialize internal Auth instance.
  firebase = {};
  firebase.instances_ = {};
  firebase.initializeApp = function(options, name) {
    // Throw an error if a FirebaseApp already exists for the specified name.
    var key = name || '[DEFAULT]';
    if (firebase.instances_[key]) {
      throw new Error('An app instance already exists for ' + key);
    } else {
      firebase.instances_[key] =
          new firebaseui.auth.testing.FakeAppClient(options, name);
    }
    var firebaseApp = firebase.instances_[key];
    // Make sure auth instance is installed.
    // This is needed to confirm auth API calls on internal instance in the
    // AuthUI constructor.
    firebaseApp.auth().install();
    return firebaseApp;
  };
  // Define firebase.auth.Auth.Persistence enum.
  firebase.auth = firebase.auth || {};
  firebase.auth.Auth = firebase.auth.Auth || {};
  firebase.auth.Auth.Persistence = firebase.auth.Auth.Persistence || {
    LOCAL: 'local',
    NONE: 'none',
    SESSION: 'session'
  };
  // Populate mock providers and their PROVIDER_ID.
  for (var key in firebaseui.auth.idp.AuthProviders) {
    firebase['auth'][firebaseui.auth.idp.AuthProviders[key]] = function() {
      this.scopes = [];
      this.customParameters = {};
    };
    firebase['auth'][firebaseui.auth.idp.AuthProviders[key]].PROVIDER_ID = key;
  }
  // On FirebaseApp deletion, confirm instance not already deleted and then
  // remove it from firebase.instances_.
  testStubs.replace(
      firebaseui.auth.testing.FakeAppClient.prototype,
      'delete',
      function() {
        // Already deleted.
        if (!firebase.instances_[this['name']]) {
          throw new Error('Instance ' + key + ' already deleted!');
        }
        delete firebase.instances_[this['name']];
        return goog.Promise.resolve();
      });
  // Create all test elements and append to document.
  container1 = goog.dom.createDom(goog.dom.TagName.DIV, {'id': 'element1'});
  document.body.appendChild(container1);
  container2 = goog.dom.createDom(goog.dom.TagName.DIV, {'id': 'element2'});
  document.body.appendChild(container2);
  container3 = goog.dom.createDom(goog.dom.TagName.DIV, {'id': 'element3'});
  document.body.appendChild(container3);
  // Record all handler functions and widget dispatch functions.
  testStubs.set(
      firebaseui.auth.widget.handler,
      'startSignIn',
      goog.testing.recordFunction());
  testStubs.set(
      firebaseui.auth.widget.dispatcher,
      'dispatchOperation',
      goog.testing.recordFunction());
  // Simulate accountchooser.com loaded.
  testStubs.set(
      firebaseui.auth.widget.handler.common,
      'loadAccountchooserJs',
      function(app, callback, opt_forceUiShownCallback) {
        callback();
      });
  // Install fake test utilities.
  testUtil = new firebaseui.auth.testing.FakeUtil().install();
  ignoreArgument = goog.testing.mockmatchers.ignoreArgument;
  mockControl = new goog.testing.MockControl();

  // Build mock auth providers.
  for (var key in firebaseui.auth.idp.AuthProviders) {
    firebase['auth'][firebaseui.auth.idp.AuthProviders[key]] = function() {
      this.scopes = [];
      this.customParameters = {};
    };
    firebase['auth'][firebaseui.auth.idp.AuthProviders[key]].PROVIDER_ID = key;
    if (key != 'twitter.com' && key != 'password') {
      firebase['auth'][firebaseui.auth.idp.AuthProviders[key]]
          .prototype.addScope = function(scope) {
        this.scopes.push(scope);
        return this;
      };
    }
    if (key != 'password') {
      // Record setCustomParameters for all OAuth providers.
      firebase['auth'][firebaseui.auth.idp.AuthProviders[key]]
          .prototype.setCustomParameters = function(customParameters) {
        this.customParameters = customParameters;
        return this;
      };
    }
    if (key == 'password') {
      // Mock credential initializer for Email/password credentials.
      firebase['auth'][firebaseui.auth.idp.AuthProviders[key]]['credential'] =
          function(email, password) {
            return {
              'email': email,
              'password': password,
              'providerId': 'password'
            };
          };
    } else if (key == 'facebook.com') {
      // Mock credential initializer for Facebook credentials.
      firebase['auth'][firebaseui.auth.idp.AuthProviders[key]]['credential'] =
          function(accessToken) {
            return {
              'accessToken': accessToken,
              'providerId': 'facebook.com'
            };
          };
    }
  }
  expectedProvider = new firebase.auth.GoogleAuthProvider();
  anonymousUpgradeConfig = {
    'autoUpgradeAnonymousUsers': true,
    'callbacks': {
      'signInSuccess': goog.testing.recordFunction(function() {
        return false;
      }),
      'signInFailure': goog.testing.recordFunction(function() {
        return goog.Promise.resolve();
      })
    }
  };
}


function tearDown() {
  testApp = null;
  testApp1 = null;
  testApp2 = null;
  testApp3 = null;
  // Delete all application instances.
  // Uninstall internal and external Auth instances.
  if (app1) {
    app1.getAuth().assertSignOut([]);
    app1.getAuth().uninstall();
    app1.getExternalAuth().uninstall();
    app1.reset();
  }
  app1 = null;
  if (app2) {
    app2.getAuth().assertSignOut([]);
    app2.getAuth().uninstall();
    app2.getExternalAuth().uninstall();
    app2.reset();
  }
  app2 = null;
  if (app3) {

    app3.getAuth().assertSignOut([]);
    app3.getAuth().uninstall();
    app3.getExternalAuth().uninstall();
    app3.reset();
  }
  app3 = null;
  // Reset internals.
  firebaseui.auth.AuthUI.resetAllInternals();
  // Clear all web storage.
  window.localStorage.clear();
  window.sessionStorage.clear();
  // Remove all test containers from document.
  goog.dom.removeNode(container1);
  goog.dom.removeNode(container2);
  goog.dom.removeNode(container3);
  // Reset test stubs.
  testStubs.reset();
  testUtil.uninstall();
  testAuth.uninstall();
  if (testAuth1) {
    testAuth1.uninstall();
  }
  if (testAuth2) {
    testAuth2.uninstall();
  }
  if (testAuth3) {
    testAuth3.uninstall();
  }
  if (app) {
    app.getAuth().assertSignOut([]);
    app.getAuth().uninstall();
    app.getExternalAuth().uninstall();
    app.reset();
    app = null;
  }
  mockControl.$verifyAll();
  mockControl.$tearDown();
}


/** Creates and installs all auth, app and AuthUI instances for tests. */
function createAndInstallTestInstances() {
  // Create and install the developer provided Auth instances.
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  testAuth.install();
  testApp1 = new firebaseui.auth.testing.FakeAppClient(options, 'testapp1');
  testAuth1 = testApp1.auth();
  testAuth1.install();
  testApp2 = new firebaseui.auth.testing.FakeAppClient(options, 'testapp2');
  testAuth2 = testApp2.auth();
  testAuth2.install();
  testApp3 = new firebaseui.auth.testing.FakeAppClient(options, 'testapp3');
  testAuth3 = testApp3.auth();
  testAuth3.install();
  // Initialize all test apps. Do not supply an app id for third instance.
  app1 = new firebaseui.auth.AuthUI(testAuth1, 'id1');
  // Install all internal instances.
  app1.getAuth().assertSetPersistence(['session'], null);
  app2 = new firebaseui.auth.AuthUI(testAuth2, 'id2');
  app2.getAuth().assertSetPersistence(['session'], null);
  app3 = new firebaseui.auth.AuthUI(testAuth3);
  app3.getAuth().assertSetPersistence(['session'], null);
  // Initialize config objects.
  config1 = {
    'signInSuccessUrl': 'http://localhost/home1',
    'widgetUrl': 'http://localhost/firebase1',
  };
  config2 = {
    'signInSuccessUrl': 'http://localhost/home2',
    'widgetUrl': 'http://localhost/firebase2',
  };
  config3 = {
    'signInSuccessUrl': 'http://localhost/home3',
    'widgetUrl': 'http://localhost/firebase3',
  };
  config4 = {
    'signInSuccessUrl': 'http://localhost/home4',
    'widgetUrl': 'http://localhost/firebase4',
  };
  // Set application configurations.
  app1.setConfig(config1);
  app2.setConfig(config2);
  app3.setConfig(config3);
}


function testGetExternalAuth() {
  createAndInstallTestInstances();
  // Confirm correct Auth instance stored for each app.
  assertEquals(testAuth1, app1.getExternalAuth());
  assertEquals(testAuth2, app2.getExternalAuth());
  assertEquals(testAuth3, app3.getExternalAuth());
  // Confirm internal instances have same options as external.
  assertEquals(testAuth1.app.options.apiKey, app1.getAuth().app.options.apiKey);
  assertEquals('API_KEY', app1.getAuth().app.options.apiKey);
  assertEquals(
      'subdomain.firebaseapp.com', app1.getAuth().app.options.authDomain);
  assertEquals(
      testAuth1.app.options.authDomain, app1.getAuth().app.options.authDomain);
  // Confirm correct name used for temp instance.
  assertEquals('testapp1-firebaseui-temp', app1.getAuth().app.name);
  assertEquals('testapp2-firebaseui-temp', app2.getAuth().app.name);
}

function testTempAuth_sessionPersistence() {
  createAndInstallTestInstances();
  // Initialize app.
  testAuth.install();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Confirm correct name used for temp instance.
  assertEquals('testapp1-firebaseui-temp', app1.getAuth().app.name);
  // Confirm session persistence set on internal instance.
  app.getAuth().assertSetPersistence(['session'], null);
}


function testAppId() {
  createAndInstallTestInstances();
  // Confirm correct app id stored for each app.
  assertEquals('id1', app1.getAppId());
  assertEquals('id2', app2.getAppId());
  assertUndefined(app3.getAppId());
}


function testGetInstance() {
  // Initially all instances should be null.
  assertNull(firebaseui.auth.AuthUI.getInstance());
  assertNull(firebaseui.auth.AuthUI.getInstance('id0'));
  assertNull(firebaseui.auth.AuthUI.getInstance('id1'));
  assertNull(firebaseui.auth.AuthUI.getInstance('id2'));
  // Create and install test instances.
  createAndInstallTestInstances();
  // Confirm expected app instances returned for getInstance().
  assertEquals(app1, firebaseui.auth.AuthUI.getInstance('id1'));
  assertEquals(app2, firebaseui.auth.AuthUI.getInstance('id2'));
  assertEquals(app3, firebaseui.auth.AuthUI.getInstance());
  assertNull(firebaseui.auth.AuthUI.getInstance('id0'));
  // Trying to create a new instance with an existing appId wil throw the
  // expected error.
  var error = assertThrows(function() {
    new firebaseui.auth.AuthUI(testAuth1, 'id1');
  });
  assertEquals(
      'An AuthUI instance already exists for the key "id1"', error.message);
}


function testIsPending() {
  createAndInstallTestInstances();
  assertFalse(app1.isPending());
  assertFalse(app2.isPending());
  assertFalse(app3.isPending());
  var pendingEmailCredential =
      new firebaseui.auth.PendingEmailCredential('test@gmail.com');
  firebaseui.auth.storage.setPendingEmailCredential(pendingEmailCredential);
  assertFalse(app1.isPending());
  assertFalse(app2.isPending());
  assertTrue(app3.isPending());
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, 'id1');
  assertTrue(app1.isPending());
  assertFalse(app2.isPending());
  assertTrue(app3.isPending());
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, 'id2');
  assertTrue(app1.isPending());
  assertTrue(app2.isPending());
  assertTrue(app3.isPending());
}


function testStart() {
  createAndInstallTestInstances();
  // Test multiple rendering for the widget in different apps.
  asyncTestCase.waitForSignals(1);
  var resetWarning = 'UI Widget is already rendered on the page and is pend' +
      'ing some user interaction. Only one widget instance can be rendered ' +
      'per page. The previous instance has been automatically reset.';
  testStubs.reset();
  // Record log console warnings.
  testStubs.set(
      firebaseui.auth.log,
      'warning',
      goog.testing.recordFunction());
  // No rendered AuthUI.
  assertNull(app1.getAuthUiGetter()());
  testStubs.set(
      firebaseui.auth.widget.dispatcher,
      'dispatchOperation',
      goog.testing.recordFunction(
          firebaseui.auth.widget.dispatcher.dispatchOperation));
  // Assume pending credential set in app1.
  // This will be cleared when app2 interrupts and resets app1.
  var pendingEmailCredential =
      new firebaseui.auth.PendingEmailCredential('test@gmail.com');
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, app1.getAppId());
  assertNull(app1.getCurrentComponent());
  firebaseui.auth.storage.setPendingRedirectStatus(app1.getAppId());
  assertTrue(firebaseui.auth.storage.hasPendingRedirectStatus(app1.getAppId()));
  // Start widget for app1, override configuration for that.
  app1.start(container1, config4);
  app1.getExternalAuth().runAuthChangeHandler();
  assertFalse(
      firebaseui.auth.storage.hasPendingRedirectStatus(app1.getAppId()));
  // Confirm getCurrentComponent returns the expected callback component.
  assertTrue(
      app1.getCurrentComponent() instanceof firebaseui.auth.ui.page.Callback);
  // No automatic reset warning is logged.
  assertEquals(0, firebaseui.auth.log.warning.getCallCount());
  // Confirm configuration updated to config4.
  assertConfigEquals(
      config4,
      app1.getConfig());
  // Current rendered AuthUI should be set correctly.
  assertEquals(app1, firebaseui.auth.AuthUI.getAuthUi());
  assertEquals(app1, app1.getAuthUiGetter()());
  // Dispatch operation should be called.
  assertEquals(1,
      firebaseui.auth.widget.dispatcher.dispatchOperation.getCallCount());
  // app1 instance should be passed.
  assertEquals(
      app1,
      firebaseui.auth.widget.dispatcher.dispatchOperation.getLastCall()
      .getArgument(0));
  // Container1 should be passed.
  assertEquals(
      container1,
      firebaseui.auth.widget.dispatcher.dispatchOperation.getLastCall()
      .getArgument(1));
  // Callback page rendered in first app container1.
  assertHasCssClass(container1, 'firebaseui-id-page-callback');

  firebaseui.auth.storage.setPendingRedirectStatus(app2.getAppId());
  assertTrue(firebaseui.auth.storage.hasPendingRedirectStatus(app2.getAppId()));
  // Try to render another widget. This should reset first app widget.
  app2.start(container2, config2);
  app2.getExternalAuth().runAuthChangeHandler();
  assertFalse(
      firebaseui.auth.storage.hasPendingRedirectStatus(app2.getAppId()));
  app1.getAuth().assertSignOut([]);
  // App1 pending creds cleared.
  assertFalse(
      firebaseui.auth.storage.hasPendingEmailCredential(app1.getAppId()));
  // Automatic reset warning is logged since app1 is still pending.
  assertEquals(1, firebaseui.auth.log.warning.getCallCount());
  /** @suppress {missingRequire} */
  assertEquals(
        resetWarning,
        firebaseui.auth.log.warning.getLastCall().getArgument(0));
  // Current rendered AuthUi should be set correctly.
  assertEquals(app2, firebaseui.auth.AuthUI.getAuthUi());
  assertEquals(app2, app1.getAuthUiGetter()());
  // Dispatch operation should be called.
  /** @suppress {missingRequire} */
  assertEquals(2,
      firebaseui.auth.widget.dispatcher.dispatchOperation.getCallCount());
  // app2 instance should be passed.
  assertEquals(
      app2,
      firebaseui.auth.widget.dispatcher.dispatchOperation.getLastCall()
      .getArgument(0));
  // Container2 should be passed.
  /** @suppress {missingRequire} */
  assertEquals(
      container2,
      firebaseui.auth.widget.dispatcher.dispatchOperation.getLastCall()
      .getArgument(1));
  // First widget container should be reset.
  assertEquals(0, container1.children.length);
  // Callback rendered on second app.
  assertHasCssClass(container2, 'firebaseui-id-page-callback');
  // For a specific AuthUI, only the first getRedirectResult will be obtained
  // from Auth instance. The next requests will use an empty promise to force
  // provider sign-in screen to show for widget re-rendering.
  app2.getAuth().assertGetRedirectResult(
      [],
      {
        'user': null,
        'credential': null
      });

  app2.getAuth().process().then(function() {
    // Provider sign-in rendered at this stage.
    assertHasCssClass(container2, 'firebaseui-id-page-provider-sign-in');
    // Confirm getCurrentComponent returns the expected ProviderSignIn
    // component.
    assertTrue(
        app2.getCurrentComponent() instanceof
        firebaseui.auth.ui.page.ProviderSignIn);
    // Try rendering again same app widget. This should not call auth
    // getRedirectResult anymore since if there is a pending redirect, it will
    // process it and not display the widget.
    app2.start(container2, config2);
    app2.getExternalAuth().runAuthChangeHandler();
    app2.getAuth().assertSignOut([]);
    // No additional Automatic reset warning is logged.
    /** @suppress {missingRequire} */
    assertEquals(1, firebaseui.auth.log.warning.getCallCount());
    assertHasCssClass(container2, 'firebaseui-id-page-callback');
    app2.getRedirectResult().then(function(result) {
      assertHasCssClass(container2, 'firebaseui-id-page-provider-sign-in');
      // After reset, currentComponent is set to null.
      app2.getAuth().assertSignOut([]);
      app2.reset();
      // Confirm current component is null after reset.
      assertNull(app2.getCurrentComponent());
      asyncTestCase.signal();
    });
  });
}


function testSetLang() {
  testStubs.replace(goog, 'LOCALE', 'de');
  // Language code of auth instance is set to goog.LOCALE at initialization.
  // Replace goog.LOCALE and then install instance.
  createAndInstallTestInstances();
  app1.start(container1, config1);
  app1.getExternalAuth().runAuthChangeHandler();
  assertEquals('de', container1.getAttribute('lang'));
  assertEquals('de', app1.getAuth().languageCode);
  assertEquals('de', app1.getExternalAuth().languageCode);
  app1.getAuth().assertSignOut([]);
  app1.reset();
  assertFalse(container1.hasAttribute('lang'));
}

function testSetLang_codeWithdash() {
  testStubs.replace(goog, 'LOCALE', 'zh-CN');
  // Language code of auth instance is set to goog.LOCALE at initialization.
  // Replace goog.LOCALE and then install instance.
  createAndInstallTestInstances();
  app1.start(container1, config1);
  app1.getExternalAuth().runAuthChangeHandler();
  assertEquals('zh-CN', container1.getAttribute('lang'));
  assertEquals('zh-CN', app1.getAuth().languageCode);
  assertEquals('zh-CN', app1.getExternalAuth().languageCode);
  app1.getAuth().assertSignOut([]);
  app1.reset();
  assertFalse(container1.hasAttribute('lang'));
}

function testSetLang_codeWithUnderscore() {
  testStubs.replace(goog, 'LOCALE', 'zh_CN');
  // Language code of auth instance is set to goog.LOCALE at initialization.
  // Replace goog.LOCALE and then install instance.
  createAndInstallTestInstances();
  app1.start(container1, config1);
  app1.getExternalAuth().runAuthChangeHandler();
  // The lang should have a dash instead of an underscore.
  assertEquals('zh-CN', container1.getAttribute('lang'));
  assertEquals('zh-CN', app1.getAuth().languageCode);
  assertEquals('zh-CN', app1.getExternalAuth().languageCode);
  app1.getAuth().assertSignOut([]);
  app1.reset();
  assertFalse(container1.hasAttribute('lang'));
}

function testStart_overrideLanguageCode() {
  // Set the language code of widget to zh-CN.
  testStubs.replace(goog, 'LOCALE', 'zh-CN');
  createAndInstallTestInstances();
  testAuth.install();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().assertSetPersistence(['session'], null);
  // Set the language code of auth to de.
  testAuth.languageCode = 'de';
  // Override language code of auth to zh-CN.
  app.start(container1, config1);
  app.getExternalAuth().runAuthChangeHandler();
  assertEquals('zh-CN', app.getExternalAuth().languageCode);
  app.getAuth().assertSignOut([]);
  app.reset();
  // Confirm language code of auth changed back to de.
  assertEquals('de', testAuth.languageCode);
}


function testStart_elementNotFound() {
  // Test widget start method with missing element.
  // Test correct error message thrown when widget element not found.
  createAndInstallTestInstances();
  try {
    app1.start('#notFound', config4, 'POST_BODY');
    app1.getExternalAuth().runAuthChangeHandler();
    firebaseui.auth.widget.dispatcher.dispatchOperation(app, '#notFound');
    fails('Should have thrown an error!');
  } catch (e) {
    // Confirm correct error message thrown.
    assertEquals(
        e.message,
        'Could not find the FirebaseUI widget element on the page.');
  }
}


function testUiChangedCallback() {
  // Test UI changed callbacks called on UI changed.
  createAndInstallTestInstances();
  testStubs.reset();
  // Simulate accountchooser.com client library loaded.
  testStubs.set(
      firebaseui.auth.widget.handler.common,
      'loadAccountchooserJs',
      function(app, callback, opt_forceUiShownCallback) {
        callback();
      });
  asyncTestCase.waitForSignals(1);
  // Simulate select mode for current widget mode.
  testStubs.set(
      firebaseui.auth.widget.dispatcher,
      'getMode',
      function() {
        return firebaseui.auth.widget.Config.WidgetMode.SELECT;
      });
  // Track parameters passed to UI changed callback.
  var fromPage = null;
  var toPage = null;
  var uiChangedCallbackCalled = false;
  // UI changed callback test function, used to record UI changed calls.
  var uiChangedCallback = function(from, to) {
    fromPage = from;
    toPage = to;
    uiChangedCallbackCalled = true;
  };
  // Set app config to include uiChanged callback.
  var config = {
    'signInSuccessUrl': 'http://localhost/home1',
    'widgetUrl': 'http://localhost/firebase1',
    'callbacks': {
      'uiChanged': uiChangedCallback
    },
    'credentialHelper': firebaseui.auth.CredentialHelper.NONE,
  };
  // Initialize app and pass configuration.
  // Make sure internal and external instances installed.
  testAuth.install();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().assertSetPersistence(['session'], null);
  app.getAuth().install();
  app.setConfig(config);
  // Confirm UI changed callback for app.
  assertEquals(uiChangedCallback, app.getConfig().getUiChangedCallback());
  // Start widget mode.
  app.start(container1, config);
  app.getExternalAuth().runAuthChangeHandler();
  // UI changed from null to sign in on widget rendering.
  assertTrue(uiChangedCallbackCalled);
  assertEquals(null, fromPage);
  // This is now going to callback first before provider sign-in.
  assertEquals('callback', toPage);
  // Reset flags.
  fromPage = null;
  toPage = null;
  uiChangedCallbackCalled = false;
  app.getAuth().assertGetRedirectResult(
      [],
      {
        'user': null,
        'credential': null
      });
  app.getAuth().process().then(function() {
    // When redirect result returns null, it will redirect to provider sign-in.
    assertTrue(uiChangedCallbackCalled);
    assertEquals('callback', fromPage);
    assertEquals('providerSignIn', toPage);
    asyncTestCase.signal();
  });
}


function testAuthUi_reset() {
  createAndInstallTestInstances();
  asyncTestCase.waitForSignals(2);
  // Record all calls to cancelOneTapSignIn.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'cancelOneTapSignIn',
      goog.testing.recordFunction());
  // Reset functions should be run.
  var reset1 = goog.testing.recordFunction();
  var reset2 = goog.testing.recordFunction();
  // Pending promises should be cancelled.
  var p1 = new goog.Promise(function(resolve, reject) {
  }).thenCatch(function(e) {
    assertEquals('cancel', e.name);
    asyncTestCase.signal();
  });
  var p2 = new goog.Promise(function(resolve, reject) {
  }).thenCatch(function(e) {
    assertEquals('cancel', e.name);
    asyncTestCase.signal();
  });
  // Initialize app.
  // Make sure internal and external instances installed.
  testAuth.install();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  // Render some UI for testing.
  firebaseui.auth.widget.handler.handlePasswordSignIn(app, container1);
  // Register pending reset functions and pending promises.
  app.registerPending(reset1);
  app.registerPending(reset2);
  app.registerPending(p1);
  app.registerPending(p2);
  // No calls should be made to cancelOneTapSignIn at this point.
  assertEquals(
      0, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
  firebaseui.auth.storage.setPendingRedirectStatus(app.getAppId());
  assertTrue(firebaseui.auth.storage.hasPendingRedirectStatus(app.getAppId()));
  // Trigger reset.
  app.reset();
  assertFalse(firebaseui.auth.storage.hasPendingRedirectStatus(app.getAppId()));
  app.getAuth().assertSignOut([]);
  // Reset functions should be called and pending promises cancelled.
  assertEquals(1, reset1.getCallCount());
  assertEquals(1, reset2.getCallCount());
  // Rendered component should be cleared.
  assertEquals(0, container1.children.length);
  // Reset should call cancelOneTapSignIn.
  assertEquals(
      1, firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn.getCallCount());
}


/**
 * Asserts provided configuration object matches the widget configuration.
 *
 * @param {?Object} config
 * @param {firebaseui.auth.widget.Config} widgetConfig
 */
function assertConfigEquals(config, widgetConfig) {
  // Create widget config of provided config plain object.
  var temp = new firebaseui.auth.widget.Config();
  temp.setConfig(config);
  // Compare both widget configs.
  assertObjectEquals(temp, widgetConfig);
}


function testConfig() {
  testStubs.set(
      firebaseui.auth.log,
      'warning',
      goog.testing.recordFunction());
  createAndInstallTestInstances();
  // Check configuration set correctly for each app.
  assertConfigEquals(
      config1,
      app1.getConfig());
  assertConfigEquals(
      config2,
      app2.getConfig());
  assertConfigEquals(
      config3,
      app3.getConfig());
  app1.setConfig(config1);
  /** @suppress {missingRequire} */
  assertEquals(0, firebaseui.auth.log.warning.getCallCount());
  // Verifies that signInSuccess callback throws deprecation warning.
  var callbacks = {
    'signInSuccess': function(currentUser, credential, redirectUrl) {
      return true;
    }
  };
  app1.setConfig({
    'callbacks': callbacks
  });
  assertConfigEquals(
      {
        'signInSuccessUrl': 'http://localhost/home1',
        'widgetUrl': 'http://localhost/firebase1',
        'callbacks': callbacks
      },
      app1.getConfig());
  var deprecateWarning = 'signInSuccess callback is deprecated. Please use ' +
      'signInSuccessWithAuthResult callback instead.';
  /** @suppress {missingRequire} */
  assertEquals(1, firebaseui.auth.log.warning.getCallCount());
  /** @suppress {missingRequire} */
  assertEquals(deprecateWarning,
        firebaseui.auth.log.warning.getLastCall().getArgument(0));
  app1.setConfig({
    'callbacks': callbacks
  });
  // Deprecation warning should be only shown once.
  /** @suppress {missingRequire} */
  assertEquals(1, firebaseui.auth.log.warning.getCallCount());
  // Verifies that warning is shown for new instance.
  app2.setConfig({
    'callbacks': callbacks
  });
  /** @suppress {missingRequire} */
  assertEquals(2, firebaseui.auth.log.warning.getCallCount());
  /** @suppress {missingRequire} */
  assertEquals(deprecateWarning,
        firebaseui.auth.log.warning.getLastCall().getArgument(0));
}


function testUpdateConfig() {
  testStubs.set(
      firebaseui.auth.log,
      'warning',
      goog.testing.recordFunction());
  createAndInstallTestInstances();
  // Original config.
  var config = {
    'signInSuccessUrl': 'http://localhost/home1',
    'widgetUrl': 'http://localhost/firebase1',
    'siteName': 'Site_Name_1',
  };
  // Config with api key field updated.
  var expectedConfig = {
    'signInSuccessUrl': 'http://localhost/home1',
    'widgetUrl': 'http://localhost/firebase1',
    'siteName': 'Other_Site_Name',
  };
  // Set original config.
  app1.setConfig(config);
  // Confirm original api key.
  assertEquals('Site_Name_1', app1.getConfig().getSiteName());
  assertConfigEquals(
      config,
      app1.getConfig());
  // Update API key.
  app1.updateConfig('siteName', 'Other_Site_Name');
  // Confirm API key updated.
  assertEquals('Other_Site_Name', app1.getConfig().getSiteName());
  // Confirm config updated to new config with API key updated.
  assertConfigEquals(
      expectedConfig,
      app1.getConfig());
  /** @suppress {missingRequire} */
  assertEquals(0, firebaseui.auth.log.warning.getCallCount());
  // Verifies that signInSuccess callback throws deprecation warning.
  var callbacks = {
    'signInSuccess': function(currentUser, credential, redirectUrl) {
      return true;
    }
  };
  app1.updateConfig('callbacks', callbacks);
  assertConfigEquals(
      {
        'signInSuccessUrl': 'http://localhost/home1',
        'widgetUrl': 'http://localhost/firebase1',
        'siteName': 'Other_Site_Name',
        'callbacks': callbacks
      },
      app1.getConfig());
  var deprecateWarning = 'signInSuccess callback is deprecated. Please use ' +
      'signInSuccessWithAuthResult callback instead.';
  /** @suppress {missingRequire} */
  assertEquals(1, firebaseui.auth.log.warning.getCallCount());
  /** @suppress {missingRequire} */
  assertEquals(deprecateWarning,
        firebaseui.auth.log.warning.getLastCall().getArgument(0));
  // Deprecation warning should be only shown once.
  app1.updateConfig('callbacks', callbacks);
  /** @suppress {missingRequire} */
  assertEquals(1, firebaseui.auth.log.warning.getCallCount());
}


function testSignIn() {
  createAndInstallTestInstances();
  // Start sign-in for each app.
  app1.signIn();
  // Start sign-in handler should be called with app1 as argument.
  assertEquals(1, firebaseui.auth.widget.handler.startSignIn.getCallCount());
  assertEquals(
      app1,
      firebaseui.auth.widget.handler.startSignIn.getLastCall().getArgument(0));
  app2.signIn();
  // Start sign-in handler should be called with app2 as argument.
  assertEquals(2, firebaseui.auth.widget.handler.startSignIn.getCallCount());
  assertEquals(
      app2,
      firebaseui.auth.widget.handler.startSignIn.getLastCall().getArgument(0));
  app3.signIn();
  // Start sign-in handler should be called with app3 as argument.
  assertEquals(3, firebaseui.auth.widget.handler.startSignIn.getCallCount());
  assertEquals(
      app3,
      firebaseui.auth.widget.handler.startSignIn.getLastCall().getArgument(0));
}


function testAuthUi_delete() {
  createAndInstallTestInstances();
  asyncTestCase.waitForSignals(3);
  // Reset functions should be run.
  var reset1 = goog.testing.recordFunction();
  var reset2 = goog.testing.recordFunction();
  // Pending promises should be cancelled.
  var p1 = new goog.Promise(function(resolve, reject) {
  }).thenCatch(function(e) {
    assertEquals('cancel', e.name);
    asyncTestCase.signal();
  });
  var p2 = new goog.Promise(function(resolve, reject) {
  }).thenCatch(function(e) {
    assertEquals('cancel', e.name);
    asyncTestCase.signal();
  });
  // Initialize app.
  // Make sure internal and external instances installed.
  testAuth.install();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  assertEquals(app, firebaseui.auth.AuthUI.getInstance('id0'));
  app.getAuth().install();
  // Confirm error thrown if another instance is initialized with the same
  // auth instance and appId.
  assertThrows(function() {
    new firebaseui.auth.AuthUI(testAuth, 'id0');
  });
  // Delete instance and then try to reinitialize again.
  app.delete().then(function() {
    // No reference remains for id0.
    assertNull(firebaseui.auth.AuthUI.getInstance('id0'));
    // Initializing a new instance with same auth and appId should not throw an
    // error after deletion.
    assertNotThrows(function() {
      app = new firebaseui.auth.AuthUI(testAuth, 'id0');
    });
    // getInstance should return the new instance.
    assertEquals(app, firebaseui.auth.AuthUI.getInstance('id0'));
    // Render some UI for testing.
    firebaseui.auth.widget.handler.handlePasswordSignIn(app, container1);
    // Register pending reset functions and pending promises.
    app.registerPending(reset1);
    app.registerPending(reset2);
    app.registerPending(p1);
    app.registerPending(p2);
    // Trigger delete.
    app.delete().then(function() {
      // Reset functions should be called and pending promises cancelled.
      assertEquals(1, reset1.getCallCount());
      assertEquals(1, reset2.getCallCount());
      // Rendered component should be cleared.
      assertEquals(0, container1.children.length);
      // Confirm calling any public method will throw an error;
      var methods = [
        'getRedirectResult',
        'getCurrentComponent',
        'setCurrentComponent',
        'getAuth',
        'getExternalAuth',
        'getAppId',
        'isPending',
        'start',
        'registerPending',
        'getAuthUiGetter',
        'reset',
        'updateConfig',
        'setConfig',
        'getConfig',
        'signIn',
        'delete',
        'cancelOneTapSignIn',
        'showOneTapSignIn',
        'disableAutoSignIn',
        'isAutoSignInDisabled',
        'startSignInWithEmailAndPassword',
        'startCreateUserWithEmailAndPassword',
        'startSignInWithCredential',
        'startSignInWithPopup',
        'startSignInWithRedirect',
        'startSignInWithPhoneNumber',
        'finishSignInWithCredential',
        'signInWithExistingEmailAndPasswordForLinking',
        'clearTempAuthState',
        'onUpgradeError'
      ];
      // Call all public methods and confirm expected error.
      for (var i = 0; i < methods.length; i++) {
        var error = assertThrows(function() {
          app[methods[i]]();
        });
        assertEquals('AuthUI instance is deleted!', error.message);
      }
      app = null;
      asyncTestCase.signal();
    });
  });
}


function testAuthUi_logFramework() {
  // Confirm FirebaseUI-web framework ID logged on external and internal
  // Auth instances.
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().assertFrameworksLogged(['FirebaseUI-web']);
  app.getExternalAuth().assertFrameworksLogged(['FirebaseUI-web']);
  app.getAuth().install();
  app.getExternalAuth().install();
}


function testAuthUi_autoSignIn_manuallyDisabled() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  // Auto sign-in should be enabled.
  assertFalse(app.isAutoSignInDisabled());
  // Manually disable auto sign-in.
  app.disableAutoSignIn();
  // Auto sign-in should be disabled now.
  assertTrue(app.isAutoSignInDisabled());
}


function testAuthUi_autoSignIn_selectAccountPrompt() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  // Auto sign-in should be enabled.
  assertFalse(app.isAutoSignInDisabled());
  // Prompt requires account selection.
  app.setConfig({
    'signInSuccessUrl': 'http://localhost/home1',
    'signInOptions': [
      {
        'provider': 'google.com',
        'customParameters': {'prompt': 'select_account'}
      }
    ]
  });
  // Auto sign-in should be disabled now that account selection is required.
  assertTrue(app.isAutoSignInDisabled());
}


function testAuthUi_oneTapSignIn_disabled() {
  // Even though One-Tap config provided, credential helper is set to none.
  var uiConfig = {
    'signInSuccessUrl': 'http://localhost/home1',
    'signInOptions': [
      {
        'provider': 'google.com',
        'customParameters': {'prompt': 'select_account'},
        'authMethod': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ],
    'credentialHelper': firebaseui.auth.CredentialHelper.NONE
  };
  // Expected googyolo config is null.
  var googYoloConfig = null;
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container1);
  var handler = mockControl.createFunctionMock('handler');
  var googleYolo = mockControl.createStrictMock(firebaseui.auth.GoogleYolo);
  var getInstance = mockControl.createMethodMock(
      firebaseui.auth.GoogleYolo, 'getInstance');
  getInstance().$returns(googleYolo);
  // One-Tap should be a no-op since the googleyolo config is null.
  googleYolo.show(null, true)
      .$once()
      // Simulate no googleyolo credential returned since this is a no-op.
      .$returns(goog.Promise.resolve(null));
  // Provided handler should be passed the expected parameters.
  // In this case, a null credential is passed.
  handler(ignoreArgument, component, null)
      .$once()
      .$does(function(actualApp, actualComponent, actualCredential) {
        assertEquals(app, actualApp);
        asyncTestCase.signal();
        return goog.Promise.resolve(false);
      });
  // Cancelled on tearDown.
  googleYolo.cancel().$once();
  mockControl.$replayAll();

  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.setConfig(uiConfig);
  app.setCurrentComponent(component);
  app.showOneTapSignIn(handler);
}


function testAuthUi_oneTapSignIn_autoSignInDisabled() {
  // Prompt requires account selection. This will result with auto sign-in
  // being disabled.
  var uiConfig = {
    'signInSuccessUrl': 'http://localhost/home1',
    'signInOptions': [
      {
        'provider': 'google.com',
        'customParameters': {'prompt': 'select_account'},
        'authMethod': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ],
    'credentialHelper': firebaseui.auth.CredentialHelper.GOOGLE_YOLO
  };
  // Expected googyolo config corresponding to the above FirebaseUI config.
  var googYoloConfig = {
    'supportedAuthMethods': [
      'https://accounts.google.com'
    ],
    'supportedIdTokenProviders': [
      {
        'uri': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ]
  };
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container1);
  var handler = mockControl.createFunctionMock('handler');
  var googleYolo = mockControl.createStrictMock(firebaseui.auth.GoogleYolo);
  var getInstance = mockControl.createMethodMock(
      firebaseui.auth.GoogleYolo, 'getInstance');
  getInstance().$returns(googleYolo);
  // One-Tap should be shown with auto sign-in disabled.
  googleYolo.show(googYoloConfig, true)
      .$once()
      // Simulate googleyolo credential returned.
      .$returns(goog.Promise.resolve(googleYoloIdTokenCredential));
  // Provided handler should be passed the expected parameters.
  handler(ignoreArgument, component, googleYoloIdTokenCredential)
      .$once()
      .$does(function(actualApp, actualComponent, actualCredential) {
        assertEquals(app, actualApp);
        asyncTestCase.signal();
        return goog.Promise.resolve(true);
      });
  // Cancelled on tearDown.
  googleYolo.cancel().$once();
  mockControl.$replayAll();

  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.setConfig(uiConfig);
  app.setCurrentComponent(component);
  app.showOneTapSignIn(handler);
}


function testAuthUi_oneTapSignIn_noCurrentComponent() {
  // Prompt requires account selection. This will result with auto sign-in
  // being disabled.
  var uiConfig = {
    'signInSuccessUrl': 'http://localhost/home1',
    'signInOptions': [
      {
        'provider': 'google.com',
        'customParameters': {'prompt': 'select_account'},
        'authMethod': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ],
    'credentialHelper': firebaseui.auth.CredentialHelper.GOOGLE_YOLO
  };
  // Expected googyolo config corresponding to the above FirebaseUI config.
  var googYoloConfig = {
    'supportedAuthMethods': [
      'https://accounts.google.com'
    ],
    'supportedIdTokenProviders': [
      {
        'uri': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ]
  };
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container1);
  var handler = mockControl.createFunctionMock('handler');
  var googleYolo = mockControl.createStrictMock(firebaseui.auth.GoogleYolo);
  var getInstance = mockControl.createMethodMock(
      firebaseui.auth.GoogleYolo, 'getInstance');
  getInstance().$returns(googleYolo);
  // One-Tap should be shown with auto sign-in disabled.
  googleYolo.show(googYoloConfig, true)
      .$once()
      .$does(function(config, autoSignInDisabled) {
        // Simulate no current component rendered.
        app.setCurrentComponent(null);
        // Simulate googleyolo credential returned.
        asyncTestCase.signal();
        return goog.Promise.resolve(googleYoloIdTokenCredential);
      });
  // Even though googleyolo credential is returned, handler is not called since
  // no current component is rendered.
  // Cancelled on tearDown.
  googleYolo.cancel().$once();
  mockControl.$replayAll();

  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.setConfig(uiConfig);
  app.setCurrentComponent(component);
  app.showOneTapSignIn(handler);
}


function testAuthUi_oneTapSignIn_autoSignInEnabled() {
  // No prompt, so auto sign-in will be enabled by default.
  var uiConfig = {
    'signInSuccessUrl': 'http://localhost/home1',
    'signInOptions': [
      {
        'provider': 'google.com',
        'authMethod': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ],
    'credentialHelper': firebaseui.auth.CredentialHelper.GOOGLE_YOLO
  };
  // Expected googyolo config corresponding to the above FirebaseUI config.
  var googYoloConfig = {
    'supportedAuthMethods': [
      'https://accounts.google.com'
    ],
    'supportedIdTokenProviders': [
      {
        'uri': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ]
  };
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container1);
  var handler = mockControl.createFunctionMock('handler');
  var googleYolo = mockControl.createStrictMock(firebaseui.auth.GoogleYolo);
  var getInstance = mockControl.createMethodMock(
      firebaseui.auth.GoogleYolo, 'getInstance');
  getInstance().$returns(googleYolo);
  // One-Tap should be shown with auto sign-in enabled.
  googleYolo.show(googYoloConfig, false)
      .$once()
      .$returns(goog.Promise.resolve(googleYoloIdTokenCredential));
  // Provided handler should be passed the expected parameters.
  handler(ignoreArgument, component, googleYoloIdTokenCredential)
      .$once()
      .$does(function(actualApp, actualComponent, actualCredential) {
        assertEquals(app, actualApp);
        asyncTestCase.signal();
        return goog.Promise.resolve(true);
      });
  // Cancelled once manually and then on tearDown.
  googleYolo.cancel().$times(2);
  mockControl.$replayAll();

  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.setConfig(uiConfig);
  app.setCurrentComponent(component);
  app.showOneTapSignIn(handler);
  app.cancelOneTapSignIn();
}


function testStartSignInWithEmailAndPassword_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  var expectedUserCredential = {
    'user': expectedUser,
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
  };
  app.startSignInWithEmailAndPassword('user@example.com', 'password')
      .then(function(userCredential) {
        assertObjectEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithEmailAndPassword(
      ['user@example.com', 'password'],
      function() {
        app.getAuth().setUser(expectedUser);
        // Make a copy of expected UserCredential to ensure
        // expectedUserCredential which is used to be compared with later will
        // not be modified.
        return goog.object.clone(expectedUserCredential);
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithEmailAndPassword_error() {
  var expectedError = {
    'code': 'auth/wrong-password',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithEmailAndPassword('user@example.com', 'password')
      .then(fail, function(error) {
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithEmailAndPassword(
      ['user@example.com', 'password'],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithEmailAndPassword_upgradeAnon_isAnonymous_success() {
  // Record calls to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  var expectedError = {'code': 'auth/email-already-in-use'};
  var cred = firebase.auth.EmailAuthProvider.credential(
      'user@example.com', 'password');
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithEmailAndPassword('user@example.com', 'password')
      .then(fail, function(error) {
        // onUpgradeError should be called.
        assertEquals(
            1, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertObjectEquals(
            expectedError,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(0));
        // Expected credential passed as second parameter to onUpgradeError.
        assertObjectEquals(
            cred,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(1));
        assertObjectEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  app.getAuth().assertSignInWithEmailAndPassword(
      ['user@example.com', 'password'],
      function() {
        app.getAuth().setUser(expectedUser);
        return {
          'user': expectedUser,
          'credential': null,
          'operationType': 'signIn',
          'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
        };
      });
  app.getAuth().process().then(function() {
    // Trigger initial onAuthStateChanged listener.
    app.getExternalAuth().runAuthChangeHandler();
    // signOut the user on internal instance.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testStartSignInWithEmailAndPassword_upgradeAnon_isAnon_error() {
  // Record calls to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  var expectedError = {
    'code': 'auth/wrong-password',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  app.startSignInWithEmailAndPassword('user@example.com', 'password')
      .then(fail, function(error) {
        // onUpgradeError should not be called even though email-already-in-use
        // thrown.
        assertEquals(
            0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate wrong password error on sign-in.
  app.getAuth().assertSignInWithEmailAndPassword(
      ['user@example.com', 'password'],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithEmailAndPassword_upgradeAnon_nonAnon_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate non-anonymous user logged in on external instance.
  testAuth.setUser(expectedUser);
  var expectedUserCredential = {
    'user': expectedUser,
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
  };
  app.startSignInWithEmailAndPassword('user@example.com', 'password')
      .then(function(userCredential) {
        assertObjectEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithEmailAndPassword(
      ['user@example.com', 'password'],
      function() {
        app.getAuth().setUser(expectedUser);
        // Make a copy of expected UserCredential to ensure
        // expectedUserCredential which is used to be compared with later will
        // not be modified.
        return goog.object.clone(expectedUserCredential);
      });
  app.getAuth().process().then(function() {
    // Trigger initial onAuthStateChanged listener.
    app.getExternalAuth().runAuthChangeHandler();
    app.getAuth().process();
    app.getExternalAuth().process();
  });
}


function testStartSignInWithEmailAndPassword_upgradeAnonymous_noUser_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate no user logged in on external instance.
  testAuth.setUser(null);
  var expectedUserCredential = {
    'user': expectedUser,
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
  };
  app.startSignInWithEmailAndPassword('user@example.com', 'password')
      .then(function(userCredential) {
        assertObjectEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithEmailAndPassword(
      ['user@example.com', 'password'],
      function() {
        app.getAuth().setUser(expectedUser);
        // Make a copy of expected UserCredential to ensure
        // expectedUserCredential which is used to be compared with later will
        // not be modified.
        return goog.object.clone(expectedUserCredential);
      });
  app.getAuth().process().then(function() {
    // Trigger initial onAuthStateChanged listener.
    app.getExternalAuth().runAuthChangeHandler();
    app.getAuth().process();
    app.getExternalAuth().process();
  });
}


function testStartCreateUserWithEmailAndPassword_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  var expectedUserCredential = {
    'user': expectedUser,
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'password', 'isNewUser': true}
  };
  app.startCreateUserWithEmailAndPassword('user@example.com', 'password')
      .then(function(userCredential) {
        assertObjectEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  app.getAuth().assertCreateUserWithEmailAndPassword(
      ['user@example.com', 'password'],
      function() {
        app.getAuth().setUser(expectedUser);
        // Make a copy of expected UserCredential to ensure
        // expectedUserCredential which is used to be compared with later will
        // not be modified.
        return goog.object.clone(expectedUserCredential);
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartCreateUserWithEmailAndPassword_error() {
  var expectedError = {
    'code': 'auth/weak-password',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startCreateUserWithEmailAndPassword('user@example.com', 'password')
      .then(fail, function(error) {
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().assertCreateUserWithEmailAndPassword(
      ['user@example.com', 'password'],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartCreateUserWithEmailAndPassword__upgradeAnon_isAnon_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  var expectedUserCredential = {
    'user': expectedUser,
    'credential': null,
    'operationType': 'link',
    'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
  };
  app.startCreateUserWithEmailAndPassword('user@example.com', 'password')
      .then(function(userCredential) {
        assertObjectEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  var emailCredential = {
    'email': 'user@example.com',
    'password': 'password',
    'providerId': 'password'
  };
  app.getExternalAuth().currentUser.assertLinkAndRetrieveDataWithCredential(
      [emailCredential],
      function() {
        app.getExternalAuth().setUser(expectedUser);
        // Make a copy of expected UserCredential to ensure
        // expectedUserCredential which is used to be compared with later will
        // not be modified.
        return goog.object.clone(expectedUserCredential);
      });
  app.getExternalAuth().process();
}


function testStartCreateUserWithEmailAndPassword__upgradeAnon_noUser_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate no user logged in on external instance.
  testAuth.setUser(null);
  var expectedUserCredential = {
    'user': expectedUser,
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'password', 'isNewUser': true}
  };
  app.startCreateUserWithEmailAndPassword('user@example.com', 'password')
      .then(function(userCredential) {
        assertObjectEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // createUserWithEmailAndPassword called on internal Auth instance as no user
  // available.
  app.getAuth().assertCreateUserWithEmailAndPassword(
      ['user@example.com', 'password'],
      function() {
        app.getAuth().setUser(expectedUser);
        // Make a copy of expected UserCredential to ensure
        // expectedUserCredential which is used to be compared with later will
        // not be modified.
        return goog.object.clone(expectedUserCredential);
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartCreateUserWithEmailAndPassword_upgradeAnon_emailInUseError() {
  var emailCredential = {
    'email': 'user@example.com',
    'password': 'password',
    'providerId': 'password'
  };
  // Expected email already in use error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'message': 'MESSAGE'
  };
  // Record calls to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startCreateUserWithEmailAndPassword('user@example.com', 'password')
      .then(fail, function(error) {
        // onUpgradeError should not be called.
        assertEquals(
            0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkAndRetrieveDataWithCredential called on external anonymous user and
  // throws expected error.
  app.getExternalAuth().currentUser.assertLinkAndRetrieveDataWithCredential(
      [emailCredential],
      null,
      expectedError);
  app.getExternalAuth().process();
}


function testStartCreateUserWithEmailAndPassword_upgradeAnon_nonAnon_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate non-anonymous user logged in on external instance.
  testAuth.setUser(expectedUser);
  var expectedUserCredential = {
    'user': expectedUser,
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'password', 'isNewUser': true}
  };
  app.startCreateUserWithEmailAndPassword('user@example.com', 'password')
      .then(function(userCredential) {
        assertObjectEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().assertCreateUserWithEmailAndPassword(
      ['user@example.com', 'password'],
      function() {
        app.getAuth().setUser(expectedUser);
        // Make a copy of expected UserCredential to ensure
        // expectedUserCredential which is used to be compared with later will
        // not be modified.
        return goog.object.clone(expectedUserCredential);
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithCredential_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithCredential(expectedCredential)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInAndRetrieveDataWithCredential(
      [expectedCredential],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithCredential_error() {
  var expectedError = {
    'code': 'auth/network-request-failed',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithCredential(expectedCredential)
      .then(fail, function(error) {
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInAndRetrieveDataWithCredential(
      [expectedCredential],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithCredential_upgradeAnonymous_isAnonymous_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithCredential(expectedCredential)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkAndRetrieveDataWithCredential called on external anonymous user.
  app.getExternalAuth().currentUser.assertLinkAndRetrieveDataWithCredential(
      [expectedCredential],
      function() {
        app.getExternalAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithCredential_upgradeAnonymous_nonAnonymous_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithCredential(expectedCredential)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Simulate non-anonymous user logged in on external instance.
  testAuth.setUser(expectedUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // signInAndRetrieveDataWithCredential called on internal Auth instance as no
  // anonymous user available.
  app.getAuth().assertSignInAndRetrieveDataWithCredential(
      [expectedCredential],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithCredential_upgradeAnonymous_noUser_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithCredential(expectedCredential)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Simulate no user logged in on external instance.
  testAuth.setUser(null);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // signInAndRetrieveDataWithCredential called on internal Auth instance as no
  // user available.
  app.getAuth().assertSignInAndRetrieveDataWithCredential(
      [expectedCredential],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithCredential_upgradeAnonymous_emailInUseError() {
  // Expected email already in use error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record calls to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        throw error;
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithCredential(expectedCredential)
      .then(fail, function(error) {
        // onUpgradeError should not be called.
        assertEquals(
            0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkAndRetrieveDataWithCredential called on external anonymous user and
  // throws expected error.
  app.getExternalAuth().currentUser.assertLinkAndRetrieveDataWithCredential(
      [expectedCredential],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithCredential_upgradeAnonymous_credentialInUseError() {
  // Expected credential already in use error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record call to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        throw error;
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithCredential(expectedCredential)
      .then(fail, function(error) {
        // onUpgradeError should be called.
        assertEquals(
            1, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(
            error,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(0));
        // Expected credential passed as second parameter to onUpgradeError.
        assertEquals(
            expectedCredential,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(1));
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkAndRetrieveDataWithCredential called on external anonymous user and
  // expected error thrown.
  app.getExternalAuth().currentUser.assertLinkAndRetrieveDataWithCredential(
      [expectedCredential],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPopup_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPopup(expectedProvider)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithPopup(
      [expectedProvider],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPopup_error() {
  var expectedError = {
    'code': 'auth/user-cancelled',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPopup(expectedProvider)
      .then(fail, function(error) {
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithPopup(
      [expectedProvider],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPopup_upgradeAnonymous_isAnonymous_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPopup(expectedProvider)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkWithPopup called on external anonymous user.
  app.getExternalAuth().currentUser.assertLinkWithPopup(
      [expectedProvider],
      function() {
        app.getExternalAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPopup_upgradeAnon_isAnon_pendingCred_success() {
  // Simulate eligible anonymous user upgrade with pending email credential
  // after email already exists error.
  // Typical flow:
  // 1. eligible anonymous user
  // 2. linkWithPopup -> email exists
  // 3. Save pending credential
  // 4. sign in with popup to existing account on internal instance.
  // 5. Get result from internal instance and clear credential after
  //    linking.
  // 6. sign out and pass credential for merge conflict handling.
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  // Save pending email credential.
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  // Set anonymous user on external instance.
  testAuth.setUser(anonymousUser);
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPopup(expectedProvider)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // As pending credential already exists, signInWithPopup triggered on internal
  // Auth instance.
  app.getAuth().assertSignInWithPopup(
      [expectedProvider],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPopup_upgradeAnonymous_nonAnonymous_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPopup(expectedProvider)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Simulate non-anonymous user logged in on external instance.
  testAuth.setUser(expectedUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // signInWithPopup called on internal Auth instance as no anonymous user
  // available.
  app.getAuth().assertSignInWithPopup(
      [expectedProvider],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPopup_upgradeAnonymous_noUser_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPopup(expectedProvider)
      .then(function(userCredential) {
        assertEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  // Simulate no user logged in on external instance.
  testAuth.setUser(null);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // signInWithPopup called on internal Auth instance as no user available.
  app.getAuth().assertSignInWithPopup(
      [expectedProvider],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPopup_upgradeAnonymous_emailAlreadyInUseError() {
  // Expected email already in use error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record calls to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPopup(expectedProvider)
      .then(fail, function(error) {
        // onUpgradeError should not be called.
        assertEquals(
            0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkWithPopup called on external anonymous user and throws expected error.
  app.getExternalAuth().currentUser.assertLinkWithPopup(
      [expectedProvider],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPopup_upgradeAnonymous_credentialInUseError() {
  // Expected credential already in use error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record call to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPopup(expectedProvider)
      .then(fail, function(error) {
        // onUpgradeError should be called.
        assertEquals(
            1, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(
            error,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(0));
        assertUndefined(
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(1));
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkWithPopup called on external anonymous user and expected error thrown.
  app.getExternalAuth().currentUser.assertLinkWithPopup(
      [expectedProvider],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithRedirect_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithRedirect(expectedProvider)
      .then(function() {
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithRedirect(
      [expectedProvider]);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithRedirect_error() {
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithRedirect(expectedProvider)
      .then(fail, function(error) {
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithRedirect(
      [expectedProvider],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithRedirect_upgradeAnonymous_isAnonymous_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithRedirect(expectedProvider)
      .then(function() {
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkWithRedirect called on external anonymous user.
  app.getExternalAuth().currentUser.assertLinkWithRedirect(
      [expectedProvider]);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithRedirect_upgradeAnon_isAnon_pendingCred_success() {
  // Simulate eligible anonymous user upgrade with pending email credential
  // after email already exists error.
  // Typical flow:
  // 1. eligible anonymous user
  // 2. linkWithRedirect -> email exists
  // 3. Save pending credential
  // 4. sign in with redirect to existing account on internal instance.
  // 5. Get result from internal instance and clear credential after
  //    linking.
  // 6. sign out and pass credential for merge conflict handling.
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  // Save pending email credential.
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  // Set anonymous user on external instance.
  testAuth.setUser(anonymousUser);
  asyncTestCase.waitForSignals(1);
  app.startSignInWithRedirect(expectedProvider)
      .then(function() {
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // As a pending credential exists, signInWithRedirect is triggered on the
  // internal Auth instance to sign in to the existing user before linking.
  app.getAuth().assertSignInWithRedirect(
      [expectedProvider]);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithRedirect_upgradeAnonymous_nonAnonymous_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithRedirect(expectedProvider)
      .then(function() {
        asyncTestCase.signal();
      });
  // Simulate non-anonymous user logged in on external instance.
  testAuth.setUser(expectedUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // signInWithRedirect called on internal Auth instance as no anonymous user
  // is available.
  app.getAuth().assertSignInWithRedirect(
      [expectedProvider]);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithRedirect_upgradeAnonymous_noUser_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithRedirect(expectedProvider)
      .then(function() {
        asyncTestCase.signal();
      });
  // Simulate no user logged in on external instance.
  testAuth.setUser(null);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // signInWithRedirect called on internal Auth instance as no user is
  // available.
  app.getAuth().assertSignInWithRedirect(
      [expectedProvider]);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithRedirect_upgradeAnonymous_error() {
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };
  // Record all calls to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithRedirect(expectedProvider)
      .then(fail, function(error) {
        // onUpgradeError not called.
        assertEquals(
            0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // linkWithRedirect called on external anonymous user and expected error
  // thrown.
  app.getExternalAuth().currentUser.assertLinkWithRedirect(
      [expectedProvider],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testStartSignInWithPhoneNumber_success() {
  var expectedPhoneNumber = '+11234567890';
  var expectedAppVerifier = {
    'type': 'recaptcha',
    'verify': function() {},
    'clear': function() {},
    'render': function() {}
  };
  var expectedConfirmationResult = {
    'verificationId': '1234567890',
    'confirm': function(code) {}
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPhoneNumber(expectedPhoneNumber, expectedAppVerifier)
      .then(function(phoneAuthResult) {
        assertEquals(expectedConfirmationResult,
                     phoneAuthResult.getConfirmationResult());
        asyncTestCase.signal();
      });
  app.getExternalAuth().assertSignInWithPhoneNumber(
      [expectedPhoneNumber, expectedAppVerifier],
      expectedConfirmationResult);
  app.getExternalAuth().process();
  app.getAuth().process();
}


function testStartSignInWithPhoneNumber_error() {
  var expectedError = {
    'code': 'auth/invalid-phone-number',
    'message': 'MESSAGE'
  };
  var expectedPhoneNumber = '+11234567890';
  var expectedAppVerifier = {
    'type': 'recaptcha',
    'verify': function() {},
    'clear': function() {},
    'render': function() {}
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPhoneNumber(expectedPhoneNumber, expectedAppVerifier)
      .then(fail, function(error) {
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getExternalAuth().assertSignInWithPhoneNumber(
      [expectedPhoneNumber, expectedAppVerifier],
      null,
      expectedError);
  app.getExternalAuth().process();
  app.getAuth().process();
}


function testStartSignInWithPhoneNumber_upgradeAnon_isAnonymous_success() {
  var expectedPhoneNumber = '+11234567890';
  var expectedAppVerifier = {
    'type': 'recaptcha',
    'verify': function() {},
    'clear': function() {},
    'render': function() {}
  };
  var expectedConfirmationResult = {
    'verificationId': '1234567890',
    'confirm': function(code) {}
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPhoneNumber(expectedPhoneNumber, expectedAppVerifier)
      .then(function(phoneAuthResult) {
        assertEquals(expectedConfirmationResult,
                     phoneAuthResult.getConfirmationResult());
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getExternalAuth().currentUser.assertLinkWithPhoneNumber(
      [expectedPhoneNumber, expectedAppVerifier],
      expectedConfirmationResult);
  app.getExternalAuth().process();
}


function testStartSignInWithPhoneNumber_upgradeAnon_isAnon_credInUseError() {
  var expectedPhoneNumber = '+11234567890';
  var expectedAppVerifier = {
    'type': 'recaptcha',
    'verify': function() {},
    'clear': function() {},
    'render': function() {}
  };
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
  var expectedConfirmationResult = {
    'verificationId': '1234567890',
    'confirm': function(code) {
      assertEquals('123456', code);
      return goog.Promise.reject(expectedError);
    }
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPhoneNumber(expectedPhoneNumber, expectedAppVerifier)
      .then(function(phoneAuthResult) {
        assertEquals(expectedConfirmationResult,
                     phoneAuthResult.getConfirmationResult());
        return phoneAuthResult.confirm('123456').thenCatch(function(error) {
          assertEquals(1,
              firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
          assertEquals(
              error,
              firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                  .getArgument(0));
          assertUndefined(
              firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                  .getArgument(1));
          assertEquals(expectedError, error);
          asyncTestCase.signal();
        });
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getExternalAuth().currentUser.assertLinkWithPhoneNumber(
      [expectedPhoneNumber, expectedAppVerifier],
      expectedConfirmationResult);
  app.getExternalAuth().process();
}


function testStartSignInWithPhoneNumber_upgradeAnon_isAnon_invalidCodeError() {
  var expectedPhoneNumber = '+11234567890';
  var expectedAppVerifier = {
    'type': 'recaptcha',
    'verify': function() {},
    'clear': function() {},
    'render': function() {}
  };
  var expectedError = {
    'code': 'auth/invalid-verification-code',
    'message': 'MESSAGE',
  };
  var expectedConfirmationResult = {
    'verificationId': '1234567890',
    'confirm': function(code) {
      assertEquals('123456', code);
      return goog.Promise.reject(expectedError);
    }
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPhoneNumber(expectedPhoneNumber, expectedAppVerifier)
      .then(function(phoneAuthResult) {
        assertEquals(expectedConfirmationResult,
                     phoneAuthResult.getConfirmationResult());
        return phoneAuthResult.confirm('123456').thenCatch(function(error) {
          assertEquals(0,
              firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
          assertEquals(expectedError, error);
          asyncTestCase.signal();
        });
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getExternalAuth().currentUser.assertLinkWithPhoneNumber(
      [expectedPhoneNumber, expectedAppVerifier],
      expectedConfirmationResult);
  app.getExternalAuth().process();
}


function testStartSignInWithPhoneNumber_upgradeAnon_isAnon_invalidNumError() {
  var expectedError = {
    'code': 'auth/invalid-phone-number',
    'message': 'MESSAGE'
  };
  var expectedPhoneNumber = '+11234567890';
  var expectedAppVerifier = {
    'type': 'recaptcha',
    'verify': function() {},
    'clear': function() {},
    'render': function() {}
  };
  // Record calls to onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPhoneNumber(expectedPhoneNumber, expectedAppVerifier)
      .then(fail, function(error) {
        // onUpgradeError should not be called even though invalid phone number
        // error thrown.
        assertEquals(
            0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getExternalAuth().currentUser.assertLinkWithPhoneNumber(
      [expectedPhoneNumber, expectedAppVerifier],
      null,
      expectedError);
  app.getExternalAuth().process();
}


function testStartSignInWithPhoneNumber_upgradeAnon_nonAnon_success() {
  var expectedPhoneNumber = '+11234567890';
  var expectedAppVerifier = {
    'type': 'recaptcha',
    'verify': function() {},
    'clear': function() {},
    'render': function() {}
  };
  var expectedConfirmationResult = {
    'verificationId': '1234567890',
    'confirm': function(code) {}
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPhoneNumber(expectedPhoneNumber, expectedAppVerifier)
      .then(function(phoneAuthResult) {
        assertEquals(expectedConfirmationResult,
                     phoneAuthResult.getConfirmationResult());
        asyncTestCase.signal();
      });
  // Simulate non-anonymous user logged in on external instance.
  testAuth.setUser(expectedUser);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getExternalAuth().assertSignInWithPhoneNumber(
      [expectedPhoneNumber, expectedAppVerifier],
      expectedConfirmationResult);
  app.getExternalAuth().process();
}


function testStartSignInWithPhoneNumber_upgradeAnonymous_noUser_success() {
  var expectedPhoneNumber = '+11234567890';
  var expectedAppVerifier = {
    'type': 'recaptcha',
    'verify': function() {},
    'clear': function() {},
    'render': function() {}
  };
  var expectedConfirmationResult = {
    'verificationId': '1234567890',
    'confirm': function(code) {}
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.startSignInWithPhoneNumber(expectedPhoneNumber, expectedAppVerifier)
      .then(function(phoneAuthResult) {
        assertEquals(expectedConfirmationResult,
                     phoneAuthResult.getConfirmationResult());
        asyncTestCase.signal();
      });
  // Simulate no user logged in on external instance.
  testAuth.setUser(null);
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getExternalAuth().assertSignInWithPhoneNumber(
      [expectedPhoneNumber, expectedAppVerifier],
      expectedConfirmationResult);
  app.getExternalAuth().process();
  app.getAuth().process();
}


function testFinishSignInWithCredential_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  app.finishSignInWithCredential(expectedCredential)
      .then(function(user) {
        assertNull(app.getAuth().currentUser);
        assertEquals(app.getExternalAuth().currentUser, user);
        asyncTestCase.signal();
      });
  app.getAuth().process().then(function() {
    // Sign out on internal instance first.
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertSignInWithCredential(
        [expectedCredential],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          return app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInWithCredential_error() {
  var expectedError = {
    'code': 'auth/network-request-failed',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  app.finishSignInWithCredential(expectedCredential)
      .then(fail, function(error) {
        assertNull(app.getAuth().currentUser);
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertSignInWithCredential(
        [expectedCredential],
        null,
        expectedError);
    return app.getExternalAuth().process();
  });
}


function testFinishSignInWithCredential_updateCurrentUser_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  app.finishSignInWithCredential(expectedCredential, expectedUser)
      .then(function(user) {
        assertNull(app.getAuth().currentUser);
        assertEquals(app.getExternalAuth().currentUser, user);
        asyncTestCase.signal();
      });
  app.getAuth().process().then(function() {
    // Sign out on internal instance first.
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertUpdateCurrentUser(
        [expectedUser],
        function() {
          app.getExternalAuth().setUser(expectedUser);
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInWithCredential_updateCurrentUser_error() {
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  app.finishSignInWithCredential(expectedCredential, expectedUser)
      .then(fail, function(error) {
        assertNull(app.getAuth().currentUser);
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().process().then(function() {
    // Sign out on internal instance first.
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertUpdateCurrentUser(
        [expectedUser],
        null,
        expectedError);
    return app.getExternalAuth().process();
  });
}


function testFinishSignInWithCredential_upgradeAnonymous_nonAnonymous() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate non-anonymous user already logged in on external instance.
  testAuth.setUser(expectedUser);
  // No underlying Auth call needed.
  app.finishSignInWithCredential(expectedCredential)
      .then(function(user) {
        assertEquals(app.getExternalAuth().currentUser, user);
        // Call again and confirm no onAuthStateChanged listener set again.
        // This should resolve with triggering runAuthChangeHandler.
        app.finishSignInWithCredential(expectedCredential).then(function(user) {
          assertEquals(app.getExternalAuth().currentUser, user);
          // Reset app.
          app.reset();
          // Reset should cause onAuthStateChanged to unsubscribe.
          app.finishSignInWithCredential(expectedCredential)
              .then(function(user) {
                assertEquals(app.getExternalAuth().currentUser, user);
                // Reset app.
                app.reset();
                // This should fail due to reset call and onAuthStateChanged
                // should unsubscribe.
                app.finishSignInWithCredential(expectedCredential)
                    .then(fail, function(error) {
                      assertEquals('cancel', error['name']);
                      asyncTestCase.signal();
                    });
                app.reset();
              });
          // Trigger initial onAuthStateChanged listener for new listener to
          // resolve after reset.
          app.getExternalAuth().runAuthChangeHandler();
        });
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getExternalAuth().process();
  app.getAuth().process().then(function() {
    // Sign out on internal instance.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // Assert signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
   // Sign out on internal instance.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // Second signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    /// Sign out on internal instance.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // Third signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testFinishSignInWithCredential_upgradeAnon_nonAnonUserOnTempAuth() {
  // If there is a user signed in on internal instance, finish the sign in flow
  // by signing it on external instance.
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  var userOnExternalInstance = {
    'email': 'user2@example.com',
    'displayName': 'Federated User2'
  };
  // Simulate a user already logged in on external instance.
  testAuth.setUser(userOnExternalInstance);
  // Simulate another user already logged in on internal instance.
  app.getAuth().setUser(expectedUser);
  var userOnInternalInstance = app.getAuth().currentUser;
  app.finishSignInWithCredential(expectedCredential)
      .then(function(user) {
        // User on internal instance should be signed out.
        assertNull(app.getAuth().currentUser);
        // The user returned should be the one originally signed in on internal
        // instance.
        assertObjectEquals(userOnInternalInstance, user);
        assertEquals(app.getExternalAuth().currentUser, user);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertSignInWithCredential(
        [expectedCredential],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          return app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInWithCredential_upgradeAnonymous_noUser() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  // No user signed in.
  app.getExternalAuth().setUser(null);
  app.finishSignInWithCredential(expectedCredential)
      .then(function(user) {
        assertNull(app.getAuth().currentUser);
        assertEquals(app.getExternalAuth().currentUser, user);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    // signInWithCredential called as no user available.
    app.getExternalAuth().assertSignInWithCredential(
        [expectedCredential],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          return app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInWithCredential_upgradeAnonymous_anonymousUser() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user signed in on external instance.
  app.getExternalAuth().setUser(anonymousUser);
  app.finishSignInWithCredential(expectedCredential)
      .then(function(user) {
        assertEquals(app.getExternalAuth().currentUser, user);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // linkWithCredential called on external user since an anonymous user is
    // available and autoUpgradeAnonymousUsers is set to true.
    app.getExternalAuth().currentUser.assertLinkWithCredential(
        [expectedCredential],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          return app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInWithCredential_upgradeAnon_anonUser_credInUse() {
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user signed in on external instance.
  app.getExternalAuth().setUser(anonymousUser);
  app.finishSignInWithCredential(expectedCredential)
      .then(fail, function(error) {
        // onUpgradeError should be called with expected arguments.
        assertEquals(
            1, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(
            error,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(0));
        assertEquals(
            expectedCredential,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(1));
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // linknWithCredential called since an eligible anonymous user is available
    // on external Auth instance.
    app.getExternalAuth().currentUser.assertLinkWithCredential(
        [expectedCredential],
        null,
        expectedError);
    return app.getExternalAuth().process();
  });
}


function testFinishSignInWithCredential_upgradeAnon_anonUser_emailInUse() {
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user signed in on external instance.
  app.getExternalAuth().setUser(anonymousUser);
  app.finishSignInWithCredential(expectedCredential)
      .then(fail, function(error) {
        // onUpgradeError should not be called. email-already-in-use error
        // should be processed in handlers to trigger the account linking flow.
        assertEquals(
            0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // linknWithCredential called since an eligible anonymous user is available
    // on external Auth instance.
    app.getExternalAuth().currentUser.assertLinkWithCredential(
        [expectedCredential],
        null,
        expectedError);
    return app.getExternalAuth().process();
  });
}


function testFinishSignInAndRetrieveDataWithAuthResult_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': {
      'profile': {
        'kind': 'plus#person',
        'displayName': 'John Doe',
        'name': {
          'givenName': 'John',
          'familyName': 'Doe'
        }
      },
      'providerId': 'google.com',
      'isNewUser': true
    }
  };
  var expectedAuthResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': {
      'profile': {
        'kind': 'plus#person',
        'displayName': 'John Doe',
        'name': {
          'givenName': 'John',
          'familyName': 'Doe'
        }
      },
      'providerId': 'google.com',
      'isNewUser': true
    }
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(function(result) {
        assertNull(app.getAuth().currentUser);
        assertObjectEquals(expectedAuthResult, result);
        asyncTestCase.signal();
      });
  app.getAuth().process().then(function() {
    // Sign out on internal instance first.
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertUpdateCurrentUser(
        [expectedUser],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          expectedAuthResult['user'] = app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInAndRetrieveDataWithAuthResult_passwordCred_success() {
  var passwordCred = firebase.auth.EmailAuthProvider.credential(
      expectedUser.email, 'password');
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  var authResult = {
    'user': expectedUser,
    'credential': passwordCred,
    'operationType': 'signIn',
    'additionalUserInfo': {
      'providerId': 'password',
      'isNewUser': false
    }
  };
  var expectedAuthResult = {
    'user': expectedUser,
    // No credential returned.
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo': {
      'providerId': 'password',
      'isNewUser': false
    }
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(function(result) {
        assertNull(app.getAuth().currentUser);
        assertObjectEquals(expectedAuthResult, result);
        asyncTestCase.signal();
      });
  app.getAuth().process().then(function() {
    // Sign out on internal instance first.
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertUpdateCurrentUser(
        [expectedUser],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          expectedAuthResult['user'] = app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInAndRetrieveDataWithAuthResult_federatedLinking() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'link',
    'additionalUserInfo': {
      'profile': {
        'kind': 'plus#person',
        'displayName': 'John Doe',
        'name': {
          'givenName': 'John',
          'familyName': 'Doe'
        }
      },
      'providerId': 'google.com',
      'isNewUser': false
    }
  };
  var expectedAuthResult = {
    'user': expectedUser,
    'credential': expectedCredential,
     // OperationType should still be signIn for linking flows.
    'operationType': 'signIn',
    'additionalUserInfo': {
      'profile': {
        'kind': 'plus#person',
        'displayName': 'John Doe',
        'name': {
          'givenName': 'John',
          'familyName': 'Doe'
        }
      },
      'providerId': 'google.com',
      'isNewUser': false
    }
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(function(result) {
        assertNull(app.getAuth().currentUser);
        assertObjectEquals(expectedAuthResult, result);
        asyncTestCase.signal();
      });
  app.getAuth().process().then(function() {
    // Sign out on internal instance first.
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertUpdateCurrentUser(
        [expectedUser],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          expectedAuthResult['user'] = app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInAndRetrieveDataWithAuthResult_error() {
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(fail, function(error) {
        assertNull(app.getAuth().currentUser);
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertUpdateCurrentUser(
        [expectedUser],
        null,
        expectedError);
    return app.getExternalAuth().process();
  });
}


function testFinishSignInAndRetrieveDataWithAuthResult_upgradeAnon_nonAnon() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate non-anonymous user already logged in on external instance.
  testAuth.setUser(expectedUser);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'link',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  var expectedAuthResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    // OperationType should be link for anonymous upgrade flows.
    'operationType': 'link',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  // No underlying Auth call needed.
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(function(result) {
        assertObjectEquals(expectedAuthResult, result);
        // Call again and confirm no onAuthStateChanged listener set again.
        // This should resolve with triggering runAuthChangeHandler.
        app.finishSignInAndRetrieveDataWithAuthResult(authResult)
            .then(function(result) {
              assertObjectEquals(expectedAuthResult, result);
              // Reset app.
              app.reset();
              // Reset should cause onAuthStateChanged to unsubscribe.
              app.finishSignInAndRetrieveDataWithAuthResult(authResult)
                  .then(function(result) {
                    assertObjectEquals(expectedAuthResult, result);
                    // Reset app.
                    app.reset();
                    // This should fail due to reset call and onAuthStateChanged
                    // should unsubscribe.
                    app.finishSignInAndRetrieveDataWithAuthResult(authResult)
                        .then(fail, function(error) {
                          assertEquals('cancel', error['name']);
                          asyncTestCase.signal();
                        });
                    app.reset();
                  });
              // Trigger initial onAuthStateChanged listener for new listener to
              // resolve after reset.
              app.getExternalAuth().runAuthChangeHandler();
            });
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getExternalAuth().process();
  app.getAuth().process().then(function() {
    // Sign out on internal instance.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // Assert signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
   // Sign out on internal instance.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // Second signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    /// Sign out on internal instance.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // Third signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testFinishSignInAndRetrieveDataWithAuthResult_nonAnonUserOnTempAuth() {
  // If there is a user signed in on internal instance, finish the sign in flow
  // by signing it on external instance.
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  var userOnExternalInstance = {
    'email': 'user2@example.com',
    'displayName': 'Federated User2'
  };
  // Simulate a user already logged in on external instance.
  testAuth.setUser(userOnExternalInstance);
  // Simulate another user already logged in on internal instance.
  app.getAuth().setUser(expectedUser);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  var expectedAuthResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(function(result) {
        assertNull(app.getAuth().currentUser);
        // The AuthResult returned should be same as the one originally returned
        // signing in on internal instance.
        assertObjectEquals(expectedAuthResult, result);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    app.getExternalAuth().assertUpdateCurrentUser(
        [expectedUser],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          expectedAuthResult['user'] = app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInAndRetrieveDataWithAuthResult_upgradeAnon_noUser() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  app.getAuth().setUser(expectedUser);
  asyncTestCase.waitForSignals(1);
  // No user signed in.
  app.getExternalAuth().setUser(null);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  var expectedAuthResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(function(result) {
        assertNull(app.getAuth().currentUser);
        assertObjectEquals(expectedAuthResult, result);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut(
        [],
        function() {
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    // updateCurrentUser (sign in flow instead of linking flow) called as no
    // user available.
    app.getExternalAuth().assertUpdateCurrentUser(
        [expectedUser],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          expectedAuthResult['user'] = app.getExternalAuth().currentUser;
        });
    return app.getExternalAuth().process();
  });
}


function testFinishSignInAndRetrieveDataWithAuthResult_upgradeAnon_anonUser() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user signed in on external instance.
  app.getExternalAuth().setUser(anonymousUser);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  var expectedLinkUserCredential = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'link',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  var expectedAuthResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'link',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(function(result) {
        assertObjectEquals(expectedAuthResult, result);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // linkAndRetrieveDataWithCredential called on external user since an
    // anonymous user is available and autoUpgradeAnonymousUsers is set to true.
    app.getExternalAuth().currentUser.assertLinkAndRetrieveDataWithCredential(
        [expectedCredential],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          return expectedLinkUserCredential;
        });
    return app.getExternalAuth().process();
  });
}


function testfinishSignInAndRetrieveDataWithAuthResult_upgradeAnon_credInUse() {
  // Test case for email mismatch flow while anonymous upgrade is enabled.
  // Linking federated account to anonymous account would always throw
  // credential in use error since the credential has been used to sign in once
  // earlier. onUpgradeError will be triggered.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user signed in on external instance.
  app.getExternalAuth().setUser(anonymousUser);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(fail, function(error) {
        // onUpgradeError should be called with expected arguments.
        assertEquals(
            1, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(
            error,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(0));
        assertEquals(
            expectedCredential,
            firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
                .getArgument(1));
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // linkAndRetrieveDataWithCredential called since an eligible anonymous
    // user is available on external Auth instance.
    app.getExternalAuth().currentUser.assertLinkAndRetrieveDataWithCredential(
        [expectedCredential],
        null,
        expectedError);
    return app.getExternalAuth().process();
  });
}


function testfinishSignInAndRetrieveDataWithAuthResult_upgrdAnon_emailInUse() {
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user signed in on external instance.
  app.getExternalAuth().setUser(anonymousUser);
  var authResult = {
    'user': expectedUser,
    'credential': expectedCredential,
    'operationType': 'signIn',
    'additionalUserInfo': expectedAdditionalUserInfo
  };
  app.finishSignInAndRetrieveDataWithAuthResult(authResult)
      .then(fail, function(error) {
        // onUpgradeError should not be called. email-already-in-use error
        // should be processed in handlers to trigger the account linking flow.
        assertEquals(
            0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  }).then(function() {
    // linkAndRetrieveDataWithCredential called since an eligible anonymous
    // user is available on external Auth instance.
    app.getExternalAuth().currentUser.assertLinkAndRetrieveDataWithCredential(
        [expectedCredential],
        null,
        expectedError);
    return app.getExternalAuth().process();
  });
}


function testSignInWithExistingEmailAndPasswordForLinking_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  var expectedUserCredential = {
    'user': expectedUser,
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
  };
  app.signInWithExistingEmailAndPasswordForLinking(
      'user@example.com', 'password')
      .then(function(userCredential) {
        assertObjectEquals(expectedUserCredential, userCredential);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithEmailAndPassword(
      ['user@example.com', 'password'],
      function() {
        app.getAuth().setUser(expectedUser);
        // Make a copy of expected UserCredential to ensure
        // expectedUserCredential which is used to be compared with later will
        // not be modified.
        return goog.object.clone(expectedUserCredential);
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testSignInWithExistingEmailAndPasswordForLinking_error() {
  var expectedError = {
    'code': 'auth/wrong-password',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.signInWithExistingEmailAndPasswordForLinking(
      'user@example.com', 'password')
      .then(fail, function(error) {
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignInWithEmailAndPassword(
      ['user@example.com', 'password'],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testClearTempAuthState_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.clearTempAuthState()
      .then(function() {
        asyncTestCase.signal();
      });
  app.getAuth().assertSignOut(
      []);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testClearTempAuthState_error() {
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.clearTempAuthState()
      .then(fail, function(error) {
        assertEquals(expectedError, error);
        asyncTestCase.signal();
      });
  app.getAuth().assertSignOut(
      [],
      null,
      expectedError);
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testGetRedirectResult_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.getRedirectResult().then(function(result) {
    assertEquals(expectedUserCredential, result);
    app.reset();
    // Null result should be set after reset and no underlying Auth call should
    // be made.
    app.getRedirectResult().then(function(result) {
      assertNull(result.user);
      asyncTestCase.signal();
    });
  });
  // getRedirectResult called on internal instance.
  app.getAuth().assertGetRedirectResult(
      [],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process().then(function() {
    // signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testGetRedirectResult_caching_signInFlow() {
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // First call to getRedirectResult resolves with underlying
  // auth.getRedirectResult.
  app.getRedirectResult().then(function(result) {
    assertEquals(expectedUserCredential, result);
    app.reset();
    // Null result should be set after reset and no underlying Auth call should
    // be made.
    return app.getRedirectResult();
  }).then(function(result) {
    assertNull(result.user);
    // Simulate error on signInWithRedirect.
    return app.startSignInWithRedirect(expectedProvider)
        .then(fail, function(error) {
          assertEquals(expectedError, error);
          // This should still resolve to null since an error occurred on
          // signInWithRedirect.
          return app.getRedirectResult();
        });
  }).then(function(result) {
    assertNull(result.user);
    // Simulate successful signInWithRedirect.
    return app.startSignInWithRedirect(expectedProvider);
  }).then(function() {
    // getRedirectResult should no longer return the cached result.
    return app.getRedirectResult();
  }).then(function(result) {
    assertEquals(expectedUserCredential, result);
    asyncTestCase.signal();
  });

  // getRedirectResult called on internal instance.
  app.getAuth().assertGetRedirectResult(
      [],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process().then(function() {
    // signOut on reset.
    app.getAuth().assertSignOut(
        [],
        function() {
          // User would be set to null on temp Auth.
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    // First call to signInWithRedirect throws an error.
    app.getAuth().assertSignInWithRedirect(
        [expectedProvider],
        null,
        expectedError);
    return app.getAuth().process();
  }).then(function() {
    // Second call to signInWithRedirect succeeds.
    app.getAuth().assertSignInWithRedirect([expectedProvider]);
    return app.getAuth().process();
  }).then(function() {
    // Underlying auth.getRedirectResult should overwrite cached app
    // getRedirectResult.
    app.getAuth().assertGetRedirectResult(
        [],
        function() {
          app.getAuth().setUser(expectedUser);
          return expectedUserCredential;
        });
    return app.getAuth().process();
  });
}


function testGetRedirectResult_caching_anonymousUpgradeFlow() {
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };

  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user logged in on external instance.
  testAuth.setUser(anonymousUser);
  // First call to getRedirectResult resolves with underlying
  // auth.getRedirectResult.
  app.getRedirectResult().then(function(result) {
    assertEquals(expectedUserCredential, result);
    app.reset();
    // Simulate old user signed out and anonymous user signed in.
    testAuth.setUser(anonymousUser);
    // Null result should be set after reset and no underlying Auth call should
    // be made.
    return app.getRedirectResult();
  }).then(function(result) {
    assertNull(result.user);
    // Simulate error on signInWithRedirect.
    var p = app.startSignInWithRedirect(expectedProvider);
    // Trigger onAuthStateChanged listener again since reset was called.
    // This is needed for underlying linkWithRedirect to run.
    app.getExternalAuth().runAuthChangeHandler();
    return p.then(fail, function(error) {
      assertEquals(expectedError, error);
      // This should still resolve to null since an error occurred on
      // linkWithRedirect.
      return app.getRedirectResult();
    });
  }).then(function(result) {
    assertNull(result.user);
    // Simulate successful signInWithRedirect.
    return app.startSignInWithRedirect(expectedProvider);
  }).then(function() {
    // getRedirectResult should no longer return the cached result.
    return app.getRedirectResult();
  }).then(function(result) {
    assertEquals(expectedUserCredential, result);
    asyncTestCase.signal();
  });

  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // getRedirectResult called on internal instance.
  app.getExternalAuth().assertGetRedirectResult(
      [],
      function() {
        app.getExternalAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getExternalAuth().process().then(function() {
    // signOut on reset.
    app.getAuth().assertSignOut(
        [],
        function() {
          // User would be set to null on temp Auth.
          app.getAuth().setUser(null);
        });
    return app.getAuth().process();
  }).then(function() {
    // First call to linkWithRedirect fails.
    app.getExternalAuth().currentUser.assertLinkWithRedirect(
        [expectedProvider],
        null,
        expectedError);
    return app.getExternalAuth().process();
  }).then(function() {
    return goog.Promise.resolve();
  }).then(function() {
    // Second call to linkWithRedirect succeeds.
    app.getExternalAuth().currentUser.assertLinkWithRedirect(
        [expectedProvider]);
    return app.getExternalAuth().process();
  }).then(function() {
    // Underlying auth.getRedirectResult should overwrite cached app
    // getRedirectResult.
    app.getExternalAuth().assertGetRedirectResult(
        [],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          return expectedUserCredential;
        });
    return app.getExternalAuth().process();
  });
}


function testGetRedirectResult_error() {
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  app.getRedirectResult().then(fail, function(error) {
    assertEquals(expectedError, error);
    app.reset();
    // Null result should be set after reset and no underlying Auth call should
    // be made.
    app.getRedirectResult().then(function(result) {
      assertNull(result.user);
      asyncTestCase.signal();
    });
  });
  // getRedirectResult called on internal instance and expected error thrown.
  app.getAuth().assertGetRedirectResult(
      [],
      null,
      expectedError);
  app.getAuth().process().then(function() {
    // signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testGetRedirectResult_upgradeAnonymous_success() {
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user upgraded successfully.
  testAuth.setUser(expectedUser);
  app.getRedirectResult().then(function(result) {
    assertEquals(expectedUserCredential, result);
    app.reset();
    // Null result should be set after reset and no underlying Auth call should
    // be made.
    app.getRedirectResult().then(function(result) {
      assertNull(result.user);
      asyncTestCase.signal();
    });
  });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // getRedirectResult called on internal instance first.
  app.getAuth().assertGetRedirectResult(
      [],
      {
        'user': null,
        'credential': null
      });
  app.getAuth().process().then(function() {
    // getRedirectResult called on external instance after no result found.
    app.getExternalAuth().assertGetRedirectResult(
        [],
        function() {
          app.getExternalAuth().setUser(expectedUser);
          return expectedUserCredential;
        });
    return app.getExternalAuth().process();
  }).then(function() {
    // signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testGetRedirectResult_upgradeAnonymous_isAnon_pendingCred_success() {
  // Simulate eligible anonymous user upgrade with pending email credential
  // after email already exists error.
  // Typical flow:
  // 1. eligible anonymous user
  // 2. linkWithRedirect -> email exists
  // 3. Save pending credential
  // 4. sign in with redirect to existing account on internal instance.
  // 5. Get redirect result from internal instance and clear credential after
  //    linking.
  // 6. sign out and pass credential for merge conflict handling.
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  // Save pending email credential.
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, 'id0');
  app.getAuth().install();
  app.getExternalAuth().install();
  // Set anonymous user on external instance.
  testAuth.setUser(anonymousUser);
  asyncTestCase.waitForSignals(1);
  app.getRedirectResult().then(function(result) {
    assertEquals(expectedUserCredential, result);
    app.reset();
    // Null result should be set after reset and no underlying Auth call should
    // be made.
    app.getRedirectResult().then(function(result) {
      assertNull(result.user);
      asyncTestCase.signal();
    });
  });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // getRedirectResult called on internal instance as a pending credential is
  // detected.
  app.getAuth().assertGetRedirectResult(
      [],
      function() {
        app.getAuth().setUser(expectedUser);
        return expectedUserCredential;
      });
  app.getAuth().process().then(function() {
    // signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testGetRedirectResult_upgradeAnonymous_emailAlreadyInUseError() {
  // Tests anonymous user upgrade linkWithRedirect flow that fails with email
  // already in use error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user failed to upgrade.
  testAuth.setUser(anonymousUser);
  app.getRedirectResult().then(fail, function(error) {
    // onUpgradeError should not be called as the credential should be first
    // linked with the existing user before the upgrade error is thrown.
    assertEquals(
        0, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
    assertEquals(expectedError, error);
    app.reset();
    // Null result should be set after reset and no underlying Auth call should
    // be made.
    app.getRedirectResult().then(function(result) {
      assertNull(result.user);
      asyncTestCase.signal();
    });
  });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  // getRedirectResult called on external instance since an anonymous user
  // that is eligible for upgrade is detected (no pending credential is
  // detected).
  app.getExternalAuth().assertGetRedirectResult(
      [],
      null,
      expectedError);
  app.getExternalAuth().process().then(function() {
    // signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testGetRedirectResult_upgradeAnonymous_credentialAlreadyInUseError() {
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user failed to upgrade.
  testAuth.setUser(anonymousUser);
  app.getRedirectResult().then(fail, function(error) {
    // onUpgradeError should be called with expected arguments.
    assertEquals(
        1, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
    assertEquals(
        error,
        firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
            .getArgument(0));
    assertUndefined(
        firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
            .getArgument(1));
    assertEquals(expectedError, error);
    app.reset();
    // Null result should be set after reset and no underlying Auth call should
    // be made.
    app.getRedirectResult().then(function(result) {
      assertNull(result.user);
      asyncTestCase.signal();
    });
  });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    // getRedirectResult called on external instance since an anonymous user
    // that is eligible for upgrade is detected.
    app.getExternalAuth().assertGetRedirectResult(
        [],
        null,
        expectedError);
    return app.getExternalAuth().process();
  }).then(function() {
    // signOut on reset.
    app.getAuth().assertSignOut([]);
    return app.getAuth().process();
  });
}


function testGetRedirectResult_upgradeAnonymous_otherError() {
   var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };
  // Record calls on onUpgradeError.
  testStubs.replace(
      firebaseui.auth.AuthUI.prototype,
      'onUpgradeError',
      goog.testing.recordFunction(function(error) {
        return goog.Promise.reject(error);
      }));
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user failed to upgrade.
  testAuth.setUser(anonymousUser);
  app.getRedirectResult().then(fail, function(error) {
    // onUpgradeError should be called.
    assertEquals(
        1, firebaseui.auth.AuthUI.prototype.onUpgradeError.getCallCount());
    assertEquals(
        error,
        firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
            .getArgument(0));
    assertUndefined(
        firebaseui.auth.AuthUI.prototype.onUpgradeError.getLastCall()
            .getArgument(1));
    assertEquals(expectedError, error);
    asyncTestCase.signal();
  });
  // Trigger initial onAuthStateChanged listener.
  app.getExternalAuth().runAuthChangeHandler();
  app.getAuth().process().then(function() {
    // getRedirectResult called on external instance since anonymous user
    // that is eligible for upgrade is detected.
    app.getExternalAuth().assertGetRedirectResult(
        [],
        null,
        expectedError);
    app.getExternalAuth().process();
  });
}


function testOnUpgradeError_credentialAlreadyInUseError() {
  // User tries to sign in with an existing federated/phone number account which
  // will fail to upgrade.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'message': 'MESSAGE',
    'email': expectedUser['email'],
    'credential': expectedCredential
  };
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      expectedCredential);
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  // Render some UI for testing.
  firebaseui.auth.widget.handler.handlePasswordSignIn(app, container1);

  asyncTestCase.waitForSignals(1);
  app.onUpgradeError(expectedError).thenCatch(function(error) {
    // Error funnelled through.
    assertEquals(expectedError, error);
    // Confirm current component is null.
    assertNull(app.getCurrentComponent());
    // Confirm UI cleared.
    assertEquals(0, container1.children.length);
    // Confirm signInFailure called with expected UI error.
    assertEquals(
        1, anonymousUpgradeConfig.callbacks.signInFailure.getCallCount());
    assertObjectEquals(
        expectedMergeError,
        anonymousUpgradeConfig.callbacks.signInFailure.getLastCall()
            .getArgument(0));
    asyncTestCase.signal();
  });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testOnUpgradeError_emailAlreadyInUseError() {
  // User tries to sign in with an existing email/password account which will
  // fail to upgrade.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'message': 'MESSAGE'
  };
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      expectedCredential);
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  // Render some UI for testing.
  firebaseui.auth.widget.handler.handlePasswordSignIn(app, container1);

  asyncTestCase.waitForSignals(1);
  app.onUpgradeError(expectedError, expectedCredential)
      .thenCatch(function(error) {
        // Error funnelled through.
        assertEquals(expectedError, error);
        // Confirm current component is null.
        assertNull(app.getCurrentComponent());
        // Confirm UI cleared.
        assertEquals(0, container1.children.length);
        // Confirm signInFailure called with expected UI error.
        assertEquals(
            1, anonymousUpgradeConfig.callbacks.signInFailure.getCallCount());
        assertObjectEquals(
            expectedMergeError,
            anonymousUpgradeConfig.callbacks.signInFailure.getLastCall()
                .getArgument(0));
        asyncTestCase.signal();
      });
  app.getAuth().process();
  app.getExternalAuth().process();
}


function testOnUpgradeError_otherError() {
  // All other errors should just pass through.
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'MESSAGE'
  };
  testApp = new firebaseui.auth.testing.FakeAppClient(options);
  testAuth = testApp.auth();
  app = new firebaseui.auth.AuthUI(testAuth, 'id0');
  // Simulate autoUpgradeAnonymousUsers set to true.
  app.setConfig(anonymousUpgradeConfig);
  app.getAuth().install();
  app.getExternalAuth().install();
  // Render some UI for testing.
  firebaseui.auth.widget.handler.handlePasswordSignIn(app, container1);

  asyncTestCase.waitForSignals(1);
  app.onUpgradeError(expectedError).thenCatch(function(error) {
    // Error funnelled through.
    assertEquals(expectedError, error);
    // Confirm current component is not null.
    assertNotNull(app.getCurrentComponent());
    // Confirm UI not cleared.
    assertEquals(1, container1.children.length);
    // Confirm signInFailure not called.
    assertEquals(
        0, anonymousUpgradeConfig.callbacks.signInFailure.getCallCount());
    asyncTestCase.signal();
  });
  app.getAuth().process();
  app.getExternalAuth().process();
}
