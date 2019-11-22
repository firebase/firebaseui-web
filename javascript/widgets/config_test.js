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

/** @fileoverview Tests for config.js */

goog.module('firebaseui.auth.widget.ConfigTest');
goog.setTestOnly();

const Config = goog.require('firebaseui.auth.widget.Config');
const FakeUtil = goog.require('firebaseui.auth.testing.FakeUtil');
const PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
const googArray = goog.require('goog.array');
const log = goog.require('firebaseui.auth.log');
const testSuite = goog.require('goog.testing.testSuite');
const testing = goog.require('goog.testing');
const util = goog.require('firebaseui.auth.util');

let config;
const stub = new PropertyReplacer();
let testUtil;
let errorLogMessages = [];
let warningLogMessages = [];

testSuite({
  setUp() {
    config = new Config();
    // Remember error log messages.
    stub.replace(log, 'error', (msg) => {
      errorLogMessages.push(msg);
    });
    // Remember error warning messages.
    stub.replace(log, 'warning', (msg) => {
      warningLogMessages.push(msg);
    });
    goog.global.firebase = {};
    const firebase = goog.global.firebase;
    firebase.auth = {
      GoogleAuthProvider: {PROVIDER_ID: 'google.com'},
      GithubAuthProvider: {PROVIDER_ID: 'github.com'},
      FacebookAuthProvider: {PROVIDER_ID: 'facebook.com'},
      EmailAuthProvider: {
        EMAIL_LINK_SIGN_IN_METHOD: 'emailLink',
        EMAIL_PASSWORD_SIGN_IN_METHOD: 'password',
        PROVIDER_ID: 'password',
      },
      PhoneAuthProvider: {PROVIDER_ID: 'phone'},
    };
    testUtil = new FakeUtil().install();
  },

  tearDown() {
    errorLogMessages = [];
    warningLogMessages = [];
    stub.reset();
  },

  testGetAcUiConfig() {
    assertNull(config.getAcUiConfig());
    const ui = {favicon: 'http://localhost/favicon.ico'};
    config.update('acUiConfig', ui);
    assertObjectEquals(ui, config.getAcUiConfig());
  },

  testGetQueryParameterForSignInSuccessUrl() {
    // Confirm default value for query parameter for sign-in success URL.
    assertEquals(
        'signInSuccessUrl',
        config.getQueryParameterForSignInSuccessUrl());
    // Update query parameter.
    config.update('queryParameterForSignInSuccessUrl', 'continue');
    // Confirm value changed.
    assertEquals(
        'continue',
        config.getQueryParameterForSignInSuccessUrl());
  },

  testGetRequiredWidgetUrl() {
    assertThrows(() => {config.getRequiredWidgetUrl();});
    config.update('widgetUrl', 'http://localhost/callback');

    let widgetUrl = config.getRequiredWidgetUrl();
    assertEquals('http://localhost/callback', widgetUrl);
    widgetUrl = config.getRequiredWidgetUrl(
        Config.WidgetMode.SELECT);
    assertEquals('http://localhost/callback?mode=select', widgetUrl);

    config.update('queryParameterForWidgetMode', 'mode2');
    widgetUrl = config.getRequiredWidgetUrl(
        Config.WidgetMode.SELECT);
    assertEquals('http://localhost/callback?mode2=select', widgetUrl);
  },

  testFederatedProviderShouldImmediatelyRedirect() {
    // Returns true when immediateFederatedRedirect is set, there is
    // only one federated provider and the signInFlow is set to redirect.
    config.setConfig({
      'immediateFederatedRedirect': true,
      'signInOptions': [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
      'signInFlow': Config.SignInFlow.REDIRECT,
    });
    assertTrue(config.federatedProviderShouldImmediatelyRedirect());

    // Returns false if the immediateFederatedRedirect option is false.
    config.setConfig({
      'immediateFederatedRedirect': false,
      'signInOptions': [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
      'signInFlow': Config.SignInFlow.REDIRECT,
    });
    assertFalse(config.federatedProviderShouldImmediatelyRedirect());

    // Returns false if the provider is not a federated provider.
    config.setConfig({
      'immediateFederatedRedirect': true,
      'signInOptions': [firebase.auth.EmailAuthProvider.PROVIDER_ID],
      'signInFlow': Config.SignInFlow.REDIRECT,
    });
    assertFalse(config.federatedProviderShouldImmediatelyRedirect());

    // Returns false if there is more than one federated provider.
    config.setConfig({
      'immediateFederatedRedirect': true,
      'signInOptions': [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      ],
      'signInFlow': Config.SignInFlow.REDIRECT,
    });
    assertFalse(config.federatedProviderShouldImmediatelyRedirect());

    // Returns false if there is more than one provider of any kind.
    config.setConfig({
      'immediateFederatedRedirect': true,
      'signInOptions': [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      'signInFlow': Config.SignInFlow.REDIRECT,
    });
    assertFalse(config.federatedProviderShouldImmediatelyRedirect());

    // Returns false if signInFlow is using a popup.
    config.setConfig({
      'immediateFederatedRedirect': true,
      'signInOptions': [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
      'signInFlow': Config.SignInFlow.POPUP,
    });
    assertFalse(config.federatedProviderShouldImmediatelyRedirect());
  },

  testGetSignInFlow() {
    // Confirm default value for sign-in flow
    assertEquals(
        'redirect',
        config.getSignInFlow());
    // Update sign-in flow parameter to popup flow.
    config.update('signInFlow', 'popup');
    // Confirm value changed.
    assertEquals(
        'popup',
        config.getSignInFlow());
    // Use an invalid option. Redirect should be returned.
    // Update sign-in flow parameter.
    config.update('signInFlow', 'continue');
    assertEquals(
        'redirect',
        config.getSignInFlow());
  },

  testGetWidgetUrl_notSpecified() {
    let widgetUrl = config.getWidgetUrl();
    assertEquals(window.location.href, widgetUrl);
    widgetUrl = config.getWidgetUrl(
        Config.WidgetMode.SELECT);
    assertEquals(window.location.href + '?mode=select', widgetUrl);

    config.update('queryParameterForWidgetMode', 'mode2');
    widgetUrl = config.getWidgetUrl(
        Config.WidgetMode.SELECT);
    assertEquals(window.location.href + '?mode2=select', widgetUrl);
  },

  testGetWidgetUrl_notSpecified_withQueryAndFragment() {
    // Simulate current URL has mode/mode2 queries, other query parameters and a
    // fragment.
    stub.replace(
        util,
        'getCurrentUrl',
        () => 'http://www.example.com/path/?mode=foo&mode2=bar#a=1');
    let widgetUrl = config.getWidgetUrl();
    // The same current URL should be returned.
    assertEquals(
        util.getCurrentUrl(), widgetUrl);
    // Only the mode query param should be overwritten.
    widgetUrl = config.getWidgetUrl(
        Config.WidgetMode.SELECT);
    assertEquals(
        'http://www.example.com/path/?mode2=bar&mode=select#a=1', widgetUrl);

    // Only the mode2 query param should be overwritten.
    config.update('queryParameterForWidgetMode', 'mode2');
    widgetUrl = config.getWidgetUrl(
        Config.WidgetMode.SELECT);
    assertEquals(
        'http://www.example.com/path/?mode=foo&mode2=select#a=1', widgetUrl);
  },

  testGetWidgetUrl_specified() {
    config.update('widgetUrl', 'http://localhost/callback');
    let widgetUrl = config.getWidgetUrl();
    assertEquals('http://localhost/callback', widgetUrl);
    widgetUrl = config.getWidgetUrl(
        Config.WidgetMode.SELECT);
    assertEquals('http://localhost/callback?mode=select', widgetUrl);

    config.update('queryParameterForWidgetMode', 'mode2');
    widgetUrl = config.getWidgetUrl(
        Config.WidgetMode.SELECT);
    assertEquals('http://localhost/callback?mode2=select', widgetUrl);
  },

  testGetSignInSuccessUrl() {
    assertUndefined(config.getSignInSuccessUrl());
    config.update('signInSuccessUrl', 'http://localhost/home');
    assertEquals(
        'http://localhost/home', config.getSignInSuccessUrl());
  },

  testGetProviders_providerIds() {
    assertArrayEquals([], config.getProviders());
    config.update('signInOptions', ['google.com', 'github.com', 'twitter.com']);
    // Check that predefined OAuth providers are included in the list in the
    // correct order.
    assertArrayEquals(
        ['google.com', 'github.com', 'twitter.com'],
        config.getProviders());

    // Test when password accounts are to be enabled.
    config.update('signInOptions', ['google.com', 'password']);
    // Check that password accounts are included in the list in the correct
    // order.
    assertArrayEquals(['google.com', 'password'], config.getProviders());

    // Test when phone accounts are to be enabled.
    config.update('signInOptions', ['google.com', 'phone']);
    // Check that phone accounts are included in the list in the correct
    // order.
    assertArrayEquals(['google.com', 'phone'], config.getProviders());

    // Test when anonymous provider is to be enabled.
    config.update('signInOptions', ['google.com', 'anonymous']);
    // Check that anonymous provider is included in the list in the correct
    // order.
    assertArrayEquals(['google.com', 'anonymous'], config.getProviders());

    // Test when generic provider is to be enabled.
    config.update('signInOptions',
                  [
                    'google.com',
                    {
                      'provider': 'microsoft.com',
                      'providerName': 'Microsoft',
                      'buttonColor': '#FFB6C1',
                      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
                    },
                  ]);
    // Check that generic provider is included in the list in the correct
    // order.
    assertArrayEquals(['google.com', 'microsoft.com'], config.getProviders());
  },

  testGetProviders_fullConfig() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'scopes': ['foo', 'bar'],
      },
      {'provider': 'github.com'},
      'facebook.com',
      {
        'provider': 'microsoft.com',
        'providerName': 'Microsoft',
        'buttonColor': '#FFB6C1',
        'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',

      },
      {'not a': 'valid config'},
      {'provider': 'phone', 'recaptchaParameters': {'size': 'invisible'}},
      {'provider': 'anonymous'},
    ]);
    // Check that invalid configs are not included.
    assertArrayEquals(
        ['google.com', 'github.com', 'facebook.com', 'microsoft.com', 'phone',
         'anonymous'],
        config.getProviders());
  },

  testGetProviderConfigs() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'scopes': ['foo', 'bar'],
        // providerName, buttonColor and iconUrl should be override with null.
        'providerName': 'Google',
        'buttonColor': '#FFB6C1',
        'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
      },
      'facebook.com',
      {
        'provider': 'microsoft.com',
        'providerName': 'Microsoft',
        'buttonColor': '#FFB6C1',
        'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
        'loginHintKey': 'login_hint',
      },
      {'not a': 'valid config'},
      {
        'provider': 'yahoo.com',
      },
    ]);
    const providerConfigs = config.getProviderConfigs();
    assertEquals(4, providerConfigs.length);
    assertObjectEquals({
      providerId: 'google.com',
    }, providerConfigs[0]);
    assertObjectEquals({
      providerId: 'facebook.com',
    }, providerConfigs[1]);
    assertObjectEquals({
      providerId: 'microsoft.com',
      providerName: 'Microsoft',
      buttonColor: '#FFB6C1',
      iconUrl: '<url-of-the-icon-of-the-sign-in-button>',
      loginHintKey: 'login_hint',
    }, providerConfigs[2]);
    assertObjectEquals({
      providerId: 'yahoo.com',
      providerName: null,
      buttonColor: null,
      iconUrl: null,
      loginHintKey: null,
    }, providerConfigs[3]);
  },

  testGetConfigForProvider() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'scopes': ['foo', 'bar'],
        // providerName, buttonColor and iconUrl should be override with null.
        'providerName': 'Google',
        'buttonColor': '#FFB6C1',
        'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
      },
      'facebook.com',
      {
        'provider': 'microsoft.com',
        'providerName': 'Microsoft',
        'buttonColor': '#FFB6C1',
        'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
        'loginHintKey': 'login_hint',
      },
      {'not a': 'valid config'},
      {
        'provider': 'yahoo.com',
        'providerName': 'Yahoo',
        'buttonColor': '#FFB6C1',
        'iconUrl': 'javascript:doEvilStuff()',
      },
    ]);
    assertObjectEquals({
      providerId: 'google.com',
    }, config.getConfigForProvider('google.com'));
    assertObjectEquals({
      providerId: 'facebook.com',
    }, config.getConfigForProvider('facebook.com'));
    assertObjectEquals({
      providerId: 'microsoft.com',
      providerName: 'Microsoft',
      buttonColor: '#FFB6C1',
      iconUrl: '<url-of-the-icon-of-the-sign-in-button>',
      loginHintKey: 'login_hint',
    }, config.getConfigForProvider('microsoft.com'));
    assertNull(config.getConfigForProvider('INVALID_ID'));
    assertObjectEquals({
      providerId: 'yahoo.com',
      providerName: 'Yahoo',
      buttonColor: '#FFB6C1',
      iconUrl: 'about:invalid#zClosurez',
      loginHintKey: null,
    }, config.getConfigForProvider('yahoo.com'));
  },

  testGetRecaptchaParameters() {
    // Empty config.
    assertNull(config.getRecaptchaParameters());

    // No phone provider config.
    config.update('signInOptions', [{'provider': 'google.com'}]);
    assertNull(config.getRecaptchaParameters());

    // Phone config with no additional parameters.
    config.update(
        'signInOptions',
        ['github.com', {'provider': 'google.com'}, {'provider': 'phone'}]);
    assertNull(config.getRecaptchaParameters());

      // Phone config with invalid reCAPTCHA parameters.
    config.update(
        'signInOptions',
        ['github.com', {'provider': 'google.com'},
         {'provider': 'phone', 'recaptchaParameters': [1, true]}, 'password']);
    assertNull(config.getRecaptchaParameters());

    // Phone config with an empty object reCAPTCHA parameters.
    config.update(
        'signInOptions',
        ['github.com', {'provider': 'google.com'},
         {'provider': 'phone', 'recaptchaParameters': {}}, 'password']);
    assertObjectEquals({}, config.getRecaptchaParameters());

    // Confirm no warning logged so far.
    assertArrayEquals([], warningLogMessages);

    // Phone config with blacklisted reCAPTCHA parameters.
    const blacklist = {
      'sitekey': 'SITEKEY',
      'tabindex': 0,
      'callback': function(token) {},
      'expired-callback': function() {},
    };
    config.update(
        'signInOptions',
        ['github.com', {'provider': 'google.com'},
         {'provider': 'phone', 'recaptchaParameters': blacklist}, 'password']);
    assertObjectEquals({}, config.getRecaptchaParameters());
    // Expected warning should be logged.
    assertArrayEquals(
        [
          'The following provided "recaptchaParameters" keys are not ' +
          'allowed: sitekey, tabindex, callback, expired-callback',
        ], warningLogMessages);
    // Reset warnings.
    warningLogMessages = [];

    // Phone config with blacklisted, valid and invalid reCAPTCHA parameters.
    const mixed = {
      'sitekey': 'SITEKEY',
      'tabindex': 0,
      'callback': function(token) {},
      'expired-callback': function() {},
      'type': 'audio',
      'size': 'invisible',
      'badge': 'bottomleft',
      'theme': 'dark',
      'foo': 'bar',
    };
    const expectedParameters = {
      'type': 'audio',
      'size': 'invisible',
      'badge': 'bottomleft',
      'theme': 'dark',
      'foo': 'bar',
    };
    config.update(
        'signInOptions',
        ['github.com', {'provider': 'google.com'},
         {'provider': 'phone', 'recaptchaParameters': mixed}, 'password']);
    assertObjectEquals(expectedParameters, config.getRecaptchaParameters());
    // Expected warning should be logged.
    assertArrayEquals(
        [
          'The following provided "recaptchaParameters" keys are not ' +
          'allowed: sitekey, tabindex, callback, expired-callback',
        ], warningLogMessages);

    // No error should be logged.
    assertArrayEquals([], errorLogMessages);
  },

  testGetProviderCustomParameters_noSignInOptions() {
    config.update('signInOptions', null);
    assertNull(config.getProviderCustomParameters('google.com'));
  },

  testGetProviderCustomParameters_genericProvider() {
    config.update('signInOptions', [{
      'provider': 'microsoft.com',
      'providerName': 'Microsoft',
      'buttonColor': '#FFB6C1',
      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
      'customParameters': {'foo': 'bar'},
    }]);
    assertObjectEquals({'foo': 'bar'},
                       config.getProviderCustomParameters('microsoft.com'));
  },

  testGetProviderCustomParameters_missingCustomParameters() {
    config.update('signInOptions', [{
      'provider': 'google.com',
    }]);
    assertNull(config.getProviderCustomParameters('google.com'));
  },

  testGetProviderCustomParameters_multipleIdp() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'scopes': ['google1', 'google2'],
        'customParameters': {
          'prompt': 'select_account',
          'login_hint': 'user@example.com',
        },
      },
      {
        'provider': 'facebook.com',
        'scopes': ['facebook1', 'facebook2'],
        'customParameters': {
          'display': 'popup',
          'auth_type': 'rerequest',
          'locale': 'pt_BR',
        },
      },
      'github.com',
    ]);
    assertObjectEquals(
        {'prompt': 'select_account'},
        config.getProviderCustomParameters('google.com'));
    assertObjectEquals(
        {
          'display': 'popup',
          'auth_type': 'rerequest',
          'locale': 'pt_BR',
        },
        config.getProviderCustomParameters('facebook.com'));
    assertNull(config.getProviderCustomParameters('github.com'));
    assertNull(config.getProviderCustomParameters('twitter.com'));
  },

  testGetProviderCustomParameters_github() {
    config.update('signInOptions', [
      {
        'provider': 'github.com',
        'customParameters': {
          'allow_signup': 'false',
          'login': 'user@example.com',
        },
      },
    ]);
    // login custom parameter should be deleted.
    assertObjectEquals(
        {
          'allow_signup': 'false',
        },
        config.getProviderCustomParameters('github.com'));
  },

  testIsAccountSelectionPromptEnabled_googleLoginHint() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'customParameters': {
          'prompt': 'select_account',
          'login_hint': 'user@example.com',
        },
      },
      {
        'provider': 'facebook.com',
        'customParameters': {
          'display': 'popup',
          'auth_type': 'rerequest',
          'locale': 'pt_BR',
        },
      },
      'github.com',
    ]);
    assertTrue(config.isAccountSelectionPromptEnabled());
  },

  testIsAccountSelectionPromptEnabled_nonGoogleLoginHint() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'customParameters': {
          'prompt': 'none',
          'login_hint': 'user@example.com',
        },
      },
      {
        'provider': 'facebook.com',
        'customParameters': {
          'display': 'popup',
          'auth_type': 'rerequest',
          'locale': 'pt_BR',
          // This does nothing.
          'prompt': 'select_account',
        },
      },
      'github.com',
      'password',
    ]);
    assertFalse(config.isAccountSelectionPromptEnabled());
  },

  testIsAccountSelectionPromptEnabled_noCustomParameter() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'scopes': ['google1', 'google2'],
      },
      'github.com',
    ]);
    assertFalse(config.isAccountSelectionPromptEnabled());
  },

  testIsAccountSelectionPromptEnabled_noAdditionalParameters() {
    config.update('signInOptions', [
      'google.com',
    ]);
    assertFalse(config.isAccountSelectionPromptEnabled());
  },

  testIsAccountSelectionPromptEnabled_noOAuthProvider() {
    config.update('signInOptions', [
      'phone',
      'password',
    ]);
    assertFalse(config.isAccountSelectionPromptEnabled());
  },

  testGetProviderIdFromAuthMethod() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'customParameters': {
          'prompt': 'none',
        },
        'authMethod': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com',
      },
      {
        'provider': 'password',
        'authMethod': 'googleyolo://id-and-password',
      },
      {
        'authMethod': 'unknown',
      },
    ]);
    assertEquals(
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        config.getProviderIdFromAuthMethod('https://accounts.google.com'));
    assertEquals(
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        config.getProviderIdFromAuthMethod('googleyolo://id-and-password'));
    // Test with authMethod that is not provided in the configuration.
    assertNull(config.getProviderIdFromAuthMethod('https://www.facebook.com'));
    // Test with null authMethod.
    assertNull(config.getProviderIdFromAuthMethod(null));
    // Test with authMethod that does not have a provider ID in the
    // configuration.
    assertNull(config.getProviderIdFromAuthMethod('unknown'));
  },

  testGetGoogleYoloConfig_availableAndEnabled() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'customParameters': {
          'prompt': 'none',
        },
        'authMethod': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com',
      },
      {
        'provider': 'password',
        'authMethod': 'googleyolo://id-and-password',
      },
      {
        'authMethod': 'unknown',
      },
      {
        'provider': 'facebook.com',
        // authMethod is required.
        'clientId': 'CLIENT_ID',
      },
    ]);
    // GOOGLE_YOLO credentialHelper must be selected.
    config.update(
        'credentialHelper',
        Config.CredentialHelper.GOOGLE_YOLO);
    const expectedConfig = {
      'supportedAuthMethods': [
        'https://accounts.google.com',
        'googleyolo://id-and-password',
      ],
      'supportedIdTokenProviders': [
        {
          'uri': 'https://accounts.google.com',
          'clientId': '1234567890.apps.googleusercontent.com',
        },
      ],
    };
    assertObjectEquals(expectedConfig, config.getGoogleYoloConfig());
  },

  testGetGoogleYoloConfig_notEnabled() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'customParameters': {
          'prompt': 'none',
        },
        'authMethod': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com',
      },
      {
        'provider': 'password',
        'authMethod': 'googleyolo://id-and-password',
      },
      {
        'authMethod': 'unknown',
      },
      {
        'provider': 'facebook.com',
        // authMethod is required.
        'clientId': 'CLIENT_ID',
      },
    ]);
    // GOOGLE_YOLO credentialHelper not selected.
    config.update(
        'credentialHelper', Config.CredentialHelper.NONE);
    assertNull(config.getGoogleYoloConfig());
  },

  testGetGoogleYoloConfig_notAvailable() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'customParameters': {
          'prompt': 'none',
          'login_hint': 'user@example.com',
        },
      },
      {
        'provider': 'facebook.com',
        'customParameters': {
          'display': 'popup',
          'auth_type': 'rerequest',
          'locale': 'pt_BR',
        },
      },
      'github.com',
      'password',
      // authMethod with no provider.
      {
        'authMethod': 'unknown',
      },
      // clientId with no authMethod.
      {
        'provider': 'facebook.com',
        // authMethod is required.
        'clientId': 'CLIENT_ID',
      },
    ]);
    // GOOGLE_YOLO credentialHelper is selected.
    config.update(
        'credentialHelper',
        Config.CredentialHelper.GOOGLE_YOLO);
    assertNull(config.getGoogleYoloConfig());
  },

  testGetPhoneAuthDefaultCountry() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'defaultCountry': 'gb',
    }]);
    assertEquals('United Kingdom', config.getPhoneAuthDefaultCountry().name);
    assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
  },

  testGetPhoneAuthDefaultCountry_defaultCountryAndLoginHint() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'defaultCountry': 'gb',
      // loginHint will be ignored in favor of the above.
      'loginHint': '+112345678890',
    }]);
    assertEquals('United Kingdom', config.getPhoneAuthDefaultCountry().name);
    assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
  },

  testGetPhoneAuthDefaultCountry_loginHintOnly() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'loginHint': '+4412345678890',
    }]);
    assertEquals('Guernsey', config.getPhoneAuthDefaultCountry().name);
    assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
  },

  testGetPhoneAuthDefaultCountry_null() {
    config.update('signInOptions', null);
    assertNull(config.getPhoneAuthDefaultCountry());
  },

  testGetPhoneAuthDefaultCountry_noCountrySpecified() {
    config.update('signInOptions', [{
      'provider': 'phone',
    }]);
    assertNull(config.getPhoneAuthDefaultCountry());
  },

  testGetPhoneAuthDefaultCountry_invalidIdp() {
    config.update('signInOptions', [{
      'provider': 'google.com',
      'defaultCountry': 'gb',
      'loginHint': '+112345678890',
    }]);
    assertNull(config.getPhoneAuthDefaultCountry());
  },

  testGetPhoneAuthDefaultCountry_invalidCountry() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'defaultCountry': 'zz',
    }]);
    assertNull(config.getPhoneAuthDefaultCountry());
  },

  testGetPhoneAuthDefaultCountry_invalidDefaultCountry_loginHint() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'defaultCountry': 'zz',
      'loginHint': '+112345678890',
    }]);
    // Since the defaultCountry is invalid, loginHint will be used instead.
    assertEquals('United States', config.getPhoneAuthDefaultCountry().name);
    assertEquals('1', config.getPhoneAuthDefaultCountry().e164_cc);
  },

  testGetPhoneAuthDefaultNationalNumber() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'defaultCountry': 'us',
      'defaultNationalNumber': '1234567890',
    }]);
    assertEquals('1234567890', config.getPhoneAuthDefaultNationalNumber());
  },

  testGetPhoneAuthDefaultNationalNumber_defaultNationalNumberAndHint() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'defaultNationalNumber': '1234567890',
      // loginHint will be ignored in favor of the above.
      'loginHint': '+12223334444',
    }]);
    assertEquals('1234567890', config.getPhoneAuthDefaultNationalNumber());
  },

  testGetPhoneAuthDefaultNationalNumber_loginHintOnly() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'loginHint': '+12223334444',
    }]);
    assertEquals('2223334444', config.getPhoneAuthDefaultNationalNumber());
  },

  testGetPhoneAuthDefaultNationalNumber_null() {
    config.update('signInOptions', null);
    assertNull(config.getPhoneAuthDefaultNationalNumber());
  },

  testGetPhoneAuthDefaultNationalNumber_noNationalNumberSpecified() {
    config.update('signInOptions', [{
      'provider': 'phone',
    }]);
    assertNull(config.getPhoneAuthDefaultNationalNumber());
  },

  testGetPhoneAuthDefaultNationalNumber_invalidIdp() {
    config.update('signInOptions', [{
      'provider': 'google.com',
      'defaultCountry': 'ca',
      'defaultNationalNumber': '1234567890',
      'loginHint': '+12223334444',
    }]);
    assertNull(config.getPhoneAuthDefaultNationalNumber());
  },

  testGetPhoneAuthSelectedCountries_whitelist() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'whitelistedCountries': ['+44', 'us'],
    }]);
    const countries = config.getPhoneAuthAvailableCountries();
    const actualKeys = googArray.map(countries, (country) => country.e164_key);
    assertSameElements(
        ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0', '1-US-0'], actualKeys);
  },

  testGetPhoneAuthSelectedCountries_whitelist_overlap() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'whitelistedCountries': ['+44', 'GB'],
    }]);
    const countries = config.getPhoneAuthAvailableCountries();
    const actualKeys = googArray.map(countries, (country) => country.e164_key);
    assertSameElements(
        ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0'], actualKeys);
  },

  testGetPhoneAuthSelectedCountries_blacklist() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'blacklistedCountries': ['+44', 'US'],
    }]);
    const countries = config.getPhoneAuthAvailableCountries();
    // BlacklistedCountries should not appear in the available countries list.
    const blacklistedKeys =
        ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0', '1-US-0'];
    for (let i = 0; i < countries.length; i++) {
      assertNotContains(countries[i].e164_key, blacklistedKeys);
    }
  },

  testGetPhoneAuthSelectedCountries_blacklist_overlap() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'blacklistedCountries': ['+44', 'GB'],
    }]);
    const countries = config.getPhoneAuthAvailableCountries();
    // BlacklistedCountries should not appear in the available countries list.
    const blacklistedKeys = ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0'];
    for (let i = 0; i < countries.length; i++) {
      assertNotContains(countries[i].e164_key, blacklistedKeys);
    }
  },

  testGetPhoneAuthSelectedCountries_noBlackOrWhiteListProvided() {
    config.update('signInOptions', [{
      'provider': 'phone',
    }]);
    const countries = config.getPhoneAuthAvailableCountries();
    assertSameElements(firebaseui.auth.data.country.COUNTRY_LIST, countries);
  },

  testGetPhoneAuthSelectedCountries_emptyBlacklist() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'blacklistedCountries': [],
    }]);
    const countries = config.getPhoneAuthAvailableCountries();
    assertSameElements(firebaseui.auth.data.country.COUNTRY_LIST, countries);
  },

  testUpdateConfig_phoneSignInOption_error() {
    // Tests when both whitelist and blacklist are provided.
    let error = assertThrows(() => {
      config.update('signInOptions', [{
        'provider': 'phone',
        'blacklistedCountries': ['+44'],
        'whitelistedCountries': ['+1'],
      }]);
    });
    assertEquals(
        'Both whitelistedCountries and blacklistedCountries are provided.',
        error.message);
    // Tests when empty whitelist is provided.
    error = assertThrows(() => {
      config.update('signInOptions', [{
        'provider': 'phone',
        'whitelistedCountries': [],
      }]);
    });
    assertEquals(
        'WhitelistedCountries must be a non-empty array.',
        error.message);
    // Tests string is provided as whitelistedCountries.
    error = assertThrows(() => {
      config.update('signInOptions', [{
        'provider': 'phone',
        'whitelistedCountries': 'US',
      }]);
    });
    assertEquals(
        'WhitelistedCountries must be a non-empty array.',
        error.message);
    // Tests falsy value is provided as whitelistedCountries.
    error = assertThrows(() => {
      config.update('signInOptions', [{
        'provider': 'phone',
        'whitelistedCountries': 0,
      }]);
    });
    assertEquals(
        'WhitelistedCountries must be a non-empty array.',
        error.message);
    // Tests string is provided as blacklistedCountries.
    error = assertThrows(() => {
      config.update('signInOptions', [{
        'provider': 'phone',
        'blacklistedCountries': 'US',
      }]);
    });
    assertEquals(
        'BlacklistedCountries must be an array.',
        error.message);
    // Tests falsy value is provided as blacklistedCountries.
    error = assertThrows(() => {
      config.update('signInOptions', [{
        'provider': 'phone',
        'blacklistedCountries': 0,
      }]);
    });
    assertEquals(
        'BlacklistedCountries must be an array.',
        error.message);
  },

  testSetConfig_phoneSignInOption_error() {
    // Tests when both whitelist and blacklist are provided.
    let error = assertThrows(() => {
      config.setConfig({
        'signInOptions': [{
          'provider': 'phone',
          'blacklistedCountries': ['+44'],
          'whitelistedCountries': ['+1'],
        }],
      });
    });
    assertEquals(
        'Both whitelistedCountries and blacklistedCountries are provided.',
        error.message);
    // Tests when empty whitelist is provided.
    error = assertThrows(() => {
      config.setConfig({
        'signInOptions': [{
          'provider': 'phone',
          'whitelistedCountries': [],
        }],
      });
    });
    assertEquals(
        'WhitelistedCountries must be a non-empty array.',
        error.message);
    // Tests string is provided as whitelistedCountries.
    error = assertThrows(() => {
      config.setConfig({
        'signInOptions': [
          {
            'provider': 'phone',
            'whitelistedCountries': 'US',
          }],
      });
    });
    assertEquals(
        'WhitelistedCountries must be a non-empty array.',
        error.message);
    // Tests falsy value is provided as whitelistedCountries.
    error = assertThrows(() => {
      config.setConfig({
        'signInOptions': [
          {
            'provider': 'phone',
            'whitelistedCountries': 0,
          }],
      });
    });
    assertEquals(
        'WhitelistedCountries must be a non-empty array.',
        error.message);
    // Tests string is provided as blacklistedCountries.
    error = assertThrows(() => {
      config.setConfig({
        'signInOptions': [
          {
            'provider': 'phone',
            'blacklistedCountries': 'US',
          }],
      });
    });
    assertEquals(
        'BlacklistedCountries must be an array.',
        error.message);
    // Tests falsy value is provided as blacklistedCountries.
    error = assertThrows(() => {
      config.setConfig({
        'signInOptions': [
          {
            'provider': 'phone',
            'blacklistedCountries': 0,
          }],
      });
    });
    assertEquals(
        'BlacklistedCountries must be an array.',
        error.message);
  },

  testGetProviderAdditionalScopes_noSignInOptions() {
    config.update('signInOptions', null);
    assertArrayEquals([], config.getProviderAdditionalScopes('google.com'));
  },

  testGetProviderAdditionalScopes_genericProvider() {
    config.update('signInOptions', [{
      'provider': 'microsoft.com',
      'providerName': 'Microsoft',
      'buttonColor': '#FFB6C1',
      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
      'scopes': ['foo', 'bar'],
    }]);
    assertArrayEquals(['foo', 'bar'],
                      config.getProviderAdditionalScopes('microsoft.com'));
  },

  testGetProviderAdditionalScopes_missingScopes() {
    config.update('signInOptions', [{
      'provider': 'google.com',
    }]);
    assertArrayEquals([], config.getProviderAdditionalScopes('google.com'));
  },

  testGetProviderAdditionalScopes_multipleIdp() {
    config.update('signInOptions', [
      {
        'provider': 'google.com',
        'scopes': ['google1', 'google2'],
      },
      {
        'provider': 'github.com',
        'scopes': ['github1', 'github2'],
      },
      'facebook.com',
    ]);
    assertArrayEquals(
        ['google1', 'google2'],
        config.getProviderAdditionalScopes('google.com'));
    assertArrayEquals(
        ['github1', 'github2'],
        config.getProviderAdditionalScopes('github.com'));
    assertArrayEquals(
        [],
        config.getProviderAdditionalScopes('facebook.com'));
    assertArrayEquals(
        [],
        config.getProviderAdditionalScopes('twitter.com'));
  },

  testGetQueryParameterForWidgetMode() {
    assertEquals('mode', config.getQueryParameterForWidgetMode());
    config.update('queryParameterForWidgetMode', 'mode2');
    assertEquals('mode2', config.getQueryParameterForWidgetMode());
  },

  testGetTosUrl() {
    assertNull(config.getTosUrl());
    config.update('tosUrl', 'http://localhost/tos');
    assertNull(config.getTosUrl());
    // Expected warning should be logged.
    assertArrayEquals(
        [
          'Privacy Policy URL is missing, the link will not be displayed.',
        ], warningLogMessages);
    config.update('privacyPolicyUrl', 'http://localhost/privacy_policy');
    let tosCallback = config.getTosUrl();
    tosCallback();
    testUtil.assertOpen('http://localhost/tos', '_blank');
    // No additional warning logged.
    assertArrayEquals(
        [
          'Privacy Policy URL is missing, the link will not be displayed.',
        ], warningLogMessages);
    // Mock that Cordova InAppBrowser plugin is installed.
    stub.replace(
        util,
        'isCordovaInAppBrowserInstalled',
        () => true);
    tosCallback = config.getTosUrl();
    tosCallback();
    // Target should be _system if Cordova InAppBrowser plugin is installed.
    testUtil.assertOpen('http://localhost/tos', '_system');
    // Tests if callback function is passed to tosUrl config.
    tosCallback = () => {};
    config.update('tosUrl', tosCallback);
    assertEquals(tosCallback, config.getTosUrl());
    // Tests if invalid tyoe is passed to tosUrl config.
    config.update('tosUrl', 123456);
    assertNull(config.getTosUrl());
  },

  testGetPrivacyPolicyUrl() {
    assertNull(config.getPrivacyPolicyUrl());
    config.update('privacyPolicyUrl', 'http://localhost/privacy_policy');
    assertNull(config.getPrivacyPolicyUrl());
    // Expected warning should be logged.
    assertArrayEquals(
        [
          'Term of Service URL is missing, the link will not be displayed.',
        ], warningLogMessages);
    config.update('tosUrl', 'http://localhost/tos');
    let privacyPolicyCallback = config.getPrivacyPolicyUrl();
    privacyPolicyCallback();
    testUtil.assertOpen('http://localhost/privacy_policy', '_blank');
    // No additional warning logged.
    assertArrayEquals(
        [
          'Term of Service URL is missing, the link will not be displayed.',
        ], warningLogMessages);
    // Mock that Cordova InAppBrowser plugin is installed.
    stub.replace(
        util,
        'isCordovaInAppBrowserInstalled',
        () => true);
    privacyPolicyCallback = config.getPrivacyPolicyUrl();
    privacyPolicyCallback();
    // Target should be _system if Cordova InAppBrowser plugin is installed.
    testUtil.assertOpen('http://localhost/privacy_policy', '_system');
    // Tests if callback function is passed to privacyPolicyUrl config.
    privacyPolicyCallback = () => {};
    config.update('privacyPolicyUrl', privacyPolicyCallback);
    assertEquals(privacyPolicyCallback, config.getPrivacyPolicyUrl());
    // Tests if invalid tyoe is passed to tosUrl config.
    config.update('privacyPolicyUrl', 123456);
    assertNull(config.getPrivacyPolicyUrl());
  },

  testRequireDisplayName_shouldBeTrueByDefault() {
    assertTrue(config.isDisplayNameRequired());
  },

  testRequireDisplayName_canBeSet() {
    config.update('signInOptions', [
      {
        'provider': 'password',
        'requireDisplayName': true,
      },
    ]);
    assertTrue(config.isDisplayNameRequired());

    config.update('signInOptions', [
      {
        'provider': 'password',
        'requireDisplayName': false,
      },
    ]);
    assertFalse(config.isDisplayNameRequired());
  },

  testRequireDisplayName_isTrueWithNonBooleanArgs() {
    config.update('signInOptions', [
      {
        'provider': 'password',
        'requireDisplayName': 'a string',
      },
    ]);
    assertTrue(config.isDisplayNameRequired());
  },

  testEmailProviderConfig_passwordAllowed() {
    config.update('signInOptions', [
      {
        'provider': 'password',
      },
    ]);
    assertTrue(config.isEmailPasswordSignInAllowed());
    assertFalse(config.isEmailLinkSignInAllowed());
    assertFalse(config.isEmailLinkSameDeviceForced());
    assertNull(config.getEmailLinkSignInActionCodeSettings());

    // Even if emailLinkSignIn is provided, it should still be ignored.
    config.update('signInOptions', [
      {
        'provider': 'password',
        'emailLinkSignIn': function() {
          return {
            'url': util.getCurrentUrl(),
          };
        },
      },
    ]);
    assertTrue(config.isEmailPasswordSignInAllowed());
    assertFalse(config.isEmailLinkSignInAllowed());
    assertFalse(config.isEmailLinkSameDeviceForced());
    assertNull(config.getEmailLinkSignInActionCodeSettings());
  },

  testEmailProviderConfig_emailLinkAllowed() {
    stub.replace(
        util,
        'getCurrentUrl',
        () => 'https://www.example.com/path/?mode=foo&mode2=bar#a=1');
    const originalActionCodeSettings = {
      'url': 'https://other.com/handleSignIn',
      'dynamicLinkDomain': 'example.page.link',
      'iOS': {
        'bundleId': 'com.example.ios',
      },
      'android': {
        'packageName': 'com.example.android',
        'installApp': true,
        'minimumVersion': '12',
      },
    };
    const expectedActionCodeSettings = {
      'url': 'https://other.com/handleSignIn',
      'handleCodeInApp': true,
      'dynamicLinkDomain': 'example.page.link',
      'iOS': {
        'bundleId': 'com.example.ios',
      },
      'android': {
        'packageName': 'com.example.android',
        'installApp': true,
        'minimumVersion': '12',
      },
    };

    config.update('signInOptions', [
      {
        'provider': 'password',
        'signInMethod':
            firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
      },
    ]);
    assertFalse(config.isEmailPasswordSignInAllowed());
    assertTrue(config.isEmailLinkSignInAllowed());
    assertFalse(config.isEmailLinkSameDeviceForced());
    assertObjectEquals(
        {
          'url': util.getCurrentUrl(),
          'handleCodeInApp': true,
        },
        config.getEmailLinkSignInActionCodeSettings());

    // Same device flow and explicit actionCodeUrl.
    config.update('signInOptions', [
      {
        'provider': 'password',
        'signInMethod':
            firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
        'forceSameDevice': true,
        'emailLinkSignIn': function() {
          return originalActionCodeSettings;
        },
      },
    ]);
    assertFalse(config.isEmailPasswordSignInAllowed());
    assertTrue(config.isEmailLinkSignInAllowed());
    assertTrue(config.isEmailLinkSameDeviceForced());
    assertObjectEquals(
        expectedActionCodeSettings,
        config.getEmailLinkSignInActionCodeSettings());

    // Relative URL in actionCodeUrl.
    config.update('signInOptions', [
      {
        'provider': 'password',
        'signInMethod':
            firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
        'forceSameDevice': true,
        'emailLinkSignIn': function() {
          return {
            // Relative path will be resolved relative to current URL.
            'url': '../completeSignIn?a=1#b=2',
          };
        },
      },
    ]);
    assertFalse(config.isEmailPasswordSignInAllowed());
    assertTrue(config.isEmailLinkSignInAllowed());
    assertTrue(config.isEmailLinkSameDeviceForced());
    assertObjectEquals(
        {
          'url': 'https://www.example.com/completeSignIn?a=1#b=2',
          'handleCodeInApp': true,
        },
        config.getEmailLinkSignInActionCodeSettings());
  },

  testSetConfig() {
    config.setConfig({
      tosUrl: 'www.testUrl1.com',
      privacyPolicyUrl: 'www.testUrl2.com',
    });
    const tosCallback = config.getTosUrl();
    tosCallback();
    testUtil.assertOpen('www.testUrl1.com', '_blank');
    const privacyPolicyCallback = config.getPrivacyPolicyUrl();
    privacyPolicyCallback();
    testUtil.assertOpen('www.testUrl2.com', '_blank');
  },

  testSetConfig_nonDefined() {
    config.setConfig({test1: 1, test2: 2});
    assertArrayEquals(
        [
          'Invalid config: "test1"',
          'Invalid config: "test2"',
        ], errorLogMessages);
  },

  testPopupInMobileBrowser() {
    testing.createMethodMock(util, 'isMobileBrowser');
    util.isMobileBrowser().$returns(true);
    util.isMobileBrowser().$replay();
    config.setConfig({
      popupMode: true});

    assertFalse(config.getPopupMode());
    util.isMobileBrowser.$tearDown();
  },

  testGetCallbacks() {
    const uiShownCallback = () => {};
    const signInSuccessCallback = () => true;
    const signInSuccessWithAuthResultCallback = () => true;
    const uiChangedCallback = () => {};
    const accountChooserInvokedCallback = () => {};
    const accountChooserResultCallback = () => {};
    const signInFailureCallback = () => {};
    assertNull(config.getUiShownCallback());
    assertNull(config.getSignInSuccessCallback());
    assertNull(config.getSignInSuccessWithAuthResultCallback());
    assertNull(config.getUiChangedCallback());
    assertNull(config.getAccountChooserInvokedCallback());
    assertNull(config.getAccountChooserResultCallback());
    assertNull(config.getAccountChooserResultCallback());
    config.update('callbacks', {
      'uiShown': uiShownCallback,
      'signInSuccess': signInSuccessCallback,
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback,
      'uiChanged': uiChangedCallback,
      'accountChooserInvoked': accountChooserInvokedCallback,
      'accountChooserResult': accountChooserResultCallback,
      'signInFailure': signInFailureCallback,
    });
    assertEquals(uiShownCallback, config.getUiShownCallback());
    assertEquals(
        signInSuccessCallback, config.getSignInSuccessCallback());
    assertEquals(
        signInSuccessWithAuthResultCallback,
        config.getSignInSuccessWithAuthResultCallback());
    assertEquals(uiChangedCallback, config.getUiChangedCallback());
    assertEquals(
        accountChooserInvokedCallback,
        config.getAccountChooserInvokedCallback());
    assertEquals(
        accountChooserResultCallback,
        config.getAccountChooserResultCallback());
    assertEquals(
        signInFailureCallback, config.getSignInFailureCallback());
  },

  testAutoUpgradeAnonymousUsers() {
    const expectedErrorLogMessage = 'Missing "signInFailure" callback: ' +
        '"signInFailure" callback needs to be provided when ' +
        '"autoUpgradeAnonymousUsers" is set to true.';
    assertFalse(config.autoUpgradeAnonymousUsers());

    config.update('autoUpgradeAnonymousUsers', '');
    assertFalse(config.autoUpgradeAnonymousUsers());

    config.update('autoUpgradeAnonymousUsers', null);
    assertFalse(config.autoUpgradeAnonymousUsers());

    config.update('autoUpgradeAnonymousUsers', false);
    assertFalse(config.autoUpgradeAnonymousUsers());

    // No error or warning should be logged.
    assertArrayEquals([], errorLogMessages);
    assertArrayEquals([], warningLogMessages);

    // Set autoUpgradeAnonymousUsers to true without providing a signInFailure
    // callback.
    config.update('autoUpgradeAnonymousUsers', true);
    assertTrue(config.autoUpgradeAnonymousUsers());
    // Error should be logged.
    assertArrayEquals([expectedErrorLogMessage], errorLogMessages);
    assertArrayEquals([], warningLogMessages);

    // Provide the signInFailure callback.
    config.update('callbacks', {
      'signInFailure': goog.nullFunction,
    });
    config.update('autoUpgradeAnonymousUsers', 'true');
    assertTrue(config.autoUpgradeAnonymousUsers());
    config.update('autoUpgradeAnonymousUsers', 1);
    assertTrue(config.autoUpgradeAnonymousUsers());
    // No additional error logged.
    assertArrayEquals([expectedErrorLogMessage], errorLogMessages);
    assertArrayEquals([], warningLogMessages);
  },

  testGetCredentialHelper_httpOrHttps() {
    // Test credential helper configuration setting, as well as the
    // accountchooser.com enabled helper method, in a HTTP or HTTPS environment.
    // Simulate HTTP or HTTPS environment.
    stub.replace(
        util,
        'isHttpOrHttps',
        () => true);
    // Default is accountchooser.com.
    assertEquals('accountchooser.com', config.getCredentialHelper());
    assertTrue(config.isAccountChooserEnabled());

    // Use an invalid credential helper.
    config.update('credentialHelper', 'invalid');
    assertEquals('accountchooser.com', config.getCredentialHelper());
    assertTrue(config.isAccountChooserEnabled());

    // Explicitly disable credential helper.
    config.update('credentialHelper', 'none');
    assertEquals('none', config.getCredentialHelper());
    assertFalse(config.isAccountChooserEnabled());

    // Explicitly enable accountchooser.com.
    config.update('credentialHelper', 'accountchooser.com');
    assertEquals('accountchooser.com', config.getCredentialHelper());
    assertTrue(config.isAccountChooserEnabled());

    // Explicitly enable googleyolo.
    config.update('credentialHelper', 'googleyolo');
    assertEquals('googleyolo', config.getCredentialHelper());
    assertFalse(config.isAccountChooserEnabled());
  },

  testGetCredentialHelper_nonHttpOrHttps() {
    // Test credential helper configuration setting, as well as the
    // accountchooser.com enabled helper method, in a non HTTP or HTTPS
    // environment. This could be a Cordova file environment.
    // Simulate non HTTP or HTTPS environment.
    stub.replace(
        util,
        'isHttpOrHttps',
        () => false);
    // All should resolve to none.
    // Default is accountchooser.com.
    assertEquals('none', config.getCredentialHelper());
    assertFalse(config.isAccountChooserEnabled());

    // Use an invalid credential helper.
    config.update('credentialHelper', 'invalid');
    assertEquals('none', config.getCredentialHelper());
    assertFalse(config.isAccountChooserEnabled());

    // Explicitly disable credential helper.
    config.update('credentialHelper', 'none');
    assertEquals('none', config.getCredentialHelper());
    assertFalse(config.isAccountChooserEnabled());

    // Explicitly enable accountchooser.com.
    config.update('credentialHelper', 'accountchooser.com');
    assertEquals('none', config.getCredentialHelper());
    assertFalse(config.isAccountChooserEnabled());

    // Explicitly enable googleyolo.
    config.update('credentialHelper', 'googleyolo');
    assertEquals('none', config.getCredentialHelper());
    assertFalse(config.isAccountChooserEnabled());
  },
});
