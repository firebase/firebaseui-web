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
 * @fileoverview Tests for element.soy
 */

goog.provide('firebaseui.auth.soy2.elementTest');
goog.setTestOnly('firebaseui.auth.soy2.elementTest');

goog.require('firebaseui.auth.soy2.element');
goog.require('firebaseui.auth.soy2.strings');
/** @suppress {extraRequire} Required for initViewer helper function. */
goog.require('firebaseui.auth.soy2.viewHelper');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.testing.jsunit');


var IJ_DATA_ = {
  'defaultPhotoUrl': '../image/profile-picture-small.png',
  'googleLogo': '../image/google.svg',
  'githubLogo': '../image/github.svg',
  'facebookLogo': '../image/facebook.svg',
  'twitterLogo': '../image/twitter.svg',
  'passwordLogo': '../image/mail.svg'
};


function setUpPage() {
  initViewer('elements.soy');
}


function tearDownPage() {
  if (window['componentHandler'] &&
      window['componentHandler']['upgradeAllRegistered']) {
    window['componentHandler']['upgradeAllRegistered']();
  }
}

function testEmail() {
  var root = goog.dom.getElement('email');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.email);
}


function testEmail_withEmail() {
  var root = goog.dom.getElement('email-with-email');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.email, {'email': 'user@example.com'});
}


function testEmail_withEmailDisabled() {
  var root = goog.dom.getElement('email-with-email-disabled');
  goog.soy.renderElement(
      root,
      firebaseui.auth.soy2.element.email,
      {'email': 'user@example.com', 'disabled': true});
}


function testEmail_error() {
  var root = goog.dom.getElement('email-error');
  goog.soy.renderElement(
      root,
      firebaseui.auth.soy2.element.email,
      null);
  setInvalid(root, 'firebaseui-id-email');
  setError(root, 'firebaseui-id-email-error',
      firebaseui.auth.soy2.strings.errorMissingEmail().toString());
}


function testIdpButton() {
  var idps = ['password', 'google.com', 'github.com', 'facebook.com',
    'twitter.com'];
  var root = goog.dom.getElement('idp-button');
  for (var i = 0; i < idps.length; i++) {
    var button = goog.soy.renderAsElement(
        firebaseui.auth.soy2.element.idpButton,
        {'providerId': idps[i], 'type': 'signIn'},
        IJ_DATA_);
    root.appendChild(button);
    var separator = goog.dom.createElement('div');
    goog.dom.setProperties(separator, {'style': 'height:15px'});
    root.appendChild(separator);
  }
}


function testSubmitButton() {
  var root = goog.dom.getElement('submit-button');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.submitButton);
}


function testSubmitButton_customLabel() {
  var root = goog.dom.getElement('submit-button-custom-label');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.submitButton,
      {'label': 'Sign in with Google'});
}


function testName() {
  var root = goog.dom.getElement('name');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.name);
}


function testName_withName() {
  var root = goog.dom.getElement('name-with-name');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.name, {'name': 'John Doe'});
}


function testName_error() {
  var root = goog.dom.getElement('name-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.name);
  setInvalid(root, 'firebaseui-id-name');
  setError(root, 'firebaseui-id-name-error',
      firebaseui.auth.soy2.strings.errorMissingName().toString());
}


function testNewPassword() {
  var root = goog.dom.getElement('new-password');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.newPassword);
}


function testNewPassword_toggled() {
  var root = goog.dom.getElement('new-password-toggled');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.newPassword);

  // Simulate toggle button clicked.
  var newPassword = goog.dom.getElementByClass('firebaseui-id-new-password',
      root);
  newPassword['type'] = 'text';

  var toggle = goog.dom.getElementByClass('firebaseui-id-password-toggle',
      root);
  goog.dom.classes.remove(toggle,
      goog.getCssName('firebaseui-input-toggle-on'));
  goog.dom.classes.add(toggle,
      goog.getCssName('firebaseui-input-toggle-off'));
}


function testNewPassword_error() {
  var root = goog.dom.getElement('new-password-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.newPassword);
  setInvalid(root, 'firebaseui-id-new-password');
  setError(
      root,
      'firebaseui-id-new-password-error',
      firebaseui.auth.soy2.strings.errorMissingPassword().toString());
}


function testPassword() {
  var root = goog.dom.getElement('password');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.password);
}


function testPassword_current() {
  var root = goog.dom.getElement('password-current');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.password,
      {'current': true});
}


function testPassword_error() {
  var root = goog.dom.getElement('password-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.password);
  setInvalid(root, 'firebaseui-id-password');
  setError(root, 'firebaseui-id-password-error',
      firebaseui.auth.soy2.strings.errorMissingPassword().toString());
}


function testPasswordRecoveryButton() {
  var root = goog.dom.getElement('password-recovery-button');
  goog.soy.renderElement(root,
      firebaseui.auth.soy2.element.passwordRecoveryButton);
}


function testCancelButton() {
  var root = goog.dom.getElement('cancel-button');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.cancelButton);
}


function testInfoBar() {
  var root = goog.dom.getElement('info-bar');
  var infoBar = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.infoBar, {'message': 'This is an error.'});
  root.appendChild(infoBar);
}


function testBusyIndicatorr() {
  var root = goog.dom.getElement('busy-indicator');
  var busy = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.busyIndicator,
      null);
  root.appendChild(busy);
}
