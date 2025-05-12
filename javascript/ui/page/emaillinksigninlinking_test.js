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
 * @fileoverview Tests for the email link sign in linking page.
 */

goog.provide('firebaseui.auth.ui.page.EmailLinkSignInLinkingTest');
goog.setTestOnly('firebaseui.auth.ui.page.EmailLinkSignInLinkingTest');

goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
goog.require('firebaseui.auth.ui.page.EmailLinkSignInLinking');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');


var mockClock;
var root;
var component;
var formTestHelper = new firebaseui.auth.ui.element.FormTestHelper().
    excludeTests('testOnLinkClick_', 'testOnLinkEnter_').
    registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();
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
  component = new firebaseui.auth.ui.page.EmailLinkSignInLinking(
      'user@example.com',
      {
        providerId: 'facebook.com'
      },
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.TosPpTestHelper.prototype.onTosLinkClick,
          tosPpTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.TosPpTestHelper.prototype.onPpLinkClick,
          tosPpTestHelper));
  component.render(root);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
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


function testInitialFocus() {
  assertEquals(
      component.getSubmitElement(),
      goog.dom.getActiveElement(document));
}


function testEmailLinkSignInLinking_pageEvents() {
  // Run page event tests.
  // Dispose previously created container since test must run before rendering
  // the component in document.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.EmailLinkSignInLinking(
      'user@example.com',
      {
        providerId: 'facebook.com'
      },
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testEmailLinkSignInLinking_getPageId() {
  assertEquals('emailLinkSignInLinking', component.getPageId());
}
