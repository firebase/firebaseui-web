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
 * @fileoverview Defines crypto related utilities.
 */

goog.provide('firebaseui.auth.crypt');

goog.require('goog.crypt');
goog.require('goog.crypt.Aes');


/**
 * 256 bit AES encrypt data string using provided key. For data messages longer
 * than 32 bytes, ECB mode is used.
 * @param {string} key The AES encryption key. This is in plain string form.
 * @param {string} data in plain string format.
 * @return {string} Encrypted data in hex encoding.
 */
firebaseui.auth.crypt.aesEncrypt = function(key, data) {
  var aes = new goog.crypt.Aes(firebaseui.auth.crypt.getAesKeyArray_(key));
  var inputArr = goog.crypt.stringToByteArray(data);
  // Split into 16 byte chunks (block size per AES spec).
  var chunk = inputArr.splice(0, 16);
  var stream  = '';
  var paddingLength = 0;
  while (chunk.length) {
    // Pad with zeros.
    paddingLength = 16 - chunk.length;
    for (var i = 0; i < paddingLength; i++) {
      chunk.push(0);
    }
    stream += goog.crypt.byteArrayToHex(aes.encrypt(chunk));
    chunk = inputArr.splice(0, 16);
  }
  return stream;
};


/**
 * 256 bit AES decrypt data string using provided key.
 * @param {string} key The AES encryption key. This is in plain string form.
 * @param {string} data Encrypted data in hex encoding.
 * @return {string} Decrypted plain text string.
 */
firebaseui.auth.crypt.aesDecrypt = function(key, data) {
  var aes = new goog.crypt.Aes(firebaseui.auth.crypt.getAesKeyArray_(key));
  var inputArr = goog.crypt.hexToByteArray(data);

  // Split into 16 byte chunks (block size per AES spec).
  var chunk = inputArr.splice(0, 16);
  var stream  = '';
  while (chunk.length) {
    stream += goog.crypt.byteArrayToString(aes.decrypt(chunk));
    chunk = inputArr.splice(0, 16);
  }
  // Remove trailing padding.
  return stream.replace(/(\x00)+$/, '');
};


/**
 * Generates the AES byte array key representation of the plain string key
 * provided. This will also trim or pass the key as needed.
 * @param {string} key The AES encryption key. This is in plain string form.
 * @return {!Array<number>} The 32 byte array key.
 * @private
 */
firebaseui.auth.crypt.getAesKeyArray_ = function(key) {
  // Trim key to 32 characters.
  var keyArray = goog.crypt.stringToByteArray(key.substring(0, 32));
  // Pad to 32 characters if needed.
  var paddingLength = 32 - keyArray.length;
  for (var i = 0; i < paddingLength; i++) {
    // Pad with zeros.
    keyArray.push(0);
  }
  return keyArray;
};
