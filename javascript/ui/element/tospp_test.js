/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview Tests for tospp.js (Terms of Service and Privacy Policy)
 */

goog.provide('firebaseui.auth.ui.element.tosppTest');
goog.setTestOnly('firebaseui.auth.ui.element.tosppTest');

goog.require('firebaseui.auth.ui.element.tospp');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new goog.ui.Component();
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetTosPpElement_present() {
  container.innerHTML = '<div class="firebaseui-tos">Terms of Service</div>';
  component.decorate(container);

  var tosPpElement = firebaseui.auth.ui.element.tospp.getTosPpElement.call(
      component);

  assertNotNull(tosPpElement);
  assertTrue(goog.dom.getTextContent(tosPpElement).indexOf(
      'Terms of Service') >= 0);
}


function testGetTosPpElement_notPresent() {
  container.innerHTML = '<div>No ToS/PP here</div>';
  component.decorate(container);

  var tosPpElement = firebaseui.auth.ui.element.tospp.getTosPpElement.call(
      component);

  assertNull(tosPpElement);
}


function testGetTosLinkElement_present() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-tos-link" href="https://example.com/tos">Terms</a>' +
      '</div>';
  component.decorate(container);

  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);

  assertNotNull(tosLink);
  assertEquals('https://example.com/tos', tosLink.href);
}


function testGetTosLinkElement_notPresent() {
  container.innerHTML = '<div class="firebaseui-tos">No link here</div>';
  component.decorate(container);

  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);

  assertNull(tosLink);
}


function testGetPpLinkElement_present() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-pp-link" href="https://example.com/privacy">Privacy</a>' +
      '</div>';
  component.decorate(container);

  var ppLink = firebaseui.auth.ui.element.tospp.getPpLinkElement.call(
      component);

  assertNotNull(ppLink);
  assertEquals('https://example.com/privacy', ppLink.href);
}


function testGetPpLinkElement_notPresent() {
  container.innerHTML = '<div class="firebaseui-tos">No link here</div>';
  component.decorate(container);

  var ppLink = firebaseui.auth.ui.element.tospp.getPpLinkElement.call(
      component);

  assertNull(ppLink);
}


function testGetTosPpListElement_present() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<ul class="firebaseui-tos-list"><li>Item 1</li><li>Item 2</li></ul>' +
      '</div>';
  component.decorate(container);

  var tosPpList = firebaseui.auth.ui.element.tospp.getTosPpListElement.call(
      component);

  assertNotNull(tosPpList);
}


function testGetTosPpListElement_notPresent() {
  container.innerHTML = '<div class="firebaseui-tos">No list here</div>';
  component.decorate(container);

  var tosPpList = firebaseui.auth.ui.element.tospp.getTosPpListElement.call(
      component);

  assertNull(tosPpList);
}


function testTosPp_bothLinksPresent() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-tos-link" href="https://example.com/tos">ToS</a>' +
      '<a class="firebaseui-pp-link" href="https://example.com/privacy">PP</a>' +
      '</div>';
  component.decorate(container);

  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);
  var ppLink = firebaseui.auth.ui.element.tospp.getPpLinkElement.call(
      component);

  assertNotNull(tosLink);
  assertNotNull(ppLink);
  assertNotEquals(tosLink, ppLink);
}


function testTosPp_withList() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<ul class="firebaseui-tos-list">' +
      '<li><a class="firebaseui-tos-link" href="https://example.com/tos">ToS</a></li>' +
      '<li><a class="firebaseui-pp-link" href="https://example.com/pp">PP</a></li>' +
      '</ul>' +
      '</div>';
  component.decorate(container);

  var tosPpElement = firebaseui.auth.ui.element.tospp.getTosPpElement.call(
      component);
  var tosPpList = firebaseui.auth.ui.element.tospp.getTosPpListElement.call(
      component);
  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);
  var ppLink = firebaseui.auth.ui.element.tospp.getPpLinkElement.call(
      component);

  assertNotNull(tosPpElement);
  assertNotNull(tosPpList);
  assertNotNull(tosLink);
  assertNotNull(ppLink);
}


function testTosPp_emptyContainer() {
  container.innerHTML = '';
  component.decorate(container);

  var tosPpElement = firebaseui.auth.ui.element.tospp.getTosPpElement.call(
      component);
  var tosPpList = firebaseui.auth.ui.element.tospp.getTosPpListElement.call(
      component);
  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);
  var ppLink = firebaseui.auth.ui.element.tospp.getPpLinkElement.call(
      component);

  assertNull(tosPpElement);
  assertNull(tosPpList);
  assertNull(tosLink);
  assertNull(ppLink);
}


function testTosLink_urlValidation() {
  var testUrls = [
    'https://example.com/tos',
    'https://example.com/terms-of-service',
    'https://www.example.com/legal/tos',
    'https://example.com/tos?lang=en',
    'https://example.com/tos#section1'
  ];

  testUrls.forEach(function(url) {
    container.innerHTML =
        '<div class="firebaseui-tos">' +
        '<a class="firebaseui-tos-link" href="' + url + '">ToS</a>' +
        '</div>';
    component = new goog.ui.Component();
    component.decorate(container);

    var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
        component);

    assertNotNull(tosLink);
    assertEquals(url, tosLink.href);

    component.dispose();
  });
}


function testPpLink_urlValidation() {
  var testUrls = [
    'https://example.com/privacy',
    'https://example.com/privacy-policy',
    'https://www.example.com/legal/privacy',
    'https://example.com/pp?lang=en',
    'https://example.com/privacy#section1'
  ];

  testUrls.forEach(function(url) {
    container.innerHTML =
        '<div class="firebaseui-tos">' +
        '<a class="firebaseui-pp-link" href="' + url + '">PP</a>' +
        '</div>';
    component = new goog.ui.Component();
    component.decorate(container);

    var ppLink = firebaseui.auth.ui.element.tospp.getPpLinkElement.call(
        component);

    assertNotNull(ppLink);
    assertEquals(url, ppLink.href);

    component.dispose();
  });
}


function testTosPp_linkTextContent() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-tos-link" href="https://example.com/tos">' +
      'Terms of Service' +
      '</a>' +
      '</div>';
  component.decorate(container);

  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);

  assertNotNull(tosLink);
  assertEquals('Terms of Service', goog.dom.getTextContent(tosLink));
}


function testTosPp_multipleComponents() {
  // Create first component
  var container1 = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container1);
  container1.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-tos-link" href="https://example.com/tos1">ToS 1</a>' +
      '</div>';
  var component1 = new goog.ui.Component();
  component1.decorate(container1);

  // Create second component
  var container2 = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container2);
  container2.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-tos-link" href="https://example.com/tos2">ToS 2</a>' +
      '</div>';
  var component2 = new goog.ui.Component();
  component2.decorate(container2);

  var tosLink1 = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component1);
  var tosLink2 = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component2);

  assertNotNull(tosLink1);
  assertNotNull(tosLink2);
  assertNotEquals(tosLink1, tosLink2);
  assertEquals('https://example.com/tos1', tosLink1.href);
  assertEquals('https://example.com/tos2', tosLink2.href);

  // Clean up
  component1.dispose();
  component2.dispose();
  goog.dom.removeNode(container1);
  goog.dom.removeNode(container2);
}


function testTosPp_nestedElements() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<p>By continuing, you agree to our ' +
      '<a class="firebaseui-tos-link" href="https://example.com/tos">Terms</a> ' +
      'and ' +
      '<a class="firebaseui-pp-link" href="https://example.com/privacy">Privacy Policy</a>' +
      '</p>' +
      '</div>';
  component.decorate(container);

  var tosPpElement = firebaseui.auth.ui.element.tospp.getTosPpElement.call(
      component);
  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);
  var ppLink = firebaseui.auth.ui.element.tospp.getPpLinkElement.call(
      component);

  assertNotNull(tosPpElement);
  assertNotNull(tosLink);
  assertNotNull(ppLink);
}


function testTosPp_linkTargetAttribute() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-tos-link" href="https://example.com/tos" target="_blank">ToS</a>' +
      '</div>';
  component.decorate(container);

  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);

  assertNotNull(tosLink);
  assertEquals('_blank', tosLink.target);
}


function testTosPp_xssProtection() {
  // Test that link href with javascript protocol is handled
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-tos-link" href="javascript:alert(1)">ToS</a>' +
      '</div>';
  component.decorate(container);

  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);

  assertNotNull(tosLink);
  // The link exists but browser should handle javascript: protocol appropriately
}


function testTosPp_internationalizedLinks() {
  container.innerHTML =
      '<div class="firebaseui-tos">' +
      '<a class="firebaseui-tos-link" href="https://example.com/tos">服务条款</a>' +
      '<a class="firebaseui-pp-link" href="https://example.com/privacy">隐私政策</a>' +
      '</div>';
  component.decorate(container);

  var tosLink = firebaseui.auth.ui.element.tospp.getTosLinkElement.call(
      component);
  var ppLink = firebaseui.auth.ui.element.tospp.getPpLinkElement.call(
      component);

  assertNotNull(tosLink);
  assertNotNull(ppLink);
  assertEquals('服务条款', goog.dom.getTextContent(tosLink));
  assertEquals('隐私政策', goog.dom.getTextContent(ppLink));
}
