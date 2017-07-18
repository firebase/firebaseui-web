/*
 * Copyright 2017 Google Inc. All Rights Reserved.
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
 * @fileoverview Fake app client for testing.
 */

goog.module('firebaseui.auth.testing.FakeAppClient');
goog.module.declareLegacyNamespace();
goog.setTestOnly();

var Disposable = goog.require('goog.Disposable');
var FakeAuthClient = goog.require('firebaseui.auth.testing.FakeAuthClient');
var GoogPromise = goog.require('goog.Promise');



/**
 * Fake App client class.
 * @param {!Object} options The app configuration.
 * @param {?string=} opt_name The optional app name.
 * @constructor
 * @extends {Disposable}
 */
var FakeAppClient = function(options, opt_name) {
  this['options'] = options || {};
  this['name'] = opt_name || '[DEFAULT]';
  // Initialize a fake auth client instance.
  this.auth_ = new FakeAuthClient(this);
};


/**
 * @return {!FakeAuthClient} The associated fake Auth
 *     client instance.
 */
FakeAppClient.prototype.auth = function() {
  return this.auth_;
};


/**
 * Dummy app delete method.
 * @return {!GoogPromise} The promise that resolves upon deletion.
 */
FakeAppClient.prototype.delete = function() {
  return GoogPromise.resolve();
};

exports = FakeAppClient;
