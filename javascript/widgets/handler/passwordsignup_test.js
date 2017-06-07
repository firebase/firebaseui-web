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
 * @fileoverview Test for password sign-up handler.
 */

goog.provide('firebaseui.auth.widget.handler.PasswordSignUpTest');
goog.setTestOnly('firebaseui.auth.widget.handler.PasswordSignUpTest');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignUp');
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.testing.events');


/**
 * Asserts all the required requests for a successful sign-up.
 */
function assertSuccessfulSignUp() {
  testAuth.assertCreateUserWithEmailAndPassword(
      [passwordAccount.getEmail(), '123123'], function() {
        testAuth.setUser({
          'email': passwordAccount.getEmail(),
          'displayName': passwordAccount.getDisplayName()
        });
        testAuth.currentUser.assertUpdateProfile([{
          'displayName': 'Password User'
        }]);
        return testAuth.currentUser;
      });
}


function testHandlePasswordSignUp() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  assertSuccessfulSignUp();
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.setUser({
      'uid': '12345678'
    });
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    // Confirm password credential passed and signed in with.
    var cred = new firebase.auth.EmailAuthProvider.credential(
        passwordAccount.getEmail(), '123123');
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePasswordSignUp_reset() {
  // Test reset after password sign-up handler called.
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandlePasswordSignUp_withoutDisplayName() {
  app.setConfig({
    'signInOptions': [
      {
        provider: 'password',
        requireDisplayName: false
      }]
  });
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  assertNull(getNameElement());
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();

  // assert successful sign up without updateProfile being called
  testAuth.assertCreateUserWithEmailAndPassword(
      [passwordAccount.getEmail(), '123123'], function() {
        testAuth.setUser({
          'email': passwordAccount.getEmail()
        });
        return testAuth.currentUser;
      });
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    var cred = new firebase.auth.EmailAuthProvider.credential(
        passwordAccount.getEmail(), '123123');
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePasswordSignUp_signInCallback() {
  // Provide a sign-in success callback.
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  assertSuccessfulSignUp();
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.setUser({
      'uid': '12345678'
    });
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    // Confirm password credential passed and signed in with.
    var cred = new firebase.auth.EmailAuthProvider.credential(
        passwordAccount.getEmail(), '123123');
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


function testHandlePasswordSignUp_cancel_providerFirst() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.testing.events.fireClickSequence(
      goog.dom.getElementByClass('firebaseui-id-secondary-link', container));
  // Provider sign-in page should show.
  assertProviderSignInPage();
}


function testHandlePasswordSignUp_emailExistsError_providerFound() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  testAuth.assertCreateUserWithEmailAndPassword(
      [passwordAccount.getEmail(), '123123'], null, {
        'code': 'auth/email-already-in-use'
      });
  // Provider found for email.
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()], ['password']);
  return testAuth.process().then(function() {
    assertPasswordSignUpPage();
  });
}


function testHandlePasswordSignUp_emailExistsError_providerNotFound() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  testAuth.assertCreateUserWithEmailAndPassword(
      [passwordAccount.getEmail(), '123123'], null, {
        'code': 'auth/email-already-in-use'
      });
  // No provider found for email.
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()], []);
  return testAuth.process().then(function() {
    // Password recovery page should be rendered with correct info bar message.
    assertPasswordRecoveryPage();
    // Info bar message should be shown.
    assertInfoBarMessage(
        firebaseui.auth.soy2.strings.errorAnonymousEmailBlockingSignIn()
          .toString());
  });
}


function testHandlePasswordSignUp_emailExistsError_providerFetchError() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  testAuth.assertCreateUserWithEmailAndPassword(
      [passwordAccount.getEmail(), '123123'], null, {
        'code': 'auth/email-already-in-use'
      });
  // Error triggered while fetching providers for email.
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()], null, {
        'code': 'auth/internal-error'
      });
  return testAuth.process().then(function() {
    assertPasswordSignUpPage();
  });
}


function testHandlePasswordSignUp_otherError() {
  var error = 'auth/too-many-requests';
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  testAuth.assertCreateUserWithEmailAndPassword(
      [passwordAccount.getEmail(), '123123'], null, {
        'code': error
      });
  return testAuth.process().then(function() {
    assertPasswordSignUpPage();
    assertEquals(
        firebaseui.auth.soy2.strings.errorTooManyRequestsCreateAccount()
        .toString(),
        getNewPasswordErrorMessage());
  });
}


function testHandlePasswordSignUp_emailEmpty() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(app, container);
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'John Doe');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');

  // No email.
  submitForm();
  assertPasswordSignUpPage();
}


function testHandlePasswordSignUp_emailInvalid() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(app, container, 'user@');
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'John Doe');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');

  // Invalid email.
  submitForm();
  assertPasswordSignUpPage();
}


function testHandlePasswordSignUp_nameEmpty() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');

  // No name.
  submitForm();
  assertPasswordSignUpPage();
}


function testHandlePasswordSignUp_passwordEmptyOrMissmatch() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'John Doe');

  // No password.
  goog.dom.forms.setValue(getNewPasswordElement(), '');
  submitForm();
  assertPasswordSignUpPage();
}


function testHandlePasswordSignUp_afterFailed() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  delayForBusyIndicatorAndAssertIndicatorShown();
  // Click submit again.
  submitForm();
  return goog.Promise.resolve().then(function() {
    testAuth.assertCreateUserWithEmailAndPassword(
        [passwordAccount.getEmail(), '123123'], null, {
          'code': 'auth/too-many-requests'
        });
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    // Submit again.
    submitForm();
    assertSuccessfulSignUp();
    return testAuth.process();
  }).then(function() {
     testAuth.setUser({
      'uid': '12345678'
    });
    // Sign out from internal instance and then sign in with passed credential
    // to external instance.
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    var cred = new firebase.auth.EmailAuthProvider.credential(
        passwordAccount.getEmail(), '123123');
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
  });
}
