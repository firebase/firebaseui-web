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
 * @fileoverview Mock helper used to faciliate creating Firebase component mocks
 * for testing.
 */

goog.module('firebaseui.auth.testing.MockHelper');
goog.module.declareLegacyNamespace();
goog.setTestOnly();

var Disposable = goog.require('goog.Disposable');
var GoogPromise = goog.require('goog.Promise');


/**
 * Creates a mock helper.
 * @param {!Object<string, !MockHelper.AsyncMethodInfo>} asyncMethods The async
 *     methods enums.
 * @constructor
 * @extends {Disposable}
 */
var MockHelper = function(asyncMethods) {
  MockHelper.base(this, 'constructor');
  /**
   * @private {!Object<string, !Array<!Object>>} The actual calls made with the
   *     async method enum keys as keys here too.
   */
  this.actualCalls_ = {};
  /**
   * @private {!Object<string, !MockHelper.AsyncMethodInfo>} The async methods
   *     enums.
   */
  this.asyncMethods_ = asyncMethods;
};
goog.inherits(MockHelper, Disposable);


/**
 * Information related to AsyncMethod. This includes the context on which it is
 * called and the public API name.
 * @typedef {{
 *   context: !Object,
 *   name: string
 * }}
 */
MockHelper.AsyncMethodInfo;


/**
 * Installs the fake client hooks.
 * @return {!MockHelper} The mock helper instance itself.
 */
MockHelper.prototype.install = function() {
  this.init_();
  return this;
};


/**
 * Removes the fake client hooks.
 * @return {!GoogPromise}
 */
MockHelper.prototype.uninstall = function() {
  var self = this;
  return this.process().then(function() {
    var unused = [];
    // Check for any unexpected API requests and fail if any detected.
    for (var methodName in self.actualCalls_) {
      if (self.actualCalls_[methodName].length) {
        unused.push(methodName);
      }
    }
    if (unused.length) {
      throw new Error('unexpected API request(s): ' + unused.join(', '));
    }
    // Reset actual and expected calls.
    self.actualCalls_ = {};
    self.expectedCalls_ = [];
  });
};


/** @override */
MockHelper.prototype.disposeInternal = function() {
  this.uninstall();
  MockHelper.base(this, 'disposeInternal');
};


/**
 * Initializes the API listeners and creates all the simulation methods and
 * their recorders. In addition, creates all the methods to assert and simulate
 * their responses.
 * @private
 */
MockHelper.prototype.init_ = function() {
  var self = this;
  /**
   * @private {!Array<!Object>} The array of expected calls made.
   */
  this.expectedCalls_ = [];
  var assertCb =
      function(methodName, context, self, data, opt_resp, opt_error) {
    self.expectedCalls_.push({
      'methodName': methodName,
      'data': data,
      'resp': opt_resp,
      'error': opt_error
    });
  };
  var cb = function(var_args) {
    var methodName = arguments[0];
    var context = arguments[1];
    var self = arguments[2];
    var data = [];
    for (var i = 3; i < arguments.length; i++) {
      data.push(arguments[i]);
    }
    var p = new GoogPromise(function(resolve, reject) {
      self.actualCalls_[methodName].push({
        'data': data,
        'resolve': resolve,
        'reject': reject,
        'context': context
      });
    }).thenCatch(function(e) {
      // If cancelled, remove from actual calls.
      if (e && e.name == 'cancel') {
        // Do not count this anymore.
        self.actualCalls_[methodName].shift();
      }
      throw e;
    });
    var index = self.actualCalls_[methodName].length - 1;
    self.actualCalls_[methodName][index]['promise'] = p;
    return p;
  };
  for (var key in this.asyncMethods_) {
    var methodName = this.asyncMethods_[key]['name'];
    var context = this.asyncMethods_[key]['context'];
    this.actualCalls_[methodName] = [];
    context[methodName] = goog.partial(cb, methodName, context, self);
    var assertMethodName =
        'assert' + MockHelper.capitalize_(methodName);
    context[assertMethodName] = goog.partial(
        assertCb, methodName, context, self);
  }
};


/**
 * Processes all pending asserts.
 * @return {!GoogPromise}
 */
MockHelper.prototype.process = function() {
  var self = this;
  return GoogPromise.resolve().then(function() {
    if (self.expectedCalls_.length) {
      var assertReq = self.expectedCalls_.shift();
      var methodName = assertReq['methodName'];
      var data = assertReq['data'];
      var resp = assertReq['resp'];
      var error = assertReq['error'];
      var req = self.actualCalls_[methodName].shift();
      if (!req) {
        // Fail quickly when expected API request is not called.
        throw new Error('missing API request: ' + methodName);
      }
      assertArrayEquals(data, req['data']);
      var continueProcess = function() {
        if (self.expectedCalls_.length) {
          return self.process();
        }
      };
      if (error) {
        if (goog.isFunction(error)) {
          req['reject'](error());
        } else {
          req['reject'](error);
        }
      } else {
        if (goog.isFunction(resp)) {
          req['resolve'](resp());
        } else {
          req['resolve'](resp);
        }
      }
      return req['promise'].then(continueProcess, continueProcess);
    }
  });
};


/**
 * @param {string} str String value whose first character is to be capitalized.
 * @return {string} String value with first letter in uppercase.
 * @private
 */
MockHelper.capitalize_ = function(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
};


exports = MockHelper;
