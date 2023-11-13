/*
 * Copyright 2019 Google Inc. All Rights Reserved.
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

/** @fileoverview Tests for firebaseuihandler.js */

goog.module('firebaseui.auth.FirebaseUiHandlerTest');
goog.setTestOnly();

const AuthUI = goog.require('firebaseui.auth.AuthUI');
const FakeAppClient = goog.require('firebaseui.auth.testing.FakeAppClient');
const FirebaseUiHandler = goog.require('firebaseui.auth.FirebaseUiHandler');
const GoogPromise = goog.require('goog.Promise');
const KeyCodes = goog.require('goog.events.KeyCodes');
const MockClock = goog.require('goog.testing.MockClock');
const PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
const RedirectStatus = goog.require('firebaseui.auth.RedirectStatus');
const TagName = goog.require('goog.dom.TagName');
const dataset = goog.require('goog.dom.dataset');
const dom = goog.require('goog.dom');
const forms = goog.require('goog.dom.forms');
const idp = goog.require('firebaseui.auth.idp');
const recordFunction = goog.require('goog.testing.recordFunction');
const storage = goog.require('firebaseui.auth.storage');
const strings = goog.require('firebaseui.auth.soy2.strings');
const testSuite = goog.require('goog.testing.testSuite');
const testingEvents = goog.require('goog.testing.events');
const userAgent = goog.require('goog.userAgent');

const testStubs = new PropertyReplacer();
const mockClock = new MockClock();
let container;
let configs;
let projectConfig;
let handler;
let auth;
let auth1;
let auth2;
let selectTenantUiShownCallback;
let selectTenantUiHiddenCallback;
let signInUiShownCallback;

/**
 * Asserts the progress bar is visible.
 * @param {!Element} container The html element container of the widget.
 */
function assertProgressBarVisible(container) {
  const elements =
      dom.getElementsByClass('firebaseui-id-page-spinner', container);
  assertEquals(1, elements.length);
}

/**
 * Asserts the callback page is in the dom but hidden.
 * @param {!Element} container The html element container of the widget.
 */
function assertCallbackPageDomHidden(container) {
  const element = dom.getElementByClass(
      'firebaseui-id-page-callback', container);
  assertNotNull(element);
  assertTrue(dom.classlist.contains(element, 'firebaseui-hidden'));
}

/**
 * Asserts the callback page is not in the dom.
 * @param {!Element} container The html element container of the widget.
 */
function assertCallbackPageHidden(container) {
  assertNull(dom.getElementByClass('firebaseui-id-page-callback', container));
}

/**
 * Asserts the blank page is visible.
 * @param {!Element} container The html element container of the widget.
 */
function assertBlankPageVisible(container) {
  assertNotNull(dom.getElementByClass('firebaseui-id-page-blank', container));
}

/**
 * Asserts the IdP or tenant button has correct labels.
 * @param {!Element} button The IdP or tenant button.
 * @param {string} expectedShortLabel The expected short label of the button.
 * @param {string} expectedLongLabel The expected long label of the button.
 */
function assertIdpButtonLabels(button, expectedShortLabel, expectedLongLabel) {
  const idpTextLong = dom.getElementsByClass(
    'firebaseui-idp-text-long', button);
  const idpTextShort = dom.getElementsByClass(
    'firebaseui-idp-text-short', button);

  assertEquals(
      expectedLongLabel,
      dom.getTextContent(idpTextLong[0]));
  assertEquals(
      expectedShortLabel,
      dom.getTextContent(idpTextShort[0]));
}

/**
 * Asserts the busy indicator is after a short delay.
 * @param {!Element} container The html element container of the widget.
 */
function delayForBusyIndicatorAndAssertIndicatorShown(container) {
  mockClock.tick(500);
  const element =
      dom.getElementByClass('firebaseui-id-busy-indicator', container);
  assertNotNull(element);
}

/**
 * Asserts the provider sign in page is displayed.
 * @param {!Element} container The html element container of the widget.
 */
function assertProviderSignInPageVisible(container) {
  const element = dom.getElementByClass(
      'firebaseui-id-page-provider-sign-in', container);
  assertNotNull(element);
}

/**
 * Asserts the progress bar is hidden.
 * @param {!Element} container The html element container of the widget.
 */
function assertProgressBarHidden(container) {
  const elements =
      dom.getElementsByClass('firebaseui-id-page-spinner', container);
  assertEquals(0, elements.length);
}

/**
 * Asserts the select tenant page is displayed.
 * @param {!Element} container The html element container of the widget.
 */
function assertSelectTenantPageVisible(container) {
  const element =
      dom.getElementByClass('firebaseui-id-page-select-tenant', container);
  assertNotNull(element);
}

/**
 * Asserts the select tenant page is hidden.
 * @param {!Element} container The html element container of the widget.
 */
function assertSelectTenantPageHidden(container) {
  const element =
      dom.getElementByClass('firebaseui-id-page-select-tenant', container);
  assertNull(element);
}

/**
 * Asserts the provider match by email page is displayed.
 * @param {!Element} container The html element container of the widget.
 */
function assertProviderMatchByEmailPageVisible(container) {
  const element = dom.getElementByClass(
      'firebaseui-id-page-provider-match-by-email', container);
  assertNotNull(element);
}

/**
 * Asserts the provider match by email page is hidden.
 * @param {!Element} container The html element container of the widget.
 */
function assertProviderMatchByEmailPageHidden(container) {
  const element = dom.getElementByClass(
      'firebaseui-id-page-provider-match-by-email', container);
  assertNull(element);
}

/**
 * Asserts the complete sign out page is displayed.
 * @param {!Element} container The html element container of the widget.
 */
function assertCompleteSignOutPageVisible(container) {
  const element =
      dom.getElementByClass('firebaseui-id-page-sign-out', container);
  assertNotNull(element);
}

/**
 * Asserts the complete sign out page is hidden.
 * @param {!Element} container The html element container of the widget.
 */
function assertCompleteSignOutPageHidden(container) {
  const element =
      dom.getElementByClass('firebaseui-id-page-sign-out', container);
  assertNull(element);
}

/**
 * Asserts the error page is visible and it contains the correct error message.
 * @param {!Element} container The html element container of the widget.
 * @param {string} message The error message.
 * @param {boolean} recoverable Whether the error is recoverable.
 */
function assertErrorPageVisible(container, message, recoverable) {
  const element = dom.getElementByClass(
      'firebaseui-id-page-recoverable-error', container);
  assertNotNull(element);
  const msgContainer = dom.getElementByClass('firebaseui-text', container);
  assertContains(message, dom.getTextContent(msgContainer));
  const retryButton = getRetryButton(container);
  if (recoverable) {
    assertNotNull(retryButton);
  } else {
    assertNull(retryButton);
  }
}

/**
 * Asserts the error page is hidden.
 * @param {!Element} container The html element container of the widget.
 */
function assertErrorPageHidden(container) {
  const element = dom.getElementByClass(
      'firebaseui-id-page-recoverable-error', container);
  assertNull(element);
}

/**
 * Asserts the info bar is displayed with the correct message.
 * @param {string} message The message displayed in info bar.
 * @param {!Element} container The html element container of the widget.
 */
function assertInfoBarMessage(message, container) {
  const element = dom.getElementByClass('firebaseui-id-info-bar', container);
  assertContains(message, dom.getTextContent(element));
}

/**
 * Asserts the email error is displayed with the correct message.
 * @param {string} message The email error message.
 * @param {!Element} container The html element container of the widget.
 */
function assertEmailErrorMessage(message, container) {
  const element = dom.getElementByClass('firebaseui-id-email-error', container);
  assertContains(message, dom.getTextContent(element));
}

/**
 * Returns the retry button element.
 * @param {!Element} container The html element container of the widget.
 * @return {?Element}
 */
function getRetryButton(container) {
  return dom.getElementByClass('firebaseui-id-submit', container);
}

/**
 * Returns mock CIAP error.
 * @param {string} code The error code.
 * @param {string} message The error message.
 * @param {function()=} retry The optional retry callback.
 * @return {!Error}
 */
function mockCIAPError(code, message, retry = undefined) {
  const error = new Error(message);
  error['code'] = code;
  error['retry'] = retry;
  return error;
}

testSuite({
  setUp() {
    mockClock.install();
    goog.global.firebase = {};
    const firebase = goog.global.firebase;
    firebase.instances_ = {};
    firebase.initializeApp = (options, name) => {
      // Throw an error if a FirebaseApp already exists for the specified name.
      const key = name || '[DEFAULT]';
      if (firebase.instances_[key]) {
        throw new Error(`An app instance already exists for ${key}`);
      } else {
        firebase.instances_[key] =
            new FakeAppClient(options, name);
      }
      const firebaseApp = firebase.instances_[key];
      // Make sure Auth instance is installed.
      firebaseApp.auth().install();
      return firebaseApp;
    };
    firebase.app = (name) => {
      const key = name || '[DEFAULT]';
      if (typeof firebase.instances_[key] === 'undefined') {
        throw new Error('app/no-app');
      }
      return firebase.instances_[key];
    };
    // On FirebaseApp deletion, confirm instance not already deleted and then
    // remove it from firebase.instances_.
    testStubs.replace(
        FakeAppClient.prototype,
        'delete',
        function() {
          // Already deleted.
          if (!firebase.instances_[this['name']]) {
            throw new Error(`Instance ${key} already deleted!`);
          }
          delete firebase.instances_[this['name']];
          return GoogPromise.resolve();
        });
    // Define firebase.auth.Auth.Persistence enum.
    firebase.auth = firebase.auth || {};
    firebase.auth.Auth = firebase.auth.Auth || {};
    firebase.auth.Auth.Persistence = firebase.auth.Auth.Persistence || {
      LOCAL: 'local',
      NONE: 'none',
      SESSION: 'session',
    };
    // Build mock auth providers.
    for (let key in idp.AuthProviders) {
      firebase['auth'][idp.AuthProviders[key]] = function() {
        this.scopes = [];
        this.customParameters = {};
      };
      firebase['auth'][idp.AuthProviders[key]].PROVIDER_ID = key;
      if (key != 'twitter.com' && key != 'password') {
        firebase['auth'][idp.AuthProviders[key]]
            .prototype.addScope = function(scope) {
          this.scopes.push(scope);
          return this;
        };
      }
      if (key != 'password') {
        // Record setCustomParameters for all OAuth providers.
        firebase['auth'][idp.AuthProviders[key]]
            .prototype.setCustomParameters = function(customParameters) {
          this.customParameters = customParameters;
          return this;
        };
      }
      if (key == 'password') {
        // Mock credential initializer for Email/password credentials.
        firebase['auth'][idp.AuthProviders[key]]['credential'] =
            (email, password) => ({
                'email': email,
                'password': password,
                'providerId': 'password',
              });
        firebase.auth.EmailAuthProvider.credentialWithLink =
            (email, link) => ({
            email: email,
            link: link,
            providerId: 'password',
            signInMethod: 'emailLink',
          });
        firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD = 'emailLink';
        firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD =
            'password';
      } else if (key == 'facebook.com') {
        // Mock credential initializer for Facebook credentials.
        firebase['auth'][idp.AuthProviders[key]]['credential'] =
            (accessToken) => ({
                'accessToken': accessToken,
                'providerId': 'facebook.com',
                'signInMethod': 'facebook.com',
                'toJSON': function() {
                  return {
                    'accessToken': accessToken,
                    'providerId': 'facebook.com',
                    'signInMethod': 'facebook.com',
                  };
                },
              });
      }
    }

    selectTenantUiShownCallback = recordFunction();
    selectTenantUiHiddenCallback = recordFunction();
    signInUiShownCallback = recordFunction();
    container = dom.createDom(TagName.DIV, {'id': 'element'});
    configs = {
      'API_KEY': {
        'authDomain': 'subdomain.firebaseapp.com',
        'displayMode': 'optionsFirst',
        'callbacks': {
          'selectTenantUiShown': selectTenantUiShownCallback,
          'selectTenantUiHidden': selectTenantUiHiddenCallback,
          'signInUiShown': signInUiShownCallback,
        },
        'tenants': {
          // The top-level project UI configuration.
          '_': {
            'fullLabel': 'ACME Login',
            'displayName': 'ACME',
            'buttonColor': '#FFB6C1',
            'iconUrl': '<icon-url-of-sign-in-button>',
            'signInOptions': [
              {
                'provider': 'password',
                'hd': 'acme.com',
              },
              {
                'provider': 'saml.provider',
                'providerName': 'SAML Provider',
                'buttonColor': '#2F2F2F',
                'iconUrl': '<icon-url>',
                'hd': 'acme.com',
              }],
            'tosUrl': 'http://localhost/tos',
            'privacyPolicyUrl': 'http://localhost/privacy_policy',
          },
          'tenant1': {
            'fullLabel': 'Contractor A Portal',
            'displayName': 'Contractor A',
            'buttonColor': '#ADF7B2',
            'iconUrl': '<icon-url-of-sign-in-button>',
            'signInOptions': [
              {
                'provider': 'google.com',
                'hd': 'acme.com',
              },
              {
                'provider': 'facebook.com',
                'hd': 'acme.com',
              },
              {
                'provider': 'password',
                'hd': 'acme.com',
              },
              {
                'provider': 'saml.provider',
                'providerName': 'SAML Provider',
                'buttonColor': '#2F2F2F',
                'iconUrl': '<icon-url>',
                'hd': 'acme-supplier.com',
              }],
            'tosUrl': 'http://localhost/tos',
            'privacyPolicyUrl': 'http://localhost/privacy_policy',
          },
          'tenant2': {
            'displayName': 'Contractor B',
            'buttonColor': '#EAC9A1',
            'iconUrl': '<icon-url-of-sign-in-button>',
            'signInOptions': ['google.com', 'facebook.com', 'password',
                              'github.com',
                              {
                                'provider': 'saml.provider',
                                'providerName': 'SAML Provider',
                                'buttonColor': '#2F2F2F',
                                'iconUrl': '<icon-url>',
                              }],
            'tosUrl': 'http://localhost/tos',
            'privacyPolicyUrl': 'http://localhost/privacy_policy',
          },
        },
      },
      'API_KEY2': {
        'authDomain': 'subdomain2.firebaseapp.com',
        'tenants': {
          'tenant3': {
            'signInOptions': ['google.com', 'facebook.com', 'password'],
            'tosUrl': 'http://localhost/tos',
            'privacyPolicyUrl': 'http://localhost/privacy_policy',
          },
        },
      },
    };
    projectConfig = {
      apiKey: 'API_KEY',
      projectId: 'PROJECT_ID',
    };
  },

  tearDown() {
    if (handler) {
      handler.reset();
      // Wait for reset promise to be resolved.
      mockClock.tick();
    }
    if (auth) {
      auth.uninstall();
    }
    if (auth1) {
      auth1.uninstall();
    }
    if (auth2) {
      auth2.uninstall();
    }
    dom.removeNode(container);
    mockClock.reset();
    mockClock.uninstall();
    testStubs.reset();
  },

  testSelectTenant_optionFirst() {
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        ['tenant1', 'tenant2']);

    // The select tenant page should be shown.
    assertSelectTenantPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    const buttons = dom.getElementsByClass(
        'firebaseui-id-tenant-selection-button', container);
    // Two tenants should be available to be selected from.
    const expectedTenants = ['tenant1', 'tenant2'];
    // Two expected labels on buttons.
    const expectedLongLabels = [
      'Contractor A Portal',
      'Sign in to Contractor B'
    ];
    const expectedShortLabels = ['Contractor A', 'Contractor B'];

    assertEquals(expectedTenants.length, buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      assertEquals(expectedTenants[i], dataset.get(buttons[i], 'tenantId'));
      assertIdpButtonLabels(
          buttons[i],
          expectedShortLabels[i],
          expectedLongLabels[i]);
    }

    // Click the tenant1's button.
    testingEvents.fireClickSequence(buttons[0]);
    return selectPromise.then((selectedTenantInfo) => {
      // The select tenant page should be hidden.
      assertSelectTenantPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        tenantId: 'tenant1',
        providerIds:
            ['google.com', 'facebook.com', 'password', 'saml.provider'],
      }, selectedTenantInfo);

      // Test startSignIn is called with the returned selectedTenantInfo after
      // selectTenant is called.
      auth1 = handler.getAuth('API_KEY', 'tenant1');
      handler.startSignIn(auth1, selectedTenantInfo);
      // signInUiShownCallback should be triggered.
      assertEquals(1, signInUiShownCallback.getCallCount());
      assertEquals(
          'tenant1', signInUiShownCallback.getLastCall().getArgument(0));
      // The provider sign-in page is shown with matching providers.
      const buttons = dom.getElementsByClass(
          'firebaseui-id-idp-button', container);
      assertEquals(selectedTenantInfo.providerIds.length, buttons.length);
      for (let i = 0; i < buttons.length; i++) {
        assertEquals(selectedTenantInfo.providerIds[i],
                     dataset.get(buttons[i], 'providerId'));
      }
    });
  },

  testSelectTenant_optionFirst_skipSelection() {
    // Test when there is only one tenant available.
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(projectConfig, ['tenant1']);

    // The select tenant page should be skipped.
    assertSelectTenantPageHidden(container);
    // selectTenantUiShownCallback should not be triggered.
    assertEquals(0, selectTenantUiShownCallback.getCallCount());

    return selectPromise.then((selectedTenantInfo) => {
      assertObjectEquals({
        tenantId: 'tenant1',
        providerIds:
            ['google.com', 'facebook.com', 'password', 'saml.provider'],
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_optionFirst_topLevelProject() {
    // Test selectTenant for top-level project flow.
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(projectConfig, [null]);

    // The select tenant page should be skipped.
    assertSelectTenantPageHidden(container);
    // selectTenantUiShownCallback should not be triggered.
    assertEquals(0, selectTenantUiShownCallback.getCallCount());

    return selectPromise.then((selectedTenantInfo) => {
      // The select tenant page should be hidden.
      assertSelectTenantPageHidden(container);
      // selectTenantUiShownCallback should not be triggered.
      assertEquals(0, selectTenantUiShownCallback.getCallCount());
      assertObjectEquals({
        tenantId: null,
        providerIds: ['password', 'saml.provider'],
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_optionFirst_tenantNotConfigured() {
    // Test when one of the tenants being passed is not configured in
    // FirebaseUiHandler. The tenant button should not be shown.
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        // invalid_tenant is not configured.
        ['tenant1', 'tenant2', 'invalid_tenant']);

    assertSelectTenantPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    const buttons = dom.getElementsByClass(
        'firebaseui-id-tenant-selection-button', container);
    // Only two tenants should be available to be selected from.
    const expectedTenants = ['tenant1', 'tenant2'];
    // Two expected labels on buttons.
    const expectedLongLabels = [
      'Contractor A Portal',
      'Sign in to Contractor B'
    ];
    const expectedShortLabels = ['Contractor A', 'Contractor B'];
    assertEquals(expectedTenants.length, buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      assertEquals(expectedTenants[i], dataset.get(buttons[i], 'tenantId'));
      assertIdpButtonLabels(
          buttons[i],
          expectedShortLabels[i],
          expectedLongLabels[i]);
    }

    testingEvents.fireClickSequence(buttons[1]);
    return selectPromise.then((selectedTenantInfo) => {
      assertSelectTenantPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        tenantId: 'tenant2',
        providerIds:
            ['google.com', 'facebook.com', 'password', 'github.com',
             'saml.provider'],
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_optionFirst_invalidApiKey() {
    // Test when invalid API key is passed in projectConfig.
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        {
          apiKey: 'INVALID_API_KEY',
          projectId: 'PROJECT_ID',
        },
        ['tenant1', 'tenant2']);
    assertSelectTenantPageHidden(container);
    // selectTenantUiShownCallback should not be triggered.
    assertEquals(0, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    return selectPromise.then(fail, (error) => {
      let errorMessage =
        strings.errorCIAP({code: 'invalid-configuration'}).toString();
      assertErrorPageVisible(container, errorMessage, false);
    });
  },

  testSelectTenant_identifierFirst() {
    // Test selectTenant for identifier first flow.
    configs['API_KEY']['displayMode'] = 'identifierFirst';
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        ['tenant1', 'tenant2']);

    // The provider match for email page should be shown.
    assertProviderMatchByEmailPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    // Enter the email and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@acme.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    return selectPromise.then((selectedTenantInfo) => {
      // The provider match for email page should be hidden.
      assertProviderMatchByEmailPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        tenantId: 'tenant1',
        providerIds: ['google.com', 'facebook.com', 'password'],
        email: 'user@acme.com',
      }, selectedTenantInfo);

      // Test startSignIn is called with the returned selectedTenantInfo after
      // selectTenant is called.
      auth1 = handler.getAuth('API_KEY', 'tenant1');
      handler.startSignIn(auth1, selectedTenantInfo);
      // signInUiShownCallback should be triggered.
      assertEquals(1, signInUiShownCallback.getCallCount());
      assertEquals(
          'tenant1', signInUiShownCallback.getLastCall().getArgument(0));
      // The provider sign-in page is shown with matching providers.
      const buttons = dom.getElementsByClass(
          'firebaseui-id-idp-button', container);
      assertEquals(selectedTenantInfo.providerIds.length, buttons.length);
      for (let i = 0; i < buttons.length; i++) {
        assertEquals(selectedTenantInfo.providerIds[i],
                     dataset.get(buttons[i], 'providerId'));
      }
    });
  },

  testSelectTenant_identifierFirst_multipleMatchingTenants() {
    // Test selectTenant for identifier first flow when user enters an email
    // that matches with multiple tenants. The first matching tenant should be
    // returned with the providers.
    configs['API_KEY']['displayMode'] = 'identifierFirst';
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        ['tenant1', null]);

    assertProviderMatchByEmailPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    // Enter an email that matches with both tenant1 and top-level project
    // and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@acme.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    return selectPromise.then((selectedTenantInfo) => {
      // The provider match for email page should be hidden.
      assertProviderMatchByEmailPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        // The first matching tenant should be returned.
        tenantId: 'tenant1',
        providerIds: ['google.com', 'facebook.com', 'password'],
        email: 'user@acme.com',
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_identifierFirst_noMatchingTenant() {
    // Test selectTenant for identifier first flow when user enters an email
    // that does not match with any providers.
    configs['API_KEY']['displayMode'] = 'identifierFirst';
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        ['tenant1']);

    // The provider match for email page should be shown.
    assertProviderMatchByEmailPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    // Enter an email with no matching providers and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@nomatching.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    // The error should be displayed in info bar.
    let errorMessage =
        strings.errorCIAP({code: 'no-matching-tenant-for-email'}).toString();
    assertInfoBarMessage(errorMessage, container);
    // The provider match for email page should still be shown.
    assertProviderMatchByEmailPageVisible(container);

    forms.setValue(emailInput, 'user@acme-supplier.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    return selectPromise.then((selectedTenantInfo) => {
      // The provider match for email page should be hidden.
      assertProviderMatchByEmailPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        tenantId: 'tenant1',
        providerIds: ['saml.provider'],
        email: 'user@acme-supplier.com',
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_identifierFirst_hdNotConfigured() {
    // Test selectTenant identifier first flow for providers that do not have
    // hd configured.
    configs['API_KEY']['displayMode'] = 'identifierFirst';
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        ['tenant2']);

    // The provider match for email page should be shown.
    assertProviderMatchByEmailPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    // Enter an arbitrary email and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@arbitraryemail.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    return selectPromise.then((selectedTenantInfo) => {
      // The provider match for email page should be hidden.
      assertProviderMatchByEmailPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        tenantId: 'tenant2',
        // All providers without hd configured should be returned.
        providerIds: ['google.com', 'facebook.com', 'password',
                      'github.com', 'saml.provider'],
        email: 'user@arbitraryemail.com',
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_identifierFirst_topLevelProject() {
    // Test selectTenant identifier first flow for top-level project.
    configs['API_KEY']['displayMode'] = 'identifierFirst';
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        [null]);

    assertProviderMatchByEmailPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    // Enter the email and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@acme.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    return selectPromise.then((selectedTenantInfo) => {
      // The provider match for email page should be hidden.
      assertProviderMatchByEmailPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        // tenant ID should be null for top-level project.
        tenantId: null,
        providerIds: ['password', 'saml.provider'],
        email: 'user@acme.com',
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_identifierFirst_tenantNotConfigured() {
    // Test selectTenant identifier first flow when tenant ID being passed
    // is not configured in UI handler. The tenant should be skipped with no
    // error being thrown.
    configs['API_KEY']['displayMode'] = 'identifierFirst';
    handler = new FirebaseUiHandler(container, configs);
    // invalid_tenant is not configured. It should be skipped and no error
    // should be thrown.
    const selectPromise = handler.selectTenant(
        projectConfig,
        ['invalid_tenant', 'tenant1']);

    assertProviderMatchByEmailPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    // Enter the email and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@acme.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    return selectPromise.then((selectedTenantInfo) => {
      // The provider match for email page should be hidden.
      assertProviderMatchByEmailPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        tenantId: 'tenant1',
        providerIds: ['google.com', 'facebook.com', 'password'],
        email: 'user@acme.com',
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_identifierFirst_invalidEmail() {
    // Test selectTenant for identifier first flow when user enters an
    // invalid email.
    configs['API_KEY']['displayMode'] = 'identifierFirst';
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        ['tenant1', 'tenant2']);

    // The provider match for email page should be shown.
    assertProviderMatchByEmailPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    // Enter an empty email and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, '');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    // The missing email error should be displayed.
    assertEmailErrorMessage(strings.errorMissingEmail().toString(), container);
    // The provider match for email page should still be shown.
    assertProviderMatchByEmailPageVisible(container);
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());

    // Enter an invalid email and click enter.
    forms.setValue(emailInput, '12345678@');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    // The invalid email error should be displayed.
    assertEmailErrorMessage(strings.errorInvalidEmail().toString(), container);
    // The provider match for email page should still be shown.
    assertProviderMatchByEmailPageVisible(container);

    // Enter a valid email and click enter.
    forms.setValue(emailInput, 'user@acme.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    return selectPromise.then((selectedTenantInfo) => {
      // The provider match for email page should be hidden.
      assertProviderMatchByEmailPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        tenantId: 'tenant1',
        providerIds: ['google.com', 'facebook.com', 'password'],
        email: 'user@acme.com',
      }, selectedTenantInfo);
    });
  },

  testSelectTenant_identifierFirst_invalidApiKey() {
    // Test when invalid API key is passed in projectConfig.
    configs['API_KEY']['displayMode'] = 'identifierFirst';
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        {
          apiKey: 'INVALID_API_KEY',
          projectId: 'PROJECT_ID',
        },
        ['tenant1', 'tenant2']);
    assertProviderMatchByEmailPageHidden(container);
    // selectTenantUiShownCallback should not be triggered.
    assertEquals(0, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    return selectPromise.then(fail, (error) => {
      assertProviderMatchByEmailPageHidden(container);
      let errorMessage =
        strings.errorCIAP({code: 'invalid-configuration'}).toString();
      assertErrorPageVisible(container, errorMessage, false);
    });
  },

  testSelectTenant_twice() {
    // Test selectTenant is called and then followed by startSignIn. And
    // then selectTenant is called again while startSignIn is still pending.
    handler = new FirebaseUiHandler(container, configs);
    const selectPromise = handler.selectTenant(
        projectConfig,
        ['tenant1', 'tenant2']);

    // The select tenant page should be shown.
    assertSelectTenantPageVisible(container);
    // selectTenantUiShownCallback should be triggered.
    assertEquals(1, selectTenantUiShownCallback.getCallCount());
    // selectTenantUiHiddenCallback should not be triggered.
    assertEquals(0, selectTenantUiHiddenCallback.getCallCount());
    const buttons = dom.getElementsByClass(
        'firebaseui-id-tenant-selection-button', container);
    // Two tenants should be available to be selected from.
    const expectedTenants = ['tenant1', 'tenant2'];
    assertEquals(expectedTenants.length, buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      assertEquals(expectedTenants[i],
                   dataset.get(buttons[i], 'tenantId'));
    }

    // Click the tenant1's button.
    testingEvents.fireClickSequence(buttons[0]);
    return selectPromise.then((selectedTenantInfo) => {
      // The select tenant page should be hidden.
      assertSelectTenantPageHidden(container);
      // selectTenantUiHiddenCallback should be triggered.
      assertEquals(1, selectTenantUiHiddenCallback.getCallCount());
      assertObjectEquals({
        tenantId: 'tenant1',
        providerIds:
            ['google.com', 'facebook.com', 'password', 'saml.provider'],
      }, selectedTenantInfo);

      // startSignIn with the selected tenant.
      auth1 = handler.getAuth('API_KEY', 'tenant1');
      handler.startSignIn(auth1, selectedTenantInfo);

      // Calling selectTenant again while sign-in is still pending should
      // not throw errors.
      assertNotThrows(() => {
        handler.selectTenant(projectConfig, ['tenant1', 'tenant2']);
        // The select tenant page should be shown.
        assertSelectTenantPageVisible(container);
        // selectTenantUiShownCallback should be triggered.
        assertEquals(2, selectTenantUiShownCallback.getCallCount());
      });
    });
  },

  testGetAuth() {
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals('tenant1', auth1.tenantId);
    // Test that passing the same tenant ID will return the same Auth instance.
    const sameAuth = handler.getAuth('API_KEY', 'tenant1');
    assertEquals(sameAuth, auth1);
    assertEquals('tenant1', sameAuth.tenantId);

    auth2 = handler.getAuth('API_KEY', 'tenant2');
    assertEquals('tenant2', auth2.tenantId);
    // Verify that a new Auth instance is created.
    assertNotEquals(auth2, auth1);

    // Verify that invalid API key error is thrown.
    let error = assertThrows(() => {
      handler.getAuth('INVALID_API_KEY', 'tenant1');
    });
    assertEquals(
        'Invalid project configuration: API key is invalid!',
        error.message);

    // Verify that invalid tenant ID error is thrown.
    error = assertThrows(() => {
      handler.getAuth('API_KEY', 'tenant3');
    });
    assertEquals('Invalid tenant configuration!', error.message);
  },

  testGetAuth_topLevelProject() {
    // Test top-level project flow where tenant ID is null.
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', null);
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is null on Auth instances for top-level project
    // flow.
    assertNull(auth1.tenantId);
    // Test that the same Auth instance will be returned if no tenant ID is
    // provided.
    const sameAuth = handler.getAuth('API_KEY', null);
    assertEquals(sameAuth, auth1);
    assertNull(sameAuth.tenantId);
    // Verify that the default Auth instance will be returned.
    const defaultAuth = firebase.app('[DEFAULT]').auth();
    assertEquals(defaultAuth, auth1);
  },

  testGetAuth_noTopLevelProjectConfigError() {
    const configWithoutTopLevelProject = {
      'API_KEY': {
        'authDomain': 'subdomain.firebaseapp.com',
        'tenants': {
          'tenant': {
            'signInOptions': ['google.com', 'facebook.com', 'password'],
            'tosUrl': 'http://localhost/tos',
            'privacyPolicyUrl': 'http://localhost/privacy_policy',
          },
        },
      },
    };
    handler = new FirebaseUiHandler(
        container, configWithoutTopLevelProject);
    // Verify that error is thrown if no top-level project config is available
    // when getting the Auth instance.
    const error = assertThrows(() => {
      handler.getAuth('API_KEY', null);
    });
    assertEquals('Invalid tenant configuration!', error.message);
  },

  testStartSignIn() {
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const startSignInPromise = handler.startSignIn(auth1);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);

    // This is complicated by IE delaying focus events firing until this
    // function returns.
    // http://stackoverflow.com/questions/5900288/ie-focus-event-handler-delay
    if (userAgent.IE) {
      return;
    }

    // signInUiShownCallback should be triggered.
    assertEquals(1, signInUiShownCallback.getCallCount());
    assertEquals('tenant1', signInUiShownCallback.getLastCall().getArgument(0));
    // Click sign in with email button.
    const buttons = dom.getElementsByClass(
        'firebaseui-id-idp-button', container);
    testingEvents.fireClickSequence(buttons[2]);
    // Enter the email and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@example.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    internalAuth.assertFetchSignInMethodsForEmail(
        ['user@example.com'],
        ['password']);
    internalAuth.process().then(() => {
      // Enter password and click submit.
      const passwordElement = dom.getElementByClass(
          'firebaseui-id-password', container);
      forms.setValue(passwordElement, '123');
      const submit = dom.getElementByClass('firebaseui-id-submit', container);
      testingEvents.fireClickSequence(submit);
      internalAuth.assertSignInWithEmailAndPassword(
          ['user@example.com', '123'],
          () => {
            internalAuth.setUser({
              'email': 'user@example.com',
              'displayName':'Sample User',
              'tenantId': 'tenant1',
            });
            return {
              'user': internalAuth.currentUser,
              'credential': null,
              'operationType': 'signIn',
              'additionalUserInfo': {
                'providerId': 'password',
                'isNewUser': false,
              },
            };
          });
      return internalAuth.process();
    }).then(() => {
      internalAuth.assertSignOut([]);
      return internalAuth.process();
    }).then(() => {
      externalAuth.assertUpdateCurrentUser(
          [internalAuth.currentUser],
          () => {
            externalAuth.setUser(internalAuth.currentUser);
          });
      return externalAuth.process();
    });
    return startSignInPromise.then((userCredential) => {
      const expectedAuthResult = {
        'user': externalAuth.currentUser,
        // Password credential should not be exposed to callback.
        'credential': null,
        'operationType': 'signIn',
        'additionalUserInfo': {'providerId': 'password', 'isNewUser': false},
      };
      assertObjectEquals(expectedAuthResult, userCredential);
   });
  },

  testStartSignIn_twice() {
    // Test that calling startSignIn again while the first call is still pending
    // does not throw an error.
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    auth2 = handler.getAuth('API_KEY', 'tenant2');

    // startSignIn with auth1.
    handler.startSignIn(auth1);
    // Keep track of the AuthUI instance being used.
    const authUI1 = handler.getCurrentAuthUI();
    assertEquals(auth1, handler.getCurrentAuthUI().getExternalAuth());

    assertNotThrows(() => {
      // startSignIn with auth2.
      handler.startSignIn(auth2);
      mockClock.tick();
      assertEquals(auth2, handler.getCurrentAuthUI().getExternalAuth());
      // The AuthUI should be re-initialized in the second sign-in operation.
      assertNotEquals(authUI1, handler.getCurrentAuthUI());
    });
    mockClock.tick();
  },

  testStartSignIn_selectedTenantInfo() {
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const prefilledEmail = 'user@example.com';
    const selectedTenantInfo = {
      'email': prefilledEmail,
      'tenantId': 'tenant1',
      // Mock that the preferred providers are passed to startSignIn.
      'providerIds': ['password', 'saml.provider'],
    };
    const startSignInPromise = handler.startSignIn(auth1, selectedTenantInfo);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);

    // This is complicated by IE delaying focus events firing until this
    // function returns.
    // http://stackoverflow.com/questions/5900288/ie-focus-event-handler-delay
    if (userAgent.IE) {
      return;
    }

    // signInUiShownCallback should be triggered.
    assertEquals(1, signInUiShownCallback.getCallCount());
    assertEquals('tenant1', signInUiShownCallback.getLastCall().getArgument(0));
    const buttons = dom.getElementsByClass(
        'firebaseui-id-idp-button', container);
    // Verify that only the matched providers are enabled.
    assertEquals(2, buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      assertEquals(selectedTenantInfo.providerIds[i],
                   dataset.get(buttons[i], 'providerId'));
    }
    // Click sign in with email button.
    testingEvents.fireClickSequence(buttons[0]);

    internalAuth.assertFetchSignInMethodsForEmail(
        ['user@example.com'],
        ['password']);
    internalAuth.process().then(() => {
      // Enter password and click submit.
      const passwordElement = dom.getElementByClass(
          'firebaseui-id-password', container);
      forms.setValue(passwordElement, '123');
      const submit = dom.getElementByClass('firebaseui-id-submit', container);
      testingEvents.fireClickSequence(submit);
      internalAuth.assertSignInWithEmailAndPassword(
          ['user@example.com', '123'],
          () => {
            internalAuth.setUser({
              'email': 'user@example.com',
              'displayName':'Sample User',
              'tenantId': 'tenant1',
            });
            return {
              'user': internalAuth.currentUser,
              'credential': null,
              'operationType': 'signIn',
              'additionalUserInfo': {
                'providerId': 'password',
                'isNewUser': false,
              },
            };
          });
      return internalAuth.process();
    }).then(() => {
      internalAuth.assertSignOut([]);
      return internalAuth.process();
    }).then(() => {
      externalAuth.assertUpdateCurrentUser(
          [internalAuth.currentUser],
          () => {
            externalAuth.setUser(internalAuth.currentUser);
          });
      return externalAuth.process();
    });
    return startSignInPromise.then((userCredential) => {
      const expectedAuthResult = {
        'user': externalAuth.currentUser,
        // Password credential should not be exposed to callback.
        'credential': null,
        'operationType': 'signIn',
        'additionalUserInfo': {'providerId': 'password', 'isNewUser': false},
      };
      assertObjectEquals(expectedAuthResult, userCredential);
   });
  },

  testStartSignIn_selectedTenantInfo_passwordOnly() {
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const prefilledEmail = 'user@example.com';
    const selectedTenantInfo = {
      'email': prefilledEmail,
      'tenantId': 'tenant1',
      // Mock that the preferred provider is passed to startSignIn.
      'providerIds': ['password'],
    };
    const startSignInPromise = handler.startSignIn(auth1, selectedTenantInfo);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);

    // This is complicated by IE delaying focus events firing until this
    // function returns.
    // http://stackoverflow.com/questions/5900288/ie-focus-event-handler-delay
    if (userAgent.IE) {
      return;
    }

    internalAuth.assertFetchSignInMethodsForEmail(
        ['user@example.com'],
        ['password']);
    internalAuth.process().then(() => {
      // signInUiShownCallback should be triggered.
      assertEquals(1, signInUiShownCallback.getCallCount());
      assertEquals(
          'tenant1', signInUiShownCallback.getLastCall().getArgument(0));

      // Enter password and click submit.
      const passwordElement = dom.getElementByClass(
          'firebaseui-id-password', container);
      forms.setValue(passwordElement, '123');
      const submit = dom.getElementByClass('firebaseui-id-submit', container);
      testingEvents.fireClickSequence(submit);
      internalAuth.assertSignInWithEmailAndPassword(
          ['user@example.com', '123'],
          () => {
            internalAuth.setUser({
              'email': 'user@example.com',
              'displayName':'Sample User',
              'tenantId': 'tenant1',
            });
            return {
              'user': internalAuth.currentUser,
              'credential': null,
              'operationType': 'signIn',
              'additionalUserInfo': {
                'providerId': 'password',
                'isNewUser': false,
              },
            };
          });
      return internalAuth.process();
    }).then(() => {
      internalAuth.assertSignOut([]);
      return internalAuth.process();
    }).then(() => {
      externalAuth.assertUpdateCurrentUser(
          [internalAuth.currentUser],
          () => {
            externalAuth.setUser(internalAuth.currentUser);
          });
      return externalAuth.process();
    });
    return startSignInPromise.then((userCredential) => {
      const expectedAuthResult = {
        'user': externalAuth.currentUser,
        // Password credential should not be exposed to callback.
        'credential': null,
        'operationType': 'signIn',
        'additionalUserInfo': {'providerId': 'password', 'isNewUser': false},
      };
      assertObjectEquals(expectedAuthResult, userCredential);
   });
  },

  testStartSignIn_selectedTenantInfo_idp_popup() {
    // Test sign in with IdP for popup flow when selectedTenantInfo is passed
    // with email.
    configs['API_KEY']['tenants']['tenant1']['signInFlow'] = 'popup';
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const prefilledEmail = 'user@example.com';
    const selectedTenantInfo = {
      'email': prefilledEmail,
      'tenantId': 'tenant1',
      // Mock that the preferred providers are passed to startSignIn.
      'providerIds': ['google.com', 'password'],
    };
    const expectedProvider = idp.getAuthProvider('google.com');
    expectedProvider.setCustomParameters({
      // The prefilled email should be passed to IdP as login_hint.
      'login_hint': prefilledEmail,
    });

    const startSignInPromise = handler.startSignIn(auth1, selectedTenantInfo);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);
    // signInUiShownCallback should be triggered.
    assertEquals(1, signInUiShownCallback.getCallCount());
    assertEquals('tenant1', signInUiShownCallback.getLastCall().getArgument(0));
    const buttons = dom.getElementsByClass(
        'firebaseui-id-idp-button', container);
    // Verify that only the matched providers are enabled.
    assertEquals(2, buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      assertEquals(selectedTenantInfo.providerIds[i],
                   dataset.get(buttons[i], 'providerId'));
    }
    // Click sign in with Google button.
    testingEvents.fireClickSequence(buttons[0]);

    // User should be signed in.
    internalAuth.setUser({
      'email': prefilledEmail,
    });
    const cred  = {
      'providerId': 'google.com',
      'accessToken': 'ACCESS_TOKEN'
    };
    // Sign in with popup triggered.
    internalAuth.assertSignInWithPopup(
        [expectedProvider],
        {
          'user': internalAuth.currentUser,
          'credential': cred,
          'operationType': 'signIn',
          'additionalUserInfo': {
            'providerId': 'google.com',
            'isNewUser': false,
          },
        });
    internalAuth.process().then(() => {
      internalAuth.assertSignOut([]);
      return internalAuth.process();
    }).then(() => {
      externalAuth.assertUpdateCurrentUser(
          [internalAuth.currentUser],
          () => {
            externalAuth.setUser(internalAuth.currentUser);
          });
      return externalAuth.process();
    });
    return startSignInPromise.then((userCredential) => {
      const expectedAuthResult = {
        'user': externalAuth.currentUser,
        'credential': cred,
        'operationType': 'signIn',
        'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false},
      };
      assertObjectEquals(expectedAuthResult, userCredential);
   });
  },

  testStartSignIn_selectedTenantInfo_idp_immediateRedirect_success() {
    // Test sign in with IdP for redirect flow when selectedTenantInfo is passed
    // with email and only one provider is enabled.
    configs['API_KEY']['tenants']['tenant1']['immediateFederatedRedirect'] =
        true;
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const prefilledEmail = 'user@example.com';
    const selectedTenantInfo = {
      'email': prefilledEmail,
      'tenantId': 'tenant1',
      // Only one federated IdP is available.
      'providerIds': ['google.com'],
    };
    const expectedProvider = idp.getAuthProvider('google.com');
    expectedProvider.setCustomParameters({
      // The prefilled email should be passed to IdP as login_hint.
      'login_hint': prefilledEmail,
    });

    handler.startSignIn(auth1, selectedTenantInfo);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);
    // signInUiShownCallback should not be triggered before immediate redirect.
    assertEquals(0, signInUiShownCallback.getCallCount());

    // Should immediately redirect to IdP without button click.
    internalAuth.assertSignInWithRedirect([expectedProvider]);
    // Blank page should be displayed with progress bar.
    assertBlankPageVisible(container);
    delayForBusyIndicatorAndAssertIndicatorShown(container);
    return internalAuth.process().then(() => {
      // signInUiShownCallback should still not be triggered.
      assertEquals(0, signInUiShownCallback.getCallCount());
    });
  },

  testStartSignIn_selectedTenantInfo_idp_immediateRedirect_redirectStatus() {
    // Test sign in with IdP for redirect flow when selectedTenantInfo is passed
    // with email and only one provider is enabled and redirect status is set.
    // This is a special case where user exits during the middle of redirect
    // sign-in so that the redirect status is not cleared.
    // Set redirect status with the tenant ID used to start the flow.
    const redirectStatus = new RedirectStatus('tenant1');
    storage.setRedirectStatus(redirectStatus);
    configs['API_KEY']['tenants']['tenant1']['immediateFederatedRedirect'] =
        true;
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const prefilledEmail = 'user@example.com';
    const selectedTenantInfo = {
      'email': prefilledEmail,
      'tenantId': 'tenant1',
      // Only one federated IdP is available.
      'providerIds': ['google.com'],
    };
    const expectedProvider = idp.getAuthProvider('google.com');

    handler.startSignIn(auth1, selectedTenantInfo);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);

    // Should immediately redirect to IdP without button click.
    internalAuth.assertGetRedirectResult(
        [],
        function() {
          // Spinner progress bar should be visible.
          assertProgressBarVisible(container);
          // Callback page should be hidden in DOM.
          assertCallbackPageDomHidden(container);
          // signInUiShownCallback should not be triggered.
          assertEquals(0, signInUiShownCallback.getCallCount());
          return {
            'user': null,
          };
        });

    return internalAuth.process().then(() => {
      // signInUiShownCallback should not be triggered before immediate
      // redirect.
      assertEquals(0, signInUiShownCallback.getCallCount());
      internalAuth.assertSignInWithRedirect([expectedProvider]);
      // Blank page should be displayed with progress bar.
      assertBlankPageVisible(container);
      delayForBusyIndicatorAndAssertIndicatorShown(container);
      return internalAuth.process();
    }).then(() => {
      // signInUiShownCallback should still not be triggered.
      assertEquals(0, signInUiShownCallback.getCallCount());
    });
  },

  testStartSignIn_selectedTenantInfo_idp_immediateRedirect_error() {
    // Test sign in with IdP error case for redirect flow when
    // selectedTenantInfo is passed with email and only one provider is enabled.
    const networkError = {
      'code': 'auth/network-request-failed',
      'message': 'A network error has occurred.',
    };
    configs['API_KEY']['tenants']['tenant1']['immediateFederatedRedirect'] =
        true;
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const prefilledEmail = 'user@example.com';
    const selectedTenantInfo = {
      'email': prefilledEmail,
      'tenantId': 'tenant1',
      // Only one federated IdP is available.
      'providerIds': ['google.com'],
    };
    const expectedProvider = idp.getAuthProvider('google.com');
    expectedProvider.setCustomParameters({
      // The prefilled email should be passed to IdP as login_hint.
      'login_hint': prefilledEmail,
    });

    handler.startSignIn(auth1, selectedTenantInfo);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);
    // signInUiShownCallback should not be triggered.
    assertEquals(0, signInUiShownCallback.getCallCount());

    // Should immediately redirect to IdP without button click.
    internalAuth.assertSignInWithRedirect(
        [expectedProvider],
        null,
        () => {
          // signInUiShown callback should not be triggered.
          assertEquals(0, signInUiShownCallback.getCallCount());
          // Simulate error.
          return networkError;
        });
    return internalAuth.process()
        .then(() => {
          // signInUiShown callback should be triggered with expected tenant ID.
          assertEquals(1, signInUiShownCallback.getCallCount());
          assertEquals(
              'tenant1', signInUiShownCallback.getLastCall().getArgument(0));
          // Provider sign-in page should be displayed with error in info bar.
          assertInfoBarMessage(
              strings.error({'code': networkError.code}).toString(), container);
          assertProviderSignInPageVisible(container);
        });
  },

  testStartSignIn_selectedTenantInfo_idp_redirect() {
    // Test sign in with IdP for redirect flow when selectedTenantInfo is passed
    // with email.
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const prefilledEmail = 'user@example.com';
    const selectedTenantInfo = {
      'email': prefilledEmail,
      'tenantId': 'tenant1',
      // Mock that the preferred providers are passed to startSignIn.
      'providerIds': ['google.com', 'password'],
    };
    const expectedProvider = idp.getAuthProvider('google.com');
    expectedProvider.setCustomParameters({
      // The prefilled email should be passed to IdP as login_hint.
      'login_hint': prefilledEmail,
    });

    handler.startSignIn(auth1, selectedTenantInfo);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);
    // signInUiShownCallback should be triggered.
    assertEquals(1, signInUiShownCallback.getCallCount());
    assertEquals('tenant1', signInUiShownCallback.getLastCall().getArgument(0));
    const buttons = dom.getElementsByClass(
        'firebaseui-id-idp-button', container);
    // Verify that only the matched providers are enabled.
    assertEquals(2, buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      assertEquals(selectedTenantInfo.providerIds[i],
                   dataset.get(buttons[i], 'providerId'));
    }
    // Click sign in with Google button.
    testingEvents.fireClickSequence(buttons[0]);

    internalAuth.assertSignInWithRedirect([expectedProvider]);
    return internalAuth.process();
  },

  testStartSignIn_topLevelProject() {
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', null);
    const startSignInPromise = handler.startSignIn(auth1);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is null on Auth instances for top-level project
    // flow.
    assertEquals(auth1, externalAuth);
    assertNull(externalAuth.tenantId);
    assertNull(internalAuth.tenantId);

    // This is complicated by IE delaying focus events firing until this
    // function returns.
    // http://stackoverflow.com/questions/5900288/ie-focus-event-handler-delay
    if (userAgent.IE) {
      return;
    }

    // signInUiShownCallback should be triggered.
    assertEquals(1, signInUiShownCallback.getCallCount());
    assertNull(signInUiShownCallback.getLastCall().getArgument(0));
    // Click sign in with email button.
    const buttons = dom.getElementsByClass(
        'firebaseui-id-idp-button', container);
    testingEvents.fireClickSequence(buttons[0]);
    // Enter the email and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@example.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    internalAuth.assertFetchSignInMethodsForEmail(
        ['user@example.com'],
        ['password']);
    internalAuth.process().then(() => {
      // Enter password and click submit.
      const passwordElement = dom.getElementByClass(
          'firebaseui-id-password', container);
      forms.setValue(passwordElement, '123');
      const submit = dom.getElementByClass('firebaseui-id-submit', container);
      testingEvents.fireClickSequence(submit);
      internalAuth.assertSignInWithEmailAndPassword(
          ['user@example.com', '123'],
          () => {
            internalAuth.setUser({
              'email': 'user@example.com',
              'displayName':'Sample User',
              'tenantId': null,
            });
            return {
              'user': internalAuth.currentUser,
              'credential': null,
              'operationType': 'signIn',
              'additionalUserInfo': {
                'providerId': 'password',
                'isNewUser': false,
              },
            };
          });
      return internalAuth.process();
    }).then(() => {
      internalAuth.assertSignOut([]);
      return internalAuth.process();
    }).then(() => {
      externalAuth.assertUpdateCurrentUser(
          [internalAuth.currentUser],
          () => {
            externalAuth.setUser(internalAuth.currentUser);
          });
      return externalAuth.process();
    });
    return startSignInPromise.then((userCredential) => {
      const expectedAuthResult = {
        'user': externalAuth.currentUser,
        // Password credential should not be exposed to callback.
        'credential': null,
        'operationType': 'signIn',
        'additionalUserInfo': {'providerId': 'password', 'isNewUser': false},
      };
      assertObjectEquals(expectedAuthResult, userCredential);
   });
  },

  testStartSignIn_multiProject() {
    // Test the flows with a different API_KEY to verify the multi-project
    // support.
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY2', 'tenant3');
    const startSignInPromise = handler.startSignIn(auth1);

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that the right API key and Auth domain are used.
    assertEquals('API_KEY2', auth1['app']['options']['apiKey']);
    assertEquals(
        'subdomain2.firebaseapp.com', auth1['app']['options']['authDomain']);
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant3', externalAuth.tenantId);
    assertEquals('tenant3', internalAuth.tenantId);

    // This is complicated by IE delaying focus events firing until this
    // function returns.
    // http://stackoverflow.com/questions/5900288/ie-focus-event-handler-delay
    if (userAgent.IE) {
      return;
    }

    // signInUiShownCallback configured for project with API_KEY1 should not be
    // triggered for project with API_KEY2.
    assertEquals(0, signInUiShownCallback.getCallCount());
    // Click sign in with email button.
    const buttons = dom.getElementsByClass(
        'firebaseui-id-idp-button', container);
    testingEvents.fireClickSequence(buttons[2]);
    // Enter the email and click enter.
    const emailInput = dom.getElementByClass('firebaseui-id-email', container);
    forms.setValue(emailInput, 'user@example.com');
    testingEvents.fireKeySequence(emailInput, KeyCodes.ENTER);

    internalAuth.assertFetchSignInMethodsForEmail(
        ['user@example.com'],
        ['password']);
    internalAuth.process().then(() => {
      // Enter password and click submit.
      const passwordElement = dom.getElementByClass(
          'firebaseui-id-password', container);
      forms.setValue(passwordElement, '123');
      const submit = dom.getElementByClass('firebaseui-id-submit', container);
      testingEvents.fireClickSequence(submit);
      internalAuth.assertSignInWithEmailAndPassword(
          ['user@example.com', '123'],
          () => {
            internalAuth.setUser({
              'email': 'user@example.com',
              'displayName':'Sample User',
              'tenantId': 'tenant3',
            });
            return {
              'user': internalAuth.currentUser,
              'credential': null,
              'operationType': 'signIn',
              'additionalUserInfo': {
                'providerId': 'password',
                'isNewUser': false,
              },
            };
          });
      return internalAuth.process();
    }).then(() => {
      internalAuth.assertSignOut([]);
      return internalAuth.process();
    }).then(() => {
      externalAuth.assertUpdateCurrentUser(
          [internalAuth.currentUser],
          () => {
            externalAuth.setUser(internalAuth.currentUser);
          });
      return externalAuth.process();
    });
    return startSignInPromise.then((userCredential) => {
      const expectedAuthResult = {
        'user': externalAuth.currentUser,
        // Password credential should not be exposed to callback.
        'credential': null,
        'operationType': 'signIn',
        'additionalUserInfo': {'providerId': 'password', 'isNewUser': false},
      };
      assertObjectEquals(expectedAuthResult, userCredential);
   });
  },

  testStartSignIn_pendingRedirect_success() {
    // Set redirect status with the tenant ID used to start the flow.
    const redirectStatus = new RedirectStatus('tenant1');
    storage.setRedirectStatus(redirectStatus);

    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    const startSignInPromise = handler.startSignIn(auth1);

    // signInUiShownCallback should not be triggered.
    assertEquals(0, signInUiShownCallback.getCallCount());

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);
    const cred = {
      'providerId': 'google.com',
      'accessToken': 'ACCESS_TOKEN',
    };
    // User should be signed in at this point.
    internalAuth.setUser({
      'email': 'user@example.com',
      'displayName':'Sample User',
      'tenantId': 'tenant1',
    });
    internalAuth.assertGetRedirectResult(
        [],
        function() {
          // Spinner progress bar should be visible.
          assertProgressBarVisible(container);
          // Callback page should be hidden in DOM.
          assertCallbackPageDomHidden(container);
          return {
            'user': internalAuth.currentUser,
            'credential': cred,
            'operationType': 'signIn',
            'additionalUserInfo': {
              'providerId': 'google.com',
              'isNewUser': false,
            },
          };
        });
    internalAuth.process().then(() => {
      internalAuth.assertSignOut([]);
      return internalAuth.process();
    }).then(() => {
      externalAuth.assertUpdateCurrentUser(
          [internalAuth.currentUser],
          () => {
            externalAuth.setUser(internalAuth.currentUser);
          });
      return externalAuth.process();
    });
    return startSignInPromise.then((userCredential) => {
      assertEquals(0, signInUiShownCallback.getCallCount());
      const expectedAuthResult = {
        'user': externalAuth.currentUser,
        'credential': cred,
        'operationType': 'signIn',
        'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false},
      };
      assertObjectEquals(expectedAuthResult, userCredential);
   });
  },

  testStartSignIn_pendingRedirect_error() {
    const networkError = {
      'code': 'auth/network-request-failed',
      'message': 'A network error has occurred.',
    };
    // Set redirect status with the tenant ID used to start the flow.
    const redirectStatus = new RedirectStatus('tenant1');
    storage.setRedirectStatus(redirectStatus);

    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    handler.startSignIn(auth1);

    // signInUiShownCallback should not be immediately triggered.
    assertEquals(0, signInUiShownCallback.getCallCount());

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that tenant ID is set on Auth instances.
    assertEquals(auth1, externalAuth);
    assertEquals('tenant1', externalAuth.tenantId);
    assertEquals('tenant1', internalAuth.tenantId);
    internalAuth.assertGetRedirectResult(
        [],
        null,
        function() {
          // signInUiShown callback should not be triggered.
          assertEquals(0, signInUiShownCallback.getCallCount());
          // Spinner progress bar should be visible.
          assertProgressBarVisible(container);
          // Callback page should be hidden in DOM.
          assertCallbackPageDomHidden(container);
          // Simulate error.
          return networkError;
        });
    return internalAuth.process()
        .then(() => {
          // signInUiShown callback should be triggered with expected tenant ID.
          assertEquals(1, signInUiShownCallback.getCallCount());
          assertEquals(
              'tenant1', signInUiShownCallback.getLastCall().getArgument(0));
          // No progress bar should be shown.
          assertProgressBarHidden(container);
          // Provider sign in page should be shown with the expected error
          // message.
          assertCallbackPageHidden(container);
          assertInfoBarMessage(
              strings.error({'code': networkError.code}).toString(), container);
          assertProviderSignInPageVisible(container);
        });
  },

  testStartSignIn_pendingRedirect_topLevelProject_success() {
    // Set redirect status without the tenant ID.
    const redirectStatus = new RedirectStatus();
    storage.setRedirectStatus(redirectStatus);

    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', null);
    const startSignInPromise = handler.startSignIn(auth1);

    // signInUiShownCallback should not be triggered.
    assertEquals(0, signInUiShownCallback.getCallCount());

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that tenant ID is null on Auth instances.
    assertEquals(auth1, externalAuth);
    assertNull(externalAuth.tenantId);
    assertNull(internalAuth.tenantId);
    const cred = {
      'providerId': 'saml.provider',
      'pendingToken': 'PENDING_TOKEN',
    };
    // User should be signed in at this point.
    internalAuth.setUser({
      'email': 'user@example.com',
      'displayName':'Sample User',
      'tenantId': null,
    });
    internalAuth.assertGetRedirectResult(
        [],
        function() {
          // Spinner progress bar should be visible.
          assertProgressBarVisible(container);
          // Callback page should be hidden in DOM.
          assertCallbackPageDomHidden(container);
          return {
            'user': internalAuth.currentUser,
            'credential': cred,
            'operationType': 'signIn',
            'additionalUserInfo': {
              'providerId': 'saml.provider',
              'isNewUser': false,
            },
          };
        });
    internalAuth.process().then(() => {
      internalAuth.assertSignOut([]);
      return internalAuth.process();
    }).then(() => {
      externalAuth.assertUpdateCurrentUser(
          [internalAuth.currentUser],
          () => {
            externalAuth.setUser(internalAuth.currentUser);
          });
      return externalAuth.process();
    });
    return startSignInPromise.then((userCredential) => {
      assertEquals(0, signInUiShownCallback.getCallCount());
      const expectedAuthResult = {
        'user': externalAuth.currentUser,
        'credential': cred,
        'operationType': 'signIn',
        'additionalUserInfo': {
          'providerId': 'saml.provider',
          'isNewUser': false,
        },
      };
      assertObjectEquals(expectedAuthResult, userCredential);
   });
  },

  testStartSignIn_pendingRedirect_topLevelProject_error() {
    const networkError = {
      'code': 'auth/network-request-failed',
      'message': 'A network error has occurred.',
    };
    // Set redirect status without the tenant ID.
    const redirectStatus = new RedirectStatus();
    storage.setRedirectStatus(redirectStatus);

    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', null);
    handler.startSignIn(auth1);

    // signInUiShownCallback should not be immediately triggered.
    assertEquals(0, signInUiShownCallback.getCallCount());

    const internalAuth = handler.getCurrentAuthUI().getAuth();
    const externalAuth = handler.getCurrentAuthUI().getExternalAuth();
    // Verify that tenant ID is null on Auth instances.
    assertEquals(auth1, externalAuth);
    assertNull(externalAuth.tenantId);
    assertNull(internalAuth.tenantId);
    internalAuth.assertGetRedirectResult(
        [],
        null,
        function() {
          // signInUiShown callback should not be triggered.
          assertEquals(0, signInUiShownCallback.getCallCount());
          // Spinner progress bar should be visible.
          assertProgressBarVisible(container);
          // Callback page should be hidden in DOM.
          assertCallbackPageDomHidden(container);
          // Simulate error.
          return networkError;
        });
    return internalAuth.process()
        .then(() => {
          // signInUiShown callback should be triggered with null.
          assertEquals(1, signInUiShownCallback.getCallCount());
          assertNull(signInUiShownCallback.getLastCall().getArgument(0));
          // No progress bar should be shown.
          assertProgressBarHidden(container);
          // Provider sign in page should be shown with the expected error
          // message.
          assertCallbackPageHidden(container);
          assertInfoBarMessage(
              strings.error({'code': networkError.code}).toString(), container);
          assertProviderSignInPageVisible(container);
        });
  },

  testStartSignIn_projectConfigError() {
    handler = new FirebaseUiHandler(container, configs);
    auth = firebase.initializeApp({
      'apiKey': 'INVALID_API_KEY',
      'authDomain': 'subdomain.firebaseapp.com',
    }).auth();
    return handler.startSignIn(auth).then(fail, (error) => {
      assertEquals(
        'Invalid project configuration: API key is invalid!',
        error.message);
    });
  },

  testStartSignIn_invalidTenantIdError() {
    handler = new FirebaseUiHandler(container, configs);
    auth = firebase.initializeApp({
      'apiKey': 'API_KEY',
      'authDomain': 'subdomain.firebaseapp.com',
    }).auth();
    auth.tenantId = 'INVALID_TENANT_ID';
    return handler.startSignIn(auth).then(fail, (error) => {
      assertEquals('Invalid tenant configuration!', error.message);
      // signInUiShownCallback should not be triggered if error occurs before
      // sign-in UI is shown.
      assertEquals(0, signInUiShownCallback.getCallCount());
    });
  },

  testStartSignIn_invalidTopLevelProjectConfigError() {
    const configWithoutTopLevelProject = {
      'API_KEY': {
        'authDomain': 'subdomain.firebaseapp.com',
        'tenants': {
          'tenant': {
            'signInOptions': ['google.com', 'facebook.com', 'password'],
            'tosUrl': 'http://localhost/tos',
            'privacyPolicyUrl': 'http://localhost/privacy_policy',
          },
        },
      },
    };
    handler = new FirebaseUiHandler(
        container, configWithoutTopLevelProject);
    auth = firebase.initializeApp({
      'apiKey': 'API_KEY',
      'authDomain': 'subdomain.firebaseapp.com',
    }).auth();
    auth.tenantId = null;
    return handler.startSignIn(auth).then(fail, (error) => {
      assertEquals('Invalid tenant configuration!', error.message);
    });
  },

  testStartSignIn_uiReset() {
    testStubs.set(
        AuthUI.prototype,
        'reset',
        recordFunction(AuthUI.prototype.reset));
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    handler.startSignIn(auth1);
    mockClock.tick();
    assertEquals(0, handler.getCurrentAuthUI().reset.getCallCount());
    return handler.completeSignOut().then(() => {
      // Rendering other screen should reset the AuthUI instance.
      assertEquals(1, handler.getCurrentAuthUI().reset.getCallCount());
      assertCompleteSignOutPageVisible(container);
    });
  },

  testReset() {
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    handler.startSignIn(auth1);

    assertNotNull(AuthUI.getInstance());
    assertNotNull(handler.getCurrentAuthUI());
    return handler.reset().then(() => {
      // Verify that the AuthUI instance is deleted and the reference to the
      // instance is set to null.
      assertNull(AuthUI.getInstance());
      assertNull(handler.getCurrentAuthUI());
      // Calling startSignIn again should not throw.
      handler.startSignIn(auth1);
    });
  },

  testReset_progressBar() {
    handler = new FirebaseUiHandler(container, configs);
    handler.showProgressBar();
    mockClock.tick(500);
    assertProgressBarVisible(container);
    return handler.reset().then(() => {
      assertProgressBarHidden(container);
    });
  },

  testProgressBar() {
    handler = new FirebaseUiHandler(container, configs);
    handler.showProgressBar();
    assertProgressBarHidden(container);
    // Progress bar should be visible after 500ms.
    mockClock.tick(500);
    assertProgressBarVisible(container);
    // signInUiShownCallback should not be triggered by progress bar shown.
    assertEquals(0, signInUiShownCallback.getCallCount());
    handler.hideProgressBar();
    assertProgressBarHidden(container);

    // Verify that hideProgressBar will cancel the showProgressBar timeout.
    handler.showProgressBar();
    mockClock.tick();
    handler.hideProgressBar();
    assertProgressBarHidden(container);
    mockClock.tick(500);
    assertProgressBarHidden(container);

    // Verify that calling showProgressBar twice won't render two progress bars.
    handler.showProgressBar();
    mockClock.tick(500);
    assertProgressBarVisible(container);
    handler.showProgressBar();
    mockClock.tick(500);
    assertProgressBarVisible(container);

    // Verify that calling completeSignOut will remove the progress bar.
    return handler.completeSignOut().then(() => {
      assertProgressBarHidden(container);
      assertCompleteSignOutPageVisible(container);
      handler.hideProgressBar();
      assertCompleteSignOutPageVisible(container);
      // Calling showProgressBar will remove the sign out page.
      handler.showProgressBar();
      assertCompleteSignOutPageVisible(container);
      mockClock.tick(500);
      assertCompleteSignOutPageHidden(container);
      assertProgressBarVisible(container);
    });
  },

  testProgressBar_pending() {
    handler = new FirebaseUiHandler(container, configs);
    handler.showProgressBar();
    assertProgressBarHidden(container);

    // Verify that the delayed progress bar will be cancelled.
    return handler.completeSignOut().then(() => {
      assertCompleteSignOutPageVisible(container);
      mockClock.tick(500);
      assertProgressBarHidden(container);
    });
  },

  testCompleteSignOut() {
    handler = new FirebaseUiHandler(container, configs);
    return handler.completeSignOut().then(() => {
      assertCompleteSignOutPageVisible(container);
      // signInUiShownCallback should not be triggered by complete sign out UI
      // shown.
      assertEquals(0, signInUiShownCallback.getCallCount());
      return handler.reset();
    }).then(() => {
      assertCompleteSignOutPageHidden(container);
    });
  },

  testHandleError() {
    handler = new FirebaseUiHandler(container, configs);
    // CIAP error with default error message.
    let code = 'invalid-argument';
    let errorMessage =
        strings.errorCIAP({code: code}).toString();
    let ciapError = mockCIAPError(code, errorMessage);
    handler.handleError(ciapError);
    assertErrorPageVisible(container, errorMessage, false);
    // signInUiShownCallback should not be triggered by error UI shown.
    assertEquals(0, signInUiShownCallback.getCallCount());

    // CIAP error with custom error message. The custom message should be
    // overridden by the default one.
    ciapError = mockCIAPError(code, 'custom message');
    handler.handleError(ciapError);
    assertErrorPageVisible(container, errorMessage, false);

    // Auth error with error message.
    code = 'auth/user-disabled';
    errorMessage =
        strings.errorCIAP({code: code}).toString();
    ciapError = mockCIAPError(code, errorMessage);
    handler.handleError(ciapError);
    assertErrorPageVisible(container, errorMessage, false);

    // GCIP error with error message.
    code = 'restart-process';
    errorMessage =
        strings.errorCIAP({code: code}).toString();
    ciapError = mockCIAPError(code, errorMessage);
    handler.handleError(ciapError);
    assertErrorPageVisible(container, errorMessage, false);

    // Error code not defined in FirebaseUI. Message in error will be displayed.
    errorMessage = 'Not defined error message.';
    ciapError = mockCIAPError('undefined-error-code', errorMessage);
    handler.handleError(ciapError);
    assertErrorPageVisible(container, errorMessage, false);
  },

  testHandleError_retry() {
    const code = 'auth/network-request-failed';
    const errorMessage =
        strings.errorCIAP({code: code}).toString();
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    handler.startSignIn(auth1);
    const onRetryClick = recordFunction();
    // Recoverable error with retry callback.
    const ciapError = mockCIAPError(code, errorMessage, onRetryClick);

    handler.handleError(ciapError);
    assertErrorPageVisible(container, errorMessage, true);
    const retryButton = getRetryButton(container);
    // Click the retry button should reset the UI and trigger the retry
    // callback.
    testingEvents.fireClickSequence(retryButton);
    mockClock.tick();
    // Error page should be hidden.
    assertErrorPageHidden(container);
    // UI should be reset.
    assertNull(AuthUI.getInstance());
    assertNull(handler.getCurrentAuthUI());
    // Retry callback should be triggered.
    assertEquals(1, onRetryClick.getCallCount());
  },

  testLanguageCode() {
    handler = new FirebaseUiHandler(container, configs);
    assertNull(handler.languageCode);
    handler.languageCode = 'en';
    assertEquals('en', handler.languageCode);
    handler.languageCode = null;
    assertNull(handler.languageCode);
  },

  testProcessUser() {
    const userCallback = recordFunction((user) => {
      // Mock updating displayName.
      user.displayName = 'Processed User';
      return GoogPromise.resolve(user);
    });
    // Set the beforeSignInSuccess callback in UI config.
    configs['API_KEY']['callbacks'] = {
      'beforeSignInSuccess': userCallback,
    };
    handler = new FirebaseUiHandler(container, configs);
    // This should always be called before the signed in user is determined.
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    // Mock the user to be processed is from tenant project tenant1.
    const user = {
      'uid': 'UID',
      'email': 'user@example.com',
      'displayName':'Sample User',
      'tenantId': 'tenant1',
    };
    // Mock the user is signed in on Auth instance.
    auth1.setUser(user);
    return handler.processUser(user).then((processedUser) => {
      // Verify that the user reference passed to provided callback is the
      // same as the one being processed.
      assertEquals(userCallback.getLastCall().getArgument(0), user);
      assertEquals(1, userCallback.getCallCount());
      // Verify that the user reference returned from provided callback is the
      // same as the one being processed.
      assertEquals(user, processedUser);
      assertEquals('Processed User', processedUser.displayName);
    });
  },

  testProcessUser_noCallback() {
    // Test the user is returned when no beforeSignInSuccess callback is
    // provided.
    handler = new FirebaseUiHandler(container, configs);
    // This should always be called before the signed in user is determined.
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    // Mock the user to be processed is from tenant project tenant1, in which
    // beforeSignInSuccess callback is not provided.
    const user = {
      'uid': 'UID',
      'email': 'user@example.com',
      'displayName':'Sample User',
      'tenantId': 'tenant1',
    };
    // Mock the user is signed in on Auth instance.
    auth1.setUser(user);
    return handler.processUser(user).then((processedUser) => {
      // Verify that the user reference returned from provided callback is the
      // same as the one being processed.
      assertEquals(user, processedUser);
      assertObjectEquals(user, processedUser);
    });
  },

  testProcessUser_reject() {
    const expectedError = new Error('error thrown in callback');
    const userCallback = recordFunction(
        (user) => GoogPromise.reject(expectedError));
    // Set the beforeSignInSuccess callback in UI config.
    configs['API_KEY']['callbacks'] = {
      'beforeSignInSuccess': userCallback,
    };
    handler = new FirebaseUiHandler(container, configs);
    // This should always be called before the signed in user is determined.
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    // Mock the user to be processed is from tenant project tenant1.
    const user = {
      'uid': 'UID',
      'email': 'user@example.com',
      'displayName':'Sample User',
      'tenantId': 'tenant1',
    };
    // Mock the user is signed in on Auth instance.
    auth1.setUser(user);
    return handler.processUser(user).then(fail, (error) => {
      // Verify that the user reference passed to provided callback is the
      // same as the one being processed.
      assertEquals(userCallback.getLastCall().getArgument(0), user);
      assertEquals(1, userCallback.getCallCount());
      // Verify promise is rejected with the same error thrown in callback.
      assertEquals(expectedError, error);
    });
  },

  testProcessUser_userMismatch() {
    // Test that if different user is returned in callback, error is thrown.
    const userCallback = recordFunction((user) => {
      const anotherUser = {
        'uid': 'MISMATCH_UID',
        'email': 'user@example.com',
        'displayName':'Sample User',
        'tenantId': 'tenant1',
      };
      return GoogPromise.resolve(anotherUser);
    });
    // Set the beforeSignInSuccess callback in UI config.
    configs['API_KEY']['callbacks'] = {
      'beforeSignInSuccess': userCallback,
    };
    handler = new FirebaseUiHandler(container, configs);
    // This should always be called before the signed in user is determined.
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    // Mock the user to be processed is from tenant project tenant1.
    const user = {
      'uid': 'UID',
      'email': 'user@example.com',
      'displayName':'Sample User',
      'tenantId': 'tenant1',
    };
    // Mock the user is signed in on Auth instance.
    auth1.setUser(user);
    return handler.processUser(user).then(fail, (error) => {
      // Verify that the user reference passed to provided callback is the
      // same as the one being processed.
      assertEquals(userCallback.getLastCall().getArgument(0), user);
      assertEquals(1, userCallback.getCallCount());
      assertEquals('User with mismatching UID returned.', error.message);
    });
  },

  testProcessUser_invalidConfigError() {
    handler = new FirebaseUiHandler(container, configs);
    auth1 = handler.getAuth('API_KEY', 'tenant1');
    // Mock the user to be processed is from tenant project invalid_tenant.
    const user = {
      'uid': 'UID',
      'email': 'user@example.com',
      'displayName':'Sample User',
      'tenantId': 'invalid_tenant',
    };
    return handler.processUser(user).then(fail, (error) => {
      assertEquals('Invalid tenant configuration!', error.message);
    });
  },
});
