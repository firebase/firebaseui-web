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
 * @fileoverview Multi factor authentication in entry page handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleMultiFactorAuthenticationStart');

goog.require('firebaseui.auth.data.country');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.progressDialog');
goog.require('firebaseui.auth.ui.page.MultiFactorAuthenticationStart');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.requireType('goog.Promise');



/**
 * Handles the start of the multi factor authentication operation. The user
 * is asked to choose the phone number and solve a reCAPTCHA (visible
 * or invisible) challenge before the verification code is sent.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {Element} container The container DOM element.
 * @param {firebase.auth.MultiFactorResolver} mfaResolver
 * @param {?string=} opt_mfaInfoUid The value of the mfa info uid to prefill.
 * @param {string=} opt_infoBarMessage The message to show on info bar.
 */
firebaseui.auth.widget.handler.handleMultiFactorAuthenticationStart = function(
    app, container, mfaResolver, opt_mfaInfoUid, opt_infoBarMessage) {
  // Get the developer's reCAPTCHA configuration.
  var recaptchaParameters = app.getConfig().getRecaptchaParameters() || {};
  /** @private {?string} The reCAPTCHA response token. */
  firebaseui.auth.widget.handler.mfaRecaptchaToken_ = null;
  /**
 * @private {boolean} Whether visible reCAPTCHA is enabled. Default is true.
 */
  firebaseui.auth.widget.handler.mfaEnableVisibleRecaptcha_ =
      !(recaptchaParameters && recaptchaParameters['size'] === 'invisible');
  var isPhoneProviderOnly =
      firebaseui.auth.widget.handler.common.isPhoneProviderOnly(app);
  /**
 * @private {firebase.auth.MultiFactorResolver} The mfa resolver.
 */
  firebaseui.auth.widget.handler.mfaResolver_ = mfaResolver;

  // Render the phone sign in start page component.
  var component = new firebaseui.auth.ui.page.MultiFactorAuthenticationStart(
      firebaseui.auth.widget.handler.mfaResolver_.hints,
      // On submit.
      function(e) {
        firebaseui.auth.widget.handler.onMultiFactorAuthenticationStartSubmit_(
            app,
            component,
            recaptchaVerifier,
            // Whether the submission was triggered by a key code.
            !!(e && e.keyCode));
      },
      firebaseui.auth.widget.handler.mfaEnableVisibleRecaptcha_,
      // On cancel.
      isPhoneProviderOnly ? null : function(e) {
        // Go back to start sign in handler.
        recaptchaVerifier.clear();
        component.dispose();
        firebaseui.auth.widget.handler.common.handleSignInStart(
            app, container);
      },
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl(),
      isPhoneProviderOnly,
      opt_mfaInfoUid || null);
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
  // Show info bar if necessary.
  if (opt_infoBarMessage) {
    component.showInfoBar(opt_infoBarMessage);
  }

  // Add callbacks to reCAPTCHA parameters to listen to token changes.
  recaptchaParameters['callback'] = function(recaptchaToken) {
    // Hide any reCAPTCHA error if available.
    if (component.getRecaptchaErrorElement()) {
      firebaseui.auth.ui.element.hide(
          component.getRecaptchaErrorElement());
    }
    // Update the reCAPTCHA response token.
    firebaseui.auth.widget.handler.mfaRecaptchaToken_ = recaptchaToken;
    if (!firebaseui.auth.widget.handler.mfaEnableVisibleRecaptcha_) {
      // If invisible and token ready, submit request.
      // This is needed since when the button is clicked and no response is
      // available, the response may take time to be provisioned either without
      // any user action or by waiting for the challenge to be resolved.
      firebaseui.auth.widget.handler.onMultiFactorAuthenticationStartSubmit_(
          app,
          component,
          recaptchaVerifier);
    }
  };
  recaptchaParameters['expired-callback'] = function() {
    // On expiration, reset reCAPTCHA token.
    firebaseui.auth.widget.handler.mfaRecaptchaToken_ = null;
  };
  // Initialize a reCAPTCHA verifier instance.
  var recaptchaVerifier = new firebase.auth['RecaptchaVerifier'](
      // reCAPTCHA container: either the visible reCAPTCHA element or the submit
      // button for the invisible one.
      firebaseui.auth.widget.handler.mfaEnableVisibleRecaptcha_ ?
          component.getRecaptchaElement() :
          component.getSubmitElement(),
      // reCAPTCHA parameters.
      recaptchaParameters,
      // Use external auth instance. This is OK since on completion, no linking
      // could be required or no additional profile update is needed and it is
      // safe to interrupt.
      app.getExternalAuth().app);
  // Render reCAPTCHA verifier.
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(recaptchaVerifier.render, recaptchaVerifier)
      ),
      [],
      function(widgetId) {
        // reCAPTCHA rendered successfully. Save the corresponding widget ID.
        /** @private {number} The reCAPTCHA widget ID. */
        firebaseui.auth.widget.handler.mfaRecaptchaWidgetId_ =
            /** @type {number} */ (widgetId);
      },
      function(error) {
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        // We need to force re-rendering of the reCAPTCHA, this is why we have
        // to go back to the previous page.
        // This could happen in a bad network situation. The user will try again
        // on network availability and the reCAPTCHA would render this time.
        var errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(error);
        component.dispose();
        firebaseui.auth.widget.handler.common.handleSignInStart(
            app, container, undefined, errorMessage);
      }));
};


/**
 * @const {number} The delay in milliseconds to keep the code sent
 *     dialog on display before displaying the code entry page.
 */
firebaseui.auth.widget.handler.MFA_SENDING_SUCCESS_DIALOG_DELAY = 1000;


/**
 * @const {number} The delay before enabling resend.
 */
firebaseui.auth.widget.handler.MFA_RESEND_DELAY_SECONDS = 15;


/**
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.MultiFactorAuthenticationStart} component The UI
 *     component.
 * @param {!Object} recaptchaVerifier The reCAPTCHA
 *     verifier instance.
 * @param {boolean=} opt_isKeyCode Whether the event was triggered by a key
 *     code.
 * @private
 */
firebaseui.auth.widget.handler.onMultiFactorAuthenticationStartSubmit_ =
    function(app, component, recaptchaVerifier, opt_isKeyCode) {
  // Get mfa info.
  try {
    var mfaInfo = component.getMFAInfoValue(
        firebaseui.auth.widget.handler.mfaResolver_.hints);
  } catch(e) {
    return;
  }

  // If missing, focus phone number element, show the relevant error and exit.
  if (!mfaInfo) {
    // No phone number provided.
    firebaseui.auth.ui.element.show(
        component.getMFAInfoErrorElement(),
        firebaseui.auth.soy2.strings.errorInvalidMultiFactorHint().toString());
    return;
  }
  if (!firebaseui.auth.widget.handler.mfaRecaptchaToken_) {
    // No reCAPTCHA response provided.
    if (firebaseui.auth.widget.handler.mfaEnableVisibleRecaptcha_) {
      // For a visible reCAPTCHA, display the error message asking the user to
      // solve the reCAPTCHA. and exist.
      firebaseui.auth.ui.element.show(
          component.getRecaptchaErrorElement(),
          firebaseui.auth.soy2.strings.errorMissingRecaptchaResponse()
              .toString());
    } else if (!firebaseui.auth.widget.handler.mfaEnableVisibleRecaptcha_ &&
              !!opt_isKeyCode) {
      // For invisible, every time the button is clicked, and no response is
      // available, grecaptcha.execute is called underneath (as it is attached
      // to a button) forcing a recaptcha challenge.
      // After the challenge is solved, the callback is triggered above which
      // will run this routine again, this time proceeding to
      // signInWithPhoneNumber below as a response is available.
      // If the user cancels (clicks outside the prompted visible challenge),
      // nothing will happen. The user will have to either cancel or click
      // verify phone number again to show the challenge again.

      // The click is needed when ENTER key is used to trigger the submit.
      // reCAPTCHA will not automatically call grecaptcha.execute unless a click
      // triggers it.
      component.getSubmitElement().click();
    }
    return;
  }
  // Display the progress dialog while the code is being sent.
  component.showProgressDialog(
      firebaseui.auth.ui.element.progressDialog.State.LOADING,
      firebaseui.auth.soy2.strings.dialogVerifyingPhoneNumber().toString());

  var phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
  var phoneInfoOptions = {
    multiFactorHint: mfaInfo,
    session: firebaseui.auth.widget.handler.mfaResolver_.session
  };
  app.registerPending(component.executePromiseRequest(
      /** @type {function (): !goog.Promise} */ (
          goog.bind(phoneAuthProvider.verifyPhoneNumber, phoneAuthProvider)
      ),
      [phoneInfoOptions, recaptchaVerifier],
      // On success a phone Auth result is returned.
      function(verificationId) {
        // Display the dialog that the code was sent.
        var container = component.getContainer();
        component.showProgressDialog(
            firebaseui.auth.ui.element.progressDialog.State.DONE,
            firebaseui.auth.soy2.strings.dialogCodeSent().toString());
        // Keep the dialog long enough to be seen before redirecting to code
        // entry page.
        var codeVerificationTimer = setTimeout(function() {
          component.dismissDialog();
          // Handle sign in with phone number code verification.
          component.dispose();
          firebaseui.auth.widget.handler.handle(
              firebaseui.auth.widget.HandlerName.MULTI_FACTOR_AUTHENTICATION_FINISH,
              app,
              container,
              mfaInfo,
              firebaseui.auth.widget.handler.MFA_RESEND_DELAY_SECONDS,
              firebaseui.auth.widget.handler.mfaResolver_,
              verificationId);
        }, firebaseui.auth.widget.handler.MFA_SENDING_SUCCESS_DIALOG_DELAY);
        // On reset, clear timeout.
        app.registerPending(function() {
          // Dismiss dialog if still visible.
          if (component) {
            component.dismissDialog();
          }
          clearTimeout(codeVerificationTimer);
        });
      },
      function(error) {
        // Error occurred.
        component.dismissDialog();
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        // Anytime an error is thrown by the backend, reset the response.
        // This is needed since a reCAPTCHA token can only be redeemed once.
        // One common scenario is the following:
        // 1. user enters an invalid phone number.
        // 2. user solves reCAPTCHA.
        // 3. Form submitted.
        // 4. Error thrown by backend due to invalid phone number.
        // 5. User updates the phone number field with the correct number.
        // 6. As reCAPTCHA response unexpired, user will submit again and get
        // a reCAPTCHA check error since the same reCAPTCHA response is sent
        // again.
        // The solution is to reset immediately after the backend throws an
        // error.
        grecaptcha.reset(firebaseui.auth.widget.handler.mfaRecaptchaWidgetId_);
        // Reset reCAPTCHA token.
        firebaseui.auth.widget.handler.mfaRecaptchaToken_ = null;
        var errorMessage =
            /** @type {string} */ ((error && error['message']) || '');
        if (error['code']) {
          // Firebase auth error.
          switch (error['code']) {
            case 'auth/too-many-requests':
              errorMessage =
                  firebaseui.auth.soy2.strings.errorTooManyRequestsPhoneNumber()
                      .toString();
              break;
            default:
              errorMessage =
                  firebaseui.auth.widget.handler.common.getErrorMessage(error);
          }
        }
        // Show error message in the info bar.
        component.showInfoBar(errorMessage);
      }));
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.MULTI_FACTOR_AUTHENTICATION_START,
    /** @type {firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleMultiFactorAuthenticationStart));
