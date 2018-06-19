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
 * @fileoverview Password sign in handler.
 */

goog.provide('firebaseui.auth.widget.handler.handlePasswordSignIn');

goog.require('firebaseui.auth.ui.page.PasswordSignIn');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles password sign in.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string=} opt_email The email address of the account.
 * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
 *     message of Term of Service and Privacy Policy.
 */
firebaseui.auth.widget.handler.handlePasswordSignIn = function(
    app, container, opt_email, opt_displayFullTosPpMessage) {
  // Render the UI.
  var component = new firebaseui.auth.ui.page.PasswordSignIn(
      // On submit.
      function() {
        firebaseui.auth.widget.handler.common.verifyPassword(app, component);
      },
      // On recover password link click.
      function() {
        var email = component.getEmail();
        component.dispose();
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.PASSWORD_RECOVERY, app,
            container, email);
      },
      opt_email,
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl(),
      opt_displayFullTosPpMessage);
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.PASSWORD_SIGN_IN,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handlePasswordSignIn));
