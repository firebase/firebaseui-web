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
 * @fileoverview Define suppported IdPs.
 */

goog.provide('firebaseui.auth.idp');


/**
 * @param {string} providerId The provider ID of the provider in question.
 * @return {boolean} Whether the provider is supported.
 */
firebaseui.auth.idp.isSupportedProvider = function(providerId) {
  return !!firebaseui.auth.idp.AuthProviders[providerId];
};


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
 * @param {string} providerId
 * @return {firebase.auth.AuthProvider} The IdP.
 */
firebaseui.auth.idp.getAuthProvider = function(providerId) {
  if (firebaseui.auth.idp.AuthProviders[providerId] &&
      firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]]) {
    return new firebase.auth[firebaseui.auth.idp.AuthProviders[providerId]]();
  }
  return null;
};


/**
 * @param {?Object} credentialObject The credential object.
 * @return {?firebase.auth.AuthCredential} The corresponding auth credential.
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
