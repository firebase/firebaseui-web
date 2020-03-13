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
 * @fileoverview Defines the goog.storage.mechanism.Mechanism implementation
 * for cookie storage.
 */

goog.provide('firebaseui.auth.CookieMechanism');

goog.require('goog.net.cookies');
goog.require('goog.storage.mechanism.Mechanism');


/**
 * Defines a goog.storage.mechanism.Mechanism implementation for storing
 * cookies.
 */
firebaseui.auth.CookieMechanism =
    class extends goog.storage.mechanism.Mechanism {
  /**
   * @param {?number=} opt_maxAge  The max age in seconds (from now). Use -1 to
   *     set a session cookie. If not provided, the default is -1
   *     (i.e. set a session cookie).
   * @param {?string=} opt_path  The path of the cookie. If not present then
   *     this uses the full request path.
   * @param {?string=} opt_domain  The domain of the cookie, or null to not
   *     specify a domain attribute (browser will use the full request host
   * name). If not provided, the default is null (i.e. let browser use full
   * request host name).
   * @param {boolean=} opt_secure Whether the cookie should only be sent over
   *     a secure channel.
   */
  constructor(opt_maxAge, opt_path, opt_domain, opt_secure) {
    super();
    /** @const @private {number} The cookie max age in seconds. */
    this.maxAge_ = typeof opt_maxAge !== 'undefined' && opt_maxAge !== null ?
        opt_maxAge :
        -1;
    /** @const @private {?string} The cookie path. */
    this.path_ = opt_path || null;
    /** @const @private {?string} The cookie domain policy. */
    this.domain_ = opt_domain || null;
    /** @const @private {boolean} The cookie secure policy. */
    this.secure_ = !!opt_secure;
  }

  /**
   * Set a value for a key.
   *
   * @param {string} key The key to set.
   * @param {string} value The string to save.
   * @override
   */
  set(key, value) {
    goog.net.cookies.set(
      key, value, this.maxAge_, this.path_, this.domain_, this.secure_);
  }

  /**
   * Get the value stored under a key.
   *
   * @param {string} key The key to get.
   * @return {?string} The corresponding value, null if not found.
   * @override
   */
  get(key) {
    return goog.net.cookies.get(key) || null;
  }

  /**
   * Remove a key and its value.
   *
   * @param {string} key The key to remove.
   * @override
   */
  remove(key) {
    goog.net.cookies.remove(key, this.path_, this.domain_);
  }
};
