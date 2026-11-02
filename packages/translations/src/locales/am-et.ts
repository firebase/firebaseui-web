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

export const amET = {
  errors: {
    userNotFound: "በዚህ የኢሜይል አድራሻ ምንም መለያ አልተገኘም",
    wrongPassword: "የተሳሳተ የይለፍ ቃል",
    invalidEmail: "እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ",
    userDisabled: "ይህ መለያ ተሰናክሏል",
    networkRequestFailed: "ከአገልጋዩ ጋር መገናኘት አልተቻለም። እဘክዎ የኢንተርኔት ግንኙነትዎን ይፈትሹ",
    tooManyRequests: "ብዙ ያልተሳኩ ሙከራዎች። እባክዎ ቆይተው እንደገና ይሞክሩ",
    missingVerificationCode: "እባክዎ የማረጋገጫ ኮዱን ያስገቡ",
    emailAlreadyInUse: "በዚህ ኢሜይል ያለ መለያ አለ",
    invalidCredential: "የቀረቡት መረጃዎች ትክክል አይደሉም።",
    weakPassword: "የይለፍ ቃሉ ቢያንስ 6 ቁምፊዎች መሆን አለበት",
    unverifiedEmail: "ለመቀጠል እባክዎ የኢሜይል አድራሻዎን ያረጋግጡ።",
    operationNotAllowed: "ይህ ተግባር አይፈቀድም። እባክዎ ድጋፍን ያነጋግሩ።",
    invalidPhoneNumber: "የስልክ ቁጥሩ ትክክል አይደለም",
    missingPhoneNumber: "እባክዎ የስልክ ቁጥር ያስገቡ",
    quotaExceeded: "የኤስኤምኤስ ኮታ ታልፏል። እባክዎ ቆይተው እንደገና ይሞክሩ",
    codeExpired: "የማረጋገጫ ኮዱ ጊዜው አልፎበታል",
    captchaCheckFailed: "የreCAPTCHA ማረጋገጫ አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
    missingVerificationId: "እባክዎ መጀመሪያ የreCAPTCHA ማረጋገጫውን ያጠናቅቁ።",
    missingEmail: "እባክዎ የኢሜይል አድራሻ ያስገቡ",
    invalidActionCode: "የይለፍ ቃል ዳግም ማስጀመሪያ አገናኙ ትክክል አይደለም ወይም ጊዜው አልፎበታል",
    credentialAlreadyInUse: "በዚህ ኢሜይል ያለ መለያ አለ። እባክዎ በዚያ መለያ ይግቡ።",
    requiresRecentLogin: "ይህ ተግባር የቅርብ ጊዜ መግባት ይጠይቃል። እባክዎ እንደገና ይግቡ።",
    providerAlreadyLinked: "ይህ ስልክ ቁጥር ከሌላ መለያ ጋር ተገናኝቷል",
    invalidVerificationCode: "ትክክል ያልሆነ የማረጋገጫ ኮድ። እባክዎ እንደገና ይሞክሩ",
    unknownError: "ያልተጠበቀ ስህተት ተከስቷል",
    popupClosed: "የመግቢያ መስኮቱ ተዘግቷል። እባክዎ እንደገና ይሞክሩ።",
    accountExistsWithDifferentCredential: "በዚህ ኢሜይል ያለ መለያ አለ። እባክዎ በመጀመሪያው አቅራቢ ይግቡ።",
    displayNameRequired: "እባክዎ የማሳያ ስም ያስገቡ",
    secondFactorAlreadyInUse: "ይህ ስልክ ቁጥር በዚህ መለያ ተመዝግቧል።",
  },
  messages: {
    passwordResetEmailSent: "የይለፍ ቃል ዳግም ማስጀመሪያ ኢሜይል በተሳካ ሁኔታ ተልኳል",
    signInLinkSent: "የመግቢያ አገናኝ በተሳካ ሁኔታ ተልኳል",
    verificationCodeFirst: "እባክዎ መጀመሪያ የማረጋገጫ ኮድ ይጠይቁ",
    checkEmailForReset: "የይለፍ ቃል ዳግም ለማስጀመር መመሪያዎችን ለማግኘት ኢሜይልዎን ይመልከቱ",
    dividerOr: "ወይም",
    termsAndPrivacy: "በመቀጠል፣ ለ{tos} እና ለ{privacy} ተስማምተዋል።",
    mfaSmsAssertionPrompt: "የማረጋገጫ ሂደቱን ለማጠናቀቅ የማረጋገጫ ኮድ ወደ {phoneNumber} ይላካል።",
  },
  labels: {
    emailAddress: "የኢሜይል አድራሻ",
    password: "የይለፍ ቃል",
    displayName: "የማሳያ ስም",
    forgotPassword: "የይለፍ ቃል ረሱ?",
    signUp: "ይመዝገቡ",
    signIn: "ይግቡ",
    resetPassword: "የይለፍ ቃል ዳግም አስጀምር",
    createAccount: "መለያ ፍጠር",
    backToSignIn: "ወደ መግቢያ ተመለስ",
    signInWithPhone: "በስልክ ይግቡ",
    phoneNumber: "ስልክ ቁጥር",
    verificationCode: "የማረጋገጫ ኮድ",
    sendCode: "ኮድ ላክ",
    verifyCode: "ኮድ አረጋግጥ",
    signInWithGoogle: "በGoogle ይግቡ",
    signInWithFacebook: "በFacebook ይግቡ",
    signInWithApple: "በApple ይግቡ",
    signInWithMicrosoft: "በMicrosoft ይግቡ",
    signInWithGitHub: "በGitHub ይግቡ",
    signInWithYahoo: "በYahoo ይግቡ",
    signInWithTwitter: "በX ይግቡ",
    signInWithEmailLink: "በኢሜይል አገናኝ ይግቡ",
    sendSignInLink: "የመግቢያ አገናኝ ላክ",
    termsOfService: "የአገልግሎት ውል",
    privacyPolicy: "የግላዊነት ፖሊሲ",
    resendCode: "ኮዱን እንደገና ላክ",
    sending: "በመላክ ላይ...",
    multiFactorEnrollment: "ባለብዙ ደረጃ ማረጋገጫ ምዝገባ",
    multiFactorAssertion: "ባለብዙ ደረጃ ማረጋገጫ",
    mfaTotpVerification: "TOTP ማረጋገጫ",
    mfaSmsVerification: "የኤስኤምኤስ ማረጋገጫ",
    generateQrCode: "QR ኮድ ፍጠር",
  },
  prompts: {
    noAccount: "መለያ የለዎትም?",
    haveAccount: "መለያ አለዎት?",
    enterEmailToReset: "የይለፍ ቃልዎን ዳግም ለማስጀመር የኢሜይል አድራሻዎን ያስገቡ",
    signInToAccount: "ወደ መለያዎ ይግቡ",
    smsVerificationPrompt: "ወደ ስልክ ቁጥርዎ የተላከውን የማረጋገጫ ኮድ ያስገቡ",
    enterDetailsToCreate: "አዲስ መለያ ለመፍጠር ዝርዝሮችዎን ያስገቡ",
    enterPhoneNumber: "ስልክ ቁጥርዎን ያስገቡ",
    enterVerificationCode: "የማረጋገጫ ኮዱን ያስገቡ",
    enterEmailForLink: "የመግቢያ አገናኝ ለመቀበል ኢሜይልዎን ያስገቡ",
    mfaEnrollmentPrompt: "አዲስ ባለብዙ ደረጃ ማረጋገጫ ዘዴ ይምረጡ",
    mfaAssertionPrompt: "እባክዎ የባለብዙ ደረጃ ማረጋገጫ ሂደቱን ያጠናቅቁ",
    mfaAssertionFactorPrompt: "እባክዎ የባለብዙ ደረጃ ማረጋገጫ ዘዴ ይምረጡ",
    mfaTotpQrCodePrompt: "ይህን QR ኮድ በማረጋገጫ መተግበሪያዎ ይቃኙ",
    mfaTotpEnrollmentVerificationPrompt: "በማረጋገጫ መተግበሪያዎ የተፈጠረውን ኮድ ያስገቡ",
  },
} satisfies Translations;
