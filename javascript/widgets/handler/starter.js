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
 * @fileoverview Handler for start sign in.
 */

goog.provide('firebaseui.auth.widget.handler.startSignIn');

goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.handler');

goog.forwardDeclare('firebaseui.auth.AuthUI');


/**
 * Triggers the sign in flow.
 *
 * @param {firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 */
firebaseui.auth.widget.handler.startSignIn = function(app) {
  var selectUrl = app.getConfig().getRequiredWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  if (app.getConfig().getPopupMode()) {
    firebaseui.auth.util.popup(selectUrl);
  } else {
    firebaseui.auth.util.goTo(selectUrl);
  }
};
