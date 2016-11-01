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
 * @fileoverview Logger for FirebaseUI widget which logs to the window console.
 */

goog.provide('firebaseui.auth.log');

goog.require('goog.debug.Console');
goog.require('goog.log');


/**
 * The logger name.
 *
 * @const {string}
 * @private
 */
firebaseui.auth.log.NAME_ = 'firebaseui';


/**
 * The global logger instance.
 *
 * @private
 */
firebaseui.auth.log.logger_ = goog.log.getLogger(firebaseui.auth.log.NAME_);


/**
 * Log console, used to capture all FirebaseUI log events in window console.
 *
 * @private
 */
firebaseui.auth.log.logConsole_ = new goog.debug.Console();
firebaseui.auth.log.logConsole_.setCapturing(true);


/**
 * Logs the debug message and exception to the console.
 *
 * @param {string} message The debug message.
 * @param {Error=} opt_exception The debug exception.
 */
firebaseui.auth.log.debug = function(message, opt_exception) {
  goog.log.fine(firebaseui.auth.log.logger_, message, opt_exception);
};


/**
 * Logs the info message and exception to the console.
 *
 * @param {string} message The info message.
 * @param {Error=} opt_exception The info exception.
 */
firebaseui.auth.log.info = function(message, opt_exception) {
  goog.log.info(firebaseui.auth.log.logger_, message, opt_exception);
};


/**
 * Logs the warning message and exception to the console.
 *
 * @param {string} message The warning message.
 * @param {Error=} opt_exception The warning exception.
 */
firebaseui.auth.log.warning = function(message, opt_exception) {
  goog.log.warning(firebaseui.auth.log.logger_, message, opt_exception);
};


/**
 * Logs the error message and exception to the console.
 *
 * @param {string} message The error message.
 * @param {Error=} opt_exception The error exception.
 */
firebaseui.auth.log.error = function(message, opt_exception) {
  goog.log.error(firebaseui.auth.log.logger_, message, opt_exception);
};
