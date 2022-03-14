/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview Test for email link sign-in callback handler.
 */

goog.provide('firebaseui.auth.widget.handler.EmailLinkSignInCallbackTest');
goog.setTestOnly('firebaseui.auth.widget.handler.EmailLinkSignInCallbackTest');

goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.idp');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handleEmailLinkSignInCallback');
/** @suppress {extraRequire} Required for accessing test helper utilities. */
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.dom.forms');


function testHandleEmailLinkSignInCallback_noUpgrade_success() {
  // Provide a sign in success callback.
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID');
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  setupEmailLinkSignIn('SESSIONID', email);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();
  assertNull(app.getTenantId());

  var tempUser;
  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    testAuth.assertSignInWithEmailLink(
        [email, link],
        function() {
          // Mock signed in user.
          testAuth.setUser(expectedUser);
          tempUser = testAuth.currentUser;
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': null,
            'operationType': 'signIn',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([], function() {
      app.getAuth().setUser(null);
    });
    return app.getAuth().process();
  }).then(function() {
    // Internal user should be copied to external instance.
    externalAuth.assertUpdateCurrentUser(
        [tempUser],
        function() {
          externalAuth.setUser(expectedUser);
        });
    return externalAuth.process();
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
    mockClock.tick(firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // SignInCallback is called. No credential is passed.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser, null, undefined);
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleEmailLinkSignInCallback_noUpgrade_emailConfirmation() {
  var email = passwordAccount.getEmail();
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  var link = generateSignInLink('SESSIONID');

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  var waitForCheckActionCode = testAuth.assertCheckActionCode(
        ['ACTION_CODE'],
        function() {
          return {
            'operation': 'EMAIL_SIGNIN'
          };
        });
  // Wait for checkActionCode to be called.
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function(){
    // Email confirmation should be displayed as email is missing and different
    // device flow is allowed.
    assertBusyIndicatorHidden();
    assertNoDialog();
    assertEmailLinkSignInConfirmationPage();

    // Simulate user provided email and submitted form.
    var emailInput = getEmailElement();
    goog.dom.forms.setValue(emailInput, email);
    submitForm();

    // User should be redirected to callback page.
    assertBlankPage();
    assertBusyIndicatorHidden();
    // Wait for signInWithEmail to be called.
    return testAuth.assertSignInWithEmailLink(
        [email, link],
        function() {
          // Mock signed in user.
          testAuth.setUser(expectedUser);
          tempUser = testAuth.currentUser;
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': null,
            'operationType': 'signIn',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    // Resolve signInWithEmail.
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([], function() {
      app.getAuth().setUser(null);
    });
    return app.getAuth().process();
  }).then(function() {
    // Internal user should be copied to external instance.
    externalAuth.assertUpdateCurrentUser(
        [tempUser],
        function() {
          externalAuth.setUser(expectedUser);
        });
    return externalAuth.process();
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
    mockClock.tick(firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleEmailLinkSignInCallback_tenantId() {
  // Provide a sign in success callback.
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  var email = passwordAccount.getEmail();
  var link = generateSignInLink(
      'SESSIONID', undefined, undefined, undefined, 'TENANT_ID');
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  setupEmailLinkSignIn('SESSIONID', email);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();
  // The tenant ID should be set on the Auth instances already.
  assertEquals('TENANT_ID', app.getTenantId());
  var tempUser;
  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    testAuth.assertSignInWithEmailLink(
        [email, link],
        function() {
          // Mock signed in user.
          testAuth.setUser(expectedUser);
          tempUser = testAuth.currentUser;
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': null,
            'operationType': 'signIn',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([], function() {
      app.getAuth().setUser(null);
    });
    return app.getAuth().process();
  }).then(function() {
    // Internal user should be copied to external instance.
    externalAuth.assertUpdateCurrentUser(
        [tempUser],
        function() {
          externalAuth.setUser(expectedUser);
        });
    return externalAuth.process();
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
    mockClock.tick(firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // SignInCallback is called. No credential is passed.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser, null, undefined);
    // The tenant ID should remain on the Auth instances when the flow finishes.
    assertEquals('TENANT_ID', app.getTenantId());
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleEmailLinkSignInCallback_emailMismatch() {
  var email = passwordAccount.getEmail();
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  var expectedError = {'code': 'auth/invalid-email'};
  var invalidEmail = 'user@mismatch.com';
  var link = generateSignInLink('SESSIONID');

  // Simulate user entered an incorrect email.
  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link, invalidEmail, true);
  assertBlankPage();

  assertBusyIndicatorHidden();
  var waitForSignInWithEmailLink = testAuth.assertSignInWithEmailLink(
      [invalidEmail, link],
      null,
      expectedError);
  return waitForSignInWithEmailLink.then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    return testAuth.process();
  }).then(function() {
    return waitForPageChange();
  }).then(function() {
    // No dialog shown.
    assertNoDialog();
    // Email mismatch error shown on confirmation page.
    assertEmailLinkSignInConfirmationPage();
    assertInfoBarMessage(
        firebaseui.auth.soy2.strings.errorMismatchingEmail().toString());

    // Simulate user enters correct email.
    var emailInput = getEmailElement();
    goog.dom.forms.setValue(emailInput, email);
    submitForm();

    // User should be redirected to callback page.
    assertBlankPage();
    assertBusyIndicatorHidden();
    // Wait for signInWithEmail to be called.
    return testAuth.assertSignInWithEmailLink(
        [email, link],
        function() {
          // Mock signed in user.
          testAuth.setUser(expectedUser);
          tempUser = testAuth.currentUser;
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': null,
            'operationType': 'signIn',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    // Resolve signInWithEmail.
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([], function() {
      app.getAuth().setUser(null);
    });
    return app.getAuth().process();
  }).then(function() {
    // Internal user should be copied to external instance.
    externalAuth.assertUpdateCurrentUser(
        [tempUser],
        function() {
          externalAuth.setUser(expectedUser);
        });
    return externalAuth.process();
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
    mockClock.tick(firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleEmailLinkSignInCallback_differentDeviceError() {
  // Test when force same device is enabled and link is clicked in
  // different device.
  var link = generateSignInLink('SESSIONID', null, null, true);
  assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();
  // No dialog shown.
  assertNoDialog();
  return waitForPageChange().then(function() {
    assertDifferentDeviceErrorPage();
    // Clicking dismiss button should redirect to the first page.
    clickSecondaryLink();
    assertProviderSignInPage();
  });
}


function testHandleEmailLinkSignInCallback_differentDeviceError_anonymous() {
  // Test when anonymous uid is passed in link but link is clicked in
  // different device.
  var link = generateSignInLink('SESSIONID', anonymousUser.uid);
  assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();
  // No dialog shown.
  assertNoDialog();
  return waitForPageChange().then(function() {
    assertDifferentDeviceErrorPage();
    // Clicking dismiss button should redirect to the first page.
    clickSecondaryLink();
    assertProviderSignInPage();
  });
}


function testHandleEmailLinkSignInCallback_anonymousUserMismatch() {
  // Test when anonymous uid is passed in link but a different anonymous
  // user is found.
  var link = generateSignInLink('SESSIONID', 'MISMATCHED_UID');
  assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
  setupEmailLinkSignIn('SESSIONID', passwordAccount.getEmail());
  externalAuth.setUser(anonymousUser);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();
  // No dialog shown.
  assertNoDialog();
  externalAuth.runAuthChangeHandler();
  return waitForPageChange().then(function() {
    assertAnonymousUserMismatchPage();
    // Clicking dismiss button should redirect to the first page.
    clickSecondaryLink();
    assertProviderSignInPage();
  });
}


function testHandleEmailLinkSignInCallback_newDeviceLinking() {
  var email = passwordAccount.getEmail();
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  var link = generateSignInLink('SESSIONID', null, 'facebook.com');
  var modifiedLink = generateSignInLink('SESSIONID');

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  return waitForPageChange().then(function() {
    // User should be asked to confirm they want to continue sign in without
    // linking.
    assertEmailLinkSignInLinkingDifferentDevicePage('Facebook');
    assertBusyIndicatorHidden();
    assertNoDialog();

    // User confirms they want to continue sign-in.
    submitForm();

    // Redirect back to callback page.
    assertBlankPage();

    return testAuth.assertCheckActionCode(
        ['ACTION_CODE'],
        function() {
          return {
            'operation': 'EMAIL_SIGNIN'
          };
        });
  }).then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function(){
    // Email confirmation should be displayed as email is missing and different
    // device flow is allowed. Linking requirement should be ignored.
    assertBusyIndicatorHidden();
    assertNoDialog();
    assertEmailLinkSignInConfirmationPage();

    // Simulate user provided email and submitted form.
    var emailInput = getEmailElement();
    goog.dom.forms.setValue(emailInput, email);
    submitForm();

    // User should be redirected to callback page.
    assertBlankPage();
    assertBusyIndicatorHidden();
    // Wait for signInWithEmail to be called.
    return testAuth.assertSignInWithEmailLink(
        // Modified link not requiring linking should be passed.
        [email, modifiedLink],
        function() {
          // Mock signed in user.
          testAuth.setUser(expectedUser);
          tempUser = testAuth.currentUser;
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': null,
            'operationType': 'signIn',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    // Resolve signInWithEmail.
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([], function() {
      app.getAuth().setUser(null);
    });
    return app.getAuth().process();
  }).then(function() {
    // Internal user should be copied to external instance.
    externalAuth.assertUpdateCurrentUser(
        [tempUser],
        function() {
          externalAuth.setUser(expectedUser);
        });
    return externalAuth.process();
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
    mockClock.tick(firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleEmailLinkSignInCallback_newDeviceLinking_emailMismatch() {
  var email = passwordAccount.getEmail();
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  var invalidEmail = 'user@mismatch.com';
  var link = generateSignInLink('SESSIONID', null, 'facebook.com');
  var modifiedLink = generateSignInLink('SESSIONID');
  var expectedError = {'code': 'auth/invalid-email'};

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  return waitForPageChange().then(function() {
    // User should be asked to confirm they want to continue sign in without
    // linking.
    assertEmailLinkSignInLinkingDifferentDevicePage('Facebook');
    assertBusyIndicatorHidden();
    assertNoDialog();

    // User confirms they want to continue sign-in.
    submitForm();

    // User redirected back to callback page.
    assertBlankPage();

    return testAuth.assertCheckActionCode(
        ['ACTION_CODE'],
        function() {
          return {
            'operation': 'EMAIL_SIGNIN'
          };
        });
  }).then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function(){
    // Email confirmation should be displayed as email is missing and different
    // device flow is allowed. Linking requirement should be ignored.
    assertBusyIndicatorHidden();
    assertNoDialog();
    assertEmailLinkSignInConfirmationPage();

    // Simulate user provided invalid email and submitted form.
    var emailInput = getEmailElement();
    goog.dom.forms.setValue(emailInput, invalidEmail);
    submitForm();

    // User should be redirected to callback page.
    assertBlankPage();
    assertBusyIndicatorHidden();

    // Wait for signInWithEmail to be called with invalid email and modified
    // link.
    return testAuth.assertSignInWithEmailLink(
        [invalidEmail, modifiedLink],
        null,
        expectedError);
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    // Resolve signInWithEmail.
    return testAuth.process();
  }).then(function() {
    return waitForPageChange();
  }).then(function() {
    // No dialog shown.
    assertNoDialog();
    // Email mismatch error shown on confirmation page.
    assertEmailLinkSignInConfirmationPage();
    assertInfoBarMessage(
        firebaseui.auth.soy2.strings.errorMismatchingEmail().toString());

    // Simulate user enters correct email.
    var emailInput = getEmailElement();
    goog.dom.forms.setValue(emailInput, email);
    submitForm();

    // User should be redirected to callback page.
    assertBlankPage();
    assertBusyIndicatorHidden();

    // Wait for signInWithEmail to be called. Confirm it is called with the
    // modified link.
    return testAuth.assertSignInWithEmailLink(
        [email, modifiedLink],
        function() {
          // Mock signed in user.
          testAuth.setUser(expectedUser);
          tempUser = testAuth.currentUser;
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': null,
            'operationType': 'signIn',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    // Resolve signInWithEmail.
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([], function() {
      app.getAuth().setUser(null);
    });
    return app.getAuth().process();
  }).then(function() {
    // Internal user should be copied to external instance.
    externalAuth.assertUpdateCurrentUser(
        [tempUser],
        function() {
          externalAuth.setUser(expectedUser);
        });
    return externalAuth.process();
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
    mockClock.tick(firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleEmailLinkSignInCallback_noUpgradeWithCredential_success() {
  // Provide a sign in success callback.
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  var credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID', null, 'facebook.com');
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  setupEmailLinkSignIn('SESSIONID', email, credential);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  var tempUser;
  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    testAuth.assertSignInWithEmailLink(
        [email, link],
        function() {
          // Mock signed in user.
          testAuth.setUser(expectedUser);
          tempUser = testAuth.currentUser;
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': null,
            'operationType': 'signIn',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
    return testAuth.process();
  }).then(function() {
    // pendingCredential should be linked to internal user.
    testAuth.currentUser.assertLinkWithCredential(
        [credential],
        function() {
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': credential,
            'operationType': 'link',
            'additionalUserInfo': {
               'providerId': 'facebook.com',
               'isNewUser': false
            }
          };
        });
    return app.getAuth().process();
  }).then(function() {
    testAuth.assertSignOut([], function() {
      app.getAuth().setUser(null);
    });
    return app.getAuth().process();
  }).then(function() {
    // Internal user should be copied to external instance.
    externalAuth.assertUpdateCurrentUser(
        [tempUser],
        function() {
          externalAuth.setUser(expectedUser);
        });
    return externalAuth.process();
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
    mockClock.tick(firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // SignInCallback is called. OAuth credential is passed.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser, credential, undefined);
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleEmailLinkSignInCallback_anonUpgrade_success() {
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID', anonymousUser.uid);
  var emailLinkCredential = firebase.auth.EmailAuthProvider.credentialWithLink(
      email, link);
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  setupEmailLinkSignIn('SESSIONID', email);
  externalAuth.setUser(anonymousUser);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  externalAuth.runAuthChangeHandler();
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    testAuth.assertFetchSignInMethodsForEmail(
        [email],
        function() {
          // Simulate new user.
          return [];
        });
    return testAuth.process();
  }).then(function() {
    externalAuth.currentUser.assertLinkWithCredential(
        [emailLinkCredential],
        function() {
          // Mock signed in user.
          externalAuth.setUser(expectedUser);
          return {
            // Return internal auth currentUser reference.
            'user': externalAuth.currentUser,
            'credential': null,
            'operationType': 'link',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
    return externalAuth.process();
  }).then(function() {
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkVerified().toString());
    mockClock.tick(firebaseui.auth.widget.handler.SIGN_IN_SUCCESS_DIALOG_DELAY);
    // No dialog shown.
    assertNoDialog();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
    // User should be redirected to success URL.
    testUtil.assertGoTo('http://localhost/home');
  });
}


function testHandleEmailLinkSignInCallback_anonUpgrade_emailExists() {
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID', anonymousUser.uid);
  var emailLinkCredential = firebase.auth.EmailAuthProvider.credentialWithLink(
      email, link);
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      emailLinkCredential);
  setupEmailLinkSignIn('SESSIONID', email);
  externalAuth.setUser(anonymousUser);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  externalAuth.runAuthChangeHandler();
  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    testAuth.assertFetchSignInMethodsForEmail(
        [email],
        function() {
          // Simulate existing user.
          return ['emailLink'];
        });
    return testAuth.process();
  }).then(function() {
    // signInFailure triggered with expected error.
    assertSignInFailure(expectedMergeError);
    return testAuth.process();
  }).then(function() {
    // No info bar message shown.
    assertNoInfoBarMessage();
    // No dialog shown.
    assertNoDialog();
    assertComponentDisposed();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
  });
}


function testHandleEmailLinkSignInCallback_anonUpgradeWithCredential() {
  var credential = firebaseui.auth.idp.getAuthCredential({
    'accessToken': 'facebookAccessToken',
    'providerId': 'facebook.com'
  });
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID', anonymousUser.uid, 'facebook.com');
  var expectedUser = {
    'email': passwordAccount.getEmail(),
    'displayName': passwordAccount.getDisplayName()
  };
  // Expected FirebaseUI error.
  var expectedMergeError = new firebaseui.auth.AuthUIError(
      firebaseui.auth.AuthUIError.Error.MERGE_CONFLICT,
      null,
      credential);
  setupEmailLinkSignIn('SESSIONID', email, credential);
  externalAuth.setUser(anonymousUser);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  externalAuth.runAuthChangeHandler();
  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    testAuth.assertSignInWithEmailLink(
        [email, link],
        function() {
          // Mock signed in user.
          testAuth.setUser(expectedUser);
          tempUser = testAuth.currentUser;
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': null,
            'operationType': 'signIn',
            'additionalUserInfo': {
               'providerId': 'password',
               'isNewUser': false
            }
          };
        });
    return testAuth.process();
  }).then(function() {
    testAuth.currentUser.assertLinkWithCredential(
        [credential],
        function() {
          return {
            // Return internal auth currentUser reference.
            'user': testAuth.currentUser,
            'credential': credential,
            'operationType': 'link',
            'additionalUserInfo': {
               'providerId': 'facebook.com',
               'isNewUser': false
            }
          };
        });
    return testAuth.process();
  }).then(function() {
    testAuth.assertSignOut([], function() {
      testAuth.setUser(null);
    });
    return testAuth.process();
  }).then(function() {
    // signInFailure triggered with expected error.
    assertSignInFailure(expectedMergeError);
    return testAuth.process();
  }).then(function() {
    // No info bar message shown.
    assertNoInfoBarMessage();
    // No dialog shown.
    assertNoDialog();
    assertComponentDisposed();
    // Saved data in cookie should be cleared.
    assertFalse(
        firebaseui.auth.storage.hasEncryptedPendingCredential(app.getAppId()));
    assertFalse(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
  });
}


function testHandleEmailLinkSignInCallback_expiredActionCodeError() {
  var expectedError = {'code': 'auth/expired-action-code'};
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID');
  setupEmailLinkSignIn('SESSIONID', email);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  // Simulate expired error code.
  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      null,
      expectedError);
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    // Provider sign-in page should be rendered with error in info bar.
    assertProviderSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError));
  });
}


function testHandleEmailLinkSignInCallback_oldLinkClicked() {
  // Test when old email link is clicked, code expired error should be
  // displayed. In this case, the email is stored with new session ID which is
  // different from the session ID in the old link.
  var expectedError = {'code': 'auth/expired-action-code'};
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('OLD_SESSIONID', null, null, true);
  setupEmailLinkSignIn('NEW_SESSIONID', email);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  // Simulate expired error code.
  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      null,
      expectedError);
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    // Provider sign-in page should be rendered with error in info bar.
    assertProviderSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError));
  });
}


function testHandleEmailLinkSignInCallback_blockingFunctionError() {
  const blockingfunctionError = {
    'code': '400',
    'message':
        'BLOCKING_FUNCTION_ERROR_RESPONSE :' +
        ' HTTP Cloud Function returned an error: ' +
        '{\"error\":{\"code\":400,\"message\":\"Unauthorized email' +
        ' "abcd@evil.com"\",\"status\":\"INVALID_ARGUMENT\"}}',
  };
  const expectedError =
  {
    'code': '400',
    'message': 'Unauthorized email "abcd@evil.com"',
  };
  const email = passwordAccount.getEmail();
  const link = generateSignInLink('SESSIONID');
  setupEmailLinkSignIn('SESSIONID', email);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  // Simulate blocking function error code.
  const waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      null,
      blockingfunctionError);
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    // Provider sign-in page should be rendered with error in info bar.
    assertProviderSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(expectedError));
  });
}


function testHandleEmailLinkSignInCallback_sessionMismatch() {
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('NEW_SESSIONID', null, null, true);
  setupEmailLinkSignIn('OLD_SESSIONID', email);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDifferentDeviceErrorPage();
    // Clicking dismiss button should redirect to the first page.
    clickSecondaryLink();
    assertProviderSignInPage();
  });
}


function testHandleEmailLinkSignInCallback_signInError() {
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID');
  setupEmailLinkSignIn('SESSIONID', email);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    // Simulate some generic email link sign-in error.
    return testAuth.assertSignInWithEmailLink(
        [email, link],
        null,
        internalError);
  }).then(function() {
    return testAuth.process();
  }).then(function() {
    return waitForPageChange();
  }).then(function() {
    // No dialog shown.
    assertNoDialog();
    // Provider sign-in page should be rendered with generic error in info bar.
    assertProviderSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    // Saved data in cookie should remain as sometimes a page refresh would
    // be sufficient to recover (eg. network error). The cookies are encrypted
    // and will clear in an hour.
    assertTrue(firebaseui.auth.storage.hasEmailForSignIn(app.getAppId()));
  });
}


function testHandleEmailLinkSignInCallback_resetBeforeCompletion() {
  var email = passwordAccount.getEmail();
  var link = generateSignInLink('SESSIONID');
  setupEmailLinkSignIn('SESSIONID', email);

  firebaseui.auth.widget.handler.handleEmailLinkSignInCallback(
      app, container, link);
  assertBlankPage();

  var waitForCheckActionCode = testAuth.assertCheckActionCode(
      ['ACTION_CODE'],
      function() {
        return {
          'operation': 'EMAIL_SIGNIN'
        };
      });
  return waitForCheckActionCode.then(function() {
    delayForBusyIndicatorAndAssertIndicatorShown();
    return testAuth.process();
  }).then(function() {
    assertBusyIndicatorHidden();
    assertDialog(
        firebaseui.auth.soy2.strings.dialogEmailLinkProcessing().toString());
    app.reset();
    testAuth.assertSignOut([], function() {
      testAuth.setUser(null);
    });
    return testAuth.process();
  }).then(function() {
    // Container should be cleared.
    assertComponentDisposed();
    // No dialog shown.
    assertNoDialog();
  });
}
