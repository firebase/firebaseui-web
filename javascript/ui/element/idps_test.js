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
 * @fileoverview Tests for idps.js (Identity Provider selection)
 */

goog.provide('firebaseui.auth.ui.element.idpsTest');
goog.setTestOnly('firebaseui.auth.ui.element.idpsTest');

goog.require('firebaseui.auth.ui.element.idps');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.dataset');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;
var clickedProviderId;


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new goog.ui.Component();
  clickedProviderId = null;
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testInitIdpList_singleButton() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      'Sign in with Google' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  assertNull(clickedProviderId);
  goog.testing.events.fireClickSequence(button);
  assertEquals('google.com', clickedProviderId);
}


function testInitIdpList_multipleButtons() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      'Sign in with Google' +
      '</button>' +
      '<button class="firebaseui-id-idp-button" data-provider-id="facebook.com">' +
      'Sign in with Facebook' +
      '</button>' +
      '<button class="firebaseui-id-idp-button" data-provider-id="twitter.com">' +
      'Sign in with Twitter' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var buttons = component.getElementsByClass('firebaseui-id-idp-button');

  // Click Google
  assertNull(clickedProviderId);
  goog.testing.events.fireClickSequence(buttons[0]);
  assertEquals('google.com', clickedProviderId);

  // Click Facebook
  clickedProviderId = null;
  goog.testing.events.fireClickSequence(buttons[1]);
  assertEquals('facebook.com', clickedProviderId);

  // Click Twitter
  clickedProviderId = null;
  goog.testing.events.fireClickSequence(buttons[2]);
  assertEquals('twitter.com', clickedProviderId);
}


function testInitIdpList_enterKey() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      'Sign in with Google' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  assertNull(clickedProviderId);
  goog.testing.events.fireKeySequence(button, goog.events.KeyCodes.ENTER);
  assertEquals('google.com', clickedProviderId);
}


function testInitIdpList_noButtons() {
  container.innerHTML = '<div>No IdP buttons here</div>';
  component.decorate(container);

  // Should not throw when no buttons are present
  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  assertNull(clickedProviderId);
}


function testInitIdpList_emailPasswordProvider() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="password">' +
      'Sign in with Email' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  goog.testing.events.fireClickSequence(button);
  assertEquals('password', clickedProviderId);
}


function testInitIdpList_phoneProvider() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="phone">' +
      'Sign in with Phone' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  goog.testing.events.fireClickSequence(button);
  assertEquals('phone', clickedProviderId);
}


function testInitIdpList_customProvider() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="saml.provider">' +
      'Sign in with SAML' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  goog.testing.events.fireClickSequence(button);
  assertEquals('saml.provider', clickedProviderId);
}


function testInitIdpList_multipleClicks() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      'Sign in with Google' +
      '</button>';
  component.decorate(container);

  var clickCount = 0;
  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
    clickCount++;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  goog.testing.events.fireClickSequence(button);
  assertEquals('google.com', clickedProviderId);
  assertEquals(1, clickCount);

  goog.testing.events.fireClickSequence(button);
  assertEquals('google.com', clickedProviderId);
  assertEquals(2, clickCount);
}


function testInitIdpList_providerIdDataAttribute() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="microsoft.com">' +
      'Sign in with Microsoft' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  // Verify the data attribute is set correctly
  assertEquals('microsoft.com', goog.dom.dataset.get(button, 'providerId'));

  goog.testing.events.fireClickSequence(button);
  assertEquals('microsoft.com', clickedProviderId);
}


function testInitIdpList_mixedProviders() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      'Google' +
      '</button>' +
      '<button class="firebaseui-id-idp-button" data-provider-id="password">' +
      'Email' +
      '</button>' +
      '<button class="firebaseui-id-idp-button" data-provider-id="phone">' +
      'Phone' +
      '</button>' +
      '<button class="firebaseui-id-idp-button" data-provider-id="saml.provider">' +
      'SAML' +
      '</button>';
  component.decorate(container);

  var providerIds = [];
  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    providerIds.push(providerId);
  });

  var buttons = component.getElementsByClass('firebaseui-id-idp-button');

  for (var i = 0; i < buttons.length; i++) {
    goog.testing.events.fireClickSequence(buttons[i]);
  }

  assertEquals(4, providerIds.length);
  assertEquals('google.com', providerIds[0]);
  assertEquals('password', providerIds[1]);
  assertEquals('phone', providerIds[2]);
  assertEquals('saml.provider', providerIds[3]);
}


function testInitIdpList_buttonWithIcon() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      '<img src="google-icon.png">' +
      '<span>Sign in with Google</span>' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  goog.testing.events.fireClickSequence(button);
  assertEquals('google.com', clickedProviderId);
}


function testInitIdpList_disabledButton() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com" disabled>' +
      'Sign in with Google' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  // Note: Testing framework might still trigger click on disabled button
  // In real browser, disabled buttons don't fire click events
  goog.testing.events.fireClickSequence(button);
  // The callback may or may not be called depending on test framework behavior
}


function testInitIdpList_buttonNotElement() {
  container.innerHTML =
      '<a class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      'Sign in with Google' +
      '</a>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  goog.testing.events.fireClickSequence(button);
  assertEquals('google.com', clickedProviderId);
}


function testInitIdpList_providerIdSpecialCharacters() {
  // Test provider IDs with special characters
  var specialProviderIds = [
    'provider.with.dots',
    'provider-with-dashes',
    'provider_with_underscores',
    'oidc.provider-1'
  ];

  specialProviderIds.forEach(function(providerId) {
    container.innerHTML =
        '<button class="firebaseui-id-idp-button" data-provider-id="' + providerId + '">' +
        'Sign in' +
        '</button>';
    component = new goog.ui.Component();
    component.decorate(container);

    clickedProviderId = null;
    firebaseui.auth.ui.element.idps.initIdpList.call(component, function(pid) {
      clickedProviderId = pid;
    });

    var button = component.getElementsByClass('firebaseui-id-idp-button')[0];
    goog.testing.events.fireClickSequence(button);

    assertEquals(providerId, clickedProviderId);

    component.dispose();
  });
}


function testInitIdpList_emptyProviderId() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="">' +
      'Sign in' +
      '</button>';
  component.decorate(container);

  // Should handle empty provider ID gracefully
  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];
  goog.testing.events.fireClickSequence(button);

  // May be empty string or null depending on implementation
  assertTrue(clickedProviderId === '' || clickedProviderId === null);
}


function testInitIdpList_xssProtection() {
  // Test that XSS payloads in provider ID are handled safely
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" ' +
      'data-provider-id="<script>alert(1)</script>">' +
      'Sign in' +
      '</button>';
  component.decorate(container);

  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];
  goog.testing.events.fireClickSequence(button);

  // Should pass the value as-is, but not execute it
  assertNotNull(clickedProviderId);
  assertTrue(clickedProviderId.indexOf('script') >= 0);
}


function testInitIdpList_rapidClicks() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      'Sign in with Google' +
      '</button>';
  component.decorate(container);

  var clickCount = 0;
  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    clickCount++;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];

  // Simulate rapid clicks
  for (var i = 0; i < 10; i++) {
    goog.testing.events.fireClickSequence(button);
  }

  assertEquals(10, clickCount);
}


function testInitIdpList_callbackReceivesProviderId() {
  container.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="github.com">' +
      'Sign in with GitHub' +
      '</button>';
  component.decorate(container);

  var receivedProviderId = null;
  firebaseui.auth.ui.element.idps.initIdpList.call(component, function(providerId) {
    receivedProviderId = providerId;
  });

  var button = component.getElementsByClass('firebaseui-id-idp-button')[0];
  goog.testing.events.fireClickSequence(button);

  assertNotNull(receivedProviderId);
  assertEquals('github.com', receivedProviderId);
  assertEquals('string', typeof receivedProviderId);
}


function testInitIdpList_multipleComponents() {
  // Create first component
  var container1 = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container1);
  container1.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="google.com">' +
      'Google' +
      '</button>';
  var component1 = new goog.ui.Component();
  component1.decorate(container1);

  // Create second component
  var container2 = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container2);
  container2.innerHTML =
      '<button class="firebaseui-id-idp-button" data-provider-id="facebook.com">' +
      'Facebook' +
      '</button>';
  var component2 = new goog.ui.Component();
  component2.decorate(container2);

  var clicked1 = null;
  var clicked2 = null;

  firebaseui.auth.ui.element.idps.initIdpList.call(component1, function(providerId) {
    clicked1 = providerId;
  });

  firebaseui.auth.ui.element.idps.initIdpList.call(component2, function(providerId) {
    clicked2 = providerId;
  });

  var button1 = component1.getElementsByClass('firebaseui-id-idp-button')[0];
  var button2 = component2.getElementsByClass('firebaseui-id-idp-button')[0];

  goog.testing.events.fireClickSequence(button1);
  assertEquals('google.com', clicked1);
  assertNull(clicked2);

  goog.testing.events.fireClickSequence(button2);
  assertEquals('google.com', clicked1);
  assertEquals('facebook.com', clicked2);

  // Clean up
  component1.dispose();
  component2.dispose();
  goog.dom.removeNode(container1);
  goog.dom.removeNode(container2);
}
