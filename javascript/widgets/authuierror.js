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
 * @fileoverview FirebaseUI error.
 */

goog.provide('firebaseui.auth.AuthUIError');

goog.require('firebaseui.auth.soy2.strings');


/**
 * Error that can be returned to the developer.
 * @param {!firebaseui.auth.AuthUIError.Error} code The short error code.
 * @param {?string=} opt_message The human-readable message.
 * @param {?firebase.auth.AuthCredential=} opt_credential The Auth credential
 *     that failed to link to the anonymous user.
 * @constructor
 * @extends {Error}
 */
firebaseui.auth.AuthUIError = function(code, opt_message, opt_credential) {
  this['code'] = firebaseui.auth.AuthUIError.ERROR_CODE_PREFIX + code;
  this['message'] = opt_message ||
      firebaseui.auth.AuthUIError.getDefaultErrorMessage_(this['code']) || '';
  this['credential'] = opt_credential || null;
};
goog.inherits(firebaseui.auth.AuthUIError, Error);


/**
 * @return {!Object} The plain object form of the error.
 */
firebaseui.auth.AuthUIError.prototype.toPlainObject = function() {
  return {
    'code': this['code'],
    'message': this['message'],
  };
};


/**
 * @return {!Object} The plain object form of the error. This is used by
 *     JSON.stringify() to return the stringified representation of the error.
 * @override
 */
firebaseui.auth.AuthUIError.prototype.toJSON = function() {
  return this.toPlainObject();
};


/**
 * The error prefix for firebaseui.auth.AuthUIError.
 * @protected {string}
 */
firebaseui.auth.AuthUIError.ERROR_CODE_PREFIX = 'firebaseui/';


/**
 * Developer facing FirebaseUI error codes.
 * @enum {string}
 */
firebaseui.auth.AuthUIError.Error = {
  MERGE_CONFLICT: 'anonymous-upgrade-merge-conflict'
};


/**
 * Maps the error code to the default error message.
 * @param {string} code The error code.
 * @return {string} The display error message.
 * @private
 */
firebaseui.auth.AuthUIError.getDefaultErrorMessage_ = function(code) {
  return firebaseui.auth.soy2.strings.errorAuthUI({code: code}).toString();
};
