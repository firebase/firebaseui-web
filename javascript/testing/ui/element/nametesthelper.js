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
 * @fileoverview Helper class for testing the name UI element.
 */

goog.provide('firebaseui.auth.ui.element.NameTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.NameTestHelper');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.NameTestHelper = function() {
  element.NameTestHelper.base(this, 'constructor', 'Name');
};
goog.inherits(element.NameTestHelper, element.ElementTestHelper);


/** @override */
element.NameTestHelper.prototype.resetState = function() {
  element.setValid(this.component.getNameElement(), true);
  goog.dom.forms.setValue(this.component.getNameElement(), '');
  element.hide(this.component.getNameErrorElement());
};


/** @private */
element.NameTestHelper.prototype.testGetNameElement_ = function() {
  assertNotNull(this.component.getNameElement());
};


/** @private */
element.NameTestHelper.prototype.testGetNameErrorElement_ = function() {
  assertNotNull(this.component.getNameErrorElement());
};


/** @private */
element.NameTestHelper.prototype.testCheckAndGetNameEmpty_ = function() {
  assertNull(this.component.checkAndGetName());
  this.checkInputInvalid(this.component.getNameElement());
  this.checkErrorShown(
      this.component.getNameErrorElement(),
      firebaseui.auth.soy2.strings.errorMissingName().toString());
};


/** @private */
element.NameTestHelper.prototype.testCheckAndGetName_ = function() {
  goog.dom.forms.setValue(this.component.getNameElement(), 'John Doe');
  assertEquals('John Doe', this.component.checkAndGetName());
  this.checkInputValid(this.component.getNameElement());
  this.checkErrorHidden(this.component.getNameErrorElement());
};


/** @private */
element.NameTestHelper.prototype.testOnNameChange_ = function() {
  var name = this.component.getNameElement();
  var error = this.component.getNameErrorElement();

  // Empty names, show error.
  goog.dom.forms.setValue(name, '');
  assertNull(this.component.checkAndGetName());
  this.checkInputInvalid(name);
  this.checkErrorShown(error,
      firebaseui.auth.soy2.strings.errorMissingName().toString());

  // Emulate that a 'J' is typed in to name input.
  goog.dom.forms.setValue(name, 'J');
  this.fireInputEvent(name, goog.events.KeyCodes.J);
  this.checkInputValid(name);
  this.checkErrorHidden(error);

  // Emulate that the 'J' is deleted so the name input is empty again.
  goog.dom.forms.setValue(name, '');
  this.fireInputEvent(name, goog.events.KeyCodes.J);
  this.checkInputValid(name);
  this.checkErrorHidden(error);
};
});
