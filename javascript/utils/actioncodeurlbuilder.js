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
 * @fileoverview Defines a utility to add additional data to an
 * actioncodesettings URL related to email action code flows and the ability to
 * extract the data from a deep link.
 */

goog.provide('firebaseui.auth.ActionCodeUrlBuilder');

goog.require('goog.Uri');


/**
 * Defines a helper class to parse and edit continue URLs for
 * ActionCodeSettings. This is useful for setting additional parameters to the
 * continue URL and then parsing them back when the code is applied.
 * This utility helps abstract the underlying parameters used to store all
 * parameters of interest and how they are set on the URL.
 *
 * @param {string} url This is the continue URL passed to the ActionCodeSettings
 *     object and which on code application can be retrieved. The URL cannot be
 *     a relative URL.
 * @constructor
 */
firebaseui.auth.ActionCodeUrlBuilder = function(url) {
  /** @const @private {!goog.Uri} The corresponding parsed URI. */
  this.uri_ = goog.Uri.parse(url);
};


/** Clears all email link sign-in related parameters. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.clearState = function() {
  // Remove all related query parameters. Keep all other parameters.
  for (var key in firebaseui.auth.ActionCodeUrlBuilder.Parameter) {
    if (firebaseui.auth.ActionCodeUrlBuilder.Parameter.hasOwnProperty(key)) {
      this.uri_.removeParameter(
          firebaseui.auth.ActionCodeUrlBuilder.Parameter[key]);
    }
  }
};


/**
 * The action code URL builder reserved parameters used by FirebaseUI.
 *
 * @enum {string}
 */
firebaseui.auth.ActionCodeUrlBuilder.Parameter = {
  ANONYMOUS_UID: 'ui_auid',
  API_KEY: 'apiKey',
  FORCE_SAME_DEVICE: 'ui_sd',
  MODE: 'mode',
  OOB_CODE: 'oobCode',
  PROVIDER_ID: 'ui_pid',
  SESSION_ID: 'ui_sid'
};


/**
 * Sets the session ID on the URL.
 * @param {?string} sid The session identifier.
 */
firebaseui.auth.ActionCodeUrlBuilder.prototype.setSessionId = function(sid) {
  if (sid) {
    this.uri_.setParameterValue(
        firebaseui.auth.ActionCodeUrlBuilder.Parameter.SESSION_ID, sid);
  } else {
    this.uri_.removeParameter(
        firebaseui.auth.ActionCodeUrlBuilder.Parameter.SESSION_ID);
  }
};


/** @return {?string} The session ID. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.getSessionId = function() {
  return this.uri_.getParameterValue(
      firebaseui.auth.ActionCodeUrlBuilder.Parameter.SESSION_ID) || null;
};


/** @return {?string} The OOB code if available. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.getOobCode = function() {
  return this.uri_.getParameterValue(
      firebaseui.auth.ActionCodeUrlBuilder.Parameter.OOB_CODE) || null;
};


/** @return {?string} The email action mode if available. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.getMode = function() {
  return this.uri_.getParameterValue(
      firebaseui.auth.ActionCodeUrlBuilder.Parameter.MODE) || null;
};


/** @return {?string} The API key if available. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.getApiKey = function() {
  return this.uri_.getParameterValue(
      firebaseui.auth.ActionCodeUrlBuilder.Parameter.API_KEY) || null;
};


/**
 * Defines whether to force same device flow.
 * @param {?boolean} forceSameDevice Whether to force same device flow.
 */
firebaseui.auth.ActionCodeUrlBuilder.prototype.setForceSameDevice =
    function(forceSameDevice) {
  if (forceSameDevice !== null) {
    this.uri_.setParameterValue(
        firebaseui.auth.ActionCodeUrlBuilder.Parameter.FORCE_SAME_DEVICE,
        forceSameDevice ? '1': '0');
  } else {
    this.uri_.removeParameter(
        firebaseui.auth.ActionCodeUrlBuilder.Parameter.FORCE_SAME_DEVICE);
  }
};


/** @return {boolean} Whether to force same device flow. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.getForceSameDevice = function() {
  return this.uri_.getParameterValue(
      firebaseui.auth.ActionCodeUrlBuilder.Parameter.FORCE_SAME_DEVICE) === '1';
};


/**
 * Sets the UID of the anonymous user to upgrade.
 * @param {?string} anonymousUid The anonymous user to upgrade.
 */
firebaseui.auth.ActionCodeUrlBuilder.prototype.setAnonymousUid =
    function(anonymousUid) {
  if (anonymousUid) {
    this.uri_.setParameterValue(
        firebaseui.auth.ActionCodeUrlBuilder.Parameter.ANONYMOUS_UID,
        anonymousUid);
  } else {
    this.uri_.removeParameter(
        firebaseui.auth.ActionCodeUrlBuilder.Parameter.ANONYMOUS_UID);
  }
};


/** @return {?string} The anonymous UID of the user to upgrade. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.getAnonymousUid = function() {
  return this.uri_.getParameterValue(
      firebaseui.auth.ActionCodeUrlBuilder.Parameter.ANONYMOUS_UID)|| null;
};


/**
 * Sets the provider ID of the credential to link.
 * @param {?string} providerId The provider ID of the credential to link.
 */
firebaseui.auth.ActionCodeUrlBuilder.prototype.setProviderId =
    function(providerId) {
  if (providerId) {
    this.uri_.setParameterValue(
        firebaseui.auth.ActionCodeUrlBuilder.Parameter.PROVIDER_ID,
        providerId);
  } else {
    this.uri_.removeParameter(
        firebaseui.auth.ActionCodeUrlBuilder.Parameter.PROVIDER_ID);
  }
};


/** @return {?string} The provider ID of the credential to link if available. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.getProviderId = function() {
  return this.uri_.getParameterValue(
      firebaseui.auth.ActionCodeUrlBuilder.Parameter.PROVIDER_ID) || null;
};


/** @return {string} The URL string representation. */
firebaseui.auth.ActionCodeUrlBuilder.prototype.toString = function() {
  return this.uri_.toString();
};
