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

/** Slovenian SI (sl-SI) translation set. */
export const slSI = {
  errors: {
    userNotFound: "Račun s tem e-poštnim naslovom ni bil najden",
    wrongPassword: "Napačno geslo",
    invalidEmail: "Vnesite veljavni e-poštni naslov",
    userDisabled: "Ta račun je bil onemogočen",
    networkRequestFailed: "Povezave s strežnikom ni mogoče vzpostaviti. Preverite internetno povezavo",
    tooManyRequests: "Preveč neuspešnih poskusov. Poskusite znova pozneje",
    missingVerificationCode: "Vnesite kodo za preverjanje",
    emailAlreadyInUse: "Račun s tem e-poštnim naslovom že obstaja",
    invalidCredential: "Navedene poverilnice niso veljavne.",
    weakPassword: "Geslo mora imeti vsaj 6 znakov",
    unverifiedEmail: "Preverite e-poštni naslov za nadaljevanje.",
    operationNotAllowed: "To dejanje ni dovoljeno. Stopite v stik s podporo.",
    invalidPhoneNumber: "Telefonska številka ni veljavna",
    missingPhoneNumber: "Vnesite telefonsko številko",
    quotaExceeded: "Kvota SMS je bila prekoračena. Poskusite znova pozneje",
    codeExpired: "Koda za preverjanje je potekla",
    captchaCheckFailed: "Preverjanje reCAPTCHA ni uspelo. Poskusite znova.",
    missingVerificationId: "Najprej dokončajte preverjanje reCAPTCHA.",
    missingEmail: "Vnesite e-poštni naslov",
    invalidActionCode: "Povezava za ponastavitev gesla ni veljavna ali je potekla",
    credentialAlreadyInUse: "Račun s tem e-poštnim naslovom že obstaja. Prijavite se s tem računom.",
    requiresRecentLogin: "To dejanje zahteva nedavno prijavo. Prijavite se znova.",
    providerAlreadyLinked: "Ta telefonska številka je že povezana z drugim računom",
    invalidVerificationCode: "Neveljavna koda za preverjanje. Poskusite znova",
    unknownError: "Prišlo je do nepričakovane napake",
    popupClosed: "Pojavno okno za prijavo je bilo zaprto. Poskusite znova.",
    accountExistsWithDifferentCredential:
      "Račun s tem e-poštnim naslovom že obstaja. Prijavite se pri izvirnem ponudniku.",
    displayNameRequired: "Vnesite prikazano ime",
    secondFactorAlreadyInUse: "Ta telefonska številka je že registrirana pri tem računu.",
  },
  messages: {
    passwordResetEmailSent: "E-poštno sporočilo za ponastavitev gesla je bilo uspešno poslano",
    signInLinkSent: "Povezava za prijavo je bila uspešno poslana",
    verificationCodeFirst: "Najprej zahtevajte kodo za preverjanje",
    checkEmailForReset: "Preverite e-pošto za navodila za ponastavitev gesla",
    dividerOr: "ali",
    termsAndPrivacy: "Z nadaljevanjem se strinjate z našimi {tos} in {privacy}.",
    mfaSmsAssertionPrompt:
      "Na številko {phoneNumber} bo poslana koda za preverjanje za dokončanje postopka preverjanja pristnosti.",
  },
  labels: {
    emailAddress: "E-poštni naslov",
    password: "Geslo",
    displayName: "Prikazano ime",
    forgotPassword: "Ste pozabili geslo?",
    signUp: "Registracija",
    signIn: "Prijava",
    resetPassword: "Ponastavi geslo",
    createAccount: "Ustvari račun",
    backToSignIn: "Nazaj na prijavo",
    signInWithPhone: "Prijava s telefonom",
    phoneNumber: "Telefonska številka",
    verificationCode: "Koda za preverjanje",
    sendCode: "Pošlji kodo",
    verifyCode: "Preveri kodo",
    signInWithGoogle: "Prijava z Googlom",
    signInWithFacebook: "Prijava s Facebookom",
    signInWithApple: "Prijava z Applom",
    signInWithMicrosoft: "Prijava z Microsoftom",
    signInWithGitHub: "Prijava z GitHubom",
    signInWithYahoo: "Prijava z Yahoojem",
    signInWithTwitter: "Prijava z X-om",
    signInWithEmailLink: "Prijava s e-poštno povezavo",
    signInWithEmail: "Prijava z e-pošto",
    sendSignInLink: "Pošlji povezavo za prijavo",
    termsOfService: "Pogoji storitve",
    privacyPolicy: "Pravilnik o zasebnosti",
    resendCode: "Znova pošlji kodo",
    sending: "Pošiljanje...",
    multiFactorEnrollment: "Večfaktorska registracija",
    multiFactorAssertion: "Večfaktorska preverjanje pristnosti",
    mfaTotpVerification: "Preverjanje TOTP",
    mfaSmsVerification: "Preverjanje SMS",
    generateQrCode: "Ustvari kodo QR",
  },
  prompts: {
    noAccount: "Nimate računa?",
    haveAccount: "Že imate račun?",
    enterEmailToReset: "Vnesite e-poštni naslov za ponastavitev gesla",
    signInToAccount: "Prijavite se v svoj račun",
    smsVerificationPrompt: "Vnesite kodo za preverjanje, poslano na vašo telefonsko številko",
    enterDetailsToCreate: "Vnesite svoje podatke za ustvarjanje novega računa",
    enterPhoneNumber: "Vnesite svojo telefonsko številko",
    enterVerificationCode: "Vnesite kodo za preverjanje",
    enterEmailForLink: "Vnesite svojo e-pošto za prejem povezave za prijavo",
    mfaEnrollmentPrompt: "Izberite novo metodo večfaktorske registracije",
    mfaAssertionPrompt: "Dokončajte postopek večfaktorskega preverjanja pristnosti",
    mfaAssertionFactorPrompt: "Izberite metodo večfaktorskega preverjanja pristnosti",
    mfaTotpQrCodePrompt: "Skenirajte to kodo QR z aplikacijo za preverjanje pristnosti",
    mfaTotpEnrollmentVerificationPrompt: "Dodajte kodo, ki jo je ustvarila vaša aplikacija za preverjanje pristnosti",
  },
} satisfies Translations;
