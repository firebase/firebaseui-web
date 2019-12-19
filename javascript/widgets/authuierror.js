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

/** @fileoverview FirebaseUI error. */

goog.module('firebaseui.auth.AuthUIError');
goog.module.declareLegacyNamespace();

const strings = goog.require('firebaseui.auth.soy2.strings');

/** Error that can be returned to the developer. */
class AuthUIError extends Error {
  /**
   * @param {!AuthUIError.Error} code The short error code.
   * @param {?string=} opt_message The human-readable message.
   * @param {?firebase.auth.AuthCredential=} opt_credential The Auth credential
   *     that failed to link to the anonymous user.
   */
  constructor(code, opt_message, opt_credential) {
    super();
    /** @export */
    this.code = AuthUIError.ERROR_CODE_PREFIX + code;
    /** @export */
    this.message = opt_message ||
        AuthUIError.getDefaultErrorMessage_(this.code) || '';
    /** @export */
    this.credential = opt_credential || null;
  }

  /** @return {!Object} The plain object form of the error. */
  toPlainObject() {
    return {
      'code': this.code,
      'message': this.message,
    };
  }

  /**
   * @return {!Object} The plain object form of the error. This is used by
   *     JSON.stringify() to return the stringified representation of the error.
   * @override
   */
  toJSON() {
    return this.toPlainObject();
  }

  /**
   * Maps the error code to the default error message.
   * @param {string} code The error code.
   * @return {string} The display error message.
   * @private
   */
  static getDefaultErrorMessage_(code) {
    return strings.errorAuthUI({code: code}).toString();
  }
}

/**
 * The error prefix for AuthUIError.
 * @protected {string}
 */
AuthUIError.ERROR_CODE_PREFIX = 'firebaseui/';

/**
 * Developer facing FirebaseUI error codes.
 * @enum {string}
 */
AuthUIError.Error = {
  MERGE_CONFLICT: 'anonymous-upgrade-merge-conflict',
};

exports = AuthUIError;
