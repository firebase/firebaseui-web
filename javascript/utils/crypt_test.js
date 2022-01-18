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
 * @fileoverview Tests for crypt.js.
 */

goog.provide('firebaseui.auth.cryptTest');

goog.require('firebaseui.auth.crypt');
goog.require('firebaseui.auth.util');
goog.require('goog.crypt');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.cryptTest');


// Using test vector from the spec and other sources:
// http://csrc.nist.gov/publications/fips/fips197/fips-197.pdf
// http://aes.online-domain-tools.com/
// All test vector data is in hex strings.
var testVectors = [
  {
    // Key will get padded to 32 bytes.
    'key': '000102030405060708090a0b0c0d0e0f',
    'input': '00112233445566778899aabbccddeeff',
    'output': 'c976274dba02fb5dc55878e448c39b8c'
  },
  {
    // Key will get padded to 32 bytes.
    'key': '000102030405060708090a0b0c0d0e0f1011121314151617',
    'input': '00112233445566778899aabbccddeeff',
    'output': 'd0a1da2d471858586041ec641febc61a'
  },
  {
    // No padding needed.
    'key': '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    'input': '00112233445566778899aabbccddeeff',
    'output': '8ea2b7ca516745bfeafc49904b496089'
  },
  {
    // No padding needed.
    'key': '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    'input': 'ffeeddccbbaa99887766554433221100',
    'output': '4c5e3c10dd6a2f21346bc31c590f6ff9'
  },
  {
    // Key will be trimmed to 32 bytes.
    'key': '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f' +
           '0001',
    'input': 'ffeeddccbbaa99887766554433221100',
    'output': '4c5e3c10dd6a2f21346bc31c590f6ff9'
  },
  {
    // ECB mode, should output testVectors[2].output + testVectors[3].output
    'key': '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    'input': '00112233445566778899aabbccddeeffffeeddccbbaa99887766554433221100',
    'output': '8ea2b7ca516745bfeafc49904b4960894c5e3c10dd6a2f21346bc31c590f6ff9'
  },
  {
    // Since input is less than 16 bytes, it will be padded.
    'key': '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    'input': 'ffeeddccbbaa99887766',
    'output': '955c91d532d2eb95968b3ac957c1d89c'
  },
  {
    // ECB mode with padding on second block, should output
    // testVectors[2].output + testVectors[6].output
    'key': '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    'input': '00112233445566778899aabbccddeeffffeeddccbbaa99887766',
    'output': '8ea2b7ca516745bfeafc49904b496089955c91d532d2eb95968b3ac957c1d89c'
  },
];


/**
 * Helper function to pad block for easier array byte array comparison.
 * This will pad the input to reach the closest multiple of a block.
 * @param {!Array<number>} input The input byte array.
 * @return {!Array<number>} The padded input.
 */
function addPadding(input) {
  var paddingLength = (16 - (input.length % 16)) % 16;
  for (var i = 0; i < paddingLength; i++) {
    input.push(0);
  }
  return input;
}


function testAesEncrypt() {
  var key;
  var data;
  // Test encryption on test vector inputs results in expected output.
  for (var i = 0; i < testVectors.length; i++) {
    key = goog.crypt.byteArrayToString(
        goog.crypt.hexToByteArray(testVectors[i]['key']));
    data = goog.crypt.byteArrayToString(
        goog.crypt.hexToByteArray(testVectors[i]['input']));
    assertEquals(
        testVectors[i]['output'],
        firebaseui.auth.crypt.aesEncrypt(key, data));
  }
}


function testAesDecrypt() {
  var key;
  // Test decryption on test vector outputs results in expected input.
  for (var i = 0; i < testVectors.length; i++) {
    key = goog.crypt.byteArrayToString(
        goog.crypt.hexToByteArray(testVectors[i]['key']));
    // Use byte array comparison with padding.
    assertArrayEquals(
        addPadding(goog.crypt.hexToByteArray(testVectors[i]['input'])),
        addPadding(goog.crypt.stringToByteArray(
            firebaseui.auth.crypt.aesDecrypt(key, testVectors[i]['output']))));
  }
}


function testAesEncryptAndDecrypt() {
  var testData = [
    '000000',
    // Empty string.
    '',
    // Short string.
    'short',
    // String with special characters.
    '~!@#$%^&*()_+}{[]:";\',./<>?|',
    // Some stringified object.
    '{"a": 123, "b": -0.4, "c": "hello"}',
    // Really long string.
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod' +
    'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim ve' +
    'niam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea c' +
    'ommodo consequat. Duis aute irure dolor in reprehenderit in voluptate v' +
    'elit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaec' +
    'at cupidatat non proident, sunt in culpa qui officia deserunt mollit an' +
    'im id est laborum.'
  ];
  var encryptedData;
  var keys = [
    // Key will get padded.
    firebaseui.auth.util.generateRandomAlphaNumericString(16),
    // Key will remain same.
    firebaseui.auth.util.generateRandomAlphaNumericString(32),
    // Key will get trimmed.
    firebaseui.auth.util.generateRandomAlphaNumericString(48)
  ];
  keys.forEach(function(key) {
    for (var i = 0; i < testData.length; i++) {
      encryptedData = firebaseui.auth.crypt.aesEncrypt(key, testData[i]);
      // Confirm decrypting the encrypted data will result with expected initial
      // data.
      assertEquals(
          testData[i], firebaseui.auth.crypt.aesDecrypt(key, encryptedData));
    }
  });
}
