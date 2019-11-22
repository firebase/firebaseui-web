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
 * @fileoverview Unsupported provider handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleUnsupportedProvider');

goog.require('firebaseui.auth.ui.page.UnsupportedProvider');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles unsupported provider.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} email The email address of the account.
 */
firebaseui.auth.widget.handler.handleUnsupportedProvider = function(
    app, container, email) {
  var component = new firebaseui.auth.ui.page.UnsupportedProvider(
      email,
      // On recover password button clicked.
      function() {
        component.dispose();
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.PASSWORD_RECOVERY,
            app,
            container,
            email);
      },
      // On back button click.
      function() {
        component.dispose();
        firebaseui.auth.widget.handler.common.handleSignInStart(
            app,
            container,
            email);
      },
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.UNSUPPORTED_PROVIDER,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleUnsupportedProvider));
