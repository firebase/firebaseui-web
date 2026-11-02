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

import { type Translations } from "../types";

export const bnBD = {
  errors: {
    userNotFound: "এই ইমেল ঠিকানা দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি",
    wrongPassword: "ভুল পাসওয়ার্ড",
    invalidEmail: "অনুগ্রহ করে একটি বৈধ ইমেল ঠিকানা লিখুন",
    userDisabled: "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে",
    networkRequestFailed: "সার্ভারের সাথে সংযোগ করা যায়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন",
    tooManyRequests: "অনেকবার ব্যর্থ চেষ্টা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন",
    missingVerificationCode: "অনুগ্রহ করে যাচাইকরণ কোডটি লিখুন",
    emailAlreadyInUse: "এই ইমেল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে",
    invalidCredential: "প্রদত্ত তথ্য বৈধ নয়।",
    weakPassword: "পাসওয়ার্ড কমপক্ষে ৬টি অক্ষরের হতে হবে",
    unverifiedEmail: "চালিয়ে যেতে অনুগ্রহ করে আপনার ইমেল ঠিকানা যাচাই করুন।",
    operationNotAllowed: "এই কাজটি অনুমোদিত নয়। অনুগ্রহ করে সহায়তার সাথে যোগাযোগ করুন।",
    invalidPhoneNumber: "ফোন নম্বরটি বৈধ নয়",
    missingPhoneNumber: "অনুগ্রহ করে একটি ফোন নম্বর দিন",
    quotaExceeded: "SMS সীমা অতিক্রম করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন",
    codeExpired: "যাচাইকরণ কোডের মেয়াদ শেষ হয়েছে",
    captchaCheckFailed: "reCAPTCHA যাচাইকরণ ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    missingVerificationId: "অনুগ্রহ করে প্রথমে reCAPTCHA যাচাইকরণ সম্পন্ন করুন।",
    missingEmail: "অনুগ্রহ করে একটি ইমেল ঠিকানা দিন",
    invalidActionCode: "পাসওয়ার্ড রিসেট লিংকটি বৈধ নয় বা এর মেয়াদ শেষ হয়ে গেছে",
    credentialAlreadyInUse:
      "এই ইমেল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে সেই অ্যাকাউন্ট দিয়ে সাইন ইন করুন।",
    requiresRecentLogin: "এই কাজের জন্য সাম্প্রতিক লগইন প্রয়োজন। অনুগ্রহ করে আবার সাইন ইন করুন।",
    providerAlreadyLinked: "এই ফোন নম্বরটি ইতিমধ্যে অন্য একটি অ্যাকাউন্টের সাথে যুক্ত",
    invalidVerificationCode: "যাচাইকরণ কোডটি বৈধ নয়। অনুগ্রহ করে আবার চেষ্টা করুন",
    unknownError: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে",
    popupClosed: "সাইন-ইন পপআপটি বন্ধ হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    accountExistsWithDifferentCredential:
      "এই ইমেল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে মূল প্রদানকারীর মাধ্যমে সাইন ইন করুন।",
    displayNameRequired: "অনুগ্রহ করে একটি প্রদর্শন নাম দিন",
    secondFactorAlreadyInUse: "এই ফোন নম্বরটি ইতিমধ্যে এই অ্যাকাউন্টে নিবন্ধিত রয়েছে।",
  },
  messages: {
    passwordResetEmailSent: "পাসওয়ার্ড রিসেট ইমেল সফলভাবে পাঠানো হয়েছে",
    signInLinkSent: "সাইন-ইন লিংক সফলভাবে পাঠানো হয়েছে",
    verificationCodeFirst: "অনুগ্রহ করে প্রথমে একটি যাচাইকরণ কোডের অনুরোধ করুন",
    checkEmailForReset: "পাসওয়ার্ড রিসেটের নির্দেশাবলীর জন্য আপনার ইমেল দেখুন",
    dividerOr: "অথবা",
    termsAndPrivacy: "চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের {tos} ও {privacy} মেনে নিচ্ছেন।",
    mfaSmsAssertionPrompt: "প্রমাণীকরণ প্রক্রিয়া সম্পন্ন করতে {phoneNumber} নম্বরে একটি যাচাইকরণ কোড পাঠানো হবে।",
  },
  labels: {
    emailAddress: "ইমেল ঠিকানা",
    password: "পাসওয়ার্ড",
    displayName: "প্রদর্শন নাম",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    signUp: "সাইন আপ",
    signIn: "সাইন ইন",
    resetPassword: "পাসওয়ার্ড রিসেট",
    createAccount: "অ্যাকাউন্ট তৈরি করুন",
    backToSignIn: "সাইন ইনে ফিরে যান",
    signInWithPhone: "ফোন দিয়ে সাইন ইন",
    phoneNumber: "ফোন নম্বর",
    verificationCode: "যাচাইকরণ কোড",
    sendCode: "কোড পাঠান",
    verifyCode: "কোড যাচাই করুন",
    signInWithGoogle: "Google দিয়ে সাইন ইন",
    signInWithFacebook: "Facebook দিয়ে সাইন ইন",
    signInWithApple: "Apple দিয়ে সাইন ইন",
    signInWithMicrosoft: "Microsoft দিয়ে সাইন ইন",
    signInWithGitHub: "GitHub দিয়ে সাইন ইন",
    signInWithYahoo: "Yahoo দিয়ে সাইন ইন",
    signInWithTwitter: "X দিয়ে সাইন ইন",
    signInWithEmailLink: "ইমেল লিংক দিয়ে সাইন ইন",
    sendSignInLink: "সাইন-ইন লিংক পাঠান",
    termsOfService: "পরিষেবার শর্তাবলী",
    privacyPolicy: "গোপনীয়তা নীতি",
    resendCode: "কোড আবার পাঠান",
    sending: "পাঠানো হচ্ছে...",
    multiFactorEnrollment: "মাল্টি-ফ্যাক্টর নিবন্ধন",
    multiFactorAssertion: "মাল্টি-ফ্যাক্টর প্রমাণীকরণ",
    mfaTotpVerification: "TOTP যাচাইকরণ",
    mfaSmsVerification: "SMS যাচাইকরণ",
    generateQrCode: "QR কোড তৈরি করুন",
  },
  prompts: {
    noAccount: "অ্যাকাউন্ট নেই?",
    haveAccount: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
    enterEmailToReset: "পাসওয়ার্ড রিসেট করতে আপনার ইমেল ঠিকানা লিখুন",
    signInToAccount: "আপনার অ্যাকাউন্টে সাইন ইন করুন",
    smsVerificationPrompt: "আপনার ফোন নম্বরে পাঠানো যাচাইকরণ কোডটি লিখুন",
    enterDetailsToCreate: "নতুন অ্যাকাউন্ট তৈরি করতে আপনার তথ্য লিখুন",
    enterPhoneNumber: "আপনার ফোন নম্বর লিখুন",
    enterVerificationCode: "যাচাইকরণ কোডটি লিখুন",
    enterEmailForLink: "সাইন-ইন লিংক পেতে আপনার ইমেল লিখুন",
    mfaEnrollmentPrompt: "একটি নতুন মাল্টি-ফ্যাক্টর নিবন্ধন পদ্ধতি নির্বাচন করুন",
    mfaAssertionPrompt: "অনুগ্রহ করে মাল্টি-ফ্যাক্টর প্রমাণীকরণ প্রক্রিয়াটি সম্পন্ন করুন",
    mfaAssertionFactorPrompt: "অনুগ্রহ করে একটি মাল্টি-ফ্যাক্টর প্রমাণীকরণ পদ্ধতি নির্বাচন করুন",
    mfaTotpQrCodePrompt: "আপনার অথেনটিকেটর অ্যাপ দিয়ে এই QR কোডটি স্ক্যান করুন",
    mfaTotpEnrollmentVerificationPrompt: "আপনার অথেনটিকেটর অ্যাপে তৈরি হওয়া কোডটি যোগ করুন",
  },
} satisfies Translations;
