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
 * @fileoverview Fake utils for testing.
 */

goog.provide('firebaseui.auth.testing.FakeUtil');
goog.setTestOnly('firebaseui.auth.testing.FakeUtil');

goog.require('firebaseui.auth.util');
goog.require('goog.Disposable');
goog.require('goog.net.jsloader');
goog.require('goog.testing.PropertyReplacer');



/**
 * Fake utils class.
 * @constructor
 * @extends {goog.Disposable}
 */
firebaseui.auth.testing.FakeUtil = function() {
  firebaseui.auth.testing.FakeUtil.base(this, 'constructor');
  this.hasOpener_ = false;
  this.goToUrl_ = null;
  this.openerGoToUrl_ = null;
  this.closedWindow_ = null;
  this.popupUrl_ = null;
};
goog.inherits(firebaseui.auth.testing.FakeUtil, goog.Disposable);


/**
 * Installs the fake utils.
 * @return {!firebaseui.auth.testing.FakeUtil} The fake util.
 */
firebaseui.auth.testing.FakeUtil.prototype.install = function() {
  var r = this.replacer_ = new goog.testing.PropertyReplacer();
  var self = this;
  r.set(firebaseui.auth.util, 'goTo', function(url) {
    self.goToUrl_ = url;
  });
  r.set(firebaseui.auth.util, 'openerGoTo', function(url) {
    self.openerGoToUrl_ = url;
  });
  r.set(firebaseui.auth.util, 'hasOpener', function() {
    return !!self.hasOpener_;
  });
  r.set(firebaseui.auth.util, 'close', function(window) {
    self.closedWindow_ = window;
  });
  r.set(firebaseui.auth.util, 'popup', function(url) {
    self.popupUrl_ = url;
  });
  return this;
};


/** Removes the fake utils hooks. */
firebaseui.auth.testing.FakeUtil.prototype.uninstall = function() {
  assertNull('unexpected goTo', this.goToUrl_);
  assertNull('unexpected openerGoTo', this.openerGoToUrl_);
  assertNull('unexpected window close', this.closedWindow_);
  assertNull('unexpected popup window', this.popupUrl_);
  this.hasOpener_ = null;
  this.goToUrl_ = null;
  this.openerGoToUrl_ = null;
  this.closedWindow_ = null;
  this.popupUrl_ = null;
  if (this.replacer_) {
    this.replacer_.reset();
    this.replacer_ = null;
  }
};


/** @override */
firebaseui.auth.testing.FakeUtil.prototype.disposeInternal = function() {
  this.uninstall();
  firebaseui.auth.testing.FakeUtil.base(this, 'disposeInternal');
};


/**
 * @param {boolean} hasOpener Whether the current window has an opener.
 */
firebaseui.auth.testing.FakeUtil.prototype.setHasOpener = function(hasOpener) {
  this.hasOpener_ = hasOpener;
};


/**
 * Asserts the window location is set to the given URL.
 * @param {string} url The current location URL.
 */
firebaseui.auth.testing.FakeUtil.prototype.assertGoTo = function(url) {
  assertEquals(url, this.goToUrl_);
  this.goToUrl_ = null;
};


/**
 * Asserts the opener window location is set to the given URL.
 * @param {string} url The current location URL.
 */
firebaseui.auth.testing.FakeUtil.prototype.assertOpenerGoTo = function(url) {
  assertEquals(url, this.openerGoToUrl_);
  this.openerGoToUrl_ = null;
};


/**
 * Asserts a window is closed.
 * @param {!Window} window The closed window.
 */
firebaseui.auth.testing.FakeUtil.prototype.assertWindowClosed =
    function(window) {
  assertEquals(window, this.closedWindow_);
  this.closedWindow_ = null;
};


/**
 * Asserts a window is not closed.
 * @param {!Window} window The still open window.
 */
firebaseui.auth.testing.FakeUtil.prototype.assertWindowNotClosed =
    function(window) {
  assertNotEquals(window, this.closedWindow_);
};


/**
 * Asserts a popup window is opened, and the location is set to the URL.
 * @param {string} url The URL of the popup window.
 */
firebaseui.auth.testing.FakeUtil.prototype.assertPopupWindow = function(url) {
  assertEquals(url, this.popupUrl_);
  this.popupUrl_ = null;
};
