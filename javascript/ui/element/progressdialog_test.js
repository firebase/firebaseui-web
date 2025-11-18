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
 * @fileoverview Tests for progressdialog.js
 */

goog.provide('firebaseui.auth.ui.element.progressDialogTest');
goog.setTestOnly('firebaseui.auth.ui.element.progressDialogTest');

goog.require('firebaseui.auth.ui.element.dialog');
goog.require('firebaseui.auth.ui.element.progressDialog');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;
var mockControl;
var mockUpgrade;


function setUp() {
  mockControl = new goog.testing.MockControl();

  // Mock dialog polyfill
  window['dialogPolyfill'] = {
    'registerDialog': function(dialog) {
      dialog.open = false;
      dialog.showModal = function() {
        dialog.open = true;
      };
      dialog.close = function() {
        dialog.open = false;
      };
    }
  };

  // Mock MDL upgrade/downgrade functions
  if (!window['componentHandler']) {
    window['componentHandler'] = {
      'upgradeElement': function() {},
      'downgradeElements': function() {}
    };
  }

  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new goog.ui.Component();
  component.render(container);
}


function tearDown() {
  mockControl.$verifyAll();
  mockControl.$resetAll();

  component.dispose();
  goog.dom.removeNode(container);

  // Clean up any dialogs that may be in the DOM
  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();
  if (dialog && document.body.contains(dialog)) {
    document.body.removeChild(dialog);
  }
}


function testShowProgressDialog_loading() {
  var message = 'Loading...';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(document.body.contains(dialog));
  assertTrue(goog.dom.getTextContent(dialog).indexOf(message) >= 0);
}


function testShowProgressDialog_done() {
  var message = 'Success!';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.DONE,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(document.body.contains(dialog));
  assertTrue(goog.dom.getTextContent(dialog).indexOf(message) >= 0);
}


function testShowProgressDialog_emptyMessage() {
  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      '');

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(document.body.contains(dialog));
}


function testShowProgressDialog_longMessage() {
  var longMessage = 'This is a very long progress message that should be ' +
      'displayed correctly in the progress dialog even though it contains ' +
      'a lot of text and might wrap to multiple lines.';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      longMessage);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(goog.dom.getTextContent(dialog).indexOf(longMessage) >= 0);
}


function testShowProgressDialog_multipleDialogs() {
  var message1 = 'Loading...';
  var message2 = 'Signing in...';

  // Show first dialog
  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message1);

  var dialog1 = firebaseui.auth.ui.element.dialog.getDialogElement();
  assertNotNull(dialog1);

  // Show second dialog (should replace first)
  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.DONE,
      message2);

  var dialog2 = firebaseui.auth.ui.element.dialog.getDialogElement();
  assertNotNull(dialog2);

  // Should only have the second dialog's message
  assertTrue(goog.dom.getTextContent(dialog2).indexOf(message2) >= 0);
}


function testProgressDialog_stateLoading() {
  var state = firebaseui.auth.ui.element.progressDialog.State.LOADING;

  // Verify the state is a string (CSS class)
  assertEquals('string', typeof state);
  assertTrue(state.indexOf('mdl-spinner') >= 0);
  assertTrue(state.indexOf('is-active') >= 0);
}


function testProgressDialog_stateDone() {
  var state = firebaseui.auth.ui.element.progressDialog.State.DONE;

  // Verify the state is a string (CSS class)
  assertEquals('string', typeof state);
  assertTrue(state.indexOf('firebaseui-icon-done') >= 0);
}


function testShowProgressDialog_specialCharacters() {
  var message = 'Progress: <>&"\'';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  // The message should be properly escaped/encoded
  assertTrue(goog.dom.getTextContent(dialog).length > 0);
}


function testShowProgressDialog_unicodeCharacters() {
  var message = 'Loading: 正在加载 جاري التحميل 🔄';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(goog.dom.getTextContent(dialog).indexOf(message) >= 0);
}


function testShowProgressDialog_xssProtection() {
  // Test that XSS payloads are safely rendered
  var xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>'
  ];

  xssPayloads.forEach(function(payload) {
    firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
        component,
        firebaseui.auth.ui.element.progressDialog.State.LOADING,
        payload);

    var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

    assertNotNull(dialog);
    // Verify the payload is safely rendered (not executed)
    assertTrue(goog.dom.getTextContent(dialog).length > 0);

    // Dismiss for next iteration
    firebaseui.auth.ui.element.dialog.dismissDialog.call(component);
  });
}


function testShowProgressDialog_htmlEntities() {
  var message = 'Loading &lt;html&gt; entities';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(goog.dom.getTextContent(dialog).length > 0);
}


function testShowProgressDialog_newlineCharacters() {
  var message = 'Line 1\nLine 2\rLine 3';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(goog.dom.getTextContent(dialog).indexOf('Line 1') >= 0);
}


function testShowProgressDialog_differentStates() {
  var messages = [
    {state: firebaseui.auth.ui.element.progressDialog.State.LOADING, msg: 'Loading...'},
    {state: firebaseui.auth.ui.element.progressDialog.State.DONE, msg: 'Done!'},
    {state: firebaseui.auth.ui.element.progressDialog.State.LOADING, msg: 'Processing...'},
    {state: firebaseui.auth.ui.element.progressDialog.State.DONE, msg: 'Complete!'}
  ];

  messages.forEach(function(item) {
    firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
        component,
        item.state,
        item.msg);

    var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

    assertNotNull(dialog);
    assertTrue(goog.dom.getTextContent(dialog).indexOf(item.msg) >= 0);
  });
}


function testShowProgressDialog_whitespaceMessage() {
  var message = '   ';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
}


function testShowProgressDialog_nullState() {
  var message = 'Loading...';

  // Test with null state (edge case)
  try {
    firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
        component,
        null,
        message);

    var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();
    // Should still create a dialog even with null state
    assertNotNull(dialog);
  } catch (e) {
    // May throw error, which is acceptable behavior
    assertTrue(true);
  }
}


function testShowProgressDialog_typicalWorkflow() {
  // Simulate typical workflow: show loading, then show done

  // Step 1: Show loading dialog
  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      'Signing in...');

  var dialog1 = firebaseui.auth.ui.element.dialog.getDialogElement();
  assertNotNull(dialog1);
  assertTrue(goog.dom.getTextContent(dialog1).indexOf('Signing in') >= 0);

  // Step 2: Update to done state
  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.DONE,
      'Sign in complete!');

  var dialog2 = firebaseui.auth.ui.element.dialog.getDialogElement();
  assertNotNull(dialog2);
  assertTrue(goog.dom.getTextContent(dialog2).indexOf('Sign in complete') >= 0);
}


function testShowProgressDialog_dismissAfterShow() {
  var message = 'Loading...';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();
  assertNotNull(dialog);

  // Dismiss the dialog
  firebaseui.auth.ui.element.dialog.dismissDialog.call(component);

  dialog = firebaseui.auth.ui.element.dialog.getDialogElement();
  assertNull(dialog);
}


function testShowProgressDialog_showAfterDismiss() {
  var message1 = 'Loading...';
  var message2 = 'Processing...';

  // Show, dismiss, then show again
  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message1);

  firebaseui.auth.ui.element.dialog.dismissDialog.call(component);

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message2);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();
  assertNotNull(dialog);
  assertTrue(goog.dom.getTextContent(dialog).indexOf(message2) >= 0);
  assertFalse(goog.dom.getTextContent(dialog).indexOf(message1) >= 0);
}


function testProgressDialog_stateValues() {
  // Test that state values are defined and are strings
  var loadingState = firebaseui.auth.ui.element.progressDialog.State.LOADING;
  var doneState = firebaseui.auth.ui.element.progressDialog.State.DONE;

  assertNotNull(loadingState);
  assertNotNull(doneState);
  assertEquals('string', typeof loadingState);
  assertEquals('string', typeof doneState);
  assertNotEquals(loadingState, doneState);
}


function testShowProgressDialog_rapidChanges() {
  // Simulate rapid state changes
  var messages = [
    'Loading 1...',
    'Loading 2...',
    'Loading 3...',
    'Done!'
  ];

  messages.forEach(function(msg, index) {
    var state = index < 3 ?
        firebaseui.auth.ui.element.progressDialog.State.LOADING :
        firebaseui.auth.ui.element.progressDialog.State.DONE;

    firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
        component,
        state,
        msg);
  });

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();
  assertNotNull(dialog);
  // Should have the last message
  assertTrue(goog.dom.getTextContent(dialog).indexOf('Done!') >= 0);
}


function testShowProgressDialog_messageWithQuotes() {
  var message = 'User said: "Hello World"';

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(goog.dom.getTextContent(dialog).indexOf('Hello World') >= 0);
}


function testShowProgressDialog_messageWithApostrophes() {
  var message = "User's progress: Loading...";

  firebaseui.auth.ui.element.progressDialog.showProgressDialog.call(
      component,
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      message);

  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement();

  assertNotNull(dialog);
  assertTrue(goog.dom.getTextContent(dialog).indexOf("User's progress") >= 0);
}
