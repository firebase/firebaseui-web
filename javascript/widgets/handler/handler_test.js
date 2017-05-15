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
 * @fileoverview Tests for handler registration and dispatching.
 */

goog.provide('firebaseui.auth.widget.HandlerTest');
goog.setTestOnly('firebaseui.auth.widget.HandlerTest');

goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.handleCallback');
goog.require('firebaseui.auth.widget.handler.handleEmailChangeRevocation');
goog.require('firebaseui.auth.widget.handler.handleEmailMismatch');
goog.require('firebaseui.auth.widget.handler.handleEmailVerification');
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
goog.require('firebaseui.auth.widget.handler.handlePasswordLinking');
goog.require('firebaseui.auth.widget.handler.handlePasswordRecovery');
goog.require('firebaseui.auth.widget.handler.handlePasswordReset');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignUp');
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInFinish');
goog.require('firebaseui.auth.widget.handler.handlePhoneSignInStart');
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');


function testHandlerRegistration() {
  var HandlerName = firebaseui.auth.widget.HandlerName;
  assertEquals(
      firebaseui.auth.widget.handler.handleCallback,
      firebaseui.auth.widget.handlers_[HandlerName.CALLBACK]);
  assertEquals(
      firebaseui.auth.widget.handler.handleFederatedLinking,
      firebaseui.auth.widget.handlers_[HandlerName.FEDERATED_LINKING]);
  assertEquals(
      firebaseui.auth.widget.handler.handleFederatedSignIn,
      firebaseui.auth.widget.handlers_[HandlerName.FEDERATED_SIGN_IN]);
  assertEquals(
      firebaseui.auth.widget.handler.handlePasswordLinking,
      firebaseui.auth.widget.handlers_[HandlerName.PASSWORD_LINKING]);
  assertEquals(
      firebaseui.auth.widget.handler.handlePasswordRecovery,
      firebaseui.auth.widget.handlers_[HandlerName.PASSWORD_RECOVERY]);
  assertEquals(
      firebaseui.auth.widget.handler.handlePasswordSignIn,
      firebaseui.auth.widget.handlers_[HandlerName.PASSWORD_SIGN_IN]);
  assertEquals(
      firebaseui.auth.widget.handler.handlePasswordSignUp,
      firebaseui.auth.widget.handlers_[HandlerName.PASSWORD_SIGN_UP]);
  assertEquals(
      firebaseui.auth.widget.handler.handlePhoneSignInFinish,
      firebaseui.auth.widget.handlers_[HandlerName.PHONE_SIGN_IN_FINISH]);
  assertEquals(
      firebaseui.auth.widget.handler.handlePhoneSignInStart,
      firebaseui.auth.widget.handlers_[HandlerName.PHONE_SIGN_IN_START]);
  assertEquals(
      firebaseui.auth.widget.handler.handleEmailChangeRevocation,
      firebaseui.auth.widget.handlers_[HandlerName.EMAIL_CHANGE_REVOCATION]);
  assertEquals(
      firebaseui.auth.widget.handler.handleEmailVerification,
      firebaseui.auth.widget.handlers_[HandlerName.EMAIL_VERIFICATION]);
  assertEquals(
      firebaseui.auth.widget.handler.handlePasswordReset,
      firebaseui.auth.widget.handlers_[HandlerName.PASSWORD_RESET]);
  assertEquals(
      firebaseui.auth.widget.handler.handleSignIn,
      firebaseui.auth.widget.handlers_[HandlerName.SIGN_IN]);
  assertEquals(
      firebaseui.auth.widget.handler.handleEmailMismatch,
      firebaseui.auth.widget.handlers_[HandlerName.EMAIL_MISMATCH]);
  assertEquals(
      firebaseui.auth.widget.handler.handleProviderSignIn,
      firebaseui.auth.widget.handlers_[HandlerName.PROVIDER_SIGN_IN]);
}
