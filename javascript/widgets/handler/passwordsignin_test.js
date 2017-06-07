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
 * @fileoverview Test for password sign in handler.
 */

goog.provide('firebaseui.auth.widget.handler.PasswordSignInTest');
goog.setTestOnly('firebaseui.auth.widget.handler.PasswordSignInTest');

goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handlePasswordRecovery');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.testing.events');


function testHandlePasswordSignIn() {
  firebaseui.auth.widget.handler.handlePasswordSignIn(
      app, container, passwordAccount.getEmail());
  assertPasswordSignInPage();
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  testAuth.assertSignInWithEmailAndPassword(
      [passwordAccount.getEmail(), '123'], function(){
        testAuth.setUser({
          'email': passwordAccount.getEmail(),
          'displayName': passwordAccount.getDisplayName()
        });
        return testAuth.currentUser;
      });
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    // Confirm password credential passed and signed in with.
    var cred = new firebase.auth.EmailAuthProvider.credential(
        passwordAccount.getEmail(), '123');
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePasswordSignIn_reset() {
  firebaseui.auth.widget.handler.handlePasswordSignIn(
      app, container, passwordAccount.getEmail());
  assertPasswordSignInPage();
  // Reset the current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandlePasswordSignIn_signInCallback() {
  // Provide a sign in success callback.
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  firebaseui.auth.widget.handler.handlePasswordSignIn(
      app, container, passwordAccount.getEmail());
  assertPasswordSignInPage();
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  testAuth.assertSignInWithEmailAndPassword(
      [passwordAccount.getEmail(), '123'], function(){
        testAuth.setUser({
          'email': passwordAccount.getEmail(),
          'displayName': passwordAccount.getDisplayName()
        });
        return testAuth.currentUser;
      });
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    // Confirm password credential passed and signed in with.
    var cred = new firebase.auth.EmailAuthProvider.credential(
        passwordAccount.getEmail(), '123');
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called. No password credential is passed.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser, null, undefined);
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePasswordSignIn_forgotPassword() {
  firebaseui.auth.widget.handler.handlePasswordSignIn(
      app, container, passwordAccount.getEmail());
  assertPasswordSignInPage();
  goog.testing.events.fireClickSequence(
      goog.dom.getElementByClass('firebaseui-id-secondary-link', container));
  assertPasswordRecoveryPage();
}


function testHandlePasswordSignIn_wrongPassword() {
  var error = {'code': 'auth/wrong-password'};
  firebaseui.auth.widget.handler.handlePasswordSignIn(
      app, container, passwordAccount.getEmail());
  assertPasswordSignInPage();

  return goog.Promise.resolve()
      .then(function() {
        // Try an incorrect password.
        goog.dom.forms.setValue(getPasswordElement(), '321');
        submitForm();
        testAuth.assertSignInWithEmailAndPassword(
            [passwordAccount.getEmail(), '321'], null, error);
        return testAuth.process();
      })
      .then(function() {
        assertPasswordSignInPage();
        assertEquals(
            firebaseui.auth.widget.handler.common.getErrorMessage(error),
            getPasswordErrorMessage());

        // Try the correct password.
        goog.dom.forms.setValue(getPasswordElement(), '123');
        submitForm();
        testAuth.assertSignInWithEmailAndPassword(
            [passwordAccount.getEmail(), '123'], function(){
              testAuth.setUser({
                'email': passwordAccount.getEmail(),
                'displayName': passwordAccount.getDisplayName()
              });
              return testAuth.currentUser;
            });
        return testAuth.process();
      }).then(function() {
        // Sign out from internal instance and then sign in with passed
        // credential to external instance.
        testAuth.assertSignOut([]);
        return testAuth.process();
      }).then(function() {
        externalAuth.setUser(testAuth.currentUser);
        // Confirm correct password credential passed and signed in with.
        var cred = new firebase.auth.EmailAuthProvider.credential(
            passwordAccount.getEmail(), '123');
        externalAuth.assertSignInWithCredential(
            [cred], externalAuth.currentUser);
        return externalAuth.process();
      }).then(function() {
        testUtil.assertGoTo('http://localhost/home');
      });
}


function testHandlePasswordSignIn_otherError() {
  firebaseui.auth.widget.handler.handlePasswordSignIn(
      app, container, passwordAccount.getEmail());
  assertPasswordSignInPage();
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  testAuth.assertSignInWithEmailAndPassword(
      [federatedAccount.getEmail(), '123'], null, internalError);
  return testAuth.process().then(function() {
    assertPasswordSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandlePasswordSignIn_emailEmpty() {
  firebaseui.auth.widget.handler.handlePasswordSignIn(app, container);
  assertPasswordSignInPage();
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  // No submission without email.
  assertPasswordSignInPage();
}


function testHandlePasswordSignIn_emailInvalid() {
  firebaseui.auth.widget.handler.handlePasswordSignIn(app, container, 'user@');
  assertPasswordSignInPage();
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  // No submission with invalid email.
  assertPasswordSignInPage();
}


function testHandlePasswordSignIn_passwordEmpty() {
  firebaseui.auth.widget.handler.handlePasswordSignIn(
      app, container, passwordAccount.getEmail());
  assertPasswordSignInPage();
  submitForm();
  // No submission without password.
  assertPasswordSignInPage();
}


function testHandlePasswordSignIn_inProcessing() {
  firebaseui.auth.widget.handler.handlePasswordSignIn(
      app, container, passwordAccount.getEmail());
  assertPasswordSignInPage();
  return goog.Promise.resolve()
      .then(function() {
        goog.dom.forms.setValue(getPasswordElement(), '123');
        submitForm();
        delayForBusyIndicatorAndAssertIndicatorShown();
        // Click submit again.
        submitForm();
        // Only one request sent.
        testAuth.assertSignInWithEmailAndPassword(
            [passwordAccount.getEmail(), '123'], null, internalError);
        return testAuth.process();
      })
      .then(function() {
        assertBusyIndicatorHidden();
        // Submit again.
        submitForm();
        testAuth.assertSignInWithEmailAndPassword(
            [passwordAccount.getEmail(), '123'], function(){
              testAuth.setUser({
                'email': passwordAccount.getEmail(),
                'displayName': passwordAccount.getDisplayName()
              });
              return testAuth.currentUser;
            });
        return testAuth.process();
      }).then(function() {
        // Sign out from internal instance and then sign in with passed
        // credential to external instance.
        testAuth.assertSignOut([]);
        return testAuth.process();
      }).then(function() {
        externalAuth.setUser(testAuth.currentUser);
        // Confirm correct password credential passed and signed in with.
        var cred = new firebase.auth.EmailAuthProvider.credential(
            passwordAccount.getEmail(), '123');
        externalAuth.assertSignInWithCredential(
            [cred], externalAuth.currentUser);
        return externalAuth.process();
      }).then(function() {
        testUtil.assertGoTo('http://localhost/home');
      });
}
