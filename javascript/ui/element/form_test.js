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
 * @fileoverview Tests for form.js
 */

goog.provide('firebaseui.auth.ui.element.formTest');
goog.setTestOnly('firebaseui.auth.ui.element.formTest');

goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;
var submitClicked;
var linkClicked;


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  // Create a component with submit button and secondary link
  component = new goog.ui.Component();
  container.innerHTML =
      '<button class="firebaseui-id-submit">Submit</button>' +
      '<a class="firebaseui-id-secondary-link">Cancel</a>';
  component.decorate(container);

  submitClicked = false;
  linkClicked = false;
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetSubmitElement() {
  var submitElement = firebaseui.auth.ui.element.form.getSubmitElement.call(
      component);
  assertNotNull(submitElement);
  assertEquals('Submit', goog.dom.getTextContent(submitElement));
}


function testGetSecondaryLinkElement() {
  var linkElement = firebaseui.auth.ui.element.form.getSecondaryLinkElement.call(
      component);
  assertNotNull(linkElement);
  assertEquals('Cancel', goog.dom.getTextContent(linkElement));
}


function testGetSecondaryLinkElement_notPresent() {
  // Test when no secondary link exists
  container.innerHTML = '<button class="firebaseui-id-submit">Submit</button>';
  component = new goog.ui.Component();
  component.decorate(container);

  var linkElement = firebaseui.auth.ui.element.form.getSecondaryLinkElement.call(
      component);
  assertNull(linkElement);
}


function testInitFormElement_submitClick() {
  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function() { submitClicked = true; });

  var submitElement = firebaseui.auth.ui.element.form.getSubmitElement.call(
      component);

  assertFalse(submitClicked);
  goog.testing.events.fireClickSequence(submitElement);
  assertTrue(submitClicked);
}


function testInitFormElement_submitEnter() {
  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function() { submitClicked = true; });

  var submitElement = firebaseui.auth.ui.element.form.getSubmitElement.call(
      component);

  assertFalse(submitClicked);
  goog.testing.events.fireKeySequence(submitElement, goog.events.KeyCodes.ENTER);
  assertTrue(submitClicked);
}


function testInitFormElement_linkClick() {
  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function() { submitClicked = true; },
      function() { linkClicked = true; });

  var linkElement = firebaseui.auth.ui.element.form.getSecondaryLinkElement.call(
      component);

  assertFalse(linkClicked);
  goog.testing.events.fireClickSequence(linkElement);
  assertTrue(linkClicked);
  assertFalse(submitClicked);
}


function testInitFormElement_linkEnter() {
  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function() { submitClicked = true; },
      function() { linkClicked = true; });

  var linkElement = firebaseui.auth.ui.element.form.getSecondaryLinkElement.call(
      component);

  assertFalse(linkClicked);
  goog.testing.events.fireKeySequence(linkElement, goog.events.KeyCodes.ENTER);
  assertTrue(linkClicked);
  assertFalse(submitClicked);
}


function testInitFormElement_noSecondaryLink() {
  // Test form with no secondary link
  container.innerHTML = '<button class="firebaseui-id-submit">Submit</button>';
  component = new goog.ui.Component();
  component.decorate(container);

  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function() { submitClicked = true; });

  var submitElement = firebaseui.auth.ui.element.form.getSubmitElement.call(
      component);

  goog.testing.events.fireClickSequence(submitElement);
  assertTrue(submitClicked);
}


function testInitFormElement_noLinkCallback() {
  // Test with secondary link but no callback provided
  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function() { submitClicked = true; });

  var linkElement = firebaseui.auth.ui.element.form.getSecondaryLinkElement.call(
      component);

  // Should not throw error
  goog.testing.events.fireClickSequence(linkElement);
  assertFalse(linkClicked);
}


function testInitFormElement_multipleSubmits() {
  var submitCount = 0;
  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function() { submitCount++; });

  var submitElement = firebaseui.auth.ui.element.form.getSubmitElement.call(
      component);

  goog.testing.events.fireClickSequence(submitElement);
  assertEquals(1, submitCount);

  goog.testing.events.fireClickSequence(submitElement);
  assertEquals(2, submitCount);
}


function testInitFormElement_eventObject() {
  var receivedEvent = null;
  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function(e) { receivedEvent = e; });

  var submitElement = firebaseui.auth.ui.element.form.getSubmitElement.call(
      component);

  goog.testing.events.fireClickSequence(submitElement);
  assertNotNull(receivedEvent);
}


function testInitFormElement_linkEventObject() {
  var receivedEvent = null;
  firebaseui.auth.ui.element.form.initFormElement.call(
      component,
      function() {},
      function(e) { receivedEvent = e; });

  var linkElement = firebaseui.auth.ui.element.form.getSecondaryLinkElement.call(
      component);

  goog.testing.events.fireClickSequence(linkElement);
  assertNotNull(receivedEvent);
}
