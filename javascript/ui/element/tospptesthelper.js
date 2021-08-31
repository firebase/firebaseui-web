/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview Helper class for testing the Terms of Service and Privacy
 *     Policy UI element.
 */

goog.provide('firebaseui.auth.ui.element.TosPpTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.TosPpTestHelper');

goog.require('firebaseui.auth.ui.element');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.testing.events');


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.TosPpTestHelper = function() {
  element.TosPpTestHelper.base(this, 'constructor', 'TosPp');
};
goog.inherits(element.TosPpTestHelper, element.ElementTestHelper);


/** @override */
element.TosPpTestHelper.prototype.resetState = function() {
  this.tosLinkClicked_ = false;
  this.privacyPolicyLinkClicked_ = false;
};


/** Handler for ToS link click event. */
element.TosPpTestHelper.prototype.onTosLinkClick = function() {
  this.tosLinkClicked_ = true;
};


/** Handler for Privacy Policy link click event. */
element.TosPpTestHelper.prototype.onPpLinkClick = function() {
  this.privacyPolicyLinkClicked_ = true;
};


/**
 * Asserts the full message of ToS and Privacy Policy is displayed.
 * @param {?function()|undefined} tosCallback The ToS callback.
 * @param {?function()|undefined} privacyPolicyCallback The Privacy Policy
 *     callback.
 */
element.TosPpTestHelper.prototype.assertFullMessage = function(
    tosCallback, privacyPolicyCallback) {
  var element = this.component.getTosPpElement();
  if (!tosCallback && !privacyPolicyCallback) {
    assertNull(element);
  } else {
    assertTrue(element.classList.contains('firebaseui-tospp-full-message'));
    this.assertTosLinkClicked_();
    this.assertPpLinkClicked_();
  }
};


/**
 * Asserts the footer of ToS and Privacy Policy links is displayed.
 * @param {?function()|undefined} tosCallback The ToS callback.
 * @param {?function()|undefined} privacyPolicyCallback The Privacy Policy
 *     callback.
 */
element.TosPpTestHelper.prototype.assertFooter = function(
    tosCallback, privacyPolicyCallback) {
  var element = this.component.getTosPpListElement();
  if (!tosCallback && !privacyPolicyCallback) {
    assertNull(element);
  } else {
    assertTrue(element.classList.contains('firebaseui-tos-list'));
    this.assertTosLinkClicked_();
    this.assertPpLinkClicked_();
  }
};


/**
 * Asserts the full message of ToS and Privacy Policy and a notice to the user
 * about SMS rates for phone authentication are displayed.
 * @param {?function()|undefined} tosCallback The ToS callback.
 * @param {?function()|undefined} privacyPolicyCallback The Privacy Policy
 *     callback.
 */
element.TosPpTestHelper.prototype.assertPhoneFullMessage = function(
    tosCallback, privacyPolicyCallback) {
  var element = this.component.getTosPpElement();
  assertTrue(element.classList.contains('firebaseui-phone-tos'));
  if (!tosCallback && !privacyPolicyCallback) {
    assertNull(this.component.getTosLinkElement());
    assertNull(this.component.getPpLinkElement());
  } else {
    this.assertTosLinkClicked_();
    this.assertPpLinkClicked_();
  }
};


/**
 * Asserts a notice to the user about SMS rates for phone authentication
 * and the link of ToS and Privacy Policy are displayed.
 * @param {?function()|undefined} tosCallback The ToS callback.
 * @param {?function()|undefined} privacyPolicyCallback The Privacy Policy
 *     callback.
 */
element.TosPpTestHelper.prototype.assertPhoneFooter = function(
    tosCallback, privacyPolicyCallback) {
  var element = this.component.getTosPpElement();
  assertTrue(element.classList.contains('firebaseui-phone-sms-notice'));
  this.assertFooter(tosCallback, privacyPolicyCallback);
};


/**
 * Asserts the onClick callback is triggered when ToS link element is clicked.
 * @private
 */
element.TosPpTestHelper.prototype.assertTosLinkClicked_ = function() {
  assertFalse(this.tosLinkClicked_);
  goog.testing.events.fireClickSequence(this.component.getTosLinkElement());
  assertTrue(this.tosLinkClicked_);
};


/**
 * Asserts the onClick callback is triggered when Pp link element is clicked.
 * @private
 */
element.TosPpTestHelper.prototype.assertPpLinkClicked_ = function() {
  assertFalse(this.privacyPolicyLinkClicked_);
  goog.testing.events.fireClickSequence(this.component.getPpLinkElement());
  assertTrue(this.privacyPolicyLinkClicked_);
};


/** @private */
element.TosPpTestHelper.prototype.testGetTosPpElement_ = function() {
  assertNotNull(this.component.getTosPpElement());
};


/** @private */
element.TosPpTestHelper.prototype.testGetTosLinkElement_ = function() {
  assertNotNull(this.component.getTosLinkElement());
  this.assertTosLinkClicked_();
};


/** @private */
element.TosPpTestHelper.prototype.testGetPpLinkElement_ = function() {
  assertNotNull(this.component.getPpLinkElement());
  this.assertPpLinkClicked_();
};
});
