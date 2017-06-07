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
 * @fileoverview Binds handlers for IdP selection menu buttons UI element.
 */

goog.provide('firebaseui.auth.ui.element.idps');

goog.require('firebaseui.auth.ui.element');
goog.require('goog.asserts');
goog.require('goog.dom.dataset');


/**
 * Initializes IdP selection menu buttons.
 * @param {function(string)} onClick Callback to invoke when an IdP button is
 *     clicked.
 * @this {goog.ui.Component}
 */
firebaseui.auth.ui.element.idps.initIdpList = function(onClick) {
  var buttons = this.getElementsByClass('firebaseui-id-idp-button');
  var cb = function(providerId, e) {
    onClick(providerId);
  };
  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    var providerId = goog.asserts.assert(
        goog.dom.dataset.get(button, 'providerId'));
    firebaseui.auth.ui.element.listenForActionEvent(
        this, button, goog.partial(cb, providerId));
  }
};
