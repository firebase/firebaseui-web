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
 * @fileoverview FirebaseUI app builder.
 * This helps support multiple instances of FirebaseUI configuration.
 */

goog.provide('firebaseui.auth.AuthUI');

goog.require('firebaseui.auth.EventDispatcher');
goog.require('firebaseui.auth.GoogleYolo');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.dispatcher');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleCallback');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailChangeRevocation');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailMismatch');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailVerification');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleFederatedSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handlePasswordLinking');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handlePasswordRecovery');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handlePasswordReset');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handlePasswordSignUp');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInFinish');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInStart');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.startSignIn');
goog.require('goog.Promise');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.EventType');




/**
 * @param {!firebase.auth.Auth} auth The Firebase Auth instance.
 * @param {string=} opt_appId The optional app id.
 * @constructor
 */
firebaseui.auth.AuthUI = function(auth, opt_appId) {
  /** @private {boolean} Whether the current instance is deleted. */
  this.deleted_ = false;
  // Check if an instance with the same key exists. If so, throw an error,
  // otherwise, save that instance.
  // Get the instance get.
  var key = firebaseui.auth.AuthUI.getInstanceKey_(opt_appId);
  if (firebaseui.auth.AuthUI.instances_[key]) {
    // An instance exists for this key. Throw an error.
    throw new Error(
        'An AuthUI instance already exists for the key "' + key + '"');
  } else {
    // New instance, save reference to it.
    firebaseui.auth.AuthUI.instances_[key] = this;
  }
  /** @private {!firebase.auth.Auth} The Firebase Auth instance. */
  this.auth_ = auth;
  /** @private {?string} The original Auth language code. */
  this.originalAuthLanguageCode_ = null;
  // Log FirebaseUI on external Auth instance.
  firebaseui.auth.AuthUI.logFirebaseUI_(this.auth_);
  var tempApp = firebase.initializeApp({
    'apiKey': auth['app']['options']['apiKey'],
    'authDomain': auth['app']['options']['authDomain']
  }, auth['app']['name'] + firebaseui.auth.AuthUI.TEMP_APP_NAME_SUFFIX_);
  /**
   * @private {!firebase.auth.Auth} The temporary internal Firebase Auth
   *     instance.
   */
  this.tempAuth_ = tempApp.auth();
  // Log FirebaseUI on internal Auth instance.
  firebaseui.auth.AuthUI.logFirebaseUI_(this.tempAuth_);
  // Change persistence to session to avoid the risk of dangling auth states in
  // local storage. Check if the current version used, supports it.
  if (this.tempAuth_.setPersistence) {
    this.tempAuth_.setPersistence(firebase.auth.Auth.Persistence.SESSION);
  }
  /** @private {string|undefined} The optional app id. */
  this.appId_ = opt_appId;
  /** @private {!firebaseui.auth.widget.Config} The AuthUI configuration. */
  this.config_ = new firebaseui.auth.widget.Config();
  /**
   * @private {?firebaseui.auth.EventDispatcher} The event dispatcher for
   *     triggering custom events on DOM objects.
   */
  this.widgetEventDispatcher_ = null;
  /**
   * @private {?goog.Promise<!firebase.auth.UserCredential>} The result from
   *     any pending sign in with redirect operation.
   */
  this.getRedirectResult_ = null;
  /**
   * @private {?Element} The current widget element container. Only one widget
   *     instance can be created per page.
   */
  this.widgetElement_ = null;
  /**
   * @private {?firebaseui.auth.ui.page.Base} The currently rendered component.
   */
  this.currentComponent_ = null;
  /**
   * @private {!Array<!goog.Promise|!firebase.Promise|!function()>} The array of
   *     pending promises or reset functions.
   */
  this.pending_ = [];
  /** @private {boolean} Whether One-Tap auto sign-in is disabled or not. */
  this.autoSignInDisabled_ = false;
  // Currently we do not dynamically load One-Tap JS binary. The developer has
  // to include it.
  /** @private {!firebaseui.auth.GoogleYolo} The One-Tap UI wrapper. */
  this.googleYolo_ = firebaseui.auth.GoogleYolo.getInstance();
};


/**
 * Log FirebaseUI framework on the specified Auth instance.
 * @param {!firebase.auth.Auth} auth The Auth instance to log FirebaseUI on.
 * @private
 */
firebaseui.auth.AuthUI.logFirebaseUI_ = function(auth) {
  // INTERNAL.logFramework not supported in older versions.
  if (auth && auth['INTERNAL'] && auth['INTERNAL']['logFramework']) {
    auth['INTERNAL']['logFramework'](firebaseui.auth.AuthUI.FRAMEWORK_ID_);
  }
};


/** Resets all internal globals. Used for testing only. */
firebaseui.auth.AuthUI.resetAllInternals = function() {
  firebaseui.auth.AuthUI.instances_ = {};
  firebaseui.auth.AuthUI.widgetElement_ = null;
};


/**
 * @private {!Object.<!string, !firebaseui.auth.AuthUI>} Map containing the
 *     firebaseui.auth.AuthUI instances keyed by their app IDs.
 */
firebaseui.auth.AuthUI.instances_ = {};


/**
 * Returns the instance key corresponding the appId provided.
 * @param {?string=} opt_appId The optional app ID whose instance is to be
 *     provided.
 * @return {string} The key corresponding to the provided app ID.
 * @private
 */
firebaseui.auth.AuthUI.getInstanceKey_ = function(opt_appId) {
  return opt_appId || firebaseui.auth.AuthUI.DEFAULT_INSTANCE_KEY_;
};


/**
 * Returns the AuthUI instance corresponding to the appId provided.
 * @param {?string=} opt_appId The optional app ID whose instance is to be
 *     provided.
 * @return {?firebaseui.auth.AuthUI} The AuthUI instance corresponding to the
 *     app ID provided.
 */
firebaseui.auth.AuthUI.getInstance = function(opt_appId) {
  var key = firebaseui.auth.AuthUI.getInstanceKey_(opt_appId);
  if (firebaseui.auth.AuthUI.instances_[key]) {
    return firebaseui.auth.AuthUI.instances_[key];
  }
  return null;
};


/**
 * The suffix of the temp Auth instance app name.
 * @const {string}
 * @private
 */
firebaseui.auth.AuthUI.TEMP_APP_NAME_SUFFIX_ = '-firebaseui-temp';


/**
 * The default instance key when no app ID is provided.
 * @const {string}
 * @private
 */
firebaseui.auth.AuthUI.DEFAULT_INSTANCE_KEY_ = '[DEFAULT]';


/**
 * The Firebase UI framework ID.
 * @const {string}
 * @private
 */
firebaseui.auth.AuthUI.FRAMEWORK_ID_ = 'FirebaseUI-web';


/**
 * If sign-in succeeded, returns the signed in user. If sign-in was
 * unsuccessful, fails with an error. If no redirect operation was called,
 * returns a UserCredential with a null User.
 *
 * @return {!goog.Promise<!firebase.auth.UserCredential>} a UserCredential
 *     from the redirect-based sign-in flow.
 */
firebaseui.auth.AuthUI.prototype.getRedirectResult = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  if (!this.getRedirectResult_) {
    this.getRedirectResult_ = goog.Promise.resolve(
        this.getAuth().getRedirectResult());
  }
  return this.getRedirectResult_;
};


/**
 * @param {!firebaseui.auth.ui.page.Base} component The current rendered
 *     component.
 */
firebaseui.auth.AuthUI.prototype.setCurrentComponent = function(component) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  this.currentComponent_ = component;
};


/** @return {?firebaseui.auth.ui.page.Base} The current rendered component. */
firebaseui.auth.AuthUI.prototype.getCurrentComponent = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return this.currentComponent_;
};


/**
 * The description of the error message raised when the widget element is not
 * found during initialization.
 * @const {string}
 * @private
 */
firebaseui.auth.AuthUI.ELEMENT_NOT_FOUND_ = 'Could not find the FirebaseUI ' +
    'widget element on the page.';


/**
 * @private {?firebaseui.auth.AuthUI} The current widget AuthUI instance. Only
 *     one authui widget instance can be created per page.
 */
firebaseui.auth.AuthUI.widgetAuthUi_ = null;


/** @return {?firebaseui.auth.AuthUI} The current widget AuthUI instance. */
firebaseui.auth.AuthUI.getAuthUi = function() {
  return firebaseui.auth.AuthUI.widgetAuthUi_;
};


/**
 * @return {!firebase.auth.Auth} The temporary internal Firebase Auth instance.
 *     This is used to avoid triggering onAuthStateChanged observer on the
 *     developer provided Auth instance.
 */
firebaseui.auth.AuthUI.prototype.getAuth = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return this.tempAuth_;
};


/**
 * @return {!firebase.auth.Auth} The original developer provided Firebase auth
 *     instance.
 */
firebaseui.auth.AuthUI.prototype.getExternalAuth = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return this.auth_;
};

/**
 * @return {string|undefined} The app id if provided.
 */
firebaseui.auth.AuthUI.prototype.getAppId = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return this.appId_;
};


/**
 * Returns true if there is any pending operations to be resolved by the widget.
 * It is required in some cases like linking flows, where the user can become
 * signed in and the widget still has to perform some operations (linking)
 * before the sign-in state can be displayed in the app.
 * When this flag is true, the widget HAS to be rendered.
 * @return {boolean} Whether the app has pending operations to be performed.
 */
firebaseui.auth.AuthUI.prototype.isPending = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return firebaseui.auth.storage.hasPendingEmailCredential(this.getAppId());
};


/**
 * Handles the FirebaseUI operation.
 * An {@code Error} is thrown if the the developer tries to run this operation
 * more than once.
 *
 * @param {string|!Element} element The container element or the query selector.
 * @param {Object} config The configuration for sign-in button.
 */
firebaseui.auth.AuthUI.prototype.start = function(element, config) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;

  // Save the original language code of external Auth instance.
  if (typeof this.auth_.languageCode !== 'undefined') {
    this.originalAuthLanguageCode_ = this.auth_.languageCode;
  }
  // Make sure the locale uses hyphens instead of underscores.
  var unicodeLocale = firebaseui.auth.util.getUnicodeLocale();
  // Sync the language code of Auth instance with widget.
  this.auth_.languageCode = unicodeLocale;
  this.tempAuth_.languageCode = unicodeLocale;

  // There is a problem when config in second call modifies accountchooser.com
  // related config. eg. acUiConfig
  // These changes will be ignored as only the first accountchooser.com related
  // config will be applied.
  this.setConfig(config);

  var doc = goog.global.document;
  // Wrap it in a onload callback to wait for the DOM element is rendered.
  // If document already loaded, render immediately.
  if (doc.readyState == 'complete') {
    this.initElement_(element);
  } else {
    // Document not ready, wait for load before rendering.
    goog.events.listenOnce(window, goog.events.EventType.LOAD, function() {
      self.initElement_(element);
    });
  }
};


/**
 * Initializes the FirebaseUI element.
 * @param {string|!Element} element The container element or the query selector.
 * @private
 */
firebaseui.auth.AuthUI.prototype.initElement_ = function(element) {
  // Confirm element exists.
  var container = firebaseui.auth.util.getElement(
      element, firebaseui.auth.AuthUI.ELEMENT_NOT_FOUND_);

  // Set the "lang" attribute; without this, there are subtle rendering errors
  // like vowel capitalization in Turkish.

  // Make sure the locale uses hyphens instead of underscores.
  container.setAttribute('lang', firebaseui.auth.util.getUnicodeLocale());

  // Only one auth instance can be rendered per page. This is because
  // accountchooser.com callbacks are set once to the AuthUI instance that
  // first calls them.
  if (firebaseui.auth.AuthUI.widgetAuthUi_) {
    // Already rendered, automatically reset.
    // First check if there is a pending operation on that widget, if so,
    // log a reset warning to the console.
    if (firebaseui.auth.AuthUI.widgetAuthUi_.isPending()) {
      var resetWarning = 'UI Widget is already rendered on the page and is ' +
          'pending some user interaction. Only one widget instance can be ' +
          'rendered per page. The previous instance has been automatically ' +
          'reset.';
      firebaseui.auth.log.warning(resetWarning);
    }
    firebaseui.auth.AuthUI.widgetAuthUi_.reset();
  }

  // Set widget AuthUI as current instance.
  firebaseui.auth.AuthUI.widgetAuthUi_ = this;

  this.widgetElement_ = container;
  // Initialize widget page change listener.
  this.initPageChangeListener_(container);
  // Document already loaded, render on demand.
  firebaseui.auth.widget.dispatcher.dispatchOperation(this, element);
};


/**
 * Registers a pending promise or reset function.
 * @param {?goog.Promise|?firebase.Promise|?function()} p The pending promise.
 */
firebaseui.auth.AuthUI.prototype.registerPending = function(p) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  if (p) {
    this.pending_.push(p);
    var remove = function() {
      goog.array.removeAllIf(self.pending_, function(ele) {
        return ele == p;
      });
    };
    // Remove pending promise on resolve or reject.
    if (typeof p != 'function') {
      p.then(remove, remove);
    }
  }
};


/**
 * Disables One-Tap auto sign-in.
 */
firebaseui.auth.AuthUI.prototype.disableAutoSignIn = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  // Auto sign-in cannot be re-enabled.
  // Auto sign-in can only be disabled before rendering One-Tap.
  this.autoSignInDisabled_ = true;
};


/** @return {boolean} Whether auto sign-in is disabled. */
firebaseui.auth.AuthUI.prototype.isAutoSignInDisabled = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  // Auto sign-in is disabled either explicitly or when account selection prompt
  // is required.
  return this.autoSignInDisabled_ ||
      this.getConfig().isAccountSelectionPromptEnabled();
};


/**
 * @return {function():?firebaseui.auth.AuthUI} The Firebase Auth instance
 *     getter.
 */
firebaseui.auth.AuthUI.prototype.getAuthUiGetter = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return firebaseui.auth.AuthUI.getAuthUi;
};


/** Reset rendered widget and removes it from display. */
firebaseui.auth.AuthUI.prototype.reset = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  // Remove the "lang" attribute that we set in start().
  if (this.widgetElement_) {
    this.widgetElement_.removeAttribute('lang');
  }
  // Change back the languageCode of external Auth instance.
  if (typeof this.auth_.languageCode !== 'undefined') {
    this.auth_.languageCode = this.originalAuthLanguageCode_;
  }
  // Cancel One-Tap last operation.
  this.cancelOneTapSignIn();

  // After reset, if the sign-in widget callback is called again, it should not
  // resolve with the previous redirect result.
  this.getRedirectResult_ =
      /** @type {!goog.Promise<!firebase.auth.UserCredential>} */ (
      goog.Promise.resolve({
        'user': null,
        'credential': null
      }));
  // Reset widget AuthUI if it is the current instance.
  if (firebaseui.auth.AuthUI.widgetAuthUi_ == this) {
    firebaseui.auth.AuthUI.widgetAuthUi_ = null;
  }
  this.widgetElement_ = null;
  // Cancel all pending promises or run reset functions.
  for (var i = 0; i < this.pending_.length; i++) {
    if (typeof this.pending_[i] == 'function') {
      /** @type{!function()} */ (this.pending_[i])();
    } else {
      // firebase.Promise may use the native Promise which does not have a
      // cancel method. Only goog.Promise offers that.
      if (this.pending_[i].cancel) {
        this.pending_[i].cancel();
      }
    }
  }
  // Clear all pending promises and reset functions.
  this.pending_ = [];
  // Remove pending email credential.
  firebaseui.auth.storage.removePendingEmailCredential(this.getAppId());
  // Dispose any remaining widget UI.
  if (this.currentComponent_) {
    this.currentComponent_.dispose();
    this.currentComponent_ = null;
  }
  // Reset current page id.
  this.currentPageId_ = null;
};


/**
 * Initializes the widget page change listener. On page change, triggers the UI
 * changed callback if provided.
 *
 * @param {Element} element The widget container element.
 * @private
 */
firebaseui.auth.AuthUI.prototype.initPageChangeListener_ = function(element) {
  var self = this;
  /** @private {?string} Current page id. */
  this.currentPageId_ = null;
  // Initialize the event dispatcher on the widget element.
  this.widgetEventDispatcher_ = new firebaseui.auth.EventDispatcher(element);
  // Register event dispatcher.
  this.widgetEventDispatcher_.register();
  // Listen to the pageEnter events.
  goog.events.listen(
      this.widgetEventDispatcher_,
      'pageEnter',
      function(event) {
        // Get new page id.
        var newPageId = event && event.pageId;
        // If page change detected.
        if (self.currentPageId_ != newPageId) {
          // Get UI changed callback.
          var uiChangedCallback = self.getConfig().getUiChangedCallback();
          if (uiChangedCallback) {
            // If UI changed callback provided, trigger it.
            uiChangedCallback(self.currentPageId_, newPageId);
          }
          // Update current page id.
          self.currentPageId_ = newPageId;
        }
      });
};


/**
 * Updates the configuration and its descendants with the given value.
 *
 * @param {string} name The name of the configuration.
 * @param {*} value The value of the configuration.
 */
firebaseui.auth.AuthUI.prototype.updateConfig = function(name, value) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  this.config_.update(name, value);
};


/**
 * Sets the app configuration.
 * @param {Object} config The application configuration.
 */
firebaseui.auth.AuthUI.prototype.setConfig = function(config) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  this.config_.setConfig(config);
};


/**
 * @return {firebaseui.auth.widget.Config} The application configuration.
 */
firebaseui.auth.AuthUI.prototype.getConfig = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return this.config_;
};


/**
 * Triggers the sign-in flow.
 */
firebaseui.auth.AuthUI.prototype.signIn = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  firebaseui.auth.widget.handler.startSignIn(this);
};


/**
 * Checks if the instance is destroyed. If so, throws an error.
 * @private
 */
firebaseui.auth.AuthUI.prototype.checkIfDestroyed_ = function() {
  if (this.deleted_) {
    throw new Error('AuthUI instance is deleted!');
  }
};


/**
 * Destroys the AuthUI instance.
 * @return {!firebase.Promise} The promise that resolves when the instance
 *     is successfully deleted.
 */
firebaseui.auth.AuthUI.prototype.delete = function() {
  var self = this;
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  // Delete the temporary app instance.
  return this.tempAuth_.app.delete().then(function() {
    // Get instance key.
    var key = firebaseui.auth.AuthUI.getInstanceKey_(self.getAppId());
    // Delete any saved AuthUI instance.
    delete firebaseui.auth.AuthUI.instances_[key];
    // Reset current instance.
    self.reset();
    // Mark as deleted.
    self.deleted_ = true;
  });
};


/** Cancels any pending One-Tap sign-in operation if available. */
firebaseui.auth.AuthUI.prototype.cancelOneTapSignIn = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  // Cancel any googleyolo operation.
  this.googleYolo_.cancel();
};


/**
 * Shows the One-Tap UI if available. On credential availability, runs
 * the provided handler.
 * @param {function(!firebaseui.auth.AuthUI,
 *                  !firebaseui.auth.ui.page.Base,
 *                  ?SmartLockCredential):!goog.Promise<boolean>}
 *     handler The One-Tap credential handler.
 */
firebaseui.auth.AuthUI.prototype.showOneTapSignIn = function(handler) {
  var self = this;
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  try {
    this.googleYolo_.show(
        this.getConfig().getGoogleYoloConfig(), this.isAutoSignInDisabled())
        .then(function(credential) {
          // Run only when component is available.
          if (self.currentComponent_) {
            return handler(self, self.currentComponent_, credential);
          }
          return false;
        });
  } catch (e) {
    // This is an additive API and it's a best effort approach.
    // Ignore the error when the One-Tap API is not supported.
  }
};
