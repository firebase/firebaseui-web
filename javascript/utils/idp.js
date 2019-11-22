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
 * @fileoverview Define supported IdPs.
 */

goog.provide('firebaseui.auth.idp');

goog.require('goog.array');
goog.require('goog.object');


/**
 * @param {string} providerId The provider ID of the provider in question.
 * @return {boolean} Whether the provider is supported.
 */
firebaseui.auth.idp.isSupportedProvider = function(providerId) {
  return !!firebaseui.auth.idp.AuthProviders[providerId];
};


/**
 * @param {!Array<string>} signInMethods List of sign in methods.
 * @param {!Array<string>} enabledProviders List of enabled sign in providers.
 * @return {?string} The first federated sign-in method if available.
 *     Otherwise, returns null.
 */
firebaseui.auth.idp.getFirstFederatedSignInMethod =
    function(signInMethods, enabledProviders) {
  for (var i = 0; i < signInMethods.length; i++) {
    // Exclude non-federated sign in methods.
    if (!goog.array.contains(
            firebaseui.auth.idp.NonFederatedSignInMethods, signInMethods[i]) &&
        // Only include build-in federated providers or enabled generic
        // providers.
        (goog.object.containsKey(
            firebaseui.auth.idp.AuthProviders, signInMethods[i]) ||
         goog.array.contains(enabledProviders, signInMethods[i]))) {
      return signInMethods[i];
    }
  }
  return null;
};


/** @private @const {string} The required SAML provider ID prefix. */
firebaseui.auth.idp.SAML_PREFIX_ = 'saml.';


/**
 * Supported non-federated sign-in methods.
 * @package {!Array<string>}
 */
firebaseui.auth.idp.NonFederatedSignInMethods = [
  'emailLink',
  'password',
  'phone'
];


/**
 * Supported IdP auth provider.
 * @package {Object<string, firebase.auth.AuthProvider>}
 */
firebaseui.auth.idp.AuthProviders = {
  'facebook.com': 'FacebookAuthProvider',
  'github.com': 'GithubAuthProvider',
  'google.com': 'GoogleAuthProvider',
  'password': 'EmailAuthProvider',
  'twitter.com': 'TwitterAuthProvider',
  'phone': 'PhoneAuthProvider'
};


/**
 * Map of provider to sign in methods.
 * @package {Object<string, Object<string, string>>}
 */
firebaseui.auth.idp.SignInMethods = {
  'facebook.com': {'FACEBOOK_SIGN_IN_METHOD': 'facebook.com'},
  'github.com': {'GITHUB_SIGN_IN_METHOD': 'github.com'},
  'google.com': {'GOOGLE_SIGN_IN_METHOD': 'google.com'},
  'password': {
    'EMAIL_PASSWORD_SIGN_IN_METHOD': 'password',
    'EMAIL_LINK_SIGN_IN_METHOD': 'emailLink'
  },
  'twitter.com': {'TWITTER_SIGN_IN_METHOD': 'twitter.com'},
  'phone': {'PHONE_SIGN_IN_METHOD': 'phone'}
};


/**
 * @param {string} providerId
 * @return {boolean} Whether the provider is a SAML provider.
 * @private
 */
firebaseui.auth.idp.isSaml_ = function(providerId) {
  return providerId.indexOf(firebaseui.auth.idp.SAML_PREFIX_) == 0;
};


/**
 * Returns true if the provider is federated, that is either: a built-in OAuth
 * provider like Google, a SAML provider or an ODIC or generic OAuth provider.
 * @param {string} providerId
 * @return {boolean} Whether the provider is non-federated or not.
 */
firebaseui.auth.idp.isFederatedSignInMethod = function(providerId) {
  return !goog.array.contains(
      firebaseui.auth.idp.NonFederatedSignInMethods,
      providerId);
};


/**
 * Returns the provider by provider ID. If the provider ID is neither a built-in
 * provider or SAML provider, it will be considered as a generic OAuth provider.
 * @param {string} providerId
 * @return {!firebase.auth.AuthProvider} The IdP.
 */
firebaseui.auth.idp.getAuthProvider = function(providerId) {
  if (firebaseui.auth.idp.AuthProviders[providerId] &&
      firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]]) {
    return new firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]]();
  } else if (firebaseui.auth.idp.isSaml_(providerId)) {
    return new firebase.auth['SAMLAuthProvider'](providerId);
  } else {
    return new firebase.auth['OAuthProvider'](providerId);
  }
};


/**
 * @param {?Object} credentialObject The credential object.
 * @return {?firebase.auth.AuthCredential} The corresponding auth credential.
 * @deprecated Use mockCredential for tests instead.
 */
firebaseui.auth.idp.getAuthCredential = function(credentialObject) {
  var providerId = credentialObject && credentialObject['providerId'];
  if (firebaseui.auth.idp.AuthProviders[providerId] &&
      firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]]) {
    // Twitter special case.
    if (credentialObject['secret'] && credentialObject['accessToken']) {
      return firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]]
          .credential(credentialObject['accessToken'],
                      credentialObject['secret']);
    } else if (providerId == firebase.auth.GoogleAuthProvider.PROVIDER_ID) {
      return firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]]
          .credential(credentialObject['idToken'],
                      credentialObject['accessToken']);
    } else {
      // GitHub and Facebook.
      return firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]]
          .credential(credentialObject['accessToken']);
    }
  }
  return null;
};
