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
 * @fileoverview Defines account object.
 */

goog.provide('firebaseui.auth.Account');


firebaseui.auth.Account = class {
  /**
   * @param {string} email The email address.
   * @param {?string=} displayName The display name, defaulting to null.
   * @param {?string=} photoUrl The profile photo URL, defaulting to null.
   * @param {?string=} providerId The identity provider ID, defaulting to
   *     null.
   */
  constructor(email, displayName, photoUrl, providerId) {
    this.email_ = email;
    this.displayName_ = displayName || null;
    this.photoUrl_ = photoUrl || null;
    this.providerId_ = providerId || null;
  }


  /** @return {string} The email address. */
  getEmail() {
    return this.email_;
  }


  /** @return {?string} The displayName. */
  getDisplayName() {
    return this.displayName_ || null;
  }


  /** @return {?string} The profile photo URL. */
  getPhotoUrl() {
    return this.photoUrl_ || null;
  }


  /** @return {?string} The identity provider ID. */
  getProviderId() {
    return this.providerId_ || null;
  }


  /**
   * @return {{
   *   email: string,
   *   displayName: ?string,
   *   photoUrl: ?string,
   *   providerId: ?string
   * }} The plain object representation for the account.
   */
  toPlainObject() {
    return {
      'email': this.email_,
      'displayName': this.displayName_,
      'photoUrl': this.photoUrl_,
      'providerId': this.providerId_
    };
  }


  /**
   * Converts a plain account object to `firebaseui.auth.Account`.
   * @param {!Object} account The plain object representation of an account.
   * @return {?firebaseui.auth.Account} The account.
   */
  static fromPlainObject(account) {
    return new firebaseui.auth.Account(
        account['email'], account['displayName'], account['photoUrl'],
        account['providerId']);
  }
};
