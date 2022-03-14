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
 * @fileoverview Helper class for testing the visible reCAPTCHA UI element.
 */

goog.provide('firebaseui.auth.ui.element.RecaptchaTestHelper');
goog.setTestOnly('firebaseui.auth.ui.element.RecaptchaTestHelper');

goog.require('firebaseui.auth.ui.element');


goog.scope(function() {
var element = firebaseui.auth.ui.element;



/** @constructor */
element.RecaptchaTestHelper = function() {
  element.RecaptchaTestHelper.base(this, 'constructor', 'Recaptcha');
};
goog.inherits(element.RecaptchaTestHelper, element.ElementTestHelper);


/** @override */
element.RecaptchaTestHelper.prototype.resetState = function() {
  element.hide(this.component.getRecaptchaErrorElement());
};


/** @private */
element.RecaptchaTestHelper.prototype.testGetRecaptchaElement_ = function() {
  assertNotNull(this.component.getRecaptchaElement());
};


/** @private */
element.RecaptchaTestHelper.prototype.testGetRecaptchaErrorElement_ =
    function() {
  assertNotNull(this.component.getRecaptchaErrorElement());
};
});
