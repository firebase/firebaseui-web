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
 * @fileoverview Binds handlers for form (submit button and link) UI element.
 */

goog.provide('firebaseui.auth.ui.element.form');

goog.require('firebaseui.auth.ui.element');
goog.require('goog.ui.Component');


goog.scope(function() {
var element = firebaseui.auth.ui.element;


/**
 * @return {Element} The submit button.
 * @this {goog.ui.Component}
 */
element.form.getSubmitElement = function() {
  return this.getElementByClass('firebaseui-id-submit');
};


/**
 * @return {Element} The secondary link.
 * @this {goog.ui.Component}
 */
element.form.getSecondaryLinkElement = function() {
  return this.getElementByClass('firebaseui-id-secondary-link');
};


/**
 * Initializes the form element.
 * @param {function(?)} onSubmit Callback to invoke when the form is submitted
 *     (the submit button is clicked).
 * @param {function(?)=} opt_onLinkClick Callback to invoke when the secondary
 *     link (if there is one) in the form is clicked.
 * @this {goog.ui.Component}
 */
element.form.initFormElement = function(onSubmit, opt_onLinkClick) {
  var submitElement = element.form.getSubmitElement.call(this);
  element.listenForActionEvent(this, submitElement, function(e) {
    onSubmit(e);
  });
  var linkElement = element.form.getSecondaryLinkElement.call(this);
  if (linkElement && opt_onLinkClick) {
    element.listenForActionEvent(this, linkElement, function(e) {
      opt_onLinkClick(e);
    });
  }
};
});
