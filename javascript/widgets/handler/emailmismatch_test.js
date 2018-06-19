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
 * @fileoverview Test for email mismatch handler.
 */

goog.provide('firebaseui.auth.widget.handler.EmailMismatchTest');
goog.setTestOnly('firebaseui.auth.widget.handler.EmailMismatchTest');


goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler.handleEmailMismatch');
/** @suppress {extraRequire} Required for page navigation after form cancel
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
/** @suppress {extraRequire} Required for page navigation after form cancel
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleFederatedSignIn');
/** @suppress {extraRequire} Required for page navigation after form submission
 *      to work. */
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');


var pendingEmailCredential = null;


/**
 * Creates and saves the email credentials, necessary for the view to load.
 * @param {string} email The user's email.
 */
function setPendingCredentials(email) {
  // Pending credential stored.
  pendingCredential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'formerFacebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCredential = new firebaseui.auth.PendingEmailCredential(
      email, pendingCredential);
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, app.getAppId());
}


function testHandleEmailMismatch_noPendingEmailCredential() {
  // Test when no pending email (error).

  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  var currentUser = {email: federatedAccount.getEmail()};
  var authResult = {
    'user': currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  // Provider sign-in page should show.
  assertProviderSignInPage();
}


function testHandleEmailMismatch_reset() {
  // Test when reset is called after handle email mismatch call.

  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email.
  var pendingEmailCredential =
      new firebaseui.auth.PendingEmailCredential('other@example.com');
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, app.getAppId());
  var currentUser = {email: federatedAccount.getEmail()};
  var authResult = {
    'user': currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  // Email mismatch page rendered.
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
  // No pending email credential.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
      app.getAppId()));
}


function testHandleEmailMismatch_linking_continue() {
  // Test handleEmailMismatch when continue button is clicked and the user was
  // doing the linking flow.

  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email and pending credential.
  setPendingCredentials('other@example.com');
  var currentUser = {email: federatedAccount.getEmail()};
  testAuth.setUser(currentUser);
  var authResult = {
    'user': testAuth.currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click continue.
  submitForm();
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
    testUtil.assertGoTo('http://localhost/home');
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
}


function testHandleEmailMismatch_linking_continue_signInWithAuthResultCb() {
  // Test handleEmailMismatch when continue button is clicked and the user was
  // doing the linking flow.

  // Set config signInSuccessWithAuthResult callback with false return value.
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email and pending credential.
  setPendingCredentials('other@example.com');
  var currentUser = {email: federatedAccount.getEmail()};
  testAuth.setUser(currentUser);
  var authResult = {
    'user': testAuth.currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click continue.
  submitForm();
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
      // Federated credential should be exposed to callback.
      'credential': credential,
      'operationType': 'signIn',
      'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
    };
    // // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult, undefined);
    testUtil.assertGoTo('http://localhost/home');
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
}


function testHandleEmailMismatch_linking_continue_upgradeAnonymous() {
  // Test handleEmailMismatch when continue button is clicked and the user was
  // doing the linking flow with an eligible anonymous user available.

  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email and pending credential.
  setPendingCredentials('other@example.com');
  var currentUser = {email: federatedAccount.getEmail()};
  testAuth.setUser(currentUser);
  var authResult = {
    'user': testAuth.currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click continue.
  submitForm();
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    // Trigger initial onAuthStateChanged listener.
    externalAuth.runAuthChangeHandler();
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Linking the credential to continue with to the existing anonymous user.
    externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential],
        function() {
          externalAuth.setUser(testAuth.currentUser);
          return {
            'user': externalAuth.currentUser,
            'credential': credential,
            'operationType': 'link',
            'additionalUserInfo': {
              'providerId': 'google.com',
              'isNewUser': false
            }
          };
        });
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
}


function testHandleEmailMismatch_linking_continue_upgradeAnonymous_error() {
  // Test handleEmailMismatch when continue button is clicked and the user was
  // doing the linking flow with an eligible anonymous user available.
  // SignInSuccess callback is provided so when signIn/link on external
  // instance, it uses sign in method that returns user.

  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email and pending credential.
  setPendingCredentials('other@example.com');
  var currentUser = {email: federatedAccount.getEmail()};
  testAuth.setUser(currentUser);
  var authResult = {
    'user': testAuth.currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  // Expected linkWithCredential error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': credential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected signInFailure FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      credential);
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click continue.
  submitForm();
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    // Trigger initial onAuthStateChanged listener.
    externalAuth.runAuthChangeHandler();
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Linking the credential to continue with to the existing anonymous user.
    externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential],
        null,
        expectedError);
    return externalAuth.process();
  }).then(function() {
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // signInFailure callback triggered with expected FirebaseUI error.
    assertSignInFailure(expectedMergeError);
  });
}


function testHandleEmailMismatch_linking_anon_error_signInWithAuthResultCb() {
  // Test handleEmailMismatch when continue button is clicked and the user was
  // doing the linking flow with an eligible anonymous user available.
  // SignInSuccessWithAuthResult callback is provided so when signIn/link on
  // external instance, it uses sign in method that returns userCredential.

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
  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email and pending credential.
  setPendingCredentials('other@example.com');
  var currentUser = {email: federatedAccount.getEmail()};
  testAuth.setUser(currentUser);
  var authResult = {
    'user': testAuth.currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  // Expected linkAndRetrieveDataWithCredential error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': credential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected signInFailure FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      credential);
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click continue.
  submitForm();
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    // Trigger initial onAuthStateChanged listener.
    externalAuth.runAuthChangeHandler();
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Linking the credential to continue with to the existing anonymous user.
    externalAuth.currentUser.assertLinkAndRetrieveDataWithCredential(
        [credential],
        null,
        expectedError);
    return externalAuth.process();
  }).then(function() {
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // signInFailure callback triggered with expected FirebaseUI error.
    assertSignInFailure(expectedMergeError);
  });
}


function testHandleEmailMismatch_signIn_continue() {
  // Test handleEmailMismatch when continue button is clicked and the user was
  // doing the sign-in flow.

  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email.
  var pendingEmailCredential =
      new firebaseui.auth.PendingEmailCredential('other@example.com');
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, app.getAppId());
  var currentUser = {email: federatedAccount.getEmail()};
  testAuth.setUser(currentUser);
  var authResult = {
    'user': testAuth.currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  testAuth.setUser(currentUser);
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click continue.
  submitForm();
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
    testUtil.assertGoTo('http://localhost/home');
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
}


function testHandleEmailMismatch_signIn_continue_signInWithAuthResultCb() {
  // Test handleEmailMismatch when continue button is clicked and the user was
  // doing the sign-in flow.

  // Set config signInSuccessWithAuthResult callback with false return value.
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email.
  var pendingEmailCredential =
      new firebaseui.auth.PendingEmailCredential('other@example.com');
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, app.getAppId());
  var currentUser = {email: federatedAccount.getEmail()};
  testAuth.setUser(currentUser);
  var authResult = {
    'user': testAuth.currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click continue.
  submitForm();
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
      'user': testAuth.currentUser,
      // Federated credential should be exposed to callback.
      'credential': credential,
      'operationType': 'signIn',
      'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
    };
    // // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult, undefined);
    testUtil.assertGoTo('http://localhost/home');
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  });
}


function testHandleEmailMismatch_linking_cancel() {
  // Test handlEmailMismatch when cancel button is clicked and the user was
  // doing the linking flow.

  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email and pending credential.
  setPendingCredentials('other@example.com');
  var currentUser = {email: federatedAccount.getEmail()};
  var authResult = {
    'user': currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click cancel.
  clickSecondaryLink();
  assertFederatedLinkingPage('other@example.com');
  assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(app.getAppId()));
}


function testHandleEmailMismatch_linking_cancel_upgradeAnonymous() {
  // Test handlEmailMismatch when cancel button is clicked and the user was
  // doing the linking flow with an eligible anonymous user available.

  // Enable anonymous user upgrade.
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous user signed in.
  externalAuth.setUser(anonymousUser);
  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email and pending credential.
  setPendingCredentials('other@example.com');
  var currentUser = {email: federatedAccount.getEmail()};
  var authResult = {
    'user': currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click cancel.
  clickSecondaryLink();
  // User should be redirect back to federated linking page with the originally
  // intended email to sign in with.
  assertFederatedLinkingPage('other@example.com');
  // Pending email credential should still be available.
  assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(app.getAppId()));
}


function testHandleEmailMismatch_signIn_cancel() {
  // Test handlEmailMismatch when cancel button is clicked and the user was
  // doing the sign-in flow.

  // The credentials returned from the provider.
  var credential = firebaseui.auth.idp.getAuthCredential({
    'idToken': 'googleIdToken',
    'providerId': 'google.com'
  });
  // Store pending email.
  var pendingEmailCredential =
      new firebaseui.auth.PendingEmailCredential('other@example.com');
  firebaseui.auth.storage.setPendingEmailCredential(
      pendingEmailCredential, app.getAppId());
  var currentUser = {email: federatedAccount.getEmail()};
  testAuth.setUser(currentUser);
  var authResult = {
    'user': testAuth.currentUser,
    'credential': credential,
    'operationType': 'signIn',
    'additionalUserInfo': {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.handleEmailMismatch(
      app, container, authResult);
  assertEmailMismatchPage(federatedAccount.getEmail(), 'other@example.com');
  // Click cancel.
  clickSecondaryLink();
  assertFederatedLinkingPage('other@example.com');
  assertTrue(firebaseui.auth.storage.hasPendingEmailCredential(app.getAppId()));
}
