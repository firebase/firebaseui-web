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
 * @fileoverview Federated redirect handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleFederatedRedirect');

goog.require('firebaseui.auth.ui.page.Blank');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('goog.asserts');


/**
 * Handles federated redirect sign in. This is intended to be used when there
 * is a single federated provider and instead of showing the ‘nascar’ buttons
 * sign-in screen, the developer would like to immediately redirect to the
 * provider’s site.
 *
 * @param {?firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {?Element} container The container DOM element.
 * @param {string=} email The optional prefilled email to pass to IdPs.
 * @throws {!goog.asserts.AssertionError} Thrown if there is more than one
 *     provider.
 */
firebaseui.auth.widget.handler.handleFederatedRedirect = function(
    app,
    container,
    email = undefined) {
  var component = new firebaseui.auth.ui.page.Blank();
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  // There should only be one federated provider here because this handler
  // is only designed to be called in this situation.
  goog.asserts.assert(
      app.getConfig().federatedProviderShouldImmediatelyRedirect());
  var providerId = app.getConfig().getProviders()[0];
  // Immediately start the redirect.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      /** @type {!firebaseui.auth.AuthUI} */ (app),
      component,
      providerId,
      email);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.FEDERATED_REDIRECT,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleFederatedRedirect));
