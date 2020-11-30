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

goog.require('firebaseui.auth.ActionCodeUrlBuilder');
goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.EventDispatcher');
goog.require('firebaseui.auth.GoogleYolo');
goog.require('firebaseui.auth.PhoneAuthResult');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.dispatcher');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleAnonymousUserMismatch');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleCallback');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleDifferentDeviceError');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailChangeRevocation');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkConfirmation');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkNewDeviceLinking');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInCallback');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInLinking');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInSent');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailMismatch');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailNotReceived');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailVerification');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleFederatedRedirect');
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
goog.require('firebaseui.auth.widget.handler.handlePrefilledEmailSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleUnsupportedProvider');
goog.require('firebaseui.auth.widget.handler.startSignIn');
goog.require('goog.Promise');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.EventType');




/**
 * @param {!firebase.auth.Auth} auth The Firebase Auth instance.
 * @param {string=} opt_appId The optional app id.
 * @constructor @struct
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
  /** @private {boolean} Whether language code requires reverting. */
  this.languageCodePendingRevert_ = false;
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
   * @private {?Object} The sign-in hint. Only supports email hint for now.
   */
  this.signInHint_ = null;
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
   * @private {!Array<!goog.Promise|!firebase.Promise|function()>} The array of
   *     pending promises or reset functions.
   */
  this.pending_ = [];
  /** @private {boolean} Whether One-Tap auto sign-in is disabled or not. */
  this.autoSignInDisabled_ = false;
  // Currently we do not dynamically load One-Tap JS binary. The developer has
  // to include it.
  /** @private {!firebaseui.auth.GoogleYolo} The One-Tap UI wrapper. */
  this.googleYolo_ = firebaseui.auth.GoogleYolo.getInstance();
  /**
   * @private {?firebase.Promise} Promise that resolves when internal Auth
   *     instance is signed out, after which start is safe to execute.
   */
  this.pendingInternalAuthSignOut_ =  null;
  /**
   * @private {?firebase.User} The latest current user on the external Auth
   *     instance. This is currently only relevant for upgrade anonymous user
   *     flows.
   */
  this.currentUser_ = null;
  /** @private {boolean} Whether initial external Auth state is ready. */
  this.initialStateReady_ = false;
  /** @private {boolean} Whether the deprecation warning has been shown. */
  this.warningShown_ = false;
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
 * The error message shown when an incompatible version of firebase.js is used
 * with firebaseui.js.
 * @const {string}
 */
firebaseui.auth.AuthUI.INCOMPATIBLE_DEPENDENCY_ERROR =
    'Internal error: An incompatible or outdated version of "firebase.js" ' +
    'may be used.';


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
    var self = this;
    var cb = function(user) {
      if (user &&
          // If email already exists, user must first be signed in it to the
          // existing account on the internal Auth instance before the
          // credential is linked and merge conflict is triggered.
          !firebaseui.auth.storage.getPendingEmailCredential(self.getAppId())) {
        // Anonymous user eligible for upgrade detected.
        // Linking occurs on external Auth instance.
        // This could occur when anonymous user linking with redirect fails for
        // some reason.
        return /** @type {!goog.Promise<!firebase.auth.UserCredential>} */ (
            goog.Promise.resolve(self.getExternalAuth().getRedirectResult()
            .then(function(result) {
              // Should not happen in real life as this will only run when the
              // user is anonymous.
              return result;
             }, function(error) {
              // This will trigger account linking flow.
              if (error &&
                  error['code'] == 'auth/email-already-in-use' &&
                  error['email'] && error['credential']) {
                throw error;
              }
              return self.onUpgradeError(error);
            })));
      } else {
        // No eligible anonymous user detected on external instance.
        // Get redirect result from internal instance first.
        return goog.Promise.resolve(
            self.getAuth().getRedirectResult().then(function(result) {
              // Anonymous user could have successfully completed
              // linkWithRedirect.
              if (self.getConfig().autoUpgradeAnonymousUsers() &&
                  // No user signed in on internal instance.
                  !result['user'] &&
                  // Current non anonymous user available on external instance.
                  self.currentUser_ &&
                  !self.currentUser_['isAnonymous']) {
                // Return redirect result from external instance.
                return self.getExternalAuth().getRedirectResult();
              }
              // Return redirect result from internal instance.
              return result;
            }));
      }
    };
    // Initialize current user if auto upgrade is enabled beforing running
    // callback and returning result.
    this.getRedirectResult_ = this.initializeForAutoUpgrade_(cb);
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
 * Returns the email hint for sign-in.
 * @return {string|undefined} The sign-in email hint.
 */
firebaseui.auth.AuthUI.prototype.getSignInEmailHint = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return this.signInHint_ ? this.signInHint_['emailHint'] : undefined;
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
 * Returns true if there is any pending redirect operations to be resolved by
 * the widget.
 * Note this returns true when the URL corresponds to an email link sign-in
 * operation. This is needed to help the developer determine if the user is
 * trying to complete email link sign-in.
 * @return {boolean} Whether the app has pending redirect operations to be
 *     performed.
 */
firebaseui.auth.AuthUI.prototype.isPendingRedirect = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return firebaseui.auth.storage.hasRedirectStatus(this.getAppId()) ||
      // User trying to complete sign-in started via FirebaseUI with email link.
      this.isEmailLinkSignInUrl_(firebaseui.auth.util.getCurrentUrl());
};


/**
 * Returns whether the provided URL is associated with an email link sign-in
 * operation.
 * @param {string} url The URL to check for email link sign-in mode.
 * @return {boolean} Whether the link is for email link sign-in.
 * @private
 */
firebaseui.auth.AuthUI.prototype.isEmailLinkSignInUrl_ = function(url) {
  var urlBuilder = new firebaseui.auth.ActionCodeUrlBuilder(url);
  return urlBuilder.getMode() === 'signIn' && !!urlBuilder.getOobCode();
};


/**
 * Handles the FirebaseUI operation.
 * An `Error` is thrown if the developer tries to run this operation
 * more than once.
 *
 * @param {string|!Element} element The container element or the query selector.
 * @param {!Object} config The configuration for sign-in button.
 */
firebaseui.auth.AuthUI.prototype.start = function(element, config) {
  this.startWithSignInHint(element, config);
};


/**
 * Start sign-in operation with sign-in hint. Not exposed to public for now.
 * @param {string|!Element} element The container element or the query selector.
 * @param {!Object} config The configuration for the sign-in button.
 * @param {?Object=} signInHint The optional sign-in hint.
 */
firebaseui.auth.AuthUI.prototype.startWithSignInHint =
    function(element, config, signInHint = undefined) {
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
  // At end of flow or on reset, revert is needed.
  this.languageCodePendingRevert_ = true;

  // Sync the tenant ID from external instance to internal instance.
  if (typeof this.auth_['tenantId'] !== 'undefined') {
    this.tempAuth_['tenantId'] = this.auth_['tenantId'];
  }

  this.setConfig(config);
  this.signInHint_ = signInHint || null;
  // Checks if there is pending internal Auth signOut promise. If yes, wait
  // until it resolved and then initElement.
  var doc = goog.global.document;
  if (this.pendingInternalAuthSignOut_) {
    this.pendingInternalAuthSignOut_.then(function() {
      // Wrap it in a onload callback to wait for the DOM element is rendered.
      // If document already loaded, render immediately.
      if (doc.readyState == 'complete') {
        self.initElement_(element);
      } else {
        // Document not ready, wait for load before rendering.
        goog.events.listenOnce(window, goog.events.EventType.LOAD, function() {
          self.initElement_(element);
        });
      }
    });
  } else {
    // Wrap it in a onload callback to wait for the DOM element is rendered.
    // If document already loaded, render immediately.
    if (doc.readyState == 'complete') {
      self.initElement_(element);
    } else {
      // Document not ready, wait for load before rendering.
      goog.events.listenOnce(window, goog.events.EventType.LOAD, function() {
        self.initElement_(element);
      });
    }
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
  // If the current page is blank and immediateFederatedRedirect is set to true,
  // the widget is in the middle of federated redirecting and about to redirect
  // to IdPs.
  const isCurrentlyRedirecting = this.currentComponent_ &&
      this.currentComponent_.getPageId() == 'blank' &&
      this.getConfig().federatedProviderShouldImmediatelyRedirect();
  // Removes pending status of previous redirect operations including redirect
  // back from accountchooser.com and federated sign in.
  // Remove status after dispatchOperation completes as that operation depends
  // on this information.
  if (firebaseui.auth.storage.hasRedirectStatus(this.getAppId()) &&
      // Do not clear redirect status if the widget is undergoing immediate
      // redirect, which is before redirecting to IdPs.
      !isCurrentlyRedirecting) {
    var redirectStatus =
        firebaseui.auth.storage.getRedirectStatus(this.getAppId());
    this.setTenantId(redirectStatus.getTenantId());
    firebaseui.auth.storage.removeRedirectStatus(this.getAppId());
  }
};


/**
 * Initializes state needed for processing anonymous user upgrade if enabled,
 * before running the specified callback function and returning its result.
 * @param {function(?firebase.User):T} cb The callback to trigger when ready.
 * @return {T|goog.Promise<T>} The callback result.
 * @template T
 * @private
 */
firebaseui.auth.AuthUI.prototype.initializeForAutoUpgrade_ = function(cb) {
  // This routine could be called anytime, different Auth logic may need to be
  // applied depending on the autoUpgradeAnonymousUsers flag. This keeps the
  // anonymous user check only when needed minimizing the foot print size on the
  // non-anonymous upgrade flow.
  var self = this;
  // If initial state already determined, run callback with the current
  // upgradeable user and return its result.
  if (this.initialStateReady_) {
    return cb(this.getUpgradableUser_());
  }
  // On reset, clear initial state as Auth state listener will be unsubscribed.
  this.registerPending(function() {
    // This ensures onAuthStateChanged re-subscribed to after reset.
    self.initialStateReady_ = false;
  });
  // onAuthStateChanged can be slow. Use it only when needed.
  if (this.getConfig().autoUpgradeAnonymousUsers()) {
    var p = new goog.Promise(function(resolve, reject) {
      self.registerPending(self.auth_.onAuthStateChanged(function(user) {
        // Update currentUser reference whenever there is a state change.
        self.currentUser_ = user;
        // Resolve promise only initially with initial upgradeable user.
        if (!self.initialStateReady_) {
          self.initialStateReady_ = true;
          resolve(cb(self.getUpgradableUser_()));
        }
      }));
    });
    // Register pending promise.
    this.registerPending(p);
    return p;
  } else {
    // Auto anonymous user upgrade disabled.
    // By keeping this synchronous, no additional changes are needed for the
    // no upgrade flow.
    this.initialStateReady_ = true;
    return cb(null);
  }
};


/**
 * @return {?firebase.User} The current anonymous user if eligible for upgrade,
 *     null otherwise.
 * @private
 */
firebaseui.auth.AuthUI.prototype.getUpgradableUser_ = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  // This is typically run after initial onAuthStateChanged listener is
  // triggered.
  // Auto upgrade must be enabled and the current external user must be
  // anonymous.
  if (this.getConfig().autoUpgradeAnonymousUsers() &&
      this.currentUser_ &&
      this.currentUser_['isAnonymous']) {
    return this.currentUser_;
  }
  return null;
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


/**
 * Reverts the external Auth instance language code to original setting.
 * This should be called right before the widget operation completes.
 * However, it should be called before the developer callbacks, in case the
 * developer tries to set the language within the callback.
 */
firebaseui.auth.AuthUI.prototype.revertLanguageCode = function() {
  // Change back the languageCode of external Auth instance if revert is
  // required.
  if (typeof this.auth_.languageCode !== 'undefined' &&
      this.languageCodePendingRevert_) {
    this.languageCodePendingRevert_ = false;
    this.auth_.languageCode = this.originalAuthLanguageCode_;
  }
};


/**
 * Sets the tenant ID on both internal and external Auth instances.
 * @param {?string} tenantId The tenant ID.
 */
firebaseui.auth.AuthUI.prototype.setTenantId = function(tenantId) {
  this.auth_['tenantId'] = tenantId;
  this.tempAuth_['tenantId'] = tenantId;
};


/**
 * Returns the tenant ID used to start the sign-in flow.
 * @return {?string} tenantId
 */
firebaseui.auth.AuthUI.prototype.getTenantId = function() {
  return this.tempAuth_['tenantId'] || null;
};


/** Reset rendered widget and removes it from display. */
firebaseui.auth.AuthUI.prototype.reset = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  // Remove the "lang" attribute that we set in start().
  if (this.widgetElement_) {
    this.widgetElement_.removeAttribute('lang');
  }
  // Unregister previous listener.
  if (this.widgetEventDispatcher_) {
    this.widgetEventDispatcher_.unregister();
  }
  this.revertLanguageCode();
  this.signInHint_ = null;
  // Clear email link sign-in state from URL if needed.
  this.clearEmailSignInState();
  // Removes pending status of previous redirect operations including redirect
  // back from accountchooser.com and federated sign in.
  firebaseui.auth.storage.removeRedirectStatus(this.getAppId());
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
      /** @type{function()} */ (this.pending_[i])();
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
  // Signs Out internal Auth instance to avoid dangling Auth state.
  if (this.tempAuth_) {
    this.pendingInternalAuthSignOut_ = this.clearTempAuthState()
        .then(function() {
          self.pendingInternalAuthSignOut_ = null;
        }, function(error) {
          self.pendingInternalAuthSignOut_ = null;
        });
  }
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
  /** @private {?string} Current page ID. */
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
        // Get new page ID.
        var newPageId = event && event['pageId'];
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
  this.checkForDeprecation_();
};


/**
 * Sets the app configuration.
 * @param {Object} config The application configuration.
 */
firebaseui.auth.AuthUI.prototype.setConfig = function(config) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  this.config_.setConfig(config);
  this.checkForDeprecation_();
};


/**
 * Checks for deprecated configs passed and logs any warnings when detected.
 * @private
 */
firebaseui.auth.AuthUI.prototype.checkForDeprecation_ = function() {
  if (!this.warningShown_ &&
      this.getConfig().getSignInSuccessCallback()) {
    var deprecateWarning = 'signInSuccess callback is deprecated. Please use ' +
        'signInSuccessWithAuthResult callback instead.';
    firebaseui.auth.log.warning(deprecateWarning);
    this.warningShown_ = true;
  }
};


/**
 * @return {!firebaseui.auth.widget.Config} The application configuration.
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
        this.getConfig().getGoogleYoloClientId(), this.isAutoSignInDisabled())
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


/**
 * Sends a link to sign-in to the specified email. If a pending credential is
 * required to be linked at the end of the flow, it is saved locally.
 * @param {string} email The email to sign in with.
 * @param {?firebaseui.auth.PendingEmailCredential=} opt_pendingCredential The
 *     pending credential to link to the successfully signed in user
 * @return {!firebase.Promise<void>|!goog.Promise<void>}
 */
firebaseui.auth.AuthUI.prototype.sendSignInLinkToEmail =
    function(email, opt_pendingCredential) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  // Generate random 32 byte key.
  var sid = firebaseui.auth.util.generateRandomAlphaNumericString(32);
  // Assert email link sign-in allowed.
  if (!this.getConfig().isEmailLinkSignInAllowed()) {
    return goog.Promise.reject(
        new Error(
            'Email link sign-in should be enabled to trigger email sending.'));
  }
  var actionCodeSettings =/** @type {!firebase.auth.ActionCodeSettings} */ (
      this.getConfig().getEmailLinkSignInActionCodeSettings());
  var urlBuilder = new firebaseui.auth.ActionCodeUrlBuilder(
      actionCodeSettings['url']);
  urlBuilder.setSessionId(sid);
  if (opt_pendingCredential && opt_pendingCredential.getCredential()) {
    // By encrypting the credential with the same key, we ensure only this
    // session can redeem it. It is also used to obfuscate this cookie as it is
    // sent along requests and there is no restriction on our end for the flow
    // to be TLS encrypted.
    firebaseui.auth.storage.setEncryptedPendingCredential(
        sid, opt_pendingCredential, this.getAppId());
    urlBuilder.setProviderId(
        opt_pendingCredential.getCredential()['providerId']);
  }
  urlBuilder.setForceSameDevice(this.getConfig().isEmailLinkSameDeviceForced());
  var cb = function(user) {
    if (user) {
      // Pass anonymous user UID.
      urlBuilder.setAnonymousUid(user['uid']);
    }
    actionCodeSettings['url'] = urlBuilder.toString();
    return /** @type {!firebase.Promise<void>} */ (
        self.getAuth().sendSignInLinkToEmail(email, actionCodeSettings));
  };
  // Initialize current user if auto upgrade is enabled beforing running
  // callback and returning result.
  return this.initializeForAutoUpgrade_(cb).then(function() {
    firebaseui.auth.storage.setEmailForSignIn(sid, email, self.getAppId());
  }, function(error) {
    // Clear any stored pending credential or email.
    firebaseui.auth.storage.removeEncryptedPendingCredential(self.getAppId());
    firebaseui.auth.storage.removeEmailForSignIn(self.getAppId());
    throw error;
  });
};


/**
 * Returns the user needed to be upgraded for the email links sign-in flow if
 * required. If not required, null is returned. If required but not found, an
 * error is thrown.
 * @param {string} link The email link to sign in with.
 * @return {!goog.Promise<?firebase.User>} The anonymous user to upgrade if
 *     available and if that user's uid matches the uid in email link.
 */
firebaseui.auth.AuthUI.prototype.getUpgradeableEmailLinkUser = function(link) {
  var urlBuilder = new firebaseui.auth.ActionCodeUrlBuilder(link);
  var anonymousUid = urlBuilder.getAnonymousUid();
  var self = this;
  // No anonymous user is required for email link sign-in flow.
  if (!anonymousUid) {
    return goog.Promise.resolve(null);
  }
  // Anonymous user upgrade required.
  var p = new goog.Promise(function(resolve, reject) {
    var unsubscribe = self.getExternalAuth().onAuthStateChanged(function(user) {
      unsubscribe();
      // User found and matches uid.
      if (user && user['isAnonymous'] && user['uid'] === anonymousUid) {
        // Either user matches or no anonymous upgrade needed.
        resolve(user);
      } else if (user && user['isAnonymous'] && user['uid'] !== anonymousUid) {
        // User mismatch.
        reject(new Error('anonymous-user-mismatch'));
      } else {
        // User not found.
        reject(new Error('anonymous-user-not-found'));
      }
    });
    self.registerPending(unsubscribe);
  });
  self.registerPending(p);
  return p;
};


/**
 * Upgrades the anonymous user with email link and handles linking if needed.
 * This assumes checks are already performed on whether linking is
 * required and the credential to link, whether anonymous user upgrade is
 * needed or same device flow is required.
 * At the end of the flow the external user is upgraded, or merge conflict is
 * detected.
 * @param {!firebase.User} user The user to upgrade.
 * @param {string} email The email address of the account.
 * @param {string} link The link containing the OTP.
 * @param {?firebase.auth.AuthCredential=} opt_pendingCredential The pending
 *     credential to link if available.
 * @return {!firebase.Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.AuthUI.prototype.upgradeWithEmailLink = function(
    user, email, link, opt_pendingCredential) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  var pendingCredential = opt_pendingCredential || null;
  var credential = firebase.auth.EmailAuthProvider.credentialWithLink(
      email, link);
  var p;
  // Linking is required which means a merge conflict will occur. Email
  // account already exists.
  if (pendingCredential) {
    // Sign in on internal instance with email/link credential.
    // Link pending OAuth credential.
    // Sign out and throw merge error while passing pending credential.
    p = this.getAuth().signInWithEmailLink(email, link)
        .then(function(userCredential) {
          return userCredential['user']
              .linkWithCredential(pendingCredential);
        })
        .then(function(linkedUserCredential) {
          return self.clearTempAuthState();
        })
        .then(function() {
          return self.onUpgradeError(
              {'code': 'auth/email-already-in-use'},
              pendingCredential);
        });
  } else {
    p = this.getAuth().fetchSignInMethodsForEmail(email)
        .then(function(signInMethods) {
          // No pending credential.
          if (!signInMethods.length) {
            // New email. Linking email credential to anonymous user should
            // succeed.
            return user.linkWithCredential(credential);
          } else {
            // Existing email will trigger merge conflict. In this case, we
            // avoid consuming the one-time credential.
            return self.onUpgradeError(
                {'code': 'auth/email-already-in-use'}, credential);
          }
        });
  }
  // Register pending promise.
  this.registerPending(p);
  return /** @type {!firebase.Promise<!firebase.auth.UserCredential>} */ (p);
};


/**
 * Completes sign in with email link and handles linking if needed.
 * This assumes checks are already performed on whether linking is required and
 * the credential to link. For anonymous upgrade flows, upgradeWithEmailLink
 * should be used instead.
 * At the end of the flow, the user will be signed in to external Auth instance.
 * @param {string} email The email address of the account.
 * @param {string} link The link containing the OTP.
 * @param {?firebase.auth.AuthCredential=} opt_pendingCredential The pending
 *     credential to link if available.
 * @return {!firebase.Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.AuthUI.prototype.signInWithEmailLink = function(
    email, link, opt_pendingCredential) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var pendingCredential = opt_pendingCredential || null;
  var authResult;
  var self = this;
  // Sign in with email link credential on internal instance.
  var p = this.getAuth().signInWithEmailLink(email, link)
      .then(function(userCredential) {
        authResult = /** @type {!firebaseui.auth.widget.Config.AuthResult} */ ({
          'user': userCredential['user'],
          // Email link credential is not re-usable.
          'credential': null,
          'operationType': userCredential['operationType'],
          'additionalUserInfo': userCredential['additionalUserInfo']
        });
        // If there is a pending credential, link it to signed in user.
        if (pendingCredential) {
          return userCredential['user']
              .linkWithCredential(pendingCredential)
              .then(function(linkedUserCredential) {
                authResult = {
                  'user': linkedUserCredential['user'],
                  'credential': pendingCredential,
                  'operationType': authResult['operationType'],
                  'additionalUserInfo':
                      linkedUserCredential['additionalUserInfo']
                };
              });
        }
      })
      .then(function() {
        // Sign out from internal instance.
        self.clearTempAuthState();
      })
      .then(function() {
        // Copy user to external instance and return AuthResult.
        return self.getExternalAuth().updateCurrentUser(authResult['user']);
      })
      .then(function() {
        // Update AuthResult user reference to point to external Auth
        // currentUser.
        authResult['user'] = self.getExternalAuth().currentUser;
        return authResult;
      });
  // Register pending promise.
  this.registerPending(p);
  return /** @type {!firebase.Promise<!firebase.auth.UserCredential>} */ (p);
};


/**
 * Clears the email link sign-in state from the URL. This has the following
 * benefits:
 * More compatible with SPAs where a user signing in with email link signs out
 * and then tries to sign in again. The second attempt will assume the user is
 * redirected from an email link click. It also avoids confusion after a sign
 * in with redirect operation. The redirect back would be confused as a redirect
 * from an email link click.
 * The other benefit is that after email link sign-in completion with no
 * redirect to a new signInSuccessUrl, a page reload could be confused as an
 * email link sign-in attempt.
 * @param {string=} opt_url Optional URL to use as reference. If not provided,
 *     current URL is used instead.
 */
firebaseui.auth.AuthUI.prototype.clearEmailSignInState = function(opt_url) {
  var currentUrl = opt_url || firebaseui.auth.util.getCurrentUrl();
  if (this.isEmailLinkSignInUrl_(currentUrl)) {
    var urlBuilder = new firebaseui.auth.ActionCodeUrlBuilder(currentUrl);
    urlBuilder.clearState();
    // Note this will update the URL without reloading the page.
    firebaseui.auth.util.replaceHistoryState(
        // Notify the user of the current state.
        {
          'state': 'signIn',
          'mode': 'emailLink',
          'operation': 'clear'
        },
        // Keep the same document title.
        goog.global.document.title,
        // Clear the URL query string from email link sign-in state.
        urlBuilder.toString());
  }
};


/**
 * Sign in using an email and password.
 * @param {string} email The email to sign in with.
 * @param {string} password The password to sign in with.
 * @return {!firebase.Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.AuthUI.prototype.startSignInWithEmailAndPassword =
    function(email, password) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  // Start sign in with existing email and password. This always runs on the
  // internal Auth instance as an existing email/password account linking will
  // always fail when upgrading an anonymous user. For the non-anonymous upgrade
  // flow, the same credential will be used to complete sign in on the
  // external Auth instance.
  return /** @type {!firebase.Promise<!firebase.auth.UserCredential>} */ (
      this.getAuth().signInWithEmailAndPassword(email, password)
      .then(function(result) {
        var cb = function(user) {
          if (user) {
            // signOut the user.
            return self.clearTempAuthState().then(function() {
              // Eligible anonymous user upgrade.
              // On anonymous user upgrade with existing email/password, merge
              // conflict will always occur, trigger signInFailure as soon as
              // password is confirmed.
              return self.onUpgradeError(
                  {'code': 'auth/email-already-in-use'},
                  firebase.auth.EmailAuthProvider.credential(email, password));
            });
          } else {
            return result;
          }
        };
        // Initialize current user if auto upgrade is enabled beforing running
        // callback and returning result.
        return self.initializeForAutoUpgrade_(cb);
      }));
};


/**
 * Create a new email and password account.
 * @param {string} email The email to sign up with.
 * @param {string} password The password to sign up with.
 * @return {!firebase.Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.AuthUI.prototype.startCreateUserWithEmailAndPassword =
    function(email, password) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  var cb = function(user) {
    if (user) {
      var credential =
          firebase.auth.EmailAuthProvider.credential(email, password);
      // For anonymous user upgrade, call link with credential on the external
      // Auth user. Otherwise merge conflict will always occur when linking the
      // credential to the external anonymous user after creation.
      return /** @type {!firebase.Promise<!firebase.auth.UserCredential>} */ (
          user.linkWithCredential(credential));
    } else {
      // Start create user with email and password. This runs on the internal
      // Auth instance as finish sign in will sign in with that same credential
      // to developer Auth instance.
      return /** @type {!firebase.Promise<!firebase.auth.UserCredential>} */ (
          self.getAuth().createUserWithEmailAndPassword(
              email, password));
    }
  };
  // Initialize current user if auto upgrade is enabled beforing running
  // callback and returning result.
  return this.initializeForAutoUpgrade_(cb);
};


/**
 * Logs into Firebase with the given 3rd party credentials.
 * @param {!firebase.auth.AuthCredential} credential The Auth credential.
 * @return {!firebase.Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.AuthUI.prototype.startSignInWithCredential =
    function(credential) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  var cb = function(user) {
    if (user) {
      // For anonymous user upgrade, call link with credential on the external
      // Auth user. Otherwise merge conflict will always occur when linking the
      // credential to the external anonymous user after creation.
      return /** @type {!firebase.Promise<!firebase.auth.UserCredential>} */ (
          user.linkWithCredential(credential)
          .then(function(result) {
            return result;
          }, function(error) {
            // Fail directly when email already in use error thrown. This will
            // trigger account linking flow.
            // When email already exists for a new federated credential, user
            // must sign in to existing account and then link this credential to
            // that account.
            if (error &&
                error['code'] == 'auth/email-already-in-use' &&
                error['email'] && error['credential']) {
              throw error;
            }
            // Pass the same credential back in the error. This assumes the
            // credential used is not a one-time credential.
            return self.onUpgradeError(error, credential);
          }));
    } else {
      // Starts sign in with a Firebase Auth credential, typically an OAuth
      // credential. This runs on the internal Auth instance as finish sign in
      // will sign in with that same credential to developer Auth instance.
      return self.getAuth().signInWithCredential(credential);
    }
  };
  // Initialize current user if auto upgrade is enabled beforing running
  // callback and returning result.
  return this.initializeForAutoUpgrade_(cb);
};


/**
 * Signs in to Auth provider via popup.
 * @param {!firebase.auth.AuthProvider} provider The Auth provider to sign in
 *     with.
 * @return {!firebase.Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.AuthUI.prototype.startSignInWithPopup = function(provider) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  var cb = function(user) {
    if (user &&
        // If email already exists, user must first be signed in to the
        // existing account on the internal Auth instance before the credential
        // is linked and merge conflict is triggered.
        !firebaseui.auth.storage.getPendingEmailCredential(self.getAppId())) {
      // For anonymous user upgrade, call link with popup on the external Auth
      // user. Otherwise merge conflict will always occur when linking the
      // credential to the external anonymous user after creation.
      return /** @type {!firebase.Promise<!firebase.auth.UserCredential>} */ (
          user.linkWithPopup(provider)
          .then(function(result) {
            return result;
          }, function(error) {
            // Fail directly when email already in use error thrown. This will
            // trigger account linking flow.
            // When email already exists for a new federated credential, user
            // must sign to existing account and then link this credential to
            // that account.
            if (error &&
                error['code'] == 'auth/email-already-in-use' &&
                error['email'] && error['credential']) {
              throw error;
            }
            // For all other errors, run onUpgrade check.
            return self.onUpgradeError(error);
          }));
    } else {
      // Starts sign in with popup. This runs on the internal Auth instance as
      // finish sign in will sign in with the final credential to developer Auth
      // instance.
      return self.getAuth().signInWithPopup(provider);
    }
  };
  // Initialize current user if auto upgrade is enabled beforing running
  // callback and returning result.
  return this.initializeForAutoUpgrade_(cb);
};


/**
 * Signs in to Auth provider via redirect.
 * @param {!firebase.auth.AuthProvider} provider The Auth provider to sign in
 *     with.
 * @return {!firebase.Promise<void>}
 */
firebaseui.auth.AuthUI.prototype.startSignInWithRedirect = function(provider) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  // Save cached redirect result.
  var cachedRedirectResult = this.getRedirectResult_;
  // Each time a redirect operation is triggered, clear cached redirect result.
  // This is important for Cordova apps where no page redirect may occur and
  // getRedirectResult will update with the result after the redirect operation
  // resolves.
  this.getRedirectResult_ = null;
  var cb = function(user) {
    if (user &&
        // If email already exists, user must first be signed in to the
        // existing account on the internal Auth instance before the credential
        // is linked and merge conflict is triggered.
        !firebaseui.auth.storage.getPendingEmailCredential(self.getAppId())) {
      // For anonymous user upgrade, call link with redirect on the external
      // user. Otherwise merge conflict will always occur when linking the
      // credential to the external anonymous user after creation.
      return user.linkWithRedirect(provider);
    } else {
      // Starts sign in with redirect. This runs on the internal Auth instance
      // as finish sign in will sign in with the final credential to developer
      // Auth instance.
      return self.getAuth().signInWithRedirect(provider);
    }
  };
  // Initialize current user if auto upgrade is enabled beforing running
  // callback and returning result.
  return this.initializeForAutoUpgrade_(cb).then(
      function() {
        // Redirect succeeded.
        // Browser case: page navigation occurs.
        // Cordova case: either activity destroyed or getRedirectResult is
        // updated since it was nullified.
      },
      function(error) {
        // Error occurred, restore cached redirect result.
        // It is useful to keep the cached result in case the UI was previously
        // reset. This ensures that {'user': null, 'credential': null} is
        // maintained and not some previous result from a redirect operation.
        self.getRedirectResult_ = cachedRedirectResult;
        throw error;
      });
};


/**
 * Signs in with a phone number using the app verifier instance and returns a
 * promise that resolves with the confirmation result which on confirmation
 * will resolve with the UserCredential object.
 * @param {string} phoneNumber The phone number to authenticate with.
 * @param {!firebase.auth.ApplicationVerifier} appVerifier The application
 *     verifier.
 * @return {!firebase.Promise<!firebaseui.auth.PhoneAuthResult>}
 */
firebaseui.auth.AuthUI.prototype.startSignInWithPhoneNumber =
    function(phoneNumber, appVerifier) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  var cb = function(user) {
    if (user) {
      // For anonymous user upgrade, call link with phone number on the external
      // user.
      return user.linkWithPhoneNumber(phoneNumber, appVerifier)
          .then(function(confirmationResult) {
            return new firebaseui.auth.PhoneAuthResult(confirmationResult,
                function(error) {
                  if (error.code == 'auth/credential-already-in-use') {
                    return self.onUpgradeError(error);
                  }
                  throw error;
                });
          });
    } else {
      // Starts sign in with phone number. This runs on the external Auth
      // instance.
      return self.getExternalAuth().signInWithPhoneNumber(
          phoneNumber, appVerifier).then(function(confirmationResult) {
            return new firebaseui.auth.PhoneAuthResult(confirmationResult);
          });
    }
  };
  // Initialize current user if auto upgrade is enabled beforing running
  // callback and returning result.
  return this.initializeForAutoUpgrade_(cb);
};


/**
 * Sign in anonymously and returns a promise that resolves with a
 * UserCredential object. If there is an anonymous user signing on to the
 * external Auth instance, no RPC call is triggered, same user will be returned.
 * @return {!firebase.Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.AuthUI.prototype.startSignInAnonymously = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return this.getExternalAuth().signInAnonymously();
};


/**
 * Finishes FirebaseUI login with the given 3rd party credentials.
 * @param {!firebaseui.auth.widget.Config.AuthResult} authResult The Auth
 *     result.
 * @return {!firebase.Promise<!firebaseui.auth.widget.Config.AuthResult>}
 */
firebaseui.auth.AuthUI.prototype.finishSignInAndRetrieveDataWithAuthResult =
    function(authResult) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  var cb = function(user) {
    if (self.currentUser_ &&
        !self.currentUser_['isAnonymous'] &&
        self.getConfig().autoUpgradeAnonymousUsers() &&
        !self.getAuth().currentUser) {
      return self.clearTempAuthState().then(function() {
        // Do not expose password Auth credential to signInSuccess callback.
        if (authResult['credential']['providerId'] == 'password') {
          authResult['credential'] = null;
        }
        return authResult;
      });
    } else if (user) {
      // TODO: optimize and fail directly as this will fail in most cases
      // with error credential already in use.
      // There are cases where this is required. For example, when email
      // mismatch occurs and the user continues with the new account.
      return (
          /**
           * @type {!firebase.Promise<
           *     !firebaseui.auth.widget.Config.AuthResult>}
           */ (
          self.clearTempAuthState().then(function() {
            return user.linkWithCredential(
                authResult['credential']);
          }).then(function(userCredential) {
            authResult['user'] = userCredential['user'];
            authResult['credential'] = userCredential['credential'];
            authResult['operationType'] = userCredential['operationType'];
            authResult['additionalUserInfo'] =
                userCredential['additionalUserInfo'];
            return authResult;
          }, function(error) {
            // Rethrow email already in use error so it can trigger the account
            // linking flow.
            if (error &&
                error['code'] == 'auth/email-already-in-use' &&
                error['email'] && error['credential']) {
              throw error;
            }
            // For all other errors, run onUpgrade check.
            return self.onUpgradeError(error, authResult['credential']);
          })));
    } else {
      // Finishes sign in with the supplied credential on the developer provided
      // Auth instance. On completion, this will redirect to signInSuccessUrl or
      // trigger the signInSuccessWithAuthResult callback.
      if (!authResult['user']) {
        throw new Error(firebaseui.auth.AuthUI.INCOMPATIBLE_DEPENDENCY_ERROR);
      }
      return self.clearTempAuthState().then(function() {
        // updateCurrentUser is more efficient and less error prone than
        // signInWithCredential.
        // The former can resolve the operation without any network request
        // whereas the latter will send 2 requests.
        // In addition, updateCurrentUser has lower risk of failure in the
        // following cases:
        // 1. No network connection: operation can execute without any network
        // call in most cases.
        // 2. Will not run into expired OAuth credential errors unlike
        // signInWithCredential. This may happen if the user waits too long
        // before completing sign-in in the email mismatch flow.
        // 3. Ability to copy a user for all providers. Some OAuth providers
        // cannot be used headlessly or their credentials are one-time only.
        return self.getExternalAuth().updateCurrentUser(authResult['user']);
      }).then(function() {
        // Update user reference.
        authResult['user'] = self.getExternalAuth().currentUser;
        // Update operation type to signIn. This will not run for anonymous
        // upgrade flows.
        authResult['operationType'] = 'signIn';
        // Clear password credential if available
        if (authResult['credential'] &&
            authResult['credential']['providerId'] &&
            authResult['credential']['providerId'] == 'password') {
          authResult['credential'] = null;
        }
        // AdditionalUserInfo should remain the same as isNewUser field
        // should be the one returned in the first sign in attempt.
        return authResult;
      });
    }
  };
  // Initialize current user if auto upgrade is enabled beforing running
  // callback and returning result.
  return this.initializeForAutoUpgrade_(cb);
};


/**
 * Sign in using an email and password on existing account for linking to
 * recover from an existing email error.
 * @param {string} email The email to sign in with.
 * @param {string} password The password to sign in with.
 * @return {!firebase.Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.AuthUI.prototype.signInWithExistingEmailAndPasswordForLinking =
    function(email, password) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  // Starts sign in with email/password on the internal Auth instance for
  // linking purposes. This is needed to avoid triggering the onAuthStateChanged
  // callbacks interrupting the linking flow.
  return this.getAuth().signInWithEmailAndPassword(
      email, password);
};


/**
 * Clears all temporary Auth states.
 * @return {!firebase.Promise<void>}
 */
firebaseui.auth.AuthUI.prototype.clearTempAuthState = function() {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  return this.getAuth().signOut();
};


/**
 * Handles Firebase Auth upgrade errors.
 * @param {*} error The error thrown from a Firebase operation.
 * @param {?firebase.auth.AuthCredential=} opt_credential The optional
 *     credential to provide to developer on merge conflicts.
 * @return {!goog.Promise} A promise that resolves on completion.
 */
firebaseui.auth.AuthUI.prototype.onUpgradeError =
    function(error, opt_credential) {
  // Check if instance is already destroyed.
  this.checkIfDestroyed_();
  var self = this;
  if (error && error['code'] &&
      // Password sign in.
      (error['code'] == 'auth/email-already-in-use' ||
      // Federated or phone number sign in.
       error['code'] == 'auth/credential-already-in-use')) {
    // Get signInFailure callback.
    var signInFailureCallback = this.getConfig().getSignInFailureCallback();
    // Wrap in promise in case no promise returned by callback.
    return goog.Promise.resolve().then(function() {
      // Pass merge conflict error to callback and wait for resolution.
      return signInFailureCallback(new firebaseui.auth.AuthUIError(
          firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
          null,
          opt_credential || error['credential']));
    }).then(function() {
      // Clear UI after the developer finishes handling the error.
      // This is helpful in case the developer forgets to reset UI
      // after handling signInFailure.
      if (self.currentComponent_) {
        self.currentComponent_.dispose();
        self.currentComponent_ = null;
      }
      // Rethrow the original error.
      throw error;
    });
  } else {
    // Rethrow all other non-merge conflict related errors.
    return goog.Promise.reject(error);
  }
};
