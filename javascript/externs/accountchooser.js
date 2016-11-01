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
 * @fileoverview Externs for accountchooser.com APIs.
 * @externs
 */

/**
 * Namespace for accountchooser.com API.
 */
var accountchooser = {};

/**
 * @interface
 */
accountchooser.Api = function() {};

/**
 * @param {!Object} config
 * @return {!accountchooser.Api}
 */
accountchooser.Api.init = function(config) {};

/**
 * @param {!Array<!Object>} accounts
 * @param {?Object=} opt_config
 */
accountchooser.Api.prototype.store = function(accounts, opt_config) {};

/**
 * @param {!Array<!Object>} accounts
 * @param {?Object=} opt_config
 */
accountchooser.Api.prototype.select = function(accounts, opt_config) {};

/**
 * @param {!Object} account
 * @param {?Object=} opt_config
 */
accountchooser.Api.prototype.update = function(account, opt_config) {};

/**
 * @param {!function(boolean=, ?Object=)} callback
 */
accountchooser.Api.prototype.checkDisabled = function(callback) {};

/**
 * @param {!function(boolean=, ?Object=)} callback
 */
accountchooser.Api.prototype.checkEmpty = function(callback) {};

/**
 * @param {!Object} account
 * @param {!function(boolean=, ?Object=)} callback
 */
accountchooser.Api.prototype.checkAccountExist = function(account, callback) {};

/**
 * @param {!Object} account
 * @param {!function(boolean=, ?Object=)} callback
 */
accountchooser.Api.prototype.checkShouldUpdate = function(account, callback) {};
