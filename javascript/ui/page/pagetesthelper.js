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
 * @fileoverview Helper class for testing document enter and exit events for
 * components.
 */

goog.provide('firebaseui.auth.ui.page.PageTestHelper');
goog.setTestOnly('firebaseui.auth.ui.page.PageTestHelper');

goog.require('firebaseui.auth.EventDispatcher');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('goog.events');


goog.scope(function() {
var page = firebaseui.auth.ui.page;


/**
 * Initializes page test helper.
 * @constructor
 */
page.PageTestHelper = function() {
  this.entered_ = false;
  this.exited_ = false;
  this.enteredEvent_ = null;
  this.exitedEvent_ = null;
};


/**
 * Resets page test helper state.
 */
page.PageTestHelper.prototype.resetState = function() {
  this.entered_ = false;
  this.exited_ = false;
  this.enteredEvent_ = null;
  this.exitedEvent_ = null;
};


/**
 * Sets page test helper container which is to be tested.
 * @param {Element} container The container to test.
 */
page.PageTestHelper.prototype.setContainer = function(container) {
  // Remove event listeners on previous container.
  if (this.dispatcher_) {
    goog.events.unlisten(
        this.dispatcher_,
        firebaseui.auth.ui.page.Base.EventType.PAGE_ENTER,
        goog.bind(page.PageTestHelper.prototype.onEnter_, this));
    goog.events.unlisten(
        this.dispatcher_,
        firebaseui.auth.ui.page.Base.EventType.PAGE_EXIT,
        goog.bind(page.PageTestHelper.prototype.onExit_, this));
    this.dispatcher_.unregister();
  }
  // Update container and add event listeners.
  this.dispatcher_ = new firebaseui.auth.EventDispatcher(container);
  this.dispatcher_.register();
  goog.events.listen(
      this.dispatcher_,
      firebaseui.auth.ui.page.Base.EventType.PAGE_ENTER,
      goog.bind(page.PageTestHelper.prototype.onEnter_, this));
  goog.events.listen(
      this.dispatcher_,
      firebaseui.auth.ui.page.Base.EventType.PAGE_EXIT,
      goog.bind(page.PageTestHelper.prototype.onExit_, this));
  this.resetState();
};


/**
 * On document enter event handler.
 * @param {Object} event The returned event object.
 * @private
 */
page.PageTestHelper.prototype.onEnter_ = function(event) {
  assertNotNullNorUndefined(event);
  assertEquals(firebaseui.auth.ui.page.Base.EventType.PAGE_ENTER, event.type);
  assertObjectEquals(this.dispatcher_.getElement(), event.target);
  this.entered_ = true;
  this.enteredEvent_ = event;
};


/**
 * On document exit event handler.
 * @param {Object} event The returned event object.
 * @private
 */
page.PageTestHelper.prototype.onExit_ = function(event) {
  assertNotNullNorUndefined(event);
  assertEquals(firebaseui.auth.ui.page.Base.EventType.PAGE_EXIT, event.type);
  assertObjectEquals(this.dispatcher_.getElement(), event.target);
  this.exited_ = true;
  this.exitedEvent_ = event;
};


/**
 * Asserts enter document event triggered.
 *
 * @param {?string} pageId The page id.
 */
page.PageTestHelper.prototype.assertEntered = function(pageId) {
  assertTrue(this.entered_);
  assertFalse(this.exited_);
  assertEquals(pageId, this.enteredEvent_['pageId']);
};


/**
 * Asserts exit document event triggered.
 *
 * @param {?string} pageId The page id.
 */
page.PageTestHelper.prototype.assertExited = function(pageId) {
  assertTrue(this.entered_);
  assertTrue(this.exited_);
  assertEquals(pageId, this.exitedEvent_['pageId']);
};


/**
 * Runs all page tests on current component to be rendered in specified
 * container.
 * @param {firebaseui.auth.ui.page.Base} component The page component to test.
 * @param {Element} container The container to test.
 */
page.PageTestHelper.prototype.runTests = function(component, container) {
  this.setContainer(container);
  component.render(container);
  this.assertEntered(component.getPageId());
  component.dispose();
  this.assertExited(component.getPageId());
  this.resetState();
};
});
