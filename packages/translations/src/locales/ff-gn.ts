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

export const ffGN = {
  errors: {
    userNotFound: "Accounte woni nder adresse email ngo fuɗɗi",
    wrongPassword: "Paswordi woni wurtiingo",
    invalidEmail: "Hokku adresse email jaɓaŋ",
    userDisabled: "Accounte ngo nafti",
    networkRequestFailed: "Feeraade e sarworde wallaani. Tiiɗno ƴeewto jokkondiral internet maa",
    tooManyRequests: "Etteeji ɓurɗi heewi ɗii ngojjitaaki. Tiiɗno eto ɓaawo",
    missingVerificationCode: "Hokku koodu ngam tabitinaago",
    emailAlreadyInUse: "Accounte nder adresse email ngo woni",
    invalidCredential: "Ɗereeji ngi hokkii ngoni wurtiingo.",
    weakPassword: "Paswordi ndaa ɗum wona ko kiɗɗi 6",
    unverifiedEmail: "Tabitin adresse email maaɗa ngam fuɗɗugo.",
    operationNotAllowed: "Golle ngo ɗum yaɓaaka. Tawtu ɗum ngam support.",
    invalidPhoneNumber: "Numero telefon ngo wurtiingo",
    missingPhoneNumber: "Hokku numero telefon",
    quotaExceeded: "Limite SMS ngo pawi. Hokku ɗum tawu tiimaŋ",
    codeExpired: "Koodu ngam tabitinaago ngo pawi",
    captchaCheckFailed: "Tabitinaago reCAPTCHA ngo wooɗi. Hokku ɗum tawu.",
    missingVerificationId: "Waɗu tabitinaago reCAPTCHA jonta.",
    missingEmail: "Hokku adresse email",
    invalidActionCode: "Link ngam wilugo paswordi wurtiingo walla ngo pawi",
    credentialAlreadyInUse: "Accounte nder adresse email ngo woni. Nastu ɗum nder accounte ngo.",
    requiresRecentLogin: "Golle ngo footi nastugo kesum. Naste tawu.",
    providerAlreadyLinked: "Numero telefon ngo woni nder accounte keso",
    invalidVerificationCode: "Koodu ngam tabitinaago wurtiingo. Hokku tawu",
    unknownError: "Ɗum waŋɗii ko ngaɗaaka",
    popupClosed: "Ɓannde ngam naste ngo wari. Hokku tawu.",
    accountExistsWithDifferentCredential: "Accounte nder adresse email ngo woni. Nastu nder fournisseur ngo fuɗɗi.",
    displayNameRequired: "Hokku innde ngo ƴiiɗata",
    secondFactorAlreadyInUse: "Numero telefon ngo woni nder accounte ngo.",
  },
  messages: {
    passwordResetEmailSent: "Email ngam wilugo paswordi nastii",
    signInLinkSent: "Link ngam naste nastii",
    verificationCodeFirst: "Ɗaɓɓi koodu ngam tabitinaago fuɗɗuɗe",
    checkEmailForReset: "Raaru email maaɗa ngam ɗaɓɓaaji wilugo paswordi",
    dividerOr: "walla",
    termsAndPrivacy: "Tawu fuɗɗugo, a yeeɗa {tos} e {privacy} amen.",
    mfaSmsAssertionPrompt: "Koodu ngam tabitinaago ɓinndete ɗum {phoneNumber} ngam waɗugo tabitinaago.",
  },
  labels: {
    emailAddress: "Adresse email",
    password: "Paswordi",
    displayName: "Innde ngam yiɗugo",
    forgotPassword: "Ɗo paswordi maaɗa?",
    signUp: "Ɗaɓɓi kaɗaa",
    signIn: "Naste",
    resetPassword: "Wila paswordi",
    createAccount: "Waɗu accounte",
    backToSignIn: "Strefu naste",
    signInWithPhone: "Naste ngam telefon",
    phoneNumber: "Numero telefon",
    verificationCode: "Koodu ngam tabitinaago",
    sendCode: "Ɓinndu koodu",
    verifyCode: "Tabitin koodu",
    signInWithGoogle: "Naste ngam Google",
    signInWithFacebook: "Naste ngam Facebook",
    signInWithApple: "Naste ngam Apple",
    signInWithMicrosoft: "Naste ngam Microsoft",
    signInWithGitHub: "Naste ngam GitHub",
    signInWithYahoo: "Naste ngam Yahoo",
    signInWithTwitter: "Naste ngam X",
    signInWithEmailLink: "Naste ngam link email",
    sendSignInLink: "Ɓinndu link ngam naste",
    termsOfService: "Ɗaɓɓaaji golle",
    privacyPolicy: "Ɗaɓɓaaji sirrugo",
    resendCode: "Ɓinndu koodu tawu",
    sending: "Ɓinndaaɗi...",
    multiFactorEnrollment: "Ɗaɓɓi tabitinaago ko ɓeydi",
    multiFactorAssertion: "Tabitinaago ko ɓeydi",
    mfaTotpVerification: "Tabitinaago TOTP",
    mfaSmsVerification: "Tabitinaago SMS",
    generateQrCode: "Waɗu koodu QR",
  },
  prompts: {
    noAccount: "A accounte alaa?",
    haveAccount: "A accounte woni?",
    enterEmailToReset: "Hokku adresse email maaɗa ngam wilugo paswordi maaɗa",
    signInToAccount: "Naste nder accounte maaɗa",
    smsVerificationPrompt: "Hokku koodu ngam tabitinaago ngo ɓinndaama numero telefon maaɗa",
    enterDetailsToCreate: "Hokku ɗereeji maaɗa ngam waɗugo accounte kesum",
    enterPhoneNumber: "Hokku numero telefon maaɗa",
    enterVerificationCode: "Hokku koodu ngam tabitinaago",
    enterEmailForLink: "Hokku email maaɗa ngam heɓugo link ngam naste",
    mfaEnrollmentPrompt: "Suɓu hawtirgol ɗaɓɓaaji ko ɓeydi kesum",
    mfaAssertionPrompt: "Waɗu golle tabitinaago ko ɓeydi, tawu",
    mfaAssertionFactorPrompt: "Suɓu hawtirgol tabitinaago ko ɓeydi",
    mfaTotpQrCodePrompt: "Skane koodu QR ngo nder application maaɗa ngam tabitinaago",
    mfaTotpEnrollmentVerificationPrompt: "Hokku koodu ngo application maaɗa tabitinaago wali",
  },
} satisfies Translations;
