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

export const tiER = {
  errors: {
    userNotFound: "ብዚ ኢመይል ዝተረኽበ ሕሳብ የለን",
    wrongPassword: "ጌጋ ፓስወርድ",
    invalidEmail: "ጽቡቕ ኢመይል ኣእቱ",
    userDisabled: "እዚ ሕሳብ ተዓጽዩ ኣሎ",
    networkRequestFailed: "ምስ ሰርቨር ምርኻብ ኣይከኣለን። እባኻ ኢንተርነትካ ርአ",
    tooManyRequests: "ብዙሓት ዘይተዓወቱ ፈተናታት። እባኻ ድሕሪኡ ደጊምካ ፈትን",
    missingVerificationCode: "እባኻ ኮድ ምርግጋጽ ኣእቱ",
    emailAlreadyInUse: "ብዚ ኢመይል ቀዲሙ ሕሳብ ኣሎ",
    invalidCredential: "ዝቐረበ ሓበሬታ ጌጋ እዩ።",
    weakPassword: "ፓስወርድ ቢያንስ 6 ፊደላት ክኸውን ኣለዎ",
    unverifiedEmail: "ንምቕጻል ኢመይልካ ኣረጋግጽ።",
    operationNotAllowed: "እዚ ስራሕ ኣይተፈቕደን። እባኻ ናብ ደገፍ ተወከስ።",
    invalidPhoneNumber: "ቁጽሪ ቴሌፎን ጌጋ እዩ",
    missingPhoneNumber: "እባኻ ቁጽሪ ቴሌፎን ሃብ",
    quotaExceeded: "ኮታ SMS ኣኺሉ። እባኻ ድሕሪኡ ደጊምካ ፈትን",
    codeExpired: "ናይ ምርግጋጽ ኮድ ግዜኡ ኣሕሊፉ",
    captchaCheckFailed: "ምርግጋጽ reCAPTCHA ኣይሰረሓን። እባኻ ደጊምካ ፈትን።",
    missingVerificationId: "እባኻ ቅድሚ ኹሉ ምርግгаጽ reCAPTCHA ፈጽም።",
    missingEmail: "እባኻ ኢመይል ኣድራሻ ኣእቱ",
    invalidActionCode: "ናይ ፓስወርድ ምዕራር ሊንክ ጌጋ እዩ ወይ ግዜኡ ኣሕሊፉ",
    credentialAlreadyInUse: "ብዚ ኢመይል ቀዲሙ ሕሳብ ኣሎ። እባኻ ብዚ ሕሳብ ኣቲኻ እተ።",
    requiresRecentLogin: "እዚ ስራሕ ሓድሽ ምእታው ይሓትት። እባኻ ደጊምካ ኣቲኻ እተ።",
    providerAlreadyLinked: "እዚ ቁጽሪ ቴሌፎን ቀዲሙ ምስ ካልእ ሕሳብ ተተሓሒዙ ኣሎ",
    invalidVerificationCode: "ጌጋ ኮድ ምርግጋጽ። እባኻ ደጊምካ ፈትን",
    unknownError: "ዘይተጸበየ ጌጋ ተፈጺሙ",
    popupClosed: "መስኮት ምእታው ተዓጺዉ ኣሎ። እባኻ ደጊምካ ፈትን።",
    accountExistsWithDifferentCredential: "ብዚ ኢመይል ቀዲሙ ሕሳብ ኣሎ። እባኻ ብቀዳማይ ኣቕራቢ ኣቲኻ እተ።",
    displayNameRequired: "እባኻ ዝርኢ ስም ኣእቱ",
    secondFactorAlreadyInUse: "እዚ ቁጽሪ ቴሌፎን ቀዲሙ ብዚ ሕሳብ ተመዝጊቡ ኣሎ።",
  },
  messages: {
    passwordResetEmailSent: "ኢመይል ምዕራር ፓስወርድ ብዓወት ተላኢኹ",
    signInLinkSent: "ሊንክ ምእታው ብዓወት ተላኢኹ",
    verificationCodeFirst: "እባኻ ቅድሚ ኹሉ ኮድ ምርግጋጽ ሓቶ",
    checkEmailForReset: "ናይ ፓስወርድ ምዕራር ኣገዳስነት ንምርካብ ኢመይልካ ርአ",
    dividerOr: "ወይ",
    termsAndPrivacy: "ምቕጻል ብምባል፡ ብ{tos} ከምኡ'ውን ብ{privacy} ተሰማማዕ።",
    mfaSmsAssertionPrompt: "ሂደት ምርግጋጽ ንምውዳእ ኮድ ምርግጋጽ ናብ {phoneNumber} ክለኣኽ እዩ።",
  },
  labels: {
    emailAddress: "ኢመይል ኣድራሻ",
    password: "ፓስወርድ",
    displayName: "ዝርኢ ስም",
    forgotPassword: "ፓስወርድ ረሲዕካ?",
    signUp: "ተመዝገብ",
    signIn: "ኣቲኻ እተ",
    resetPassword: "ፓስወርድ ኣዕርር",
    createAccount: "ሕሳብ ፍጠር",
    backToSignIn: "ናብ ምእታው ተመለስ",
    signInWithPhone: "ብቴሌፎን ኣቲኻ እተ",
    phoneNumber: "ቁጽሪ ቴሌፎን",
    verificationCode: "ኮድ ምርግጋጽ",
    sendCode: "ኮድ ስደድ",
    verifyCode: "ኮድ ኣረጋግጽ",
    signInWithGoogle: "ብ Google ኣቲኻ እተ",
    signInWithFacebook: "ብ Facebook ኣቲኻ እተ",
    signInWithApple: "ብ Apple ኣቲኻ እተ",
    signInWithMicrosoft: "ብ Microsoft ኣቲኻ እተ",
    signInWithGitHub: "ብ GitHub ኣቲኻ እተ",
    signInWithYahoo: "ብ Yahoo ኣቲኻ እተ",
    signInWithTwitter: "ብ X ኣቲኻ እተ",
    signInWithEmailLink: "ብ ሊንክ ኢመይል ኣቲኻ እተ",
    sendSignInLink: "ሊንክ ምእታው ስደድ",
    termsOfService: "ውዕላት ኣገልግሎት",
    privacyPolicy: "ፖሊሲ ምዕቃብ ሓበሬታ",
    resendCode: "ኮድ ደጊምካ ስደድ",
    sending: "ይልእኽ ኣሎ...",
    multiFactorEnrollment: "ብዙሕ-ኣገባብ ምምዝጋብ",
    multiFactorAssertion: "ብዙሕ-ኣገባብ ምርግጋጽ",
    mfaTotpVerification: "ምርግጋጽ TOTP",
    mfaSmsVerification: "ምርግጋጽ SMS",
    generateQrCode: "QR ኮድ ፍጠር",
  },
  prompts: {
    noAccount: "ሕሳብ ኣይብልካን ድዩ?",
    haveAccount: "ቅድሚ ሕዚ ሕሳብ ኣሎካ ድዩ?",
    enterEmailToReset: "ፓስወርድካ ንምዕራር ኢመይል ኣድራሻኻ ኣእቱ",
    signInToAccount: "ናብ ሕሳብካ ኣቲኻ እተ",
    smsVerificationPrompt: "ናብ ቁጽሪ ቴሌፎንካ ዝተለኣኸ ኮድ ምርግጋጽ ኣእቱ",
    enterDetailsToCreate: "ሓድሽ ሕሳብ ንምፍጣር ዝርዝርካ ኣእቱ",
    enterPhoneNumber: "ቁጽሪ ቴሌፎንካ ኣእቱ",
    enterVerificationCode: "ኮድ ምርግጋጽ ኣእቱ",
    enterEmailForLink: "ሊንክ ምእታው ንምርካብ ኢመይልካ ኣእቱ",
    mfaEnrollmentPrompt: "ሓድሽ ናይ ምምዝጋብ ኣገባብ ብዙሕ-ኣገባብ ምረጽ",
    mfaAssertionPrompt: "እባኻ ሂደት ብዙሕ-ኣገባብ ምርግጋጽ ፈጽም",
    mfaAssertionFactorPrompt: "እባኻ ኣገባብ ብዙሕ-ኣገባብ ምርግጋጽ ምረጽ",
    mfaTotpQrCodePrompt: "እዚ QR ኮድ ብ መተግበሪ ኣረጋጋጺኻ ስካን ግበር",
    mfaTotpEnrollmentVerificationPrompt: "ብ መተግበሪ ኣረጋጋጺኻ ዝተፈጠረ ኮድ ወስኽ",
  },
} satisfies Translations;
