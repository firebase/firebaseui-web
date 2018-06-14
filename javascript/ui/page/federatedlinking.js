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
 * @fileoverview UI component for the federated account linking page.
 */

goog.provide('firebaseui.auth.ui.page.FederatedLinking');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.tospp');
goog.require('firebaseui.auth.ui.page.Base');



/**
 * Federated account linking UI component.
 * @param {string} email The user's email.
 * @param {string} providerId The provider ID of the IdP we should use for sign
 *     in.
 * @param {function()} onSubmitClick Callback to invoke when the submit button
 *     is clicked.
 * @param {?string=} opt_tosUrl The ToS URL.
 * @param {?string=} opt_privacyPolicyUrl The Privacy Policy URL.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {firebaseui.auth.ui.page.Base}
 */
firebaseui.auth.ui.page.FederatedLinking = function(
    email,
    providerId,
    onSubmitClick,
    opt_tosUrl,
    opt_privacyPolicyUrl,
    opt_domHelper) {
  firebaseui.auth.ui.page.FederatedLinking.base(
      this,
      'constructor',
      firebaseui.auth.soy2.page.federatedLinking,
      {
        email: email,
        providerId: providerId
      },
      opt_domHelper,
      'federatedLinking',
      {
        tosUrl: opt_tosUrl,
        privacyPolicyUrl: opt_privacyPolicyUrl
      });
  this.onSubmitClick_ = onSubmitClick;
};
goog.inherits(firebaseui.auth.ui.page.FederatedLinking,
    firebaseui.auth.ui.page.Base);


/** @override */
firebaseui.auth.ui.page.FederatedLinking.prototype.enterDocument = function() {
  this.initFormElement(this.onSubmitClick_);
  this.getSubmitElement().focus();
  firebaseui.auth.ui.page.FederatedLinking.base(this, 'enterDocument');
};


/** @override */
firebaseui.auth.ui.page.FederatedLinking.prototype.disposeInternal =
    function() {
  this.onSubmitClick_ = null;
  firebaseui.auth.ui.page.FederatedLinking.base(this, 'disposeInternal');
};


goog.mixin(
    firebaseui.auth.ui.page.FederatedLinking.prototype,
    /** @lends {firebaseui.auth.ui.page.FederatedLinking.prototype} */
    {
      // For form.
      getSubmitElement:
          firebaseui.auth.ui.element.form.getSubmitElement,
      initFormElement:
          firebaseui.auth.ui.element.form.initFormElement,

      // For tos pp.
      getTosPpElement:
          firebaseui.auth.ui.element.tospp.getTosPpElement,
      getTosLinkElement:
          firebaseui.auth.ui.element.tospp.getTosLinkElement,
      getPpLinkElement:
          firebaseui.auth.ui.element.tospp.getPpLinkElement,
      getTosPpListElement:
          firebaseui.auth.ui.element.tospp.getTosPpListElement
    });
