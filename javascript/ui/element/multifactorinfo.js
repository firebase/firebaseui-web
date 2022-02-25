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
 * @fileoverview Binds handlers for multi factor info UI element.
 */

goog.provide('firebaseui.auth.ui.element.multiFactorInfo');
goog.provide('firebaseui.auth.ui.firebaseui.auth.multiFactorInfo');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.listBoxDialog');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.string');
goog.require('goog.ui.Component');



goog.scope(function() {
var element = firebaseui.auth.ui.element;


/**
 * @return {?Element}
 * @this {goog.ui.Component}
 * @private
 */
element.multiFactorInfo.getMFAInfoSelectorTextElement_ = function() {
  return this.getElementByClass('firebaseui-id-multi-factor-info-selector-text');
};


/**
 * @return {?Element}
 * @this {goog.ui.Component}
 */
element.multiFactorInfo.getMFAInfoSelectorElement = function() {
  return this.getElementByClass('firebaseui-id-multi-factor-info-selector');
};

/**
* @return {?Element} The error message element for the multi factor info input.
* @this {goog.ui.Component}
*/
element.multiFactorInfo.getMFAInfoErrorElement = function() {
  return this.getElementByClass('firebaseui-id-multi-factor-info-error');
};


/**
 * Initializes the phone number element.
 * @param {Array<firebase.auth.MultiFactorInfo>} mfaInfoList Multi factor info list.
 * @param {?string=} opt_mfaInfoUid The Uid of the mfa info to pre-select.
 * @this {goog.ui.Component}
 */
element.multiFactorInfo.initMultiFactorHintElement = function(mfaInfoList, opt_mfaInfoUid) {
  var self = this;
  var phoneNumberHintSelectorElement = element.multiFactorInfo.getMFAInfoSelectorElement
      .call(this);
  if (mfaInfoList.length == 0) {
    throw new Error('No available multi factor info.');
  }
  // // Selects the default mfa info.
  element.multiFactorInfo.selectDefaultMFAInfo_.call(
      self, mfaInfoList, opt_mfaInfoUid);

  // Initialize the mfa info selector button.
  element.listenForActionEvent(this, phoneNumberHintSelectorElement, function(e) {
    element.multiFactorInfo.handlePhoneNumberHintSelectorButtonClick_.call(
        self, mfaInfoList);
  });
};


/**
 * Selects the default country.
 * @param {Array<firebase.auth.MultiFactorInfo>} mfaInfoList Multi factor info list.
 * @param {?string=} opt_mfaInfoUid The Uid of the mfa info to pre-select.
 * @this {goog.ui.Component}
 * @private
 */
element.multiFactorInfo.selectDefaultMFAInfo_ = function(mfaInfoList, opt_mfaInfoUid) {
  element.multiFactorInfo.selectMFAInfo.call(this, opt_mfaInfoUid || mfaInfoList[0].uid, mfaInfoList);
};


/**
 * Converts the list of countries to a format recognized by the list box
 * component.
 * @param {Array<firebase.auth.MultiFactorInfo>} mfaInfoList Multi factor info list.
 * @return {!Array<!element.listBoxDialog.Item>}
 * @this {goog.ui.Component}
 * @private
 */
element.multiFactorInfo.createListBoxItemList_ = function(mfaInfoList) {
  return mfaInfoList.map(function(mfaInfo) {
    return {
      id: mfaInfo.uid,
      label: mfaInfo.phoneNumber || mfaInfo.displayName || '',
    };
  });
};


/**
 * Handles a selection in the country selector dialog.
 * @param {Array<firebase.auth.MultiFactorInfo>} mfaInfoList Multi factor info list.
 * @this {goog.ui.Component}
 * @private
 */
element.multiFactorInfo.handlePhoneNumberHintSelectorButtonClick_ =
    function(mfaInfoList) {
  var self = this;
  firebaseui.auth.ui.element.listBoxDialog.showListBoxDialog.call(this,
      element.multiFactorInfo.createListBoxItemList_(mfaInfoList),
      function(uid) {
        element.multiFactorInfo.selectMFAInfo.call(
            self, uid, mfaInfoList);
      }, this.selectedMFAInfoUid_);
};


/**
 * Changes the active country in the country selector.
 * @param {string} uid The ID of the country to select.
 * @param {Array<firebase.auth.MultiFactorInfo>} mfaInfoList Multi factor info list.
 * @this {goog.ui.Component}
 */
element.multiFactorInfo.selectMFAInfo = function(uid, mfaInfoList) {
  var mfaInfo = mfaInfoList.find((mfaInfo) => mfaInfo.uid === uid);
  if (!mfaInfo) {
    return;
  }
  this.selectedMFAInfoUid_ = uid;
  var buttonDisplayText = mfaInfo.phoneNumber || mfaInfo.displayName || '';
  goog.dom.setTextContent(
      element.multiFactorInfo.getMFAInfoSelectorTextElement_.call(this),
      buttonDisplayText);
};

/**
 * @param {Array<firebase.auth.MultiFactorInfo>} mfaInfoList Multi factor info list.
 * @return {?firebase.auth.MultiFactorInfo} Selected mfa info.
 * @this {goog.ui.Component}
 */
element.multiFactorInfo.getMFAInfoValue = function(mfaInfoList) {
  var mfaInfo = mfaInfoList.find((mfaInfo) => mfaInfo.uid === this.selectedMFAInfoUid_);
  if (!mfaInfo) {
    return null;
  }
  return mfaInfo;
}
});
