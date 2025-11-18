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
 * @fileoverview Tests for log.js - logging functionality
 */

goog.provide('firebaseui.auth.logTest');
goog.setTestOnly('firebaseui.auth.logTest');

goog.require('firebaseui.auth.log');
goog.require('goog.log');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');


var stubs;
var loggedMessages;


function setUp() {
  stubs = new goog.testing.PropertyReplacer();
  loggedMessages = {
    debug: [],
    info: [],
    warning: [],
    error: []
  };

  // Mock the underlying goog.log functions
  stubs.replace(goog.log, 'fine', function(logger, message, exception) {
    loggedMessages.debug.push({message: message, exception: exception});
  });

  stubs.replace(goog.log, 'info', function(logger, message, exception) {
    loggedMessages.info.push({message: message, exception: exception});
  });

  stubs.replace(goog.log, 'warning', function(logger, message, exception) {
    loggedMessages.warning.push({message: message, exception: exception});
  });

  stubs.replace(goog.log, 'error', function(logger, message, exception) {
    loggedMessages.error.push({message: message, exception: exception});
  });
}


function tearDown() {
  stubs.reset();
  loggedMessages = null;
}


function testDebug_withoutException() {
  var message = 'Debug message';
  firebaseui.auth.log.debug(message);

  assertEquals(1, loggedMessages.debug.length);
  assertEquals(message, loggedMessages.debug[0].message);
  assertUndefined(loggedMessages.debug[0].exception);
}


function testDebug_withException() {
  var message = 'Debug message with exception';
  var exception = new Error('Test error');
  firebaseui.auth.log.debug(message, exception);

  assertEquals(1, loggedMessages.debug.length);
  assertEquals(message, loggedMessages.debug[0].message);
  assertEquals(exception, loggedMessages.debug[0].exception);
}


function testInfo_withoutException() {
  var message = 'Info message';
  firebaseui.auth.log.info(message);

  assertEquals(1, loggedMessages.info.length);
  assertEquals(message, loggedMessages.info[0].message);
  assertUndefined(loggedMessages.info[0].exception);
}


function testInfo_withException() {
  var message = 'Info message with exception';
  var exception = new Error('Test error');
  firebaseui.auth.log.info(message, exception);

  assertEquals(1, loggedMessages.info.length);
  assertEquals(message, loggedMessages.info[0].message);
  assertEquals(exception, loggedMessages.info[0].exception);
}


function testWarning_withoutException() {
  var message = 'Warning message';
  firebaseui.auth.log.warning(message);

  assertEquals(1, loggedMessages.warning.length);
  assertEquals(message, loggedMessages.warning[0].message);
  assertUndefined(loggedMessages.warning[0].exception);
}


function testWarning_withException() {
  var message = 'Warning message with exception';
  var exception = new Error('Test error');
  firebaseui.auth.log.warning(message, exception);

  assertEquals(1, loggedMessages.warning.length);
  assertEquals(message, loggedMessages.warning[0].message);
  assertEquals(exception, loggedMessages.warning[0].exception);
}


function testError_withoutException() {
  var message = 'Error message';
  firebaseui.auth.log.error(message);

  assertEquals(1, loggedMessages.error.length);
  assertEquals(message, loggedMessages.error[0].message);
  assertUndefined(loggedMessages.error[0].exception);
}


function testError_withException() {
  var message = 'Error message with exception';
  var exception = new Error('Test error');
  firebaseui.auth.log.error(message, exception);

  assertEquals(1, loggedMessages.error.length);
  assertEquals(message, loggedMessages.error[0].message);
  assertEquals(exception, loggedMessages.error[0].exception);
}


function testMultipleLogCalls() {
  firebaseui.auth.log.debug('Debug 1');
  firebaseui.auth.log.info('Info 1');
  firebaseui.auth.log.warning('Warning 1');
  firebaseui.auth.log.error('Error 1');
  firebaseui.auth.log.debug('Debug 2');

  assertEquals(2, loggedMessages.debug.length);
  assertEquals(1, loggedMessages.info.length);
  assertEquals(1, loggedMessages.warning.length);
  assertEquals(1, loggedMessages.error.length);
}


function testEmptyMessage() {
  firebaseui.auth.log.info('');
  assertEquals(1, loggedMessages.info.length);
  assertEquals('', loggedMessages.info[0].message);
}


function testLongMessage() {
  var longMessage = 'A'.repeat(1000);
  firebaseui.auth.log.error(longMessage);
  assertEquals(1, loggedMessages.error.length);
  assertEquals(longMessage, loggedMessages.error[0].message);
}


function testSpecialCharactersInMessage() {
  var specialMessage = '<script>alert("xss")</script>\n\t\r';
  firebaseui.auth.log.warning(specialMessage);
  assertEquals(1, loggedMessages.warning.length);
  assertEquals(specialMessage, loggedMessages.warning[0].message);
}
