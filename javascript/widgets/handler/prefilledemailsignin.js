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
 * @fileoverview Prefilled email sign in handler.
 */

goog.provide('firebaseui.auth.widget.handler.handlePrefilledEmailSignIn');

goog.require('firebaseui.auth.ui.page.Blank');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.requireType('goog.Promise');

/**
 * Handles sign-in with prefilled email flow. It's triggered when an email hint
 * is provided for sign-in. In this case, the sign-in screen is skipped.
 *
 * @param {?firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {?Element} container The container DOM element.
 * @param {string} email The prefilled email to pass to IdPs.
 */
firebaseui.auth.widget.handler.handlePrefilledEmailSignIn = function(
    app,
    container,
    email) {
  const component = new firebaseui.auth.ui.page.Blank();
    component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(app.getAuth().fetchSignInMethodsForEmail, app.getAuth())),
      [email],
      (signInMethods) => {
        signInMethods = /** @type {!Array<string>} */ (signInMethods);
        component.dispose();
        const displayFullTosPpMessage = !!(
            firebaseui.auth.widget.handler.common.isPasswordProviderOnly(app) &&
            app.getSignInEmailHint());
        firebaseui.auth.widget.handler.common
            .handleSignInFetchSignInMethodsForEmail(
                app,
                container,
                signInMethods,
                email,
                undefined,
                undefined,
                displayFullTosPpMessage);
      },
      (error) => {
        // The email provided could be an invalid one or some other error
        // could occur.
        const errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(
                error);
        component.dispose();
        firebaseui.auth.widget.handler.handle(
            firebaseui.auth.widget.HandlerName.SIGN_IN,
            app,
            container,
            email,
            errorMessage);
      }
  ));
};

// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.PREFILLED_EMAIL_SIGN_IN,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handlePrefilledEmailSignIn));
