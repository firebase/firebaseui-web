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

export const haNE = {
  errors: {
    userNotFound: "Ba a sami asusun da ke amfani da wannan adireshin imel ba",
    wrongPassword: "Kalmar sirri ba daidai ba ce",
    invalidEmail: "Da fatan za a shigar da ingantaccen adireshin imel",
    userDisabled: "An kashe wannan asusun",
    networkRequestFailed: "Ba a iya haɗawa da uwar garke ba. Da fatan za a duba haɗin intanet ɗinka",
    tooManyRequests: "An yi yunƙurin da bai yi nasara ba sau da yawa. Da fatan za a sake gwadawa daga baya",
    missingVerificationCode: "Da fatan za a shigar da lambar tabbatarwa",
    emailAlreadyInUse: "Akwai asusun da ke amfani da wannan imel",
    invalidCredential: "Bayanan shiga da aka bayar ba su da inganci.",
    weakPassword: "Kalmar sirri ya kamata ta kasance aƙalla haruffa 6",
    unverifiedEmail: "Da fatan za a tabbatar da adireshin imel ɗinka don ci gaba.",
    operationNotAllowed: "Ba a yarda da wannan aikin ba. Da fatan za a tuntuɓi tallafi.",
    invalidPhoneNumber: "Lambar waya ba ta da inganci",
    missingPhoneNumber: "Da fatan za a samar da lambar waya",
    quotaExceeded: "An wuce adadin SMS. Da fatan za a sake gwadawa daga baya",
    codeExpired: "Lambar tabbatarwa ta ƙare",
    captchaCheckFailed: "Tabbatar da reCAPTCHA ya kasa. Da fatan za a sake gwadawa.",
    missingVerificationId: "Da fatan za a fara kammala tabbatar da reCAPTCHA.",
    missingEmail: "Da fatan za a samar da adireshin imel",
    invalidActionCode: "Hanyar sake saita kalmar sirri ba ta da inganci ko ta ƙare",
    credentialAlreadyInUse: "Akwai asusun da ke amfani da wannan imel. Da fatan za a shiga da wannan asusun.",
    requiresRecentLogin: "Wannan aikin yana buƙatar shiga kwanan nan. Da fatan za a sake shiga.",
    providerAlreadyLinked: "An riga an haɗa wannan lambar waya da wani asusu",
    invalidVerificationCode: "Lambar tabbatarwa ba ta da inganci. Da fatan za a sake gwadawa",
    unknownError: "An sami kuskure da ba a zata ba",
    popupClosed: "An rufe taga shiga. Da fatan za a sake gwadawa.",
    accountExistsWithDifferentCredential:
      "Akwai asusun da ke amfani da wannan imel. Da fatan za a shiga da mai samarwa na asali.",
    displayNameRequired: "Da fatan za a samar da sunan nuni",
    secondFactorAlreadyInUse: "An riga an yi rajistar wannan lambar waya da wannan asusun.",
  },
  messages: {
    passwordResetEmailSent: "An aika imel ɗin sake saita kalmar sirri cikin nasara",
    signInLinkSent: "An aika hanyar shiga cikin nasara",
    verificationCodeFirst: "Da fatan za a fara neman lambar tabbatarwa",
    checkEmailForReset: "Duba imel ɗinka don umarnin sake saita kalmar sirri",
    dividerOr: "ko",
    termsAndPrivacy: "Ta hanyar ci gaba, kun yarda da {tos} da {privacy} ɗinmu.",
    mfaSmsAssertionPrompt: "Za a aika lambar tabbatarwa zuwa {phoneNumber} don kammala aikin tabbatarwa.",
  },
  labels: {
    emailAddress: "Adireshin Imel",
    password: "Kalmar Sirri",
    displayName: "Sunan Nuni",
    forgotPassword: "Manta Kalmar Sirri?",
    signUp: "Yi Rajista",
    signIn: "Shiga",
    resetPassword: "Sake Saita Kalmar Sirri",
    createAccount: "Ƙirƙiri Asusu",
    backToSignIn: "Koma Shiga",
    signInWithPhone: "Shiga da Waya",
    phoneNumber: "Lambar Waya",
    verificationCode: "Lambar Tabbatarwa",
    sendCode: "Aika Lamba",
    verifyCode: "Tabbatar da Lamba",
    signInWithGoogle: "Shiga da Google",
    signInWithFacebook: "Shiga da Facebook",
    signInWithApple: "Shiga da Apple",
    signInWithMicrosoft: "Shiga da Microsoft",
    signInWithGitHub: "Shiga da GitHub",
    signInWithYahoo: "Shiga da Yahoo",
    signInWithTwitter: "Shiga da X",
    signInWithEmailLink: "Shiga da Hanyar Imel",
    sendSignInLink: "Aika Hanyar Shiga",
    termsOfService: "Sharuddan Sabis",
    privacyPolicy: "Manufar Sirri",
    resendCode: "Sake Aika Lamba",
    sending: "Ana aikawa...",
    dismiss: "Rufe",
    multiFactorEnrollment: "Rajistar Tabbatarwa Fiye da Ɗaya",
    multiFactorAssertion: "Tabbatarwa Fiye da Ɗaya",
    mfaTotpVerification: "Tabbatar da TOTP",
    mfaSmsVerification: "Tabbatar da SMS",
    generateQrCode: "Ƙirƙiri Lambar QR",
  },
  prompts: {
    noAccount: "Ba ku da asusu?",
    haveAccount: "Kuna da asusu?",
    enterEmailToReset: "Shigar da adireshin imel ɗinka don sake saita kalmar sirrinka",
    signInToAccount: "Shiga cikin asusunka",
    smsVerificationPrompt: "Shigar da lambar tabbatarwa da aka aika zuwa lambar wayarka",
    enterDetailsToCreate: "Shigar da bayananka don ƙirƙirar sabon asusu",
    enterPhoneNumber: "Shigar da lambar wayarka",
    enterVerificationCode: "Shigar da lambar tabbatarwa",
    enterEmailForLink: "Shigar da imel ɗinka don karɓar hanyar shiga",
    mfaEnrollmentPrompt: "Zaɓi sabuwar hanyar rajistar tabbatarwa fiye da ɗaya",
    mfaAssertionPrompt: "Da fatan za a kammala aikin tabbatarwa fiye da ɗaya",
    mfaAssertionFactorPrompt: "Da fatan za a zaɓi hanyar tabbatarwa fiye da ɗaya",
    mfaTotpQrCodePrompt: "Duba wannan lambar QR da manhajar tabbatarwa",
    mfaTotpEnrollmentVerificationPrompt: "Ƙara lambar da manhajar tabbatarwa ɗinka ta samar",
  },
} satisfies CompleteTranslationsWithoutLegacy;
