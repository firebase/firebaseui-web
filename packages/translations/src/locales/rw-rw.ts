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

export const rwRW = {
  errors: {
    userNotFound: "Nta konti ibonetse ifite iyi aderesi y'imeri",
    wrongPassword: "Ijambobanga ritari ryo",
    invalidEmail: "Nyamuneka andika aderesi y'imeri yemewe",
    userDisabled: "Iyi konti yahagaritswe",
    networkRequestFailed: "Ntibishoboka guhuza na seriveri. Nyamuneka reba interineti yawe",
    tooManyRequests: "Hashize kugerageza inshuro nyinshi. Nyamuneka ongera ugerageze nyuma",
    missingVerificationCode: "Nyamuneka andika kode yo kwemeza",
    emailAlreadyInUse: "Konti isanzwe ifite iyi imeri",
    invalidCredential: "Ibyangombwa watanze ntibyemewe.",
    weakPassword: "Ijambobanga rigomba kuba nibura inyuguti 6",
    unverifiedEmail: "Nyamuneka emeza aderesi y'imeri yawe kugira ngo ukomeze.",
    operationNotAllowed: "Iki gikorwa ntikemewe. Nyamuneka vugana n'ubufasha.",
    invalidPhoneNumber: "Nimero ya telefone ntiyemewe",
    missingPhoneNumber: "Nyamuneka tanga nimero ya telefone",
    quotaExceeded: "Ntarengwa ya SMS yarenze. Nyamuneka ongera ugerageze nyuma",
    codeExpired: "Kode yo kwemeza yarangiye igihe",
    captchaCheckFailed: "Kwemeza reCAPTCHA byanze. Nyamuneka ongera ugerageze.",
    missingVerificationId: "Nyamuneka banza urangize kwemeza reCAPTCHA.",
    missingEmail: "Nyamuneka tanga aderesi y'imeri",
    invalidActionCode: "Umurongo wo gusubiranya ijambobanga ntiwemewe cyangwa warangiye",
    credentialAlreadyInUse: "Konti isanzwe ifite iyi imeri. Nyamuneka injira ukoresheje iyo konti.",
    requiresRecentLogin: "Iki gikorwa gisaba kwinjira vuba. Nyamuneka ongera winjire.",
    providerAlreadyLinked: "Iyi nimero ya telefone isanzwe ihujwe n'indi konti",
    invalidVerificationCode: "Kode yo kwemeza ntiyemewe. Nyamuneka ongera ugerageze",
    unknownError: "Habaye ikosa ritunguranye",
    popupClosed: "Idirishya ryo kwinjira ryafunzwe. Nyamuneka ongera ugerageze.",
    accountExistsWithDifferentCredential:
      "Konti isanzwe ifite iyi imeri. Nyamuneka injira ukoresheje uwayitanze mbere.",
    displayNameRequired: "Nyamuneka tanga izina ryerekanwa",
    secondFactorAlreadyInUse: "Iyi nimero ya telefone isanzwe yanditswe kuri iyi konti.",
  },
  messages: {
    passwordResetEmailSent: "Imeri yo gusubiranya ijambobanga yoherejwe neza",
    signInLinkSent: "Umurongo wo kwinjira woherejwe neza",
    verificationCodeFirst: "Nyamuneka banza usabe kode yo kwemeza",
    checkEmailForReset: "Reba imeri yawe urebe amabwiriza yo gusubiranya ijambobanga",
    dividerOr: "cyangwa",
    termsAndPrivacy: "Ukomeje, wemeranya n'amategeko yacu {tos} na {privacy}.",
    mfaSmsAssertionPrompt: "Kode yo kwemeza izoherezwa kuri {phoneNumber} kugira ngo urangize inzira yo kwemeza.",
  },
  labels: {
    emailAddress: "Aderesi y'imeri",
    password: "Ijambobanga",
    displayName: "Izina ryerekanwa",
    forgotPassword: "Wibagiwe ijambobanga?",
    signUp: "Iyandikishe",
    signIn: "Injira",
    resetPassword: "Subiranya ijambobanga",
    createAccount: "Fungura konti",
    backToSignIn: "Subira ku kwinjira",
    signInWithPhone: "Injira ukoresheje telefone",
    phoneNumber: "Nimero ya telefone",
    verificationCode: "Kode yo kwemeza",
    sendCode: "Ohereza kode",
    verifyCode: "Emeza kode",
    signInWithGoogle: "Injira ukoresheje Google",
    signInWithFacebook: "Injira ukoresheje Facebook",
    signInWithApple: "Injira ukoresheje Apple",
    signInWithMicrosoft: "Injira ukoresheje Microsoft",
    signInWithGitHub: "Injira ukoresheje GitHub",
    signInWithYahoo: "Injira ukoresheje Yahoo",
    signInWithTwitter: "Injira ukoresheje X",
    signInWithEmailLink: "Injira ukoresheje umurongo wa imeri",
    sendSignInLink: "Ohereza umurongo wo kwinjira",
    termsOfService: "Amategeko y'imikoreshereze",
    privacyPolicy: "Politiki y'ibanga",
    resendCode: "Ongera wohereze kode",
    sending: "Biroherezwa...",
    multiFactorEnrollment: "Kwiyandikisha mu kwemeza mu ntambwe nyinshi",
    multiFactorAssertion: "Kwemeza mu ntambwe nyinshi",
    mfaTotpVerification: "Kwemeza TOTP",
    mfaSmsVerification: "Kwemeza SMS",
    generateQrCode: "Kora QR code",
  },
  prompts: {
    noAccount: "Ntufite konti?",
    haveAccount: "Usanzwe ufite konti?",
    enterEmailToReset: "Andika aderesi y'imeri yawe kugira ngo usubiranye ijambobanga",
    signInToAccount: "Injira muri konti yawe",
    smsVerificationPrompt: "Andika kode yo kwemeza yoherejwe kuri nimero ya telefone yawe",
    enterDetailsToCreate: "Andika amakuru yawe kugira ngo ufungure konti nshya",
    enterPhoneNumber: "Andika nimero ya telefone yawe",
    enterVerificationCode: "Andika kode yo kwemeza",
    enterEmailForLink: "Andika imeri yawe kugira ngo wakire umurongo wo kwinjira",
    mfaEnrollmentPrompt: "Hitamo uburyo bushya bwo kwiyandikisha mu kwemeza mu ntambwe nyinshi",
    mfaAssertionPrompt: "Nyamuneka urangize inzira yo kwemeza mu ntambwe nyinshi",
    mfaAssertionFactorPrompt: "Nyamuneka hitamo uburyo bwo kwemeza mu ntambwe nyinshi",
    mfaTotpQrCodePrompt: "Skana iyi QR code ukoresheje porogaramu yawe yo kwemeza",
    mfaTotpEnrollmentVerificationPrompt: "Ongeramo kode itangwa na porogaramu yawe yo kwemeza",
  },
} satisfies Translations;
