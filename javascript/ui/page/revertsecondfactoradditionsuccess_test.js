/*
 * Copyright 2019 Google Inc. All Rights Reserved.
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
 * @fileoverview Tests for the revert second factor addition success page.
 */

goog.provide('firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccessTest');
goog.setTestOnly(
    'firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccessTest');

goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccess');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');


let mockClock;
let root;
let component;
const formTestHelper = new firebaseui.auth.ui.element.FormTestHelper().
    excludeTests('testOnLinkClick_', 'testOnLinkEnter_').
    registerTests();
const infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();
const pageTestHelper =
    new firebaseui.auth.ui.page.PageTestHelper().registerTests();

let updateClicked;
let onClick;


function setUp() {
  // Set up clock.
  mockClock = new goog.testing.MockClock();
  mockClock.install();
  updateClicked = false;
  onClick = () => {
    updateClicked = true;
  };
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = new firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccess(
      'phone',
      onClick,
      '+*******1234',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  component.render(root);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
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
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  assertEquals(
      component.getSubmitElement(),
      goog.dom.getActiveElement(document));
}


function testRevertSecondFactorAdditionSuccess_resetPassword() {
  const link = component.getResetPasswordElement();
  assertNotNull(link);
  assertFalse(updateClicked);
  goog.testing.events.fireClickSequence(link);
  assertTrue(updateClicked);
}


function testRevertSecondFactorAdditionSuccess_pageEvents() {
  // Run page event tests.
  // Dispose previously created container since test must run before rendering
  // the component in document.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccess(
      'phone',
      onClick,
      '+*******1234',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testRevertSecondFactorAdditionSuccess_unknownFactorId() {
  // Run page event tests.
  // Dispose previously created container since test must run before rendering
  // the component in document.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.RevertSecondFactorAdditionSuccess(
      'unknown',
      onClick,
      undefined,
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  component.render(root);
  const link = component.getResetPasswordElement();
  assertNotNull(link);
  assertFalse(updateClicked);
  goog.testing.events.fireClickSequence(link);
  assertTrue(updateClicked);
}


function testRevertSecondFactorAdditionSuccess_getPageId() {
  assertEquals('revertSecondFactorAdditionSuccess', component.getPageId());
}
