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


goog.module('firebaseui.auth.testing.FakeAuthClient');
goog.module.declareLegacyNamespace();
goog.setTestOnly();

var MockHelper = goog.require('firebaseui.auth.testing.MockHelper');
var array = goog.require('goog.array');

/**
 * Fake Auth API client class.
 * @param {!firebaseui.auth.testing.FakeAppClient} app The app instance
 *     associated with the fake Auth client.
 * @constructor
 * @extends {MockHelper}
 */
var FakeAuthClient = function(app) {
  this.user_ = {};
  this['app'] = app;
  this['currentUser'] = null;
  var asyncMethods = {};
  // Populate auth async methods.
  for (var key in FakeAuthClient.AuthAsyncMethod) {
    asyncMethods[key] = {
      'context': this,
      'name': FakeAuthClient.AuthAsyncMethod[key]
    };
  }
  // Populate user async methods.
  for (var key in FakeAuthClient.UserAsyncMethod) {
    asyncMethods[key] = {
      'context': this.user_,
      'name': FakeAuthClient.UserAsyncMethod[key]
    };
  }
  FakeAuthClient.base(this, 'constructor', asyncMethods);
  this.authObservers_ = [];
  this.idTokenObservers_ = [];
};
goog.inherits(FakeAuthClient, MockHelper);


/**
 * Updates the user with selected properties.
 * @param {!Object} props The updated user properties, if null, user is
 *     nullified.
 */
FakeAuthClient.prototype.setUser = function(props) {
  if (props) {
    // User is logged in.
    for (var key in FakeAuthClient.UserProperty) {
      var prop = FakeAuthClient.UserProperty[key];
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
FakeAuthClient.prototype.runAuthChangeHandler =
    function() {
  for (var i = 0; i < this.authObservers_.length; i++) {
    this.authObservers_[i](this['currentUser']);
  }
};


/**
 * Adds an observer for auth state user changes.
 * @param {!Object|function(?Object)}
 *     nextOrObserver An observer object or a function triggered on change.
 * @param {function(!Object)=} opt_error Optional A function
 *     triggered on auth error.
 * @param {function()=} opt_completed Optional A function triggered when the
 *     observer is removed.
 * @return {!function()} The unsubscribe function for the observer.
 */
FakeAuthClient.prototype.onAuthStateChanged = function(
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
    array.removeAllIf(self.authObservers_, function(obs) {
      return obs == observer;
    });
  };
  return unsubscribe;
};


/**
 * Triggers all registered ID token change listeners.
 */
FakeAuthClient.prototype.runIdTokenChangeHandler =
    function() {
  for (var i = 0; i < this.idTokenObservers_.length; i++) {
    this.idTokenObservers_[i](this['currentUser']);
  }
};


/**
 * Adds an observer for ID token state changes.
 * @param {!Object|function(?Object)}
 *     nextOrObserver An observer object or a function triggered on change.
 * @param {function(!Object)=} opt_error Optional A function
 *     triggered on auth error.
 * @param {function()=} opt_completed Optional A function triggered when the
 *     observer is removed.
 * @return {!function()} The unsubscribe function for the observer.
 */
FakeAuthClient.prototype.onIdTokenChanged = function(
    nextOrObserver, opt_error, opt_completed) {
  // Simplified version of the observer for testing purpose only.
  var observer = (goog.isFunction(nextOrObserver) && nextOrObserver) ||
      nextOrObserver['next'];
  if (!observer) {
    throw 'onIdTokenChanged must be called with an Observer or up to three ' +
        'functions: next, error and completed.';
  }
  this.idTokenObservers_.push(observer);
  var self = this;
  // This will allow the subscriber to remove the observer.
  var unsubscribe = function() {
    // Removes the observer.
    array.removeAllIf(self.idTokenObservers_, function(obs) {
      return obs == observer;
    });
  };
  return unsubscribe;
};


/**
 * Firebase Auth async promise based method names.
 * @enum {string}
 */
FakeAuthClient.AuthAsyncMethod = {
  APPLY_ACTION_CODE: 'applyActionCode',
  CHECK_ACTION_CODE: 'checkActionCode',
  CONFIRM_PASSWORD_RESET: 'confirmPasswordReset',
  CREATE_USER_WITH_EMAIL_AND_PASSWORD: 'createUserWithEmailAndPassword',
  FETCH_PROVIDERS_FOR_EMAIL: 'fetchProvidersForEmail',
  GET_REDIRECT_RESULT: 'getRedirectResult',
  SEND_PASSWORD_RESET_EMAIL: 'sendPasswordResetEmail',
  SIGN_IN_AND_RETRIEVE_DATA_WITH_CREDENTIAL:
      'signInAndRetrieveDataWithCredential',
  SIGN_IN_WITH_CREDENTIAL: 'signInWithCredential',
  SIGN_IN_WITH_CUSTOM_TOKEN: 'signInWithCustomToken',
  SIGN_IN_WITH_EMAIL_AND_PASSWORD: 'signInWithEmailAndPassword',
  SIGN_IN_WITH_POPUP: 'signInWithPopup',
  SIGN_IN_WITH_PHONE_NUMBER: 'signInWithPhoneNumber',
  SIGN_IN_WITH_REDIRECT: 'signInWithRedirect',
  SIGN_OUT: 'signOut',
  VERIFY_PASSWORD_RESET_CODE: 'verifyPasswordResetCode'
};


/**
 * Firebase user async promise based method names.
 * @enum {string}
 */
FakeAuthClient.UserAsyncMethod = {
  GET_ID_TOKEN: 'getIdToken',
  LINK_AND_RETRIEVE_DATA_WITH_CREDENTIAL: 'linkAndRetrieveDataWithCredential',
  LINK_WITH_CREDENTIAL: 'linkWithCredential',
  LINK_WITH_PHONE_NUMBER: 'linkWithPhoneNumber',
  LINK_WITH_POPUP: 'linkWithPopup',
  LINK_WITH_REDIRECT: 'linkWithRedirect',
  REAUTHENTICATE_AND_RETRIEVE_DATA_WITH_CREDENTIAL:
      'reauthenticateAndRetrieveDataWithCredential',
  REAUTHENTICATE_WITH_CREDENTIAL: 'reauthenticateWithCredential',
  REAUTHENTICATE_WITH_PHONE_NUMBER: 'reauthenticateWithPhoneNumber',
  REAUTHENTICATE_WITH_POPUP: 'reauthenticateWithPopup',
  REAUTHENTICATE_WITH_REDIRECT: 'reauthenticateWithRedirect',
  RELOAD: 'reload',
  SEND_EMAIL_VERIFICATION: 'sendEmailVerification',
  UNLINK: 'unlink',
  UPDATE_EMAIL: 'updateEmail',
  UPDATE_PASSWORD: 'updatePassword',
  UPDATE_PHONE_NUMBER: 'updatePhoneNumber',
  UPDATE_PROFILE: 'updateProfile'
};


/**
 * Firebase user property names.
 * @enum {string}
 */
FakeAuthClient.UserProperty = {
  DISPLAY_NAME: 'displayName',
  EMAIL: 'email',
  EMAIL_VERIFIED: 'emailVerified',
  PHONE_NUMBER: 'phoneNumber',
  PHOTO_URL: 'photoURL',
  PROVIDER_DATA: 'providerData',
  PROVIDER_ID: 'providerId',
  REFRESH_TOKEN: 'refreshToken',
  UID: 'uid'
};


exports = FakeAuthClient;
