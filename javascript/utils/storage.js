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
 * @fileoverview Utils for storing FirebaseUI data.
 */

goog.provide('firebaseui.auth.storage');

goog.require('firebaseui.auth.Account');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('goog.array');
goog.require('goog.storage.Storage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.storage.mechanism.HTML5SessionStorage');
goog.require('goog.storage.mechanism.mechanismfactory');


goog.scope(function() {
var mechanismfactory = goog.storage.mechanism.mechanismfactory;
var storage = firebaseui.auth.storage;


/**
 * The namespace for FirebaseUI storage.
 * @const {string}
 * @private
 */
storage.NAMESPACE_ = 'firebaseui';


/**
 * The separator for FirebaseUI storage with app ID key.
 * @const {string}
 * @private
 */
storage.SEPARATOR_ = ':';


/**
 * The underlying storage instance for persistent data.
 * @type {!goog.storage.Storage}
 * @private
 */
storage.persistentStorage_ = new goog.storage.Storage(
    /** @type {!goog.storage.mechanism.Mechanism} */
    (mechanismfactory.createHTML5LocalStorage(storage.NAMESPACE_)));


/**
 * The underlying storage instance for temporary data.
 * @type {!goog.storage.Storage}
 * @private
 */
storage.temporaryStorage_ = new goog.storage.Storage(
    /** @type {!goog.storage.mechanism.Mechanism} */
    (mechanismfactory.createHTML5SessionStorage(storage.NAMESPACE_)));


/**
 * @return {boolean} True if web storage is supported, false otherwise.
 */
storage.isAvailable = function() {
  return new goog.storage.mechanism.HTML5LocalStorage().isAvailable() &&
      new goog.storage.mechanism.HTML5SessionStorage().isAvailable();
};


/**
 * Valid keys for FirebaseUI data.
 * @enum {{name: string, persistent: boolean}}
 */
storage.Key = {
  // Temporary storage.
  PENDING_EMAIL_CREDENTIAL: {name: 'pendingEmailCredential', persistent: false},
  REDIRECT_URL: {name: 'redirectUrl', persistent: false},
  REMEMBER_ACCOUNT: {name: 'rememberAccount', persistent: false},

  // Persistent storage.
  REMEMBERED_ACCOUNTS: {name: 'rememberedAccounts', persistent: true}
};


/**
 * @param {boolean} persistent Whether to use the persistent storage.
 * @return {!goog.storage.Storage} The corresponding storage instance.
 * @private
 */
storage.getStorage_ = function(persistent) {
  return persistent ? storage.persistentStorage_ : storage.temporaryStorage_;
};


/**
 * Constructs the corresponding storage key name.
 *
 * @param {firebaseui.auth.storage.Key} key The key under which the value is
 *     stored.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {string} The corresponding key name.
 * @private
 */
storage.getKeyName_ = function(key, opt_id) {
  return opt_id ? key.name + storage.SEPARATOR_ + opt_id : key.name;
};


/**
 * Gets the stored value from the corresponding storage.
 *
 * @param {firebaseui.auth.storage.Key} key The key under which the value is
 *     stored.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {*} The stored value.
 * @private
 */
storage.get_ = function(key, opt_id) {
  return storage.getStorage_(key.persistent).get(
      storage.getKeyName_(key, opt_id));
};


/**
 * Removes the stored value from the corresponding storage.
 *
 * @param {firebaseui.auth.storage.Key} key The key under which the value is
 *     stored.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @private
 */
storage.remove_ = function(key, opt_id) {
  storage.getStorage_(key.persistent).remove(
      storage.getKeyName_(key, opt_id));
};


/**
 * Stores the value in the corresponding storage.
 *
 * @param {firebaseui.auth.storage.Key} key The key under which the value is
 *     stored.
 * @param {*} value The value to be stored.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @private
 */
storage.set_ = function(key, value, opt_id) {
  storage.getStorage_(key.persistent).set(
      storage.getKeyName_(key, opt_id), value);
};


/**
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {boolean} Whether there is a redirect URL for a successful sign-in.
 */
storage.hasRedirectUrl = function(opt_id) {
  return !!storage.getRedirectUrl(opt_id);
};


/**
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {?string} The sign-in redirect URL.
 */
storage.getRedirectUrl = function(opt_id) {
  return /** @type {?string} */ (
      storage.get_(storage.Key.REDIRECT_URL, opt_id) || null);
};


/**
 * Removes the sign-in redirect URL if it exists.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.removeRedirectUrl = function(opt_id) {
  storage.remove_(storage.Key.REDIRECT_URL, opt_id);
};


/**
 * Stores the sign-in redirect URL.
 *
 * @param {string} redirectUrl The sign-in redirect URL.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.setRedirectUrl = function(redirectUrl, opt_id) {
  storage.set_(storage.Key.REDIRECT_URL, redirectUrl, opt_id);
};


/**
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {boolean} Whether there is a remember account setting.
 */
storage.hasRememberAccount = function(opt_id) {
  return storage.get_(storage.Key.REMEMBER_ACCOUNT, opt_id) != null;
};


/**
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {boolean} Whether or not to remember the account. {@code false} is
 *     returned if there is no such setting.
 */
storage.isRememberAccount = function(opt_id) {
  return !!storage.get_(storage.Key.REMEMBER_ACCOUNT, opt_id);
};


/**
 * Stores the remember account setting.
 *
 * @param {boolean} remember Wheter or not to remember the account.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.setRememberAccount = function(remember, opt_id) {
  storage.set_(storage.Key.REMEMBER_ACCOUNT, remember, opt_id);
};


/**
 * Removes the remember account setting.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.removeRememberAccount = function(opt_id) {
  storage.remove_(storage.Key.REMEMBER_ACCOUNT, opt_id);
};


/**
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {Array<firebaseui.auth.Account>} The remembered accounts.
 */
storage.getRememberedAccounts = function(opt_id) {
  var rawAccounts = /** @type {Array<!Object>} */ (
      storage.get_(storage.Key.REMEMBERED_ACCOUNTS, opt_id) || []);
  var accounts = goog.array.map(rawAccounts, function(element) {
    return firebaseui.auth.Account.fromPlainObject(element);
  });
  return goog.array.filter(accounts, goog.isDefAndNotNull);
};


/**
 * Remembers an account.
 *
 * @param {!firebaseui.auth.Account} account The account to remember.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.rememberAccount = function(account, opt_id) {
  var accounts = storage.getRememberedAccounts(opt_id);
  // Find the account if it's already remembered.
  var index = goog.array.findIndex(accounts, function(element) {
    return element.getEmail() == account.getEmail() &&
      element.getProviderId() == account.getProviderId();
  });
  if (index > -1) {
    goog.array.removeAt(accounts, index);
  }
  // Put the last added account to the begining of the array so it appears as
  // the first one.
  accounts.unshift(account);
  storage.set_(
      storage.Key.REMEMBERED_ACCOUNTS,
      goog.array.map(accounts, function(element) {
        return element.toPlainObject();
      }),
      opt_id);
};


/**
 * Removes all remembered accounts.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.removeRememberedAccounts = function(opt_id) {
  storage.remove_(storage.Key.REMEMBERED_ACCOUNTS, opt_id);
};


/**
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {boolean} Whether there is a pending email credential for the
 *     account.
 */
storage.hasPendingEmailCredential = function(opt_id) {
  return !!storage.getPendingEmailCredential(opt_id);
};


/**
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {?firebaseui.auth.PendingEmailCredential} The stored pending email
 *     credential if it exists.
 */
storage.getPendingEmailCredential = function(opt_id) {
  var credentialObject = /** @type {?Object} */ (
      storage.get_(storage.Key.PENDING_EMAIL_CREDENTIAL, opt_id) || null);
  return firebaseui.auth.PendingEmailCredential.fromPlainObject(
      credentialObject);
};


/**
 * Removes the stored pending email credential if it exists.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.removePendingEmailCredential = function(opt_id) {
  storage.remove_(storage.Key.PENDING_EMAIL_CREDENTIAL, opt_id);
};


/**
 * Stores the pending email credential.
 *
 * @param {!firebaseui.auth.PendingEmailCredential} pendingEmailCredential The
 *     pending email credential to store.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.setPendingEmailCredential = function(pendingEmailCredential, opt_id) {
  storage.set_(
      storage.Key.PENDING_EMAIL_CREDENTIAL,
      pendingEmailCredential.toPlainObject(),
      opt_id);
};
});
