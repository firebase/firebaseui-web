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
 * @fileoverview Tests for the phone confirmation code entry page.
 */

goog.provide('firebaseui.auth.ui.page.PhoneSignInFinishTest');
goog.setTestOnly('firebaseui.auth.ui.page.PhoneSignInFinishTest');

goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.PhoneConfirmationCodeTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.PhoneSignInFinish');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');


var root;
var component;
var phoneNumber = '+13115552368';
var wasChangePhoneLinkClicked;
var onChangePhoneClick;
var phoneConfirmationCodeTestHelper =
    new firebaseui.auth.ui.element.PhoneConfirmationCodeTestHelper()
        .registerTests();
var formTestHelper =
    new firebaseui.auth.ui.element.FormTestHelper().registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();


function setUp() {
  wasChangePhoneLinkClicked = false;
  onChangePhoneClick = function() {
    wasChangePhoneLinkClicked = true;
  };
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = createComponent(phoneNumber);
}

function tearDown() {
  component.dispose();
  goog.dom.removeNode(root);
}


/**
 * @param {!string} phoneNumber The phone number being confirmed.
 * @return {!goog.ui.Component} The rendered PhoneSignInFinish component.
 */
function createComponent(phoneNumber) {
  var component = new firebaseui.auth.ui.page.PhoneSignInFinish(
      onChangePhoneClick,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      phoneNumber);
  phoneConfirmationCodeTestHelper.setComponent(component);
  formTestHelper.setComponent(component);
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
  component.render(root);
  return component;
}


function testPhoneSignInFinish_componentRendering() {
  component.dispose();
  component = createComponent(phoneNumber);
  assertNotNull(component.getChangePhoneNumberElement());
  assertNotNull(component.getPhoneConfirmationCodeElement());
  assertNotNull(component.getPhoneConfirmationCodeErrorElement());
}


function testPhoneSignInFinish_initialFocus() {
  component.dispose();
  component = createComponent(phoneNumber);
  assertEquals(
      component.getPhoneConfirmationCodeElement(),
      goog.dom.getActiveElement(document));
}


function testPhoneSignInFinish_changePhoneNumberLink() {
  component.dispose();
  component = createComponent(phoneNumber);
  var link = component.getChangePhoneNumberElement();
  assertFalse(wasChangePhoneLinkClicked);
  goog.testing.events.fireClickSequence(link);
  assertTrue(wasChangePhoneLinkClicked);
}


function testPhoneSignInFinish_submitOnEnter() {
  component.dispose();
  component = createComponent(phoneNumber);
  goog.testing.events.fireKeySequence(
      component.getPhoneConfirmationCodeElement(), goog.events.KeyCodes.ENTER);
  formTestHelper.assertSubmitted();
}


function testSubmitOnSubmitElementClick() {
  component.dispose();
  component = createComponent(phoneNumber);
  var button = component.getSubmitElement();
  goog.testing.events.fireClickSequence(button);
  formTestHelper.assertSubmitted();
}


function testPhoneSignInFinish_pageEvents() {
  var pageTestHelper = new firebaseui.auth.ui.page.PageTestHelper();
  component = new firebaseui.auth.ui.page.PhoneSignInFinish(
      onChangePhoneClick,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      phoneNumber);
  pageTestHelper.runTests(component, root);
}


function testPhoneSignInFinish_getPageId() {
  assertEquals('phoneSignInFinish', component.getPageId());
}
