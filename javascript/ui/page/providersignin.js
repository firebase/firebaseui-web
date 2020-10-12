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

/** @fileoverview UI component for the list of supported identity providers. */

goog.module('firebaseui.auth.ui.page.ProviderSignIn');
goog.module.declareLegacyNamespace();

const Base = goog.require('firebaseui.auth.ui.page.Base');
const DomHelper = goog.requireType('goog.dom.DomHelper');
const idps = goog.require('firebaseui.auth.ui.element.idps');
const page = goog.require('firebaseui.auth.soy2.page');

/** UI component that displays a list of supported identity providers. */
class ProviderSignIn extends Base {
  /**
   * @param {function(string)} onIdpClick Callback to invoke when the user
   *     clicks one IdP button.
   * @param {!Array<!Object>} providerConfigs The provider configs of the IdPs
   *     to display.
   * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when
   *     the Privacy Policy link is clicked.
   * @param {?DomHelper=} domHelper Optional DOM helper.
   */
  constructor(
      onIdpClick, providerConfigs, opt_tosCallback, opt_privacyPolicyCallback,
      domHelper = undefined) {
    super(
        page.providerSignIn,
        {providerConfigs: providerConfigs}, domHelper, 'providerSignIn', {
          tosCallback: opt_tosCallback,
          privacyPolicyCallback: opt_privacyPolicyCallback,
        });
    this.onIdpClick_ = onIdpClick;
  }

  /** @override */
  enterDocument() {
    this.initIdpList(this.onIdpClick_);
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onIdpClick_ = null;
    super.disposeInternal();
  }
}

goog.mixin(
    ProviderSignIn.prototype,
    /** @lends {ProviderSignIn.prototype} */
    {
      // For idps.
      initIdpList: idps.initIdpList,
    });

exports = ProviderSignIn;
