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
 * @fileoverview Anonymous user mismatch handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleAnonymousUserMismatch');

goog.require('firebaseui.auth.ui.page.AnonymousUserMismatch');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.requireType('firebaseui.auth.widget.Handler');


/**
 * Handles the anonymous user mismatch.
 * @param {!firebaseui.auth.AuthUI} app The current FirebaseUI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 */
firebaseui.auth.widget.handler.handleAnonymousUserMismatch = function(
    app, container) {
  // Render the UI.
  var component =
      new firebaseui.auth.ui.page.AnonymousUserMismatch(function() {
    component.dispose();
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
  });
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.ANONYMOUS_USER_MISMATCH,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleAnonymousUserMismatch));
