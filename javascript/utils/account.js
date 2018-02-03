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



/**
 * @param {string} email The email address.
 * @param {?string=} opt_displayName The display name, defaulting to null.
 * @param {?string=} opt_photoUrl The profile photo URL, defaulting to null.
 * @param {?string=} opt_providerId The identity provider ID, defaulting to
 *     null.
 * @constructor
 */
firebaseui.auth.Account = function(
    email, opt_displayName, opt_photoUrl, opt_providerId) {
  this.email_ = email;
  this.displayName_ = opt_displayName || null;
  this.photoUrl_ = opt_photoUrl || null;
  this.providerId_ = opt_providerId || null;
};


/** @return {string} The email address. */
firebaseui.auth.Account.prototype.getEmail = function() {
  return this.email_;
};


/** @return {?string} The displayName. */
firebaseui.auth.Account.prototype.getDisplayName = function() {
  return this.displayName_ || null;
};


/** @return {?string} The profile photo URL. */
firebaseui.auth.Account.prototype.getPhotoUrl = function() {
  return this.photoUrl_ || null;
};


/** @return {?string} The identity provider ID. */
firebaseui.auth.Account.prototype.getProviderId = function() {
  return this.providerId_ || null;
};


/**
 * @return {{
 *   email: string,
 *   displayName: (null|string|undefined),
 *   photoUrl: (null|string|undefined),
 *   providerId: (null|string|undefined)
 * }} The plain object representation for the account.
 */
firebaseui.auth.Account.prototype.toPlainObject = function() {
  return {
    'email': this.email_,
    'displayName': this.displayName_,
    'photoUrl': this.photoUrl_,
    'providerId': this.providerId_
  };
};


/**
 * Converts a plain account object to `firebaseui.auth.Account`.
 * @param {!Object} account The plain object representation of an account.
 * @return {firebaseui.auth.Account} The account.
 */
firebaseui.auth.Account.fromPlainObject = function(account) {
  // TODO: Remove this filter once accountchooser.com supports non-email
  // accounts. We will also have to figure out how to choose a sign-in method,
  // since fetchProvidersForEmail won't work.
  if (account['email']) {
    return new firebaseui.auth.Account(
        account['email'],
        account['displayName'],
        account['photoUrl'],
        account['providerId']);
  }
  return null;
};
