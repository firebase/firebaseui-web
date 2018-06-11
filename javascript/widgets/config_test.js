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
 * @fileoverview Tests for config.js
 */

goog.provide('firebaseui.auth.widget.ConfigTest');

goog.require('firebaseui.auth.CredentialHelper');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('goog.testing');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.widget.ConfigTest');

var config;
var stub = new goog.testing.PropertyReplacer();
var errorLogMessages = [];
var warningLogMessages = [];
var firebase = {};


function setUp() {
  config = new firebaseui.auth.widget.Config();
  // Remember error log messages.
  stub.replace(firebaseui.auth.log, 'error', function(msg) {
    errorLogMessages.push(msg);
  });
  // Remember error warning messages.
  stub.replace(firebaseui.auth.log, 'warning', function(msg) {
    warningLogMessages.push(msg);
  });
  firebase.auth = {
    GoogleAuthProvider: {PROVIDER_ID: 'google.com'},
    EmailAuthProvider: {PROVIDER_ID: 'password'},
    PhoneAuthProvider: {PROVIDER_ID: 'phone'}
  };
}


function tearDown() {
  errorLogMessages = [];
  warningLogMessages = [];
  stub.reset();
}


function testGetAcUiConfig() {
  assertNull(config.getAcUiConfig());
  var ui = {favicon: 'http://localhost/favicon.ico'};
  config.update('acUiConfig', ui);
  assertObjectEquals(ui, config.getAcUiConfig());
}


function testGetQueryParameterForSignInSuccessUrl() {
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
}


function testGetRequiredWidgetUrl() {
  assertThrows(function() {config.getRequiredWidgetUrl();});
  config.update('widgetUrl', 'http://localhost/callback');

  var widgetUrl = config.getRequiredWidgetUrl();
  assertEquals('http://localhost/callback', widgetUrl);
  widgetUrl = config.getRequiredWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals('http://localhost/callback?mode=select', widgetUrl);

  config.update('queryParameterForWidgetMode', 'mode2');
  widgetUrl = config.getRequiredWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals('http://localhost/callback?mode2=select', widgetUrl);
}


function testGetSignInFlow() {
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
}


function testGetWidgetUrl_notSpecified() {
  var widgetUrl = config.getWidgetUrl();
  assertEquals(window.location.href, widgetUrl);
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals(window.location.href + '?mode=select', widgetUrl);

  config.update('queryParameterForWidgetMode', 'mode2');
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals(window.location.href + '?mode2=select', widgetUrl);
}


function testGetWidgetUrl_notSpecified_withQueryAndFragment() {
  // Simulate current URL has mode/mode2 queries, other query parameters and a
  // fragment.
  stub.replace(
      firebaseui.auth.util,
      'getCurrentUrl',
      function() {
        return 'http://www.example.com/path/?mode=foo&mode2=bar#a=1';
      });
  var widgetUrl = config.getWidgetUrl();
  // The same current URL should be returned.
  assertEquals(
      firebaseui.auth.util.getCurrentUrl(), widgetUrl);
  // Only the mode query param should be overwritten.
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals(
      'http://www.example.com/path/?mode2=bar&mode=select#a=1', widgetUrl);

  // Only the mode2 query param should be overwritten.
  config.update('queryParameterForWidgetMode', 'mode2');
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals(
      'http://www.example.com/path/?mode=foo&mode2=select#a=1', widgetUrl);
}


function testGetWidgetUrl_specified() {
  config.update('widgetUrl', 'http://localhost/callback');
  var widgetUrl = config.getWidgetUrl();
  assertEquals('http://localhost/callback', widgetUrl);
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals('http://localhost/callback?mode=select', widgetUrl);

  config.update('queryParameterForWidgetMode', 'mode2');
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals('http://localhost/callback?mode2=select', widgetUrl);
}


function testGetSignInSuccessUrl() {
  assertUndefined(config.getSignInSuccessUrl());
  config.update('signInSuccessUrl', 'http://localhost/home');
  assertEquals(
      'http://localhost/home', config.getSignInSuccessUrl());
}


function testGetProviders_providerIds() {
  assertArrayEquals([], config.getProviders());
  config.update('signInOptions',
      ['google.com', 'github.com', 'unrecognized', 'twitter.com']);
  // Check that unrecognized accounts are not included in the list.
  assertArrayEquals(
      ['google.com', 'github.com', 'twitter.com'],
      config.getProviders());

  // Test when password accounts are to be enabled.
  config.update('signInOptions',
      ['google.com', 'password', 'unrecognized']);
  // Check that password accounts are included in the list in the correct
  // order.
  assertArrayEquals(['google.com', 'password'], config.getProviders());

  // Test when phone accounts are to be enabled.
  config.update('signInOptions',
      ['google.com', 'phone', 'unrecognized']);
  // Check that phone accounts are included in the list in the correct
  // order.
  assertArrayEquals(['google.com', 'phone'], config.getProviders());
}


function testGetProviders_fullConfig() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['foo', 'bar']
    },
    {'provider': 'github.com'},
    'facebook.com',
    {'provider': 'unrecognized'},
    {'not a': 'valid config'},
    {'provider': 'phone', 'recaptchaParameters': {'size': 'invisible'}}
  ]);
  // Check that invalid configs are not included.
  assertArrayEquals(['google.com', 'github.com', 'facebook.com', 'phone'],
      config.getProviders());
}


function testGetRecaptchaParameters() {
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
  var blacklist = {
    'sitekey': 'SITEKEY',
    'tabindex': 0,
    'callback': function(token) {},
    'expired-callback': function() {}
  };
  config.update(
      'signInOptions',
      ['github.com', {'provider': 'google.com'},
       {'provider': 'phone', 'recaptchaParameters': blacklist}, 'password']);
  assertObjectEquals({}, config.getRecaptchaParameters());
  // Expected warning should be logged.
  assertArrayEquals(
      [
        'The following provided "recaptchaParameters" keys are not allowed: ' +
        'sitekey, tabindex, callback, expired-callback'
      ], warningLogMessages);
  // Reset warnings.
  warningLogMessages = [];

  // Phone config with blacklisted, valid and invalid reCAPTCHA parameters.
  var mixed = {
    'sitekey': 'SITEKEY',
    'tabindex': 0,
    'callback': function(token) {},
    'expired-callback': function() {},
    'type': 'audio',
    'size': 'invisible',
    'badge': 'bottomleft',
    'theme': 'dark',
    'foo': 'bar'
  };
  var expectedParameters = {
    'type': 'audio',
    'size': 'invisible',
    'badge': 'bottomleft',
    'theme': 'dark',
    'foo': 'bar'
  };
  config.update(
      'signInOptions',
      ['github.com', {'provider': 'google.com'},
       {'provider': 'phone', 'recaptchaParameters': mixed}, 'password']);
  assertObjectEquals(expectedParameters, config.getRecaptchaParameters());
  // Expected warning should be logged.
  assertArrayEquals(
      [
        'The following provided "recaptchaParameters" keys are not allowed: ' +
        'sitekey, tabindex, callback, expired-callback'
      ], warningLogMessages);

  // No error should be logged.
  assertArrayEquals([], errorLogMessages);
}


function testGetProviderCustomParameter_noSignInOptions() {
  config.update('signInOptions', null);
  assertNull(config.getProviderCustomParameters('google.com'));
}


function testGetProviderCustomParameter_invalidIdp() {
  config.update('signInOptions', [{
    'provider': 'unrecognized',
    'customParameters': ['foo', 'bar']
  }]);
  assertNull(config.getProviderCustomParameters('unrecognized'));
}


function testGetProviderCustomParameter_missingCustomParameters() {
  config.update('signInOptions', [{
    'provider': 'google.com',
  }]);
  assertNull(config.getProviderCustomParameters('google.com'));
}


function testGetProviderCustomParameter_multipleIdp() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['google1', 'google2'],
      'customParameters': {
        'prompt': 'select_account',
        'login_hint': 'user@example.com'
      }
    },
    {
      'provider': 'facebook.com',
      'scopes': ['facebook1', 'facebook2'],
      'customParameters': {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
      }
    },
    'github.com'
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
}


function testIsAccountSelectionPromptEnabled_googleLoginHint() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'select_account',
        'login_hint': 'user@example.com'
      }
    },
    {
      'provider': 'facebook.com',
      'customParameters': {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
      }
    },
    'github.com'
  ]);
  assertTrue(config.isAccountSelectionPromptEnabled());
}


function testIsAccountSelectionPromptEnabled_nonGoogleLoginHint() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none',
        'login_hint': 'user@example.com'
      }
    },
    {
      'provider': 'facebook.com',
      'customParameters': {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
        // This does nothing.
        'prompt': 'select_account'
      }
    },
    'github.com',
    'password'
  ]);
  assertFalse(config.isAccountSelectionPromptEnabled());
}


function testIsAccountSelectionPromptEnabled_noCustomParameter() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['google1', 'google2']
    },
    'github.com'
  ]);
  assertFalse(config.isAccountSelectionPromptEnabled());
}


function testIsAccountSelectionPromptEnabled_noAdditionalParameters() {
  config.update('signInOptions', [
    'google.com'
  ]);
  assertFalse(config.isAccountSelectionPromptEnabled());
}


function testIsAccountSelectionPromptEnabled_noOAuthProvider() {
  config.update('signInOptions', [
    'phone',
    'password'
  ]);
  assertFalse(config.isAccountSelectionPromptEnabled());
}


function testGetProviderIdFromAuthMethod() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none'
      },
      'authMethod': 'https://accounts.google.com',
      'clientId': '1234567890.apps.googleusercontent.com'
    },
    {
      'provider': 'password',
      'authMethod': 'googleyolo://id-and-password'
    },
    {
      'authMethod': 'unknown'
    }
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
  // Test with authMethod that does not have a provider ID in the configuration.
  assertNull(config.getProviderIdFromAuthMethod('unknown'));
}


function testGetGoogleYoloConfig_availableAndEnabled() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none'
      },
      'authMethod': 'https://accounts.google.com',
      'clientId': '1234567890.apps.googleusercontent.com'
    },
    {
      'provider': 'password',
      'authMethod': 'googleyolo://id-and-password'
    },
    {
      'authMethod': 'unknown'
    },
    {
      'provider': 'facebook.com',
      // authMethod is required.
      'clientId': 'CLIENT_ID'
    }
  ]);
  // GOOGLE_YOLO credentialHelper must be selected.
  config.update(
      'credentialHelper', firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
  var expectedConfig = {
    'supportedAuthMethods': [
      'https://accounts.google.com',
      'googleyolo://id-and-password'
    ],
    'supportedIdTokenProviders': [
      {
        'uri': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ]
  };
  assertObjectEquals(expectedConfig, config.getGoogleYoloConfig());
}


function testGetGoogleYoloConfig_notEnabled() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none'
      },
      'authMethod': 'https://accounts.google.com',
      'clientId': '1234567890.apps.googleusercontent.com'
    },
    {
      'provider': 'password',
      'authMethod': 'googleyolo://id-and-password'
    },
    {
      'authMethod': 'unknown'
    },
    {
      'provider': 'facebook.com',
      // authMethod is required.
      'clientId': 'CLIENT_ID'
    }
  ]);
  // GOOGLE_YOLO credentialHelper not selected.
  config.update(
      'credentialHelper', firebaseui.auth.CredentialHelper.NONE);
  assertNull(config.getGoogleYoloConfig());
}


function testGetGoogleYoloConfig_notAvailable() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none',
        'login_hint': 'user@example.com'
      }
    },
    {
      'provider': 'facebook.com',
      'customParameters': {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
      }
    },
    'github.com',
    'password',
    // authMethod with no provider.
    {
      'authMethod': 'unknown'
    },
    // clientId with no authMethod.
    {
      'provider': 'facebook.com',
      // authMethod is required.
      'clientId': 'CLIENT_ID'
    }
  ]);
  // GOOGLE_YOLO credentialHelper is selected.
  config.update(
      'credentialHelper', firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
  assertNull(config.getGoogleYoloConfig());
}


function testGetPhoneAuthDefaultCountry() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'gb'
  }]);
  assertEquals('United Kingdom', config.getPhoneAuthDefaultCountry().name);
  assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
}


function testGetPhoneAuthDefaultCountry_defaultCountryAndLoginHint() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'gb',
    // loginHint will be ignored in favor of the above.
    'loginHint': '+112345678890'
  }]);
  assertEquals('United Kingdom', config.getPhoneAuthDefaultCountry().name);
  assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
}


function testGetPhoneAuthDefaultCountry_loginHintOnly() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'loginHint': '+4412345678890'
  }]);
  assertEquals('Guernsey', config.getPhoneAuthDefaultCountry().name);
  assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
}


function testGetPhoneAuthDefaultCountry_null() {
  config.update('signInOptions', null);
  assertNull(config.getPhoneAuthDefaultCountry());
}


function testGetPhoneAuthDefaultCountry_noCountrySpecified() {
  config.update('signInOptions', [{
    'provider': 'phone'
  }]);
  assertNull(config.getPhoneAuthDefaultCountry());
}


function testGetPhoneAuthDefaultCountry_invalidIdp() {
  config.update('signInOptions', [{
    'provider': 'google.com',
    'defaultCountry': 'gb',
    'loginHint': '+112345678890'
  }]);
  assertNull(config.getPhoneAuthDefaultCountry());
}


function testGetPhoneAuthDefaultCountry_invalidCountry() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'zz'
  }]);
  assertNull(config.getPhoneAuthDefaultCountry());
}


function testGetPhoneAuthDefaultCountry_invalidDefaultCountry_loginHint() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'zz',
    'loginHint': '+112345678890'
  }]);
  // Since the defaultCountry is invalid, loginHint will be used instead.
  assertEquals('United States', config.getPhoneAuthDefaultCountry().name);
  assertEquals('1', config.getPhoneAuthDefaultCountry().e164_cc);
}


function testGetPhoneAuthDefaultNationalNumber() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'us',
    'defaultNationalNumber': '1234567890'
  }]);
  assertEquals('1234567890', config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_defaultNationalNumberAndHint() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultNationalNumber': '1234567890',
    // loginHint will be ignored in favor of the above.
    'loginHint': '+12223334444'
  }]);
  assertEquals('1234567890', config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_loginHintOnly() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'loginHint': '+12223334444'
  }]);
  assertEquals('2223334444', config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_null() {
  config.update('signInOptions', null);
  assertNull(config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_noNationalNumberSpecified() {
  config.update('signInOptions', [{
    'provider': 'phone'
  }]);
  assertNull(config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_invalidIdp() {
  config.update('signInOptions', [{
    'provider': 'google.com',
    'defaultCountry': 'ca',
    'defaultNationalNumber': '1234567890',
    'loginHint': '+12223334444'
  }]);
  assertNull(config.getPhoneAuthDefaultNationalNumber());
}


function testGetProviderAdditionalScopes_noSignInOptions() {
  config.update('signInOptions', null);
  assertArrayEquals([], config.getProviderAdditionalScopes('google.com'));
}


function testGetProviderAdditionalScopes_invalidIdp() {
  config.update('signInOptions', [{
    'provider': 'unrecognized',
    'scopes': ['foo', 'bar']
  }]);
  assertArrayEquals([], config.getProviderAdditionalScopes('unrecognized'));
}


function testGetProviderAdditionalScopes_missingScopes() {
  config.update('signInOptions', [{
    'provider': 'google.com',
  }]);
  assertArrayEquals([], config.getProviderAdditionalScopes('google.com'));
}


function testGetProviderAdditionalScopes_multipleIdp() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['google1', 'google2']
    },
    {
      'provider': 'github.com',
      'scopes': ['github1', 'github2']
    },
    'facebook.com'
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
}


function testGetQueryParameterForWidgetMode() {
  assertEquals('mode', config.getQueryParameterForWidgetMode());
  config.update('queryParameterForWidgetMode', 'mode2');
  assertEquals('mode2', config.getQueryParameterForWidgetMode());
}


function testGetTosUrl() {
  assertNull(config.getTosUrl());
  config.update('tosUrl', 'http://localhost/tos');
  assertNull(config.getTosUrl());
  // Expected warning should be logged.
  assertArrayEquals(
      [
        'Privacy Policy URL is missing, the link will not be displayed.'
      ], warningLogMessages);
  config.update('privacyPolicyUrl', 'http://localhost/privacy_policy');
  assertEquals('http://localhost/tos', config.getTosUrl());
  // No additional warning logged.
  assertArrayEquals(
      [
        'Privacy Policy URL is missing, the link will not be displayed.'
      ], warningLogMessages);
}


function testGetPrivacyPolicyUrl() {
  assertNull(config.getPrivacyPolicyUrl());
  config.update('privacyPolicyUrl', 'http://localhost/privacy_policy');
  assertNull(config.getPrivacyPolicyUrl());
  // Expected warning should be logged.
  assertArrayEquals(
      [
        'Term of Service URL is missing, the link will not be displayed.'
      ], warningLogMessages);
  config.update('tosUrl', 'http://localhost/tos');
  assertEquals('http://localhost/privacy_policy', config.getPrivacyPolicyUrl());
  // No additional warning logged.
  assertArrayEquals(
      [
        'Term of Service URL is missing, the link will not be displayed.'
      ], warningLogMessages);

}


function testRequireDisplayName_shouldBeTrueByDefault() {
  assertTrue(config.isDisplayNameRequired());
}


function testRequireDisplayName_canBeSet() {
  config.update('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': true
    }
  ]);
  assertTrue(config.isDisplayNameRequired());

  config.update('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': false
    }
  ]);
  assertFalse(config.isDisplayNameRequired());
}


function testRequireDisplayName_isTrueWithNonBooleanArgs() {
  config.update('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': 'a string'
    }
  ]);
  assertTrue(config.isDisplayNameRequired());
}


function testSetConfig() {
  config.setConfig({
    tosUrl: 'www.testUrl1.com',
    privacyPolicyUrl: 'www.testUrl2.com'
  });
  assertEquals('www.testUrl1.com', config.getTosUrl());
  assertEquals('www.testUrl2.com', config.getPrivacyPolicyUrl());
}


function testSetConfig_nonDefined() {
  config.setConfig({test1: 1, test2: 2});
  assertArrayEquals(
      [
        'Invalid config: "test1"',
        'Invalid config: "test2"'
      ], errorLogMessages);
}


function testPopupInMobileBrowser() {
  goog.testing.createMethodMock(firebaseui.auth.util, 'isMobileBrowser');
  firebaseui.auth.util.isMobileBrowser().$returns(true);
  firebaseui.auth.util.isMobileBrowser().$replay();
  config.setConfig({
    popupMode: true});

  assertFalse(config.getPopupMode());
  firebaseui.auth.util.isMobileBrowser.$tearDown();
}


function testGetCallbacks() {
  var uiShownCallback = function() {};
  var signInSuccessCallback = function() { return true; };
  var signInSuccessWithAuthResultCallback = function() { return true; };
  var uiChangedCallback = function() {};
  var accountChooserInvokedCallback = function() {};
  var accountChooserResultCallback = function() {};
  var signInFailureCallback = function() {};
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
    'signInFailure': signInFailureCallback
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
}


function testAutoUpgradeAnonymousUsers() {
  var expectedErrorLogMessage = 'Missing "signInFailure" callback: ' +
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
    'signInFailure': goog.nullFunction
  });
  config.update('autoUpgradeAnonymousUsers', 'true');
  assertTrue(config.autoUpgradeAnonymousUsers());
  config.update('autoUpgradeAnonymousUsers', 1);
  assertTrue(config.autoUpgradeAnonymousUsers());
  // No additional error logged.
  assertArrayEquals([expectedErrorLogMessage], errorLogMessages);
  assertArrayEquals([], warningLogMessages);
}


function testGetCredentialHelper_httpOrHttps() {
  // Test credential helper configuration setting, as well as the
  // accountchooser.com enabled helper method, in a HTTP or HTTPS environment.
  // Simulate HTTP or HTTPS environment.
  stub.replace(
      firebaseui.auth.util,
      'isHttpOrHttps',
      function() {
        return true;
      });
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
}


function testGetCredentialHelper_nonHttpOrHttps() {
  // Test credential helper configuration setting, as well as the
  // accountchooser.com enabled helper method, in a non HTTP or HTTPS
  // environment. This could be a Cordova file environment.
  // Simulate non HTTP or HTTPS environment.
  stub.replace(
      firebaseui.auth.util,
      'isHttpOrHttps',
      function() {
        return false;
      });
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
}
