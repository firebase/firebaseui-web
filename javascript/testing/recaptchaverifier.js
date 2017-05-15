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
 * @fileoverview Fake Firebase reCAPTCHA verifier for testing.
 */


goog.module('firebaseui.auth.testing.RecaptchaVerifier');
goog.module.declareLegacyNamespace();
goog.setTestOnly();

var MockHelper = goog.require('firebaseui.auth.testing.MockHelper');
var object = goog.require('goog.object');



/**
 * Creates the fake firebase reCAPTCHA app verifier for the Firebase app
 * provided.
 *
 * Usage for testing:
 *
 * var recaptchaVerifierInstance = null;
 * firebase.auth.RecaptchaVerifier = function(container, params, app) {
 *   recaptchaVerifierInstance = new firebaseui.auth.testing.RecaptchaVerifier(
 *       container, params, app);
 *   recaptchaVerifierInstance.install();
 *   return recaptchaVerifierInstance;
 * };
 *
 * @param {!Element|string} container The reCAPTCHA container parameter. This
 *     has different meaning depending on whether the reCAPTCHA is hidden or
 *     visible.
 * @param {?Object=} opt_parameters The optional reCAPTCHA parameters.
 * @param {?firebaseui.auth.testing.FakeAppClient=} opt_app The app instance
 *     associated with the fake Auth client.
 * @constructor
 * @extends {MockHelper}
 */
var RecaptchaVerifier = function(container, opt_parameters, opt_app) {
  this['type'] = 'recaptcha';
  /** @private {!Element|string} The reCAPTCHA container parameter. */
  this.container_ = container;
  /** @private {?Object|undefined} The optional reCAPTCHA parameters. */
  this.parameters_ = opt_parameters;
  /**
   * @private {?firebaseui.auth.testing.FakeAppClient|undefined} The app
   *     instance associated with the fake Auth client.
   */
  this.app_ = opt_app;
  /** @private {boolean} Whether the reCAPTCHA is cleared. */
  this.cleared_ = false;
  var asyncMethods = {};
  for (var key in RecaptchaVerifier.AsyncMethod) {
    asyncMethods[key] = {
      'context': this,
      'name': RecaptchaVerifier.AsyncMethod[key]
    };
  }
  RecaptchaVerifier.base(this, 'constructor', asyncMethods);
};
goog.inherits(RecaptchaVerifier, MockHelper);


/**
 * Asserts the reCAPTCHA verifier initialized with the expected parameters.
 * @param {!Element|string} container The expected reCAPTCHA container
 *     parameter. This has different meaning depending on whether the reCAPTCHA
 *     is hidden or visible.
 * @param {?Object=} opt_parameters The expected optional reCAPTCHA parameters.
 * @param {?firebaseui.auth.testing.FakeAppClient=} opt_app The expected app
 *     instance associated with the fake Auth client.
 */
RecaptchaVerifier.prototype.assertInitializedWithParameters =
    function(container, opt_parameters, opt_app) {
  assertEquals(container, this.container_);
  // Confirm everything except for the callbacks.
  // It is not useful to assert the callbacks as they are not provided
  // externally and are injected in the process of rendering a reCAPTCHA.
  var filteredParams = object.clone(this.parameters_);
  delete filteredParams['callback'];
  delete filteredParams['expired-callback'];
  assertObjectEquals(opt_parameters, filteredParams);
  assertEquals(opt_app, this.app_);
};


/**
 * @return {?Object|undefined} The optional reCAPTCHA parameters.
 */
RecaptchaVerifier.prototype.getParameters = function() {
  return this.parameters_;
};


/** Clears the reCAPTCHA from the DOM. */
RecaptchaVerifier.prototype.clear = function() {
  this.cleared_ = true;
};


/** Asserts reCAPTCHA is cleared. */
RecaptchaVerifier.prototype.assertClear = function() {
  if (!this.cleared_) {
    throw new Error('reCAPTCHA verifier not cleared!');
  }
};


/** Asserts reCAPTCHA is not cleared. */
RecaptchaVerifier.prototype.assertNotClear = function() {
  if (this.cleared_) {
    throw new Error('reCAPTCHA verifier cleared!');
  }
};


/**
 * Firebase reCAPTCHA verifier async promise based method names.
 * @enum {string}
 */
RecaptchaVerifier.AsyncMethod = {
  RENDER: 'render',
  VERIFY: 'verify'
};


exports = RecaptchaVerifier;
