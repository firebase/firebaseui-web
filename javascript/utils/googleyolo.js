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


/** @return {?SmartLockApi} The SmartLockApi handle if available. */
function getGoogleAccountsId() {
  return (goog.global[firebaseui.auth.GoogleYolo.NAMESPACE_] &&
      goog.global[firebaseui.auth.GoogleYolo.NAMESPACE_]['accounts'] &&
      goog.global[firebaseui.auth.GoogleYolo.NAMESPACE_]['accounts']['id']) ||
      null;
}

/**
 * The One-Tap sign-up API wrapper.
 */
firebaseui.auth.GoogleYolo = class {
  /**
   * @param {?SmartLockApi=} googleyolo The optional googleyolo reference.
   *     If no reference provided, the global googleyolo instance is used. If
   *     that is not available, all supported operations will be no-ops.
   */
  constructor(googleyolo) {
    /**
     * @private {?SmartLockApi|undefined} The One-Tap instance reference. If no
     *     reference is available, googleyolo will be lazy loaded dynamically.
     */
    this.googleyolo_ = googleyolo || getGoogleAccountsId();
    /**
     * @private {boolean} Whether googleyolo UI has already been initialized.
     */
    this.initialized_ = false;
    /**
     * @private {?function(?SmartLockCredential)} The callback to trigger when
     *     a credential is available or the flow is cancelled.
     */
    this.callback_ = null;
  }


  /** Cancels any pending One-Tap operation if available. */
  cancel() {
    // Call underlying googleyolo API if supported and previously initialized.
    // If googleyolo is not yet loaded, there is no need to run cancel even
    // after loading since there is nothing to cancel.
    if (this.googleyolo_ && this.initialized_) {
      if (this.callback_) {
        this.callback_(null);
      }
      this.googleyolo_.cancel();
    }
  }


  /**
   * Shows the One-Tap UI if available and returns a promise that resolves with
   * the selected googleyolo credential.
   * If no credential is available, the promise will never resolve.
   * If flow is cancelled, promise will resolve with null.
   * @param {?string} clientId The One-Tap client ID if available.
   * @param {boolean} autoSignInDisabled Whether auto sign-in is disabled.
   * @return {!goog.Promise<?SmartLockCredential>} A promise that resolves when
   *     One-Tap sign in is resolved or cancel is called. A googleyolo
   *     credential is returned in the process.
   */
  show(clientId, autoSignInDisabled) {
    var self = this;
    // Client ID available and googleyolo is available.
    if (this.googleyolo_ && clientId) {
      // One-Tap UI renderer.
      var render = function() {
        // UI initialized.
        self.initialized_ = true;
        return new goog.Promise((resolve, reject) => {
          self.callback_ = resolve;
          self.googleyolo_.initialize({
            'client_id': /** @type {string} */ (clientId),
            'callback': resolve,
            'auto_select': !autoSignInDisabled,
          });
          self.googleyolo_.prompt();
        });
      };
      return render();
    } else if (clientId) {
      // Try to dynamically load googleyolo dependencies.
      // If multiple calls of show are triggered successively, they would all
      // share the same loader pending promise. They would then cancel each
      // other successively due to concurrent requests. Only the last call will
      // succeed.
      var p = firebaseui.auth.GoogleYolo.Loader.getInstance()
          .load()
          .then(function() {
            // Set googleyolo to prevent reloading again for future show
            // calls.
            self.googleyolo_ = getGoogleAccountsId();
            // On success, retry to show.
            return self.show(clientId, autoSignInDisabled);
          })
          .thenCatch(function(error) {
            // On failure, resolve with null.
            return null;
          });
      // Cast from goog.Promise to native Promise.
      return goog.Promise.resolve(p);
    }
    // API not supported on older browsers.
    return goog.Promise.resolve(null);
  }
};

goog.addSingletonGetter(firebaseui.auth.GoogleYolo);



/**
 * The One-Tap sign-up namespace.
 * @const {string}
 * @private
 */
firebaseui.auth.GoogleYolo.NAMESPACE_ = 'google';


/**
 * The One-Tap sign-up on load callback name.
 * @const {string}
 * @private
 */
firebaseui.auth.GoogleYolo.CALLBACK_ = 'onGoogleLibraryLoad';


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
    'https://accounts.google.com/gsi/client');


/**
 * Googleyolo loader utility which will dynamically load one-tap sign-up
 * dependencies if not already loaded.
 */
firebaseui.auth.GoogleYolo.Loader = class {
  constructor() {
    /**
     * @private {?goog.Promise<void>} A promise that resolves when the
     *     googleyolo library is loaded.
     */
    this.loader_ = null;
  }


  /**
   * @return {!goog.Promise<void>} A promise that resolves when googleyolo is
   *     loaded.
   */
  load() {
    var self = this;
    // Return any pending or resolved loader promise.
    if (this.loader_) {
      return this.loader_;
    }
    var url = goog.html.TrustedResourceUrl.fromConstant(
        firebaseui.auth.GoogleYolo.GOOGLE_YOLO_SRC_);
    if (!getGoogleAccountsId()) {
      // Wait for DOM to be ready.
      this.loader_ = firebaseui.auth.util.onDomReady().then(function() {
        // In case it was still being loaded while DOM was not ready.
        // Resolve immediately.
        if (getGoogleAccountsId()) {
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
              .then(() => {
                // Callback does not always trigger. Trigger on load and
                // google.accounts.id reference is available.
                if (getGoogleAccountsId()) {
                  resolve();
                }
              })
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
  }
};

goog.addSingletonGetter(firebaseui.auth.GoogleYolo.Loader);
