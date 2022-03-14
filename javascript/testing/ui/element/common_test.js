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
 * @fileoverview Tests for common.js
 */
goog.provide('firebaseui.auth.ui.elementTest');
goog.setTestOnly('firebaseui.auth.ui.elementTest');

goog.require('firebaseui.auth.ui.element');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.jsunit');


/** Test DOM element */
var e;

var CLASS_VALID_INPUT_ = 'firebaseui-input';
var CLASS_INVALID_INPUT_ = 'firebaseui-input-invalid';
var CLASS_HIDDEN_ = 'firebaseui-hidden';


function tearDown() {
  if (e) {
    goog.dom.removeNode(e);
    e = null;
  }
}


function testValid_validToValid() {
  e = goog.dom.createDom(
      goog.dom.TagName.INPUT, {'type': 'text', 'class': CLASS_VALID_INPUT_});
  firebaseui.auth.ui.element.setValid(e, true);
  assertTrue(goog.dom.classlist.contains(e, CLASS_VALID_INPUT_));
  assertFalse(goog.dom.classlist.contains(e, CLASS_INVALID_INPUT_));
}


function testValid_validToInvalid() {
  e = goog.dom.createDom(
      goog.dom.TagName.INPUT, {'type': 'text', 'class': CLASS_VALID_INPUT_});
  firebaseui.auth.ui.element.setValid(e, false);
  assertFalse(goog.dom.classlist.contains(e, CLASS_VALID_INPUT_));
  assertTrue(goog.dom.classlist.contains(e, CLASS_INVALID_INPUT_));
}


function testValid_invalidToValid() {
  e = goog.dom.createDom(
      goog.dom.TagName.INPUT, {'type': 'text', 'class': CLASS_INVALID_INPUT_});
  firebaseui.auth.ui.element.setValid(e, true);
  assertTrue(goog.dom.classlist.contains(e, CLASS_VALID_INPUT_));
  assertFalse(goog.dom.classlist.contains(e, CLASS_INVALID_INPUT_));
}


function testValid_invalidToInvalid() {
  e = goog.dom.createDom(
      goog.dom.TagName.INPUT, {'type': 'text', 'class': CLASS_INVALID_INPUT_});
  firebaseui.auth.ui.element.setValid(e, false);
  assertFalse(goog.dom.classlist.contains(e, CLASS_VALID_INPUT_));
  assertTrue(goog.dom.classlist.contains(e, CLASS_INVALID_INPUT_));
}


function testGetInputValue_empty() {
  e = goog.dom.createDom(goog.dom.TagName.INPUT, {'type': 'text'});
  assertEquals('', firebaseui.auth.ui.element.getInputValue(e));
}


function testGetInputValue_nonEmpty() {
  e = goog.dom.createDom(
      goog.dom.TagName.INPUT, {'type': 'text', 'value': 'value'});
  assertEquals('value', firebaseui.auth.ui.element.getInputValue(e));
}


function testHide_hiddenToHidden() {
  e = goog.dom.createDom(goog.dom.TagName.P, {'class': CLASS_HIDDEN_});
  firebaseui.auth.ui.element.hide(e);
  assertFalse(firebaseui.auth.ui.element.isShown(e));
}


function testShow_hiddenToShown() {
  e = goog.dom.createDom(goog.dom.TagName.P, {'class': CLASS_HIDDEN_});
  firebaseui.auth.ui.element.show(e, 'hiddenToShown');
  assertTrue(firebaseui.auth.ui.element.isShown(e));
  assertEquals('hiddenToShown', goog.dom.getTextContent(e));
}


function testHide_shownToHidden() {
  e = goog.dom.createDom(goog.dom.TagName.P);
  firebaseui.auth.ui.element.hide(e);
  assertFalse(firebaseui.auth.ui.element.isShown(e));
}


function testShow_shownToShown() {
  e = goog.dom.createDom(goog.dom.TagName.P);
  firebaseui.auth.ui.element.show(e, 'shownToShown');
  assertTrue(firebaseui.auth.ui.element.isShown(e));
  assertEquals('shownToShown', goog.dom.getTextContent(e));
}


function testIsDeeplyHidden() {
  var e1 = goog.dom.createDom(goog.dom.TagName.P, {'class': CLASS_HIDDEN_});
  assertTrue(firebaseui.auth.ui.element.isDeeplyHidden(e1));
  var e2 = goog.dom.createDom(goog.dom.TagName.P);
  e1.appendChild(e2);
  assertTrue(firebaseui.auth.ui.element.isDeeplyHidden(e2));
}


function testIsDeeplyHidden_style() {
  var e1 = goog.dom.createDom(goog.dom.TagName.P, {'style': 'display:none'});
  assertTrue(firebaseui.auth.ui.element.isDeeplyHidden(e1));
  var e2 = goog.dom.createDom(goog.dom.TagName.P);
  e1.appendChild(e2);
  assertTrue(firebaseui.auth.ui.element.isDeeplyHidden(e2));
}
