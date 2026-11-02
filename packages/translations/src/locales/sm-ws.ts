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

export const smWS = {
  errors: {
    userNotFound: "Leai se tala o loo i ai lenei tuatusi o imeli",
    wrongPassword: "Upu faalilolilo sese",
    invalidEmail: "Faamolemole tusi se tuatusi o imeli aoga",
    userDisabled: "Ua faasaina lenei tala",
    networkRequestFailed: "E le mafai ona fesootai ma le server. Faamolemole siaki lou feso'ota'iga initaneti",
    tooManyRequests: "Ua tele taumafaiga ua le manuia. Faamolemole toe taumafai mulimuli ane",
    missingVerificationCode: "Faamolemole tusi le code faamaonia",
    emailAlreadyInUse: "Ua i ai se tala ma lenei imeli",
    invalidCredential: "O faamaoniga na tuuina atu e le aoga.",
    weakPassword: "E tatau ona i ai ni mataitusi e 6 i le upu faalilolilo",
    unverifiedEmail: "Faamolemole faamaonia lou tuatusi o imeli e faaauau ai.",
    operationNotAllowed: "E le faatagaina lenei galuega. Faamolemole fesootai ma le lagolago.",
    invalidPhoneNumber: "E le aoga le numera o le telefoni",
    missingPhoneNumber: "Faamolemole tuu se numera o telefoni",
    quotaExceeded: "Ua uma le quota o SMS. Faamolemole toe taumafai mulimuli ane",
    codeExpired: "Ua pau le aso o le code faamaonia",
    captchaCheckFailed: "Ua le manuia le faamaonia o le reCAPTCHA. Faamolemole toe taumafai.",
    missingVerificationId: "Faamolemole faataunuu muamua le faamaonia o le reCAPTCHA.",
    missingEmail: "Faamolemole tuu se tuatusi o imeli",
    invalidActionCode: "E le aoga le sootaga toe setiina le upu faalilolilo, pe ua pau le aso",
    credentialAlreadyInUse: "Ua i ai se tala ma lenei imeli. Faamolemole sainia ma lena tala.",
    requiresRecentLogin: "Lenei galuega e manaomia ai se login talu ai. Faamolemole sainia toe.",
    providerAlreadyLinked: "Ua fesootai lenei numera o telefoni ma se isi tala",
    invalidVerificationCode: "E le aoga le code faamaonia. Faamolemole toe taumafai",
    unknownError: "Na tupu se mea le faamoemoeina",
    popupClosed: "Ua tapunia le faamaulalo o le sainia. Faamolemole toe taumafai.",
    accountExistsWithDifferentCredential:
      "Ua i ai se tala ma lenei imeli. Faamolemole sainia ma le tagata tuuina atu muamua.",
    displayNameRequired: "Faamolemole tuu se igoa e faaalia",
    secondFactorAlreadyInUse: "Ua resitala lenei numera o telefoni i lenei tala.",
  },
  messages: {
    passwordResetEmailSent: "Ua lafoina manuia le imeli e toe setiina ai le upu faalilolilo",
    signInLinkSent: "Ua lafoina manuia le sootaga e sainia ai",
    verificationCodeFirst: "Faamolemole talosaga muamua se code faamaonia",
    checkEmailForReset: "Siaki lou imeli mo faatonuga e toe setiina ai le upu faalilolilo",
    dividerOr: "pe",
    termsAndPrivacy: "A faaauau, e te ioe i a matou {tos} ma {privacy}.",
    mfaSmsAssertionPrompt: "O le a lafoina se code faamaonia i le {phoneNumber} e faamaeaina ai le faamaoniga.",
  },
  labels: {
    emailAddress: "Tuatusi o Imeli",
    password: "Upu Faalilolilo",
    displayName: "Igoa e Faaalia",
    forgotPassword: "Ua galo le upu faalilolilo?",
    signUp: "Resitala",
    signIn: "Sainia",
    resetPassword: "Toe Setiina le Upu Faalilolilo",
    createAccount: "Fausia se Talaaga",
    backToSignIn: "Toe i le Sainia",
    signInWithPhone: "Sainia ma le Telefoni",
    phoneNumber: "Numera o le Telefoni",
    verificationCode: "Code Faamaonia",
    sendCode: "Lafo le Code",
    verifyCode: "Faamaonia le Code",
    signInWithGoogle: "Sainia ma Google",
    signInWithFacebook: "Sainia ma Facebook",
    signInWithApple: "Sainia ma Apple",
    signInWithMicrosoft: "Sainia ma Microsoft",
    signInWithGitHub: "Sainia ma GitHub",
    signInWithYahoo: "Sainia ma Yahoo",
    signInWithTwitter: "Sainia ma X",
    signInWithEmailLink: "Sainia ma le Sootaga o Imeli",
    sendSignInLink: "Lafo le Sootaga e Sainia ai",
    termsOfService: "Tulafono o le Auaunaga",
    privacyPolicy: "Faiga o le Filemu",
    resendCode: "Toe Lafo le Code",
    sending: "Ua lafoina...",
    multiFactorEnrollment: "Resitala o le Faamaoniga Tele",
    multiFactorAssertion: "Faamaoniga Tele",
    mfaTotpVerification: "Faamaonia TOTP",
    mfaSmsVerification: "Faamaonia SMS",
    generateQrCode: "Faia le QR Code",
  },
  prompts: {
    noAccount: "E leai sau tala?",
    haveAccount: "Ua i ai sau tala?",
    enterEmailToReset: "Tusi lou tuatusi o imeli e toe setiina ai lou upu faalilolilo",
    signInToAccount: "Sainia i lou tala",
    smsVerificationPrompt: "Tusi le code faamaonia ua lafoina i lou numera o telefoni",
    enterDetailsToCreate: "Tusi ou faamatalaga e fausia ai se talaaga fou",
    enterPhoneNumber: "Tusi lou numera o telefoni",
    enterVerificationCode: "Tusi le code faamaonia",
    enterEmailForLink: "Tusi lou imeli e maua ai le sootaga e sainia ai",
    mfaEnrollmentPrompt: "Filifili se auala fou o le resitala o le faamaoniga tele",
    mfaAssertionPrompt: "Faamolemole faamae le faagaioiga o le faamaoniga tele",
    mfaAssertionFactorPrompt: "Faamolemole filifili se auala o le faamaoniga tele",
    mfaTotpQrCodePrompt: "Scan lenei QR code ma lau polokalame faamaonia",
    mfaTotpEnrollmentVerificationPrompt: "Faaopoopo le code na faia e lau polokalame faamaonia",
  },
} satisfies Translations;
