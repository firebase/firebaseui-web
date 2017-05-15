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
 * @fileoverview Handler registration and dispatching.
 */

goog.provide('firebaseui.auth.widget.Handler');
goog.provide('firebaseui.auth.widget.HandlerName');
goog.provide('firebaseui.auth.widget.handler');

goog.require('goog.asserts');

goog.forwardDeclare('firebaseui.auth.AuthUI');



/**
 * Handler names.
 * @enum {string}
 */
firebaseui.auth.widget.HandlerName = {
  SIGN_IN: 'signIn',
  PASSWORD_SIGN_IN: 'passwordSignIn',
  PASSWORD_SIGN_UP: 'passwordSignUp',
  PASSWORD_RECOVERY: 'passwordRecovery',
  CALLBACK: 'callback',
  PASSWORD_LINKING: 'passwordLinking',
  PHONE_SIGN_IN_FINISH: 'phoneSignInFinish',
  PHONE_SIGN_IN_START: 'phoneSignInStart',
  FEDERATED_LINKING: 'federatedLinking',
  FEDERATED_SIGN_IN: 'federatedSignIn',
  EMAIL_CHANGE_REVOCATION: 'emailChangeRevocation',
  EMAIL_VERIFICATION: 'emailVerification',
  PASSWORD_RESET: 'passwordReset',
  EMAIL_MISMATCH: 'emailMismatch',
  PROVIDER_SIGN_IN: 'providerSignIn'
};


/**
 * @typedef {!function(Element, ...*)}
 */
firebaseui.auth.widget.Handler;


/**
 * Registered handlers.
 * @type {!Object.<firebaseui.auth.widget.HandlerName,
 *     firebaseui.auth.widget.Handler>}
 * @private
 */
firebaseui.auth.widget.handlers_ = {};


/**
 * Registers a handler.
 * @param {firebaseui.auth.widget.HandlerName} name The handler name.
 * @param {firebaseui.auth.widget.Handler} handler The handler function.
 * @package
 */
firebaseui.auth.widget.handler.register = function(name, handler) {
  firebaseui.auth.widget.handlers_[name] = handler;
};


/**
 * Invokes a handler by the given name.
 * @param {firebaseui.auth.widget.HandlerName} name The handler name.
 * @param {firebaseui.auth.AuthUI} app The Firebase UI instance.
 * @param {Element} container The container DOM element for the handler.
 * @param {...*} var_args The handler-specific arguments.
 */
firebaseui.auth.widget.handler.handle =
    function(name, app, container, var_args) {
  var handler = firebaseui.auth.widget.handlers_[name];
  goog.asserts.assertFunction(handler);
  handler.apply(null, Array.prototype.slice.call(arguments, 1));
};
