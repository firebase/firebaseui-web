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
 * @fileoverview Helper class for testing IdPs UI element.
 */

goog.provide('firebaseui.auth.ui.element.IdpsTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.IdpsTestHelper');

goog.require('firebaseui.auth.ui.element.ElementTestHelper');
goog.require('goog.array');
goog.require('goog.dom.dataset');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.IdpsTestHelper = function() {
  element.IdpsTestHelper.base(this, 'constructor', 'Idps');
};
goog.inherits(element.IdpsTestHelper, element.ElementTestHelper);


/**
 * Handler for IdP button click event.
 * @param {string} providerId The provider ID of the selected IdP.
 */
element.IdpsTestHelper.prototype.onClick = function(providerId) {
  this.selectedIdp_ = providerId;
};


/** @override */
element.IdpsTestHelper.prototype.resetState = function() {
  this.selectedIdp_ = null;
};


/**
 * Asserts the IdP button is clicked.
 * @param {Element} button The IdP button.
 * @private
 */
element.IdpsTestHelper.prototype.assertIdpButtonOnClick_ = function(button) {
  this.selectedIdp_ = null;
  var providerId = goog.dom.dataset.get(button, 'providerId');
  goog.testing.events.fireClickSequence(button);
  assertEquals(providerId, this.selectedIdp_);
};


/**
 * Asserts ENTER is pressed on the IdP button.
 * @param {Element} button The IdP button.
 * @private
 */
element.IdpsTestHelper.prototype.assertIdpButtonOnEnter_ = function(button) {
  this.selectedIdp_ = null;
  var providerId = goog.dom.dataset.get(button, 'providerId');
  goog.testing.events.fireKeySequence(button, goog.events.KeyCodes.ENTER);
  assertEquals(providerId, this.selectedIdp_);
};


/** @private */
element.IdpsTestHelper.prototype.testOnClick_ = function() {
  var self = this;
  goog.array.forEach(
      this.component.getElementsByClass('firebaseui-id-idp-button'),
      function(button) {
        self.assertIdpButtonOnClick_(button);
      });
};


/** @private */
element.IdpsTestHelper.prototype.testOnEnter_ = function() {
  var self = this;
  goog.array.forEach(
      this.component.getElementsByClass('firebaseui-id-idp-button'),
      function(button) {
        self.assertIdpButtonOnEnter_(button);
      });
};
}); // goog.scope
