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

export const rnBI = {
  errors: {
    userNotFound: "Nta konti iboneka ifise iyo aderesi y'imeyili",
    wrongPassword: "Ijambo ry'ibanga ntiribeye",
    invalidEmail: "Nyamuneka shiramwo aderesi y'imeyili yemewe",
    userDisabled: "Iyi konti yahagaritswe",
    networkRequestFailed: "Ntibishobotse guhuza na seriveri. Nyamuneka reba interineti yawe",
    tooManyRequests: "Hari amagerageza menshi yanse. Nyamuneka ongera ugerageze nyuma",
    missingVerificationCode: "Nyamuneka shiramwo kode yo kwemeza",
    emailAlreadyInUse: "Hariho konti isanzwe ifise iyi meyili",
    invalidCredential: "Ibimenyetso watanze ntibyemewe.",
    weakPassword: "Ijambo ry'ibanga rigomba kuba nibura imiterero 6",
    unverifiedEmail: "Nyamuneka emeza aderesi y'imeyili yawe kugira ukomeze.",
    operationNotAllowed: "Iki gikorwa ntikemewe. Nyamuneka vugana n'ubufasha.",
    invalidPhoneNumber: "Nomero ya telefone ntiyemewe",
    missingPhoneNumber: "Nyamuneka tanga nomero ya telefone",
    quotaExceeded: "Umubare wa SMS warenze. Nyamuneka ongera ugerageze nyuma",
    codeExpired: "Kode yo kwemeza yarangiye",
    captchaCheckFailed: "Kwemeza reCAPTCHA byanse. Nyamuneka ongera ugerageze.",
    missingVerificationId: "Nyamuneka banza urangize kwemeza reCAPTCHA.",
    missingEmail: "Nyamuneka tanga aderesi y'imeyili",
    invalidActionCode: "Ihuza ryo gusubiramwo ijambo ry'ibanga ntiryemewe canke ryarangiye",
    credentialAlreadyInUse: "Hariho konti isanzwe ifise iyi meyili. Nyamuneka injira ukoresheje iyo konti.",
    requiresRecentLogin: "Iki gikorwa gisaba kwinjira vuba. Nyamuneka ongera winjire.",
    providerAlreadyLinked: "Iyi nomero ya telefone isanzwe ihuzwa n'indi konti",
    invalidVerificationCode: "Kode yo kwemeza ntiyemewe. Nyamuneka ongera ugerageze",
    unknownError: "Habaye ikosa ritatenganyijwe",
    popupClosed: "Idirishya ryo kwinjira rirafunze. Nyamuneka ongera ugerageze.",
    accountExistsWithDifferentCredential:
      "Hariho konti isanzwe ifise iyi meyili. Nyamuneka injira ukoresheje uwayitanze bwa mbere.",
    displayNameRequired: "Nyamuneka tanga izina ryerekanwa",
    secondFactorAlreadyInUse: "Iyi nomero ya telefone isanzwe yandikishijwe kuri iyi konti.",
  },
  messages: {
    passwordResetEmailSent: "Imeyili yo gusubiramwo ijambo ry'ibanga yoherejwe neza",
    signInLinkSent: "Ihuza ryo kwinjira ryoherejwe neza",
    verificationCodeFirst: "Nyamuneka banza usabe kode yo kwemeza",
    checkEmailForReset: "Reba imeyili yawe urebe amabwiriza yo gusubiramwo ijambo ry'ibanga",
    dividerOr: "canke",
    termsAndPrivacy: "Mu gukomeza, uremera {tos} na {privacy} vyacu.",
    mfaSmsAssertionPrompt: "Kode yo kwemeza izoherezwa kuri {phoneNumber} kugira urangize kwemeza.",
  },
  labels: {
    emailAddress: "Aderesi y'Imeyili",
    password: "Ijambo ry'Ibanga",
    displayName: "Izina Ryerekanwa",
    forgotPassword: "Wibagiwe ijambo ry'ibanga?",
    signUp: "Iyandikishe",
    signIn: "Injira",
    resetPassword: "Subiramwo Ijambo ry'Ibanga",
    createAccount: "Fungura Konti",
    backToSignIn: "Subira ku Kwinjira",
    signInWithPhone: "Injira ukoresheje Telefone",
    phoneNumber: "Nomero ya Telefone",
    verificationCode: "Kode yo Kwemeza",
    sendCode: "Ohereza Kode",
    verifyCode: "Emeza Kode",
    signInWithGoogle: "Injira ukoresheje Google",
    signInWithFacebook: "Injira ukoresheje Facebook",
    signInWithApple: "Injira ukoresheje Apple",
    signInWithMicrosoft: "Injira ukoresheje Microsoft",
    signInWithGitHub: "Injira ukoresheje GitHub",
    signInWithYahoo: "Injira ukoresheje Yahoo",
    signInWithTwitter: "Injira ukoresheje X",
    signInWithEmailLink: "Injira ukoresheje Ihuza ry'Imeyili",
    sendSignInLink: "Ohereza Ihuza ryo Kwinjira",
    termsOfService: "Amategeko yo Gukoresha",
    privacyPolicy: "Politiki y'Ibanga",
    resendCode: "Ongera wohereze Kode",
    sending: "Biroherezwa...",
    dismiss: "Ugara",
    multiFactorEnrollment: "Iyandikishwa ry'Ibintu Byinshi",
    multiFactorAssertion: "Kwemeza Ibintu Byinshi",
    mfaTotpVerification: "Kwemeza TOTP",
    mfaSmsVerification: "Kwemeza SMS",
    generateQrCode: "Kora Kode ya QR",
  },
  prompts: {
    noAccount: "Ntufise konti?",
    haveAccount: "Usanzwe ufise konti?",
    enterEmailToReset: "Shiramwo aderesi y'imeyili yawe kugira usubiremwo ijambo ry'ibanga",
    signInToAccount: "Injira kuri konti yawe",
    smsVerificationPrompt: "Shiramwo kode yo kwemeza yoherejwe kuri nomero yawe ya telefone",
    enterDetailsToCreate: "Shiramwo amakuru yawe kugira ufungure konti nshasha",
    enterPhoneNumber: "Shiramwo nomero yawe ya telefone",
    enterVerificationCode: "Shiramwo kode yo kwemeza",
    enterEmailForLink: "Shiramwo imeyili yawe kugira wakire ihuza ryo kwinjira",
    mfaEnrollmentPrompt: "Hitamwo uburyo bushasha bwo kwiyandikisha mu bintu byinshi",
    mfaAssertionPrompt: "Nyamuneka urangize kwemeza ibintu byinshi",
    mfaAssertionFactorPrompt: "Nyamuneka hitamwo uburyo bwo kwemeza ibintu byinshi",
    mfaTotpQrCodePrompt: "Sikanira iyi kode ya QR ukoresheje porogaramu yawe yo kwemeza",
    mfaTotpEnrollmentVerificationPrompt: "Ongeramwo kode porogaramu yawe yo kwemeza yakozeko",
  },
} satisfies CompleteTranslationsWithoutLegacy;
