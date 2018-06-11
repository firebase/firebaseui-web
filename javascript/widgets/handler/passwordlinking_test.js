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
 * @fileoverview Test for password linking handler.
 */

goog.provide('firebaseui.auth.widget.handler.PasswordLinkingTest');
goog.setTestOnly('firebaseui.auth.widget.handler.PasswordLinkingTest');

goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handlePasswordLinking');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handlePasswordRecovery');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.testing.events');


var credential = null;


/**
 * Creates and saves the credentials, necessary for the view to load.
 */
function setPendingEmailCredentials() {
  // Pending credential stored.
  credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      passwordAccount.getEmail(), credential);
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCred, app.getAppId());
}


/**
 * Asserts a successful password linking flow, with the given credential.
 * @param {!Object} credential The pending credential to link to the user.
 */
function assertSuccessfulPasswordLinking(credential) {
  testAuth.assertSignInWithEmailAndPassword(
      [passwordAccount.getEmail(), '123'], function() {
        testAuth.setUser({
          'email': passwordAccount.getEmail(),
          'displayName': passwordAccount.getDisplayName()
        });
        var expectedUserCredential = {
          'user': testAuth.currentUser,
          'credential': credential,
          'operationType': 'link',
          'additionalUserInfo': {
            'providerId': 'facebook.com',
            'isNewUser': false
          }
        };
        testAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
            [credential], expectedUserCredential);
        return {
          'user': testAuth.currentUser,
          'credential': null,
          'operationType': 'signIn',
          'additionalUserInfo': {'providerId': 'password', 'isNewUser': false}
        };
      });
}


function testHandlePasswordLinking() {
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  assertSuccessfulPasswordLinking(credential);
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
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandlePasswordLinking_upgradeAnonymous() {
  setPendingEmailCredentials();
  // Expected linkWithCredential error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': credential,
    'email': passwordAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      credential);
  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  // Assert successful password linking flow on internal Auth instance.
  assertSuccessfulPasswordLinking(credential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    // Trigger initial onAuthStateChanged listener.
    externalAuth.runAuthChangeHandler();
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Assert existing credential linking triggered expected error on external
    // anonymous user.
    externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential],
        null,
        expectedError);
    return externalAuth.process();
  }).then(function() {
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // No info bar message shown.
    assertNoInfoBarMessage();
    // signInFailure triggered with expected error.
    assertSignInFailure(expectedMergeError);
  });
}


function testHandlePasswordLinking_upgradeAnon_signInSuccessWithAuthResult() {
  setPendingEmailCredentials();
  // Expected linkAndRetrieveDataWithCredential error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': credential,
    'email': passwordAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      credential);
  // Enable anonymous user upgrade.
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true),
      'signInFailure': signInFailureCallback
    },
    'autoUpgradeAnonymousUsers': true
  });
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  // Assert successful password linking flow on internal Auth instance.
  assertSuccessfulPasswordLinking(credential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    // Trigger initial onAuthStateChanged listener.
    externalAuth.runAuthChangeHandler();
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Assert existing credential linking triggered expected error on external
    // anonymous user.
    externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential],
        null,
        expectedError);
    return externalAuth.process();
  }).then(function() {
    // Pending credential and email should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // No info bar message shown.
    assertNoInfoBarMessage();
    // signInFailure triggered with expected error.
    assertSignInFailure(expectedMergeError);
  });
}


function testHandlePasswordLinking_reset() {
  // Test reset after password linking handler called.
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  // Reset current rendered widget page.
  app.getAuth().assertSignOut([]);
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
  // Pending credential should be cleared from storage.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
      app.getAppId()));
}


function testHandlePasswordLinking_signInCallback() {
  // Set config sign in success callback with false return value.
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  assertSuccessfulPasswordLinking(credential);
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
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Sign in callback should be triggered.
    // SignInCallback is called.
    assertSignInSuccessCallbackInvoked(
        testAuth.currentUser,
        credential,
        undefined);
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePasswordLinking_signInSuccessWithAuthResultCallback() {
  // Set config signInSuccessWithAuthResult callback with false return value.
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(false)
    }
  });
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  goog.dom.forms.setValue(getPasswordElement(), '123');
  submitForm();
  assertSuccessfulPasswordLinking(credential);
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
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    var expectedAuthResult = {
      'user': externalAuth.currentUser,
      // Linked federated credential should be exposed to callback.
      'credential': credential,
      // Operation type should still be signIn for password linking flow.
      'operationType': 'signIn',
      'additionalUserInfo': {'providerId': 'facebook.com', 'isNewUser': false}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult, undefined);
    // Container should be cleared.
    assertComponentDisposed();
  });
}


function testHandlePasswordLinking_noPendingCredential() {
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  // Provider sign-in page should show.
  assertProviderSignInPage();
}


function testHandlePasswordLinking_forgotPassword() {
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  // Pending credential should be cleared from storage.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
      app.getAppId()));
  goog.testing.events.fireClickSequence(
      goog.dom.getElementByClass('firebaseui-id-secondary-link', container));
  assertPasswordRecoveryPage();
}


function testHandlePasswordLinking_wrongPassword() {
  var error = {'code': 'auth/wrong-password'};
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  // Pending credential should be cleared from storage.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
      app.getAppId()));
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
        assertPasswordLinkingPage(passwordAccount.getEmail());
        assertEquals(
            firebaseui.auth.widget.handler.common.getErrorMessage(error),
            getPasswordErrorMessage());

        // Try the correct password.
        goog.dom.forms.setValue(getPasswordElement(), '123');
        submitForm();
        assertSuccessfulPasswordLinking(credential);
        return testAuth.process();
        // Sign out from internal instance and then sign in with passed
        // credential to external instance.
      }).then(function() {
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


function testHandlePasswordLinking_passwordEmpty() {
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  assertPasswordLinkingPage(passwordAccount.getEmail());
  // Pending credential should be cleared from storage.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
      app.getAppId()));
  submitForm();
  // No submission without password.
  assertPasswordLinkingPage(passwordAccount.getEmail());
}


function testHandlePasswordLinking_inProcessing() {
  setPendingEmailCredentials();
  firebaseui.auth.widget.handler.handlePasswordLinking(
      app, container, passwordAccount.getEmail());
  // Pending credential should be cleared from storage.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
      app.getAppId()));
  assertPasswordLinkingPage(passwordAccount.getEmail());
  return goog.Promise.resolve()
      .then(function() {
        goog.dom.forms.setValue(getPasswordElement(), '123');
        submitForm();
        delayForBusyIndicatorAndAssertIndicatorShown();
        // Click submit again.
        submitForm();
        // Only one request sent.
        testAuth.assertSignInWithEmailAndPassword(
            [passwordAccount.getEmail(), '123'], null, {
              'code': 'auth/internal-error'
            });
        return testAuth.process();
      })
      .then(function() {
        assertBusyIndicatorHidden();
        // Submit again.
        submitForm();
        assertSuccessfulPasswordLinking(credential);
        return testAuth.process();
      })
      .then(function() {
        // Sign out from internal instance and then sign in with passed
        // credential to external instance.
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
