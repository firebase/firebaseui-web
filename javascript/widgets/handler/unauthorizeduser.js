/*
 * Copyright 2021 Google Inc. All Rights Reserved.
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
 * @fileoverview Unauthorized user handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleUnauthorizedUser');

goog.require('firebaseui.auth.ui.page.UnauthorizedUser');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles unauthorized users.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {?string} userIdentifier The user identifier of the account, can be
 *     email address or phone number. When not determinable (federated sign-in
 *     flows), this is null.
 * @param {?string} provider The provider used for sign-in, if determinable
 *     (null otherwise).
 */
firebaseui.auth.widget.handler.handleUnauthorizedUser = function(
    app, container, userIdentifier, provider) {
  let backCallbackFunction = function () {
      firebaseui.auth.widget.handler.common.handleSignInStart(
          app, container);
  };
  // Defines the backCallbackFunction.
  if (provider === firebase.auth.EmailAuthProvider.PROVIDER_ID) {
    // Email password or Email link.
    backCallbackFunction = function() {
      // Go back to start email sign in handler.
      firebaseui.auth.widget.handler.common.handleSignInWithEmail(
          app, container);
    };
  } else if (provider === firebase.auth.PhoneAuthProvider.PROVIDER_ID) {
    // Phone provider.
    backCallbackFunction = function() {
      // Go back to start email sign in handler.
      firebaseui.auth.widget.handler.handle(
          firebaseui.auth.widget.HandlerName.PHONE_SIGN_IN_START,
          app, container);
    };
  }

  let adminEmail = null;
  let helpLinkCallBack = null;

  // There are two scenarios this handler gets called that we need to configure
  // adminEmail and helpLinkCallBack accordingly.
  // The first case is in the higher priority:
  // 1. Email/password or Email Link provider and emailSignUpDisabled status set
  // to true.
  // 2. AdminRestrictedOperation status set to true.
  if (provider === firebase.auth.EmailAuthProvider.PROVIDER_ID &&
      app.getConfig().isEmailSignUpDisabled()) {
    adminEmail = app.getConfig().getEmailProviderAdminEmail();
    helpLinkCallBack = app.getConfig().getEmailProviderHelpLinkCallBack();
  } else if (app.getConfig().isAdminRestrictedOperationConfigured()) {
    adminEmail = app.getConfig().getAdminRestrictedOperationAdminEmail();
    helpLinkCallBack =
        app.getConfig().getAdminRestrictedOperationHelpLinkCallback();
  }

  const component = new firebaseui.auth.ui.page.UnauthorizedUser(
      userIdentifier,
      function () {
        component.dispose();
        backCallbackFunction();
      },
      adminEmail,
      helpLinkCallBack,
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.UNAUTHORIZED_USER,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleUnauthorizedUser));
