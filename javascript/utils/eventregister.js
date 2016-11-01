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
 * @fileoverview Utils for custom event dispatchers and registers on DOM since
 * native custom events are not supported in IE8.
 */

goog.provide('firebaseui.auth.EventDispatcher');
goog.provide('firebaseui.auth.EventRegister');

goog.require('goog.events.EventTarget');



/**
 * @private {!Object.<number, Array<firebaseui.auth.EventDispatcher>>} The map
 *     of elements to their corresponding event dispatchers.
 */
firebaseui.auth.EventRegister.map_ = {};


/**
 * @private {number} The counter of unique elements.
 */
firebaseui.auth.EventRegister.counter_ = 0;


/**
 * Dispatches a custom event on the element provided. If a dispatcher is
 * available for that element, it will be used to trigger that event.
 * @param {!Element} el The element which event dispatcher would trigger event.
 * @param {goog.events.Event|Object|string} evt The event object.
 */
firebaseui.auth.EventRegister.dispatchEvent = function(el, evt) {
  if (!el) {
     throw new Error('Event target element must be provided!');
  }
  var key = firebaseui.auth.EventRegister.getKey_(el);
  if (firebaseui.auth.EventRegister.map_[key] &&
     firebaseui.auth.EventRegister.map_[key].length) {
    for (var i = 0; i < firebaseui.auth.EventRegister.map_[key].length; i++) {
      firebaseui.auth.EventRegister.map_[key][i].dispatchEvent(evt);
    }
  }
};


/**
 * Registers a dispatcher for event dispatching.
 * @param {firebaseui.auth.EventDispatcher} dispatcher The event dispatcher
 *     object.
 */
firebaseui.auth.EventRegister.register = function(dispatcher) {
  var key = firebaseui.auth.EventRegister.getKey_(dispatcher.getElement());
  // Add the dispatcher in a map keyed by element ID, do not duplicate.
  if (!firebaseui.auth.EventRegister.map_[key]) {
    // New element.
    firebaseui.auth.EventRegister.map_[key] = [dispatcher];
  } else if (!goog.array.contains(
      /** @type {!Array<firebaseui.auth.EventDispatcher>} */ (
          firebaseui.auth.EventRegister.map_[key]),
      dispatcher)) {
    // Element found, make sure no duplicate dispatcher in element array before
    // adding.
    firebaseui.auth.EventRegister.map_[key].push(dispatcher);
  }
};


/**
 * Unregisters a dispatcher from event dispatching.
 * @param {firebaseui.auth.EventDispatcher} dispatcher The event dispatcher
 *     object.
 */
firebaseui.auth.EventRegister.unregister = function(dispatcher) {
  var key = firebaseui.auth.EventRegister.getKey_(dispatcher.getElement());
  // Look up dispatchers for element requested, remove the requested dispatcher
  // from array if found.
  if (firebaseui.auth.EventRegister.map_[key] &&
      firebaseui.auth.EventRegister.map_[key].length) {
    goog.array.removeIf(
        /** @type {!Array<firebaseui.auth.EventDispatcher>} */ (
          firebaseui.auth.EventRegister.map_[key]),
        function(current) {
          return current == dispatcher;
        });
    // No more dispatchers for element, remove its entry from map.
    if (!firebaseui.auth.EventRegister.map_[key].length) {
      delete firebaseui.auth.EventRegister.map_[key];
    }
  }
};


/**
 * @param {Element} el The element which identifying key is to be returned.
 * @return {number} Returns the hash map key corresponding to the element
 *     provided.
 * @private
 */
firebaseui.auth.EventRegister.getKey_ = function(el) {
  if (typeof el.dispatchId_ === 'undefined') {
    el.dispatchId_ = firebaseui.auth.EventRegister.counter_;
    firebaseui.auth.EventRegister.counter_++;
  }
  return el.dispatchId_;
};



/**
 * An event dispatcher wrapper for an element. Anytime an event is to be
 * triggered on the provided element, it is to be dispatched via event register
 * and if a listener is set, then its callback will be called.
 * @param {Element} el The element on which events will be dispatched.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
firebaseui.auth.EventDispatcher = function(el) {
  if (!el) {
     throw new Error('Event target element must be provided!');
  }
  this.el_ = el;
  firebaseui.auth.EventDispatcher.base(this, 'constructor');
};
goog.inherits(firebaseui.auth.EventDispatcher, goog.events.EventTarget);


/**
 * @return {Element} The element corresponding to the event dispatcher.
 */
firebaseui.auth.EventDispatcher.prototype.getElement = function() {
  return this.el_;
};


/**
 * Registers the event dispatcher object.
 */
firebaseui.auth.EventDispatcher.prototype.register = function() {
  firebaseui.auth.EventRegister.register(this);
};


/**
 * Unregisters the event dispatcher object.
 */
firebaseui.auth.EventDispatcher.prototype.unregister = function() {
  firebaseui.auth.EventRegister.unregister(this);
};
