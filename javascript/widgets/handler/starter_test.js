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
 * @fileoverview Tests for sign in button handler.
 */

goog.provide('firebaseui.auth.widget.handler.widgetSelectorTest');
goog.setTestOnly('firebaseui.auth.widget.handler.widgetSelectorTest');

/** @suppress {extraRequire} */
goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.widget.handler.startSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.testHelper');


/** Tests startSignIn in redirect mode. */
function testHandleStartSignIn_redirect() {
  // Set popup mode to false.
  app.setConfig({'popupMode': false});
  // Start sign in.
  firebaseui.auth.widget.handler.startSignIn(app);
  // This should redirect to sign in widget.
  testUtil.assertGoTo('http://localhost/firebaseui-widget?mode=select');
}


/** Tests startSignIn in popup mode. */
function testHandleSignInButton_popup() {
  if (firebaseui.auth.util.isMobileBrowser()) {
    // Mobile browsers cannot use popup mode (it is enforced to false by the
    // config).
    return;
  }
  // Set popup mode to true.
  app.setConfig({'popupMode': true});
  // Start sign in.
  firebaseui.auth.widget.handler.startSignIn(app);
  // This should popup sign in widget.
  testUtil.assertPopupWindow('http://localhost/firebaseui-widget?mode=select');
}

