/**
 * @fileoverview Firebase Authentication API.
 *
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @externs
 */

/**
 * The FirebaseUI namespace.
 * @namespace
 */
firebaseui = {};

/**
 * The FirebaseUI auth namespace.
 * @namespace
 */
firebaseui.auth = {};


/**
 * @param {!firebase.auth.Auth} auth The Firebase Auth instance.
 * @param {string=} appId The optional app id.
 * @constructor
 */
firebaseui.auth.AuthUI = function(auth, appId) {};

/**
 * Returns the AuthUI instance corresponding to the appId provided.
 *
 * @param {?string=} appId The optional app ID whose instance is to be
 *     provided.
 * @return {?firebaseui.auth.AuthUI} The AuthUI instance corresponding to the
 *     app ID provided.
 */
firebaseui.auth.AuthUI.getInstance = function(appId) {};

/**
 * Disables One-Tap auto sign-in.
 */
firebaseui.auth.AuthUI.prototype.disableAutoSignIn = function() {};

/**
 * Handles the FirebaseUI operation.
 * An `Error` is thrown if the developer tries to run this operation
 * more than once.
 *
 * @param {string|!Element} element The container element or the query selector.
 * @param {!firebaseui.auth.Config} config The configuration for the rendered
 *     UI.
 */
firebaseui.auth.AuthUI.prototype.start = function(element, config) {};

/**
 * Sets the app configuration.
 *
 * @param {!firebaseui.auth.Config} config The application configuration.
 */
firebaseui.auth.AuthUI.prototype.setConfig = function(config) {};

/**
 * Triggers the sign-in flow.
 */
firebaseui.auth.AuthUI.prototype.signIn = function() {};

/** Reset rendered widget and removes it from display. */
firebaseui.auth.AuthUI.prototype.reset = function() {};

/**
 * Destroys the AuthUI instance.
 *
 * @return {!Promise<void>} The promise that resolves when the instance is
 *     successfully deleted.
 */
firebaseui.auth.AuthUI.prototype.delete = function() {};

/**
 * Returns true if there is any pending redirect operations to be resolved by
 * the widget.
 *
 * @return {boolean} Whether the app has pending redirect operations to be
 *     performed.
 */
firebaseui.auth.AuthUI.prototype.isPendingRedirect = function() {};


/**
 * FirebaseUI related error typically returned via `signInFailure` callback.
 *
 * @interface
 * @extends {Error}
 */
firebaseui.auth.AuthUIError = function() {};

/**
 * The short error code.
 *
 * @type {string}
 */
firebaseui.auth.AuthUIError.prototype.code;

/**
 * The human-readable error message.
 *
 * @type {string}
 */
firebaseui.auth.AuthUIError.prototype.message;

/**
 * Any sign in associated Firebase Auth credential used to help recover from an
 * error.
 *
 * @type {?firebase.auth.AuthCredential}
 */
firebaseui.auth.AuthUIError.prototype.credential;

/**
 * @return {!Object} The plain object representation of the error.
 */
firebaseui.auth.AuthUIError.prototype.toJSON = function() {};


/**
 * The FirebaseUI credential helpers available.
 *
 * @enum {string}
 */
firebaseui.auth.CredentialHelper = {
  ACCOUNT_CHOOSER_COM: 'accountchooser.com',
  GOOGLE_YOLO: 'googleyolo',
  NONE: 'none'
};


/**
 * FirebaseUI application related configuration settings.
 *
 * @interface
 */
firebaseui.auth.Config = function() {};

/**
 * The accountchooser.com configuration when it is selected as credential
 * helper.
 *
 * @type {!Object|undefined}
 */
firebaseui.auth.Config.prototype.acUiConfig;

/**
 * Whether to upgrade anonymous users on sign-in. The default is false.
 *
 * @type {boolean|undefined}
 */
firebaseui.auth.Config.prototype.autoUpgradeAnonymousUsers;

/**
 * The callbacks to trigger on operations like sign-in success, failure, etc.
 *
 * @type {!firebaseui.auth.Callbacks|undefined}
 */
firebaseui.auth.Config.prototype.callbacks;

/**
 * Determines which credential helper to use. The default is accountchooser.com.
 *
 * @type {!firebaseui.auth.CredentialHelper|undefined}
 */
firebaseui.auth.Config.prototype.credentialHelper;

/**
 * Whether to open the sign-in widget in a popup when `signIn` is called. The
 * default is false.
 *
 * @type {!boolean|undefined}
 */
firebaseui.auth.Config.prototype.popupMode;

/**
 * Determines the query key name for successful sign-in URL. The default is
 * 'signInSuccessUrl'.
 *
 * @type {string|undefined}
 */
firebaseui.auth.Config.prototype.queryParameterForSignInSuccessUrl;

/**
 * Determines the query key name for the widget mode. The default is 'mode'.
 *
 * @type {string|undefined}
 */
firebaseui.auth.Config.prototype.queryParameterForWidgetMode;

/**
 * Determines the sign-in flow, 'popup' or 'redirect'. The former will use
 * signInWithPopup whereas the latter will use the default signInWithRedirect
 * when a federated sign-in is triggered.
 *
 * @type {string|undefined}
 */
firebaseui.auth.Config.prototype.signInFlow;

/**
 * Determines the list of IdPs for handling federated sign-in, phone number as
 * well as password account sign-up.
 *
 * @type {!Array<!firebaseui.auth.SignInOption>|undefined}
 */
firebaseui.auth.Config.prototype.signInOptions;

/**
 * The URL to redirect to on sign in success.
 *
 * @type {string|undefined}
 */
firebaseui.auth.Config.prototype.signInSuccessUrl;

/**
 * The application display name.
 *
 * @type {string|undefined}
 */
firebaseui.auth.Config.prototype.siteName;

/**
 * The terms of service URL.
 *
 * @type {string|undefined}
 */
firebaseui.auth.Config.prototype.tosUrl;

/**
 * The sign-in widget URL. If not provided, this is the current URL.
 *
 * @type {string|undefined}
 */
firebaseui.auth.Config.prototype.widgetUrl;


/**
 * Defines all the FirebaseUI callbacks that can be passed to a
 * `firebaseui.auth.Config` object.
 *
 * @interface
 */
firebaseui.auth.Callbacks = function() {};

/**
 * Defines the sign-in success callback which will get triggered on successful
 * sign-in.
 *
 * @param {!firebase.auth.UserCredential} authResult The
 *     `firebase.auth.UserCredential` corresponding to the signed in user.
 * @param {string=} redirectUrl The redirect URL if it was previously appended
 *     to the page URL.
 * @return {boolean} Whether to automatically redirect to the
 *     `signInSuccessUrl`.
 */
firebaseui.auth.Callbacks.prototype.signInSuccessWithAuthResult =
    function(authResult, redirectUrl) {};

/**
 * The `signInFailure` callback is provided to handle any unrecoverable error
 * encountered during the sign-in process. The error provided here is a
 * `firebaseui.auth.AuthUIError` error.
 *
 * @param {!firebaseui.auth.AuthUIError} error The FirebaseUI error identifying
 *     the reason behind the failure.
 * @return {!Promise<void>} A promise that resolves when the merge conflict
 *     is completed.
 */
firebaseui.auth.Callbacks.prototype.signInFailure = function(error) {};

/**
 * Defines the callback which gets triggered when the initial UI is rendered.
 */
firebaseui.auth.Callbacks.prototype.uiShown = function() {};


/**
 * Defines the sign-in option needed to configure the FirebaseUI sign-in widget.
 *
 * @interface
 */
firebaseui.auth.SignInOption = function() {};

/**
 * The provider ID for the provided sign in option,
 * eg: `firebase.auth.GoogleAuthProvider.PROVIDER_ID`.
 *
 * @type {string}
 */
firebaseui.auth.SignInOption.prototype.provider;

/**
 * The Auth method (typically the authorization endpoint) needed for one-tap
 * sign-up, eg: 'https://accounts.google.com'.
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.authMethod;

/**
 * The OAuth client ID needed for one-tap sign-up credential helper.
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.clientId;

/**
 * The list of additional OAuth scopes for the selected provider.
 *
 * @example
 * var scopes = [
 *   'https://www.googleapis.com/auth/plus.login'
 * ];
 *
 * @type {!Array<string>|undefined}
 */
firebaseui.auth.SignInOption.prototype.scopes;

/**
 * The custom OAuth parameters for the selected OAuth provider.
 *
 * @example
 * var customParameters = {
 *   // Forces account selection even when one account
 *   // is available.
 *   prompt: 'select_account'
 * };
 *
 * @type {!Object|undefined}
 */
firebaseui.auth.SignInOption.prototype.customParameters;

/**
 * Whether to require the display name to be provided for email/password user
 * creation flow.
 *
 * @type {boolean|undefined}
 */
firebaseui.auth.SignInOption.prototype.requireDisplayName;

/**
 * The reCAPTCHA parameters needed to customize the reCAPTCHA for phone
 * authentication flows.
 *
 * @example
 * var recaptchaParameters = {
 *   type: 'image', // 'audio'
 *   size: 'normal', // 'invisible' or 'compact'
 *   badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
 * };
 *
 * @type {{
 *   type: (string|undefined),
 *   size: (string|undefined),
 *   badge: (string|undefined)
 * }|undefined}
 */
firebaseui.auth.SignInOption.prototype.recaptchaParameters;

/**
 * Sets the default country, eg. (GB) for the United Kingdom.
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.defaultCountry;

/**
 * The default national number which will be prefilled when the phone sign-in
 * screen is rendered, eg: '1234567890'
 * This will only be observed if only phone Auth provider is used since
 * for multiple providers, the NASCAR screen will always render first
 * with a 'sign in with phone number' button.
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.defaultNationalNumber;

/**
 * The full phone number string instead of the 'defaultCountry' and
 * 'defaultNationalNumber'. The 'defaultCountry' and 'defaultNationaNumber'
 * will always have higher priority than 'loginHint' which will be ignored in
 * their favor.
 * Example: '+11234567890'
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.loginHint;
