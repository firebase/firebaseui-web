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
 * @fileoverview Binds handlers for name UI element.
 */

goog.provide('firebaseui.auth.ui.element.name');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.ui.Component');


goog.scope(function() {
var element = firebaseui.auth.ui.element;


/**
 * @return {Element} The name input.
 * @this {goog.ui.Component}
 */
element.name.getNameElement = function() {
  return this.getElementByClass('firebaseui-id-name');
};


/**
 * @return {Element} The error panel.
 * @this {goog.ui.Component}
 */
element.name.getNameErrorElement = function() {
  return this.getElementByClass('firebaseui-id-name-error');
};


/**
 * Validates the field and shows/clears the error message if necessary.
 * @param {Element} nameElement The name input.
 * @param {Element} errorElement The error panel.
 * @return {boolean} True if the field is valid.
 * @private
 */
element.name.validate_ = function(nameElement, errorElement) {
  var valid = !goog.string.isEmptyOrWhitespace(goog.string.makeSafe(
      element.getInputValue(nameElement)));
  element.setValid(nameElement, valid);
  if (valid) {
    element.hide(errorElement);
    return true;
  } else {
    element.show(errorElement,
        firebaseui.auth.soy2.strings.errorMissingName().toString());
    return false;
  }
};


/**
 * Initializes the name element.
 * @this {goog.ui.Component}
 */
element.name.initNameElement = function() {
  var nameElement = element.name.getNameElement.call(this);
  var errorElement = element.name.getNameErrorElement.call(this);
  element.listenForInputEvent(this, nameElement, function(e) {
    // Clear but not show error on-the-fly.
    if (element.isShown(errorElement)) {
      element.setValid(nameElement, true);
      element.hide(errorElement);
    }
  });
};


/**
 * Gets the display name.
 * It validates the field and shows/clears the error message if necessary.
 * @return {?string} The display name.
 * @this {goog.ui.Component}
 */
element.name.checkAndGetName = function() {
  var nameElement = element.name.getNameElement.call(this);
  var errorElement = element.name.getNameErrorElement.call(this);
  if (element.name.validate_(nameElement, errorElement)) {
    return goog.string.trim(
        goog.asserts.assert(element.getInputValue(nameElement)));
  }
  return null;
};
});
