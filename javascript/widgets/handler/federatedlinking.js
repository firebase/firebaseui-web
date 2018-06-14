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
 * @fileoverview Federated account linking handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleFederatedLinking');

goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.page.FederatedLinking');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');




/**
 * Handles the case where the user had previously signed in with a federated
 * IdP but is now trying to sign in with a different IdP that is not the
 * authoritative IdP. Have the user sign in with the original IdP, and then
 * link the accounts.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {string} email The user's email.
 * @param {string} providerId The providerId corresponding to the email that the
 *     user should use to sign in.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.handleFederatedLinking = function(
    app, container, email, providerId, opt_infoBarMessage) {
  var pendingEmailCredential =
      firebaseui.auth.storage.getPendingEmailCredential(app.getAppId());
  var pendingCredential =
      pendingEmailCredential && pendingEmailCredential.getCredential();
  if (!pendingCredential) {
    // If no pending credential, it's an error and the user should be redirected
    // to the sign-in page.
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
    return;
  }
  var component = new firebaseui.auth.ui.page.FederatedLinking(
      email,
      providerId,
      // On submit.
      function() {
        // We sign in the user through the normal federated sign-in flow,
        // and the callback handler will take care of linking the
        // pending credential to the successfully signed in user.
        // Pass the email since some OAuth providers support OAuth flow
        // with a specified email.
        firebaseui.auth.widget.handler.common.federatedSignIn(app, component,
            providerId, email);
      },
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl());
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
    firebaseui.auth.widget.HandlerName.FEDERATED_LINKING,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleFederatedLinking));
