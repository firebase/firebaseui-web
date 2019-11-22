/*
 * Copyright 2019 Google Inc. All Rights Reserved.
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
 * @fileoverview Defines the redirect status object. This is used to save the
 * state of a sign-in attempt before a redirect operation. It holds the
 * original tenant ID used to sign in with and also indicates there is a pending
 * redirect operation to be resolved.
 */

goog.provide('firebaseui.auth.RedirectStatus');


/**
 * The redirect status. It indicates there is a pending redirect operation to be
 * resolved.
 */
firebaseui.auth.RedirectStatus = class {
  /**
   * The redirect status. It indicates there is a pending redirect operation to
   * be resolved.
   * @param {?string=} tenantId The optional tenant ID.
   */
  constructor(tenantId) {
    /** @const @private {?string} The tenant ID. */
    this.tenantId_ = tenantId || null;
  }


  /** @return {?string} The tenant ID. */
  getTenantId() {
    return this.tenantId_;
  }


  /**
   * @return {!Object} The plain object representation of redirect status.
   */
  toPlainObject() {
    return {'tenantId': this.tenantId_};
  }


  /**
   * @param {?Object} response The plain object presentation of a potential
   *     redirect status object.
   * @return {?firebaseui.auth.RedirectStatus} The redirect status
   *     representation of the provided object.
   */
  static fromPlainObject(response) {
    if (response && typeof response['tenantId'] !== 'undefined') {
      return new firebaseui.auth.RedirectStatus(response['tenantId']);
    }
    return null;
  }
};
