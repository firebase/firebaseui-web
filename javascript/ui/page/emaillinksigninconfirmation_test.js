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
 * @fileoverview Tests for the email link sign in confirmation page.
 */

goog.provide('firebaseui.auth.ui.page.EmailLinkSignInConfirmationTest');
goog.setTestOnly('firebaseui.auth.ui.page.EmailLinkSignInConfirmationTest');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.EmailTestHelper');
goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
goog.require('firebaseui.auth.ui.page.EmailLinkSignInConfirmation');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');


var mockClock;
var root;
var component;
var emailTestHelper =
    new firebaseui.auth.ui.element.EmailTestHelper().registerTests();
// Ignore form helper submit button click as they are already explicitly
// tested.
var formTestHelper = new firebaseui.auth.ui.element.FormTestHelper()
    .excludeTests('testOnSubmitEnter_', 'testOnSubmitClick_')
    .registerTests();
var tosPpTestHelper =
    new firebaseui.auth.ui.element.TosPpTestHelper().registerTests();
var pageTestHelper =
    new firebaseui.auth.ui.page.PageTestHelper().registerTests();

function setUp() {
  // Set up clock.
  mockClock = new goog.testing.MockClock();
  mockClock.install();
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = new firebaseui.auth.ui.page.EmailLinkSignInConfirmation(
      goog.bind(
          firebaseui.auth.ui.element.EmailTestHelper.prototype.onEnter,
          emailTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      undefined,
      goog.bind(
          firebaseui.auth.ui.element.TosPpTestHelper.prototype.onTosLinkClick,
          tosPpTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.TosPpTestHelper.prototype.onPpLinkClick,
          tosPpTestHelper));
  component.render(root);
  emailTestHelper.setComponent(component);
  formTestHelper.setComponent(component);
  tosPpTestHelper.setComponent(component);
  // Reset previous state of tosPp helper.
  tosPpTestHelper.resetState();
  pageTestHelper.setClock(mockClock).setComponent(component);
}


function tearDown() {
  // Tear down clock.
  mockClock.tick(Infinity);
  mockClock.reset();
  component.dispose();
  goog.dom.removeNode(root);
}


function testInitialFocus_emailElement() {
  assertEquals(
      component.getEmailElement(),
      goog.dom.getActiveElement(document));
}


function testEmailLinkSignInConfirmation_onEmailEnter() {
  emailTestHelper.resetState();
  assertFalse(emailTestHelper.enterPressed_);
  goog.testing.events.fireKeySequence(
      component.getEmailElement(), goog.events.KeyCodes.ENTER);
  assertTrue(emailTestHelper.enterPressed_);
}


function testEmailLinkSignInConfirmation_onNextClick() {
  emailTestHelper.resetState();
  assertFalse(emailTestHelper.enterPressed_);
  goog.testing.events.fireClickSequence(component.getSubmitElement());
  assertTrue(emailTestHelper.enterPressed_);
}


function testEmailLinkSignInConfirmation_pageEvents() {
  // Run page event tests.
  // Dispose previously created container since test must run before rendering
  // the component in document.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.EmailLinkSignInConfirmation(
      goog.bind(
          firebaseui.auth.ui.element.EmailTestHelper.prototype.onEnter,
          emailTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onLinkClick,
          formTestHelper),
      undefined,
      goog.bind(
          firebaseui.auth.ui.element.TosPpTestHelper.prototype.onTosLinkClick,
          tosPpTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.TosPpTestHelper.prototype.onPpLinkClick,
          tosPpTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testEmailLinkSignInConfirmation_getPageId() {
  assertEquals('emailLinkSignInConfirmation', component.getPageId());
}
