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
 * @fileoverview Helper class for testing the new password UI element.
 */

goog.provide('firebaseui.auth.ui.element.NewPasswordTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.NewPasswordTestHelper');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.userAgent');



goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.NewPasswordTestHelper = function() {
  element.NewPasswordTestHelper.base(this, 'constructor', 'NewPassword');
};
goog.inherits(element.NewPasswordTestHelper, element.ElementTestHelper);


/** @override */
element.NewPasswordTestHelper.prototype.resetState = function() {
  element.setValid(this.component.getNewPasswordElement());
  goog.dom.forms.setValue(this.component.getNewPasswordElement(), '');
  element.hide(this.component.getNewPasswordErrorElement());
};


/** @private */
element.NewPasswordTestHelper.prototype.testGetNewPasswordElement_ =
    function() {
  assertNotNull(this.component.getNewPasswordElement());
};


/** @private */
element.NewPasswordTestHelper.prototype.testGetNewPasswordErrorElement_ =
    function() {
  assertNotNull(this.component.getNewPasswordErrorElement());
};


/** @private */
element.NewPasswordTestHelper.prototype.testTogglePassword_ = function() {
  var password = this.component.getNewPasswordElement();
  var toggle = this.component.getPasswordToggleElement();

  assertTrue(goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-on'));
  assertEquals('password', password['type']);

  // Click on the eye icon.
  goog.testing.events.fireClickEvent(toggle);
  assertTrue(
      goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-off'));
  assertEquals('text', password['type']);

  // Click on the eye icon again.
  goog.testing.events.fireClickEvent(toggle);
  assertTrue(goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-on'));
  assertEquals('password', password['type']);
};


/** @private */
element.NewPasswordTestHelper.prototype.testFocusNewPassword_ = function() {
  // TODO: Write tests for IE. This is complicated by IE delaying focus events
  // firing until this function returns.
  // http://stackoverflow.com/questions/5900288/ie-focus-event-handler-delay
  if (goog.userAgent.IE) {
    return;
  }

  var password = this.component.getNewPasswordElement();
  var toggle = this.component.getPasswordToggleElement();

  // Focus the new password input.
  goog.testing.events.fireFocusEvent(password);
  assertTrue(
      goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-focus'));
  assertFalse(
      goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-blur'));

  // Unfocus the new password input.
  goog.testing.events.fireBlurEvent(password);
  console.log(toggle.classList);
  assertTrue(
      goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-blur'));
  assertFalse(
      goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-focus'));

  // Focus the new password input again.
  goog.testing.events.fireFocusEvent(password);
  assertTrue(
      goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-focus'));
  assertFalse(
      goog.dom.classlist.contains(toggle, 'firebaseui-input-toggle-blur'));
};


/** @private */
element.NewPasswordTestHelper.prototype.testCheckAndGetNewPasswordEmpty_ =
    function() {
  assertNull(this.component.checkAndGetNewPassword());
  this.checkInputInvalid(this.component.getNewPasswordElement());
  this.checkErrorShown(
      this.component.getNewPasswordErrorElement(),
      firebaseui.auth.soy2.strings.errorMissingPassword().toString());
};


/** @private */
element.NewPasswordTestHelper.prototype.testCheckAndGetNewPassword_ =
    function() {
  var password = this.component.getNewPasswordElement();
  var error = this.component.getNewPasswordErrorElement();
  goog.dom.forms.setValue(password, 'Password');
  assertEquals('Password', this.component.checkAndGetNewPassword());
  this.checkInputValid(password);
  this.checkErrorHidden(error);
};


/** @private */
element.NewPasswordTestHelper.prototype.testOnPasswordChange_ = function() {
  var password = this.component.getNewPasswordElement();
  var error = this.component.getNewPasswordErrorElement();

  // Empty password field.
  goog.dom.forms.setValue(password, '');
  assertNull(this.component.checkAndGetNewPassword());
  this.checkInputInvalid(password);
  this.checkErrorShown(error,
      firebaseui.auth.soy2.strings.errorMissingPassword().toString());

  // Emulate that a 'P' is typed in to new password input.
  goog.dom.forms.setValue(password, 'P');
  this.fireInputEvent(password, goog.events.KeyCodes.P);
  this.checkInputValid(password);
  this.checkErrorHidden(error);

  // Emulate that the 'P' is deleted from new password input.
  goog.dom.forms.setValue(password, '');
  this.fireInputEvent(password, goog.events.KeyCodes.BACKSPACE);
  this.checkInputValid(password);
  this.checkErrorHidden(error);
};
}); // goog.scope
