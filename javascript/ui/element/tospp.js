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
 * @fileoverview Binds handlers for Terms of Service and Privacy Policy UI
 *     element.
 */

goog.provide('firebaseui.auth.ui.element.tospp');

goog.require('firebaseui.auth.ui.element');
goog.require('goog.ui.Component');


goog.scope(function() {
var element = firebaseui.auth.ui.element;

/**
 * @return {?Element} The Terms of Service and Privacy Policy element.
 * @this {goog.ui.Component}
 */
element.tospp.getTosPpElement = function() {
  return this.getElementByClass('firebaseui-tos');
};


/**
 * @return {?Element} The Terms of Service hyperlink element.
 * @this {goog.ui.Component}
 */
element.tospp.getTosLinkElement = function() {
  return this.getElementByClass('firebaseui-tos-link');
};


/**
 * @return {?Element} The Privacy Policy hyperlink element.
 * @this {goog.ui.Component}
 */
element.tospp.getPpLinkElement = function() {
  return this.getElementByClass('firebaseui-pp-link');
};


/**
 * @return {?Element} The ToS Privacy Policy list element.
 * @this {goog.ui.Component}
 */
element.tospp.getTosPpListElement = function() {
  return this.getElementByClass('firebaseui-tos-list');
};

});
