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
 * @param {?string=} opt_tenantId The optional tenant ID.
 * @constructor
 */
firebaseui.auth.RedirectStatus = function(opt_tenantId) {
  /** @const @private {?string} The tenant ID. */
  this.tenantId_ = opt_tenantId || null;
};


/** @return {?string} The tenant ID. */
firebaseui.auth.RedirectStatus.prototype.getTenantId = function() {
  return this.tenantId_;
};


/**
 * @return {!Object} The plain object representation of redirect status.
 */
firebaseui.auth.RedirectStatus.prototype.toPlainObject = function() {
  return {
    'tenantId': this.tenantId_
  };
};


/**
 * @param {?Object} response The plain object presentation of a potential
 *     redirect status object.
 * @return {?firebaseui.auth.RedirectStatus} The redirect status representation
 *     of the provided object.
 */
firebaseui.auth.RedirectStatus.fromPlainObject = function(response) {
  if (response && typeof response['tenantId'] !== 'undefined') {
    return new firebaseui.auth.RedirectStatus(response['tenantId']);
  }
  return null;
};
