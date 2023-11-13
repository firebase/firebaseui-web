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

/** @fileoverview UI component for the list of tenants to select from. */

goog.module('firebaseui.auth.ui.page.SelectTenant');
goog.module.declareLegacyNamespace();

const Base = goog.require('firebaseui.auth.ui.page.Base');
const DomHelper = goog.requireType('goog.dom.DomHelper');
const dataset = goog.require('goog.dom.dataset');
const element = goog.require('firebaseui.auth.ui.element');
const page = goog.require('firebaseui.auth.soy2.page');

/** UI component that displays a list of tenants to select from. */
class SelectTenant extends Base {
  /**
   * @param {function(?string)} onTenantClick Callback to invoke when the user
   *     clicks one tenant selection button.
   * @param {!Array<!Object>} tenantConfigs The button configs of the tenants
   *     to display.
   * @param {?function()=} tosCallback Optional callback to invoke when the
   *     ToS link is clicked.
   * @param {?function()=} privacyPolicyCallback Optional callback to invoke
   *     when the Privacy Policy link is clicked.
   * @param {?DomHelper=} domHelper Optional DOM helper.
   */
  constructor(
      onTenantClick, tenantConfigs, tosCallback = undefined,
      privacyPolicyCallback = undefined, domHelper = undefined) {
    super(
        page.selectTenant,
        {
          tenantConfigs: tenantConfigs,
        },
        domHelper,
        'selectTenant',
        {
          tosCallback: tosCallback,
          privacyPolicyCallback: privacyPolicyCallback,
        });
    this.onTenantClick_ = onTenantClick;
  }

  /** @override */
  enterDocument() {
    this.initTenantList_(this.onTenantClick_);
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onTenantClick_ = null;
    super.disposeInternal();
  }

  /**
   * Initializes tenant selection menu buttons.
   * @param {function(?string)} onClick Callback to invoke when the user clicks
   *     one tenant selection button.
   * @private
   */
  initTenantList_(onClick) {
    const buttons =
        this.getElementsByClass('firebaseui-id-tenant-selection-button');
    const cb = (tenantId, e) => {
      onClick(tenantId);
    };
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const tenantId = dataset.get(button, 'tenantId');
      element.listenForActionEvent(this, button, goog.partial(cb, tenantId));
    }
  }
}

exports = SelectTenant;
