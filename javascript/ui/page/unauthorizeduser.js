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
 * @fileoverview UI component for the unauthorized user page.
 */

goog.module('firebaseui.auth.ui.page.UnauthorizedUser');
goog.module.declareLegacyNamespace();

const Base = goog.require('firebaseui.auth.ui.page.Base');
const DomHelper = goog.requireType('goog.dom.DomHelper');
const element = goog.require('firebaseui.auth.ui.element');
const form = goog.require('firebaseui.auth.ui.element.form');
const page = goog.require('firebaseui.auth.soy2.page');

/**
 * Unauthorized user page UI component.
 */
class UnauthorizedUser extends Base {
  /**
   * @param {?string} userIdentifier The user identifier of the account, can be
   *     email address or phone number.
   * @param {function()} onCancelClick Callback to invoke when the back button
   *     is clicked.
   * @param {?string=} adminEmail The admin email to contact with.
   * @param {?function()=} emailHelperCallback Callback to invoke when the
   *     email helper link is clicked.
   * @param {?function()=} tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} privacyPolicyCallback Callback to invoke when the
   *     Privacy Policy link is clicked.
   * @param {?DomHelper=} domHelper Optional DOM helper.
   */
  constructor(
      userIdentifier, onCancelClick, adminEmail, emailHelperCallback,
      tosCallback, privacyPolicyCallback, domHelper) {
    super(
        page.unauthorizedUser,
        {
          userIdentifier: userIdentifier,
          adminEmail: adminEmail,
          displayHelpLink: !!emailHelperCallback
        },
        domHelper, 'unauthorizedUser', {
          tosCallback: tosCallback,
          privacyPolicyCallback: privacyPolicyCallback,
        });
    this.onCancelClick_ = onCancelClick;
    this.onEmailHelperClick_ = emailHelperCallback;
  }

  /** @override */
  enterDocument() {
    const self = this;
    const helpLink = this.getHelpLink();
    if (this.onEmailHelperClick_ && helpLink) {
      // Handle help link click.
      element.listenForActionEvent(
          this, helpLink, function() {
            self.onEmailHelperClick_();
          });
    }

    // Handle cancel button link click.
    element.listenForActionEvent(
        this, this.getSecondaryLinkElement(), function() {
          self.onCancelClick_();
        });
    this.setupFocus_();
    super.enterDocument();
  }

  /** @override */
  disposeInternal() {
    this.onCancelClick_ = null;
    this.onEmailHelperClick_ = null;
    super.disposeInternal();
  }

  /**
   * Set up auto focus on cancel button.
   * @private
   */
  setupFocus_() {
    this.getSecondaryLinkElement().focus();
  }

  /**
   * @return {?Element} The help link.
   */
  getHelpLink() {
    return this.getElementByClass('firebaseui-id-unauthorized-user-help-link');
  }
}

goog.mixin(
    UnauthorizedUser.prototype,
    /** @lends {UnauthorizedUser.prototype} */
    {
      // For form.
      getSecondaryLinkElement: form.getSecondaryLinkElement
    });

exports = UnauthorizedUser;
