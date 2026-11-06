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

export const mhMH = {
  errors: {
    userNotFound: "Ejjelok akawnt kin imel in",
    wrongPassword: "Pajwod eo ejjab mour",
    invalidEmail: "Jouj im letok juon imel eo emour",
    userDisabled: "Akawnt in ekkar kilen",
    networkRequestFailed: "Ejjelok ukok kin server eo. Jouj im lale internet eo am",
    tooManyRequests: "Elon kajjitok ko rej jabwe. Jouj im kajjitok bar tok",
    missingVerificationCode: "Jouj im letok kood eo",
    emailAlreadyInUse: "Ewor akawnt kin imel in",
    invalidCredential: "Melele ko raar letok ejjab mour.",
    weakPassword: "Pajwod eo enaj wor 6 letter",
    unverifiedEmail: "Jouj im kamour imel eo am nan kokkure.",
    operationNotAllowed: "Jerbal in ejjab pitok. Jouj im kebaaki support.",
    invalidPhoneNumber: "Nomba in telabon ejjab mour",
    missingPhoneNumber: "Jouj im letok juon nomba in telabon",
    quotaExceeded: "SMS quota ear jabwe. Jouj im kajjitok bar tok",
    codeExpired: "Kood eo ear jabwe",
    captchaCheckFailed: "Kamour in reCAPTCHA ear jabwe. Jouj im kajjitok bar.",
    missingVerificationId: "Jouj im kamour reCAPTCHA mokta.",
    missingEmail: "Jouj im letok juon imel",
    invalidActionCode: "Link in pajwod eo ejjab mour ak ear jabwe",
    credentialAlreadyInUse: "Ewor akawnt kin imel in. Jouj im delon kin akawnt eo.",
    requiresRecentLogin: "Jerbal in ej aikuj juon delon eo ekkar. Jouj im delon bar.",
    providerAlreadyLinked: "Nomba in telabon ekar ukok kin akawnt eo juon",
    invalidVerificationCode: "Kood eo ejjab mour. Jouj im kajjitok bar",
    unknownError: "Juon jabwe eo ejjab jelmae ear walok",
    popupClosed: "Window in delon ear kilok. Jouj im kajjitok bar.",
    accountExistsWithDifferentCredential: "Ewor akawnt kin imel in. Jouj im delon kin provider eo mokta.",
    displayNameRequired: "Jouj im letok juon etan",
    secondFactorAlreadyInUse: "Nomba in telabon ekar rejista kin akawnt in.",
  },
  messages: {
    passwordResetEmailSent: "Imel in pajwod eo ear jilkin emour",
    signInLinkSent: "Link in delon ear jilkin emour",
    verificationCodeFirst: "Jouj im kajjitok kood eo mokta",
    checkEmailForReset: "Lale imel eo am kin melele in pajwod",
    dividerOr: "ak",
    termsAndPrivacy: "Ilo am kokkure, kwoj lelok am iien kin {tos} im {privacy} eo ad.",
    mfaSmsAssertionPrompt: "Juon kood enaj jilkin nan {phoneNumber} nan kamour jerbal in.",
  },
  labels: {
    emailAddress: "Imel",
    password: "Pajwod",
    displayName: "Etan",
    forgotPassword: "Pajwod eo am ear jabwe?",
    signUp: "Rejista",
    signIn: "Delon",
    resetPassword: "Kobaiki pajwod",
    createAccount: "Komman akawnt",
    backToSignIn: "Rool nan delon",
    signInWithPhone: "Delon kin telabon",
    phoneNumber: "Nomba in telabon",
    verificationCode: "Kood",
    sendCode: "Jilkin kood",
    verifyCode: "Kamour kood",
    signInWithGoogle: "Delon kin Google",
    signInWithFacebook: "Delon kin Facebook",
    signInWithApple: "Delon kin Apple",
    signInWithMicrosoft: "Delon kin Microsoft",
    signInWithGitHub: "Delon kin GitHub",
    signInWithYahoo: "Delon kin Yahoo",
    signInWithTwitter: "Delon kin X",
    signInWithEmailLink: "Delon kin link in imel",
    sendSignInLink: "Jilkin link in delon",
    termsOfService: "Mour in jerbal",
    privacyPolicy: "Mour in privacy",
    resendCode: "Jilkin kood bar",
    sending: "Ej jilkin...",
    dismiss: "Kola",
    multiFactorEnrollment: "Rejista in elon",
    multiFactorAssertion: "Kamour in elon",
    mfaTotpVerification: "Kamour in TOTP",
    mfaSmsVerification: "Kamour in SMS",
    generateQrCode: "Komman QR kood",
  },
  prompts: {
    noAccount: "Ejjelok akawnt eo am?",
    haveAccount: "Ewor akawnt eo am?",
    enterEmailToReset: "Letok imel eo am nan kobaiki pajwod eo am",
    signInToAccount: "Delon nan akawnt eo am",
    smsVerificationPrompt: "Letok kood eo ear jilkin nan nomba in telabon eo am",
    enterDetailsToCreate: "Letok melele ko am nan komman juon akawnt eo ekar",
    enterPhoneNumber: "Letok nomba in telabon eo am",
    enterVerificationCode: "Letok kood eo",
    enterEmailForLink: "Letok imel eo am nan bokin juon link in delon",
    mfaEnrollmentPrompt: "Kaji juon wawen rejista eo ekar",
    mfaAssertionPrompt: "Jouj im kamour jerbal in kamour",
    mfaAssertionFactorPrompt: "Jouj im kaji juon wawen kamour",
    mfaTotpQrCodePrompt: "Scan QR kood in kin app eo am",
    mfaTotpEnrollmentVerificationPrompt: "Kobaiki kood eo app eo am ear komman",
  },
} satisfies CompleteTranslationsWithoutLegacy;
