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
 * @fileoverview Provides utilities for working with Material Design Lite.
 */

goog.provide('firebaseui.auth.ui.mdl');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');


/**
 * Initializes MDL for the given element and all MDL-styled children. The MDL
 * library attaches event listeners and modifies the DOM as appropriate here.
 * @param {?Element} element
 */
firebaseui.auth.ui.mdl.upgrade = function(element) {
  firebaseui.auth.ui.mdl.performOnMdlComponents_(element, 'upgradeElement');
};

/**
 * Removes MDL from the given element and all MDL-styled children. The MDL
 * library detaches event listeners and removes DOM modifications that it
 * previously did when upgrade()ing.
 * @param {?Element} element
 */
firebaseui.auth.ui.mdl.downgrade = function(element) {
  firebaseui.auth.ui.mdl.performOnMdlComponents_(element, 'downgradeElements');
};


/**
 * The list of CSS classes to upgrade to MDL components.
 * @private @const {!Array<string>}
 */
firebaseui.auth.ui.mdl.MDL_COMPONENT_CLASSES_ = [
  'mdl-js-textfield',
  'mdl-js-progress',
  'mdl-js-spinner',
  'mdl-js-button'
];


/**
 * Performs an operation on all MDL elements within a given element (e.g.
 * upgradeElement, downgradeElements), including the element itself.
 * @param {?Element} element
 * @param {string} operation
 * @private
 */
firebaseui.auth.ui.mdl.performOnMdlComponents_ = function(element, operation) {
  if (!element || !window['componentHandler'] ||
      !window['componentHandler'][operation]) {
    return;
  }
  goog.array.forEach(firebaseui.auth.ui.mdl.MDL_COMPONENT_CLASSES_,
      function(className) {
    if (goog.dom.classlist.contains(element, className)) {
      window['componentHandler'][operation](element);
    }

    var matchingElements = goog.dom.getElementsByClass(className, element);
    goog.array.forEach(matchingElements, function(mdlElement) {
      window['componentHandler'][operation](mdlElement);
    });
  });
};
