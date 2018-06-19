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
 * @fileoverview Tests for the password account linking page.
 */

goog.provide('firebaseui.auth.ui.page.PasswordLinkingTest');
goog.setTestOnly('firebaseui.auth.ui.page.PasswordLinkingTest');

goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.PasswordTestHelper');
goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.PasswordLinking');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');


var root;
var component;
var passwordTestHelper =
    new firebaseui.auth.ui.element.PasswordTestHelper().registerTests();
var formTestHelper = new firebaseui.auth.ui.element.FormTestHelper().
    registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();
var tosPpTestHelper =
    new firebaseui.auth.ui.element.TosPpTestHelper().registerTests();


function setUp() {
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = new firebaseui.auth.ui.page.PasswordLinking(
      'user@example.com',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      'http://localhost/tos',
      'http://localhost/privacy_policy');
  component.render(root);
  passwordTestHelper.setComponent(component);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
  tosPpTestHelper.setComponent(component);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(root);
}


function testInitialFocus() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  assertEquals(
      component.getPasswordElement(),
      goog.dom.getActiveElement(document));
}


function testSubmitOnPasswordEnter() {
  goog.testing.events.fireKeySequence(
      component.getPasswordElement(), goog.events.KeyCodes.ENTER);
  formTestHelper.assertSubmitted();
}


function testPasswordLinking_pageEvents() {
  // Run page event tests.
  var pageTestHelper = new firebaseui.auth.ui.page.PageTestHelper();
  // Dispose previously created container since test must run before rendering
  // the component in docoument.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.PasswordLinking(
      'user@example.com',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testPasswordLinking_getPageId() {
  assertEquals('passwordLinking', component.getPageId());
}
