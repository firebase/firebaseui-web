/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview UI component for the different device error page.
 */

goog.provide('firebaseui.auth.ui.page.DifferentDeviceError');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');
goog.requireType('goog.dom.DomHelper');


/**
 * Different device error UI component.
 */
firebaseui.auth.ui.page.DifferentDeviceError =
    class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {function()} onDismissClick Callback to invoke when dismiss button
   *     is clicked.
   * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(onDismissClick, opt_domHelper) {
    super(
        firebaseui.auth.soy2.page.differentDeviceError, undefined,
        opt_domHelper, 'differentDeviceError');
    this.onDismissClick_ = onDismissClick;
  }

  /** @override */
  enterDocument() {
    var self = this;
    // Handle action event for dismiss button.
    firebaseui.auth.ui.element.listenForActionEvent(
        this, this.getSecondaryLinkElement(), function(e) {
          self.onDismissClick_();
        });
    // Set initial focus on the dismiss button.
    this.getSecondaryLinkElement().focus();
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onDismissClick_ = null;
    super.disposeInternal();
  }
};


goog.mixin(
    firebaseui.auth.ui.page.DifferentDeviceError.prototype,
    /**
     * @lends {firebaseui.auth.ui.page.DifferentDeviceError.prototype}
     */
    {
      // For form.
      getSecondaryLinkElement:
          firebaseui.auth.ui.element.form.getSecondaryLinkElement
    });
