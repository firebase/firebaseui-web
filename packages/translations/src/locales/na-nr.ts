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

import { type StrictTranslations } from "../strict-translations";

export const naNR = {
  errors: {
    userNotFound: "Ekeow akawnt ngune imel ngea",
    wrongPassword: "Pasiwod ngea ekeow bwa tsimine",
    invalidEmail: "Ekamawir omo, tok imel ngune bwa tsimine",
    userDisabled: "Akawnt ngea ea kairir",
    networkRequestFailed: "Ekeow bwain server. Ekamawir omo, lale internet om",
    tooManyRequests: "Eimwi kadu ekeow. Ekamawir omo, kadu mwi kor",
    missingVerificationCode: "Ekamawir omo, tok kod ngea",
    emailAlreadyInUse: "Eiy akawnt ngune imel ngea",
    invalidCredential: "Ekawor ngea ekeow bwa tsimine.",
    weakPassword: "Pasiwod ngea anim bwi 6 retsimeduw",
    unverifiedEmail: "Ekamawir omo, kamad imel om bwe omo dobar.",
    operationNotAllowed: "Anan ngea ekeow pit. Ekamawir omo, keibake support.",
    invalidPhoneNumber: "Namba ngea ekeow bwa tsimine",
    missingPhoneNumber: "Ekamawir omo, tok namba",
    quotaExceeded: "SMS quota ea dugu. Ekamawir omo, kadu mwi kor",
    codeExpired: "Kod ngea ea dugu",
    captchaCheckFailed: "Kamad reCAPTCHA ea dugu. Ekamawir omo, kadu mwi.",
    missingVerificationId: "Ekamawir omo, kamad reCAPTCHA otubwa.",
    missingEmail: "Ekamawir omo, tok imel",
    invalidActionCode: "Link ngea ekeow bwa tsimine me ea dugu",
    credentialAlreadyInUse: "Eiy akawnt ngune imel ngea. Ekamawir omo, delon ngune akawnt ngea.",
    requiresRecentLogin: "Anan ngea eiy bwi delon ngea eiy kor. Ekamawir omo, delon mwi.",
    providerAlreadyLinked: "Namba ngea eiy ngune akawnt eko",
    invalidVerificationCode: "Kod ngea ekeow bwa tsimine. Ekamawir omo, kadu mwi",
    unknownError: "Eiy anan ngea ekeow iduwen ea bwain",
    popupClosed: "Windo ngea ea kairir. Ekamawir omo, kadu mwi.",
    accountExistsWithDifferentCredential: "Eiy akawnt ngune imel ngea. Ekamawir omo, delon ngune provider ngea otubwa.",
    displayNameRequired: "Ekamawir omo, tok eda",
    secondFactorAlreadyInUse: "Namba ngea eiy ngune akawnt ngea.",
  },
  messages: {
    passwordResetEmailSent: "Imel ngea ea jilikin bwa tsimine",
    signInLinkSent: "Link ngea ea jilikin bwa tsimine",
    verificationCodeFirst: "Ekamawir omo, kadu kod ngea otubwa",
    checkEmailForReset: "Lale imel om bwe ekawor ngea",
    dividerOr: "me",
    termsAndPrivacy: "Ngune omo dobar, omo iyen {tos} me {privacy} awa.",
    mfaSmsAssertionPrompt: "Kod ngea anim jilikin ngune {phoneNumber} bwe kamad anan ngea.",
  },
  labels: {
    emailAddress: "Imel",
    password: "Pasiwod",
    displayName: "Eda",
    forgotPassword: "Pasiwod om ea dugu?",
    signUp: "Rejista",
    signIn: "Delon",
    resetPassword: "Kairi pasiwod",
    createAccount: "Orre akawnt",
    backToSignIn: "Ogen ngune delon",
    signInWithPhone: "Delon ngune namba",
    phoneNumber: "Namba",
    verificationCode: "Kod",
    sendCode: "Jilikin kod",
    verifyCode: "Kamad kod",
    signInWithGoogle: "Delon ngune Google",
    signInWithFacebook: "Delon ngune Facebook",
    signInWithApple: "Delon ngune Apple",
    signInWithMicrosoft: "Delon ngune Microsoft",
    signInWithGitHub: "Delon ngune GitHub",
    signInWithYahoo: "Delon ngune Yahoo",
    signInWithTwitter: "Delon ngune X",
    signInWithEmailLink: "Delon ngune link imel",
    sendSignInLink: "Jilikin link ngea",
    termsOfService: "Ekawor anan",
    privacyPolicy: "Ekawor privacy",
    resendCode: "Jilikin kod mwi",
    sending: "Ea jilikin...",
    dismiss: "Eab",
    multiFactorEnrollment: "Rejista eimwi",
    multiFactorAssertion: "Kamad eimwi",
    mfaTotpVerification: "Kamad TOTP",
    mfaSmsVerification: "Kamad SMS",
    generateQrCode: "Orre QR kod",
  },
  prompts: {
    noAccount: "Ekeow akawnt om?",
    haveAccount: "Eiy akawnt om?",
    enterEmailToReset: "Tok imel om bwe kairi pasiwod om",
    signInToAccount: "Delon ngune akawnt om",
    smsVerificationPrompt: "Tok kod ngea ea jilikin ngune namba om",
    enterDetailsToCreate: "Tok ekawor om bwe orre akawnt eko",
    enterPhoneNumber: "Tok namba om",
    enterVerificationCode: "Tok kod ngea",
    enterEmailForLink: "Tok imel om bwe omo taambule link ngea",
    mfaEnrollmentPrompt: "Kaji wawen eko",
    mfaAssertionPrompt: "Ekamawir omo, kamad anan ngea",
    mfaAssertionFactorPrompt: "Ekamawir omo, kaji wawen ngea",
    mfaTotpQrCodePrompt: "Scan QR kod ngea ngune app om",
    mfaTotpEnrollmentVerificationPrompt: "Kairi kod ngea app om ea orre",
  },
} satisfies StrictTranslations;
