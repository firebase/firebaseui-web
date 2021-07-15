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
var firebaseui = {};

/**
 * The FirebaseUI auth namespace.
 * @namespace
 */
firebaseui.auth = {};


/**
 * The FirebaseUI Anonymous Auth Provider namespace.
 * @constructor
 */
firebaseui.auth.AnonymousAuthProvider = {};


/**
 * The FirebaseUI Anonymous Auth Provider ID.
 * @const {string}
 */
firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID = 'anonymous';


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
 * Returns true if there is any pending redirect operation to be resolved by
 * the widget.
 *
 * @return {boolean} Whether the app has pending redirect operations to be
 *     performed or there is a pending incoming sign in with email link
 *     operation waiting to be completed.
 */
firebaseui.auth.AuthUI.prototype.isPendingRedirect = function() {};


/**
 * The CIAP Error interface.
 *
 * @interface
 */
firebaseui.auth.CIAPError = function() {};

/**
 * The short error code.
 *
 * @type {string}
 */
firebaseui.auth.CIAPError.prototype.code;

/**
 * The human-readable error message.
 *
 * @type {string}
 */
firebaseui.auth.CIAPError.prototype.message;

/**
 * The HTTP error code number.
 *
 * @type {number|undefined}
 */
firebaseui.auth.CIAPError.prototype.httpErrorCode;

/**
 * The underlying reason error if available.
 *
 * @type {!Error|undefined}
 */
firebaseui.auth.CIAPError.prototype.reason;

/**
 * Returns a JSON-serializable representation of the error.
 * @return {!Object} The plain object representation of the error.
 */
firebaseui.auth.CIAPError.prototype.toJSON = function() {};


/**
 * The CIAP recoverable error interface.
 * @interface
 * @extends {firebaseui.auth.CIAPError}
 */
firebaseui.auth.CIAPRetryError = function() {};


/**
 * The retry callback to recover from error.
 * @return {!Promise<void>} A promise that resolves on retry completion.
 */
firebaseui.auth.CIAPRetryError.prototype.retry = function() {};


/**
 * Defines the structure for the object used to identify the project.
 *
 * @interface
 */
firebaseui.auth.ProjectConfig = function() {};


/**
 * The project ID.
 * @type {string}
 */
firebaseui.auth.ProjectConfig.prototype.projectId;


/**
 * The API key.
 * @type {string}
 */
firebaseui.auth.ProjectConfig.prototype.apiKey;


/**
 * Defines the structure of matching tenant and providers enabled for the
 * tenant.
 *
 * @interface
 */
firebaseui.auth.SelectedTenantInfo = function() {};


/**
 * The email being used to select the tenant.
 *
 * @type {string|undefined}
 */
firebaseui.auth.SelectedTenantInfo.prototype.email;


/**
 * The ID of the selected tenant. Null for top-level project.
 *
 * @type {?string}
 */
firebaseui.auth.SelectedTenantInfo.prototype.tenantId;


/**
 * The matching providers for the selected tenant.
 *
 * @type {!Array<string>}
 */
firebaseui.auth.SelectedTenantInfo.prototype.providerIds;


/**
 * Defines all the CIAP callbacks that can be passed to a
 * `firebaseui.auth.CIAPHandlerConfig` object.
 *
 * @interface
 */
firebaseui.auth.CIAPCallbacks = function() {};


/**
 * Defines the callback which will get triggered when the sign-in UI is shown.
 * The tenant ID is passed to the callback.
 * @param {?string} tenantId The tenant ID. Null for top-level project.
 */
firebaseui.auth.CIAPCallbacks.prototype.signInUiShown = function(tenantId) {};


/**
 * Defines the callback which will get triggered when the tenant selection UI
 * is shown.
 */
firebaseui.auth.CIAPCallbacks.prototype.selectTenantUiShown = function() {};


/**
 * Defines the callback which will get triggered when the tenant selection UI
 * is hidden.
 */
firebaseui.auth.CIAPCallbacks.prototype.selectTenantUiHidden = function() {};


/**
 * The `beforeSignInSuccess` callback is provided to handle additional
 * processing on the user before finishing sign-in.
 * @param {!firebase.User} currentUser The current user to be processed before
 *     finishing sign-in.
 * @return {!Promise<!firebase.User>} A promise that resolves when the
 *     processing is finished.
 */
firebaseui.auth.CIAPCallbacks.prototype.beforeSignInSuccess =
    function(currentUser) {};


/**
 * CIAP authentication handler related configuration settings.
 *
 * @interface
 */
firebaseui.auth.CIAPHandlerConfig = function() {};


/**
 * The Auth domain of the project.
 *
 * @type {string}
 */
firebaseui.auth.CIAPHandlerConfig.prototype.authDomain;


/**
 * The display mode for tenant selection flow. This could be 'optionFirst' or
 * 'identifierFirst', defaults to 'optionFirst'.
 *
 * @type {string|undefined}
 */
firebaseui.auth.CIAPHandlerConfig.prototype.displayMode;


/**
 * The terms of service URL/callback for tenant selection UI.
 *
 * @type {string|!function()|undefined}
 */
firebaseui.auth.CIAPHandlerConfig.prototype.tosUrl;


/**
 * The privacy policy URL/callback for tenant selection UI.
 *
 * @type {string|!function()|undefined}
 */
firebaseui.auth.CIAPHandlerConfig.prototype.privacyPolicyUrl;


/**
 * The CIAP flow related callbacks.
 *
 * @type {!firebaseui.auth.CIAPCallbacks|undefined}
 */
firebaseui.auth.CIAPHandlerConfig.prototype.callbacks;


/**
 * The tenant level configurations keyed by tenant ID or '_' for top-level
 * project.
 *
 * @type {!Object<string, !firebaseui.auth.TenantConfig>}
 */
firebaseui.auth.CIAPHandlerConfig.prototype.tenants;


/**
 * Initializes a CIAP AuthenticationHandler with the configuration provided.
 *
 * @param {string|!Element} element The container element or the query selector.
 * @param {!Object<string, !firebaseui.auth.CIAPHandlerConfig>} configs
 *     The configuration of the handler keyed by API key.
 * @constructor
 */
firebaseui.auth.FirebaseUiHandler = function(element, configs) {};


/**
 * Selects a tenant from the given tenant IDs. Returns the tenant ID of the
 * selected tenant and the underlying matching providers.
 * @param {!firebaseui.auth.ProjectConfig} projectConfig The configuration
 *     object used to identify the project.
 * @param {!Array<string>} tenantIds The IDs of the tenants to select from.
 * @return {!Promise<!firebaseui.auth.SelectedTenantInfo>} The matching tenant
 *     and providers enabled for the tenant.
 */
firebaseui.auth.FirebaseUiHandler.prototype.selectTenant =
    function(projectConfig, tenantIds) {};


/**
 * Returns the Auth instance for the corresponding project/tenant pair.
 *
 * @param {string} apiKey The API key.
 * @param {?string} tenantId The tenant ID, null for agent flow.
 * @return {!firebase.auth.Auth} The Auth instance for the given API key and
 *     tenant ID.
 */
firebaseui.auth.FirebaseUiHandler.prototype.getAuth =
    function(apiKey, tenantId) {};


/**
 * Starts sign in with the corresponding Auth instance. The sign in options
 * used are based on auth.tenantId.
 *
 * @param {!firebase.auth.Auth} auth The Auth instance.
 * @param {!firebaseui.auth.SelectedTenantInfo=} tenantInfo The optional
 *     selected tenant and the matching providers.
 * @return {!Promise<!firebase.auth.UserCredential>}
 */
firebaseui.auth.FirebaseUiHandler.prototype.startSignIn =
    function(auth, tenantInfo) {};


/**
 * Resets the FirebaseUI handler and deletes the underlying FirebaseUI instance.
 * Calling startSignIn after reset should rerender the UI successfully.
 *
 * @return {!Promise<void>} The promise that resolves when the instance
 *     is successfully deleted.
 */
firebaseui.auth.FirebaseUiHandler.prototype.reset = function() {};


/**
 * Renders progress bar in the container if hidden.
 */
firebaseui.auth.FirebaseUiHandler.prototype.showProgressBar = function() {};


/**
 * Hides progress bar if visible.
 */
firebaseui.auth.FirebaseUiHandler.prototype.hideProgressBar = function() {};


/**
 * Renders the UI after user is signed out.
 * @return {!Promise<void>}
 */
firebaseui.auth.FirebaseUiHandler.prototype.completeSignOut = function() {};


/**
 * Displays the error message to the end users and provides the ability to retry
 * for recoverable error.
 * @param {!Error|!firebaseui.auth.CIAPError|!firebaseui.auth.CIAPRetryError}
 *     error The error from CIAP.
 */
firebaseui.auth.FirebaseUiHandler.prototype.handleError =
    function(error) {};


/**
 * Handles additional processing on the user if callback is provided by the
 * developer.
 * @param {!firebase.User} user The signed in user to be processed.
 * @return {!Promise<!firebase.User>} A promise that resolves when the
 *     processing is finished.
 */
firebaseui.auth.FirebaseUiHandler.prototype.processUser = function(user) {};


/**
 * The language code of the handler.
 * @type {?string}
 */
firebaseui.auth.FirebaseUiHandler.prototype.languageCode;


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
 * The FirebaseUI credential helpers available. `ACCOUNT_CHOOSER_COM` is
 * deprecated and will be removed by Jan 31st, 2021.
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
 * helper. This is now a no-op and is deprecated and will be removed by
 * Jan 31st, 2021.
 *
 * @deprecated
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
 * Determines which credential helper to use. By default, no credential helper
 * is selected.
 *
 * @type {!firebaseui.auth.CredentialHelper|undefined}
 */
firebaseui.auth.Config.prototype.credentialHelper;

/**
 * Whether to immediately redirect to the provider's site or instead show the
 * default 'Sign in with Provider' button when there is only a single federated
 * provider in signInOptions. In order for this option to take effect, the
 * signInOptions must only hold a single federated provider (like 'google.com')
 * and signInFlow must be set to 'redirect'. The default is false.
 *
 * @type {boolean|undefined}
 */
firebaseui.auth.Config.prototype.immediateFederatedRedirect;

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
 * @type {!Array<!firebaseui.auth.SignInOption|string>|undefined}
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
 * The terms of service URL/callback.
 *
 * @type {string|function()|undefined}
 */
firebaseui.auth.Config.prototype.tosUrl;

/**
 * The privacy policy URL/callback.
 *
 * @type {string|function()|undefined}
 */
firebaseui.auth.Config.prototype.privacyPolicyUrl;

/**
 * The sign-in widget URL. If not provided, this is the current URL.
 *
 * @type {string|undefined}
 */
firebaseui.auth.Config.prototype.widgetUrl;

/**
 * The configuration mirroring the project user actions ("Enable create")
 * settings.  When sign-up is disabled in the project settings, this
 * configuration should be provided with the status field set to `true`. This
 * does not enforce the policy but is rather useful for providing additional
 * instructions to the end user when a user tries to create a new user account
 * and the Auth server blocks the operation.
 *
 * @type {firebaseui.auth.DisableSignUpConfig|undefined}
 */
firebaseui.auth.Config.prototype.adminRestrictedOperation;


/**
 * The tenant level CIAP configuration settings.
 *
 * @interface
 * @extends {firebaseui.auth.Config}
 */
firebaseui.auth.TenantConfig = function() {};

/**
 * The tenant full label of the tenant selection button for the option first
 * flow.
 *
 * @type {string|undefined}
 */
firebaseui.auth.TenantConfig.prototype.fullLabel;

/**
 * The tenant display name of the tenant selection button for the option first
 * flow.
 *
 * @type {string|undefined}
 */
firebaseui.auth.TenantConfig.prototype.displayName;


/**
 * The color of the tenant selection button for the option first flow.
 *
 * @type {string|undefined}
 */
firebaseui.auth.TenantConfig.prototype.buttonColor;


/**
 * The URL of the icon in tenant selection button for the option first flow.
 *
 * @type {string|undefined}
 */
firebaseui.auth.TenantConfig.prototype.iconUrl;


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
 * @return {!Promise<void>|void} Either void or a promise that resolves when the
 *     merge conflict is completed.
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
 * The provider name displayed to end users
 * (sign-in button label/linking prompt).
 * Default: provider ID
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.providerName;

/**
 * The full label of the button, instead of "Sign in with $providerName".
 * Default: "Sign in with $providerName".
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.fullLabel;

/**
 * The color of the sign-in button.
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.buttonColor;

/**
 * The URL of the Identity Provider's icon. This will be displayed on the
 * provider's sign-in button, etc.
 *
 * @type {string|undefined}
 */
firebaseui.auth.SignInOption.prototype.iconUrl;

/**
 * The provider ID for the provided sign in option,
 * eg: `firebase.auth.GoogleAuthProvider.PROVIDER_ID`.
 *
 * @type {string}
 */
firebaseui.auth.SignInOption.prototype.provider;


/**
 * The hosted domain used to match the user’s email domain with the tenant
 * providers for the identifier first flow.
 *
 * @type {string|!RegExp|undefined}
 */
firebaseui.auth.SignInOption.prototype.hd;


/**
 * Defines the sign-in option needed to configure the FirebaseUI federated
 * sign-in widget.
 *
 * @interface
 * @extends {firebaseui.auth.SignInOption}
 */
firebaseui.auth.FederatedSignInOption = function() {};

/**
 * The Auth method (typically the authorization endpoint) needed for one-tap
 * sign-up, eg: 'https://accounts.google.com'.
 *
 * @deprecated
 * @type {string|undefined}
 */
firebaseui.auth.FederatedSignInOption.prototype.authMethod;

/**
 * The OAuth client ID needed for one-tap sign-up credential helper.
 *
 * @type {string|undefined}
 */
firebaseui.auth.FederatedSignInOption.prototype.clientId;

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
firebaseui.auth.FederatedSignInOption.prototype.scopes;

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
firebaseui.auth.FederatedSignInOption.prototype.customParameters;


/**
 * Defines the sign-in option needed to configure the FirebaseUI SAML
 * sign-in widget.
 *
 * @interface
 * @extends {firebaseui.auth.SignInOption}
 */
firebaseui.auth.SamlSignInOption = function() {};

/**
 * The provider name displayed to end users
 * (sign-in button label/linking prompt).
 * Default: provider ID
 *
 * @type {string|undefined}
 */
firebaseui.auth.SamlSignInOption.prototype.providerName;

/**
 * The color of the sign-in button.
 *
 * @type {string}
 */
firebaseui.auth.SamlSignInOption.prototype.buttonColor;

/**
 * The URL of the Identity Provider's icon. This will be displayed on the
 * provider's sign-in button, etc.
 *
 * @type {string}
 */
firebaseui.auth.SamlSignInOption.prototype.iconUrl;


/**
 * Defines the sign-in option needed to configure the FirebaseUI generic OAuth
 * sign-in widget.
 *
 * @interface
 * @extends {firebaseui.auth.SignInOption}
 */
firebaseui.auth.OAuthSignInOption = function() {};

/**
 * The provider name displayed to end users
 * (sign-in button label/linking prompt),
 * eg. "Microsoft". Default: provider ID, eg. "microsoft.com"
 *
 * @type {string|undefined}
 */
firebaseui.auth.OAuthSignInOption.prototype.providerName;

/**
 * The color of the sign-in button.
 *
 * @type {string}
 */
firebaseui.auth.OAuthSignInOption.prototype.buttonColor;

/**
 * The URL of the Identity Provider's icon. This will be displayed on the
 * provider's sign-in button, etc.
 *
 * @type {string}
 */
firebaseui.auth.OAuthSignInOption.prototype.iconUrl;

/**
 * The list of additional OAuth 2.0 scopes beyond basic profile that you want
 * to request from the authentication provider.
 *
 * @type {!Array<string>|undefined}
 */
firebaseui.auth.OAuthSignInOption.prototype.scopes;

/**
 * The custom OAuth parameters for the selected OAuth provider.
 *
 * @type {!Object|undefined}
 */
firebaseui.auth.OAuthSignInOption.prototype.customParameters;

/**
 * The key of the custom parameter, with which the login hint can be passed to
 * the provider. This is useful in case a user previously signs up with an IdP
 * like Microsoft and then tries to sign in with email using the same Microsoft
 * email. FirebaseUI can then ask the user to sign in with that email to the
 * already registered account with Microsoft. For Microsoft and Yahoo, this
 * field is `login_hint`.
 *
 * @type {string|undefined}
 */
firebaseui.auth.OAuthSignInOption.prototype.loginHintKey;


/**
 * Defines the sign-in option needed to configure the FirebaseUI OIDC
 * sign-in widget.
 *
 * @interface
 * @extends {firebaseui.auth.SignInOption}
 */
firebaseui.auth.OidcSignInOption = function() {};

/**
 * The provider name displayed to end users
 * (sign-in button label/linking prompt).
 * Default: provider ID
 *
 * @type {string|undefined}
 */
firebaseui.auth.OidcSignInOption.prototype.providerName;

/**
 * The color of the sign-in button.
 *
 * @type {string}
 */
firebaseui.auth.OidcSignInOption.prototype.buttonColor;

/**
 * The URL of the Identity Provider's icon. This will be displayed on the
 * provider's sign-in button, etc.
 *
 * @type {string}
 */
firebaseui.auth.OidcSignInOption.prototype.iconUrl;

/**
 * The list of additional custom parameters that the OIDC provider supports.
 *
 * @type {!Object|undefined}
 */
firebaseui.auth.OidcSignInOption.prototype.customParameters;


/**
 * Defines the configuration for how to handle errors associated with disabling
 * users from signing up using FirebaseUI.
 *
 * @interface
 */
firebaseui.auth.DisableSignUpConfig = function() {};

/**
 * Whether a new user is unable to sign up in FirebaseUI. This is true when a
 * new user cannot sign up, false otherwise.
 *
 * @type {boolean}
 */
firebaseui.auth.DisableSignUp.prototype.status;

/**
 * The optional site administrator email to contact for access when sign up is
 * disabled.
 *
 * @type {string|undefined}
 */
firebaseui.auth.DisableSignUp.prototype.adminEmail;

/**
 * The optional help link to provide information on how to get access to the
 * site when sign up is disabled.
 *
 * @type {string|undefined}
 */
firebaseui.auth.DisableSignUp.prototype.helpLink;


/**
 * Defines the sign-in option needed to configure the FirebaseUI email sign-in
 * widget.
 *
 * @interface
 * @extends {firebaseui.auth.SignInOption}
 */
firebaseui.auth.EmailSignInOption = function() {};

/**
 * Whether to require the display name to be provided for email/password user
 * creation flow.
 *
 * @type {boolean|undefined}
 */
firebaseui.auth.EmailSignInOption.prototype.requireDisplayName;

/**
 * The sign-in method to support for email sign-in. This can be either
 * 'password' or 'emailLink'. The default is 'password'.
 *
 * @type {string|undefined}
 */
firebaseui.auth.EmailSignInOption.prototype.signInMethod;

/**
 * Whether to force same device flow. If false, opening the link on a different
 * device will display an error message. This should be true when
 * used with anonymous user upgrade flows. The default is false.
 *
 * @type {boolean|undefined}
 */
firebaseui.auth.EmailSignInOption.prototype.forceSameDevice;

/**
 * The object for configuring disableSignUp options.
 * @type {firebaseui.auth.DisableSignUpConfig|undefined}
 */
firebaseui.auth.EmailSignInOption.prototype.disableSignUp;

/**
 * Defines the optional callback function to return
 * `firebase.auth.ActionCodeSettings` configuration to use when sending the
 * link. This provides the ability to specify how the link can be handled,
 * custom dynamic link, additional state in the deep link, etc.
 * When not provided, the current URL is used and a web only flow is triggered.
 *
 * @type {(function():!firebase.auth.ActionCodeSettings)|undefined}
 */
firebaseui.auth.EmailSignInOption.prototype.emailLinkSignIn;

/**
 * Defines the sign-in option needed to configure the FirebaseUI phone sign-in
 * widget.
 *
 * @interface
 * @extends {firebaseui.auth.SignInOption}
 */
firebaseui.auth.PhoneSignInOption = function() {};

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
firebaseui.auth.PhoneSignInOption.prototype.recaptchaParameters;

/**
 * Sets the default country, eg. (GB) for the United Kingdom.
 *
 * @type {string|undefined}
 */
firebaseui.auth.PhoneSignInOption.prototype.defaultCountry;

/**
 * The default national number which will be prefilled when the phone sign-in
 * screen is rendered, eg: '1234567890'
 * This will only be observed if only phone Auth provider is used since
 * for multiple providers, the NASCAR screen will always render first
 * with a 'sign in with phone number' button.
 *
 * @type {string|undefined}
 */
firebaseui.auth.PhoneSignInOption.prototype.defaultNationalNumber;

/**
 * The full phone number string instead of the 'defaultCountry' and
 * 'defaultNationalNumber'. The 'defaultCountry' and 'defaultNationaNumber'
 * will always have higher priority than 'loginHint' which will be ignored in
 * their favor.
 * Example: '+11234567890'
 *
 * @type {string|undefined}
 */
firebaseui.auth.PhoneSignInOption.prototype.loginHint;

/**
 * Sets the whitelisted countries. Accept either ISO (alpha-2) or E164 formatted
 * country codes. Invalid country code will be ignored. If `defaultCountry` is
 * provided, it must be whitelisted. `whitelistedCountries` and
 * `blacklistedCountries` cannot be specified at the same time.
 * Example: ['US', '+44']
 *
 * @type {!Array<string>|undefined}
 */
firebaseui.auth.PhoneSignInOption.prototype.whitelistedCountries;

/**
 * Sets the blacklisted countries. Accept either ISO (alpha-2) or E164 formatted
 * country codes. Invalid country code will be ignored. If `defaultCountry` is
 * provided, it must not be blacklisted. `whitelistedCountries` and
 * `blacklistedCountries` cannot be specified at the same time.
 * Example: ['US', '+44']
 *
 * @type {!Array<string>|undefined}
 */
firebaseui.auth.PhoneSignInOption.prototype.blacklistedCountries;
