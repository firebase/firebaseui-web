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
 * @fileoverview Tests for the notice page.
 */

goog.provide('firebaseui.auth.ui.page.NoticeTest');
goog.setTestOnly('firebaseui.auth.ui.page.NoticeTest');

goog.require('firebaseui.auth.ui.element.FormTestHelper');
goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
goog.require('firebaseui.auth.ui.page.EmailChangeRevokeFailure');
goog.require('firebaseui.auth.ui.page.EmailVerificationFailure');
goog.require('firebaseui.auth.ui.page.EmailVerificationSuccess');
goog.require('firebaseui.auth.ui.page.PageTestHelper');
goog.require('firebaseui.auth.ui.page.PasswordRecoveryEmailSent');
goog.require('firebaseui.auth.ui.page.PasswordResetFailure');
goog.require('firebaseui.auth.ui.page.PasswordResetSuccess');
goog.require('firebaseui.auth.ui.page.RecoverableError');
goog.require('firebaseui.auth.ui.page.RevertSecondFactorAdditionFailure');
goog.require('firebaseui.auth.ui.page.SignOut');
goog.require('firebaseui.auth.ui.page.UnrecoverableError');
goog.require('firebaseui.auth.ui.page.VerifyAndChangeEmailFailure');
goog.require('firebaseui.auth.ui.page.VerifyAndChangeEmailSuccess');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');


var mockClock;
var root;
var component;
var formTestHelper = new firebaseui.auth.ui.element.FormTestHelper().
    excludeTests('testOnLinkClick_', 'testOnLinkEnter_').
    registerTests();
var infoBarTestHelper =
    new firebaseui.auth.ui.element.InfoBarTestHelper().registerTests();
var tosPpTestHelper =
    new firebaseui.auth.ui.element.TosPpTestHelper().registerTests();
var pageTestHelper =
    new firebaseui.auth.ui.page.PageTestHelper().registerTests();


function setUp() {
  // Set up clock.
  mockClock = new goog.testing.MockClock();
  mockClock.install();
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);
  component = new firebaseui.auth.ui.page.PasswordRecoveryEmailSent(
      'user@example.com',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.TosPpTestHelper.prototype.onTosLinkClick,
          tosPpTestHelper),
      goog.bind(
          firebaseui.auth.ui.element.TosPpTestHelper.prototype.onPpLinkClick,
          tosPpTestHelper));
  component.render(root);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  infoBarTestHelper.setComponent(component);
  tosPpTestHelper.setComponent(component);
  // Reset previous state of tosPp helper.
  tosPpTestHelper.resetState();
  pageTestHelper.setClock(mockClock).setComponent(component);
}


function tearDown() {
  // Tear down clock.
  mockClock.tick(Infinity);
  mockClock.reset();
  component.dispose();
  goog.dom.removeNode(root);
}


function testInitialFocus() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  assertEquals(
      component.getSubmitElement(),
      goog.dom.getActiveElement(document));
}


function testPasswordRecoveryEmailSent_pageEvents() {
  // Run page event tests.
  // Dispose previously created container since test must run before rendering
  // the component in docoument.
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.PasswordRecoveryEmailSent(
      'user@example.com',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  // Run all page helper tests.
  pageTestHelper.runTests(component, root);
}


function testPasswordRecoveryEmailSent_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.PasswordRecoveryEmailSent(
      'user@example.com',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('passwordRecoveryEmailSent', component.getPageId());
}


function testEmailVerificationSuccess_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.EmailVerificationSuccess(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('emailVerificationSuccess', component.getPageId());
}


function testEmailVerificationFailure_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.EmailVerificationFailure(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('emailVerificationFailure', component.getPageId());
}


function testPasswordResetSuccess_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.PasswordResetSuccess(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('passwordResetSuccess', component.getPageId());
}


function testPasswordResetFailure_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.PasswordResetFailure(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('passwordResetFailure', component.getPageId());
}


function testEmailChangeRevokeFailure_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.EmailChangeRevokeFailure(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('emailChangeRevokeFailure', component.getPageId());
}


function testVerifyAndChangeEmailSuccess_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.VerifyAndChangeEmailSuccess(
      'user@example.com',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('verifyAndChangeEmailSuccess', component.getPageId());
}


function testVerifyAndChangeEmailFailure_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.VerifyAndChangeEmailFailure(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('verifyAndChangeEmailFailure', component.getPageId());
}


function testRevertSecondFactorAdditionFailure_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.RevertSecondFactorAdditionFailure(
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  assertEquals('revertSecondFactorAdditionFailure', component.getPageId());
}


function testUnrecoverableError_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.UnrecoverableError(
      'Error occurred!');
  assertEquals('unrecoverableError', component.getPageId());
}


function testSignOut_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.SignOut();
  assertEquals('signOut', component.getPageId());
}


function testRecoverableError_getPageId() {
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.RecoverableError(
      'Error occurred!');
  assertEquals('recoverableError', component.getPageId());
}


function testRecoverableError_InitialFocus() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    return;
  }
  component.dispose();
  // Initialize component.
  component = new firebaseui.auth.ui.page.RecoverableError(
      'Error occurred!',
      goog.bind(
          firebaseui.auth.ui.element.FormTestHelper.prototype.onSubmit,
          formTestHelper));
  component.render(root);
  formTestHelper.setComponent(component);
  // Reset previous state of form helper.
  formTestHelper.resetState();
  assertEquals(
      component.getSubmitElement(),
      goog.dom.getActiveElement(document));
}
