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
goog.provide('firebaseui.auth.ui.dialogTest');
goog.setTestOnly('firebaseui.auth.ui.dialogTest');

goog.require('firebaseui.auth.soy2.element');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.dialog');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.soy');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var dialog;
var dialog2;

var mockControl;
var mockUpgrade;
var mockDowngrade;
var component;
var container;


function setUp() {
  mockControl = new goog.testing.MockControl();
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
  mockUpgrade = mockControl.createMethodMock(firebaseui.auth.ui.mdl, 'upgrade');
  mockDowngrade = mockControl.createMethodMock(firebaseui.auth.ui.mdl,
      'downgrade');

  component = new goog.ui.Component();
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);
  // Position the container in some known location.
  container.style.position = "absolute";
  container.style.top = "50px";
  container.style.left = "100px";
  container.style.height = "200px";
  container.style.width = "150px";
  component.render(container);
}


function tearDown() {
  mockControl.$verifyAll();
  mockControl.$resetAll();

  // Remove dialogs from the DOM, if left over.
  if (dialog && document.body.contains(dialog)) {
    document.body.removeChild(dialog);
  }
  dialog = null;
  if (dialog2 && document.body.contains(dialog2)) {
    document.body.removeChild(dialog2);
  }
  dialog2 = null;
  goog.dom.removeNode(container);
}


if (goog.global['window'] &&
    typeof goog.global['window'].CustomEvent !== 'function') {
  var doc = goog.global.document;
  /**
   * CustomEvent polyfill for IE 9, 10 and 11.
   * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
   * @param {string} event The event type.
   * @param {Object=} opt_params The optional event parameters.
   * @return {!Event} The generated custom event.
   */
  var CustomEvent = function(event, opt_params) {
    var params = opt_params || {
      bubbles: false, cancelable: false, detail: undefined
    };
    var evt = doc.createEvent('CustomEvent');
    evt.initCustomEvent(
        event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };
  CustomEvent.prototype = goog.global['window'].Event.prototype;
  goog.global['window'].CustomEvent = CustomEvent;
}


function testShowDialog() {
  dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.dialog,
      {content: 'Hello, world!'});
  mockUpgrade(dialog);
  mockDowngrade(dialog);

  mockControl.$replayAll();

  firebaseui.auth.ui.element.dialog.showDialog.call(component, dialog);

  // The dialog should be attached to the DOM and be retrievable via
  // getDialogElement.
  assertTrue(document.body.contains(dialog));
  assertTrue(dialog.open);
  assertEquals(dialog, firebaseui.auth.ui.element.dialog.getDialogElement());

  // Confirm dialog centered relative to container.
  assertEquals(
      parseInt(
          50 - document.body.getBoundingClientRect().top +
          (200 - dialog.getBoundingClientRect().height) / 2, 10),
      parseInt(dialog.style.top, 10));
  var expectedDialogLeft = 100 - document.body.getBoundingClientRect().left +
      (150 - dialog.getBoundingClientRect().width) / 2;
  assertEquals(
      parseInt(expectedDialogLeft, 10),
      parseInt(dialog.style.left, 10));
  assertEquals(
      parseInt(
          document.body.getBoundingClientRect().width -
          expectedDialogLeft -
          dialog.getBoundingClientRect().width, 10),
      parseInt(dialog.style.right, 10));

  // Check alignment updated on resize.
  // Simulate container location and size updated.
  container.style.top = "5px";
  container.style.left = "10px";
  container.style.height = "20px";
  container.style.width = "15px";
  // Trigger resize event.
  goog.global['window'].dispatchEvent(new CustomEvent('resize'));
  // Dialog location should update.
  assertEquals(
      parseInt(
          5 - document.body.getBoundingClientRect().top +
          (20 - dialog.getBoundingClientRect().height) / 2, 10),
      parseInt(dialog.style.top, 10));
  expectedDialogLeft = 10 - document.body.getBoundingClientRect().left +
      (15 - dialog.getBoundingClientRect().width) / 2;
  assertEquals(
      parseInt(expectedDialogLeft, 10),
      parseInt(dialog.style.left, 10));
  assertEquals(
      parseInt(
          document.body.getBoundingClientRect().width -
          expectedDialogLeft -
          dialog.getBoundingClientRect().width, 10),
      parseInt(dialog.style.right, 10));

  // Dismiss dialog.
  firebaseui.auth.ui.element.dialog.dismissDialog.call(component);
  var expectedDismissedTop = parseInt(dialog.style.top, 10);
  // Simulate container location and size updated.
  container.style.top = "500px";
  // Trigger resize event.
  goog.global['window'].dispatchEvent(new CustomEvent('resize'));
  // Dialog location should not update as it already has been dismissed.
  assertEquals(
      expectedDismissedTop,
      parseInt(dialog.style.top, 10));
}


function testShowDialog_centerRelativeToDocumentBody() {
  dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.dialog,
      {content: 'Hello, world!'});
  mockUpgrade(dialog);

  mockControl.$replayAll();

  firebaseui.auth.ui.element.dialog.showDialog.call(
      component, dialog, false, true);

  // The dialog should be attached to the DOM and be retrievable via
  // getDialogElement.
  assertTrue(document.body.contains(dialog));
  assertTrue(dialog.open);
  assertEquals(dialog, firebaseui.auth.ui.element.dialog.getDialogElement());

  // Confirm dialog centered relative to body (top, left and right style not
  // modified).
  assertNaN(parseInt(dialog.style.top, 10));
  assertNaN(parseInt(dialog.style.left, 10));
  assertNaN(parseInt(dialog.style.right, 10));
}


function testShowDialog_dismissDialog() {
  dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.dialog,
      {content: 'Hello, world!'});
  mockUpgrade(dialog);
  mockDowngrade(dialog);

  mockControl.$replayAll();

  // Show the dialog.
  firebaseui.auth.ui.element.dialog.showDialog.call(component, dialog);
  assertTrue(document.body.contains(dialog));
  assertTrue(dialog.open);
  assertEquals(dialog, firebaseui.auth.ui.element.dialog.getDialogElement());

  // Dismiss the dialog.
  firebaseui.auth.ui.element.dialog.dismissDialog();
  assertFalse(document.body.contains(dialog));
  assertFalse(dialog.open);
  assertNull(firebaseui.auth.ui.element.dialog.getDialogElement());
}


function testShowDialog_showOtherDialog() {
  dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.dialog,
      {content: 'Hello, world!'});

  dialog2 = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.dialog,
      {content: 'Hello, other world!'});

  mockUpgrade(dialog);
  mockDowngrade(dialog);
  mockUpgrade(dialog2);

  mockControl.$replayAll();

  // Show first dialog.
  firebaseui.auth.ui.element.dialog.showDialog.call(component, dialog);

  // First dialog should be opened.
  assertTrue(document.body.contains(dialog));
  assertTrue(dialog.open);
  assertEquals(dialog, firebaseui.auth.ui.element.dialog.getDialogElement());

  // Show a second dialog.
  firebaseui.auth.ui.element.dialog.showDialog.call(component, dialog2);

  // First dialog should be automatically removed when the new dialog is opened.
  assertFalse(document.body.contains(dialog));
  assertFalse(dialog.open);

  // Second dialog should be opened.
  assertTrue(document.body.contains(dialog2));
  assertTrue(dialog2.open);
  assertEquals(dialog2, firebaseui.auth.ui.element.dialog.getDialogElement());
}


/**
 * Test that dismissDialog still works if the dialog has been closed by some
 * other means. For example, the ESC key closes the HTML5 dialog.
 */
function testShowDialog_dialogClosedByOtherMeans() {
  dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.dialog,
      {content: 'Hello, world!'});
  dialog.close = function() {};
  var mockClose = mockControl.createMethodMock(dialog, 'close');
  mockUpgrade(dialog);
  mockDowngrade(dialog);
  mockClose().$never();

  mockControl.$replayAll();

  // Show the dialog.
  firebaseui.auth.ui.element.dialog.showDialog.call(component, dialog);
  assertTrue(document.body.contains(dialog));
  assertEquals(dialog, firebaseui.auth.ui.element.dialog.getDialogElement());

  // Simulate the dialog being closed by hitting the escape key. This hides
  // the dialog but does not remove it from the DOM..
  dialog.open = false;

  // Dismiss the dialog. The dialog should be removed from the DOM at this
  // point.
  firebaseui.auth.ui.element.dialog.dismissDialog();
  assertFalse(document.body.contains(dialog));
  assertNull(firebaseui.auth.ui.element.dialog.getDialogElement());
}


function testCloseDialogOnBackdropClick() {
  dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.dialog,
      {content: 'Hello, world!'});
  mockUpgrade(dialog).$anyTimes();
  mockDowngrade(dialog).$anyTimes();
  mockControl.$replayAll();

  firebaseui.auth.ui.element.dialog.showDialog.call(component, dialog, true);

  var bounds = dialog.getBoundingClientRect();

  // Click inside the dialog. The dialog should remain displayed.
  // TODO: Make this work with browsers without HTML5 <dialog> support.
  if (bounds.width > 0 && bounds.height > 0) {
    goog.testing.events.fireClickSequence(dialog, null,
        new goog.math.Coordinate(bounds.left + 1, bounds.top + 1));
    assertTrue(document.body.contains(dialog));
    assertNotNull(firebaseui.auth.ui.element.dialog.getDialogElement());
  }

  // Click above and to the left of the dialog. The dialog should be dismissed.
  goog.testing.events.fireClickSequence(dialog, null,
      new goog.math.Coordinate(bounds.left - 1, bounds.top - 1));
  assertFalse(document.body.contains(dialog));
  assertNull(firebaseui.auth.ui.element.dialog.getDialogElement());


  firebaseui.auth.ui.element.dialog.showDialog.call(component, dialog, true);
  // Click to the right of the dialog. The dialog should be dismissed.
  goog.testing.events.fireClickSequence(dialog, null,
      new goog.math.Coordinate(bounds.left + bounds.width + 1, bounds.top + 1));
  assertFalse(document.body.contains(dialog));
  assertNull(firebaseui.auth.ui.element.dialog.getDialogElement());


  firebaseui.auth.ui.element.dialog.showDialog.call(component, dialog, true);
  // Click under the dialog. The dialog should be dismissed.
  goog.testing.events.fireClickSequence(dialog, null,
      new goog.math.Coordinate(
          bounds.left + 1, bounds.top + bounds.height + 1));
  assertFalse(document.body.contains(dialog));
  assertNull(firebaseui.auth.ui.element.dialog.getDialogElement());
}
