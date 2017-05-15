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
  /** @private {!firebase.auth.Auth} The Firebase Auth instance. */
  this.auth_ = auth;
  var tempApp = firebase.initializeApp({
    'apiKey': auth['app']['options']['apiKey'],
    'authDomain': auth['app']['options']['authDomain']
  }, auth['app']['name'] + firebaseui.auth.AuthUI.TEMP_APP_NAME_SUFFIX_);
  /**
   * @private {!firebase.auth.Auth} The temporary internal Firebase Auth
   *     instance.
   */
  this.tempAuth_ = tempApp.auth();
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
};


/**
 * The suffix of the temp Auth instance app name.
 * @const {string}
 * @private
 */
firebaseui.auth.AuthUI.TEMP_APP_NAME_SUFFIX_ = '-firebaseui-temp';


/**
 * If sign-in succeeded, returns the signed in user. If sign-in was
 * unsuccessful, fails with an error. If no redirect operation was called,
 * returns a UserCredential with a null User.
 *
 * @return {!goog.Promise<!firebase.auth.UserCredential>} a UserCredential
 *     from the redirect-based sign-in flow.
 */
firebaseui.auth.AuthUI.prototype.getRedirectResult = function() {
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
  this.currentComponent_ = component;
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
  return this.tempAuth_;
};


/**
 * @return {!firebase.auth.Auth} The original developer provided Firebase auth
 *     instance.
 */
firebaseui.auth.AuthUI.prototype.getExternalAuth = function() {
  return this.auth_;
};

/**
 * @return {string|undefined} The app id if provided.
 */
firebaseui.auth.AuthUI.prototype.getAppId = function() {
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
  var self = this;
  var onReady = function() {
    var resetWarning = 'UI Widget is already rendered on the page and is pen' +
        'ding some user interaction. Only one widget instance can be rendere' +
        'd per page. The previous instance has been automatically reset.';
    // Only one auth instance can be rendered per page. This is because
    // accountchooser.com callbacks are set once to the AuthUI instance that
    // first calls them.
    if (firebaseui.auth.AuthUI.widgetAuthUi_) {
      // Already rendered, automatically reset.
      // First check if there is a pending operation on that widget, if so,
      // log a reset warning to the console.
      if (firebaseui.auth.AuthUI.widgetAuthUi_.isPending()) {
        firebaseui.auth.log.warning(resetWarning);
      }
      firebaseui.auth.AuthUI.widgetAuthUi_.reset();
    }
    // Set widget AuthUI as current instance.
    firebaseui.auth.AuthUI.widgetAuthUi_ = self;
  };
  // There is a problem when config in second call modifies accountchooser.com
  // related config. eg. acUiConfig
  // These changes will be ignored as only the first accountchooser.com related
  // config will be applied.
  this.setConfig(config);

  var doc = goog.global.document;
  // Wrap it in a onload callback to wait for the DOM element is rendered.
  // If document already loaded, render immediately.
  if (doc.readyState == 'complete') {
    // Confirm element exists.
    var container = firebaseui.auth.util.getElement(
        element, firebaseui.auth.AuthUI.ELEMENT_NOT_FOUND_);
    onReady();
    self.widgetElement_ = container;
    // Initialize widget page change listener.
    self.initPageChangeListener_(container);
    // Document already loaded, render on demand.
    firebaseui.auth.widget.dispatcher.dispatchOperation(self, element);
  } else {
    // Document not ready, wait for load before rendering.
    goog.events.listenOnce(window, goog.events.EventType.LOAD, function() {
      // Confirm element exists.
      var container = firebaseui.auth.util.getElement(
          element, firebaseui.auth.AuthUI.ELEMENT_NOT_FOUND_);
      onReady();
      self.widgetElement_ = container;
      // Initialize widget page change listener.
      self.initPageChangeListener_(container);
      firebaseui.auth.widget.dispatcher.dispatchOperation(self, element);
    });
  }
};


/**
 * Registers a pending promise or reset function.
 * @param {?goog.Promise|?firebase.Promise|?function()} p The pending promise.
 */
firebaseui.auth.AuthUI.prototype.registerPending = function(p) {
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
 * @return {function():?firebaseui.auth.AuthUI} The Firebase Auth instance
 *     getter.
 */
firebaseui.auth.AuthUI.prototype.getAuthUiGetter = function() {
  return firebaseui.auth.AuthUI.getAuthUi;
};


/** Reset rendered widget and removes it from display. */
firebaseui.auth.AuthUI.prototype.reset = function() {
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
  this.config_.update(name, value);
};


/**
 * Sets the app configuration.
 * @param {Object} config The application configuration.
 */
firebaseui.auth.AuthUI.prototype.setConfig = function(config) {
  this.config_.setConfig(config);
};


/**
 * @return {firebaseui.auth.widget.Config} The application configuration.
 */
firebaseui.auth.AuthUI.prototype.getConfig = function() {
  return this.config_;
};


/**
 * Triggers the sign-in flow.
 */
firebaseui.auth.AuthUI.prototype.signIn = function() {
  firebaseui.auth.widget.handler.startSignIn(this);
};
