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

export const swTZ = {
  errors: {
    userNotFound: "Hakuna akaunti iliyopatikana yenye barua pepe hii",
    wrongPassword: "Nenosiri si sahihi",
    invalidEmail: "Tafadhali weka anwani sahihi ya barua pepe",
    userDisabled: "Akaunti hii imezimwa",
    networkRequestFailed: "Imeshindwa kuunganisha kwenye seva. Tafadhali angalia muunganisho wako wa intaneti",
    tooManyRequests: "Majaribio mengi yameshindwa. Tafadhali jaribu tena baadaye",
    missingVerificationCode: "Tafadhali weka msimbo wa uthibitishaji",
    emailAlreadyInUse: "Akaunti tayari ipo yenye barua pepe hii",
    invalidCredential: "Taarifa za kuingia ulizotoa si sahihi.",
    weakPassword: "Nenosiri lazima liwe na angalau herufi 6",
    unverifiedEmail: "Tafadhali thibitisha anwani yako ya barua pepe ili kuendelea.",
    operationNotAllowed: "Kitendo hiki hakiruhusiwi. Tafadhali wasiliana na huduma kwa wateja.",
    invalidPhoneNumber: "Namba ya simu si sahihi",
    missingPhoneNumber: "Tafadhali weka namba ya simu",
    quotaExceeded: "Kikomo cha SMS kimezidi. Tafadhali jaribu tena baadaye",
    codeExpired: "Msimbo wa uthibitishaji umeisha muda wake",
    captchaCheckFailed: "Uthibitishaji wa reCAPTCHA umeshindwa. Tafadhali jaribu tena.",
    missingVerificationId: "Tafadhali kamilisha kwanza uthibitishaji wa reCAPTCHA.",
    missingEmail: "Tafadhali weka anwani ya barua pepe",
    invalidActionCode: "Kiungo cha kuweka upya nenosiri si sahihi au kimeisha muda",
    credentialAlreadyInUse: "Akaunti tayari ipo yenye barua pepe hii. Tafadhali ingia kwa akaunti hiyo.",
    requiresRecentLogin: "Kitendo hiki kinahitaji kuingia hivi karibuni. Tafadhali ingia tena.",
    providerAlreadyLinked: "Namba hii ya simu tayari imeunganishwa na akaunti nyingine",
    invalidVerificationCode: "Msimbo wa uthibitishaji si sahihi. Tafadhali jaribu tena",
    unknownError: "Hitilafu isiyotarajiwa imetokea",
    popupClosed: "Dirisha la kuingia limefungwa. Tafadhali jaribu tena.",
    accountExistsWithDifferentCredential:
      "Akaunti tayari ipo yenye barua pepe hii. Tafadhali ingia kwa mtoa huduma wa awali.",
    displayNameRequired: "Tafadhali weka jina la kuonyesha",
    secondFactorAlreadyInUse: "Namba hii ya simu tayari imesajiliwa kwenye akaunti hii.",
  },
  messages: {
    passwordResetEmailSent: "Barua pepe ya kuweka upya nenosiri imetumwa kwa mafanikio",
    signInLinkSent: "Kiungo cha kuingia kimetumwa kwa mafanikio",
    verificationCodeFirst: "Tafadhali omba msimbo wa uthibitishaji kwanza",
    checkEmailForReset: "Angalia barua pepe yako kwa maelekezo ya kuweka upya nenosiri",
    dividerOr: "au",
    termsAndPrivacy: "Kwa kuendelea, unakubali {tos} na {privacy} zetu.",
    mfaSmsAssertionPrompt:
      "Msimbo wa uthibitishaji utatumwa kwa {phoneNumber} ili kukamilisha mchakato wa uthibitishaji.",
  },
  labels: {
    emailAddress: "Anwani ya Barua Pepe",
    password: "Nenosiri",
    displayName: "Jina la Kuonyesha",
    forgotPassword: "Umesahau nenosiri?",
    signUp: "Jisajili",
    signIn: "Ingia",
    resetPassword: "Weka Upya Nenosiri",
    createAccount: "Unda Akaunti",
    backToSignIn: "Rudi Kuingia",
    signInWithPhone: "Ingia kwa Simu",
    phoneNumber: "Namba ya Simu",
    verificationCode: "Msimbo wa Uthibitishaji",
    sendCode: "Tuma Msimbo",
    verifyCode: "Thibitisha Msimbo",
    signInWithGoogle: "Ingia kwa Google",
    signInWithFacebook: "Ingia kwa Facebook",
    signInWithApple: "Ingia kwa Apple",
    signInWithMicrosoft: "Ingia kwa Microsoft",
    signInWithGitHub: "Ingia kwa GitHub",
    signInWithYahoo: "Ingia kwa Yahoo",
    signInWithTwitter: "Ingia kwa X",
    signInWithEmailLink: "Ingia kwa Kiungo cha Barua Pepe",
    sendSignInLink: "Tuma Kiungo cha Kuingia",
    termsOfService: "Masharti ya Huduma",
    privacyPolicy: "Sera ya Faragha",
    resendCode: "Tuma Msimbo Tena",
    sending: "Inatuma...",
    multiFactorEnrollment: "Usajili wa Uthibitishaji wa Hatua Nyingi",
    multiFactorAssertion: "Uthibitishaji wa Hatua Nyingi",
    mfaTotpVerification: "Uthibitishaji wa TOTP",
    mfaSmsVerification: "Uthibitishaji wa SMS",
    generateQrCode: "Tengeneza Msimbo wa QR",
  },
  prompts: {
    noAccount: "Huna akaunti?",
    haveAccount: "Tayari una akaunti?",
    enterEmailToReset: "Weka anwani yako ya barua pepe ili kuweka upya nenosiri lako",
    signInToAccount: "Ingia kwenye akaunti yako",
    smsVerificationPrompt: "Weka msimbo wa uthibitishaji uliotumwa kwenye namba yako ya simu",
    enterDetailsToCreate: "Weka taarifa zako ili kuunda akaunti mpya",
    enterPhoneNumber: "Weka namba yako ya simu",
    enterVerificationCode: "Weka msimbo wa uthibitishaji",
    enterEmailForLink: "Weka barua pepe yako ili kupokea kiungo cha kuingia",
    mfaEnrollmentPrompt: "Chagua njia mpya ya usajili wa uthibitishaji wa hatua nyingi",
    mfaAssertionPrompt: "Tafadhali kamilisha mchakato wa uthibitishaji wa hatua nyingi",
    mfaAssertionFactorPrompt: "Tafadhali chagua njia ya uthibitishaji wa hatua nyingi",
    mfaTotpQrCodePrompt: "Skani msimbo huu wa QR kwa kutumia programu yako ya uthibitishaji",
    mfaTotpEnrollmentVerificationPrompt: "Ongeza msimbo unaozalishwa na programu yako ya uthibitishaji",
  },
} satisfies Translations;
