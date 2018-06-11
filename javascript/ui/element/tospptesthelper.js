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


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.TosPpTestHelper = function() {
  element.TosPpTestHelper.base(this, 'constructor', 'TosPp');
};
goog.inherits(element.TosPpTestHelper, element.ElementTestHelper);


/** @override */
element.TosPpTestHelper.prototype.resetState = function() {
};


/** Asserts the full message of ToS and Privacy Policy is displayed. */
element.TosPpTestHelper.prototype.assertFullMessage = function(
    tosUrl, privacyPolicyUrl) {
  var element = this.component.getTosPpElement();
  if (!tosUrl && !privacyPolicyUrl) {
    assertNull(element);
  } else {
    assertTrue(element.classList.contains('firebaseui-tospp-full-message'));
    assertEquals(tosUrl, this.component.getTosLinkElement().href);
    assertEquals(privacyPolicyUrl, this.component.getPpLinkElement().href);
  }
};


/** Asserts the footer of ToS and Privacy Policy links is displayed. */
element.TosPpTestHelper.prototype.assertFooter = function(
    tosUrl, privacyPolicyUrl) {
  var element = this.component.getTosPpListElement();
  if (!tosUrl && !privacyPolicyUrl) {
    assertNull(element);
  } else {
    assertTrue(element.classList.contains('firebaseui-tos-list'));
    assertEquals(tosUrl, this.component.getTosLinkElement().href);
    assertEquals(privacyPolicyUrl, this.component.getPpLinkElement().href);
  }
};


/** Asserts the full message of ToS and Privacy Policy and a notice to the user
  * about SMS rates for phone authentication are displayed. */
element.TosPpTestHelper.prototype.assertPhoneFullMessage = function(
    tosUrl, privacyPolicyUrl) {
  var element = this.component.getTosPpElement();
  assertTrue(element.classList.contains('firebaseui-phone-tos'));
  if (!tosUrl && !privacyPolicyUrl) {
    assertNull(this.component.getTosLinkElement());
    assertNull(this.component.getPpLinkElement());
  } else {
    assertEquals(tosUrl, this.component.getTosLinkElement().href);
    assertEquals(privacyPolicyUrl, this.component.getPpLinkElement().href);
  }
};


/** Asserts a notice to the user about SMS rates for phone authentication
  * and the link of ToS and Privacy Policy are displayed. */
element.TosPpTestHelper.prototype.assertPhoneFooter = function(
    tosUrl, privacyPolicyUrl) {
  var element = this.component.getTosPpElement();
  assertTrue(element.classList.contains('firebaseui-phone-sms-notice'));
  this.assertFooter(tosUrl, privacyPolicyUrl);
};


/** @private */
element.TosPpTestHelper.prototype.testGetTosPpElement_ = function() {
  assertNotNull(this.component.getTosPpElement());
};


/** @private */
element.TosPpTestHelper.prototype.testGetTosLinkElement_ = function() {
  assertNotNull(this.component.getTosLinkElement());
};


/** @private */
element.TosPpTestHelper.prototype.testGetPpLinkElement_ = function() {
  assertNotNull(this.component.getPpLinkElement());
};
});
