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
 * @fileoverview Fake Firebase Auth API client for testing.
 */

goog.provide('firebaseui.auth.testing.FakeAppClient');
goog.provide('firebaseui.auth.testing.FakeAuthClient');
goog.setTestOnly('firebaseui.auth.testing.FakeAuthClient');

goog.require('goog.Disposable');
goog.require('goog.Promise');
goog.require('goog.array');


/**
 * Fake App client class.
 * @param {!Object} options The app configuration.
 * @param {?string=} opt_name The optional app name.
 * @constructor
 * @extends {goog.Disposable}
 */
firebaseui.auth.testing.FakeAppClient = function(options, opt_name) {
  this['options'] = options || {};
  this['name'] = opt_name || '[DEFAULT]';
  // Initialize a fake auth client instance.
  this.auth_ = new firebaseui.auth.testing.FakeAuthClient(this);
};


/**
 * @return {!firebaseui.auth.testing.FakeAuthClient} The associated fake Auth
 *     client instance.
 */
firebaseui.auth.testing.FakeAppClient.prototype.auth = function() {
  return this.auth_;
};


/**
 * Fake Auth API client class.
 * @param {!firebaseui.auth.testing.FakeAppClient} app The app instance
 *     associated with the fake Auth client.
 * @constructor
 * @extends {goog.Disposable}
 */
firebaseui.auth.testing.FakeAuthClient = function(app) {
  this.user_ = {};
  this['app'] = app;
  this['currentUser'] = null;
  firebaseui.auth.testing.FakeAuthClient.base(this, 'constructor');
  this.actualCalls_ = {};
  this.authObservers_ = [];
};
goog.inherits(firebaseui.auth.testing.FakeAuthClient, goog.Disposable);


/**
 * Updates the user with selected properties.
 * @param {!Object} props The updated user properties, if null, user is
 *     nullified.
 */
firebaseui.auth.testing.FakeAuthClient.prototype.setUser = function(props) {
  if (props) {
    // User is logged in.
    for (var key in firebaseui.auth.testing.FakeAuthClient.UserProperty) {
      var prop = firebaseui.auth.testing.FakeAuthClient.UserProperty[key];
      this.user_[prop] = props[prop];
    }
    this['currentUser'] = this.user_;
  } else {
    // User is logged out.
    this['currentUser'] = null;
  }
};


/**
 * Triggers all registered auth state change listeners.
 */
firebaseui.auth.testing.FakeAuthClient.prototype.runAuthChangeHandler =
    function() {
  for (var i = 0; i < this.authObservers_.length; i++) {
    this.authObservers_[i](this['currentUser']);
  }
};


/**
 * Adds an observer for auth state changes.
 * @param {!Object|function(?Object)}
 *     nextOrObserver An observer object or a function triggered on change.
 * @param {function(!Object)=} opt_error Optional A function
 *     triggered on auth error.
 * @param {function()=} opt_completed Optional A function triggered when the
 *     observer is removed.
 * @return {!function()} The unsubscribe function for the observer.
 */
firebaseui.auth.testing.FakeAuthClient.prototype.onAuthStateChanged = function(
    nextOrObserver, opt_error, opt_completed) {
  // Simplified version of the observer for testing purpose only.
  var observer = (goog.isFunction(nextOrObserver) && nextOrObserver) ||
      nextOrObserver['next'];
  if (!observer) {
    throw 'onAuthStateChanged must be called with an Observer or up to three ' +
        'functions: next, error and completed.';
  }
  this.authObservers_.push(observer);
  var self = this;
  // This will allow the subscriber to remove the observer.
  var unsubscribe = function() {
    // Removes the observer.
    goog.array.removeAllIf(self.authObservers_, function(obs) {
      return obs == observer;
    });
  };
  return unsubscribe;
};


/**
 * Installs the fake Auth client.
 * @return {firebaseui.auth.testing.FakeAuthClient} The fake Auth client.
 */
firebaseui.auth.testing.FakeAuthClient.prototype.install = function() {
  this.init_();
  return this;
};


/**
 * Removes the fake API client hooks.
 * @return {!goog.Promise}
 */
firebaseui.auth.testing.FakeAuthClient.prototype.uninstall = function() {
  var self = this;
  return this.process().then(function() {
    var unused = [];
    for (var methodName in self.actualCalls_) {
      if (self.actualCalls_[methodName].length) {
        unused.push(methodName);
      }
    }
    if (unused.length) {
      throw new Error('unexpected API request(s): ' + unused.join(', '));
    }
    for (var methodName in self.actualCalls_) {
      var assertMethodName =
          'assert' + firebaseui.auth.testing.FakeAuthClient.capitalize_(
              methodName);
      if (self[methodName]) {
        delete self[methodName];
        delete self[assertMethodName];
      } else if (self.user_[methodName]) {
        delete self.user_[methodName];
        delete self.user_[assertMethodName];
      }
    }
    self.actualCalls_ = {};
    self.expectedCalls_ = [];
  });
};


/** @override */
firebaseui.auth.testing.FakeAuthClient.prototype.disposeInternal = function() {
  this.uninstall();
  firebaseui.auth.testing.FakeAuthClient.base(this, 'disposeInternal');
};


/**
 * Firebase Auth async promise based method names.
 * @enum {string}
 */
firebaseui.auth.testing.FakeAuthClient.AuthAsyncMethod = {
  APPLY_ACTION_CODE: 'applyActionCode',
  CHECK_ACTION_CODE: 'checkActionCode',
  CONFIRM_PASSWORD_RESET: 'confirmPasswordReset',
  CREATE_USER_WITH_EMAIL_AND_PASSWORD: 'createUserWithEmailAndPassword',
  FETCH_PROVIDERS_FOR_EMAIL: 'fetchProvidersForEmail',
  GET_REDIRECT_RESULT: 'getRedirectResult',
  SEND_PASSWORD_RESET_EMAIL: 'sendPasswordResetEmail',
  SIGN_IN_WITH_CREDENTIAL: 'signInWithCredential',
  SIGN_IN_WITH_CUSTOM_TOKEN: 'signInWithCustomToken',
  SIGN_IN_WITH_EMAIL_AND_PASSWORD: 'signInWithEmailAndPassword',
  SIGN_IN_WITH_POPUP: 'signInWithPopup',
  SIGN_IN_WITH_REDIRECT: 'signInWithRedirect',
  SIGN_OUT: 'signOut',
  VERIFY_PASSWORD_RESET_CODE: 'verifyPasswordResetCode'
};


/**
 * Firebase user async promise based method names.
 * @enum {string}
 */
firebaseui.auth.testing.FakeAuthClient.UserAsyncMethod = {
  GET_TOKEN: 'getToken',
  LINK: 'link',
  LINK_WITH_POPUP: 'linkWithPopup',
  LINK_WITH_REDIRECT: 'linkWithRedirect',
  REAUTHENTICATE: 'reauthenticate',
  RELOAD: 'reload',
  SEND_EMAIL_VERIFICATION: 'sendEmailVerification',
  UNLINK: 'unlink',
  UPDATE_EMAIL: 'updateEmail',
  UPDATE_PASSWORD: 'updatePassword',
  UPDATE_PROFILE: 'updateProfile'
};


/**
 * Firebase user property names.
 * @enum {string}
 */
firebaseui.auth.testing.FakeAuthClient.UserProperty = {
  DISPLAY_NAME: 'displayName',
  EMAIL: 'email',
  EMAIL_VERIFIED: 'emailVerified',
  PHOTO_URL: 'photoURL',
  PROVIDER_DATA: 'providerData',
  PROVIDER_ID: 'providerId',
  REFRESH_TOKEN: 'refreshToken',
  UID: 'uid'
};


/**
 * Initializes the API listeners and creates all the simulation methods and
 * their recorders. In addition, creates all the methods to assert and simulate
 * their responses.
 * @private
 */
firebaseui.auth.testing.FakeAuthClient.prototype.init_ = function() {
  var self = this;
  this.expectedCalls_ = [];
  var assertCb = function(methodName, self, data, opt_resp, opt_error) {
    self.expectedCalls_.push({
      'methodName': methodName,
      'data': data,
      'resp': opt_resp,
      'error': opt_error
    });
  };
  var cb = function(var_args) {
    var methodName = arguments[0];
    var self = arguments[1];
    var data = [];
    for (var i = 2; i < arguments.length; i++) {
      data.push(arguments[i]);
    }
    var p = new goog.Promise(function(resolve, reject) {
      self.actualCalls_[methodName].push({
        'data': data,
        'resolve': resolve,
        'reject': reject
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
  for (var key in firebaseui.auth.testing.FakeAuthClient.AuthAsyncMethod) {
    var methodName =
        firebaseui.auth.testing.FakeAuthClient.AuthAsyncMethod[key];
    this.actualCalls_[methodName] = [];
    this[methodName] = goog.partial(cb, methodName, self);
    var assertMethodName =
        'assert' + firebaseui.auth.testing.FakeAuthClient.capitalize_(
            methodName);
    this[assertMethodName] = goog.partial(assertCb, methodName, self);
  }
  for (var key in firebaseui.auth.testing.FakeAuthClient.UserAsyncMethod) {
    var methodName =
        firebaseui.auth.testing.FakeAuthClient.UserAsyncMethod[key];
    this.actualCalls_[methodName] = [];
    this.user_[methodName] = goog.partial(cb, methodName, self);
    var assertMethodName =
        'assert' + firebaseui.auth.testing.FakeAuthClient.capitalize_(
            methodName);
    this.user_[assertMethodName] =
        goog.partial(assertCb, methodName, self);
  }
};


/**
 * Processes all pending asserts.
 * @return {!goog.Promise}
 */
firebaseui.auth.testing.FakeAuthClient.prototype.process = function() {
  var self = this;
  return goog.Promise.resolve().then(function() {
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
      firebaseui.auth.testing.FakeAuthClient.compareArrays_(data, req['data']);
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
firebaseui.auth.testing.FakeAuthClient.capitalize_ = function(str) {
  return String(str.charAt(0)).toUpperCase() + String(str.substr(1));
};


/**
 * Asserts an array equals an expected one.
 * @param {!Array} expectedArr The expected array to compare to.
 * @param {!Array} arr The array to check.
 * @private
 */
firebaseui.auth.testing.FakeAuthClient.compareArrays_ =
    function(expectedArr, arr) {
  assertArrayEquals(expectedArr, arr);
};
