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
 * @fileoverview Tests for cookiemechanism.js.
 */

goog.provide('firebaseui.auth.CookieMechanismTest');

goog.require('firebaseui.auth.CookieMechanism');
goog.require('goog.net.cookies');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');

goog.setTestOnly('firebaseui.auth.CookieMechanismTest');


var mockControl;
var ignoreArgument;


function setUp() {
  mockControl = new goog.testing.MockControl();
  ignoreArgument = goog.testing.mockmatchers.ignoreArgument;
  mockControl.$resetAll();
}


function tearDown() {
  try {
    mockControl.$verifyAll();
  } finally {
    mockControl.$tearDown();
  }
}


/** Test all CookieMechanism APIs call expected goog.net.cookies APIs. */
function testCookieMechanism() {
  var cookiesSet = mockControl.createMethodMock(
      goog.net.cookies, 'set');
  var cookiesGet = mockControl.createMethodMock(
      goog.net.cookies, 'get');
  var cookiesRemove = mockControl.createMethodMock(
      goog.net.cookies, 'remove');
  cookiesSet('key1', 'value1', 3600, '/path', 'example.com', true).$once();
  cookiesSet('key2', 'value2', -1, '/', null, false).$once();
  cookiesSet('key3', 'value3', 3600, '/path', 'example.com', true).$once();
  cookiesGet('key1').$returns('value1').$once();
  cookiesGet('key3').$returns('value3').$once();
  cookiesGet('key2').$returns('value2').$once();
  cookiesRemove('key1', '/path', 'example.com').$once();
  cookiesRemove('key2', '/', null).$once();
  cookiesRemove('key4', '/', null).$once();
  mockControl.$replayAll();

  var cookieMechanism1 = new firebaseui.auth.CookieMechanism(
      3600, '/path', 'example.com', true);
  var cookieMechanism2 = new firebaseui.auth.CookieMechanism(null, '/');
  cookieMechanism1.set('key1', 'value1');
  cookieMechanism2.set('key2', 'value2');
  cookieMechanism1.set('key3', 'value3');
  assertEquals('value1', cookieMechanism1.get('key1'));
  assertEquals('value3', cookieMechanism1.get('key3'));
  assertEquals('value2', cookieMechanism1.get('key2'));
  cookieMechanism1.remove('key1');
  cookieMechanism2.remove('key2');
  cookieMechanism2.remove('key4');
}
