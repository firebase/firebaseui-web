/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview Send email link for sign in handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn');

goog.require('firebaseui.auth.ui.page.Callback');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles send email link for sign in.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} email The email address of the account.
 * @param {function()} onCancelClick Callback to invoke when the back button is
 *     clicked in email link sign in sent page.
 */
firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn = function(
    app, container, email, onCancelClick) {
  // Render the UI.
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn(
      app,
      component,
      email,
      onCancelClick,
      function(error) {
        component.dispose();
        if (error && error['code'] == 'auth/admin-restricted-operation' &&
            app.getConfig().isAdminRestrictedOperationConfigured()) {
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.UNAUTHORIZED_USER,
              app,
              container,
              email,
              firebase.auth.EmailAuthProvider.PROVIDER_ID);
        } else {
          // Error occurs while sending the email. Go back to the sign in page
          // with prefilled email and error message.
          const errorMessage =
              firebaseui.auth.widget.handler.common.getErrorMessage(error);
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.SIGN_IN,
              app,
              container,
              email,
              errorMessage);
        }
      });
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.SEND_EMAIL_LINK_FOR_SIGN_IN,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn));
