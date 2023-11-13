/*
 * Copyright 2021 Google Inc. All Rights Reserved.
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
 * @fileoverview Tests for the unauthorized user page.
 */

goog.module('firebaseui.auth.ui.page.UnauthorizedUserTest');
goog.setTestOnly('firebaseui.auth.ui.page.UnauthorizedUserTest');

const Component = goog.requireType('goog.ui.Component');
const FormTestHelper = goog.require('firebaseui.auth.ui.element.FormTestHelper');
const MockClock = goog.require('goog.testing.MockClock');
const PageTestHelper = goog.require('firebaseui.auth.ui.page.PageTestHelper');
const TagName = goog.require('goog.dom.TagName');
const TosPpTestHelper = goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
const dom = goog.require('goog.dom');
const events = goog.require('goog.testing.events');
const testSuite = goog.require('goog.testing.testSuite');
const UnauthorizedUser = goog.require('firebaseui.auth.ui.page.UnauthorizedUser');


let mockClock;
let root;
let component;
let helpLinkClicked;
let onHelpLinkClicked;
// Test helper for cancel button.
const formTestHelper =
    new FormTestHelper().excludeTests(
        'testOnSubmitClick_', 'testGetSubmitElement_', 'testOnSubmitEnter_')
        .registerTests();
const tosPpTestHelper = new TosPpTestHelper().registerTests();
const pageTestHelper = new PageTestHelper().registerTests();

/**
 * @return {!Component} The rendered basic unauthorized user component.
 */
function createComponent() {
  component = new UnauthorizedUser(
      'user@example.com',
      goog.bind(
          FormTestHelper.prototype.onLinkClick,
          formTestHelper));
  return component;
}


testSuite({
  setUp() {
    // Set up clock.
    mockClock = new MockClock();
    mockClock.install();

    helpLinkClicked = false;
    onHelpLinkClicked = function() {
      helpLinkClicked = true;
    };
    root = dom.createDom(TagName.DIV);
    document.body.appendChild(root);
    component = new UnauthorizedUser(
        'user@example.com',
        goog.bind(
            FormTestHelper.prototype.onLinkClick,
            formTestHelper),
        'admin@example.com',
        onHelpLinkClicked,
        goog.bind(
            TosPpTestHelper.prototype.onTosLinkClick,
            tosPpTestHelper),
        goog.bind(
            TosPpTestHelper.prototype.onPpLinkClick,
            tosPpTestHelper));
    component.render(root);
    formTestHelper.setComponent(component);
    // Reset previous state of helper.
    formTestHelper.resetState();
    tosPpTestHelper.setComponent(component);
    // Reset previous state of tosPp helper.
    tosPpTestHelper.resetState();
    pageTestHelper.setClock(mockClock).setComponent(component);
  },


  tearDown() {
    // Tear down clock.
    mockClock.tick(Infinity);
    mockClock.reset();
    component.dispose();
    dom.removeNode(root);
  },


  testElementsAvailability() {
    // Assert the secondary link is available.
    let cancelButton = component.getSecondaryLinkElement();
    assertNotNull(cancelButton);
    // Assert the help link is available.
    let helpLink = component.getHelpLink();
    assertNotNull(helpLink);
    component.dispose();
    // Create component with no help link.
    component = createComponent();
    formTestHelper.setComponent(component);
    formTestHelper.resetState();
    component.render(root);
    // Assert the secondary link is available.
    cancelButton = component.getSecondaryLinkElement();
    assertNotNull(cancelButton);
    // Assert the help link is not available.
    helpLink = component.getHelpLink();
    assertNull(helpLink);
  },


  testInitialFocus() {
    assertEquals(
        component.getSecondaryLinkElement(),
        dom.getActiveElement(document));
  },


  testHelpLinkButton_onClick() {
    const helpLink = component.getHelpLink();
    assertFalse(helpLinkClicked);
    events.fireClickSequence(helpLink);
    assertTrue(helpLinkClicked);
  },


  testUnauthorizedUser_pageEvents() {
    // Run page event tests.
    // Dispose previously created container since test must run before rendering
    // the component in document.
    component.dispose();
    // Initialize component with no help link.
    component = createComponent();
    // Run all page helper tests.
    pageTestHelper.runTests(component, root);
  },


  testGetPageId() {
    assertEquals('unauthorizedUser', component.getPageId());
  },
});
