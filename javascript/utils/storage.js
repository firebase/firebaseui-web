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

goog.require('firebaseui.auth.CookieMechanism');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.RedirectStatus');
goog.require('firebaseui.auth.crypt');
goog.require('goog.storage.Storage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.storage.mechanism.HTML5SessionStorage');
goog.require('goog.storage.mechanism.mechanismfactory');
goog.requireType('goog.storage.mechanism.Mechanism');


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
 * The object key for storing an email for sign-in.
 * @const {string}
 * @private
 */
storage.EMAIL_FOR_SIGN_IN_KEY_ = 'email';


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
 * @enum {{name: string, storage: !goog.storage.Storage}}
 */
storage.Key = {
  // Temporary storage.
  PENDING_EMAIL_CREDENTIAL: {
    name: 'pendingEmailCredential',
    storage: storage.temporaryStorage_
  },
  REDIRECT_STATUS: {
    name: 'redirectStatus',
    storage: storage.temporaryStorage_
  },
  REDIRECT_URL: {
    name: 'redirectUrl',
    storage: storage.temporaryStorage_
  },
  // Cookie storage.
  EMAIL_FOR_SIGN_IN: {
    name: 'emailForSignIn',
    storage: new goog.storage.Storage(
        new firebaseui.auth.CookieMechanism(3600, '/'))
  },
  PENDING_ENCRYPTED_CREDENTIAL: {
    name: 'pendingEncryptedCredential',
    storage: new goog.storage.Storage(
        new firebaseui.auth.CookieMechanism(3600, '/'))
  }
};


/**
 * Constructs the corresponding storage key name.
 *
 * @param {!firebaseui.auth.storage.Key} key The key under which the value is
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
 * @param {!firebaseui.auth.storage.Key} key The key under which the value is
 *     stored.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {*} The stored value.
 * @private
 */
storage.get_ = function(key, opt_id) {
  return key.storage.get(
      storage.getKeyName_(key, opt_id));
};


/**
 * Removes the stored value from the corresponding storage.
 *
 * @param {!firebaseui.auth.storage.Key} key The key under which the value is
 *     stored.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @private
 */
storage.remove_ = function(key, opt_id) {
  key.storage.remove(
      storage.getKeyName_(key, opt_id));
};


/**
 * Stores the value in the corresponding storage.
 *
 * @param {!firebaseui.auth.storage.Key} key The key under which the value is
 *     stored.
 * @param {*} value The value to be stored.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @private
 */
storage.set_ = function(key, value, opt_id) {
  key.storage.set(
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


/**
 * Returns whether the redirect status is stored.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {boolean} Whether there is a pending redirect state for the
 *     provided app ID.
 */
storage.hasRedirectStatus = function(opt_id) {
  return !!storage.getRedirectStatus(opt_id);
};


/**
 * Returns the pending redirect status. Returns null if there is no unresolved
 * redirect opertions.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {?firebaseui.auth.RedirectStatus} The stored pending redirect status
 *     if it exists.
 */
storage.getRedirectStatus = function(opt_id) {
  var redirectStatusObject = /** @type {?Object} */ (
      storage.get_(storage.Key.REDIRECT_STATUS, opt_id) || null);
  return firebaseui.auth.RedirectStatus.fromPlainObject(redirectStatusObject);
};


/**
 * Removes the stored pending redirect status if it exists.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.removeRedirectStatus = function(opt_id) {
  storage.remove_(storage.Key.REDIRECT_STATUS, opt_id);
};


/**
 * Stores the pending redirect status.
 *
 * @param {!firebaseui.auth.RedirectStatus} redirectStatus The redirect status
 *     to store.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.setRedirectStatus = function(redirectStatus, opt_id) {
  storage.set_(
      storage.Key.REDIRECT_STATUS,
      redirectStatus.toPlainObject(),
      opt_id);
};


/**
 * Returns whether an email for sign-in is stored for the provided application
 * ID.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {boolean} Whether there is a pending email link sign-in for the
 *     provided app ID.
 */
storage.hasEmailForSignIn = function(opt_id) {
  return !!storage.get_(storage.Key.EMAIL_FOR_SIGN_IN, opt_id);
};


/**
 * Returns the email for the email link sign-in if it previously started in the
 * current device.
 *
 * @param {string} encryptionKey The encryption key to decrypt the stored email.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {?string} The stored decrypted email for the email link sign-in if
 *     available.
 */
storage.getEmailForSignIn = function(encryptionKey, opt_id) {
  var encryptedEmailObject =
      storage.get_(storage.Key.EMAIL_FOR_SIGN_IN, opt_id);
  var email = null;
  if (encryptedEmailObject) {
    try {
      var serilizedEmailObject = firebaseui.auth.crypt.aesDecrypt(
          encryptionKey,
          /** @type {string} */ (encryptedEmailObject));
      var emailObject = JSON.parse(serilizedEmailObject);
      email = /** @type {?string} */ (
          (emailObject && emailObject[storage.EMAIL_FOR_SIGN_IN_KEY_]) || null);
    } catch (e) {
      // Do nothing.
    }
  }
  return email;
};


/**
 * Removes the stored email for the email link sign-in if it exists.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.removeEmailForSignIn = function(opt_id) {
  storage.remove_(storage.Key.EMAIL_FOR_SIGN_IN, opt_id);
};


/**
 * Stores the email corresponding to the email link sign-in attempt.
 *
 * @param {string} encryptionKey The encryption key to encrypt the email.
 * @param {string} email The email to store.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.setEmailForSignIn = function(encryptionKey, email, opt_id) {
  var emailPlainObject = {};
  emailPlainObject[storage.EMAIL_FOR_SIGN_IN_KEY_] = email;
  storage.set_(
      storage.Key.EMAIL_FOR_SIGN_IN,
      firebaseui.auth.crypt.aesEncrypt(
          encryptionKey,
          JSON.stringify(emailPlainObject)),
      opt_id);
};


/**
 * Whether there is a stored encrypted credential for the provided application
 * ID.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {boolean} Whether there is a stored encrypted credential for the
 *     provided app ID.
 */
storage.hasEncryptedPendingCredential = function(opt_id) {
  return !!storage.get_(storage.Key.PENDING_ENCRYPTED_CREDENTIAL, opt_id);
};


/**
 * Returns the decrypted pending credential for a linking flow for the provided
 * app ID.
 *
 * @param {string} encryptionKey The encryption key to decrypt the stored
 *     credential.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 * @return {?firebaseui.auth.PendingEmailCredential} The stored pending email
 *     credential if it exists.
 */
storage.getEncryptedPendingCredential = function(encryptionKey, opt_id) {
  var encryptedCred = storage.get_(
      storage.Key.PENDING_ENCRYPTED_CREDENTIAL, opt_id);
  var cred = null;
  if (encryptedCred) {
    try {
      var credString = firebaseui.auth.crypt.aesDecrypt(
          encryptionKey,
          /** @type {string} */ (encryptedCred));
      cred = /** @type {?Object} */ (JSON.parse(credString));
    } catch (e) {
      // Do nothing.
    }
  }
  return firebaseui.auth.PendingEmailCredential.fromPlainObject(cred || null);
};


/**
 * Removes the stored encrypted pending email credential if it exists.
 *
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.removeEncryptedPendingCredential = function(opt_id) {
  storage.remove_(storage.Key.PENDING_ENCRYPTED_CREDENTIAL, opt_id);
};


/**
 * Stores the encrpted pending email credential for the specified application
 * ID.
 *
 * @param {string} encryptionKey The encryption key to encrypt the credential.
 * @param {!firebaseui.auth.PendingEmailCredential} pendingEmailCredential The
 *     pending email credential to store.
 * @param {string=} opt_id When operating in multiple app mode, this ID
 *     associates storage values with specific apps.
 */
storage.setEncryptedPendingCredential = function(
    encryptionKey, pendingEmailCredential, opt_id) {
  storage.set_(
      storage.Key.PENDING_ENCRYPTED_CREDENTIAL,
      firebaseui.auth.crypt.aesEncrypt(
          encryptionKey,
          JSON.stringify(pendingEmailCredential.toPlainObject())),
      opt_id);
};
});
