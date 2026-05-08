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

/** Hindi IN (hi-IN) translation set. */
export const hiIN = {
  errors: {
    userNotFound: "इस ईमेल पते से कोई खाता नहीं मिला",
    wrongPassword: "गलत पासवर्ड",
    invalidEmail: "कृपया एक वैध ईमेल पता दर्ज करें",
    userDisabled: "यह खाता अक्षम कर दिया गया है",
    networkRequestFailed: "सर्वर से कनेक्ट नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें",
    tooManyRequests: "बहुत अधिक विफल प्रयास। कृपया बाद में पुनः प्रयास करें",
    missingVerificationCode: "कृपया सत्यापन कोड दर्ज करें",
    emailAlreadyInUse: "इस ईमेल से पहले से एक खाता मौजूद है",
    invalidCredential: "प्रदान किए गए क्रेडेंशियल अमान्य हैं।",
    weakPassword: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    unverifiedEmail: "जारी रखने के लिए कृपया अपना ईमेल पता सत्यापित करें।",
    operationNotAllowed: "यह ऑपरेशन अनुमत नहीं है। कृपया सहायता से संपर्क करें।",
    invalidPhoneNumber: "फ़ोन नंबर अमान्य है",
    missingPhoneNumber: "कृपया एक फ़ोन नंबर प्रदान करें",
    quotaExceeded: "SMS कोटा समाप्त हो गया। कृपया बाद में पुनः प्रयास करें",
    codeExpired: "सत्यापन कोड की समय-सीमा समाप्त हो गई है",
    captchaCheckFailed: "reCAPTCHA सत्यापन विफल हुआ। कृपया पुनः प्रयास करें।",
    missingVerificationId: "कृपया पहले reCAPTCHA सत्यापन पूरा करें।",
    missingEmail: "कृपया एक ईमेल पता प्रदान करें",
    invalidActionCode: "पासवर्ड रीसेट लिंक अमान्य है या समाप्त हो गया है",
    credentialAlreadyInUse: "इस ईमेल से पहले से एक खाता मौजूद है। कृपया उस खाते से साइन इन करें।",
    requiresRecentLogin: "इस ऑपरेशन के लिए हाल ही में लॉगिन आवश्यक है। कृपया फिर से साइन इन करें।",
    providerAlreadyLinked: "यह फ़ोन नंबर पहले से किसी अन्य खाते से जुड़ा हुआ है",
    invalidVerificationCode: "अमान्य सत्यापन कोड। कृपया पुनः प्रयास करें",
    unknownError: "एक अप्रत्याशित त्रुटि हुई",
    popupClosed: "साइन-इन पॉपअप बंद हो गया। कृपया पुनः प्रयास करें।",
    accountExistsWithDifferentCredential: "इस ईमेल से पहले से एक खाता मौजूद है। कृपया मूल प्रदाता से साइन इन करें।",
    displayNameRequired: "कृपया एक प्रदर्शन नाम प्रदान करें",
    secondFactorAlreadyInUse: "यह फ़ोन नंबर पहले से इस खाते में नामांकित है।",
  },
  messages: {
    passwordResetEmailSent: "पासवर्ड रीसेट ईमेल सफलतापूर्वक भेजा गया",
    signInLinkSent: "साइन-इन लिंक सफलतापूर्वक भेजा गया",
    verificationCodeFirst: "कृपया पहले एक सत्यापन कोड का अनुरोध करें",
    checkEmailForReset: "पासवर्ड रीसेट निर्देशों के लिए अपना ईमेल जांचें",
    dividerOr: "या",
    termsAndPrivacy: "जारी रखकर, आप हमारे {tos} और {privacy} से सहमत होते हैं।",
    mfaSmsAssertionPrompt: "प्रमाणीकरण प्रक्रिया को पूरा करने के लिए {phoneNumber} पर एक सत्यापन कोड भेजा जाएगा।",
  },
  labels: {
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    displayName: "प्रदर्शन नाम",
    forgotPassword: "पासवर्ड भूल गए?",
    signUp: "साइन अप करें",
    signIn: "साइन इन करें",
    resetPassword: "पासवर्ड रीसेट करें",
    createAccount: "खाता बनाएं",
    backToSignIn: "साइन इन पर वापस जाएं",
    signInWithPhone: "फ़ोन से साइन इन करें",
    phoneNumber: "फ़ोन नंबर",
    verificationCode: "सत्यापन कोड",
    sendCode: "कोड भेजें",
    verifyCode: "कोड सत्यापित करें",
    signInWithGoogle: "Google से साइन इन करें",
    signInWithFacebook: "Facebook से साइन इन करें",
    signInWithApple: "Apple से साइन इन करें",
    signInWithMicrosoft: "Microsoft से साइन इन करें",
    signInWithGitHub: "GitHub से साइन इन करें",
    signInWithYahoo: "Yahoo से साइन इन करें",
    signInWithTwitter: "X से साइन इन करें",
    signInWithEmailLink: "ईमेल लिंक से साइन इन करें",
    signInWithEmail: "ईमेल से साइन इन करें",
    sendSignInLink: "साइन-इन लिंक भेजें",
    termsOfService: "सेवा की शर्तें",
    privacyPolicy: "गोपनीयता नीति",
    resendCode: "कोड पुनः भेजें",
    sending: "भेजा जा रहा है...",
    multiFactorEnrollment: "बहु-कारक नामांकन",
    multiFactorAssertion: "बहु-कारक प्रमाणीकरण",
    mfaTotpVerification: "TOTP सत्यापन",
    mfaSmsVerification: "SMS सत्यापन",
    generateQrCode: "QR कोड जनरेट करें",
  },
  prompts: {
    noAccount: "खाता नहीं है?",
    haveAccount: "पहले से खाता है?",
    enterEmailToReset: "अपना पासवर्ड रीसेट करने के लिए अपना ईमेल पता दर्ज करें",
    signInToAccount: "अपने खाते में साइन इन करें",
    smsVerificationPrompt: "अपने फ़ोन नंबर पर भेजा गया सत्यापन कोड दर्ज करें",
    enterDetailsToCreate: "नया खाता बनाने के लिए अपना विवरण दर्ज करें",
    enterPhoneNumber: "अपना फ़ोन नंबर दर्ज करें",
    enterVerificationCode: "सत्यापन कोड दर्ज करें",
    enterEmailForLink: "साइन-इन लिंक प्राप्त करने के लिए अपना ईमेल दर्ज करें",
    mfaEnrollmentPrompt: "एक नया बहु-कारक नामांकन विधि चुनें",
    mfaAssertionPrompt: "कृपया बहु-कारक प्रमाणीकरण प्रक्रिया पूरी करें",
    mfaAssertionFactorPrompt: "कृपया एक बहु-कारक प्रमाणीकरण विधि चुनें",
    mfaTotpQrCodePrompt: "अपने प्रमाणक ऐप से इस QR कोड को स्कैन करें",
    mfaTotpEnrollmentVerificationPrompt: "अपने प्रमाणक ऐप द्वारा जनरेट किया गया कोड जोड़ें",
  },
} satisfies Translations;
