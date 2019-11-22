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
 * @fileoverview Defines the pending email credential object. This is used to
 * save the state of a sign-in attempt after a redirect. It holds the original
 * email a user is trying to sign in to and an optional auth credential
 * associated with that account if it is available (federated account).
 */

goog.provide('firebaseui.auth.PendingEmailCredential');


/**
 * The pending email credential.
 */
firebaseui.auth.PendingEmailCredential = class {
  /**
   * @param {string} email The pending email.
   * @param {?firebase.auth.AuthCredential=} credential The pending auth
   *     credential.
   */
  constructor(email, credential) {
    /** @const @private {string} The pending email. */
    this.email_ = email;
    /**
     * @const @private {?firebase.auth.AuthCredential} The pending credential.
     */
    this.credential_ = credential || null;
  }


  /** @return {string} The pending email. */
  getEmail() {
    return this.email_;
  }


  /** @return {?firebase.auth.AuthCredential} The pending credential. */
  getCredential() {
    return this.credential_;
  }


  /**
   * @return {!Object} The plain object representation of a pending email
   *     credential.
   */
  toPlainObject() {
    return {
      'email': this.email_,
      'credential': this.credential_ && this.credential_['toJSON']()
    };
  }
};


/**
 * @param {?Object} response The plain object presentation of a potential
 *     pending email credential object.
 * @return {?firebaseui.auth.PendingEmailCredential} The pending email
 *     credential representation of the provided object.
 */
firebaseui.auth.PendingEmailCredential.fromPlainObject = function(response) {
  if (response && response['email']) {
    var credentialObject = response['credential'] &&
        firebase.auth.AuthCredential['fromJSON'](response['credential']);
    return new firebaseui.auth.PendingEmailCredential(
        /** @type {string} */ (response['email']), credentialObject);
  }
  return null;
};
