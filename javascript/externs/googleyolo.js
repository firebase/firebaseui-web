/**
 * Smart Lock API externs.
 * Note that this SDK is not dedicated to One-tap API. It seems to cover other
 * Google sign-in related functionality. We may want to consider renaming
 * these APIs to not be One-tap specific.
 * https://developers.google.com/identity/one-tap/web/reference/js-reference
 *
 * @externs
 */

/**
 * @record
 * @struct
 */
function SmartLockOptions() {}

/** @type {string} */
SmartLockOptions.prototype.client_id;

/** @type {?boolean|undefined} */
SmartLockOptions.prototype.auto_select;

/** @type {function(SmartLockCredential)} */
SmartLockOptions.prototype.callback;


/**
 * @record
 * @struct
 */
function SmartLockCredential() {}

/** @type {string|undefined} */
SmartLockCredential.prototype.credential;

/** @type {string|undefined} */
SmartLockCredential.prototype.clientId;

/** @type {string|undefined} */
SmartLockCredential.prototype.select_by;

/**
 * @record
 * @struct
 */
function SmartLockApi() {}

/**
 * Initializes GSI sign in process.
 *
 * @param {!SmartLockOptions} options
 *     Describes the types of credentials that are supported by the origin,
 *     and customization properties for the display of any UI pertaining to
 *     releasing this credential.
 */
SmartLockApi.prototype.initialize = function(options) {};

/**
 * Triggers the prompt to display.
 */
SmartLockApi.prototype.prompt = function() {};

/**
 * Cancels the last operation triggered.
 */
SmartLockApi.prototype.cancel = function() {};
