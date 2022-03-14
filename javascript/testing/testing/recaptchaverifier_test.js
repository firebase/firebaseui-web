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
 * @fileoverview Tests for recaptchaverifier.js
 */

goog.provide('firebaseui.auth.RecaptchaVerifierTest');

goog.require('firebaseui.auth.testing.RecaptchaVerifier');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.RecaptchaVerifierTest');


function testRecaptchaVerifier_success() {
  var app = {};
  var unfilteredParams = {
    'size': 'compact',
    'callback': function(token) {},
    'expired-callback': function() {}
  };
  var filteredParams = {'size': 'compact'};
  var myMock = new firebaseui.auth.testing.RecaptchaVerifier(
      'id', unfilteredParams, app);
  myMock.install();
  myMock.render().then(function(widgetId) {
    assertEquals(widgetId, 10);
    return myMock.verify();
  }).then(function(response) {
    assertEquals('RECAPTCHA_TOKEN', response);
    myMock.clear();
  });
  return myMock.process().then(function() {
    // Callbacks should be filtered out.
    myMock.assertInitializedWithParameters(
        'id', filteredParams, app);
    // Same parameters should be returned, including the 2 callbacks.
    assertObjectEquals(unfilteredParams, myMock.getParameters());
    myMock.assertRender([], 10);
    myMock.assertVerify([], 'RECAPTCHA_TOKEN');
    return myMock.process();
  }).then(function() {
    myMock.assertClear();
    return myMock.uninstall();
  });
}


function testRecaptchaVerifier_clearError() {
  var app = {};
  var myMock = new firebaseui.auth.testing.RecaptchaVerifier(
      'id', {'size': 'compact'}, app);
  myMock.install();
  myMock.render().then(function(widgetId) {
    assertEquals(widgetId, 10);
    return myMock.verify();
  }).then(function(response) {
    assertEquals('RECAPTCHA_TOKEN', response);
  });
  return myMock.process().then(function() {
    myMock.assertInitializedWithParameters(
        'id', {'size': 'compact'}, app);
    myMock.assertRender([], 10);
    myMock.assertVerify([], 'RECAPTCHA_TOKEN');
    myMock.assertNotClear();
    return myMock.process();
  }).then(function() {
    myMock.assertClear();
  }).thenCatch(function(error) {
    assertEquals('reCAPTCHA verifier not cleared!', error.message);
  });
}
