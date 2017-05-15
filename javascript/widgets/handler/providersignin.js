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
 * @fileoverview Start provider sign in handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleProviderSignIn');

goog.require('firebaseui.auth.ui.page.ProviderSignIn');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles provider sign in.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.handleProviderSignIn = function(
    app,
    container,
    opt_infoBarMessage) {
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      function(providerId) {
        // TODO: Consider deleting pending credentials on new sign in.
        if (providerId == firebase.auth.EmailAuthProvider.PROVIDER_ID) {
          // User clicks create password account button.
          component.dispose();
          // Handle sign in with email.
          firebaseui.auth.widget.handler.common.handleSignInWithEmail(
              app, container);
        } else if (providerId ==
                   firebase.auth.PhoneAuthProvider.PROVIDER_ID) {
          // User clicks sign in with phone number button.
          component.dispose();
          // Handle start sign in with phone number.
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.PHONE_SIGN_IN_START, app,
              container);
        } else {
          // User clicks other IdP.
          firebaseui.auth.widget.handler.common.federatedSignIn(
              /** @type {!firebaseui.auth.AuthUI} */ (app),
              component,
              providerId);
        }
      },
      app.getConfig().getProviders());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  // Show info bar if necessary.
  if (opt_infoBarMessage) {
    component.showInfoBar(opt_infoBarMessage);
  }
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.PROVIDER_SIGN_IN,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleProviderSignIn));
