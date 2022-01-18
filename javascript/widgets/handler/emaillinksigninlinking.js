/**
 * @fileoverview Email link sign in linking handler.
 */

goog.provide('firebaseui.auth.widget.handler.handleEmailLinkSignInLinking');

goog.require('firebaseui.auth.storage');
goog.require('firebaseui.auth.ui.page.EmailLinkSignInLinking');
goog.require('firebaseui.auth.widget.Handler');
goog.require('firebaseui.auth.widget.HandlerName');
goog.require('firebaseui.auth.widget.handler');
goog.require('firebaseui.auth.widget.handler.common');
goog.requireType('firebaseui.auth.PendingEmailCredential');


/**
 * Handles email link sign in linking.
 *
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!Element} container The container DOM element.
 * @param {string} email The email address of the account.
 */
firebaseui.auth.widget.handler.handleEmailLinkSignInLinking = function(
    app, container, email) {
  var pendingCredential =
      firebaseui.auth.storage.getPendingEmailCredential(app.getAppId());
  // No need to store the credential anymore at this point as it will be
  // encrypted and saved in cookie storage before sending the email link.
  // Delete it quickly.
  firebaseui.auth.storage.removePendingEmailCredential(app.getAppId());
  if (!pendingCredential) {
    // If no pending credential, it's an error and the user should be redirected
    // to the sign-in page.
    firebaseui.auth.widget.handler.common.handleSignInStart(app, container);
    return;
  }
  var providerId = pendingCredential.getCredential()['providerId'];
  var component = new firebaseui.auth.ui.page.EmailLinkSignInLinking(
      email,
      app.getConfig().getConfigForProvider(providerId),
      // On submit.
      function() {
        firebaseui.auth.widget.handler.onEmailLinkSignInLinkingSubmit_(
            app,
            component,
            email,
            /** @type {!firebaseui.auth.PendingEmailCredential} */ (
                pendingCredential));
      },
      app.getConfig().getTosUrl(),
      app.getConfig().getPrivacyPolicyUrl());
  component.render(container);
  // Set current UI component.
  app.setCurrentComponent(component);
};


/**
 * Handles the linking flow once the user clicks submit button.
 * @param {!firebaseui.auth.AuthUI} app The current Firebase UI instance whose
 *     configuration is used.
 * @param {!firebaseui.auth.ui.page.EmailLinkSignInLinking} component The UI
 *     component.
 * @param {string} email The user's email.
 * @param {!firebaseui.auth.PendingEmailCredential} pendingCredential The
 *     pending credential to link to a successfully signed in user.
 * @private
 */
firebaseui.auth.widget.handler.onEmailLinkSignInLinkingSubmit_ =
    function(app, component, email, pendingCredential) {
  var container = component.getContainer();
  firebaseui.auth.widget.handler.common.sendEmailLinkForSignIn(
      app,
      component,
      email,
      // On cancel handler for email link sent page.
      function() {
        firebaseui.auth.widget.handler.common.handleSignInStart(
            app, container, email);
      },
      // Error occurs while sending the email. If it's a network error, remain
      // on the same page so user can retry. Otherwise, go back to the starting
      // page with prefilled email and error message.
      function(error) {
        // Ignore error if cancelled by the client.
        if (error['name'] && error['name'] == 'cancel') {
          return;
        }
        var errorMessage =
            firebaseui.auth.widget.handler.common.getErrorMessage(error);
        if (error && error['code'] == 'auth/network-request-failed') {
          component.showInfoBar(errorMessage);
        } else {
          component.dispose();
          firebaseui.auth.widget.handler.common.handleSignInStart(
              app, container, email, errorMessage);
        }
      },
      pendingCredential);
};


// Register handler.
firebaseui.auth.widget.handler.register(
    firebaseui.auth.widget.HandlerName.EMAIL_LINK_SIGN_IN_LINKING,
    /** @type {!firebaseui.auth.widget.Handler} */
    (firebaseui.auth.widget.handler.handleEmailLinkSignInLinking));
