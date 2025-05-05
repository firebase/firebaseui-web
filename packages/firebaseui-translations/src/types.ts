/**
 * Copyright 2025 Google LLC
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
 */

export type TranslationCategory = keyof Required<Translations>;
export type TranslationKey<T extends TranslationCategory> =
  keyof Required<Translations>[T];
export type TranslationSet<T extends TranslationCategory> = Record<
  TranslationKey<T>,
  string
>;
export type ErrorKey = keyof Required<Translations>["errors"];
export type MessageKey = keyof Required<Translations>["messages"];
export type LabelKey = keyof Required<Translations>["labels"];
export type PromptKey = keyof Required<Translations>["prompts"];
export type TranslationsConfig = Partial<Record<string, Partial<Translations>>>;

export type Translations = {
  errors?: {
    userNotFound?: string;
    wrongPassword?: string;
    invalidEmail?: string;
    userDisabled?: string;
    networkRequestFailed?: string;
    tooManyRequests?: string;
    emailAlreadyInUse?: string;
    weakPassword?: string;
    operationNotAllowed?: string;
    invalidPhoneNumber?: string;
    missingPhoneNumber?: string;
    quotaExceeded?: string;
    codeExpired?: string;
    captchaCheckFailed?: string;
    missingVerificationId?: string;
    missingEmail?: string;
    invalidActionCode?: string;
    credentialAlreadyInUse?: string;
    requiresRecentLogin?: string;
    providerAlreadyLinked?: string;
    invalidVerificationCode?: string;
    unknownError?: string;
    popupClosed?: string;
    accountExistsWithDifferentCredential?: string;
  };
  messages?: {
    passwordResetEmailSent?: string;
    signInLinkSent?: string;
    verificationCodeFirst?: string;
    checkEmailForReset?: string;
    dividerOr?: string;
    termsAndPrivacy?: string;
  };
  labels?: {
    emailAddress?: string;
    password?: string;
    forgotPassword?: string;
    register?: string;
    signIn?: string;
    resetPassword?: string;
    createAccount?: string;
    backToSignIn?: string;
    signInWithPhone?: string;
    phoneNumber?: string;
    verificationCode?: string;
    sendCode?: string;
    verifyCode?: string;
    signInWithGoogle?: string;
    signInWithEmailLink?: string;
    sendSignInLink?: string;
    termsOfService?: string;
    privacyPolicy?: string;
    resendCode?: string;
    sending?: string;
  };
  prompts?: {
    noAccount?: string;
    haveAccount?: string;
    enterEmailToReset?: string;
    signInToAccount?: string;
    enterDetailsToCreate?: string;
    enterPhoneNumber?: string;
    enterVerificationCode?: string;
    enterEmailForLink?: string;
  };
};
