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

export const mgMG = {
  errors: {
    userNotFound: "Tsy nahitana kaonty miaraka amin'ity adiresy mailaka ity",
    wrongPassword: "Diso ny teny miafina",
    invalidEmail: "Azafady, ampidiro ny adiresy mailaka mety",
    userDisabled: "Efa nesorina ity kaonty ity",
    networkRequestFailed: "Tsy afaka mifandray amin'ny serveur. Azafady, jereo ny fifandraisanao amin'ny internet",
    tooManyRequests: "Be loatra ny fanandramana tsy nahomby. Azafady, andramo indray aorian'ny kely",
    missingVerificationCode: "Azafady, ampidiro ny kaody fanamarinana",
    emailAlreadyInUse: "Efa misy kaonty miaraka amin'ity mailaka ity",
    invalidCredential: "Tsy mety ny fitsipika fidirana nomena.",
    weakPassword: "Ny teny miafina tokony ho 6 litera farafahakeliny",
    unverifiedEmail: "Azafady, amarino ny adiresy mailakao mba hitohy.",
    operationNotAllowed: "Tsy avela ity asa ity. Azafady, mifandraisa amin'ny tolotra fanohanana.",
    invalidPhoneNumber: "Tsy mety ny laharan'ny finday",
    missingPhoneNumber: "Azafady, ampidiro ny laharan'ny finday",
    quotaExceeded: "Lany ny quota SMS. Azafady, andramo indray aorian'ny kely",
    codeExpired: "Lany daty ny kaody fanamarinana",
    captchaCheckFailed: "Tsy nahomby ny fanamarinana reCAPTCHA. Azafady, andramo indray.",
    missingVerificationId: "Azafady, vita aloha ny fanamarinana reCAPTCHA.",
    missingEmail: "Azafady, ampidiro ny adiresy mailaka",
    invalidActionCode: "Tsy mety na lany daty ny rohy fanavaozana ny teny miafina",
    credentialAlreadyInUse: "Efa misy kaonty miaraka amin'ity mailaka ity. Azafady, midira amin'io kaonty io.",
    requiresRecentLogin: "Mila fidirana vao haingana ity asa ity. Azafady, midira indray.",
    providerAlreadyLinked: "Efa mifandray amin'ny kaonty hafa ity laharan'ny finday ity",
    invalidVerificationCode: "Diso ny kaody fanamarinana. Azafady, andramo indray",
    unknownError: "Nisy olana tsy nalaina an-tsaina",
    popupClosed: "Nakatona ny varavarankely fidirana. Azafady, andramo indray.",
    accountExistsWithDifferentCredential:
      "Efa misy kaonty miaraka amin'ity mailaka ity. Azafady, midira amin'ny mpamatsy voalohany.",
    displayNameRequired: "Azafady, ampidiro ny anarana aseho",
    secondFactorAlreadyInUse: "Efa voasoratra amin'ity kaonty ity ny laharan'ny finday ity.",
  },
  messages: {
    passwordResetEmailSent: "Nalefa soa aman-tsara ny mailaka fanavaozana ny teny miafina",
    signInLinkSent: "Nalefa soa aman-tsara ny rohy fidirana",
    verificationCodeFirst: "Azafady, angataho aloha ny kaody fanamarinana",
    checkEmailForReset: "Jereo ny mailakao ny torolalana fanavaozana ny teny miafina",
    dividerOr: "na",
    termsAndPrivacy: "Raha mitohy ianao, manaiky ny {tos} sy {privacy} ataonay.",
    mfaSmsAssertionPrompt: "Halefa amin'ny {phoneNumber} ny kaody fanamarinana hamitana ny fizotran'ny fanamarinana.",
  },
  labels: {
    emailAddress: "Adiresy mailaka",
    password: "Teny miafina",
    displayName: "Anarana aseho",
    forgotPassword: "Poiravina ny teny miafina?",
    signUp: "Hisoratra anarana",
    signIn: "Hiditra",
    resetPassword: "Havaozy ny teny miafina",
    createAccount: "Hamorona kaonty",
    backToSignIn: "Hiverina amin'ny fidirana",
    signInWithPhone: "Hiditra amin'ny finday",
    phoneNumber: "Laharan'ny finday",
    verificationCode: "Kaody fanamarinana",
    sendCode: "Alefaso ny kaody",
    verifyCode: "Amarino ny kaody",
    signInWithGoogle: "Hiditra amin'ny Google",
    signInWithFacebook: "Hiditra amin'ny Facebook",
    signInWithApple: "Hiditra amin'ny Apple",
    signInWithMicrosoft: "Hiditra amin'ny Microsoft",
    signInWithGitHub: "Hiditra amin'ny GitHub",
    signInWithYahoo: "Hiditra amin'ny Yahoo",
    signInWithTwitter: "Hiditra amin'ny X",
    signInWithEmailLink: "Hiditra amin'ny rohy mailaka",
    sendSignInLink: "Alefaso ny rohy fidirana",
    termsOfService: "Fepetra fampiasana",
    privacyPolicy: "Politika momba ny tsiambaratelo",
    resendCode: "Alefaso indray ny kaody",
    sending: "Mandefa...",
    multiFactorEnrollment: "Fisoratana anarana maro dingana",
    multiFactorAssertion: "Fanamarinana maro dingana",
    mfaTotpVerification: "Fanamarinana TOTP",
    mfaSmsVerification: "Fanamarinana SMS",
    generateQrCode: "Mamorona kaody QR",
  },
  prompts: {
    noAccount: "Tsy manana kaonty ve ianao?",
    haveAccount: "Efa manana kaonty ve ianao?",
    enterEmailToReset: "Ampidiro ny adiresy mailakao mba havaozana ny teny miafinao",
    signInToAccount: "Midira amin'ny kaontinao",
    smsVerificationPrompt: "Ampidiro ny kaody fanamarinana nalefa tamin'ny laharan'ny finday",
    enterDetailsToCreate: "Ampidiro ny antontanisanao mba hamoronana kaonty vaovao",
    enterPhoneNumber: "Ampidiro ny laharan'ny findaynao",
    enterVerificationCode: "Ampidiro ny kaody fanamarinana",
    enterEmailForLink: "Ampidiro ny mailakao mba hahazoana rohy fidirana",
    mfaEnrollmentPrompt: "Mifidiana fomba vaovao hisoratana anarana maro dingana",
    mfaAssertionPrompt: "Azafady, hamarino ny fizotran'ny fanamarinana maro dingana",
    mfaAssertionFactorPrompt: "Azafady, mifidiana fomba fanamarinana maro dingana",
    mfaTotpQrCodePrompt: "Jereo ity kaody QR ity amin'ny app fanamarinana anao",
    mfaTotpEnrollmentVerificationPrompt: "Ampidiro ny kaody napetraky ny app fanamarinana anao",
  },
} satisfies Translations;
