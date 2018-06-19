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
 * @fileoverview Tests for the email entry page.
 */

goog.provide('firebaseui.auth.ui.page.SignInTest');
goog.setTestOnly('firebaseui.auth.ui.page.SignInTest');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.EmailTestHelper');
goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.SignIn');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');


var root;
var component;
var emailTestHelper =
    new firebaseui.auth.ui.element.EmailTestHelper().registerTests();
// Ignore form helper submit button click as they are already explicitly
// tested.
var formTestHelper = new firebaseui.auth.ui.element.FormTestHelper()
    .excludeTests('testOnSubmitEnter_', 'testOnSubmitClick_')
    .registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();
var tosPpTestHelper =
    new firebaseui.auth.ui.element.TosPpTestHelper().registerTests();


function setUp() {
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = new firebaseui.auth.ui.page.SignIn(
      goog.bind(
          firebaseui.auth.ui.element.EmailTestHelper.prototype.onEnter,
          emailTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      undefined,
      'http://localhost/tos',
      'http://localhost/privacy_policy');
  component.render(root);
  emailTestHelper.setComponent(component);
  infoBarTestHelper.setComponent(component);
  formTestHelper.setComponent(component);
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
      component.getEmailElement(),
      goog.dom.getActiveElement(document));
}


function testEmail_onEnter() {
  emailTestHelper.resetState();
  assertFalse(emailTestHelper.enterPressed_);
  goog.testing.events.fireKeySequence(
      component.getEmailElement(), goog.events.KeyCodes.ENTER);
  assertTrue(emailTestHelper.enterPressed_);
}


function testNextButton_onClick() {
  emailTestHelper.resetState();
  assertFalse(emailTestHelper.enterPressed_);
  goog.testing.events.fireClickSequence(component.getSubmitElement());
  assertTrue(emailTestHelper.enterPressed_);
}


function testSignIn_fullMessage() {
  component.dispose();
  component = new firebaseui.auth.ui.page.SignIn(
      goog.bind(
          firebaseui.auth.ui.element.EmailTestHelper.prototype.onEnter,
          emailTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      undefined,
      'http://localhost/tos',
      'http://localhost/privacy_policy',
      true);
  component.render(root);
  tosPpTestHelper.setComponent(component);
  tosPpTestHelper.assertFullMessage('http://localhost/tos',
      'http://localhost/privacy_policy');
}


function testSignIn_fullMessage_noUrl() {
  component.dispose();
  component = new firebaseui.auth.ui.page.SignIn(
      goog.bind(
          firebaseui.auth.ui.element.EmailTestHelper.prototype.onEnter,
          emailTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      undefined,
      null,
      null,
      true);
  component.render(root);
  tosPpTestHelper.setComponent(component);
  tosPpTestHelper.assertFullMessage(null, null);
}


function testSignIn_footerOnly() {
  tosPpTestHelper.assertFooter('http://localhost/tos',
      'http://localhost/privacy_policy');
}


function testSignIn_footerOnly_noUrl() {
  component.dispose();
  component = new firebaseui.auth.ui.page.SignIn(
      goog.bind(
          firebaseui.auth.ui.element.EmailTestHelper.prototype.onEnter,
          emailTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      undefined,
      null,
      null);
  component.render(root);
  tosPpTestHelper.setComponent(component);
  tosPpTestHelper.assertFooter(null, null);
}


function testSignIn_pageEvents() {
  // Run page event tests.
  var pageTestHelper = new firebaseui.auth.ui.page.PageTestHelper();
  // Dispose previously created container since test must run before rendering
  // the component in docoument.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.SignIn(
      goog.bind(
          firebaseui.auth.ui.element.EmailTestHelper.prototype.onEnter,
          emailTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testSignIn_noOnCancelClick() {
  component.dispose();
  // Initialize component with no onCancelClick callback.
  component = new firebaseui.auth.ui.page.SignIn(
      goog.bind(
          firebaseui.auth.ui.element.EmailTestHelper.prototype.onEnter,
          emailTestHelper));
  component.render(root);
  emailTestHelper.setComponent(component);
  // No cancel button
  assertNull(component.getSecondaryLinkElement());
  // Submit button should be available.
  assertNotNull(component.getSubmitElement());
  // Confirm pressing enter in email field will submit form.
  emailTestHelper.resetState();
  assertFalse(emailTestHelper.enterPressed_);
  goog.testing.events.fireKeySequence(
      component.getEmailElement(), goog.events.KeyCodes.ENTER);
  assertTrue(emailTestHelper.enterPressed_);
}


function testSignIn_getPageId() {
  assertEquals('signIn', component.getPageId());
}
