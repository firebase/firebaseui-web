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
goog.provide('firebaseui.auth.ui.listBoxDialogTest');
goog.setTestOnly('firebaseui.auth.ui.listBoxDialogTest');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.dialog');
goog.require('firebaseui.auth.ui.element.listBoxDialog');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers.SaveArgument');
goog.require('goog.ui.Component');


var component;
var mockControl;

// A list of items to display in the list box.
var items = [
  {
    id: '1',
    label: 'Foo'
  },
  {
    id: '2',
    label: 'Bar'
  }
];


function setUp() {
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
  component = new goog.ui.Component();
  mockControl = new goog.testing.MockControl();
}


function tearDown() {
  // Clean up the dialog, if still open.
  firebaseui.auth.ui.element.dialog.dismissDialog();

  mockControl.$verifyAll();
  mockControl.$resetAll();
}


/**
 * @return {!NodeList} The list of buttons in the currently displayed dialog.
 */
function getDialogButtons() {
  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement
      .call(component);
  return goog.dom.getElementsByTagName('button', dialog);
}


function testListBoxDialog() {
  return new goog.Promise(function(resolve, reject) {
    // Show the list box.
    firebaseui.auth.ui.element.listBoxDialog.showListBoxDialog.call(component,
        items,
        function(id) {
          // The listbox should report that the first button was clicked.
          assertEquals('1', id);

          // The dialog should be closed.
          assertFalse(document.body.contains(dialog));
          assertFalse(dialog.open);
          resolve();
        });

    var dialog = firebaseui.auth.ui.element.dialog.getDialogElement
        .call(component);

    // The dialog should be shown.
    assertTrue(document.body.contains(dialog));
    assertTrue(dialog.open);

    // There should be two buttons shown.
    var dialogButtons = getDialogButtons();
    assertEquals(2, dialogButtons.length);

    assertEquals('Foo', dialogButtons[0].textContent);
    assertEquals('Bar', dialogButtons[1].textContent);

    // Click the first button.
    goog.testing.events.fireClickSequence(dialogButtons[0]);
  });
}


function testListBoxDialogClickSecond() {
  return new goog.Promise(function(resolve, reject) {
    // Show the list box.
    firebaseui.auth.ui.element.listBoxDialog.showListBoxDialog.call(component,
        items,
        function(id) {
          // The listbox should report that the second button was clicked.
          assertEquals('2', id);
          resolve();
        });

    // Click the second button.
    var dialogButtons = getDialogButtons();
    goog.testing.events.fireClickSequence(dialogButtons[1]);
  });
}


function testListBoxDialogClickOnDescendantOfButton() {
  return new goog.Promise(function(resolve, reject) {
    firebaseui.auth.ui.element.listBoxDialog.showListBoxDialog.call(component,
        items,
        function(id) {
          // The listbox should report that the second button was clicked.
          assertEquals('2', id);
          resolve();
        });

    // Click on a descendant of the second button. This should still register
    // as a click on the second button.
    var dialogButtons = getDialogButtons();
    goog.testing.events.fireClickSequence(dialogButtons[1].firstChild);
  });
}


/**
 * Tests that if you click in an area of the list box that's not a button, it
 * does not trigger an "onSelect" event.
 */
function testListBoxDialogClickNotOnButton() {
  firebaseui.auth.ui.element.listBoxDialog.showListBoxDialog.call(component,
      items,
      function(id) {
        // The callback should not be called.
        fail();
      });

  // Click the dialog itself, and not any of its buttons.
  var dialog = firebaseui.auth.ui.element.dialog.getDialogElement
      .call(component);
  goog.testing.events.fireClickSequence(dialog);

  // The dialog should still be shown.
  assertTrue(document.body.contains(dialog));
}


/**
 * Tests that the pre-selected item is focused and the container is scrolled
 * such that the item is visible.
 * @return {!goog.Promise}
 */
function testListBoxDialogFocus() {
  return new goog.Promise(function(resolve, reject) {
    // Verify that the container is scrolled.
    var scrollIntoContainerView = mockControl.createMethodMock(goog.style,
        'scrollIntoContainerView');
    var scrollIntoContainerViewDialog = new goog.testing.mockmatchers
        .SaveArgument();
    var scrollIntoContainerViewButton = new goog.testing.mockmatchers
        .SaveArgument();
    scrollIntoContainerView(scrollIntoContainerViewButton,
        scrollIntoContainerViewDialog);
    mockControl.$replayAll();

    // Show the list box.
    firebaseui.auth.ui.element.listBoxDialog.showListBoxDialog.call(component,
        items,
        function(id) {
          // The listbox should report that the second button was clicked.
          assertEquals('2', id);
          resolve();
        },
        // Focus on the second element.
        '2');

    // There should be two buttons shown.
    var dialogButtons = getDialogButtons();
    assertEquals(2, dialogButtons.length);
    assertEquals('Foo', dialogButtons[0].textContent);
    assertEquals('Bar', dialogButtons[1].textContent);

    // The container should be scrolled to the second button.
    assertEquals(firebaseui.auth.ui.element.dialog.getDialogElement(),
        scrollIntoContainerViewDialog.arg);
    assertEquals(dialogButtons[1], scrollIntoContainerViewButton.arg);

    // TODO: Assert that the second button is focused, and press "enter" on the
    // keyboard instead of clicking.
    goog.testing.events.fireClickSequence(dialogButtons[1]);
  });
}
