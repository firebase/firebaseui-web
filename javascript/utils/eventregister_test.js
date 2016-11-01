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
 * @fileoverview Tests for custom event dispatcher and register.
 */

goog.provide('firebaseui.auth.EventRegisterTest');
goog.setTestOnly('firebaseui.auth.EventRegisterTest');

goog.require('firebaseui.auth.EventRegister');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');


var root;
var root2;
var myEvent = 'myEvent';
var myEvent2 = 'myEvent2';


function setUp() {
  // Reset event register.
  firebaseui.auth.EventRegister.map_ = {};
  firebaseui.auth.EventRegister.counter_ = 0;
  // Create DOM element and append to document.
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  // Create another DOM element and append to document.
  root2 = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root2);
}


function tearDown() {
  // Remove DOM elements from document.
  goog.dom.removeNode(root);
  goog.dom.removeNode(root2);
}


function testEventDispatcher() {
  // Test on single element with single event dispatcher.
  var triggered = 0;
  var eventDispatcher = new firebaseui.auth.EventDispatcher(root);
  assertEquals(root, eventDispatcher.getElement());
  // Increment triggered when myEvent is triggered on root.
  goog.events.listen(
      eventDispatcher,
      myEvent,
      function() {triggered++;});
  // Trigger event.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Dispatcher not registered yet.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
  assertEquals(0, triggered);
  // Register dispatcher.
  eventDispatcher.register();
  // Dispatcher should now be in event register map.
  assertArrayEquals([eventDispatcher], firebaseui.auth.EventRegister.map_[0]);
  // Trigger myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Event should be caught.
  assertEquals(1, triggered);
  // Trigger myEvent2.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent2);
  // No callback should be run.
  assertEquals(1, triggered);
  // Trigger myEvent again.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // It should be caught.
  assertEquals(2, triggered);
  // Unregister event dispatcher.
  eventDispatcher.unregister();
  // Trigger myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // No callback.
  assertEquals(2, triggered);
  // Entry should be removed from map.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
}


function testEventDispatcher_sameEvent_duplicateElement() {
  // Test same event on same element using multiple event dispatchers.
  var triggered = 0;
  var triggered2 = 0;
  // Initialize 2 dispatchers for root.
  var eventDispatcher = new firebaseui.auth.EventDispatcher(root);
  var eventDispatcher2 = new firebaseui.auth.EventDispatcher(root);
  // Increment corresponding flag for each dispatcher.
  goog.events.listen(
      eventDispatcher,
      myEvent,
      function() {triggered++;});
  goog.events.listen(
      eventDispatcher2,
      myEvent,
      function() {triggered2++;});
  // Dispatch myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // No dispatcher mapped yet.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
  // No event triggered yet before dispatchers are registered.
  assertEquals(0, triggered);
  assertEquals(0, triggered2);
  // Register one event dispatcher.
  // Register is called once.
  eventDispatcher.register();
  eventDispatcher.register();
  // Dispatcher should be added to map.
  assertArrayEquals(
      [eventDispatcher],
      firebaseui.auth.EventRegister.map_[0]);
  // Trigger myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Only registered dispatcher is triggered.
  assertEquals(1, triggered);
  assertEquals(0, triggered2);
  // Register second dispatchers.
  eventDispatcher2.register();
  // Both dispatchers map to same element.
  assertArrayEquals(
      [eventDispatcher, eventDispatcher2],
      firebaseui.auth.EventRegister.map_[0]);
  // Dispatch myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Both triggered.
  assertEquals(2, triggered);
  assertEquals(1, triggered2);
  // Unregister first dispatcher.
  eventDispatcher.unregister();
  // Second dispatcher still mapped.
  assertArrayEquals(
      [eventDispatcher2],
      firebaseui.auth.EventRegister.map_[0]);
  // Dispatch myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Only second dispatcher triggered since it's still registered.
  assertEquals(2, triggered);
  assertEquals(2, triggered2);
  // Unregister second dispatcher.
  eventDispatcher2.unregister();
  // Dispatch myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // No dispatcher triggered.
  assertEquals(2, triggered);
  assertEquals(2, triggered2);
  // No dispatcher defined for element anymore.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
}


function testEventDispatcher_sameEvent_differentElements() {
  // Test using same event with multiple dispatcher each on a different element.
  var triggered = 0;
  var triggered2 = 0;
  // Initialize event dispatcher for first element.
  var eventDispatcher = new firebaseui.auth.EventDispatcher(root);
  // Initialize second event dispatcher for first element.
  var eventDispatcher2 = new firebaseui.auth.EventDispatcher(root2);
  // Register dispatchers.
  eventDispatcher.register();
  eventDispatcher2.register();
  // Increment triggered when myEvent triggered on root.
  goog.events.listen(
      eventDispatcher,
      myEvent,
      function() {triggered++;});
  // Increment triggered2 when myEvent triggered on root2.
  goog.events.listen(
      eventDispatcher2,
      myEvent,
      function() {triggered2++;});
  // Dispatch myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Each dispatcher should be mapped for each element.
  assertArrayEquals(
      [eventDispatcher],
      firebaseui.auth.EventRegister.map_[0]);
  assertArrayEquals(
      [eventDispatcher2],
      firebaseui.auth.EventRegister.map_[1]);
  // Only root's dispatcher triggered.
  assertEquals(1, triggered);
  assertEquals(0, triggered2);
  // Dispatch myEvent on root2.
  firebaseui.auth.EventRegister.dispatchEvent(
      root2,
      myEvent);
  // Only root2's dispatcher triggered.
  assertEquals(1, triggered);
  assertEquals(1, triggered2);
  // Dispatch myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Only root's dispatcher triggered.
  assertEquals(2, triggered);
  assertEquals(1, triggered2);
  // Unregister both dispatchers.
  eventDispatcher.unregister();
  eventDispatcher2.unregister();
  // Both dispatchers no longer mapped.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
  assertUndefined(firebaseui.auth.EventRegister.map_[1]);
  // Dispatch myEvent on root and root2.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  firebaseui.auth.EventRegister.dispatchEvent(
      root2,
      myEvent);
  // No event triggered for either.
  assertEquals(2, triggered);
  assertEquals(1, triggered2);
}


function testEventDispatcher_multipleEvents_sameElement() {
  // Test multiple events on same element's dispatcher.
  var triggered = 0;
  var triggered2 = 0;
  // Initialize dispatcher for element.
  var eventDispatcher = new firebaseui.auth.EventDispatcher(root);
  // Increment triggered when myEvent is dispatched.
  goog.events.listen(
      eventDispatcher,
      myEvent,
      function() {triggered++;});
  // Increment triggered2 when myEvent2 is dispatched.
  goog.events.listen(
      eventDispatcher,
      myEvent2,
      function() {triggered2++;});
  // Dispatch myEvent and myEvent2 on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent2);
  // No dispatcher registered yet.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
  // Events not triggered.
  assertEquals(0, triggered);
  assertEquals(0, triggered2);
  // Register dispatcher.
  eventDispatcher.register();
  // Dispatcher registered in map for element.
  assertArrayEquals(
      [eventDispatcher],
      firebaseui.auth.EventRegister.map_[0]);
  // Trigger myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Only triggered is incremented.
  assertEquals(1, triggered);
  assertEquals(0, triggered2);
  // Trigger myEvent2 on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent2);
  // Only triggered2 is incremented.
  assertEquals(1, triggered);
  assertEquals(1, triggered2);
  // Unregister event dispatcher.
  eventDispatcher.unregister();
  // Entry should be removed from map.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
  // Trigger myEvent and myEvent2 on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent2);
  // No events dispatched since dispatcher is unregistered.
  assertEquals(1, triggered);
  assertEquals(1, triggered2);
}


function testEventDispatcher_multipleEvents_multipleElements() {
  // Test multiple events on multiple elements.
  var triggered = 0;
  var triggered2 = 0;
  // Initialize event dispatcher for first element.
  var eventDispatcher = new firebaseui.auth.EventDispatcher(root);
  // Initialize event dispatcher for second element.
  var eventDispatcher2 = new firebaseui.auth.EventDispatcher(root2);
  // Increment triggered when myEvent triggered on root.
  goog.events.listen(
      eventDispatcher,
      myEvent,
      function() {triggered++;});
  // Increment triggered2 when myEvent2 triggered on root2.
  goog.events.listen(
      eventDispatcher2,
      myEvent2,
      function() {triggered2++;});
  // Dispatch myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Dispatch myEvent2 on root2.
  firebaseui.auth.EventRegister.dispatchEvent(
      root2,
      myEvent2);
  // No event dispatcher registered yet.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
  assertEquals(0, triggered);
  assertEquals(0, triggered2);
  // Register both dispatchers.
  eventDispatcher.register();
  eventDispatcher2.register();
  // First dispatcher should have entry for first element in map.
  assertArrayEquals(
      [eventDispatcher],
      firebaseui.auth.EventRegister.map_[0]);
  // Second dispatcher should have entry for second element in map.
  assertArrayEquals(
      [eventDispatcher2],
      firebaseui.auth.EventRegister.map_[1]);
  // Dispatch myEvent on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  // Only triggered incremented.
  assertEquals(1, triggered);
  assertEquals(0, triggered2);
  // Dispatch myEvent on root2.
  firebaseui.auth.EventRegister.dispatchEvent(
      root2,
      myEvent);
  // No change since there is no listener for myEvent on root2.
  assertEquals(1, triggered);
  assertEquals(0, triggered2);
  // Dispatch myEvent2 on root2.
  firebaseui.auth.EventRegister.dispatchEvent(
      root2,
      myEvent2);
  // Only triggered2 incremented.
  assertEquals(1, triggered);
  assertEquals(1, triggered2);
  // Dispatch myEvent2 on root.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent2);
  // No change since there is no listener for myEvent2 on root.
  assertEquals(1, triggered);
  assertEquals(1, triggered2);
  // Unregister dispatcher on root.
  eventDispatcher.unregister();
  // No entry for that element anymore.
  assertUndefined(firebaseui.auth.EventRegister.map_[0]);
  // Dispatch myEvent on root and myEvent2 on root2.
  firebaseui.auth.EventRegister.dispatchEvent(
      root,
      myEvent);
  firebaseui.auth.EventRegister.dispatchEvent(
      root2,
      myEvent2);
  // Only myEvent2 on root2 called.
  assertEquals(1, triggered);
  assertEquals(2, triggered2);
  // Unregister dispatcher on root2.
  eventDispatcher2.unregister();
  // No entry for second element anymore.
  assertUndefined(firebaseui.auth.EventRegister.map_[1]);
}
