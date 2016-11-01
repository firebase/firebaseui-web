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
 * @fileoverview Utility to detect whether or not the user agent supports SNI
 * (Server Name Indication) which is needed for accountchooser.com.
 * See http://en.wikipedia.org/wiki/Server_Name_Indication for the list of user
 * agents that support SNI.
 */

goog.provide('firebaseui.auth.sni');


/**
 * RE for matching MSIE's user agent.
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_MSIE_UA_ = /MSIE ([\d.]+).*Windows NT ([\d.]+)/;


/**
 * RE for matching Firefox's user agent.
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_FIREFOX_UA_ = /Firefox\/([\d.]+)/;


/**
 * RE for matching Opera's user agent.
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_OPERA_UA_ =
    /Opera[ \/]([\d.]+)(.*Version\/([\d.]+))?/;


/**
 * RE for matching Chrome's user agent.
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_CHROME_UA_ = /Chrome\/([\d.]+)/;


/**
 * RE for matching Safari's user agent.
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_SAFARI_UA_ =
    /((Windows NT ([\d.]+))|(Mac OS X ([\d_]+))).*Version\/([\d.]+).*Safari/;


/**
 * RE for matching old Safari's user agent (Sarafi 1 & 2).
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_OLD_SAFARI_UA_ = /Mac OS X;.*(?!(Version)).*Safari/;


/**
 * RE for matching Android default browser's user agent.
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_ANDROID_UA_ = /Android ([\d.]+).*Safari/;


/**
 * RE for matching Mobile Safari's user agent.
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_MOBILE_SAFARI_UA_ =
    /OS ([\d_]+) like Mac OS X.*Mobile.*Safari/;


/**
 * RE for matching Konqueror's user agent.
 * @const {RegExp}
 * @private
 */
firebaseui.auth.sni.REGEX_KONQUEROR_UA_ = /Konqueror\/([\d.]+)/;


/**
 * RE for matching Mobile MSIE's user agent.
 * @private
 */
firebaseui.auth.sni.REGEX_MOBILE_MSIE_UA_ =
    /MSIE ([\d.]+).*Windows Phone OS ([\d.]+)/;



/**
 * Represents a version number for the user agent and platform.
 *
 * @param {string} version The version string.
 * @param {string=} opt_delimiter The delimiter which separates each components
 * of the version. Default is a dot '.'.
 * @constructor
 */
firebaseui.auth.sni.Version = function(version, opt_delimiter) {
  this.version_ = version;
  var parts = version.split(opt_delimiter || '.');
  this.components_ = [];
  for (var i = 0; i < parts.length; i++) {
    this.components_.push(parseInt(parts[i], 10));
  }
};


/**
 * Compares the version with another one.
 *
 * @param {firebaseui.auth.sni.Version|string} version The version to compare.
 * @return {number} -1, 0 or 1 if it's less than, equal to or greater than the
 *     other.
 */
firebaseui.auth.sni.Version.prototype.compare = function(version) {
  if (!(version instanceof firebaseui.auth.sni.Version)) {
    version = new firebaseui.auth.sni.Version(String(version));
  }
  var maxLength = Math.max(this.components_.length, version.components_.length);
  for (var i = 0; i < maxLength; i++) {
    var num1 = this.components_[i];
    var num2 = version.components_[i];
    if (num1 !== undefined && num2 !== undefined && num1 !== num2) {
      return num1 - num2;
    } else if (num1 === undefined) {
      return -1;
    } else if (num2 === undefined) {
      return 1;
    }
  }
  return 0;
};


/**
 * Checks the version is equal to or greater than another one.
 *
 * @param {firebaseui.auth.sni.Version|string} version The version to compare.
 * @return {boolean} {@code true} if it's equal to or greater than the other.
 */
firebaseui.auth.sni.Version.prototype.ge = function(version) {
  return this.compare(version) >= 0;
};


/**
 * Checks whether or not the user agent supports SNI.
 *
 * @param {string=} opt_userAgent The user agent string. If not provided,
 *     window.navigator.userAgent.
 * @return {boolean} {@code true} if SNI is supported.
 */
firebaseui.auth.sni.isSupported = function(opt_userAgent) {
  var ua = opt_userAgent || (window.navigator && window.navigator.userAgent);
  if (ua) {
    var result;
    if (result = ua.match(firebaseui.auth.sni.REGEX_OPERA_UA_)) {
      var version = new firebaseui.auth.sni.Version(result[3] || result[1]);
      // Opera Mini, No.
      if (ua.indexOf('Opera Mini') >= 0) {
        return false;
      }
      // Opera Mobile 10.1 or later on Android supports SNI.
      if (ua.indexOf('Opera Mobi') >= 0) {
        return ua.indexOf('Android') >= 0 && version.ge('10.1');
      }
      // Desktop Opera 8.0 or later suppports SNI.
      return version.ge('8.0');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_FIREFOX_UA_)) {
      // Firefox 2.0 or later supports SNI.
      return new firebaseui.auth.sni.Version(result[1]).ge('2.0');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_CHROME_UA_)) {
      // Chrome 6.0 or later supports SNI.
      return new firebaseui.auth.sni.Version(result[1]).ge('6.0');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_SAFARI_UA_)) {
      // Safari 2.1 or later on OS X 10.5.6 or higher and Windows Vista or
      // higher supports SNI.
      var version = new firebaseui.auth.sni.Version(result[6]);
      var winVersion = result[3] && new firebaseui.auth.sni.Version(result[3]);
      var osxVersion = result[5] &&
          new firebaseui.auth.sni.Version(result[5], '_');
      var platSupport = !!(winVersion && winVersion.ge('6.0')) ||
          !!(osxVersion && osxVersion.ge('10.5.6'));
      return platSupport && version.ge('3.0');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_ANDROID_UA_)) {
      // Android default browser on Android OS 3.0 or higher supports SNI.
      return new firebaseui.auth.sni.Version(result[1]).ge('3.0');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_MOBILE_SAFARI_UA_)) {
      // Mobile Safari on iOS 4.0 or higher supports SNI.
      return new firebaseui.auth.sni.Version(result[1], '_').ge('4.0');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_KONQUEROR_UA_)) {
      // Konqueror 4.7 or later supports SNI.
      return new firebaseui.auth.sni.Version(result[1]).ge('4.7');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_MOBILE_MSIE_UA_)) {
      // Mobile IE on WP7 supports SNI.
      var version = new firebaseui.auth.sni.Version(result[1]);
      var winVersion = new firebaseui.auth.sni.Version(result[2]);
      return version.ge('7.0') && winVersion.ge('7.0');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_MSIE_UA_)) {
      // Only IE7 or later on Windows Vista or higher supports SNI.
      var version = new firebaseui.auth.sni.Version(result[1]);
      var winVersion = new firebaseui.auth.sni.Version(result[2]);
      return version.ge('7.0') && winVersion.ge('6.0');
    } else if (result = ua.match(firebaseui.auth.sni.REGEX_OLD_SAFARI_UA_)) {
      // Old version Safari doesn't support SNI.
      return false;
    }
  }
  return true;
};
