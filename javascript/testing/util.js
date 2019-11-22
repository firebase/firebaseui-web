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

goog.module('firebaseui.auth.testing.FakeUtil');
goog.module.declareLegacyNamespace();
goog.setTestOnly();

var Disposable = goog.require('goog.Disposable');
var PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
var util = goog.require('firebaseui.auth.util');


/**
 * Fake utils class.
 */
class FakeUtil extends Disposable {
  constructor() {
    super();
    this.hasOpener_ = false;
    this.goToUrl_ = null;
    this.openerGoToUrl_ = null;
    this.closedWindow_ = null;
    this.popupUrl_ = null;
    this.openUrl_ = null;
    this.windowName_ = null;
    this.lastHistoryState_ = null;
    this.lastHistoryTitle_ = null;
    this.lastHistoryUrl_ = null;
  }

  /**
   * Installs the fake utils.
   * @return {!FakeUtil} The fake util.
   */
  install() {
    var r = this.replacer_ = new PropertyReplacer();
    var self = this;
    r.set(util, 'goTo', function(url) {
      self.goToUrl_ = url;
    });
    r.set(util, 'openerGoTo', function(url) {
      self.openerGoToUrl_ = url;
    });
    r.set(util, 'hasOpener', function() {
      return !!self.hasOpener_;
    });
    r.set(util, 'close', function(window) {
      self.closedWindow_ = window;
    });
    r.set(util, 'popup', function(url) {
      self.popupUrl_ = url;
    });
    r.set(util, 'open', function(url, windowName) {
      self.openUrl_ = url;
      self.windowName_ = windowName;
    });
    r.set(util, 'replaceHistoryState', function(state, title, url) {
      self.lastHistoryState_ = state;
      self.lastHistoryTitle_ = title;
      self.lastHistoryUrl_ = url;
    });
    return this;
  }

  /** Removes the fake utils hooks. */
  uninstall() {
    assertNull('unexpected goTo', this.goToUrl_);
    assertNull('unexpected openerGoTo', this.openerGoToUrl_);
    assertNull('unexpected window close', this.closedWindow_);
    assertNull('unexpected popup window', this.popupUrl_);
    assertNull('unexpected replaceHistoryState', this.lastHistoryUrl_);
    this.hasOpener_ = null;
    this.goToUrl_ = null;
    this.openerGoToUrl_ = null;
    this.closedWindow_ = null;
    this.popupUrl_ = null;
    if (this.replacer_) {
      this.replacer_.reset();
      this.replacer_ = null;
    }
    this.lastHistoryState_ = null;
    this.lastHistoryTitle_ = null;
    this.lastHistoryUrl_ = null;
  }

  /** @override */
  disposeInternal() {
    this.uninstall();
    super.disposeInternal();
  }

  /**
   * @param {boolean} hasOpener Whether the current window has an opener.
   */
  setHasOpener(hasOpener) {
    this.hasOpener_ = hasOpener;
  }

  /**
   * Asserts the window location is set to the given URL.
   * @param {string} url The current location URL.
   */
  assertGoTo(url) {
    assertEquals(url, this.goToUrl_);
    this.goToUrl_ = null;
  }

  /**
   * Asserts the opener window location is set to the given URL.
   * @param {string} url The current location URL.
   */
  assertOpenerGoTo(url) {
    assertEquals(url, this.openerGoToUrl_);
    this.openerGoToUrl_ = null;
  }

  /**
   * Asserts the given URL is loaded in the given window.
   * @param {string} url The URL to be loaded.
   * @param {string} windowName The window name to be loaded into.
   */
  assertOpen(url, windowName) {
    assertEquals(url, this.openUrl_);
    assertEquals(windowName, this.windowName_);
    this.openUrl_ = null;
    this.windowName_ = null;
  }

  /**
   * Asserts a window is closed.
   * @param {!Window} window The closed window.
   */
  assertWindowClosed(window) {
    assertEquals(window, this.closedWindow_);
    this.closedWindow_ = null;
  }

  /**
   * Asserts a window is not closed.
   * @param {!Window} window The still open window.
   */
  assertWindowNotClosed(window) {
    assertNotEquals(window, this.closedWindow_);
  }

  /**
   * Asserts a popup window is opened, and the location is set to the URL.
   * @param {string} url The URL of the popup window.
   */
  assertPopupWindow(url) {
    assertEquals(url, this.popupUrl_);
    this.popupUrl_ = null;
  }

  /**
   * Asserts replaceHistoryState is called with provided history state.
   * @param {!Object} state The last history state to assert.
   * @param {string} title The associated document title.
   * @param {string} url The associated URL.
   */
  assertReplaceHistoryState(state, title, url) {
    assertObjectEquals(state, this.lastHistoryState_);
    assertEquals(title, this.lastHistoryTitle_);
    assertEquals(url, this.lastHistoryUrl_);
    this.lastHistoryState_ = null;
    this.lastHistoryTitle_ = null;
    this.lastHistoryUrl_ = null;
  }
}


exports = FakeUtil;
