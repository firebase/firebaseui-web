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

function testGetUnicodeLocale() {
  stubs.replace(goog, 'LOCALE', 'de');
  assertEquals('de', firebaseui.auth.util.getUnicodeLocale());

  stubs.replace(goog, 'LOCALE', 'zh-CN');
  assertEquals('zh-CN', firebaseui.auth.util.getUnicodeLocale());

  // The locale should have a dash instead of an underscore.
  stubs.replace(goog, 'LOCALE', 'zh_CN');
  assertEquals('zh-CN', firebaseui.auth.util.getUnicodeLocale());
}


function testOnDomReady() {
  // Should resolve immediately without any error.
  return firebaseui.auth.util.onDomReady();
}


function testGoTo_safeUrl() {
  var mockWin = {
    location: {
      assign: goog.testing.recordFunction()
    }
  };
  stubs.reset();

  // Confirm goTo redirects as expected to safe URLs.
  firebaseui.auth.util.goTo(
      'https://www.example.com:80/path/?a=1#b=2', mockWin);
  assertEquals(1, mockWin.location.assign.getCallCount());
  assertEquals(
      'https://www.example.com:80/path/?a=1#b=2',
      mockWin.location.assign.getLastCall().getArgument(0));
}


function testGoTo_unsafeUrl() {
  var mockWin = {
    location: {
      assign: goog.testing.recordFunction()
    }
  };
  stubs.reset();

  // Confirm unsafe URLs throw an assertion error and no location.assign is
  // called.
  assertThrows(function() {
    firebaseui.auth.util.goTo(
        'javascript:doEvilStuff()', mockWin);
  });
  // location.assign should not be called due to assertion error.
  assertEquals(0, mockWin.location.assign.getCallCount());
}


function testOpenerGoTo_safeUrl() {
  var mockWin = {
    opener: {
      location: {
        assign: goog.testing.recordFunction()
      }
    }
  };
  stubs.reset();

  // Confirm openerGoTo redirects as expected to safe URLs.
  firebaseui.auth.util.openerGoTo(
      'https://www.example.com:80/path/?a=1#b=2', mockWin);
  assertEquals(1, mockWin.opener.location.assign.getCallCount());
  assertEquals(
      'https://www.example.com:80/path/?a=1#b=2',
      mockWin.opener.location.assign.getLastCall().getArgument(0));
}


function testOpenerGoTo_unsafeUrl() {
  var mockWin = {
    opener: {
      location: {
        assign: goog.testing.recordFunction()
      }
    }
  };
  stubs.reset();

  // Confirm unsafe URLs throw an assertion error and no location.assign is
  // called.
  assertThrows(function() {
    firebaseui.auth.util.openerGoTo(
        'javascript:doEvilStuff()', mockWin);
  });
  // location.assign should not be called due to assertion error.
  assertEquals(0, mockWin.opener.location.assign.getCallCount());
}


function testSanitizeUrl_safeUrl() {
  assertEquals(
      'https://www.example.com:80/path/?a=1#b=2',
      firebaseui.auth.util.sanitizeUrl(
          'https://www.example.com:80/path/?a=1#b=2'));
}


function testSanitizeUrl_unsafeUrl() {
  assertEquals(
      'about:invalid#zClosurez',
      firebaseui.auth.util.sanitizeUrl('javascript:doEvilStuff()'));
}

function testGenerateRandomAlphaNumericString() {
  // Confirm generated string has expected length.
  for (var i = 0; i < 10; i++) {
    assertEquals(
        i, firebaseui.auth.util.generateRandomAlphaNumericString(i).length);
  }
}


function testFilterProperties() {
  // Test that only expected properties are copied over to the new object.
  const expectedObj = {
    property1: 'a',
    property2: 'b',
    property3: 'c',
  };
  // The keys used to filter the source object.
  const keys = Object.keys(expectedObj);
  // Source object contains additional properties.
  const sourceObj = Object.assign({property4: 'd'}, expectedObj);

  // The additional properties on the source object should be removed.
  assertObjectEquals(
      expectedObj,
      firebaseui.auth.util.filterProperties(sourceObj, keys));
}


function testFilterProperties_noMatchingKeys() {
  // Test when the keys do not match with any properties in the source object.
  const sourceObj = {
    property1: 'a',
    property2: 'b',
    property3: 'c',
  };
  // The keys used to filter the source object.
  const keys = ['property4', 'property5'];

  // Empty object should be returned since there are no properties matching the
  // provided keys.
  assertObjectEquals(
      {},
      firebaseui.auth.util.filterProperties(sourceObj, keys));
}


function testFilterProperties_initialValue() {
  // Test that expected properties and properties on initial value are
  // copied over to the new object.
  const expectedObj = {
    property1: 'a',
    property2: 'b',
    property3: 'c',
  };
  // The keys used to filter the source object.
  const keys = Object.keys(expectedObj);
  // Source object contains additional properties.
  const sourceObj = Object.assign({property4: 'd'}, expectedObj);

  // The additional properties should be removed, the properties on initial
  // value shoud be copied over.
  assertObjectEquals(
      {
        property1: 'a',
        property2: 'b',
        property3: 'c',
        property5: 'e',
      },
      firebaseui.auth.util.filterProperties(sourceObj, keys, {
        property5: 'e',
      }));
}


function testFilterProperties_initialValueOverridden() {
  // Test that expected properties are copied over and properties on initial
  // value are overriden if present on the source object.
  const expectedObj = {
    property1: 'a',
    property2: 'b',
    property3: 'c',
  };
  // The keys used to filter the source object.
  const keys = Object.keys(expectedObj);
  // Source object contains additional property.
  const sourceObj = Object.assign({property4: 'd'}, expectedObj);

  // The value of property1 should be the one on source object rather than the
  // one on initial object.
  assertObjectEquals(
      expectedObj,
      firebaseui.auth.util.filterProperties(sourceObj, keys, {
        property1: 'z',
      }));
}


function testFilterProperties_emptySourceObject() {
  // Test when the source object is empty.
  // The keys used to filter the source object.
  const keys = ['property1', 'property2'];

  assertObjectEquals(
      {},
      firebaseui.auth.util.filterProperties({}, keys));
}
