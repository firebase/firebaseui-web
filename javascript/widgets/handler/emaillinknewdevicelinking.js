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
 * @fileoverview Email link sign-in new device provider linking handler used to
 * ask user for confirmation before continuing sign-in without linking.
 */

goog.provide('firebaseui.auth.widget.handler.handleEmailLinkNewDeviceLinking');

goog.require('firebaseui.auth.ActionCodeUrlBuilder');
goog.require('firebaseui.auth.ui.page.EmailLinkSignInLinkingDifferentDevice');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');


/**
 * Handles email confirmation when user opens a sign-in link on a different
 * device. The user is asked to provide their email before sign-in completion.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} link The link containing the OTP.
 * @param {function(!firebaseui.auth.AuthUI, !Element, string)} onContinue The
 *     callback to trigger when the user decides to sign-in without linking.
 */
firebaseui.auth.widget.handler.handleEmailLinkNewDeviceLinking = function(
    app, container, link, onContinue) {
  // Get provider ID initially intended to be linked.
  var urlBuilder = new firebaseui.auth.ActionCodeUrlBuilder(link);
  var providerId = urlBuilder.getProviderId();
  // Modify URL to exclude provider ID. This will be used to continue the flow
  // without linking.
  urlBuilder.setProviderId(null);
  // Assert provider ID available.
  if (!providerId) {
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
    return;
  }
  var component =
      new firebaseui.auth.ui.page.EmailLinkSignInLinkingDifferentDevice(
          app.getConfig().getConfigForProvider(providerId),
          // On continue, go back to callback page with URL not requiring
          // linking.
          function() {
            component.dispose();
            // Continue with the modified link not requiring linking.
            onContinue(app, container, urlBuilder.toString());
          },
          app.getConfig().getTosUrl(),
          app.getConfig().getPrivacyPolicyUrl());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.EMAIL_LINK_NEW_DEVICE_LINKING,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleEmailLinkNewDeviceLinking));
