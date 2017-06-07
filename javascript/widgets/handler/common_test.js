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
goog.require('firebaseui.auth.CredentialHelper');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.page.Callback');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handleFederatedLinking');
/** @suppress {extraRequire} Required for accountchooser.com page navigation to
 *      work. */
goog.require('firebaseui.auth.widget.handler.handleFederatedSignIn');
goog.require('firebaseui.auth.widget.handler.handlePasswordLinking');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignIn');
goog.require('firebaseui.auth.widget.handler.handlePasswordSignUp');
goog.require('firebaseui.auth.widget.handler.handleProviderSignIn');
goog.require('firebaseui.auth.widget.handler.handleSignIn');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.Promise');
goog.require('goog.dom.forms');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.recordFunction');


var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();


var federatedAccount = new firebaseui.auth.Account('user@example.com',
    'Federated User');
var federatedAccountWithProvider = new firebaseui.auth.Account(
    'user@example.com', 'Federated User', null, 'google.com');


// TODO: Update all the tests when accountchooser.com handlers change.
function testSelectFromAccountChooser_noResponse() {
  firebaseui.auth.storage.rememberAccount(passwordAccount, app.getAppId());
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  testAc.assertTrySelectAccount([passwordAccount]);
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
}


function testSelectFromAccountChooser_noResponse_uiShown() {
  app.setConfig({
    'callbacks': {
      'uiShown': uiShownCallback
    }
  });
  testAc.setSkipSelect(true);
  firebaseui.auth.storage.rememberAccount(passwordAccount, app.getAppId());
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  assertUiShownCallbackInvoked();
  testAc.assertTrySelectAccount([passwordAccount]);
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
}


function testSelectFromAccountChooser_registeredFederatedAccount() {
  // Test when selected account is a registered federated account in
  // provider-first mode.
  // Test with signInOptions containing additional scopes.
  app.updateConfig('signInOptions', signInOptionsWithScopes);
  asyncTestCase.waitForSignals(1);
  testAc.setSelectedAccount(federatedAccount);
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  testAuth.assertFetchProvidersForEmail(
      [federatedAccount.getEmail()],
      ['google.com']);
  testAuth.process().then(function() {
    assertFederatedLinkingPage(federatedAccount.getEmail());
    assertTrue(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_registeredFedAcct_uiShown() {
  // Test when selected account is a registered federated account.
  // Ui shown callback is still called.
  app.setConfig({
    'signInOptions': signInOptionsWithScopes,
    'callbacks': {
      'uiShown': uiShownCallback
    }
  });
  asyncTestCase.waitForSignals(1);
  testAc.setSelectedAccount(federatedAccount);
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  testAuth.assertFetchProvidersForEmail(
      [federatedAccount.getEmail()],
      ['google.com']);
  testAuth.process().then(function() {
    assertUiShownCallbackInvoked();
    assertFederatedLinkingPage(federatedAccount.getEmail());
    assertTrue(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_registeredPasswordAccount() {
  // Test when selected account is a registered password account in
  // provider-first mode.
  // Test with signInOptions containing additional scopes.
  app.updateConfig('signInOptions', signInOptionsWithScopes);
  asyncTestCase.waitForSignals(1);
  testAc.setSelectedAccount(passwordAccount);
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()],
      ['password']);
  testAuth.process().then(function() {
    assertPasswordSignInPage();
    assertEquals(
        passwordAccount.getEmail(), goog.dom.forms.getValue(getEmailElement()));
    assertEquals(0, getIdpButtons().length);
    assertTrue(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_unregisteredAccount() {
  // Test when selected account is an unregistered federated account in
  // provider-first mode.
  // Test with signInOptions containing additional scopes.
  app.updateConfig('signInOptions', signInOptionsWithScopes);
  asyncTestCase.waitForSignals(1);
  testAc.setSelectedAccount(federatedAccount);
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  testAuth.assertFetchProvidersForEmail(
      [federatedAccount.getEmail()],
      []);
  testAuth.process().then(function() {
    // Unregistered federated account should be treated as password sign up in
    // provider-first display mode.
    assertPasswordSignUpPage();
    assertEquals(
        federatedAccount.getEmail(),
        goog.dom.forms.getValue(getEmailElement()));
    assertEquals(
        federatedAccount.getDisplayName(),
        goog.dom.forms.getValue(getNameElement()));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_error() {
  // Test when error occurs in fetchProvidersForEmail.
  asyncTestCase.waitForSignals(1);
  testAc.setSelectedAccount(federatedAccount);
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  testAuth.assertFetchProvidersForEmail(
      [federatedAccount.getEmail()], null, internalError);
  testAuth.process().then(function() {
    // Unregistered federated account should be treated as password sign up in
    // provider-first display mode.
    assertProviderSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_registeredPassAcct_uiShown() {
  // Test when select account is a registered password account with ui shown
  // callback.
  app.setConfig({
    'callbacks': {
      'uiShown': uiShownCallback
    }
  });
  asyncTestCase.waitForSignals(1);
  testAc.setSelectedAccount(passwordAccount);
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()],
      ['password']);
  testAuth.process().then(function() {
    assertUiShownCallbackInvoked();
    assertPasswordSignInPage();
    assertEquals(
        passwordAccount.getEmail(), goog.dom.forms.getValue(getEmailElement()));
    assertEquals(0, getIdpButtons().length);
    assertTrue(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_addAccount() {
  testAc.setAddAccount();
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  // The sign-in page should show.
  assertSignInPage();
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
}


function testSelectFromAccountChooser_addAccount_uiShown() {
  // Test add account option from accountchooser.com with ui shown callback.
  app.setConfig({
    'callbacks': {
      'uiShown': uiShownCallback
    }
  });
  testAc.setAddAccount();
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  assertUiShownCallbackInvoked();
  assertSignInPage();
  assertFalse(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
}


function testSetLoggedIn() {
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  testAuth.setUser(passwordUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(app, testComponent, cred);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        passwordAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_falseSignInCallback() {
  // Provide a sign in success callback that returns false.
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  // Callback should be rendered.
  assertCallbackPage();
  testAuth.setUser(passwordUser);
  // Set current component, should be set in the handler that triggered
  // setLoggedIn.
  app.setCurrentComponent(component);
  firebaseui.auth.widget.handler.common.setLoggedIn(app, component, cred);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        passwordAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_noCallback_storageRedirect() {
  // Clear callbacks from configuration, set signInSuccessUrl which will be
  // overridden.
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  app.setConfig({
    'callbacks': null,
    'signInSuccessUrl': 'http://localhost/home'
  });
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());

  testAuth.setUser(passwordUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(app, testComponent, cred);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // Confirm redirect to storage redirect URL.
    testUtil.assertGoTo(redirectUrl);
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        passwordAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_notRememberAccount() {
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());

  testAuth.setUser(passwordUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(app, testComponent, cred);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    testUtil.assertGoTo('http://localhost/home');
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_signInSuccessCallback_redirect() {
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());

  testAuth.setUser(passwordUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(app, testComponent, cred);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        null,
        undefined);
    // Continue to redirect.
    testUtil.assertGoTo('http://localhost/home');
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_signInSuccessCallback_noRedirect() {
  asyncTestCase.waitForSignals(1);
  app.setConfig({
    // No need for a signInSuccessUrl here and it should not raise an error.
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        undefined);
    // No redirect.
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_signInSuccessCallback_storageAutoRedirect() {
  asyncTestCase.waitForSignals(1);
  var redirectUrl = 'http://www.example.com';
  // Set redirect URL in storage.
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  app.setConfig({
    // No need for a signInSuccessUrl here and it should not raise an error.
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        redirectUrl);
    // Continue to redirect URL specified in storage.
    testUtil.assertGoTo(redirectUrl);
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_signInSuccessCallback_storageNoRedirect() {
  asyncTestCase.waitForSignals(1);
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    // redirectUrl passed to callback, developer has to manually redirect.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        redirectUrl);
    // No redirect.
    testUtil.assertGoTo(null);
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_signInSuccessCallback_redirectNoRedirectUrl() {
  asyncTestCase.waitForSignals(1);
  app.setConfig({
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
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


function testSetLoggedIn_signInSuccessCallback_storageManualRedirect() {
  asyncTestCase.waitForSignals(1);
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  // Test sign in success callback with a manual redirect.
  app.setConfig({
    // No need for a signInSuccessUrl here and it should not raise an error.
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false, true)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    // redirectUrl passed to callback, developer has to manually redirect.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        redirectUrl);
    // Developer manually continues to redirect URL specified in storage.
    testUtil.assertGoTo(redirectUrl);
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_popup() {
  testUtil.setHasOpener(true);
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');

  testAuth.setUser(passwordUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(app, testComponent, cred);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    testUtil.assertOpenerGoTo('http://localhost/home');
    testUtil.assertWindowClosed(window);
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        passwordAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_popup_noCallback_storageRedirect() {
  // Clear callbacks from configuration, set signInSuccessUrl which will be
  // overridden.
  app.setConfig({
    'callbacks': null,
    'signInSuccessUrl': 'http://localhost/home'
  });
  asyncTestCase.waitForSignals(1);
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  testUtil.setHasOpener(true);

  testAuth.setUser(passwordUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(app, testComponent, cred);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential([cred], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // Assert opener continues to redirect URL specified in storage.
    testUtil.assertOpenerGoTo(redirectUrl);
    testUtil.assertWindowClosed(window);
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        passwordAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_popup_signInSuccessCallback_redirect() {
  asyncTestCase.waitForSignals(1);
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  testUtil.setHasOpener(true);

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        undefined);
    // Continue to redirect.
    testUtil.assertOpenerGoTo('http://localhost/home');
    // Callback supplied. Window should only be closed by developer.
    testUtil.assertWindowNotClosed(window);
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        federatedUserAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_popup_signInSuccessCallback_redirectNoRedirectUrl() {
  asyncTestCase.waitForSignals(1);
  app.setConfig({
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  testUtil.setHasOpener(true);
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());
  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    // No redirect occurred.
    testUtil.assertGoTo(null);
    // Error should be displayed in the info bar.
    assertInfoBarMessage(
        'No redirect URL has been found. You must either specify a ' +
        'signInSuccessUrl in the configuration, pass in a redirect URL to ' +
        'the widget URL, or return false from the callback.',
        testComponent);
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_expiredFacebookCredential() {
  // Test when setLoggedIn is triggered with an expired Facebook credential.
  // This would happen when the user waits too long before proceeding in an
  // email mismatch scenario.
  asyncTestCase.waitForSignals(1);
  // Expired Facebook credential error.
  var message = {
    'error': {
      'errors': [
        {
          'domain': 'global',
          'reason': 'invalid',
          'message': 'invalid access_token, error code 43.'
        }
      ],
      'code': 400,
      'message': 'invalid access_token, error code 43.'
    }
  };
  var expiredCredentialError = {
    'code': 'auth/internal-error',
    'message': JSON.stringify(message)
  };
  app.setConfig({
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());
  testAuth.setUser(federatedUser);
  // Render the UI.
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, component, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Simulate an expired credential error due to the user waiting too long.
    externalAuth.assertSignInWithCredential(
        [federatedCredential], null, expiredCredentialError);
    return externalAuth.process();
  }).then(function() {
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    // No redirect occurred.
    testUtil.assertGoTo(null);
    // Redirect back to provider sign-in page.
    assertProviderSignInPage();
    // Error should be displayed in the info bar.
    assertInfoBarMessage(
        firebaseui.auth.soy2.strings.errorExpiredCredential().toString());
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_expiredGoogleCredential_accessToken() {
  // Test when setLoggedIn is triggered with an expired Google credential.
  // This would happen when the user waits too long before proceeding in an
  // email mismatch scenario.
  asyncTestCase.waitForSignals(1);
  // Expired Google credential error.
  var message = {
    'error': {
      'errors': [
        {
          'domain': 'global',
          'reason': 'invalid',
          'message': 'Invalid Idp Response: access_token is invalid'
        }
      ],
      'code': 400,
      'message': 'Invalid Idp Response: access_token is invalid'
    }
  };
  var expiredCredentialError = {
    'code': 'auth/internal-error',
    'message': JSON.stringify(message)
  };
  app.setConfig({
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());
  testAuth.setUser(federatedUser);
  // Render the UI
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, component, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Simulate an expired credential error due to the user waiting too long.
    externalAuth.assertSignInWithCredential(
        [federatedCredential], null, expiredCredentialError);
    return externalAuth.process();
  }).then(function() {
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    // No redirect occurred.
    testUtil.assertGoTo(null);
    // Redirect back to provider sign-in page.
    assertProviderSignInPage();
    // Error should be displayed in the info bar.
    assertInfoBarMessage(
        firebaseui.auth.soy2.strings.errorExpiredCredential().toString());
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_expiredGoogleCredential_idToken() {
  // Test when setLoggedIn is triggered with an expired Google credential.
  // This case is for id tokens.
  // This would happen when the user waits too long before proceeding in an
  // email mismatch scenario.
  asyncTestCase.waitForSignals(1);
  // Expired Google credential error.
  var message = {
    'error': {
      'errors': [
        {
          'domain': 'global',
          'reason': 'invalid',
          'message': 'Invalid id_token in IdP response: gegegegegeg'
        }
      ],
      'code': 400,
      'message': 'Invalid id_token in IdP response: gegegegegeg'
    }
  };
  var expiredCredentialError = {
    'code': 'auth/internal-error',
    'message': JSON.stringify(message)
  };
  app.setConfig({
    'signInSuccessUrl': undefined,
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  firebaseui.auth.storage.setRememberAccount(false, app.getAppId());
  testAuth.setUser(federatedUser);
  // Render the UI
  var component = new firebaseui.auth.ui.page.Callback();
  component.render(container);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, component, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    // Simulate an expired credential error due to the user waiting too long.
    externalAuth.assertSignInWithCredential(
        [federatedCredential], null, expiredCredentialError);
    return externalAuth.process();
  }).then(function() {
    assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    // No redirect occurred.
    testUtil.assertGoTo(null);
    // Redirect back to provider sign-in page.
    assertProviderSignInPage();
    // Error should be displayed in the info bar.
    assertInfoBarMessage(
        firebaseui.auth.soy2.strings.errorExpiredCredential().toString());
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_popup_signInSuccessCallback_noRedirect() {
  asyncTestCase.waitForSignals(1);
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  testUtil.setHasOpener(true);

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        undefined);
    // No redirect.
    // Callback supplied. Window should only be closed by developer.
    testUtil.assertWindowNotClosed(window);
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        federatedUserAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_popup_signInSuccessCallback_storageAutoRedirect() {
  asyncTestCase.waitForSignals(1);
  var redirectUrl = 'http://www.example.com';
  // Set redirect URL in storage.
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(true)
    }
  });
  testUtil.setHasOpener(true);

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        redirectUrl);
    // Continue to redirect URL specified in storage.
    testUtil.assertOpenerGoTo(redirectUrl);
    // Callback supplied. Window should only be closed by developer.
    testUtil.assertWindowNotClosed(window);
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        federatedUserAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_popup_signInSuccessCallback_storageNoRedirect() {
  asyncTestCase.waitForSignals(1);
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  testUtil.setHasOpener(true);

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
    // redirectUrl passed to callback, developer has to manually redirect.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        redirectUrl);
    // No redirect.
    testUtil.assertOpenerGoTo(null);
    // Callback supplied. Window should only be closed by developer.
    testUtil.assertWindowNotClosed(window);
    assertEquals(1, firebaseui.auth.storage.getRememberedAccounts(
        app.getAppId()).length);
    assertObjectEquals(
        federatedUserAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_popup_signInSuccessCallback_storageManualRedirect() {
  asyncTestCase.waitForSignals(1);
  // Set redirect URL in storage.
  var redirectUrl = 'http://www.example.com';
  firebaseui.auth.storage.setRedirectUrl(redirectUrl, app.getAppId());
  // Test sign in success callback with a manual redirect.
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false, true)
    }
  });
  testUtil.setHasOpener(true);

  testAuth.setUser(federatedUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, federatedCredential);
  // Sign out from internal instance and then sign in with passed credential to
  // external instance.
  return testAuth.process().then(function() {
    testAuth.assertSignOut([]);
    return testAuth.process();
  }).then(function() {
    externalAuth.setUser(testAuth.currentUser);
    externalAuth.assertSignInWithCredential(
        [federatedCredential], externalAuth.currentUser);
    return externalAuth.process();
  }).then(function() {
    // SignInCallback is called.
     // redirectUrl passed to callback, developer has to manually redirect.
    assertSignInSuccessCallbackInvoked(
        externalAuth.currentUser,
        federatedCredential,
        redirectUrl);
    // Callback supplied. Window should only be closed by developer.
    testUtil.assertWindowNotClosed(window);
    // Developer manually continues to redirect URL specified in storage.
    testUtil.assertGoTo(redirectUrl);
    assertObjectEquals(
        federatedUserAccount, firebaseui.auth.storage.getRememberedAccounts(
            app.getAppId())[0]);
    // Confirm redirect URL is cleared from storage.
    assertFalse(firebaseui.auth.storage.hasRedirectUrl(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSetLoggedIn_alreadySignedIn() {
  // Test alreadySignedIn set to true with signInSuccessUrl.
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  externalAuth.setUser(passwordUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, cred, null, true);
  testUtil.assertGoTo('http://localhost/home');
  assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
      app.getAppId()).length);
}


function testSetLoggedIn_alreadySignedIn_falseSignInCallback() {
  // Test alreadySignedIn set to true with signInSuccess callback.
  // Provide a sign in success callback that returns false.
  var cred = firebase.auth.EmailAuthProvider.credential(
      passwordUser['email'], 'password');
  app.setConfig({
    'callbacks': {
      'signInSuccess': signInSuccessCallback(false)
    }
  });
  externalAuth.setUser(passwordUser);
  firebaseui.auth.widget.handler.common.setLoggedIn(
      app, testComponent, cred, null, true);
  assertSignInSuccessCallbackInvoked(
       externalAuth.currentUser, cred, undefined);
  assertEquals(0, firebaseui.auth.storage.getRememberedAccounts(
      app.getAppId()).length);
}


function testHandleUnrecoverableError() {
  // Test rendering of unrecoverable error handling.
  var errorMessage = 'Some unrecoverable error message';
  firebaseui.auth.widget.handler.common.handleUnrecoverableError(
      app, container, errorMessage);
  // Assert unrecoverable error message page with correct message.
  assertUnrecoverableErrorPage(errorMessage);
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
}


function testAccountChooserInvoked() {
  // accountchooser.com invoked callback.
  var onContinueRecorded = null;
  var accountChooserInvokedCalled = false;
  var accountChooserInvokedCallback = function(onContinue) {
    onContinueRecorded = onContinue;
    accountChooserInvokedCalled = true;
  };
  // On continue callback.
  var onContinueCalled = false;
  var onContinue = function() {
    onContinueCalled = true;
  };

  // No callback provided. On continue should be run.
  firebaseui.auth.widget.handler.common.accountChooserInvoked(app, onContinue);
  assertFalse(accountChooserInvokedCalled);
  assertNull(onContinueRecorded);
  assertTrue(onContinueCalled);

  // accountchooser.com invoked callback provided, callback should be called
  // with onContinue function passed.
  onContinueCalled = false;
  accountChooserInvokedCalled = false;
  onContinueRecorded = null;
  app.setConfig({
    'callbacks': {
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  firebaseui.auth.widget.handler.common.accountChooserInvoked(app, onContinue);
  assertTrue(accountChooserInvokedCalled);
  assertEquals(onContinue, onContinueRecorded);
  assertFalse(onContinueCalled);
}


function testAccountChooserResult() {
  var code = firebaseui.auth.widget.Config.AccountChooserResult;
  // accountchooser.com result callback.
  var onContinueRecorded = null;
  var typeRecorded = null;
  var accountChooserResultCalled = false;
  var accountChooserResultCallback = function(type, onContinue) {
    typeRecorded = type;
    onContinueRecorded = onContinue;
    accountChooserResultCalled = true;
  };
  // On continue callback.
  var onContinueCalled = false;
  var onContinue = function() {
    onContinueCalled = true;
  };

  // Only continue callback provided.
  // No accountchooser.com result called. However, on continue is called.
  firebaseui.auth.widget.handler.common.accountChooserResult(
      app, code.EMPTY, onContinue);
  assertFalse(accountChooserResultCalled);
  assertTrue(onContinueCalled);

  // Config callback provided along with continue callback.
  // accountchooser.com result called. On continue function passed but not run.
  app.setConfig({
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback
    }
  });
  onContinueRecorded = null;
  typeRecorded = null;
  accountChooserResultCalled = false;
  onContinueCalled = false;
  firebaseui.auth.widget.handler.common.accountChooserResult(
      app, code.EMPTY, onContinue);
  assertTrue(accountChooserResultCalled);
  assertEquals(onContinue, onContinueRecorded);
  assertEquals(code.EMPTY, typeRecorded);
  assertFalse(onContinueCalled);
}


function testSelectFromAccountChooser_acCallbacks_unavailable() {
  // Test email first mode select from accountchooser.com when
  // accountchooser.com callbacks provided.
  // Test when accountchooser.com is unavailable.
  app.setConfig({
    'credentialHelper': firebaseui.auth.CredentialHelper.NONE,
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  // Simulate accountchooser.com being unavailable.
  testAc.setSkipSelect(true);
  testAc.setAvailability(false);
  // Trigger select from accountchooser.com.
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  // Confirm accountchooser.com invoked callback called and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // accountchooser.com unavailable.
  assertAndRunAccountChooserResultCallback('unavailable');
  // The sign-in page should show.
  assertSignInPage();
}


function testSelectFromAccountChooser_acCallbacks_empty() {
  // Test email-first mode select from accountchooser.com when
  // accountchooser.com callbacks provided.
  // Test when accountchooser.com is empty.
  app.setConfig({
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  // Simulate empty response from accountchooser.com.
  testAc.setSkipSelect(true);
  // Trigger select from accountchooser.com.
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  // Confirm accountchooser.com invoked callback called and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Empty accountchooser.com response.
  assertAndRunAccountChooserResultCallback('empty');
  // The sign-in page should show.
  assertSignInPage();
}


function testSelectFromAccountChooser_acCallbacks_unregistered() {
  // Test when an account is selected from accountchooser.com.
  app.setConfig({
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  asyncTestCase.waitForSignals(1);
  // Simulate account selected from accountchooser.com.
  testAc.setSelectedAccount(passwordAccount);
  // Trigger select from accountchooser.com.
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  // No pending accountchooser.com response which will trigger try select.
  testAc.forceOnEmpty();
  // Confirm accountchooser.com invoked callback called and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Existing account selected logged.
  assertAndRunAccountChooserResultCallback('accountSelected');

  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()],
      []);
  testAuth.process().then(function() {
    // Unregistered federated account should be treated as password sign up in
    // provider-first display mode.
    assertPasswordSignUpPage();
    assertEquals(
        passwordAccount.getEmail(),
        goog.dom.forms.getValue(getEmailElement()));
    assertEquals(
        passwordAccount.getDisplayName(),
        goog.dom.forms.getValue(getNameElement()));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_acCallbacks_existingAcct() {
  // Test when an account is selected from accountchooser.com that is a password
  // user.
  app.setConfig({
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  asyncTestCase.waitForSignals(1);
  // Simulate account selected from accountchooser.com.
  testAc.setSelectedAccount(passwordAccount);
  // Trigger select from accountchooser.com.
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  // No pending accountchooser.com response which will trigger try select.
  testAc.forceOnEmpty();
  // Confirm accountchooser.com invoked callback called and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Existing account selected logged.
  assertAndRunAccountChooserResultCallback('accountSelected');
  testAuth.assertFetchProvidersForEmail(
      [passwordAccount.getEmail()],
      ['google.com', 'password']);
  testAuth.process().then(function() {
    assertPasswordSignInPage();
    assertEquals(
        passwordAccount.getEmail(), goog.dom.forms.getValue(getEmailElement()));
    assertEquals(0, getIdpButtons().length);
    assertTrue(firebaseui.auth.storage.hasRememberAccount(app.getAppId()));
    assertFalse(firebaseui.auth.storage.isRememberAccount(app.getAppId()));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_acCallbacks_existingAccount_error() {
  // Test select from accountchooser.com when accountchooser.com callbacks
  // provided. Test when an account is selected from accountchooser.com and
  // error returned from FirebaseUI server.
  app.setConfig({
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  asyncTestCase.waitForSignals(1);
  // Simulate account selected from accountchooser.com.
  testAc.setSelectedAccount(federatedAccount);
  // Trigger select from accountchooser.com.
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  // No pending accountchooser.com response which will trigger try select.
  testAc.forceOnEmpty();
  // Confirm accountchooser.com invoked callback called and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Existing account selected logged.
  assertAndRunAccountChooserResultCallback('accountSelected');
  testAuth.assertFetchProvidersForEmail(
      [federatedAccount.getEmail()], null, internalError);
  testAuth.process().then(function() {
    // An error in fetch providers for email should redirect to provider sign in
    // page with the error message in the info bar.
    assertProviderSignInPage();
    assertInfoBarMessage(
        firebaseui.auth.widget.handler.common.getErrorMessage(internalError));
    asyncTestCase.signal();
  });
}


function testSelectFromAccountChooser_acCallbacks_addAccount() {
  // Test when add account is selected from accountchooser.com.
  app.setConfig({
    'callbacks': {
      'accountChooserResult': accountChooserResultCallback,
      'accountChooserInvoked': accountChooserInvokedCallback
    }
  });
  // Simulate add account in accountchooser.com click.
  testAc.setAddAccount();
  // Trigger select from accountchooser.com.
  firebaseui.auth.widget.handler.common.selectFromAccountChooser(getApp,
      container);
  // No pending accountchooser.com response which will trigger try select.
  testAc.forceOnEmpty();
  // Confirm accountchooser.com invoked callback called and run on continue
  // function.
  assertAndRunAccountChooserInvokedCallback();
  // Add account selected logged.
  assertAndRunAccountChooserResultCallback('addAccount');
  // The sign-in page should show.
  assertSignInPage();
}


function testHandleSignInFetchProvidersForEmail_unregistered() {
  var providers = [];
  var email = 'user@example.com';
  var displayName = 'John Doe';
  firebaseui.auth.widget.handler.common.handleSignInFetchProvidersForEmail(
      app, container, providers, email, displayName);
  // Password sign up page should show with email and display name populated.
  assertPasswordSignUpPage();
  assertEquals(
        email,
        goog.dom.forms.getValue(getEmailElement()));
    assertEquals(
        displayName,
        goog.dom.forms.getValue(getNameElement()));
}


function testHandleSignInFetchProvidersForEmail_registeredPasswordAccount() {
  var providers = ['google.com', 'facebook.com', 'password'];
  var email = 'user@example.com';
  firebaseui.auth.widget.handler.common.handleSignInFetchProvidersForEmail(
      app, container, providers, email);
  // Password sign-in page should show.
  assertPasswordSignInPage();
  assertEquals(email, goog.dom.forms.getValue(getEmailElement()));
  assertEquals(0, getIdpButtons().length);
}


function testHandleSignInFetchProvidersForEmail_registeredFederatedAccount() {
  var providers = ['google.com', 'facebook.com'];
  var email = 'user@example.com';
  firebaseui.auth.widget.handler.common.handleSignInFetchProvidersForEmail(
      app, container, providers, email);
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


function testLoadAccountchooserJs_externallyLoaded() {
  // Test accountchooser.com client loading when already loaded.
  // Reset loadAccountchooserJs stubs.
  testStubs.reset();
  // Externally loaded.
  accountchooser = {};
  firebaseui.auth.widget.handler.common.acLoader_ = null;
  asyncTestCase.waitForSignals(1);
  var callback = function() {
    asyncTestCase.signal();
  };
  firebaseui.auth.widget.handler.common.loadAccountchooserJs(app, callback);
}


function testLoadAccountchooserJs_notLoaded() {
  // Test accountchooser.com client loading when not loaded.
  // Reset loadAccountchooserJs stubs.
  testStubs.reset();
  // Replace jsloader.
  var jsLoaderInvoked = 0;
  testStubs.replace(
      goog.net.jsloader,
      'load',
      function() {
        return goog.Promise.resolve().then(function() {
          // Should be invoked once.
          jsLoaderInvoked++;
          assertEquals(1, jsLoaderInvoked);
        });
      });
  // This will force an attempt to load the client.
  accountchooser = undefined;
  firebaseui.auth.widget.handler.common.acLoader_ = null;
  asyncTestCase.waitForSignals(2);
  var callback = function() {
    asyncTestCase.signal();
  };
  var callback2 = function() {
    asyncTestCase.signal();
  };
  firebaseui.auth.widget.handler.common.loadAccountchooserJs(app, callback);
  firebaseui.auth.widget.handler.common.loadAccountchooserJs(app, callback2);
}


function testLoadAccountchooserJs_notSupported() {
  // Test accountchooser.com client loaded when it is not supported.
  testStubs.reset();
  // Simulate accountchooser.com not supported.
  testStubs.replace(
      firebaseui.auth.sni,
      'isSupported',
      function() {
        return false;
      });
  accountchooser = undefined;
  firebaseui.auth.widget.handler.common.acLoader_ = null;
  asyncTestCase.waitForSignals(1);
  var callback = function() {
    // Callback should still run even though not supported.
    assertUndefined(accountchooser);
    asyncTestCase.signal();
  };
  firebaseui.auth.widget.handler.common.loadAccountchooserJs(app, callback);
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
