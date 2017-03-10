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

goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('goog.testing');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.widget.ConfigTest');

var config;
var stub = new goog.testing.PropertyReplacer();
var logMessages = [];
var firebase = {};


function setUp() {
  config = new firebaseui.auth.widget.Config();
  logMessage = null;
  // Remember error log messages.
  stub.set(firebaseui.auth.log, 'error', function(msg) {
    logMessages.push(msg);
  });
  firebase.auth = {EmailAuthProvider: {PROVIDER_ID: 'password'}};
}


function tearDown() {
  logMessages = [];
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
  ]);
  // Check that invalid configs are not included.
  assertArrayEquals(['google.com', 'github.com', 'facebook.com'],
      config.getProviders());
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
  assertEquals('http://localhost/tos', config.getTosUrl());
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
  config.setConfig({tosUrl: 'www.testUrl.com'});
  assertEquals('www.testUrl.com', config.getTosUrl());
}


function testSetConfig_nonDefined() {
  config.setConfig({test1: 1, test2: 2});
  assertArrayEquals(
      [
        'Invalid config: "test1"',
        'Invalid config: "test2"'
      ], logMessages);
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
  var uiChangedCallback = function() {};
  var accountChooserInvokedCallback = function() {};
  var accountChooserResultCallback = function() {};
  assertNull(config.getUiShownCallback());
  assertNull(config.getSignInSuccessCallback());
  assertNull(config.getUiChangedCallback());
  assertNull(config.getAccountChooserInvokedCallback());
  assertNull(config.getAccountChooserResultCallback());
  config.update('callbacks', {
    'uiShown': uiShownCallback,
    'signInSuccess': signInSuccessCallback,
    'uiChanged': uiChangedCallback,
    'accountChooserInvoked': accountChooserInvokedCallback,
    'accountChooserResult': accountChooserResultCallback
  });
  assertEquals(uiShownCallback, config.getUiShownCallback());
  assertEquals(
      signInSuccessCallback, config.getSignInSuccessCallback());
  assertEquals(uiChangedCallback, config.getUiChangedCallback());
  assertEquals(
      accountChooserInvokedCallback,
      config.getAccountChooserInvokedCallback());
  assertEquals(
      accountChooserResultCallback,
      config.getAccountChooserResultCallback());
}


function testGetCredentialHelper() {
  // Test credential helper configuration setting, as well as the
  // accountchooser.com enabled helper method.
  // Default is accountchooser.com.
  assertEquals('accountchooser.com', config.getCredentialHelper());
  assertTrue(config.isAccountChooserEnabled());

  // Use an invalid credential helper.
  config.update('credentialHelper', 'invalid');
  assertEquals('accountchooser.com', config.getCredentialHelper());
  assertTrue(config.isAccountChooserEnabled());

  // Explicitly disable credential helper.
  config.update('credentialHelper', 'none');
  assertEquals(config.getCredentialHelper(), 'none');
  assertFalse(config.isAccountChooserEnabled());

  // Explicitly enable accountchooser.com.
  config.update('credentialHelper', 'accountchooser.com');
  assertEquals('accountchooser.com', config.getCredentialHelper());
  assertTrue(config.isAccountChooserEnabled());
}
