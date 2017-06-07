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
 * @fileoverview Binds handlers for reCAPTCHA UI element.
 */

goog.provide('firebaseui.auth.ui.element.recaptcha');

goog.require('firebaseui.auth.ui.element');


goog.scope(function() {
var element = firebaseui.auth.ui.element;


/**
 * @return {Element} The error element for reCAPTCHA.
 * @this {goog.ui.Component}
 */
element.recaptcha.getRecaptchaErrorElement = function() {
  // Listener needs to be set on grecaptcha callback to hide this error when
  // triggered.
  return this.getElementByClass('firebaseui-id-recaptcha-error');
};



/**
 * @return {Element} The container element for reCAPTCHA.
 * @this {goog.ui.Component}
 */
element.recaptcha.getRecaptchaElement = function() {
  return this.getElementByClass('firebaseui-recaptcha-container');
};
});
