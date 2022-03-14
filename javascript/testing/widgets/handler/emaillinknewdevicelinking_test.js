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
 * @fileoverview Test for email linking on new device handler.
 */

goog.provide('firebaseui.auth.widget.handler.EmailLinkNewDeviceLinkingTest');
goog.setTestOnly('firebaseui.auth.widget.handler.EmailLinkNewDeviceLinkingTest');

goog.require('firebaseui.auth.widget.handler.handleEmailLinkNewDeviceLinking');
/** @suppress {extraRequire} Required for accessing test helper utilities. */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.testing.recordFunction');


function testHandleEmailLinkNewDeviceLinking() {
  var link = generateSignInLink('SESSIONID', null, 'facebook.com');
  var modifiedLink = generateSignInLink('SESSIONID', null);
  var onContinue = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkNewDeviceLinking(
      app, container, link, onContinue);

  assertEmailLinkSignInLinkingDifferentDevicePage('Facebook');
  assertTosPpFooter(tosCallback, 'http://localhost/privacy_policy');

  submitForm();

  assertComponentDisposed();
  assertEquals(1, onContinue.getCallCount());
  assertEquals(app, onContinue.getLastCall().getArgument(0));
  assertEquals(container, onContinue.getLastCall().getArgument(1));
  assertEquals(modifiedLink, onContinue.getLastCall().getArgument(2));
}


function testHandleEmailLinkNewDeviceLinking_noProviderId() {
  var linkWithoutProviderId = generateSignInLink('SESSIONID', null);
  var onContinue = goog.testing.recordFunction();

  firebaseui.auth.widget.handler.handleEmailLinkNewDeviceLinking(
      app, container, linkWithoutProviderId, onContinue);

  assertProviderSignInPage();
  assertEquals(0, onContinue.getCallCount());
}
