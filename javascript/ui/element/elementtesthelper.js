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
 * @fileoverview Base helper class for testing UI elements.
 */

goog.provide('firebaseui.auth.ui.element.ElementTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.ElementTestHelper');

goog.require('firebaseui.auth.ui.element');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.ui.Component');



/**
 * @param {string} name The name of the helper.
 * @constructor
 */
firebaseui.auth.ui.element.ElementTestHelper = function(name) {
  this.name_ = name;
  this.excludes_ = [];
};


/**
 * Sets the component to test.
 * @param {goog.ui.Component} c The component to test.
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.setComponent =
    function(c) {
  this.component = c;
};


/**
 * Excludes some tests from being run.
 * @param {...string} var_arg Test names to exclude.
 * @return {firebaseui.auth.ui.element.ElementTestHelper} The test helper
 *     itself.
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.excludeTests =
    function(var_arg) {
  Array.prototype.push.apply(
      this.excludes_, Array.prototype.slice.call(arguments));
  return this;
};


/**
 * Registers all tests related to the element into the global namespace.
 * @return {firebaseui.auth.ui.element.ElementTestHelper} The test helper
 *     itself.
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.registerTests =
    function() {
  var self = this;
  goog.object.forEach(self, function(e, key) {
    if (typeof e == 'function' &&
      key.indexOf('test') == 0 &&
      !goog.array.contains(self.excludes_, key)) {
      goog.exportSymbol(key + 'for' + self.name_ + 'UiElement', function() {
        self.resetState();
        e.call(self);
      });
    }
  });
  return self;
};


/**
 * Fires an input event with the given key.
 * @param {Element} input The input element.
 * @param {goog.events.KeyCodes} keyCode The key to input.
 * @protected
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.fireInputEvent =
    function(input, keyCode) {
  // Required by Opera since InputHandler#handleEvent checks if the element is
  // the active one when receiving an "input" event for Opera.
  input.focus();
  var inputEvent = new goog.testing.events.Event(
      goog.events.EventType.INPUT,
      input);
  inputEvent.keyCode = keyCode;
  inputEvent.charCode = keyCode;
  goog.testing.events.fireBrowserEvent(inputEvent);
};


/**
 * Fires a change event.
 * @param {Element} input The input element.
 * @protected
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.fireChangeEvent =
    function(input) {
  var changeEvent = new goog.testing.events.Event(
      goog.events.EventType.CHANGE,
      input);
  goog.testing.events.fireBrowserEvent(changeEvent);
};


/**
 * Checks if the input is in valid state.
 * @param {Element} input The input element.
 * @protected
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.checkInputValid =
    function(input) {
  assertTrue(goog.dom.classlist.contains(input, 'firebaseui-input'));
  assertFalse(goog.dom.classlist.contains(input, 'firebaseui-input-invalid'));
};


/**
 * Checks if the input is in invalid state.
 * @param {Element} input The input element.
 * @protected
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.checkInputInvalid =
    function(input) {
  assertFalse(goog.dom.classlist.contains(input, 'firebaseui-input'));
  assertTrue(goog.dom.classlist.contains(input, 'firebaseui-input-invalid'));
};


/**
 * Checks if the error is hidden.
 * @param {Element} error The error element.
 * @protected
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.checkErrorHidden =
    function(error) {
  assertFalse(firebaseui.auth.ui.element.isShown(error));
};


/**
 * Checks if the error is shown.
 * @param {Element} error The error element.
 * @param {string} errorMessage The error message shown.
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.checkErrorShown =
    function(error, errorMessage) {
  assertTrue(firebaseui.auth.ui.element.isShown(error));
  assertEquals(errorMessage, goog.dom.getTextContent(error));
};


/**
 * Resets the test state. Subclasses should implement this method.
 * @protected
 */
firebaseui.auth.ui.element.ElementTestHelper.prototype.resetState =
    goog.abstractMethod;
