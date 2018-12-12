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
 * @fileoverview Test for email link sign-in confirmation handler.
 */

goog.provide('firebaseui.auth.widget.handler.EmailLinkConfirmationTest');
goog.setTestOnly('firebaseui.auth.widget.handler.EmailLinkConfirmationTest');

goog.require('firebaseui.auth.widget.handler.handleEmailLinkConfirmation');
/** @suppress {extraRequire} Required for accessing test helper utilities. */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.recordFunction');


function testHandleEmailLinkConfirmation() {
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID');
  var onContinue = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkConfirmation(
      app, container, link, onContinue);

  assertEmailLinkSignInConfirmationPage();
  assertTosPpFooter(tosCallback, 'http://localhost/privacy_policy');

  // Now email input has 'user', which is not a valid email address.
  var emailInput = getEmailElement();
  goog.dom.forms.setValue(emailInput, 'user');
  emailInput.focus();
  var inputEvent = new goog.testing.events.Event(
      goog.events.EventType.INPUT, emailInput);
  inputEvent.keyCode = goog.events.KeyCodes.R;
  goog.testing.events.fireBrowserEvent(inputEvent);

  // Enter key ignored.
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);
  assertEmailLinkSignInConfirmationPage();

  // Now email input has 'user@example.com', which is a valid email address.
  goog.dom.forms.setValue(emailInput, 'user@example.com');
  emailInput.focus();
  inputEvent = new goog.testing.events.Event(
      goog.events.EventType.INPUT, emailInput);
  inputEvent.keyCode = goog.events.KeyCodes.M;
  goog.testing.events.fireBrowserEvent(inputEvent);

  // Enter key triggers onContinue callback.
  goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);

  assertEquals(1, onContinue.getCallCount());
  assertEquals(app, onContinue.getLastCall().getArgument(0));
  assertEquals(container, onContinue.getLastCall().getArgument(1));
  assertEquals(email, onContinue.getLastCall().getArgument(2));
  assertEquals(link, onContinue.getLastCall().getArgument(3));
}


function testHandleEmailLinkConfirmation_cancelButton() {
  var link = generateSignInLink('SESSIONID');
  var onContinue = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkConfirmation(
      app, container, link, onContinue);

  assertEmailLinkSignInConfirmationPage();

  // Click cancel.
  clickSecondaryLink();

  // Provider sign-in page should be rendered.
  assertProviderSignInPage();
  assertEquals(0, onContinue.getCallCount());
}


function testHandleEmailLinkConfirmation_reset() {
  // Test when reset is called after sign-in handler called.
  var link = generateSignInLink('SESSIONID');
  var onContinue = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkConfirmation(
      app, container, link, onContinue);
  app.reset();

  // Reset current rendered widget page.
  app.getAuth().assertSignOut([]);
  // Container should be cleared.
  assertComponentDisposed();
  assertEquals(0, onContinue.getCallCount());
}
