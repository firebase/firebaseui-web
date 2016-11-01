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
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');


var root;
var component;


function setUp() {
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = new firebaseui.auth.ui.page.Callback();
  component.render(root);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(root);
}


function testCallback_getPageId() {
  assertEquals('callback', component.getPageId());
}


function testCallback_pageEvents() {
  // Run page event tests.
  var pageTestHelper = new firebaseui.auth.ui.page.PageTestHelper();
  // Dispose previously created container since test must run before rendering
  // the component in docoument.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.Callback();
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}
