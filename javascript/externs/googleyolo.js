/**
 * Smart Lock API externs.
 *
 * @externs
 */

/**
 * @record
 * @struct
 */
function SmartLockHintOptions() {}

/** @type {!Array<string>} */
SmartLockHintOptions.prototype.supportedAuthMethods;

/** @type {!Array<!Object<string,string>>} */
SmartLockHintOptions.prototype.supportedIdTokenProviders;

/** @type {?string|undefined} */
SmartLockHintOptions.prototype.context;

/**
 * @record
 * @struct
 */
function SmartLockRequestOptions() {}

/** @type {!Array<string>} */
SmartLockRequestOptions.prototype.supportedAuthMethods;

/** @type {!Array<!Object<string,string>>} */
SmartLockRequestOptions.prototype.supportedIdTokenProviders;

/** @type {?string|undefined} */
SmartLockRequestOptions.prototype.context;

/**
 * @record
 * @struct
 */
function SmartLockCredential() {}

/** @type {string} */
SmartLockCredential.prototype.id;

/** @type {string} */
SmartLockCredential.prototype.authMethod;

/** @type {string|undefined} */
SmartLockCredential.prototype.authDomain;

/** @type {string|undefined} */
SmartLockCredential.prototype.displayName;

/** @type {string|undefined} */
SmartLockCredential.prototype.profilePicture;

/** @type {string|undefined} */
SmartLockCredential.prototype.idToken;

/**
 * @record
 * @struct
 */
function SmartLockApi() {}

/**
 * Requests the credential provider whether hints are available or not for
 * the current user.
 *
 * @param {!SmartLockHintOptions} options
 *     Describes the types of credentials that are supported by the origin.
 * @return {!Promise<boolean>}
 *     A promise that resolves with true if at least one hint is available,
 *     and resolves with false if none are available. The promise will not
 *     reject: if an error happen, it should resolve with false.
 */
SmartLockApi.prototype.hintsAvailable = function(options) {};

/**
 * Attempts to retrieve a sign-up hint that can be used to create a new
 * user account.
 *
 * @param {!SmartLockHintOptions} options
 *     Describes the types of credentials that are supported by the origin,
 *     and customization properties for the display of any UI pertaining to
 *     releasing this credential.
 * @return {!Promise<!SmartLockCredential>}
 *     A promise for a credential hint. The promise will be rejected if the
 *     user cancels the hint selection process, if there are no hints available,
 *     or if an error happens.
 */
SmartLockApi.prototype.hint = function(options) {};

/**
 * Attempts to retrieve a credential for the current origin.
 *
 * @param {!SmartLockRequestOptions} options
 *     Describes the types of credentials that are supported by the origin.
 * @return {!Promise<!SmartLockCredential>}
 *     A promise for the credential, which will be rejected if there are no
 *     credentials available or the user refuses to release the credential.
 *     Otherwise, the promise will resolve with a credential that the app
 *     can use.
 */
SmartLockApi.prototype.retrieve = function(options) {};

/**
 * Prevents the automatic release of a credential from the retrieve operation.
 * This should be invoked when the user signs out, in order to prevent an
 * automatic sign-in loop. This cannot be called while another operation is
 * pending so should be called before retrieve.
 * @return {!Promise<void>}
 *     A promise for the completion of notifying the provider to disable
 *     automatic sign-in.
 */
SmartLockApi.prototype.disableAutoSignIn = function() {};

/**
 * Cancels the last operation triggered.
 * @return {!Promise<void>}
 *     A promise for the completion of the cancellation.
 */
SmartLockApi.prototype.cancelLastOperation = function() {};

/**
 * Sets a custom timeouts, in milliseconds, after which a request is
 * considered failed.
 * @param {number|null} timeoutMs The timeout in milliseconds.
 */
SmartLockApi.prototype.setTimeouts = function(timeoutMs) {};

/**
 * Sets the render mode of the credentials selector, or null if the default
 * should be used. Available render modes are: 'bottomSheet' and 'navPopout'.
 * @param {string|null} renderMode
 */
SmartLockApi.prototype.setRenderMode = function(renderMode) {};

/** @type {!SmartLockApi} */
var googleyolo;

/** @type {function(!SmartLockApi)|undefined} */
var onGoogleYoloLoad;
