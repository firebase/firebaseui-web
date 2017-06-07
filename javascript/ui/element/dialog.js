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
 * @fileoverview Manages modal dialog boxes.
 */

goog.provide('firebaseui.auth.ui.element.dialog');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.mdl');
goog.require('goog.dom');



goog.scope(function() {
var element = firebaseui.auth.ui.element;


/**
 * Renders a dialog element.
 * @param {!Element} dialog The dialog element.
 * @param {boolean=} opt_dismissOnBackdropClick Whether to dismiss the dialog
 *     when the user clicks outside of the dialog (i.e. on the backdrop).
 * @param {?boolean=} opt_centerRelativeToDocument Whether to center relative
 *     to document. If not, centering is applied relative to container.
 * @this {goog.ui.Component}
 */
element.dialog.showDialog = function(
    dialog, opt_dismissOnBackdropClick, opt_centerRelativeToDocument) {
  // Dismiss the previous dialog if it exists.
  element.dialog.dismissDialog.call(this);

  // Attach the dialog directly to the body. We cannot attach it to the
  // component, because dialog-polyfill centers the dialog by setting CSS "top",
  // but the FirebaseUI container has position: relative set, which throws off
  // those calculations.
  document.body.appendChild(dialog);

  // Show the dialog, polyfilling the showModal() method if necessary.
  if (!dialog.showModal) {
    window['dialogPolyfill']['registerDialog'](dialog);
  }
  dialog.showModal();

  // Enable MDL for the dialog.
  firebaseui.auth.ui.mdl.upgrade(dialog);

  if (opt_dismissOnBackdropClick) {
    // Dismiss the dialog when the backdrop is clicked.
    element.listenForActionEvent(this, dialog, function(event) {
      if (element.dialog.isClickOnBackdrop_(event, dialog)) {
        element.dialog.dismissDialog.call(this);
      }
    });
  }
  // Check whether to center relative to document body. That is the default.
  if (!opt_centerRelativeToDocument) {
    // If not, center the dialog relative to the container if provided.
    var container = this.getElement().parentElement || /** @type {Element} */ (
        this.getElement().parentNode);
    if (container) {
      var self = this;
      /**
       * @private {function()} The realign dialog callback to adjust the
       *     location of the dialog relative to the container on screen size
       *     change.
       */
      this.realignDialog_ = function() {
        // If the dialog is closed, remove resize listener.
        if (!dialog.open) {
          window.removeEventListener('resize', self.realignDialog_);
          return;
        }
        var dialogHeight = dialog.getBoundingClientRect().height;
        var containerHeight = container.getBoundingClientRect().height;
        var containerTop = container.getBoundingClientRect().top -
            document.body.getBoundingClientRect().top;
        var containerLeft = container.getBoundingClientRect().left -
            document.body.getBoundingClientRect().left;
        var dialogWidth = dialog.getBoundingClientRect().width;
        var containerWidth = container.getBoundingClientRect().width;
        dialog.style.top = (containerTop +
            (containerHeight - dialogHeight) / 2).toString() + 'px';
        var dialogLeft = containerLeft + (containerWidth - dialogWidth) / 2;
        dialog.style.left = dialogLeft.toString() + 'px';
        dialog.style.right = (document.body.getBoundingClientRect().width -
            dialogLeft - dialogWidth).toString() + 'px';
      };
      this.realignDialog_();
      // On window resize, readjust the alignment of the dialog.
      window.addEventListener('resize', this.realignDialog_, false);
    }
  }
};


/**
 * @param {!Event} clickEvent
 * @param {!Element} dialog
 * @return {boolean} Whether the click event was on the backdrop (i.e. outside
 *     the bounds of the displayed dialog).
 * @private
 */
element.dialog.isClickOnBackdrop_ = function(clickEvent, dialog) {
  var dialogBounds = dialog.getBoundingClientRect();
  return (clickEvent.clientX < dialogBounds.left ||
      dialogBounds.left + dialogBounds.width < clickEvent.clientX ||
      clickEvent.clientY < dialogBounds.top ||
      dialogBounds.top + dialogBounds.height < clickEvent.clientY);
};


/**
 * Dismisses the dialog.
 * @this {goog.ui.Component}
 */
element.dialog.dismissDialog = function() {
  // Clear the dialog itself.
  var dialog = element.dialog.getDialogElement.call(this);
  if (dialog) {
    // Unregister MDL.
    firebaseui.auth.ui.mdl.downgrade(dialog);
    // If the dialog is still open, close it.
    if (dialog.open) {
      dialog.close();
    }
    goog.dom.removeNode(dialog);
    // Remove dialog realignment if available.
    if (this.realignDialog_) {
      window.removeEventListener('resize', this.realignDialog_);
    }
  }
};


/**
 * @return {Element} The dialog.
 * @this {goog.ui.Component}
 */
element.dialog.getDialogElement = function() {
  return goog.dom.getElementByClass('firebaseui-id-dialog');
};
});
