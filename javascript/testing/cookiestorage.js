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
 * @fileoverview Fake cookie storage for testing.
 */

goog.module('firebaseui.auth.testing.FakeCookieStorage');
goog.module.declareLegacyNamespace();
goog.setTestOnly();

const Disposable = goog.require('goog.Disposable');
const PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
const cookies = goog.require('goog.net.cookies');


/**
 * Fake cookie storage client class. This makes it safe to isolate cookies
 * between tests and doesn't require manual cleaning each time. It also makes it
 * easy to test cookie expiration with MockClock.
 */
class FakeCookieStorage extends Disposable {
  constructor() {
    super();
    /**
     * @private {!Object<string, {value: string, expiration: number}>} The mock
     *     cookie storage hash map.
     */
    this.mockCookieStorage_ = {};
    /**
     * @private {?PropertyReplacer}
     */
    this.replacer_ = null;
  }


  /**
   * Installs the fake cookie storage utility.
   * @return {!FakeCookieStorage} The fake cookie storage utility.
   */
  install() {
    // Note that this mock cookie storage does not take into account path,
    // domain and secure flag when manipulating cookies.
    var self = this;
    var r = this.replacer_ = new PropertyReplacer();
    r.replace(
        cookies, 'set', function(key, value, maxAge, path, domain, secure) {
          self.mockCookieStorage_[key] = {
            'value': value,
            'expiration': goog.now() + maxAge * 1000
          };
        });
    r.replace(cookies, 'get', function(key) {
      // Make sure entry exist and is not expired.
      if (self.mockCookieStorage_[key] &&
          self.mockCookieStorage_[key].expiration > goog.now()) {
        return self.mockCookieStorage_[key].value;
      } else {
        delete self.mockCookieStorage_[key];
        return null;
      }
    });
    r.replace(cookies, 'remove', function(key, path, domain) {
      delete self.mockCookieStorage_[key];
    });
    return this;
  }


  /** Removes the fake cookie storage utility hooks. */
  uninstall() {
    this.mockCookieStorage_ = {};
    if (this.replacer_) {
      this.replacer_.reset();
      this.replacer_ = null;
    }
  }


  /** @override */
  disposeInternal() {
    this.uninstall();
    super.disposeInternal();
  }
}


exports = FakeCookieStorage;
