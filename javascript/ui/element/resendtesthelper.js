/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Helper class for testing resend element.
 */

goog.provide('firebaseui.auth.ui.element.ResendTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.ResendTestHelper');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('goog.dom');
goog.require('goog.dom.classlist');

goog.scope(function() {
var element = firebaseui.auth.ui.element;


/** @constructor */
element.ResendTestHelper = function() {
  element.ResendTestHelper.base(this, 'constructor', 'Resend');
};
goog.inherits(element.ResendTestHelper, element.ElementTestHelper);


/** @override */
element.ResendTestHelper.prototype.resetState = function() {};


/** @private */
element.ResendTestHelper.prototype.testGetResendCountdown_ = function() {
  assertNotNull(this.component.getResendCountdown());
};


/** @private */
element.ResendTestHelper.prototype.testGetResendLink_ = function() {
  assertNotNull(this.component.getResendLink());
};


/** @private */
element.ResendTestHelper.prototype.testHideResendCountdown_ = function() {
  var el = this.component.getResendCountdown();
  assertEquals(false, goog.dom.classlist.contains(el, 'firebaseui-hidden'));
  this.component.hideResendCountdown();
  assertEquals(true, goog.dom.classlist.contains(el, 'firebaseui-hidden'));
};


/** @private */
element.ResendTestHelper.prototype.testShowResendLink_ = function() {
  var el = this.component.getResendLink();
  assertEquals(true, goog.dom.classlist.contains(el, 'firebaseui-hidden'));
  this.component.showResendLink();
  assertEquals(false, goog.dom.classlist.contains(el, 'firebaseui-hidden'));
};


/** @private */
element.ResendTestHelper.prototype.testUpdateResendCountdown_ = function() {
  // Double-digit rendering.
  this.component.updateResendCountdown(10);
  var expected =
      firebaseui.auth.soy2.strings.resendCountdown({timeRemaining: '0:10'})
          .toString();
  var actual = goog.dom.getTextContent(this.component.getResendCountdown());
  assertEquals(expected, actual);
  // Single-digit rendering.
  this.component.updateResendCountdown(5);
  expected =
      firebaseui.auth.soy2.strings.resendCountdown({timeRemaining: '0:05'})
          .toString();
  actual = goog.dom.getTextContent(this.component.getResendCountdown());
  assertEquals(expected, actual);
};


});
