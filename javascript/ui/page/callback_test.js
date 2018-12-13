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
 * @fileoverview Tests for the callback page.
 */

goog.provide('firebaseui.auth.ui.page.CallbackTest');
goog.setTestOnly('firebaseui.auth.ui.page.CallbackTest');

goog.require('firebaseui.auth.ui.page.Callback');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');


var mockClock;
var root;
var component;
var pageTestHelper = new firebaseui.auth.ui.page.PageTestHelper()
    // Callback already has a progress bar. No need to use
    // executePromiseRequest.
    .excludeTests('testExecutePromiseRequest_')
    .registerTests();


function setUp() {
  // Set up clock.
  mockClock = new goog.testing.MockClock();
  mockClock.install();
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = new firebaseui.auth.ui.page.Callback();
  component.render(root);
}


function tearDown() {
  // Tear down clock.
  mockClock.tick(Infinity);
  mockClock.reset();
  component.dispose();
  goog.dom.removeNode(root);
}


function testCallback_executePromiseRequest() {
  // Test executePromiseRequest will not show additional progress bar.
  var resolveBusyIndicator;
  var pending = new goog.Promise(function(resolve, reject) {
    resolveBusyIndicator= resolve;
  });
  // Verify that before executing the promise, a progress bar is displayed.
  assertEquals(
      1,
      goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);
  var p = component.executePromiseRequest(
      function() {
        return pending;
      },
      [],
      function() {},
      function(error) {});
  mockClock.tick(500);
  // Verify that while executing the promise, no additional progress bar is
  // displayed.
  assertEquals(
      1,
      goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);
  // Resolve pending task.
  resolveBusyIndicator();
  return p.then(function() {
    // Progress bar should still be displayed.
    assertEquals(
        1,
        goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);
  });
}


function testCallback_getPageId() {
  assertEquals('callback', component.getPageId());
}


function testCallback_pageEvents() {
  // Run page event tests.
  // Dispose previously created container since test must run before rendering
  // the component in document.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.Callback();
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}
