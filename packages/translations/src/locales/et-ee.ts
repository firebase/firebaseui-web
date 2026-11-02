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

export const etEE = {
  errors: {
    userNotFound: "Selle e-posti aadressiga kontot ei leitud",
    wrongPassword: "Vale parool",
    invalidEmail: "Palun sisestage kehtiv e-posti aadress",
    userDisabled: "See konto on keelatud",
    networkRequestFailed: "Serveriga ei õnnestu ühendust luua. Kontrollige oma internetiühendust",
    tooManyRequests: "Liiga palju ebaõnnestunud katseid. Proovige hiljem uuesti",
    missingVerificationCode: "Palun sisestage kinnituskood",
    emailAlreadyInUse: "Selle e-posti aadressiga on juba konto",
    invalidCredential: "Esitatud andmed on kehtetud.",
    weakPassword: "Parool peab olema vähemalt 6 märki pikk",
    unverifiedEmail: "Jätkamiseks kinnitage oma e-posti aadress.",
    operationNotAllowed: "Seda toimingut ei lubata. Võtke ühendust toega.",
    invalidPhoneNumber: "Telefoninumber on vale",
    missingPhoneNumber: "Palun sisestage telefoninumber",
    quotaExceeded: "SMS-ide limiit on ületatud. Proovige hiljem uuesti",
    codeExpired: "Kinnituskoodi kehtivus on aegunud",
    captchaCheckFailed: "reCAPTCHA kinnitamine ebaõnnestus. Proovige uuesti.",
    missingVerificationId: "Palun täitke esmalt reCAPTCHA kinnitamine.",
    missingEmail: "Palun sisestage e-posti aadress",
    invalidActionCode: "Parooli lähtestamise link on vale või aegunud",
    credentialAlreadyInUse: "Selle e-posti aadressiga on juba konto. Logige sisse selle kontoga.",
    requiresRecentLogin: "See toiming nõuab värskelt sisselogimist. Logige palun uuesti sisse.",
    providerAlreadyLinked: "See telefoninumber on juba seotud teise kontoga",
    invalidVerificationCode: "Vale kinnituskood. Proovige uuesti",
    unknownError: "Ilmnes ootamatu viga",
    popupClosed: "Sisselogimise aken suleti. Proovige uuesti.",
    accountExistsWithDifferentCredential:
      "Selle e-posti aadressiga on juba konto. Logige sisse algse teenusepakkujaga.",
    displayNameRequired: "Palun sisestage kuvatav nimi",
    secondFactorAlreadyInUse: "See telefoninumber on sellele kontole juba registreeritud.",
  },
  messages: {
    passwordResetEmailSent: "Parooli lähtestamise e-kiri saadeti edukalt",
    signInLinkSent: "Sisselogimise link saadeti edukalt",
    verificationCodeFirst: "Palun taotlege esmalt kinnituskood",
    checkEmailForReset: "Parooli lähtestamise juhiste leidmiseks vaadake oma e-posti",
    dividerOr: "või",
    termsAndPrivacy: "Jätkates nõustute meie {tos} ja {privacy}.",
    mfaSmsAssertionPrompt: "Autentimisprotsessi lõpuleviimiseks saadetakse kinnituskood numbrile {phoneNumber}.",
  },
  labels: {
    emailAddress: "E-posti aadress",
    password: "Parool",
    displayName: "Kuvatav nimi",
    forgotPassword: "Unustasid parooli?",
    signUp: "Registreeru",
    signIn: "Logi sisse",
    resetPassword: "Lähtesta parool",
    createAccount: "Loo konto",
    backToSignIn: "Tagasi sisselogimise juurde",
    signInWithPhone: "Logi sisse telefoniga",
    phoneNumber: "Telefoninumber",
    verificationCode: "Kinnituskood",
    sendCode: "Saada kood",
    verifyCode: "Kinnita kood",
    signInWithGoogle: "Logi sisse Google'iga",
    signInWithFacebook: "Logi sisse Facebookiga",
    signInWithApple: "Logi sisse Apple'iga",
    signInWithMicrosoft: "Logi sisse Microsoftiga",
    signInWithGitHub: "Logi sisse GitHubiga",
    signInWithYahoo: "Logi sisse Yahooga",
    signInWithTwitter: "Logi sisse X-iga",
    signInWithEmailLink: "Logi sisse e-posti lingiga",
    sendSignInLink: "Saada sisselogimise link",
    termsOfService: "Kasutustingimused",
    privacyPolicy: "Privaatsuspoliitika",
    resendCode: "Saada kood uuesti",
    sending: "Saatmine...",
    multiFactorEnrollment: "Mitmefaktorilise autentimise registreerimine",
    multiFactorAssertion: "Mitmefaktoriline autentimine",
    mfaTotpVerification: "TOTP kinnitamine",
    mfaSmsVerification: "SMS kinnitamine",
    generateQrCode: "Loo QR-kood",
  },
  prompts: {
    noAccount: "Pole kontot?",
    haveAccount: "Kas teil on juba konto?",
    enterEmailToReset: "Parooli lähtestamiseks sisestage oma e-posti aadress",
    signInToAccount: "Logige oma kontole sisse",
    smsVerificationPrompt: "Sisestage oma telefoninumbrile saadetud kinnituskood",
    enterDetailsToCreate: "Uue konto loomiseks sisestage oma andmed",
    enterPhoneNumber: "Sisestage oma telefoninumber",
    enterVerificationCode: "Sisestage kinnituskood",
    enterEmailForLink: "Sisselogimise lingi saamiseks sisestage oma e-posti aadress",
    mfaEnrollmentPrompt: "Valige uus mitmefaktorilise registreerimise meetod",
    mfaAssertionPrompt: "Palun lõpetage mitmefaktoriline autentimine",
    mfaAssertionFactorPrompt: "Palun valige mitmefaktoriline autentimismeetod",
    mfaTotpQrCodePrompt: "Skannige see QR-kood oma autentimisrakendusega",
    mfaTotpEnrollmentVerificationPrompt: "Lisage autentimisrakenduse genereeritud kood",
  },
} satisfies Translations;
