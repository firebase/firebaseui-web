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
 * @fileoverview Helper class for testing the password UI element.
 */

goog.provide('firebaseui.auth.ui.element.PasswordTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.PasswordTestHelper');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');


goog.scope(function() {
var element = firebaseui.auth.ui.element;


/** @constructor */
element.PasswordTestHelper = function() {
  element.PasswordTestHelper.base(this, 'constructor', 'Password');
};
goog.inherits(element.PasswordTestHelper, element.ElementTestHelper);


/** @override */
element.PasswordTestHelper.prototype.resetState = function() {
  element.setValid(this.component.getPasswordElement(), true);
  goog.dom.forms.setValue(this.component.getPasswordElement(), '');
  element.hide(this.component.getPasswordErrorElement());
};


/** @private */
element.PasswordTestHelper.prototype.testGetPasswordElement_ = function() {
  assertNotNull(this.component.getPasswordElement());
};


/** @private */
element.PasswordTestHelper.prototype.testGetPasswordErrorElement_ = function() {
  var e = this.component.getPasswordErrorElement();
  assertNotNull(e);
  assertFalse(element.isShown(e));
};


/** @private */
element.PasswordTestHelper.prototype.testCheckAndGetPasswordEmpty_ =
    function() {
  assertNull(this.component.checkAndGetPassword());
  this.checkInputInvalid(this.component.getPasswordElement());
  this.checkErrorShown(
      this.component.getPasswordErrorElement(),
      firebaseui.auth.soy2.strings.errorMissingPassword().toString());
};


/** @private */
element.PasswordTestHelper.prototype.testCheckAndGetPassword_ = function() {
  goog.dom.forms.setValue(this.component.getPasswordElement(), 'Password');
  assertEquals('Password', this.component.checkAndGetPassword());
  this.checkInputValid(this.component.getPasswordElement());
  this.checkErrorHidden(this.component.getPasswordErrorElement());
};


/** @private */
element.PasswordTestHelper.prototype.testOnPasswordChange_ = function() {
  var error = this.component.getPasswordErrorElement();
  var password = this.component.getPasswordElement();

  // Empty password, show error.
  assertNull(this.component.checkAndGetPassword());
  this.checkInputInvalid(this.component.getPasswordElement());
  this.checkErrorShown(
      this.component.getPasswordErrorElement(),
      firebaseui.auth.soy2.strings.errorMissingPassword().toString());

  // Emulate that a 'P' is typed in.
  goog.dom.forms.setValue(password, 'P');
  this.fireInputEvent(password, goog.events.KeyCodes.P);
  this.checkInputValid(this.component.getPasswordElement());
  this.checkErrorHidden(this.component.getPasswordErrorElement());

  // Emulate that the 'P' is deleted so the password is empty again.
  // There should not be error shown since we don't set error message when
  // password changes.
  goog.dom.forms.setValue(password, '');
  this.fireInputEvent(password, goog.events.KeyCodes.P);
  this.checkInputValid(this.component.getPasswordElement());
  this.checkErrorHidden(this.component.getPasswordErrorElement());
};
});
