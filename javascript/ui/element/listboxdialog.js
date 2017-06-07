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
 * @fileoverview Manages list box dialogs, where the user can select an item
 * from a list.
 */

goog.provide('firebaseui.auth.ui.element.listBoxDialog');

goog.require('firebaseui.auth.soy2.element');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.dialog');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.dataset');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.Component');



goog.scope(function() {
var listBoxDialog = firebaseui.auth.ui.element.listBoxDialog;
var element = firebaseui.auth.ui.element;


/**
 * Displays a list box dialog.
 * @param {!Array<!listBoxDialog.Item>} items The items to show in the list box.
 * @param {function(string)} onSelect Callback to invoke when an item is
 *     selected. This is called with the ID of the list box item selected.
 * @param {string=} opt_selectedId The ID if the item to pre-select when the
 *     list box is opened.
 * @this {goog.ui.Component}
 */
listBoxDialog.showListBoxDialog = function(items, onSelect, opt_selectedId) {
  var dialogElement = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.listBoxDialog,
      {items: items},
      null,
      this.getDomHelper());
  element.dialog.showDialog.call(this, dialogElement, true, true);

  if (opt_selectedId) {
    // Select and scroll to the pre-selected button.
    var button = listBoxDialog.findButtonByListBoxId_(dialogElement,
        opt_selectedId);
    if (button) {
      button.focus();
      goog.style.scrollIntoContainerView(button, dialogElement);
    }
  }

  // Listen for clicks on the list box buttons.
  element.listenForActionEvent(this, dialogElement, function(event) {
    var pressedButton = goog.dom.getAncestorByClass(
        event.target, 'firebaseui-id-list-box-dialog-button');
    var listBoxId = pressedButton &&
        listBoxDialog.getListBoxIdOfButton_(pressedButton);
    if (listBoxId) {
      firebaseui.auth.ui.element.dialog.dismissDialog();

      // The callback should happen after the dialog is dismissed; otherwise
      // focus() within the callback does not work.
      onSelect(listBoxId);
    }
  });
};


/**
 * An item in the list box.
 * id: An identifier for the item, which will be passed to the callback.
 * label: The text to display to the user for the item.
 * iconClass: The CSS class for an icon to display next to the item. If omitted,
 *     no icon is shown.
 *
 * @typedef {{
 *   id: string,
 *   label: string,
 *   iconClass: string
 * }}
 */
listBoxDialog.Item;


/**
 * Returns the button element that corresponds to the given item ID, or null if
 * there is no such button.
 * @param {!Element} dialogElement The dialog element in which to search.
 * @param {string} id The item ID.
 * @return {?Element}
 * @private
 */
listBoxDialog.findButtonByListBoxId_ = function(dialogElement, id) {
  var buttons = goog.dom.getElementsByTagName(goog.dom.TagName.BUTTON,
      dialogElement);
  for (var i = 0; i < buttons.length; i++) {
    if (listBoxDialog.getListBoxIdOfButton_(buttons[i]) === id) {
      return buttons[i];
    }
  }
  return null;
};


/**
 * @param {!Element} button
 * @return {?string} The list box item ID of the button.
 * @private
 */
listBoxDialog.getListBoxIdOfButton_ = function(button) {
  return goog.dom.dataset.get(button, 'listboxid');
};
});
