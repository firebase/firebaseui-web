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
 * @fileoverview UI component for the list of supported identity providers.
 */

goog.provide('firebaseui.auth.ui.page.ProviderSignIn');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element.idps');
goog.require('firebaseui.auth.ui.element.tospp');
goog.require('firebaseui.auth.ui.page.Base');



/**
 * UI component that displays a list of supported identity providers.
 * @param {function(string)} onIdpClick Callback to invoke when the user clicks
 *     one IdP button.
 * @param {!Array<string>} providerIds The provider IDs of the IdPs to display.
 * @param {?string=} opt_tosUrl The ToS URL.
 * @param {?string=} opt_privacyPolicyUrl The Privacy Policy URL.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.ProviderSignIn = function(
    onIdpClick,
    providerIds,
    opt_tosUrl,
    opt_privacyPolicyUrl,
    opt_domHelper) {
  firebaseui.auth.ui.page.ProviderSignIn.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.providerSignIn,
      {
        providerIds: providerIds
      },
      opt_domHelper,
      'providerSignIn',
      {
        tosUrl: opt_tosUrl,
        privacyPolicyUrl: opt_privacyPolicyUrl
      });
  this.onIdpClick_ = onIdpClick;
};
goog.inherits(firebaseui.auth.ui.page.ProviderSignIn,
    firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.ProviderSignIn.prototype.enterDocument = function() {
  this.initIdpList(this.onIdpClick_);
  firebaseui.auth.ui.page.ProviderSignIn.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.ProviderSignIn.prototype.disposeInternal = function() {
  this.onIdpClick_ = null;
  firebaseui.auth.ui.page.ProviderSignIn.base(this, 'disposeInternal');
};


goog.mixin(
    firebaseui.auth.ui.page.ProviderSignIn.prototype,
    /** @lends {firebaseui.auth.ui.page.ProviderSignIn.prototype} */
    {
      // For idps.
      initIdpList:
          firebaseui.auth.ui.element.idps.initIdpList,

      // For ToS and Privacy Policy.
      getTosPpElement:
          firebaseui.auth.ui.element.tospp.getTosPpElement,
      getTosLinkElement:
          firebaseui.auth.ui.element.tospp.getTosLinkElement,
      getPpLinkElement:
          firebaseui.auth.ui.element.tospp.getPpLinkElement,
      getTosPpListElement:
          firebaseui.auth.ui.element.tospp.getTosPpListElement
    });
