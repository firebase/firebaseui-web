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

import { type CompleteTranslationsWithoutLegacy } from "../types";

export const neNP = {
  errors: {
    userNotFound: "यो इमेल ठेगानासँग सम्बन्धित खाता फेला परेन",
    wrongPassword: "गलत पासवर्ड",
    invalidEmail: "कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्",
    userDisabled: "यो खाता निष्क्रिय गरिएको छ",
    networkRequestFailed: "सर्भरसँग जडान गर्न सकिएन। कृपया इन्टरनेट जडान जाँच गर्नुहोस्",
    tooManyRequests: "धेरै पटक असफल प्रयास भयो। कृपया केही समयपछि फेरि प्रयास गर्नुहोस्",
    missingVerificationCode: "कृपया पुष्टि कोड प्रविष्ट गर्नुहोस्",
    emailAlreadyInUse: "यो इमेलसँग खाता पहिल्यै छ",
    invalidCredential: "प्रदान गरिएका प्रमाणहरू अमान्य छन्।",
    weakPassword: "पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ",
    unverifiedEmail: "जारी राख्न कृपया आफ्नो इमेल ठेगाना पुष्टि गर्नुहोस्।",
    operationNotAllowed: "यो कार्य अनुमति छैन। कृपया सहयोगसँग सम्पर्क गर्नुहोस्।",
    invalidPhoneNumber: "फोन नम्बर अमान्य छ",
    missingPhoneNumber: "कृपया फोन नम्बर दिनुहोस्",
    quotaExceeded: "SMS सीमा नाघेको छ। कृपया केही समयपछि फेरि प्रयास गर्नुहोस्",
    codeExpired: "पुष्टि कोडको म्याद सकिएको छ",
    captchaCheckFailed: "reCAPTCHA पुष्टि असफल भयो। कृपया फेरि प्रयास गर्नुहोस्।",
    missingVerificationId: "कृपया पहिले reCAPTCHA पुष्टि पूरा गर्नुहोस्।",
    missingEmail: "कृपया इमेल ठेगाना दिनुहोस्",
    invalidActionCode: "पासवर्ड रिसेट लिंक अमान्य छ वा म्याद सकिएको छ",
    credentialAlreadyInUse: "यो इमेलसँग खाता पहिल्यै छ। कृपया त्यो खाताबाट साइन इन गर्नुहोस्।",
    requiresRecentLogin: "यो कार्यका लागि हालैको लगइन आवश्यक छ। कृपया फेरि साइन इन गर्नुहोस्।",
    providerAlreadyLinked: "यो फोन नम्बर अर्को खातासँग पहिल्यै जोडिएको छ",
    invalidVerificationCode: "अमान्य पुष्टि कोड। कृपया फेरि प्रयास गर्नुहोस्",
    unknownError: "अनपेक्षित त्रुटि भयो",
    popupClosed: "साइन इन पप-अप बन्द भयो। कृपया फेरि प्रयास गर्नुहोस्।",
    accountExistsWithDifferentCredential: "यो इमेलसँग खाता पहिल्यै छ। कृपया मूल प्रदायकबाट साइन इन गर्नुहोस्।",
    displayNameRequired: "कृपया प्रदर्शन नाम दिनुहोस्",
    secondFactorAlreadyInUse: "यो फोन नम्बर यो खातामा पहिल्यै दर्ता भइसकेको छ।",
  },
  messages: {
    passwordResetEmailSent: "पासवर्ड रिसेट इमेल सफलतापूर्वक पठाइयो",
    signInLinkSent: "साइन इन लिंक सफलतापूर्वक पठाइयो",
    verificationCodeFirst: "कृपया पहिले पुष्टि कोड अनुरोध गर्नुहोस्",
    checkEmailForReset: "पासवर्ड रिसेट निर्देशनका लागि आफ्नो इमेल जाँच गर्नुहोस्",
    dividerOr: "वा",
    termsAndPrivacy: "जारी राखेर तपाईं हाम्रो {tos} र {privacy} मा सहमत हुनुहुन्छ।",
    mfaSmsAssertionPrompt: "प्रमाणीकरण प्रक्रिया पूरा गर्न {phoneNumber} मा पुष्टि कोड पठाइनेछ।",
  },
  labels: {
    emailAddress: "इमेल ठेगाना",
    password: "पासवर्ड",
    displayName: "प्रदर्शन नाम",
    forgotPassword: "पासवर्ड बिर्सनुभयो?",
    signUp: "साइन अप",
    signIn: "साइन इन",
    resetPassword: "पासवर्ड रिसेट",
    createAccount: "खाता बनाउनुहोस्",
    backToSignIn: "साइन इनमा फर्कनुहोस्",
    signInWithPhone: "फोनबाट साइन इन",
    phoneNumber: "फोन नम्बर",
    verificationCode: "पुष्टि कोड",
    sendCode: "कोड पठाउनुहोस्",
    verifyCode: "कोड प्रमाणित गर्नुहोस्",
    signInWithGoogle: "Google मार्फत साइन इन",
    signInWithFacebook: "Facebook मार्फत साइन इन",
    signInWithApple: "Apple मार्फत साइन इन",
    signInWithMicrosoft: "Microsoft मार्फत साइन इन",
    signInWithGitHub: "GitHub मार्फत साइन इन",
    signInWithYahoo: "Yahoo मार्फत साइन इन",
    signInWithTwitter: "X मार्फत साइन इन",
    signInWithEmailLink: "इमेल लिंकबाट साइन इन",
    sendSignInLink: "साइन इन लिंक पठाउनुहोस्",
    termsOfService: "सेवाका सर्तहरू",
    privacyPolicy: "गोपनीयता नीति",
    resendCode: "कोड फेरि पठाउनुहोस्",
    sending: "पठाउँदै...",
    dismiss: "बन्द गर्नुहोस्",
    multiFactorEnrollment: "बहु-कारक दर्ता",
    multiFactorAssertion: "बहु-कारक प्रमाणीकरण",
    mfaTotpVerification: "TOTP प्रमाणीकरण",
    mfaSmsVerification: "SMS प्रमाणीकरण",
    generateQrCode: "QR कोड बनाउनुहोस्",
  },
  prompts: {
    noAccount: "खाता छैन?",
    haveAccount: "पहिले नै खाता छ?",
    enterEmailToReset: "पासवर्ड रिसेट गर्न आफ्नो इमेल ठेगाना प्रविष्ट गर्नुहोस्",
    signInToAccount: "आफ्नो खातामा साइन इन गर्नुहोस्",
    smsVerificationPrompt: "तपाईंको फोन नम्बरमा पठाइएको पुष्टि कोड प्रविष्ट गर्नुहोस्",
    enterDetailsToCreate: "नयाँ खाता बनाउन आफ्नो विवरण प्रविष्ट गर्नुहोस्",
    enterPhoneNumber: "आफ्नो फोन नम्बर प्रविष्ट गर्नुहोस्",
    enterVerificationCode: "पुष्टि कोड प्रविष्ट गर्नुहोस्",
    enterEmailForLink: "साइन इन लिंक प्राप्त गर्न आफ्नो इमेल प्रविष्ट गर्नुहोस्",
    mfaEnrollmentPrompt: "नयाँ बहु-कारक दर्ता विधि चयन गर्नुहोस्",
    mfaAssertionPrompt: "कृपया बहु-कारक प्रमाणीकरण प्रक्रिया पूरा गर्नुहोस्",
    mfaAssertionFactorPrompt: "कृपया बहु-कारक प्रमाणीकरण विधि चयन गर्नुहोस्",
    mfaTotpQrCodePrompt: "यो QR कोड आफ्नो प्रमाणीकरण एपमा स्क्यान गर्नुहोस्",
    mfaTotpEnrollmentVerificationPrompt: "आफ्नो प्रमाणीकरण एपले उत्पन्न गरेको कोड थप्नुहोस्",
  },
} satisfies CompleteTranslationsWithoutLegacy;
