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

goog.provide('firebaseui.auth.exports');
goog.require('firebaseui.auth.AuthUI');
goog.require('firebaseui.auth.AuthUIError');
goog.require('firebaseui.auth.CredentialHelper');

goog.exportSymbol('firebaseui.auth.AuthUI', firebaseui.auth.AuthUI);
goog.exportSymbol(
    'firebaseui.auth.AuthUI.getInstance',
    firebaseui.auth.AuthUI.getInstance);
goog.exportSymbol(
    'firebaseui.auth.AuthUI.prototype.disableAutoSignIn',
    firebaseui.auth.AuthUI.prototype.disableAutoSignIn);
goog.exportSymbol(
    'firebaseui.auth.AuthUI.prototype.start',
    firebaseui.auth.AuthUI.prototype.start);
goog.exportSymbol(
    'firebaseui.auth.AuthUI.prototype.setConfig',
    firebaseui.auth.AuthUI.prototype.setConfig);
goog.exportSymbol(
    'firebaseui.auth.AuthUI.prototype.signIn',
    firebaseui.auth.AuthUI.prototype.signIn);
goog.exportSymbol(
    'firebaseui.auth.AuthUI.prototype.reset',
    firebaseui.auth.AuthUI.prototype.reset);
goog.exportSymbol(
    'firebaseui.auth.AuthUI.prototype.delete',
    firebaseui.auth.AuthUI.prototype.delete);
goog.exportSymbol(
    'firebaseui.auth.AuthUI.prototype.isPendingRedirect',
    firebaseui.auth.AuthUI.prototype.isPendingRedirect);
goog.exportSymbol('firebaseui.auth.AuthUIError', firebaseui.auth.AuthUIError);
goog.exportSymbol(
    'firebaseui.auth.AuthUIError.prototype.toJSON',
    firebaseui.auth.AuthUIError.prototype.toJSON);
goog.exportSymbol(
    'firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM',
    firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM);
goog.exportSymbol(
    'firebaseui.auth.CredentialHelper.GOOGLE_YOLO',
    firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
goog.exportSymbol(
    'firebaseui.auth.CredentialHelper.NONE',
    firebaseui.auth.CredentialHelper.NONE);
