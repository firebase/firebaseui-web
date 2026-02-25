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

/** Category keys for translation sets (e.g., "errors", "messages", "labels", "prompts"). */
export type TranslationCategory = keyof Required<Translations>;

/** Generic type for translation keys within a specific category. */
export type TranslationKey<T extends TranslationCategory> = keyof Required<Translations>[T];

/** Record type representing a complete set of translations for a specific category. */
export type TranslationSet<T extends TranslationCategory> = Record<TranslationKey<T>, string>;

/** Keys for error translation messages. */
export type ErrorKey = keyof Required<Translations>["errors"];

/** Keys for informational message translations. */
export type MessageKey = keyof Required<Translations>["messages"];

/** Keys for UI label translations. */
export type LabelKey = keyof Required<Translations>["labels"];

/** Keys for prompt/instruction translations. */
export type PromptKey = keyof Required<Translations>["prompts"];

/** Configuration type for translations, mapping locale identifiers to partial translation objects. */
export type TranslationsConfig = Partial<Record<string, Partial<Translations>>>;

/** Complete translations interface containing all translation categories and their keys. */
export type Translations = {
  /** Error message translations. */
  errors?: {
    /** Translation for when a user is not found. */
    userNotFound?: string;
    /** Translation for incorrect password. */
    wrongPassword?: string;
    /** Translation for invalid email address. */
    invalidEmail?: string;
    /** Translation for disabled user account. */
    userDisabled?: string;
    /** Translation for unverified email address. */
    unverifiedEmail?: string;
    /** Translation for network request failure. */
    networkRequestFailed?: string;
    /** Translation for too many requests. */
    tooManyRequests?: string;
    /** Translation for email already in use. */
    emailAlreadyInUse?: string;
    /** Translation for missing verification code. */
    missingVerificationCode?: string;
    /** Translation for invalid credentials. */
    invalidCredential?: string;
    /** Translation for weak password. */
    weakPassword?: string;
    /** Translation for operation not allowed. */
    operationNotAllowed?: string;
    /** Translation for invalid phone number. */
    invalidPhoneNumber?: string;
    /** Translation for missing phone number. */
    missingPhoneNumber?: string;
    /** Translation for SMS quota exceeded. */
    quotaExceeded?: string;
    /** Translation for expired verification code. */
    codeExpired?: string;
    /** Translation for reCAPTCHA check failure. */
    captchaCheckFailed?: string;
    /** Translation for missing verification ID. */
    missingVerificationId?: string;
    /** Translation for missing email address. */
    missingEmail?: string;
    /** Translation for required display name. */
    displayNameRequired?: string;
    /** Translation for invalid action code. */
    invalidActionCode?: string;
    /** Translation for credential already in use. */
    credentialAlreadyInUse?: string;
    /** Translation for operation requiring recent login. */
    requiresRecentLogin?: string;
    /** Translation for provider already linked. */
    providerAlreadyLinked?: string;
    /** Translation for invalid verification code. */
    invalidVerificationCode?: string;
    /** Translation for unknown error. */
    unknownError?: string;
    /** Translation for popup closed by user. */
    popupClosed?: string;
    /** Translation for account existing with different credential. */
    accountExistsWithDifferentCredential?: string;
    /** Translation for second factor already in use. */
    secondFactorAlreadyInUse?: string;
  };
  /** Informational message translations. */
  messages?: {
    /** Translation for password reset email sent confirmation. */
    passwordResetEmailSent?: string;
    /** Translation for sign-in link sent confirmation. */
    signInLinkSent?: string;
    /** Translation for verification code required first. */
    verificationCodeFirst?: string;
    /** Translation for checking email for reset instructions. */
    checkEmailForReset?: string;
    /** Translation for "or" divider text. */
    dividerOr?: string;
    /** Translation for terms and privacy policy notice. */
    termsAndPrivacy?: string;
    /** Translation for MFA SMS assertion prompt message. */
    mfaSmsAssertionPrompt?: string;
  };
  /** UI label translations. */
  labels?: {
    /** Translation for email address label. */
    emailAddress?: string;
    /** Translation for password label. */
    password?: string;
    /** Translation for display name label. */
    displayName?: string;
    /** Translation for forgot password link. */
    forgotPassword?: string;
    /** Translation for sign up button/link. */
    signUp?: string;
    /** Translation for sign in button/link. */
    signIn?: string;
    /** Translation for reset password button. */
    resetPassword?: string;
    /** Translation for create account button. */
    createAccount?: string;
    /** Translation for back to sign in link. */
    backToSignIn?: string;
    /** Translation for sign in with phone button. */
    signInWithPhone?: string;
    /** Translation for phone number label. */
    phoneNumber?: string;
    /** Translation for verification code label. */
    verificationCode?: string;
    /** Translation for send code button. */
    sendCode?: string;
    /** Translation for verify code button. */
    verifyCode?: string;
    /** Translation for sign in with Google button. */
    signInWithGoogle?: string;
    /** Translation for sign in with Facebook button. */
    signInWithFacebook?: string;
    /** Translation for sign in with Apple button. */
    signInWithApple?: string;
    /** Translation for sign in with Twitter/X button. */
    signInWithTwitter?: string;
    /** Translation for sign in with Microsoft button. */
    signInWithMicrosoft?: string;
    /** Translation for sign in with GitHub button. */
    signInWithGitHub?: string;
    /** Translation for sign in with Yahoo button. */
    signInWithYahoo?: string;
    /** Translation for sign in with email link button. */
    signInWithEmailLink?: string;
    /** Translation for send sign-in link button. */
    sendSignInLink?: string;
    /** Translation for terms of service link. */
    termsOfService?: string;
    /** Translation for privacy policy link. */
    privacyPolicy?: string;
    /** Translation for resend code button. */
    resendCode?: string;
    /** Translation for sending state text. */
    sending?: string;
    /** Translation for multi-factor enrollment label. */
    multiFactorEnrollment?: string;
    /** Translation for multi-factor assertion label. */
    multiFactorAssertion?: string;
    /** Translation for TOTP verification label. */
    mfaTotpVerification?: string;
    /** Translation for SMS verification label. */
    mfaSmsVerification?: string;
    /** Translation for generate QR code button. */
    generateQrCode?: string;
  };
  /** Prompt and instruction translations. */
  prompts?: {
    /** Translation for "don't have an account" prompt. */
    noAccount?: string;
    /** Translation for "already have an account" prompt. */
    haveAccount?: string;
    /** Translation for enter email to reset password prompt. */
    enterEmailToReset?: string;
    /** Translation for sign in to account prompt. */
    signInToAccount?: string;
    /** Translation for enter details to create account prompt. */
    enterDetailsToCreate?: string;
    /** Translation for SMS verification code prompt. */
    smsVerificationPrompt?: string;
    /** Translation for enter phone number prompt. */
    enterPhoneNumber?: string;
    /** Translation for enter verification code prompt. */
    enterVerificationCode?: string;
    /** Translation for enter email for link prompt. */
    enterEmailForLink?: string;
    /** Translation for MFA enrollment prompt. */
    mfaEnrollmentPrompt?: string;
    /** Translation for MFA assertion prompt. */
    mfaAssertionPrompt?: string;
    /** Translation for MFA assertion factor selection prompt. */
    mfaAssertionFactorPrompt?: string;
    /** Translation for TOTP QR code prompt. */
    mfaTotpQrCodePrompt?: string;
    /** Translation for TOTP enrollment verification prompt. */
    mfaTotpEnrollmentVerificationPrompt?: string;
  };
};
