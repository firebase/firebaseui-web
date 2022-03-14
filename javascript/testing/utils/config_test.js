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
 * @fileoverview Tests for config.js.
 */

goog.provide('firebaseui.auth.ConfigTest');

goog.require('firebaseui.auth.Config');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.ConfigTest');


var instance = null;


function setUp() {
  instance = new firebaseui.auth.Config();
}

function testHasGetAndSet() {
  var name = 'name';
  assertFalse(instance.has_(name));
  instance.set_(name, 1);
  assertTrue(instance.has_(name));
  assertEquals(1, instance.get_(name));
  // Case insensitive.
  name = 'NaMe';
  assertTrue(instance.has_(name));
  assertEquals(1, instance.get_(name));
}

function testDefine_withoutValue() {
  var name = 'test';
  assertFalse(instance.has_(name));
  instance.define(name);
  assertTrue(instance.has_(name));
  assertUndefined(instance.get_(name));
}

function testDefine_withValue() {
  var name = 'test';
  assertFalse(instance.has_(name));
  instance.define(name, 1);
  assertTrue(instance.has_(name));
  assertEquals(1, instance.get_(name));
}

function testDefine_duplicated() {
  var name = 'test';
  instance.define(name);
  assertThrows(function() {instance.define(name);});
}

function testUpdate_nonDefined() {
  assertThrows(function() {instance.update('test', 1);});
}

function testUpdate() {
  var name = 'test';
  instance.define(name);
  assertUndefined(instance.get_(name));
  instance.update(name, 1);
  assertEquals(1, instance.get_(name));
}

function testGet_nonDefined() {
  assertThrows(function() {instance.get('test');});
}

function testGet() {
  var name = 'test';
  instance.define(name, 1);
  assertEquals(1, instance.get(name));
}

function testGetRequired_nonDefined() {
  assertThrows(function() {instance.getRequired('test');});
}

function testGetRequired_noValue() {
  var name = 'test';
  instance.define(name);
  assertThrows(function() {instance.getRequired(name);});
}

function testGetRequired() {
  var name = 'test';
  instance.define(name, 1);
  assertEquals(1, instance.get(name));
}
