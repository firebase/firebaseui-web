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
 * @fileoverview Helper class for testing info bar UI element.
 */

goog.provide('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.InfoBarTestHelper');

goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.dom');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.InfoBarTestHelper = function() {
  element.InfoBarTestHelper.base(this, 'constructor', 'InfoBar');
};
goog.inherits(element.InfoBarTestHelper, element.ElementTestHelper);


/** @override */
element.InfoBarTestHelper.prototype.resetState = function() {
  this.component.dismissInfoBar();
};


/** Handler for secondary link click event. */
element.InfoBarTestHelper.prototype.onLinkClick = function() {
  this.linkClicked_ = true;
};


/** @private */
element.InfoBarTestHelper.prototype.testShowInfoBar_ = function() {
  assertNull(this.component.getInfoBarElement());
  this.component.showInfoBar('test message');
  var infoBar = this.component.getInfoBarElement();
  assertNotNull(infoBar);
  assertTrue(goog.dom.getTextContent(infoBar).indexOf('test message') > -1);
};


/** @private */
element.InfoBarTestHelper.prototype.testShowInfoBarAndDismiss_ = function() {
  assertNull(this.component.getInfoBarElement());
  this.component.showInfoBar('test message');
  assertNotNull(this.component.getInfoBarElement());
  var dismissLink = this.component.getInfoBarDismissLinkElement();
  assertNotNull(dismissLink);
  goog.testing.events.fireClickSequence(dismissLink);
  assertNull(this.component.getInfoBarElement());
};


/** @private */
element.InfoBarTestHelper.prototype.testShowInfoBarAndEnterDismiss_ =
    function() {
  assertNull(this.component.getInfoBarElement());
  this.component.showInfoBar('test message');
  assertNotNull(this.component.getInfoBarElement());
  var dismissLink = this.component.getInfoBarDismissLinkElement();
  assertNotNull(dismissLink);
  goog.testing.events.fireKeySequence(dismissLink, goog.events.KeyCodes.ENTER);
  assertNull(this.component.getInfoBarElement());
};


/** @private */
element.InfoBarTestHelper.prototype.testDismissInfoBar_ = function() {
  assertNull(this.component.getInfoBarElement());
  this.component.showInfoBar('test message');
  assertNotNull(this.component.getInfoBarElement());
  this.component.dismissInfoBar();
  assertNull(this.component.getInfoBarElement());
};
});
