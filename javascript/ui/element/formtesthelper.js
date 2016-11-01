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
 * @fileoverview Helper class for testing form UI element.
 */

goog.provide('firebaseui.auth.ui.element.FormTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.FormTestHelper');

goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.FormTestHelper = function() {
  element.FormTestHelper.base(this, 'constructor', 'Form');
};
goog.inherits(element.FormTestHelper, element.ElementTestHelper);


/** @override */
element.FormTestHelper.prototype.resetState = function() {
  this.submitted_ = false;
  this.linkClicked_ = false;
};


/** Handler for form submit event. */
element.FormTestHelper.prototype.onSubmit = function() {
  this.submitted_ = true;
};


/** Asserts the form is submitted. */
element.FormTestHelper.prototype.assertSubmitted = function() {
  assertTrue(this.submitted_);
};


/** Asserts the form is not submitted. */
element.FormTestHelper.prototype.assertNotSubmitted = function() {
  assertFalse(!!this.submitted_);
};


/** Handler for secondary link click event. */
element.FormTestHelper.prototype.onLinkClick = function() {
  this.linkClicked_ = true;
};


/** @private */
element.FormTestHelper.prototype.testGetSubmitElement_ = function() {
  assertNotNull(this.component.getSubmitElement());
};


/** @private */
element.FormTestHelper.prototype.testOnSubmitClick_ = function() {
  assertFalse(this.submitted_);
  goog.testing.events.fireClickSequence(this.component.getSubmitElement());
  assertTrue(this.submitted_);
};


/** @private */
element.FormTestHelper.prototype.testOnSubmitEnter_ = function() {
  assertFalse(this.submitted_);
  goog.testing.events.fireKeySequence(
      this.component.getSubmitElement(), goog.events.KeyCodes.ENTER);
  assertTrue(this.submitted_);
};


/** @private */
element.FormTestHelper.prototype.testOnLinkClick_ = function() {
  var e = this.component.getSecondaryLinkElement();
  assertFalse(this.linkClicked_);
  goog.testing.events.fireClickSequence(e);
  assertTrue(this.linkClicked_);
};


/** @private */
element.FormTestHelper.prototype.testOnLinkEnter_ = function() {
  var e = this.component.getSecondaryLinkElement();
  assertFalse(this.linkClicked_);
  goog.testing.events.fireKeySequence(e, goog.events.KeyCodes.ENTER);
  assertTrue(this.linkClicked_);
};
});
