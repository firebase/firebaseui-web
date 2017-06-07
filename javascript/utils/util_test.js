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
 * @fileoverview Tests for util.js.
 */

goog.provide('firebaseui.auth.utilTest');

goog.require('firebaseui.auth.util');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

goog.setTestOnly('firebaseui.auth.utilTest');

var stubs = new goog.testing.PropertyReplacer();
var clock;
var BROWSER_URL = 'http://localhost';

function redirectCallback() {
  firebaseui.auth.util.goTo(BROWSER_URL);
}

function setUp() {
  clock = new goog.testing.MockClock();
  clock.install();
  stubs.set(firebaseui.auth.util, 'goTo', goog.testing.recordFunction());
}

function tearDown() {
  stubs.reset();
  clock.uninstall();
}

function testGetElement() {
  // Test that the element is correctly retrieved.
  var element = goog.dom.createDom(goog.dom.TagName.DIV);
  element.setAttribute('id', 'myElement');
  document.body.appendChild(element);
  assertEquals(element, firebaseui.auth.util.getElement('#myElement'));
  goog.dom.removeNode(element);

  // Test getElement default error description.
  try {
    firebaseui.auth.util.getElement('#notFound');
    fail('Should have thrown an error!');
  } catch (e) {
    assertEquals(e.message, 'Cannot find element.');
  }

  // Test getElement custom error description.
  try {
    firebaseui.auth.util.getElement('#notFound',
        'Element requested was not found!');
    fail('Should have thrown an error!');
  } catch (e) {
    assertEquals(e.message, 'Element requested was not found!');
  }
}

function testIsHttpOrHttps() {
  // HTTP scheme.
  stubs.replace(
      firebaseui.auth.util,
      'getScheme',
      function() {
        return 'http:';
      });
  assertTrue(firebaseui.auth.util.isHttpOrHttps());
  // HTTPS scheme.
  stubs.replace(
      firebaseui.auth.util,
      'getScheme',
      function() {
        return 'https:';
      });
  assertTrue(firebaseui.auth.util.isHttpOrHttps());
  // FILE scheme.
  stubs.replace(
      firebaseui.auth.util,
      'getScheme',
      function() {
        return 'file:';
      });
  assertFalse(firebaseui.auth.util.isHttpOrHttps());
}
