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
 * @fileoverview Tests for common handler utilities.
 */
goog.provide('firebaseui.auth.widget.handler.CommonTest');
goog.setTestOnly('firebaseui.auth.widget.handler.CommonTest');

goog.require('firebaseui.auth.Account');
goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.PendingEmailCredential');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.page.Callback');
goog.require('firebaseui.auth.ui.page.ProviderSignIn');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInSent');
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
goog.require('firebaseui.auth.widget.handler.handlePasswordLinking');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignUp');
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
/** @suppress {extraRequire} */
goog.require('firebaseui.auth.widget.handler.handleSendEmailLinkForSignIn');
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.dom.forms');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.recordFunction');


var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();


var federatedAccount = new firebaseui.auth.Account('user@example.com',
    'Federated User');
var federatedAccountWithProvider = new firebaseui.auth.Account(
    'user@example.com', 'Federated User', null, 'google.com');


function testSetLoggedInWithAuthResult_incompatibilityError() {
  // Test when an incompatible version of Firebase.js is used with latest
  // version of firebaseui. In that case a user is passed instead of an
  // UserCredential object. This results in an undefined user being
  // passed to setLoggedInWithAuthResult.
  testStubs.set(
      firebaseui.auth.log,
      'error',
      goog.testing.recordFunction());
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  testAuth.setUser(passwordUser);
  // AuthResult will have an undefined user.
  var internalAuthResult = {
    'user': undefined,
    'credential': cred,
    'operationType': undefined,
    'additionalUserInfo': undefined
  };
  asyncTestCase.waitForSignals(1);
  return firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult)
      .then(function() {
        // The above will throw an error which should be logged to the console.
        assertEquals(1, firebaseui.auth.log.error.getCallCount());
        assertEquals(
            firebaseui.auth.AuthUI.INCOMPATIBLE_DEPENDENCY_ERROR,
            firebaseui.auth.log.error.getLastCall().getArgument(0));
        var actualError =
            firebaseui.auth.log.error.getLastCall().getArgument(1);
        assertEquals(
            firebaseui.auth.AuthUI.INCOMPATIBLE_DEPENDENCY_ERROR,
            actualError.message);
        // Error should be displayed in the info bar.
        assertInfoBarMessage(
            firebaseui.auth.AuthUI.INCOMPATIBLE_DEPENDENCY_ERROR,
            testComponent);
        asyncTestCase.signal();
      });
}

function testSetLoggedInWithAuthResult() {
  testStubs.set(
      firebaseui.auth.log,
      'warning',
      goog.testing.recordFunction());
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true),
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  assertEquals(1, firebaseui.auth.log.warning.getCallCount());
  var deprecateWarning = 'signInSuccess callback is deprecated. Please use ' +
      'signInSuccessWithAuthResult callback instead.';
  assertEquals(deprecateWarning,
        firebaseui.auth.log.warning.getLastCall().getArgument(0));
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  testAuth.setUser(passwordUser);
  var internalAuthResult = {
    'user': passwordUser,
    'credential': cred,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'password', 'isNewUser': true}
  };
  // Confirm revertLanguageCode called on setLoggedInWithAuthResult.
  assertNoRevertLanguageCode();
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  assertRevertLanguageCode(app);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      // Credential should not be returned in callback for password provider.
      'credential': null,
      'operationType': 'signIn',
      // isNewUser should be associated with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'password', 'isNewUser': true}
    };
    // Both old and new signInSuccess callbacks are provided.
    // Warning will be logged.
    /** @suppress {missingRequire} */
    assertEquals(2, firebaseui.auth.log.warning.getCallCount());
    var callbackWarning = 'Both signInSuccess and ' +
        'signInSuccessWithAuthResult callbacks are provided. Only ' +
        'signInSuccessWithAuthResult callback will be invoked.';
    /** @suppress {missingRequire} */
    assertEquals(callbackWarning,
        firebaseui.auth.log.warning.getLastCall().getArgument(0));
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        undefined);
    testUtil.assertGoTo('http://localhost/home');
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_federatedLinking() {
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  asyncTestCase.waitForSignals(1);
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'link',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': false}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      // Opeartion type for linking flow should still be signIn.
      'operationType': 'signIn',
      // isNewUser should be false for linking flow.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': false}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        undefined);
    testUtil.assertGoTo('http://localhost/home');
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_noRedirect() {
  app.setConfig({
    'callbacks': {
      // Provide a callback returns false, will not redirect after signing in.
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(false)
    }
  });
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  testAuth.setUser(passwordUser);
  var internalAuthResult = {
    'user': passwordUser,
    'credential': cred,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'password', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': null,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'password', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        undefined);
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_notRememberAccount() {
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  testAuth.setUser(passwordUser);
  var internalAuthResult = {
    'user': passwordUser,
    'credential': cred,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'password', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      // Credential should not be returned in callback for password provider.
      'credential': null,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'password', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        undefined);
    testUtil.assertGoTo('http://localhost/home');
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_storageAutoRedirect() {
  asyncTestCase.waitForSignals(1);
  var redirectUrl = 'http://www.example.com';
  // Set redirect URL in storage.
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  app.setConfig({
    // No need for a signInSuccessUrl here and it should not raise an error.
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        redirectUrl);
    // Continue to redirect URL specified in storage.
    testUtil.assertGoTo(redirectUrl);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_storageNoRedirect() {
  asyncTestCase.waitForSignals(1);
  var redirectUrl = 'http://www.example.com';
  // Set redirect URL in storage.
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(false)
    }
  });
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        redirectUrl);
    testUtil.assertGoTo(null);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_onlySignInSuccessCallback() {
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  testAuth.setUser(passwordUser);
  var internalAuthResult = {
    'user': passwordUser,
    'credential': cred,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'password', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    // SignInSuccessCallback is called.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        null,
        undefined);
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_alreadySignedIn() {
  // Test when user already signed in on external Auth instance.
  asyncTestCase.waitForSignals(1);
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  externalAuth.setUser(federatedUser);
  var externalAuthResult = {
    'user': externalAuth.currentUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': false}
  };
  return firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, externalAuthResult, true).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': false}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        undefined);
    testUtil.assertGoTo('http://localhost/home');
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_redirectNoRedirectUrl() {
  asyncTestCase.waitForSignals(1);
  app.setConfig({
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    // No redirect occurred.
    testUtil.assertGoTo(null);
    // Error should be displayed in the info bar.
    assertInfoBarMessage(
        'No redirect URL has been found. You must either specify a signInSuc' +
        'cessUrl in the configuration, pass in a redirect URL to the widget ' +
        'URL, or return false from the callback.',
        testComponent);
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_updateCurrentUserError() {
  // Test when setLoggedInWithAuthResult is triggered and updateCurrentUser
  // fails with some error.
  asyncTestCase.waitForSignals(1);
  var expectedError = {
    'code': 'auth/internal-error',
    'message': 'Internal error'
  };
  app.setConfig({
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  // Render the UI.
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, component, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        null,
        expectedError);
    return externalAuth.process();
  }).then(function() {
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    // No redirect occurred.
    testUtil.assertGoTo(null);
    // Same page rendered.
    assertCallbackPage();
    // Error should be displayed in the info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError));
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_storageManualRedirect() {
  asyncTestCase.waitForSignals(1);
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  // Test sign in success callback with a manual redirect.
  app.setConfig({
    // No need for a signInSuccessUrl here and it should not raise an error.
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccessWithAuthResult':
          signInSuccessWithAuthResultCallback(false, true)
    }
  });
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    // SignInSuccessWithAuthResultCallback is called.
    // redirectUrl passed to callback, developer has to manually redirect.
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        redirectUrl);
    // Developer manually continues to redirect URL specified in storage.
    testUtil.assertGoTo(redirectUrl);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_popup() {
  testUtil.setHasOpener(true);
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  asyncTestCase.waitForSignals(1);
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        undefined);
    testUtil.assertOpenerGoTo('http://localhost/home');
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_popup_noRedirect() {
  testUtil.setHasOpener(true);
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(false)
    }
  });
  asyncTestCase.waitForSignals(1);
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
    };
    // Callback supplied. Window should only be closed by developer.
    testUtil.assertWindowNotClosed(window);
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        undefined);
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_popup_storageAutoRedirect() {
  testUtil.setHasOpener(true);
  asyncTestCase.waitForSignals(1);
  var redirectUrl = 'http://www.example.com';
  // Set redirect URL in storage.
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  app.setConfig({
    // No need for a signInSuccessUrl here and it should not raise an error.
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        redirectUrl);
    // Continue to redirect URL specified in storage.
    testUtil.assertOpenerGoTo(redirectUrl);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_popup_storageNoRedirect() {
  testUtil.setHasOpener(true);
  asyncTestCase.waitForSignals(1);
  var redirectUrl = 'http://www.example.com';
  // Set redirect URL in storage.
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  app.setConfig({
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(false)
    }
  });
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        redirectUrl);
    // No redirect.
    testUtil.assertOpenerGoTo(null);
    // Callback supplied. Window should only be closed by developer.
    testUtil.assertWindowNotClosed(window);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_popup_storageManualRedirect() {
  testUtil.setHasOpener(true);
  asyncTestCase.waitForSignals(1);
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  // Test sign in success callback with a manual redirect.
  app.setConfig({
    // No need for a signInSuccessUrl here and it should not raise an error.
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccessWithAuthResult':
          signInSuccessWithAuthResultCallback(false, true)
    }
  });
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    testAuth.assertSignOut([]);
    // SignInSuccessWithAuthResultCallback is called.
    // redirectUrl passed to callback, developer has to manually redirect.
    var expectedAuthResult = {
      // User returned should be the one signed in external Auth instance.
      'user': externalAuth.currentUser,
      'credential': federatedCredential,
      'operationType': 'signIn',
      // isNewUser should be associate with the internal Auth instance.
      'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
    };
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        redirectUrl);
    // Callback supplied. Window should only be closed by developer.
    testUtil.assertWindowNotClosed(window);
    // Developer manually continues to redirect URL specified in storage.
    testUtil.assertGoTo(redirectUrl);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_popup_redirectNoRedirectUrl() {
  asyncTestCase.waitForSignals(1);
  app.setConfig({
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
    }
  });
  testUtil.setHasOpener(true);
  testAuth.setUser(federatedUser);
  var internalAuthResult = {
    'user': federatedUser,
    'credential': federatedCredential,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'google.com', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    // No redirect occurred.
    testUtil.assertGoTo(null);
    // Error should be displayed in the info bar.
    assertInfoBarMessage(
        'No redirect URL has been found. You must either specify a signInSuc' +
        'cessUrl in the configuration, pass in a redirect URL to the widget ' +
        'URL, or return false from the callback.',
        testComponent);
    asyncTestCase.signal();
  });
}


function testSetLoggedInWithAuthResult_popup_noCallback_storageRedirect() {
  // Clear callbacks from configuration, set signInSuccessUrl which will be
  // overridden.
  app.setConfig({
    'callbacks': null,
    'signInSuccessUrl': 'http://localhost/home'
  });
  asyncTestCase.waitForSignals(1);
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  testUtil.setHasOpener(true);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  testAuth.setUser(passwordUser);
  var internalAuthResult = {
    'user': passwordUser,
    'credential': cred,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': 'password', 'isNewUser': true}
  };
  firebaseui.auth.widget.handler.common.setLoggedInWithAuthResult(
      app, testComponent, internalAuthResult);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.assertUpdateCurrentUser(
        [internalAuthResult['user']],
        function() {
          externalAuth.setUser(testAuth.currentUser);
        });
    return externalAuth.process();
  }).then(function() {
    // Assert opener continues to redirect URL specified in storage.
    testUtil.assertOpenerGoTo(redirectUrl);
    testUtil.assertWindowClosed(window);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testHandleUnrecoverableError() {
  // Test rendering of unrecoverable error handling.
  var errorMessage = 'Some unrecoverable error message';
  firebaseui.auth.widget.handler.common.handleUnrecoverableError(
      app, container, errorMessage);
  // Assert unrecoverable error message page with correct message.
  assertUnrecoverableErrorPage(errorMessage);
  // Reset current rendered widget page.
  app.getAuth().assertSignOut([]);
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testHandleSignInFetchSignInMethodsForEmail_unregistered_password() {
  var signInMethods = [];
  var email = 'user@example.com';
  var displayName = 'John Doe';
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email, displayName);
  // Password sign up page should show with email and display name populated.
  assertPasswordSignUpPage();
  assertTosPpFooter(tosCallback, 'http://localhost/privacy_policy');
  assertEquals(
        email,
        goog.dom.forms.getValue(getEmailElement()));
    assertEquals(
        displayName,
        goog.dom.forms.getValue(getNameElement()));
}


function testHandleSignInWithEmail() {
  testStubs.replace(
      firebaseui.auth.storage,
      'setRedirectStatus',
      goog.testing.recordFunction());
  app.setConfig({
    'credentialHelper': firebaseui.auth.widget.Config.CredentialHelper.NONE
  });
  firebaseui.auth.widget.handler.common.handleSignInWithEmail(app, container);
  assertSignInPage();
  /** @suppress {missingRequire} */
  assertEquals(0,
      firebaseui.auth.storage.setRedirectStatus.getCallCount());
}


function testHandleSignInFetchSignInMethodsForEmail_unregistered_emailLink() {
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings();
  var signInMethods = [];
  var email = 'user@example.com';
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email);
  assertCallbackPage();
  testAuth.assertSendSignInLinkToEmail([email, expectedActionCodeSettings]);
  testAuth.process().then(function() {
    assertEmailLinkSignInSentPage();
    // Email for email link sign in should be stored.
    assertEquals(
        email,
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    mockClock.tick(3600000);
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testHandleSignInFetchSignInMethodsForEmail_unregistered_fullMsg() {
  var signInMethods = [];
  var email = 'user@example.com';
  var displayName = 'John Doe';
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email, displayName, undefined, true);
  // Password sign up page should show with email and display name populated.
  assertPasswordSignUpPage();
  assertTosPpFullMessage(tosCallback, 'http://localhost/privacy_policy');
  assertEquals(
        email,
        goog.dom.forms.getValue(getEmailElement()));
    assertEquals(
        displayName,
        goog.dom.forms.getValue(getNameElement()));
}


function testHandleSignInFetchSignInMethodsForEmail_registeredPasswordAcct() {
  var signInMethods = ['google.com', 'facebook.com', 'password'];
  var email = 'user@example.com';
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email);
  // Password sign-in page should show.
  assertPasswordSignInPage();
  assertTosPpFooter(tosCallback, 'http://localhost/privacy_policy');
  assertEquals(email, goog.dom.forms.getValue(getEmailElement()));
  assertEquals(0, getIdpButtons().length);
}


function testHandleSignInFetchSignInMethodsForEmail_registeredPwdAcctFullMsg() {
  var signInMethods = ['google.com', 'facebook.com', 'password'];
  var email = 'user@example.com';
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email, undefined, undefined, true);
  // Password sign-in page should show.
  assertPasswordSignInPage();
  assertTosPpFullMessage(tosCallback, 'http://localhost/privacy_policy');
  assertEquals(email, goog.dom.forms.getValue(getEmailElement()));
  assertEquals(0, getIdpButtons().length);
}


function testHandleSignInFetchSignInMethodsForEmail_registeredEmailLinkAcct() {
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var signInMethods = ['emailLink'];
  var expectedActionCodeSettings = buildActionCodeSettings();
  var email = 'user@example.com';
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email);
  assertCallbackPage();
  testAuth.assertSendSignInLinkToEmail([email, expectedActionCodeSettings]);
  testAuth.process().then(function() {
    assertEmailLinkSignInSentPage();
    // Email for email link sign in should be stored.
    assertEquals(
        email,
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    mockClock.tick(3600000);
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testHandleSignInFetchSignInMethodsForEmail_emailLinkAcct_error() {
  // Test the case that error is thrown while sending email link.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var signInMethods = ['emailLink'];
  var expectedActionCodeSettings = buildActionCodeSettings();
  var email = 'user@example.com';
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email);
  assertCallbackPage();
  testAuth.assertSendSignInLinkToEmail(
      [email, expectedActionCodeSettings], null, internalError);
  testAuth.process().then(function() {
    // Verify that error message is displayed on the sign in page.
    assertSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testHandleSignInFetchSignInMethodsForEmail_registeredFederatedAcct() {
  // Even email link sign in is available, should be still using google.
  var signInMethods = ['emailLink', 'google.com', 'facebook.com'];
  var email = 'user@example.com';
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email);
  // It should store pending email.
  var expectedEmailCredential = {
    'credential': null,
    'email': email
  };
  assertObjectEquals(
      expectedEmailCredential,
      firebaseui.auth.storage.getPendingEmailCredential(app.getAppId())
          .toPlainObject());
  // Federated Linking page should show.
  assertFederatedLinkingPage(email);
}


function testHandleSignInFetchSignInMethodsForEmail_disabledFederatedAcct() {
  // Even if the account is linked with a SAML provider, as long as it's not
  // enabled in config, the unsupported provider page will be displayed to the
  // user.
  var signInMethods = ['saml.disabledProvider'];
  var email = 'user@example.com';
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email);
  // It should not store pending email.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  // Unsupported provider page should show.
  assertUnsupportedProviderPage(email);
}


function testHandleSignInWithEmail_prefillEmail() {
  const prefilledEmail = 'user@example';
  testStubs.replace(
      firebaseui.auth.storage,
      'setRedirectStatus',
      goog.testing.recordFunction());
  app.setConfig({
    'credentialHelper': firebaseui.auth.widget.Config.CredentialHelper.NONE
  });
  firebaseui.auth.widget.handler.common.handleSignInWithEmail(
      app, container, prefilledEmail);
  assertBlankPage();
  /** @suppress {missingRequire} */
  assertEquals(0,
      firebaseui.auth.storage.setRedirectStatus.getCallCount());
  testAuth.assertFetchSignInMethodsForEmail(
      [prefilledEmail],
      []);
  return testAuth.process().then(() => {
    // Password sign-up page should be shown.
    assertPasswordSignUpPage();
    // The prefilled email should be populated in the email entry.
    assertEquals(prefilledEmail, getEmailElement().value);
    return testAuth.process();
  });
}


function testHandleSignInFetchSignInMethodsForEmail_unsupportedProvider() {
  // When user has previously signed in with email link but only email/password
  // auth is supported in the app's configuration.
  var signInMethods = ['emailLink'];
  var email = 'user@example.com';
  app.updateConfig('signInOptions',  [{'provider': 'password'}]);
  firebaseui.auth.widget.handler.common.handleSignInFetchSignInMethodsForEmail(
      app, container, signInMethods, email);
  // It should not store pending email.
  assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
  // Unsupported provider page should show.
  assertUnsupportedProviderPage(email);
}


function testGetErrorMessage_unknownError_message() {
  var error = {
    code: 'UNKNOWN',
    message: 'Your API Key is invalid.'
  };
  var message = firebaseui.auth.widget.handler.common.getErrorMessage(error);
  assertEquals('Your API Key is invalid.', message);
}


function testGetErrorMessage_unknownError_jsonMessage() {
  testStubs.replace(
      firebaseui.auth.log,
      'error',
      goog.testing.recordFunction());
  var backendMessage = {
   'error': {
    'errors': [
     {
      'domain': 'global',
      'reason': 'invalid',
      'message': ''
     }
    ],
    'code': 400,
    'message': ''
   }
  };
  var error = {
    code: 'UNKNOWN',
    message: JSON.stringify(backendMessage)
  };
  var message = firebaseui.auth.widget.handler.common.getErrorMessage(error);
  /** @suppress {missingRequire} */
  assertEquals(1, firebaseui.auth.log.error.getCallCount());
  /** @suppress {missingRequire} */
  assertEquals(
      'Internal error: ' + JSON.stringify(backendMessage),
      firebaseui.auth.log.error.getLastCall().getArgument(0));
  assertEquals(firebaseui.auth.soy2.strings.internalError().toString(),
      message);
}


function testIsPasswordProviderOnly_multipleMixedProviders() {
  // Set a password and federated providers in the FirebaseUI instance
  // configuration.
  app.updateConfig(
      'signInOptions',
      [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]);
  assertFalse(
      firebaseui.auth.widget.handler.common.isPasswordProviderOnly(app));
}


function testIsPasswordProviderOnly_singlePasswordProvider() {
  // Set a password only provider in the FirebaseUI instance configuration.
  app.updateConfig(
      'signInOptions',
      [firebase.auth.EmailAuthProvider.PROVIDER_ID]);
  assertTrue(
      firebaseui.auth.widget.handler.common.isPasswordProviderOnly(app));
}


function testIsPasswordProviderOnly_singleFederatedProvider() {
  // Set a federated only provider in the FirebaseUI instance configuration.
  app.updateConfig(
      'signInOptions',
      [firebase.auth.GoogleAuthProvider.PROVIDER_ID]);
  assertFalse(
      firebaseui.auth.widget.handler.common.isPasswordProviderOnly(app));
}


function testIsPhoneProviderOnly() {
  // True if single, phone provider given
  app.updateConfig(
      'signInOptions', [firebase.auth.PhoneAuthProvider.PROVIDER_ID]);
  assertTrue(firebaseui.auth.widget.handler.common.isPhoneProviderOnly(app));
}


function testIsPhoneProviderOnly_singleFederatedProvider() {
  // False if phone provider not given
  app.updateConfig(
      'signInOptions', [firebase.auth.GoogleAuthProvider.PROVIDER_ID]);
  assertFalse(firebaseui.auth.widget.handler.common.isPhoneProviderOnly(app));
}


function testIsPhoneProviderOnly_multipleProviders() {
  // False if multiple providers given
  app.updateConfig('signInOptions', [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ]);
  assertFalse(firebaseui.auth.widget.handler.common.isPhoneProviderOnly(app));
}


function testFederatedSignIn_success_redirectMode() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a signInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  // Confirm signInWithRedirect called underneath.
  testAuth.assertSignInWithRedirect([expectedProvider]);
  testAuth.process();

}


function testFederatedSignIn_success_redirectMode_tenantId() {
  app.setTenantId('TENANT_ID');
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a signInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertEquals(
      'TENANT_ID',
      firebaseui.auth.storage.getRedirectStatus(app.getAppId()).getTenantId());
  assertProviderSignInPage();
  // Confirm signInWithRedirect called underneath.
  testAuth.assertSignInWithRedirect([expectedProvider]);
  testAuth.process();

}


function testFederatedSignIn_error_redirectMode() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a signInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  // Confirm signInWithRedirect called underneath.
  testAuth.assertSignInWithRedirect([expectedProvider], null, internalError);
  testAuth.process().then(function() {
    // Error in signInWithRedirect, cancel the pending redirect status.
    assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testFederatedSignIn_success_cordova() {
  simulateCordovaEnvironment();
  var cred  = createMockCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a signInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  // Confirm signInWithRedirect called underneath.
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(function() {
    assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    testAuth.setUser({
      'email': federatedAccount.getEmail(),
      'displayName': federatedAccount.getDisplayName()
    });
    testAuth.assertGetRedirectResult(
        [],
        {
          'user': testAuth.currentUser,
          'credential': cred
        });
    return testAuth.process();
  }).then(function() {
    assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    assertCallbackPage();
    return testAuth.process();
  }).then(function() {
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
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
    asyncTestCase.signal();
  });

}


function testFederatedSignIn_federatedLinkingRequiredError_cordova() {
  simulateCordovaEnvironment();
  var expectedError = {
    'code': 'auth/account-exists-with-different-credential',
    'credential': federatedCredential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(), federatedCredential);
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a signInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  // Confirm signInWithRedirect called underneath.
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(function() {
    testAuth.assertGetRedirectResult(
        [],
        null,
        expectedError);
    return testAuth.process();
  }).then(function() {
    assertNoInfoBarMessage();
    assertCallbackPage();
    // Simulate existing email belongs to a Facebook account.
    testAuth.assertFetchSignInMethodsForEmail(
        [federatedAccount.getEmail()], ['facebook.com']);
    return testAuth.process();
  }).then(function() {
    assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    assertFederatedLinkingPage();
    assertObjectEquals(
      pendingEmailCred,
      firebaseui.auth.storage.getPendingEmailCredential(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testFederatedSignIn_error_cordova() {
  simulateCordovaEnvironment();
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a signInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  // Confirm signInWithRedirect called underneath.
  testAuth.assertSignInWithRedirect([expectedProvider]);
  return testAuth.process().then(function() {
    testAuth.assertGetRedirectResult(
        [],
        null,
        internalError);
    return testAuth.process();
  }).then(function() {
    assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    // Provider sign in page should remain displayed.
    assertProviderSignInPage();
    // Confirm error message shown in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    asyncTestCase.signal();
  });
}


function testFederatedSignIn_anonymousUpgrade_success_redirectMode() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  externalAuth.setUser(anonymousUser);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a linkWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithRedirect called underneath.
  externalAuth.currentUser.assertLinkWithRedirect([expectedProvider]);
  externalAuth.process().then(function() {
    asyncTestCase.signal();
  });
}


function testFederatedSignIn_anonymousUpgrade_error_redirectMode() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  externalAuth.setUser(anonymousUser);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a linkWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithRedirect called underneath.
  externalAuth.currentUser.assertLinkWithRedirect(
      [expectedProvider], null, internalError);
  externalAuth.process().then(function() {
    // Error in linkWithRedirect, cancel the pending redirect status.
    assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    asyncTestCase.signal();
  });
}

function testFederatedSignIn_anonymousUpgrade_success_cordova() {
  simulateCordovaEnvironment();
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  externalAuth.setUser(anonymousUser);
  var cred  = createMockCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a linkInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithRedirect called underneath.
  externalAuth.currentUser.assertLinkWithRedirect([expectedProvider]);
  return externalAuth.process().then(function() {
    assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    externalAuth.setUser({
      'email': federatedAccount.getEmail(),
      'displayName': federatedAccount.getDisplayName()
    });
    externalAuth.assertGetRedirectResult(
        [],
        {
          'user': externalAuth.currentUser,
          'credential': cred
        });
    return externalAuth.process();
  }).then(function() {
    assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    assertCallbackPage();
  }).then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
    asyncTestCase.signal();
  });
}


function testFederatedSignIn_anonymousUpgrade_credInUse_error_cordova() {
  simulateCordovaEnvironment();
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  externalAuth.setUser(anonymousUser);
  var cred  = createMockCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': cred,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      cred);
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a linkInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithRedirect called underneath.
  externalAuth.currentUser.assertLinkWithRedirect([expectedProvider]);
  return externalAuth.process().then(function() {
    assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    externalAuth.assertGetRedirectResult(
        [],
        null,
        expectedError);
    return externalAuth.process();
  }).then(function() {
    // Pending credential should be cleared from storage.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // signInFailure triggered with expected error.
    assertSignInFailure(expectedMergeError);
    asyncTestCase.signal();
  });
}


function testFederatedSignIn_anonymousUpgrade_emailInUse_error_cordova() {
  simulateCordovaEnvironment();
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  externalAuth.setUser(anonymousUser);
  var cred  = createMockCredential({
    'providerId': 'google.com',
    'accessToken': 'ACCESS_TOKEN'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(), cred);
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'credential': cred,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  assertFalse(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  // This will trigger a linkInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.federatedSignIn(
      app, component, 'google.com');
  assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
  assertProviderSignInPage();
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithRedirect called underneath.
  externalAuth.currentUser.assertLinkWithRedirect([expectedProvider]);
  return externalAuth.process().then(function() {
    assertTrue(firebaseui.auth.storage.hasRedirectStatus(app.getAppId()));
    externalAuth.assertGetRedirectResult(
        [],
        null,
        expectedError);
    return externalAuth.process();
  }).then(function() {
    assertCallbackPage();
    testAuth.assertFetchSignInMethodsForEmail(
        [federatedAccount.getEmail()], ['facebook.com']);
    return testAuth.process();
  }).then(function() {
    // The pending credential should be saved here.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getPendingEmailCredential(app.getAppId()));
    // Federated linking flow should be triggered.
    assertFederatedLinkingPage(federatedAccount.getEmail());
    asyncTestCase.signal();
  });
}


function testHandleSignInAnonymously_success() {
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.common.handleSignInAnonymously(
      app, component);
  assertProviderSignInPage();
  externalAuth.assertSignInAnonymously(
      [],
      {
        'user': anonymousUser,
        'credential': null
      });
  externalAuth.process().then(function() {
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
    asyncTestCase.signal();
  });
}


function testHandleSignInAnonymously_signInSuccessCallback() {
  app.updateConfig('callbacks', {
    'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback(true)
  });
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.common.handleSignInAnonymously(
      app, component);
  assertProviderSignInPage();
  var expectedAuthResult = {
    'user': anonymousUser,
    'credential': null,
    'operationType': 'signIn',
    'additionalUserInfo':  {'providerId': null, 'isNewUser': true}
  };
  externalAuth.assertSignInAnonymously(
      [],
      expectedAuthResult);
  externalAuth.process().then(function() {
    // SignInSuccessWithAuthResultCallback is called.
    assertSignInSuccessWithAuthResultCallbackInvoked(
        expectedAuthResult,
        undefined);
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
    asyncTestCase.signal();
  });
}


function testHandleSignInAnonymously_error() {
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.common.handleSignInAnonymously(
      app, component);
  assertProviderSignInPage();
  externalAuth.assertSignInAnonymously(
      [],
      null,
      internalError);
  externalAuth.process().then(function() {
    assertProviderSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    asyncTestCase.signal();
  });
}


function testHandleGoogleYoloCredential_handledSuccessfully_withScopes() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({
    'prompt': 'select_account',
    'login_hint': federatedAccount.getEmail()
  });
  // Enable googleyolo with Google provider and additional scopes.
  app.setConfig({
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'scopes': ['googl1', 'googl2'],
      'customParameters': {'prompt': 'select_account'},
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // This will trigger a signInWithRedirect using the expected provider.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        // Remains on same page until redirect completes.
        assertProviderSignInPage();
        assertTrue(status);
        asyncTestCase.signal();
      });
  // Confirm signInWithRedirect called underneath.
  testAuth.assertSignInWithRedirect([expectedProvider]);
  testAuth.process();
}


function testHandleGoogleYoloCredential_handledSuccessfully_withoutScopes() {
  // Enable googleyolo with Google provider and no additional scopes.
  app.setConfig({
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // This will succeed while callback page will be rendered as the result
  // gets processed before the redirect to success URL occurs.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        // Renders callback page while results are processed.
        assertCallbackPage();
        assertTrue(status);
        asyncTestCase.signal();
      });
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  var cred  = createMockCredential({
    'providerId': 'google.com',
    'idToken': googleYoloIdTokenCredential.credential,
  });
  testAuth.setUser({
    'email': federatedAccount.getEmail(),
    'displayName': federatedAccount.getDisplayName()
  });
  // Confirm signInWithCredential called underneath with
  // successful response.
  testAuth.assertSignInWithCredential(
      [expectedCredential],
      {
        'user': testAuth.currentUser,
        'credential': cred
      });
  // Confirm successful flow completes.
  testAuth.process().then(function() {
    assertCallbackPage();
    return testAuth.process();
  }).then(function() {
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
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleGoogleYoloCredential_unhandled_withoutScopes() {
  // Enable googleyolo with Google provider and no additional scopes.
  app.setConfig({
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // This will fail and an error message will be shown.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        // Remains on the same page.
        assertProviderSignInPage();
        assertFalse(status);
        asyncTestCase.signal();
      });
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Confirm signInWithCredential called underneath with
  // unsuccessful response.
  testAuth.assertSignInWithCredential(
      [expectedCredential],
      null,
      internalError);
  testAuth.process().then(function() {
    // Remains on the same page.
    assertProviderSignInPage();
    // Confirm error message shown in info bar.
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
  });
}


function testHandleGoogleYoloCredential_cancelled_withoutScopes() {
  // Enable googleyolo with Google provider and no additional scopes.
  app.setConfig({
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // This will fail due to the reset call which will interrupt the underlying
  // call.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        // Remains on the same page.
        assertProviderSignInPage();
        assertFalse(status);
        asyncTestCase.signal();
      });
  // Reset will cancel underlying pending promises.
  app.getAuth().assertSignOut([]);
  app.reset();
}


function testHandleGoogleYoloCredential_unsupportedCredential() {
  // Enable googleyolo with Google provider and no additional scopes.
  app.setConfig({
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // Pass unsupported credential and confirm the expected error shown on the
  // page.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloOtherCredential)
      .then(function(status) {
        // Remains on the same page.
        assertProviderSignInPage();
        assertInfoBarMessage(
            firebaseui.auth.soy2.strings.errorUnsupportedCredential()
            .toString());
        assertFalse(status);
        asyncTestCase.signal();
      });
}


function testHandleGoogleYoloCredential_upgradeAnonymous_noScopes() {
  // Enable googleyolo with Google provider and no additional scopes.
  app.setConfig({
    // Set anonymous user upgrade to true.
    'autoUpgradeAnonymousUsers': true,
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user initially signed in on external instance.
  externalAuth.setUser(anonymousUser);
  // This will succeed while callback page will be rendered as the result
  // gets processed before the redirect to success URL occurs.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        // Renders callback page while results are processed.
        assertCallbackPage();
        assertTrue(status);
        asyncTestCase.signal();
      });
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithCredential called underneath with
  // successful response.
  externalAuth.currentUser.assertLinkWithCredential(
      [expectedCredential],
      function() {
        // User should be signed in.
        externalAuth.setUser({
          'email': federatedAccount.getEmail(),
          'displayName': federatedAccount.getDisplayName()
        });
        return {
          'user': externalAuth.currentUser,
          'credential': expectedCredential
        };
      });
  // Confirm successful flow completes.
  externalAuth.process().then(function() {
    assertCallbackPage();
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleGoogleYoloCredential_upgradeAnonymous_credentialInUse() {
  // Enable googleyolo with Google provider and no additional scopes.
  app.setConfig({
    // Enable anonymous user upgrade.
    'autoUpgradeAnonymousUsers': true,
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Expected linkWithCredential error.
  var expectedError = {
    'code': 'auth/credential-already-in-use',
    'credential': expectedCredential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      expectedCredential);
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user initially signed in on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // This will resolve with false due to the failing Auth call underneath.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        assertFalse(status);
        asyncTestCase.signal();
      });
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithCredential called underneath with
  // expected error thrown.
  externalAuth.currentUser.assertLinkWithCredential(
      [expectedCredential],
      null,
      expectedError);
  // Confirm signInFailure called with expected error on processing.
  externalAuth.process().then(function() {
    assertNoInfoBarMessage();
    assertSignInFailure(expectedMergeError);
  });
}


function testHandleGoogleYoloCredential_upgradeAnonymous_fedEmailInUse() {
  // Enable googleyolo with Google provider and no additional scopes.
  app.setConfig({
    // Enable anonymous user upgrade.
    'autoUpgradeAnonymousUsers': true,
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Expected linkWithCredential error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'credential': expectedCredential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(),
      firebase.auth.GoogleAuthProvider.credential(
          googleYoloIdTokenCredential.credential, null));
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user initially signed in on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // This will resolve with false due to the failing Auth call underneath.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        assertFalse(status);
        asyncTestCase.signal();
      });
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithCredential called underneath with
  // expected error thrown.
  externalAuth.currentUser.assertLinkWithCredential(
      [expectedCredential],
      null,
      expectedError);
  externalAuth.process().then(function() {
    // No info bar message should be shown and the callback page should be
    // rendered for linking flow.
    assertNoInfoBarMessage();
    assertCallbackPage();
    // Simulate existing email belongs to a Facebook account.
    testAuth.assertFetchSignInMethodsForEmail(
        [federatedAccount.getEmail()], ['facebook.com']);
    return testAuth.process();
  }).then(function() {
    // The pending credential should be saved here.
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getPendingEmailCredential(app.getAppId()));
    // Federated linking flow should be triggered.
    assertFederatedLinkingPage(federatedAccount.getEmail());
  });
}


function testHandleGoogleYoloCredential_upgradeAnonymous_passEmailInUse() {
  // Enable googleyolo with Google provider and no additional scopes.
  app.setConfig({
    // Enable anonymous user upgrade.
    'autoUpgradeAnonymousUsers': true,
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var expectedCredential = firebase.auth.GoogleAuthProvider.credential(
      googleYoloIdTokenCredential.credential);
  // Expected linkWithCredential error.
  var expectedError = {
    'code': 'auth/email-already-in-use',
    'credential': expectedCredential,
    'email': federatedAccount.getEmail(),
    'message': 'MESSAGE'
  };
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
      federatedAccount.getEmail(),
      firebase.auth.GoogleAuthProvider.credential(
          googleYoloIdTokenCredential.credential, null));
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user initially signed in on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // This will resolve with false due to the failing Auth call underneath.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        assertFalse(status);
        asyncTestCase.signal();
      });
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithCredential called underneath with
  // expected error thrown.
  externalAuth.currentUser.assertLinkWithCredential(
      [expectedCredential],
      null,
      expectedError);
  externalAuth.process().then(function() {
    // No info bar message shown and callback page rendered to complete account
    // linking.
    assertNoInfoBarMessage();
    assertCallbackPage();
    // Simulate email belongs to an existing password account.
    testAuth.assertFetchSignInMethodsForEmail(
        [federatedAccount.getEmail()], ['password']);
    return testAuth.process();
  }).then(function() {
    // The pending email credential should be cleared at this point.
    // Password linking does not require a redirect so no need to save it
    // anyway.
    assertFalse(firebaseui.auth.storage.hasPendingEmailCredential(
        app.getAppId()));
    // Password linking page rendered.
    assertPasswordLinkingPage(federatedAccount.getEmail());
  });
}


function testHandleGoogleYoloCredential_upgradeAnonymous_withScopes() {
  var expectedProvider = firebaseui.auth.idp.getAuthProvider('google.com');
  expectedProvider.addScope('googl1');
  expectedProvider.addScope('googl2');
  expectedProvider.setCustomParameters({
    'prompt': 'select_account',
    'login_hint': federatedAccount.getEmail()
  });
  // Enable googleyolo with Google provider and additional scopes.
  app.setConfig({
    // Enable anonymous user upgrade.
    'autoUpgradeAnonymousUsers': true,
    'signInSuccessUrl': 'http://localhost/home',
    'signInOptions': [{
      'provider': 'google.com',
      'scopes': ['googl1', 'googl2'],
      'customParameters': {'prompt': 'select_account'},
      'clientId': googYoloClientId,
    }, 'facebook.com', 'password', 'phone'],
    'credentialHelper':
        firebaseui.auth.widget.Config.CredentialHelper.GOOGLE_YOLO
  });
  var component = new firebaseui.auth.ui.page.ProviderSignIn(
      goog.nullFunction(), []);
  component.render(container);
  asyncTestCase.waitForSignals(1);
  // Simulate anonymous user initially signed in on the external Auth instance.
  externalAuth.setUser(anonymousUser);
  // This will trigger a linkWithRedirect using the expected provider since
  // additional scopes are requested.
  firebaseui.auth.widget.handler.common.handleGoogleYoloCredential(
      app, component, googleYoloIdTokenCredential)
      .then(function(status) {
        // Remains on same page until redirect completes.
        assertProviderSignInPage();
        assertTrue(status);
        asyncTestCase.signal();
      });
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  // Confirm linkWithRedirect called on the external Auth instance user.
  externalAuth.currentUser.assertLinkWithRedirect([expectedProvider]);
  testAuth.process();
}


function testSendEmailLinkForSignIn() {
  // Test sign in email link is sent with expected action code settings.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings();
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  var onCancelClick = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn(
      app, component, 'user@example.com', onCancelClick, fail);
  testAuth.assertSendSignInLinkToEmail(
      ['user@example.com', expectedActionCodeSettings]);
  testAuth.process().then(function() {
    assertEmailLinkSignInSentPage();
    // Email for email link sign in should be stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    mockClock.tick(3600000);
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSendEmailLinkForSignIn_linking() {
  // Test pending credential is passed for linking flows.
  var credential = createMockCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
     'user@example.com', credential);
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, pendingEmailCred.getCredential().providerId);
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  var onCancelClick = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn(
      app, component, 'user@example.com', onCancelClick, fail,
      pendingEmailCred);
  testAuth.assertSendSignInLinkToEmail(
      ['user@example.com', expectedActionCodeSettings]);
  testAuth.process().then(function() {
    assertEmailLinkSignInSentPage();
    // Email for email link sign in and pending credential to link to should
    // be stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getEncryptedPendingCredential(
            'SESSIONID', app.getAppId()));
    mockClock.tick(3600000);
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSendEmailLinkForSignIn_anonymousUpgrade() {
  // Test sign in email link is sent for anonymous upgrade.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // Anonymous user's uid should be set on the email link.
  var expectedActionCodeSettings = buildActionCodeSettings(
      null, null, anonymousUser['uid']);
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  var onCancelClick = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn(
      app, component, 'user@example.com', onCancelClick, fail);
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  externalAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    assertEmailLinkSignInSentPage();
    // Email for email link sign in should be stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    mockClock.tick(3600000);
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSendEmailLinkForSignIn_anonymousUpgrade_pendingCred() {
  // Test sign in email link is sent with pending credential for anonymous
  // upgrade.
  var credential = createMockCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var pendingEmailCred = new firebaseui.auth.PendingEmailCredential(
     'user@example.com', credential);
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  app.updateConfig('autoUpgradeAnonymousUsers', true);
  // Simulate anonymous current user on external Auth instance.
  externalAuth.setUser(anonymousUser);
  // Anonymous user's uid should be set on the email link. Pending credential
  // should also be passed.
  var expectedActionCodeSettings = buildActionCodeSettings(
      false, pendingEmailCred.getCredential().providerId, anonymousUser['uid']);
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  var onCancelClick = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn(
      app, component, 'user@example.com', onCancelClick, fail,
      pendingEmailCred);
  // Trigger onAuthStateChanged listener.
  externalAuth.runAuthChangeHandler();
  externalAuth.process().then(function() {
    testAuth.assertSendSignInLinkToEmail(
        ['user@example.com', expectedActionCodeSettings]);
    return testAuth.process();
  }).then(function() {
    assertEmailLinkSignInSentPage();
    // Email for email link sign in and pending credential to link to should
    // be stored.
    assertEquals(
        'user@example.com',
        firebaseui.auth.storage.getEmailForSignIn('SESSIONID', app.getAppId()));
    assertObjectEquals(
        pendingEmailCred,
        firebaseui.auth.storage.getEncryptedPendingCredential(
            'SESSIONID', app.getAppId()));
    mockClock.tick(3600000);
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSendEmailLinkForSignIn_error() {
  // Test error is thrown for sendSignInLinkToEmail.
  app.updateConfig('signInOptions', emailLinkSignInOptions);
  var expectedActionCodeSettings = buildActionCodeSettings();
  asyncTestCase.waitForSignals(1);
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  var onError = goog.testing.recordFunction();
  firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn(
      app, component, 'user@example.com', fail, onError);
  testAuth.assertSendSignInLinkToEmail(
      ['user@example.com', expectedActionCodeSettings], null, internalError);
  testAuth.process().then(function() {
    // Email for email link sign in should be removed from storage for error
    // cases.
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    assertEquals(1, onError.getCallCount());
    assertEquals(internalError, onError.getLastCall().getArgument(0));
    asyncTestCase.signal();
  });
}
