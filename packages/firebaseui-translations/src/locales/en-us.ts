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

import { Translations } from "../types";

// TODO: Should this be required or optional?
export const enUS = {
  errors: {
    userNotFound: "No account found with this email address",
    wrongPassword: "Incorrect password",
    invalidEmail: "Please enter a valid email address",
    userDisabled: "This account has been disabled",
    networkRequestFailed:
      "Unable to connect to the server. Please check your internet connection",
    tooManyRequests: "Too many failed attempts. Please try again later",
    emailAlreadyInUse: "An account already exists with this email",
    weakPassword: "Password should be at least 8 characters",
    operationNotAllowed:
      "Email/password accounts are not enabled. Please contact support.",
    invalidPhoneNumber: "The phone number is invalid",
    missingPhoneNumber: "Please provide a phone number",
    quotaExceeded: "SMS quota exceeded. Please try again later",
    codeExpired: "The verification code has expired",
    captchaCheckFailed: "reCAPTCHA verification failed. Please try again.",
    missingVerificationId: "Please complete the reCAPTCHA verification first.",
    missingEmail: "Please provide an email address",
    invalidActionCode: "The password reset link is invalid or has expired",
    credentialAlreadyInUse:
      "An account already exists with this email. Please sign in with that account.",
    requiresRecentLogin:
      "This operation requires a recent login. Please sign in again.",
    providerAlreadyLinked:
      "This phone number is already linked to another account",
    invalidVerificationCode: "Invalid verification code. Please try again",
    unknownError: "An unexpected error occurred",
    popupClosed: "The sign-in popup was closed. Please try again.",
    accountExistsWithDifferentCredential:
      "An account already exists with this email. Please sign in with the original provider.",
  },
  messages: {
    passwordResetEmailSent: "Password reset email sent successfully",
    signInLinkSent: "Sign-in link sent successfully",
    verificationCodeFirst: "Please request a verification code first",
    checkEmailForReset: "Check your email for password reset instructions",
    dividerOr: "or",
    termsAndPrivacy: "By continuing, you agree to our {tos} and {privacy}.",
  },
  labels: {
    emailAddress: "Email Address",
    password: "Password",
    forgotPassword: "Forgot Password?",
    register: "Register",
    signIn: "Sign In",
    resetPassword: "Reset Password",
    createAccount: "Create Account",
    backToSignIn: "Back to Sign In",
    signInWithPhone: "Sign in with Phone",
    phoneNumber: "Phone Number",
    verificationCode: "Verification Code",
    sendCode: "Send Code",
    verifyCode: "Verify Code",
    signInWithGoogle: "Sign in with Google",
    signInWithEmailLink: "Sign in with Email Link",
    sendSignInLink: "Send Sign-in Link",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    resendCode: "Resend Code",
    sending: "Sending...",
  },
  prompts: {
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    enterEmailToReset: "Enter your email address to reset your password",
    signInToAccount: "Sign in to your account",
    enterDetailsToCreate: "Enter your details to create a new account",
    enterPhoneNumber: "Enter your phone number",
    enterVerificationCode: "Enter the verification code",
    enterEmailForLink: "Enter your email to receive a sign-in link",
  },
} satisfies Translations;
