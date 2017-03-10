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
 * @fileoverview Tests for the password sign-up page.
 */

goog.provide('firebaseui.auth.ui.page.PasswordSignUpTest');
goog.setTestOnly('firebaseui.auth.ui.page.PasswordSignUpTest');

goog.require('firebaseui.auth.ui.element.EmailTestHelper');
goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.NameTestHelper');
goog.require('firebaseui.auth.ui.element.NewPasswordTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.PasswordSignUp');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');


var root;
var component;
var emailTestHelper = new firebaseui.auth.ui.element.EmailTestHelper().
    excludeTests('testOnEnter_', 'testOnTextChanged_').
    registerTests();
var nameTestHelper =
    new firebaseui.auth.ui.element.NameTestHelper().registerTests();
var newPasswordTestHelper =
    new firebaseui.auth.ui.element.NewPasswordTestHelper().registerTests();
var formTestHelper =
    new firebaseui.auth.ui.element.FormTestHelper().registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();


function createComponent(tosUrl, requireDisplayName, opt_name) {
  var component = new firebaseui.auth.ui.page.PasswordSignUp(
      tosUrl,
      requireDisplayName,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      'user@example.com',
      opt_name);
  component.render(root);
  emailTestHelper.setComponent(component);
  nameTestHelper.setComponent(component);
  newPasswordTestHelper.setComponent(component);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
  return component;
}


function setUp() {
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = createComponent('http://localhost/tos', true);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(root);
}


function testInitialFocus_email() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = new firebaseui.auth.ui.page.PasswordSignUp(
      null,
      true,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  component.render(root);
  assertEquals(
      component.getEmailElement(),
      goog.dom.getActiveElement(document));
}


function testInitialFocus_nameIsRequired() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  assertEquals(
      component.getNameElement(),
      goog.dom.getActiveElement(document));
}


function testInitialFocus_nameIsNotRequired() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = new firebaseui.auth.ui.page.PasswordSignUp(
      null,
      false,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  component.render(root);
  assertNull(component.getNameElement());
}


function testInitialFocus_newPassword() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = createComponent('http://localhost/tos', true, 'John Doe');
  assertEquals(
      component.getNewPasswordElement(),
      goog.dom.getActiveElement(document));
}


function testFocusOnEmailEnter_nameIsRequired() {
  goog.testing.events.fireKeySequence(
      component.getEmailElement(), goog.events.KeyCodes.ENTER);
  assertEquals(
      component.getNameElement(),
      goog.dom.getActiveElement(document));
}


function testFocusOnEmailEnter_nameIsNotRequired() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  component = new firebaseui.auth.ui.page.PasswordSignUp(
      null,
      false,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  component.render(root);

  // When name is not present, the focus should move to
  // password field on pressing enter.
  goog.testing.events.fireKeySequence(
      component.getEmailElement(), goog.events.KeyCodes.ENTER);
  assertEquals(
      component.getNewPasswordElement(),
      goog.dom.getActiveElement(document));
}


function testFocusToNewPasswordOnNameEnter() {
  goog.testing.events.fireKeySequence(
      component.getNameElement(), goog.events.KeyCodes.ENTER);
  assertEquals(
      component.getNewPasswordElement(),
      goog.dom.getActiveElement(document));
}


function testSubmitOnNewPasswordEnter() {
  component.dispose();
  component = createComponent(null, true); // No ToS.
  goog.testing.events.fireKeySequence(
      component.getNewPasswordElement(), goog.events.KeyCodes.ENTER);
  formTestHelper.assertSubmitted();
}


function testPasswordSignUp_pageEvents() {
  // Run page event tests.
  var pageTestHelper = new firebaseui.auth.ui.page.PageTestHelper();
  // Initialize component.
  component = new firebaseui.auth.ui.page.PasswordSignUp(
      null,
      true,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testPasswordSignUp_getPageId() {
  assertEquals('passwordSignUp', component.getPageId());
}
