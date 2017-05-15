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
 * @fileoverview Test for action code handler.
 */

goog.provide('firebaseui.auth.widget.handler.ActionCodeTest');
goog.setTestOnly('firebaseui.auth.widget.handler.ActionCodeTest');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.widget.Config');
goog.require('firebaseui.auth.widget.handler.common');
goog.require('firebaseui.auth.widget.handler.handleEmailChangeRevocation');
goog.require('firebaseui.auth.widget.handler.handleEmailVerification');
goog.require('firebaseui.auth.widget.handler.handlePasswordReset');
goog.require('firebaseui.auth.widget.handler.testHelper');
goog.require('goog.dom.forms');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.events');


var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();


function testHandlePasswordReset() {
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.handlePasswordReset(
      app, container, 'PASSWORD_RESET_ACTION_CODE');
  app.getAuth().assertVerifyPasswordResetCode(
      ['PASSWORD_RESET_ACTION_CODE'], 'user@example.com');
  app.getAuth().process().then(function() {
    assertPasswordResetPage();
    goog.dom.forms.setValue(getNewPasswordElement(), '123123');
    submitForm();
    app.getAuth().assertConfirmPasswordReset(
        ['PASSWORD_RESET_ACTION_CODE', '123123']);
    return app.getAuth().process();
  }).then(function() {
    assertPasswordResetSuccessPage();
    asyncTestCase.signal();
  });
}


function testHandlePasswordReset_reset() {
  // Test reset after password reset page rendered.
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.handlePasswordReset(
      app, container, 'PASSWORD_RESET_ACTION_CODE');
  app.getAuth().assertVerifyPasswordResetCode(
      ['PASSWORD_RESET_ACTION_CODE'], 'user@example.com');
  app.getAuth().process().then(function() {
    assertPasswordResetPage();
    // Reset current rendered widget page.
    app.reset();
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testHandlePasswordReset_inProcessing() {
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.handlePasswordReset(
      app, container, 'PASSWORD_RESET_ACTION_CODE');
  // Verify action code.
  app.getAuth().assertVerifyPasswordResetCode(
      ['PASSWORD_RESET_ACTION_CODE'], 'user@example.com');
  app.getAuth().process().then(function() {
    // Password reset page should show.
    assertPasswordResetPage();

    goog.dom.forms.setValue(getNewPasswordElement(), '123123');
    submitForm();
    delayForBusyIndicatorAndAssertIndicatorShown();
    // Click submit again.
    submitForm();
    // Only one request sent.
    // Confirm password reset.
    app.getAuth().assertConfirmPasswordReset(
        ['PASSWORD_RESET_ACTION_CODE', '123123']);
    app.getAuth().process().then(function() {
      // Password reset success page should show.
      assertPasswordResetSuccessPage();
      // Reset current rendered widget page.
      app.reset();
      // Container should be cleared.
      assertComponentDisposed();
      asyncTestCase.signal();
    });
  });
}


function testHandlePasswordReset_failToCheckActionCode() {
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.handlePasswordReset(
      app, container, 'PASSWORD_RESET_ACTION_CODE');
  // Verify action code should fail here.
  app.getAuth().assertVerifyPasswordResetCode(
      ['PASSWORD_RESET_ACTION_CODE'],
      null,
      new Error('INVALID_ACTION_CODE'));
  app.getAuth().process().then(function() {
    // Password reset failure page should show.
    assertPasswordResetFailurePage();
    // Reset current rendered widget page.
    app.reset();
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testHandlePasswordReset_weakPasswordError() {
  var error = {'code': 'auth/weak-password'};
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.handlePasswordReset(
      app, container, 'PASSWORD_RESET_ACTION_CODE');
  // Successful action code verification.
  app.getAuth().assertVerifyPasswordResetCode(
      ['PASSWORD_RESET_ACTION_CODE'], 'user@example.com');
  app.getAuth().process().then(function() {
    // Password reset page should show.
    assertPasswordResetPage();

    goog.dom.forms.setValue(getNewPasswordElement(), '123');
    // Submit password reset form.
    submitForm();
    // Simulates password too short.
    app.getAuth().assertConfirmPasswordReset(
        ['PASSWORD_RESET_ACTION_CODE', '123'], null, error);
    return app.getAuth().process();
  }).then(function() {
    // Error message should be shown on the same page.
    assertPasswordResetPage();
    assertEquals(
        firebaseui.auth.widget.handler.common.getErrorMessage(error),
        getNewPasswordErrorMessage());
    asyncTestCase.signal();
  });
}


function testHandlePasswordReset_failToResetPassword() {
  asyncTestCase.waitForSignals(1);
  firebaseui.auth.widget.handler.handlePasswordReset(
      app, container, 'PASSWORD_RESET_ACTION_CODE');
  // Successful action code verification.
  app.getAuth().assertVerifyPasswordResetCode(
      ['PASSWORD_RESET_ACTION_CODE'], 'user@example.com');
  app.getAuth().process().then(function() {
    // Password reset page should show.
    assertPasswordResetPage();

    goog.dom.forms.setValue(getNewPasswordElement(), '123123');
    // Submit password reset form.
    submitForm();
    // Simulate expired action code.
    app.getAuth().assertConfirmPasswordReset(
        ['PASSWORD_RESET_ACTION_CODE', '123123'],
        null,
        new Error('EXPIRED_ACTION_CODE'));
    return app.getAuth().process();
  }).then(function() {
    // Password reset failure page should show.
    assertPasswordResetFailurePage();
    asyncTestCase.signal();
  });
}


function testHandleEmailChangeRevocation_success() {
  asyncTestCase.waitForSignals(1);
  // Trigger email change action handler.
  firebaseui.auth.widget.handler.handleEmailChangeRevocation(
      app, container, 'EMAIL_CHANGE_REVOKE_ACTION_CODE');
  // Simulate successful revoke email change code.
  app.getAuth().assertCheckActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE'],
      {data: {email: passwordAccount.getEmail()}});
  app.getAuth().assertApplyActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE']);
  return app.getAuth().process().then(function() {
    // Successful revocation.
    assertEmailChangeRevokeSuccessPage();
    // Reset current rendered widget page.
    app.reset();
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testHandleEmailChangeRevocation_reset() {
  // Test reset after calling email change revocation handler.
  asyncTestCase.waitForSignals(1);
  // Trigger email change action handler.
  firebaseui.auth.widget.handler.handleEmailChangeRevocation(
      app, container, 'EMAIL_CHANGE_REVOKE_ACTION_CODE');
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
  // Process all pending promises.
  testAuth.process().then(function() {
    asyncTestCase.signal();
  });
}


function testHandleEmailChangeRevocation_resetPassword_success() {
  asyncTestCase.waitForSignals(1);
  // Trigger email change action handler.
  firebaseui.auth.widget.handler.handleEmailChangeRevocation(
      app, container, 'EMAIL_CHANGE_REVOKE_ACTION_CODE');
  // Successful email change revocation.
  app.getAuth().assertCheckActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE'],
      {data: {email: passwordAccount.getEmail()}});
  app.getAuth().assertApplyActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE']);
  return app.getAuth().process().then(function() {
    // Revocation success screen should show.
    assertEmailChangeRevokeSuccessPage();
    // Get reset password link.
    var link = getResetPasswordLinkElement();
    // Click reset password link.
    goog.testing.events.fireClickSequence(link);
    // Simulate successful password reset.
    app.getAuth().assertSendPasswordResetEmail([passwordAccount.getEmail()]);
    return app.getAuth().process();
  }).then(function() {
    // We should notify the user that the recovery email was sent.
    assertPasswordRecoveryEmailSentPage();
    // Reset current rendered widget page.
    app.reset();
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testHandleEmailChangeRevocation_resetPassword_failure() {
  asyncTestCase.waitForSignals(1);
  // Trigger email change action handler.
  firebaseui.auth.widget.handler.handleEmailChangeRevocation(
      app, container, 'EMAIL_CHANGE_REVOKE_ACTION_CODE');
  // Successful email change revocation.
  app.getAuth().assertCheckActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE'],
      {data: {email: passwordAccount.getEmail()}});
  app.getAuth().assertApplyActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE']);
  return app.getAuth().process().then(function() {
    // Revocation success screen should show.
    assertEmailChangeRevokeSuccessPage();
    // Get reset password link.
    var link = getResetPasswordLinkElement();
    // Click reset password link.
    goog.testing.events.fireClickSequence(link);
    // Simulate unsuccessful password reset.
    app.getAuth().assertSendPasswordResetEmail(
        [passwordAccount.getEmail()],
        null,
        new Error('INTERNAL_ERROR'));
    return app.getAuth().process();
  }).then(function() {
    // Email change revoke page should still show.
    assertEmailChangeRevokeSuccessPage();
    // Info bar should show password reset failure.
    assertInfoBarMessage(firebaseui.auth.soy2.strings.errorSendPasswordReset()
        .toString());
    // Reset current rendered widget page.
    app.reset();
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testHandleEmailChangeRevocation_checkActionCodefailure() {
  asyncTestCase.waitForSignals(1);
  // Trigger email change action handler.
  firebaseui.auth.widget.handler.handleEmailChangeRevocation(
      app, container, 'EMAIL_CHANGE_REVOKE_ACTION_CODE');
  // Simulate invalid action code for email change revocation.
  app.getAuth().assertCheckActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE'],
      null,
      new Error('INTERNAL_ERROR'));
  return app.getAuth().process().then(function() {
    // Email change revocation failure page should show.
    assertEmailChangeRevokeFailurePage();
    // Reset current rendered widget page.
    app.reset();
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testHandleEmailChangeRevocation_applyActionCodefailure() {
  asyncTestCase.waitForSignals(1);
  // Trigger email change action handler.
  firebaseui.auth.widget.handler.handleEmailChangeRevocation(
      app, container, 'EMAIL_CHANGE_REVOKE_ACTION_CODE');
  // Simulate invalid action code for email change revocation.
  app.getAuth().assertCheckActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE'],
      {data: {email: passwordAccount.getEmail()}});
  app.getAuth().assertApplyActionCode(
      ['EMAIL_CHANGE_REVOKE_ACTION_CODE'],
      null,
      new Error('INTERNAL_ERROR'));
  return app.getAuth().process().then(function() {
    // Email change revocation failure page should show.
    assertEmailChangeRevokeFailurePage();
    asyncTestCase.signal();
  });
}


function testHandleEmailVerification_success() {
  asyncTestCase.waitForSignals(1);

  // Trigger email verification handler.
  firebaseui.auth.widget.handler.handleEmailVerification(
      app, container, 'EMAIL_VERIFICATION_ACTION_CODE');
  // Simulate successful email verification code.
  app.getAuth().assertApplyActionCode(['EMAIL_VERIFICATION_ACTION_CODE']);
  app.getAuth().process().then(function() {
    // Successful email verification page should show.
    assertEmailVerificationSuccessPage();
    // Reset current rendered widget page.
    app.reset();
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testHandleEmailVerification_reset() {
  // Test reset after calling email verification handler.
  asyncTestCase.waitForSignals(1);

  // Trigger email verification handler.
  firebaseui.auth.widget.handler.handleEmailVerification(
      app, container, 'EMAIL_VERIFICATION_ACTION_CODE');
  // Reset current rendered widget page.
  app.reset();
  // Container should be cleared.
  assertComponentDisposed();
  // Process all pending promises.
  testAuth.process().then(function() {
    asyncTestCase.signal();
  });
}


function testHandleEmailVerification_failure() {
  asyncTestCase.waitForSignals(1);
  app.getAuth().setUser({uid: '1234'});
  // Trigger email verification handler.
  firebaseui.auth.widget.handler.handleEmailVerification(
      app, container, 'EMAIL_VERIFICATION_ACTION_CODE');
  // Simulate unsuccessful email verification code.
  app.getAuth().assertApplyActionCode(
      ['EMAIL_VERIFICATION_ACTION_CODE'],
      null,
      new Error('INVALID_ACTION_CODE'));
  app.getAuth().process().then(function() {
    // Email verification failure page should show.
    assertEmailVerificationFailurePage();
    // Reset current rendered widget page.
    app.reset();
    // Container should be cleared.
    assertComponentDisposed();
    asyncTestCase.signal();
  });
}


function testHandleEmailVerification_failureAndNotSignedIn() {
  asyncTestCase.waitForSignals(1);
  // User not signed in.
  // Trigger email verification.
  firebaseui.auth.widget.handler.handleEmailVerification(
      app, container, 'EMAIL_VERIFICATION_ACTION_CODE');
  // Simulate unsuccessful email verification action code.
  app.getAuth().assertApplyActionCode(
      ['EMAIL_VERIFICATION_ACTION_CODE'],
      null,
      new Error('INVALID_ACTION_CODE'));
  app.getAuth().process().then(function() {
    // Email verification failure page should show.
    assertEmailVerificationFailurePage();
    asyncTestCase.signal();
  });
}
