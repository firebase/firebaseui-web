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
 * @fileoverview Utilities for showing/hiding info bar.
 */

goog.provide('firebaseui.auth.ui.element.infoBar');

goog.require('firebaseui.auth.soy2.element');
goog.require('firebaseui.auth.ui.element');
goog.require('goog.dom');
goog.require('goog.soy');
goog.require('goog.ui.Component');


/**
 * @param {string} message The message to show on the info bar.
 * @this {goog.ui.Component}
 */
firebaseui.auth.ui.element.infoBar.showInfoBar = function(message) {
  // Dismiss previous info bar if it exists.
  firebaseui.auth.ui.element.infoBar.dismissInfoBar.call(this);
  var infoBar = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.infoBar,
      {'message': message},
      null,
      this.getDomHelper());
  this.getElement().appendChild(infoBar);
  // Handle dismiss link
  firebaseui.auth.ui.element.listenForActionEvent(
      this,
      firebaseui.auth.ui.element.infoBar.getInfoBarDismissLinkElement.call(
          this),
      function(e) {
        goog.dom.removeNode(infoBar);
      });
};


/**
 * Dismisses the info bar.
 * @this {goog.ui.Component}
 */
firebaseui.auth.ui.element.infoBar.dismissInfoBar = function() {
  goog.dom.removeNode(
      firebaseui.auth.ui.element.infoBar.getInfoBarElement.call(this));
};


/**
 * @return {Element} The info bar.
 * @this {goog.ui.Component}
 */
firebaseui.auth.ui.element.infoBar.getInfoBarElement = function() {
  return this.getElementByClass('firebaseui-id-info-bar');
};


/**
 * @return {Element} The info bar dismiss link.
 * @this {goog.ui.Component}
 */
firebaseui.auth.ui.element.infoBar.getInfoBarDismissLinkElement = function() {
  return this.getElementByClass('firebaseui-id-dismiss-info-bar');
};
