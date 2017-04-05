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
 * @fileoverview Start sign in handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleSignIn');

goog.require('firebaseui.auth.ui.page.SignIn');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles start sign in.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string=} opt_email The email to prefill.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.handleSignIn = function(
    app, container, opt_email, opt_infoBarMessage) {
  // Render the UI.
  var component = new firebaseui.auth.ui.page.SignIn(
      // On submit.
      function() {
        firebaseui.auth.widget.handler.onSignInEmailEnter_(app, component);
      },
      // On cancel.
      function() {
        // Downside is if only email auth provider is selected and
        // accountchooser.com is disabled, the cancel button will do nothing.
        // Future improvement would be to not display this button in that
        // edge case.
        component.dispose();
        firebaseui.auth.widget.handler.common.handleSignInStart(
            app, container, opt_email);
      },
      opt_email);
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  // Show info bar if necessary.
  if (opt_infoBarMessage) {
    component.showInfoBar(opt_infoBarMessage);
  }
};


/**
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {firebaseui.auth.ui.page.SignIn} component The UI component.
 * @private
 */
firebaseui.auth.widget.handler.onSignInEmailEnter_ = function(app, component) {
  var email = component.checkAndGetEmail() || '';
  if (!email) {
    return;
  }
  firebaseui.auth.widget.handler.common.handleStartEmailFirstFlow(
      app, component, email);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.SIGN_IN,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleSignIn));
