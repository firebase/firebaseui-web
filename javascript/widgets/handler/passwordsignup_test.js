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
goog.require('firebaseui.auth.widget.handler.common');
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
        var expectedUser = {
          'email': passwordAccount.getEmail(),
          'displayName': passwordAccount.getDisplayName()
        };
        testAuth.setUser(expectedUser);
        testAuth.currentUser.assertUpdateProfile([{
          'displayName': 'Password User'
        }]);
        var expectedUserCredential = {
          'user': testAuth.currentUser,
          'credential': null,
          'operationType': 'signIn',
          'additionalUserInfo': {'providerId': 'password', 'isNewUser': true}
        };
        return expectedUserCredential;
      });
}


function testHandlePasswordSignUp() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  assertTosPpFooter('http://localhost/tos', 'http://localhost/privacy_policy');
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
    externalAuth.assertUpdateCurrentUser(
        [testAuth.currentUser],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePasswordSignUp_fullMessage() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail(), undefined, undefined, true);
  assertPasswordSignUpPage();
  assertTosPpFullMessage(
      'http://localhost/tos', 'http://localhost/privacy_policy');
}


function testHandlePasswordSignUp_fullMessage_noUrl() {
  app.setConfig({
    'tosUrl': undefined,
    'privacyPolicyUrl': undefined
  });
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail(), undefined, undefined, true);
  assertPasswordSignUpPage();
  assertTosPpFullMessage(null, null);
}


function testHandlePasswordSignUp_anonymousUpgrade_success() {
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  var cred = new firebase.auth.EmailAuthProvider.credential(
      passwordAccount.getEmail(), '123123');
  externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
      [cred],
      function() {
        // User should be signed in.
        externalAuth.setUser({
          'uid': '12345678'
        });
        return {
          'user': externalAuth.currentUser,
          'credential': null,
          'operationType': 'link',
          'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
        };
      });
  return externalAuth.process().then(function() {
    externalAuth.currentUser.assertUpdateProfile([{
      'displayName': 'Password User'
    }]);
    return externalAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePasswordSignUp_anonUpgrade_signInSuccessWithAuthResult() {
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true),
      'signInFailure': signInFailureCallback
    },
    'autoUpgradeAnonymousUsers': true,
    'tosUrl': undefined,
    'privacyPolicyUrl': undefined
  });
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  assertTosPpFooter(null, null);
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  var cred = new firebase.auth.EmailAuthProvider.credential(
      passwordAccount.getEmail(), '123123');
  externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
      [cred],
      function() {
        // User should be signed in.
        externalAuth.setUser({
          'uid': '12345678'
        });
        return {
          'user': externalAuth.currentUser,
          'credential': null,
          'operationType': 'link',
          'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
        };
      });
  return externalAuth.process().then(function() {
    externalAuth.currentUser.assertUpdateProfile([{
      'displayName': 'Password User'
    }]);
    return externalAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
    var expectedAuthResult = {
      'user': externalAuth.currentUser,
      // Password credential should not be exposed to callback.
      'credential': null,
      // Operation type should be link for anonymous upgrade flow.
      'operationType': 'link',
      'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult, undefined);
  });
}


function testHandlePasswordSignUp_anonymousUpgrade_emailInUse() {
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), 'Password User');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  var cred = new firebase.auth.EmailAuthProvider.credential(
      passwordAccount.getEmail(), '123123');
  var error = {
    'code': 'auth/email-already-in-use'
  };
  externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
      [cred], null, error);
  return externalAuth.process().then(function() {
    testAuth.assertFetchSignInMethodsForEmail(
        [passwordAccount.getEmail()], ['password']);
    return testAuth.process();
  }).then(function() {
    assertPasswordSignUpPage();
    assertEquals(
        firebaseui.auth.widget.handler.common.getErrorMessage(error),
        getEmailErrorMessage());
  });
}


function testHandlePasswordSignUp_reset() {
  // Test reset after password sign-up handler called.
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  // Reset current rendered widget page.
  app.getAuth().assertSignOut([]);
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandlePasswordSignUp_escapeDisplayName() {
  firebaseui.auth.widget.handler.handlePasswordSignUp(
      app, container, passwordAccount.getEmail());
  assertPasswordSignUpPage();
  goog.dom.forms.setValue(getNameElement(), '<script>doSthBad();</script>');
  goog.dom.forms.setValue(getNewPasswordElement(), '123123');
  submitForm();
  testAuth.assertCreateUserWithEmailAndPassword(
      [passwordAccount.getEmail(), '123123'], function() {
        testAuth.setUser({
          'email': passwordAccount.getEmail()
        });
        // Display name should be sanitized.
        testAuth.currentUser.assertUpdateProfile([{
          'displayName': '&lt;script&gt;doSthBad();&lt;/script&gt;'
        }]);
        return {
          'user': testAuth.currentUser,
          'credential': null,
          'operationType': 'signIn',
          'additionalUserInfo': {'providerId': 'password', 'isNewUser': true}
        };
      });
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [testAuth.currentUser],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
  });
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
        return {
          'user': testAuth.currentUser,
          'credential': null,
          'operationType': 'signIn',
          'additionalUserInfo': {'providerId': 'password', 'isNewUser': true}
        };
      });
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [testAuth.currentUser],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
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
    externalAuth.assertUpdateCurrentUser(
        [testAuth.currentUser],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    // SignInCallback is called. No password credential is passed.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser, null, undefined);
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePasswordSignUp_signInSuccessWithAuthResultCallback() {
  // Provide a signInSuccessWithAuthResult callback.
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(false)
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
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [testAuth.currentUser],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      'user': externalAuth.currentUser,
      // Password credential should not be exposed to callback.
      'credential': null,
      'operationType': 'signIn',
      // isNewUser exposed to callback should still be true.
      'additionalUserInfo': {'providerId': 'password', 'isNewUser': true}
    };
    testAuth.assertSignOut([]);
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult, undefined);
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
  // Sign in method found for email.
  testAuth.assertFetchSignInMethodsForEmail(
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
  // No sign in method found for email.
  testAuth.assertFetchSignInMethodsForEmail(
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
  // Error triggered while fetching sign in methods for email.
  testAuth.assertFetchSignInMethodsForEmail(
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
    externalAuth.assertUpdateCurrentUser(
        [testAuth.currentUser],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
  });
}
