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
 * @fileoverview Tests for MDL utilities.
 */

goog.provide('firebaseui.auth.ui.mdlTest');

goog.require('firebaseui.auth.ui.mdl');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.ui.mdlTest');

// Mocks
var mockControl;
var mockUpgradeElement;
var mockDowngradeElements;

// Page elements
var testContainer;


function setUp() {
  mockControl = new goog.testing.MockControl();

  window['componentHandler'] = {};
  mockUpgradeElement = window['componentHandler']['upgradeElement'] =
      mockControl.createFunctionMock('upgradeElement');
  mockDowngradeElements = window['componentHandler']['downgradeElements'] =
      mockControl.createFunctionMock('downgradeElements');

  testContainer = document.getElementById('mdl_test_container');
}


function tearDown() {
  mockControl.$verifyAll();
  mockControl.$resetAll();
}


function testMdlUpgrade() {
  // Order matters here, since MockControl doesn't have an easy way of ignoring
  // the order of calls. A possible workaround is to make many SaveArgument()s
  // and use assertSameElements.
  mockUpgradeElement(document.getElementById('mdl_test_textfield'));
  mockUpgradeElement(document.getElementById('mdl_test_progress'));
  mockUpgradeElement(document.getElementById('mdl_test_spinner'));
  mockUpgradeElement(document.getElementById('mdl_test_button'));

  mockControl.$replayAll();

  firebaseui.auth.ui.mdl.upgrade(testContainer);
}


function testMdlDowngrade() {
  mockDowngradeElements(document.getElementById('mdl_test_textfield'));
  mockDowngradeElements(document.getElementById('mdl_test_progress'));
  mockDowngradeElements(document.getElementById('mdl_test_spinner'));
  mockDowngradeElements(document.getElementById('mdl_test_button'));

  mockControl.$replayAll();

  firebaseui.auth.ui.mdl.downgrade(testContainer);
}


function testMdlUpgradeMdlInContainerItself() {
  var testContainer = document.getElementById('mdl_test_mdl_in_container');
  mockUpgradeElement(document.getElementById(
      'mdl_test_mdl_in_container_textfield'));
  mockUpgradeElement(testContainer);

  mockControl.$replayAll();

  firebaseui.auth.ui.mdl.upgrade(testContainer);
}
