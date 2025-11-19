/*
 * Copyright 2025 Google Inc. All Rights Reserved.
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
 * @fileoverview Integration test example - Complete email/password sign-in flow
 *
 * This file demonstrates how to write integration tests that test complete
 * user workflows from start to finish, including:
 * - Multiple page transitions
 * - Form submissions
 * - Error handling
 * - Success callbacks
 * - Firebase Auth integration
 */

goog.provide('firebaseui.auth.integration.EmailPasswordSignInTest');
goog.setTestOnly('firebaseui.auth.integration.EmailPasswordSignInTest');

goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.testing.FakeAppClient');
goog.require('firebaseui.auth.testing.FakeUtil');
goog.require('firebaseui.auth.widget.Config');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');


/**
 * Integration test suite for complete email/password sign-in flow.
 *
 * Tests the entire user journey:
 * 1. User visits sign-in page
 * 2. Enters email address
 * 3. Enters password
 * 4. Submits form
 * 5. Firebase authenticates user
 * 6. Success callback is triggered
 * 7. User is redirected
 */


var authUI;
var container;
var mockControl;
var testAuth;
var testApp;
var testUtil;


function setUp() {
  // Create container for UI
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  // Set up mocks
  mockControl = new goog.testing.MockControl();
  testUtil = new FakeUtil().install();
  testApp = new FakeAppClient();
  testAuth = testApp.auth();

  // Create AuthUI instance
  authUI = new firebaseui.auth.AuthUI(testAuth);
}


function tearDown() {
  if (authUI) {
    authUI.delete();
  }
  goog.dom.removeNode(container);
  mockControl.$verifyAll();
  mockControl.$resetAll();
  testUtil.uninstall();
}


/**
 * Integration Test: Complete email/password sign-in flow - Success case
 */
function testIntegration_emailPasswordSignIn_success() {
  return new goog.Promise(function(resolve, reject) {
    // Configuration with success callback
    var signInSuccessUrl = 'https://www.example.com/home';
    var signInSuccessCalled = false;

    var config = {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          signInSuccessCalled = true;

          // Verify auth result
          assertNotNull(authResult);
          assertNotNull(authResult.user);
          assertEquals('user@example.com', authResult.user.email);

          // Verify redirect URL
          assertEquals(signInSuccessUrl, redirectUrl);

          // Return false to prevent automatic redirect in test
          return false;
        }
      },
      signInSuccessUrl: signInSuccessUrl,
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]
    };

    // Start the UI
    authUI.start(container, config);

    // Wait for UI to render
    testUtil.wait(100).then(function() {
      // Find email input
      var emailInput = container.querySelector('.firebaseui-id-email');
      assertNotNull('Email input should be present', emailInput);

      // Enter email
      goog.dom.forms.setValue(emailInput, 'user@example.com');

      // Find and click submit button
      var submitButton = container.querySelector('.firebaseui-id-submit');
      assertNotNull('Submit button should be present', submitButton);
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Should now be on password page
      var passwordInput = container.querySelector('.firebaseui-id-password');
      assertNotNull('Password input should be present', passwordInput);

      // Enter password
      goog.dom.forms.setValue(passwordInput, 'password123');

      // Submit password
      var submitButton = container.querySelector('.firebaseui-id-submit');
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Mock successful authentication
      testAuth.setUser({
        email: 'user@example.com',
        displayName: 'Test User',
        uid: 'user123'
      });

      return testUtil.wait(100);
    }).then(function() {
      // Verify success callback was called
      assertTrue('Success callback should be called', signInSuccessCalled);

      resolve();
    }).thenCatch(function(error) {
      reject(error);
    });
  });
}


/**
 * Integration Test: Email/password sign-in with wrong password
 */
function testIntegration_emailPasswordSignIn_wrongPassword() {
  return new goog.Promise(function(resolve, reject) {
    var config = {
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
    };

    authUI.start(container, config);

    testUtil.wait(100).then(function() {
      // Enter email
      var emailInput = container.querySelector('.firebaseui-id-email');
      goog.dom.forms.setValue(emailInput, 'user@example.com');

      var submitButton = container.querySelector('.firebaseui-id-submit');
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Enter wrong password
      var passwordInput = container.querySelector('.firebaseui-id-password');
      goog.dom.forms.setValue(passwordInput, 'wrongpassword');

      // Mock authentication error
      testAuth.failNext('auth/wrong-password');

      var submitButton = container.querySelector('.firebaseui-id-submit');
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Verify error is displayed
      var errorElement = container.querySelector('.firebaseui-id-info-bar');
      assertNotNull('Error message should be displayed', errorElement);

      var errorText = goog.dom.getTextContent(errorElement);
      assertTrue('Error should mention wrong password',
          errorText.indexOf('password') !== -1 ||
          errorText.indexOf('incorrect') !== -1);

      resolve();
    }).thenCatch(function(error) {
      reject(error);
    });
  });
}


/**
 * Integration Test: Email validation before password page
 */
function testIntegration_emailValidation_invalidFormat() {
  return new goog.Promise(function(resolve, reject) {
    var config = {
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
    };

    authUI.start(container, config);

    testUtil.wait(100).then(function() {
      // Enter invalid email
      var emailInput = container.querySelector('.firebaseui-id-email');
      goog.dom.forms.setValue(emailInput, 'not-an-email');

      var submitButton = container.querySelector('.firebaseui-id-submit');
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Verify error is shown and we didn't navigate to password page
      var emailError = container.querySelector('.firebaseui-id-email-error');
      assertNotNull('Email error should be displayed', emailError);
      assertFalse('Email error should be visible',
          goog.dom.classlist.contains(emailError, 'firebaseui-hidden'));

      // Verify we're still on email page (password input should not exist)
      var passwordInput = container.querySelector('.firebaseui-id-password');
      assertNull('Should still be on email page', passwordInput);

      resolve();
    }).thenCatch(function(error) {
      reject(error);
    });
  });
}


/**
 * Integration Test: Account creation flow (sign-up)
 */
function testIntegration_emailPasswordSignUp_newAccount() {
  return new goog.Promise(function(resolve, reject) {
    var config = {
      signInOptions: [{
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: true
      }]
    };

    authUI.start(container, config);

    testUtil.wait(100).then(function() {
      // Enter new email
      var emailInput = container.querySelector('.firebaseui-id-email');
      goog.dom.forms.setValue(emailInput, 'newuser@example.com');

      // Mock that this email doesn't exist
      testAuth.setFetchSignInMethodsForEmail(['password'], []);

      var submitButton = container.querySelector('.firebaseui-id-submit');
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Should be on sign-up page with name and password fields
      var nameInput = container.querySelector('.firebaseui-id-name');
      var passwordInput = container.querySelector('.firebaseui-id-new-password');

      assertNotNull('Name input should be present', nameInput);
      assertNotNull('Password input should be present', passwordInput);

      // Fill in details
      goog.dom.forms.setValue(nameInput, 'New User');
      goog.dom.forms.setValue(passwordInput, 'newpassword123');

      var submitButton = container.querySelector('.firebaseui-id-submit');
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Mock successful account creation
      testAuth.setUser({
        email: 'newuser@example.com',
        displayName: 'New User',
        uid: 'newuser123'
      });

      return testUtil.wait(100);
    }).then(function() {
      // Verify account was created
      var currentUser = testAuth.currentUser;
      assertNotNull('User should be signed in', currentUser);
      assertEquals('newuser@example.com', currentUser.email);
      assertEquals('New User', currentUser.displayName);

      resolve();
    }).thenCatch(function(error) {
      reject(error);
    });
  });
}


/**
 * Integration Test: Password reset flow
 */
function testIntegration_passwordReset_complete() {
  return new goog.Promise(function(resolve, reject) {
    var config = {
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
    };

    authUI.start(container, config);

    testUtil.wait(100).then(function() {
      // Enter email
      var emailInput = container.querySelector('.firebaseui-id-email');
      goog.dom.forms.setValue(emailInput, 'user@example.com');

      var submitButton = container.querySelector('.firebaseui-id-submit');
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Click "Forgot password?" link
      var troubleLink = container.querySelector('.firebaseui-id-secondary-link');
      assertNotNull('Trouble signing in link should be present', troubleLink);
      goog.testing.events.fireClickSequence(troubleLink);

      return testUtil.wait(100);
    }).then(function() {
      // Should be on password recovery page
      var emailInput = container.querySelector('.firebaseui-id-email');
      assertNotNull('Email input should be on recovery page', emailInput);

      // Email should be pre-filled
      assertEquals('user@example.com', goog.dom.forms.getValue(emailInput));

      // Submit password reset
      var submitButton = container.querySelector('.firebaseui-id-submit');
      goog.testing.events.fireClickSequence(submitButton);

      return testUtil.wait(100);
    }).then(function() {
      // Verify success message
      var message = container.querySelector('.firebaseui-id-page-password-recovery-email-sent');
      assertNotNull('Success message should be displayed', message);

      resolve();
    }).thenCatch(function(error) {
      reject(error);
    });
  });
}


/**
 * Integration Test: Multiple provider options
 */
function testIntegration_multipleProviders_emailAndGoogle() {
  return new goog.Promise(function(resolve, reject) {
    var config = {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]
    };

    authUI.start(container, config);

    testUtil.wait(100).then(function() {
      // Verify both provider buttons are present
      var googleButton = container.querySelector('[data-provider-id="google.com"]');
      var emailButton = container.querySelector('[data-provider-id="password"]');

      assertNotNull('Google sign-in button should be present', googleButton);
      assertNotNull('Email sign-in button should be present', emailButton);

      // Click email sign-in
      goog.testing.events.fireClickSequence(emailButton);

      return testUtil.wait(100);
    }).then(function() {
      // Should navigate to email sign-in page
      var emailInput = container.querySelector('.firebaseui-id-email');
      assertNotNull('Should navigate to email sign-in', emailInput);

      resolve();
    }).thenCatch(function(error) {
      reject(error);
    });
  });
}


/**
 * Integration Test: Session persistence across page refresh
 */
function testIntegration_sessionPersistence() {
  return new goog.Promise(function(resolve, reject) {
    // Set up user session
    testAuth.setUser({
      email: 'user@example.com',
      uid: 'user123'
    });

    var config = {
      callbacks: {
        signInSuccessWithAuthResult: function() {
          return false;
        }
      },
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
    };

    // Start UI - should detect existing session
    authUI.start(container, config);

    testUtil.wait(100).then(function() {
      // Verify user is already signed in
      var currentUser = testAuth.currentUser;
      assertNotNull('User should be signed in from session', currentUser);
      assertEquals('user@example.com', currentUser.email);

      resolve();
    }).thenCatch(function(error) {
      reject(error);
    });
  });
}


/**
 * Integration Test: Keyboard navigation through entire flow
 */
function testIntegration_keyboardNavigation_enterKey() {
  return new goog.Promise(function(resolve, reject) {
    var config = {
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
    };

    authUI.start(container, config);

    testUtil.wait(100).then(function() {
      // Enter email and press Enter
      var emailInput = container.querySelector('.firebaseui-id-email');
      goog.dom.forms.setValue(emailInput, 'user@example.com');

      goog.testing.events.fireKeySequence(emailInput, goog.events.KeyCodes.ENTER);

      return testUtil.wait(100);
    }).then(function() {
      // Should navigate to password page
      var passwordInput = container.querySelector('.firebaseui-id-password');
      assertNotNull('Should navigate to password page', passwordInput);

      // Enter password and press Enter
      goog.dom.forms.setValue(passwordInput, 'password123');
      goog.testing.events.fireKeySequence(passwordInput, goog.events.KeyCodes.ENTER);

      return testUtil.wait(100);
    }).then(function() {
      // Mock successful auth
      testAuth.setUser({
        email: 'user@example.com',
        uid: 'user123'
      });

      return testUtil.wait(100);
    }).then(function() {
      // Verify user is signed in
      assertNotNull('User should be signed in', testAuth.currentUser);

      resolve();
    }).thenCatch(function(error) {
      reject(error);
    });
  });
}
