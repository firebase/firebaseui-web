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
 * @fileoverview Helper class for testing email UI element.
 */

goog.provide('firebaseui.auth.ui.element.EmailTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.EmailTestHelper');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.ui.Component');


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.EmailTestHelper = function() {
  element.EmailTestHelper.base(this, 'constructor', 'Email');
};
goog.inherits(element.EmailTestHelper, element.ElementTestHelper);


/** Handler for enter key event. */
element.EmailTestHelper.prototype.onEnter = function() {
  this.enterPressed_ = true;
};


/** @override */
element.EmailTestHelper.prototype.resetState = function() {
  this.textChanged_ = false;
  this.enterPressed_ = false;
};


/** @private */
element.EmailTestHelper.prototype.testGetEmailElement_ = function() {
  assertNotNull(this.component.getEmailElement());
};


/** @private */
element.EmailTestHelper.prototype.testGetEmailErrorElement_ = function() {
  assertNotNull(this.component.getEmailErrorElement());
};


/** @private */
element.EmailTestHelper.prototype.testGetEmail_ = function() {
  var e = this.component.getEmailElement();
  goog.dom.forms.setValue(e, 'user@example.com');
  assertEquals('user@example.com', this.component.getEmail());
  goog.dom.forms.setValue(e, '');
  assertEquals('', this.component.getEmail());
};


/** @private */
element.EmailTestHelper.prototype.testCheckAndGetEmailEmpty_ = function() {
  goog.dom.forms.setValue(this.component.getEmailElement(), '');
  assertNull(this.component.checkAndGetEmail());
  this.checkInputInvalid(this.component.getEmailElement());
  this.checkErrorShown(this.component.getEmailErrorElement(),
      firebaseui.auth.soy2.strings.errorMissingEmail().toString());
};


/** @private */
element.EmailTestHelper.prototype.testCheckAndGetEmailInvalid_ = function() {
  goog.dom.forms.setValue(this.component.getEmailElement(), 'user@');
  assertNull(this.component.checkAndGetEmail());
  this.checkInputInvalid(this.component.getEmailElement());
  this.checkErrorShown(this.component.getEmailErrorElement(),
      firebaseui.auth.soy2.strings.errorInvalidEmail().toString());
};


/** @private */
element.EmailTestHelper.prototype.testOnTextChangedClearError_ = function() {
  var email = this.component.getEmailElement();
  var error = this.component.getEmailErrorElement();

  // Empty names, show error.
  goog.dom.forms.setValue(email, '');
  assertNull(this.component.checkAndGetEmail());
  this.checkInputInvalid(email);
  this.checkErrorShown(error,
      firebaseui.auth.soy2.strings.errorMissingEmail().toString());

  // Emulate that a 'u' is typed in to name input.
  goog.dom.forms.setValue(email, 'u');
  this.fireInputEvent(email, goog.events.KeyCodes.U);
  this.checkInputValid(email);
  this.checkErrorHidden(error);

  // Emulate that the 'u' is deleted so the name input is empty again.
  goog.dom.forms.setValue(email, '');
  this.fireInputEvent(email, goog.events.KeyCodes.U);
  this.checkInputValid(email);
  this.checkErrorHidden(error);
};


/** @private */
element.EmailTestHelper.prototype.testOnEnter_ = function() {
  var e = this.component.getEmailElement();
  assertFalse(this.enterPressed_);
  goog.testing.events.fireKeySequence(e, goog.events.KeyCodes.ENTER);
  assertTrue(this.enterPressed_);
};
});
