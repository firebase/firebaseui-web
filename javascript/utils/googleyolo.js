/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Defines the One-Tap sign-up API wrapper.
 */

goog.provide('firebaseui.auth.GoogleYolo');
goog.provide('firebaseui.auth.GoogleYolo.Loader');

goog.require('firebaseui.auth.util');
goog.require('goog.Promise');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.net.jsloader');
goog.require('goog.string.Const');


/**
 * The One-Tap sign-up API wrapper.
 * @param {?SmartLockApi=} opt_googleyolo The optional googleyolo reference. If
 *     no reference provided, the global googleyolo instance is used. If that is
 *     not available, all supported operations will be no-ops.
 * @constructor
 */
firebaseui.auth.GoogleYolo = function(opt_googleyolo) {
  /**
   * @private {?SmartLockApi|undefined} The One-Tap instance reference. If no
   *     reference is available, googleyolo will be lazy loaded dynamically.
   */
  this.googleyolo_ = opt_googleyolo ||
      goog.global[firebaseui.auth.GoogleYolo.NAMESPACE_];
  /** @private {?Promise} The last cancellation promise. */
  this.lastCancel_ = null;
  /** @private {boolean} Whether googleyolo UI has already been initialized. */
  this.initialized_ = false;
};
goog.addSingletonGetter(firebaseui.auth.GoogleYolo);


/**
 * The One-Tap sign-up namespace.
 * @const {string}
 * @private
 */
firebaseui.auth.GoogleYolo.NAMESPACE_ = 'googleyolo';


/**
 * The One-Tap sign-up on load callback name.
 * @const {string}
 * @private
 */
firebaseui.auth.GoogleYolo.CALLBACK_ = 'onGoogleYoloLoad';


/**
 * The default dependency loader timeout in ms.
 * @const {number}
 * @private
 */
firebaseui.auth.GoogleYolo.LOAD_TIMEOUT_MS_ = 10000;


/**
 * The One-Tap sign-up dependency source URL.
 * @const {!goog.string.Const}
 * @private
 */
firebaseui.auth.GoogleYolo.GOOGLE_YOLO_SRC_ = goog.string.Const.from(
    'https://smartlock.google.com/client');


/**
 * The different One-Tap sign-up error types of interest.
 *
 * @enum {string}
 */
firebaseui.auth.GoogleYolo.Error = {
  CONCURRENT_REQUEST: 'illegalConcurrentRequest',
  NO_CREDENTIALS_AVAILABLE: 'noCredentialsAvailable',
  USER_CANCELED: 'userCanceled'
};


/** Cancels any pending One-Tap operation if available. */
firebaseui.auth.GoogleYolo.prototype.cancel = function() {
  // Call underlying googleyolo API if supported and previously initialized.
  // There is also a current issue with One-Tap. It will always fail with
  // noCredentialsAvailable error if cancelLastOperation is called before
  // rendering.
  // If googleyolo is not yet loaded, there is no need to run cancel even after
  // loading since there is nothing to cancel.
  if (this.googleyolo_ && this.initialized_) {
    this.lastCancel_ = this.googleyolo_.cancelLastOperation()
        .catch(function(error) {
          // Suppress error.
        });
  }
};


/**
 * Shows the One-Tap UI if available and returns a promise that resolves with
 * the selected googleyolo credential or null if not available.
 * @param {?SmartLockRequestOptions} config The One-Tap configuration if
 *     available.
 * @param {boolean} autoSignInDisabled Whether auto sign-in is disabled.
 * @return {!Promise<?SmartLockCredential>} A promise that resolves when One-Tap
 *     sign in is dismissed or resolved. A googleyolo credential is returned in
 *     the process.
 */
firebaseui.auth.GoogleYolo.prototype.show =
    function(config, autoSignInDisabled) {
  var self = this;
  // Configuration available and googleyolo is available.
  if (this.googleyolo_ && config) {
    // One-Tap UI renderer.
    var render = function() {
      // UI initialized, it is OK to cancel last operation.
      self.initialized_ = true;
      // retrieve is only called if auto sign-in is enabled. Otherwise, it will
      // get skipped.
      var retrieveCredential = Promise.resolve(null);
      if (!autoSignInDisabled) {
        retrieveCredential =
            self.googleyolo_.retrieve(
                /** @type {!SmartLockRequestOptions} */ (config))
                .catch(function(error) {
                  // For user cancellation or concurrent request pass down.
                  // Otherwise suppress and run hint.
                  if (error.type ===
                      firebaseui.auth.GoogleYolo.Error.USER_CANCELED ||
                      error.type ===
                      firebaseui.auth.GoogleYolo.Error.CONCURRENT_REQUEST) {
                    throw error;
                  }
                  // Ignore all other errors to give hint a chance to run next.
                  return null;
                });
      }
      // Check if a credential is already available (previously signed in with).
      return retrieveCredential
          .then(function(credential) {
            if (!credential) {
              // Auto sign-in not complete.
              // Show account selector.
              return self.googleyolo_.hint(
                  /** @type {!SmartLockHintOptions} */ (config));
            }
            // Credential already available from the retrieve call. Pass it
            // through.
            return credential;
          })
          .catch(function(error) {
            // When user cancels the flow, reset the lastCancel promise and
            // resolve with false.
            if (error.type === firebaseui.auth.GoogleYolo.Error.USER_CANCELED) {
              self.lastCancel_ = Promise.resolve();
            } else if (error.type ===
                       firebaseui.auth.GoogleYolo.Error.CONCURRENT_REQUEST) {
              // Only one UI can be rendered at a time, cancel existing UI
              // and try again.
              self.cancel();
              return self.show(config, autoSignInDisabled);
            }
            // Return null as no credential is available.
            return null;
          });
    };
    // If there is a pending cancel operation, wait for it to complete.
    // Otherwise, an error will be thrown.
    if (this.lastCancel_) {
      // render always catches the error.
      return this.lastCancel_.then(render);
    } else {
      // No pending cancel operation. Render UI directly.
      return render();
    }
  } else if (config) {
    // Try to dynamically load googleyolo dependencies.
    // If multiple calls of show are triggered successively, they would all
    // share the same loader pending promise. They would then cancel each other
    // successively due to concurrent requests. Only the last call will succeed.
    var p = firebaseui.auth.GoogleYolo.Loader.getInstance().load()
        .then(function() {
          // Set googleyolo to prevent reloading again for future show calls.
          self.googleyolo_ = goog.global[firebaseui.auth.GoogleYolo.NAMESPACE_];
          // On success, retry to show.
          return self.show(config, autoSignInDisabled);
        })
        .thenCatch(function(error) {
          // On failure, resolve with null.
          return null;
        });
    // Cast from goog.Promise to native Promise.
    return Promise.resolve(p);
  }
  // no-op operation, resolve with null.
  if (typeof Promise !== 'undefined') {
    // typecast added to bypass weird compiler issue.
    return Promise.resolve(/** @type {?SmartLockCredential} */ (null));
  }
  // API not supported on older browsers.
  throw new Error('One-Tap sign in not supported in the current browser!');
};


/**
 * Googleyolo loader utility which will dynamically load one-tap sign-up
 * dependencies if not already loaded.
 * @constructor
 */
firebaseui.auth.GoogleYolo.Loader = function() {
  /**
   * @private {?goog.Promise<void>} A promise that resolves when the googleyolo
   *     library is loaded.
   */
  this.loader_ = null;
};
goog.addSingletonGetter(firebaseui.auth.GoogleYolo.Loader);


/**
 * @return {!goog.Promise<void>} A promise that resolves when googleyolo is
 *     loaded.
 */
firebaseui.auth.GoogleYolo.Loader.prototype.load = function() {
  var self = this;
  // Return any pending or resolved loader promise.
  if (this.loader_) {
    return this.loader_;
  }
  var url = goog.html.TrustedResourceUrl.fromConstant(
     firebaseui.auth.GoogleYolo.GOOGLE_YOLO_SRC_);
  if (!goog.global[firebaseui.auth.GoogleYolo.NAMESPACE_]) {
    // Wait for DOM to be ready.
    this.loader_ = firebaseui.auth.util.onDomReady()
        .then(function() {
          // In case it was still being loaded while DOM was not ready.
          // Resolve immediately.
          if (goog.global[firebaseui.auth.GoogleYolo.NAMESPACE_]) {
            return;
          }
          return new goog.Promise(function(resolve, reject) {
            // Timeout after a certain delay.
            var timer = setTimeout(function() {
              // On error, nullify loader to allow retrial.
              self.loader_ = null;
              reject(new Error('Network error!'));
            }, firebaseui.auth.GoogleYolo.LOAD_TIMEOUT_MS_);
            // On googleyolo load callback, clear timeout and resolve loader.
            goog.global[firebaseui.auth.GoogleYolo.CALLBACK_] = function() {
              clearTimeout(timer);
              resolve();
            };
            // Load googleyolo dependency.
            goog.Promise.resolve(goog.net.jsloader.safeLoad(url))
                .thenCatch(function(error) {
                  // On error, clear timer and nullify loader to allow retrial.
                  clearTimeout(timer);
                  self.loader_ = null;
                  reject(error);
                });
          });
        });
    return this.loader_;
  }
  // Already available, resolve immediately.
  return goog.Promise.resolve();
};

