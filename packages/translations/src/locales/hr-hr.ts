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

/** Croatian HR (hr-HR) translation set. */
export const hrHR = {
  errors: {
    userNotFound: "Nije pronađen račun s ovom adresom e-pošte",
    wrongPassword: "Pogrešna lozinka",
    invalidEmail: "Unesite valjanu adresu e-pošte",
    userDisabled: "Ovaj račun je onemogućen",
    networkRequestFailed: "Nije moguće povezati se s poslužiteljem. Provjerite internetsku vezu",
    tooManyRequests: "Previše neuspjelih pokušaja. Pokušajte ponovo kasnije",
    missingVerificationCode: "Unesite kôd za potvrdu",
    emailAlreadyInUse: "Račun s ovom e-poštom već postoji",
    invalidCredential: "Navedeni podaci za prijavu nisu valjani.",
    weakPassword: "Lozinka mora imati najmanje 6 znakova",
    unverifiedEmail: "Potvrdite svoju adresu e-pošte za nastavak.",
    operationNotAllowed: "Ova operacija nije dopuštena. Kontaktirajte podršku.",
    invalidPhoneNumber: "Broj telefona nije valjan",
    missingPhoneNumber: "Unesite broj telefona",
    quotaExceeded: "Kvota SMS-a je prekoračena. Pokušajte ponovo kasnije",
    codeExpired: "Kôd za potvrdu je istekao",
    captchaCheckFailed: "Provjera reCAPTCHA nije uspjela. Pokušajte ponovo.",
    missingVerificationId: "Prvo dovršite reCAPTCHA provjeru.",
    missingEmail: "Unesite adresu e-pošte",
    invalidActionCode: "Veza za poništavanje lozinke nije valjana ili je istekla",
    credentialAlreadyInUse: "Račun s ovom e-poštom već postoji. Prijavite se s tim računom.",
    requiresRecentLogin: "Ova operacija zahtijeva nedavnu prijavu. Prijavite se ponovo.",
    providerAlreadyLinked: "Ovaj broj telefona je već povezan s drugim računom",
    invalidVerificationCode: "Nevaljani kôd za potvrdu. Pokušajte ponovo",
    unknownError: "Došlo je do neočekivane pogreške",
    popupClosed: "Skočni prozor za prijavu je zatvoren. Pokušajte ponovo.",
    accountExistsWithDifferentCredential: "Račun s ovom e-poštom već postoji. Prijavite se s originalnim pružateljem.",
    displayNameRequired: "Unesite ime za prikaz",
    secondFactorAlreadyInUse: "Ovaj broj telefona je već registriran na ovom računu.",
  },
  messages: {
    passwordResetEmailSent: "E-pošta za poništavanje lozinke uspješno je poslana",
    signInLinkSent: "Veza za prijavu uspješno je poslana",
    verificationCodeFirst: "Prvo zatražite kôd za potvrdu",
    checkEmailForReset: "Provjerite e-poštu za upute za poništavanje lozinke",
    dividerOr: "ili",
    termsAndPrivacy: "Nastavkom prihvaćate naše {tos} i {privacy}.",
    mfaSmsAssertionPrompt: "Kôd za potvrdu bit će poslan na {phoneNumber} za dovršetak procesa autentifikacije.",
  },
  labels: {
    emailAddress: "Adresa e-pošte",
    password: "Lozinka",
    displayName: "Ime za prikaz",
    forgotPassword: "Zaboravili ste lozinku?",
    signUp: "Registracija",
    signIn: "Prijava",
    resetPassword: "Poništi lozinku",
    createAccount: "Stvori račun",
    backToSignIn: "Natrag na prijavu",
    signInWithPhone: "Prijava telefonom",
    phoneNumber: "Broj telefona",
    verificationCode: "Kôd za potvrdu",
    sendCode: "Pošalji kôd",
    verifyCode: "Potvrdi kôd",
    signInWithGoogle: "Prijava s Googleom",
    signInWithFacebook: "Prijava s Facebookom",
    signInWithApple: "Prijava s Appleom",
    signInWithMicrosoft: "Prijava s Microsoftom",
    signInWithGitHub: "Prijava s GitHubom",
    signInWithYahoo: "Prijava s Yahooom",
    signInWithTwitter: "Prijava s X-om",
    signInWithEmailLink: "Prijava vezom e-pošte",
    signInWithEmail: "Prijava e-poštom",
    sendSignInLink: "Pošalji vezu za prijavu",
    termsOfService: "Uvjeti usluge",
    privacyPolicy: "Pravila o privatnosti",
    resendCode: "Pošalji kôd ponovo",
    sending: "Slanje...",
    multiFactorEnrollment: "Višefaktorska registracija",
    multiFactorAssertion: "Višefaktorska autentifikacija",
    mfaTotpVerification: "TOTP provjera",
    mfaSmsVerification: "SMS provjera",
    generateQrCode: "Generiraj QR kôd",
  },
  prompts: {
    noAccount: "Nemate račun?",
    haveAccount: "Već imate račun?",
    enterEmailToReset: "Unesite svoju adresu e-pošte za poništavanje lozinke",
    signInToAccount: "Prijavite se na svoj račun",
    smsVerificationPrompt: "Unesite kôd za potvrdu poslan na vaš broj telefona",
    enterDetailsToCreate: "Unesite svoje podatke za stvaranje novog računa",
    enterPhoneNumber: "Unesite svoj broj telefona",
    enterVerificationCode: "Unesite kôd za potvrdu",
    enterEmailForLink: "Unesite svoju e-poštu za primanje veze za prijavu",
    mfaEnrollmentPrompt: "Odaberite novu metodu višefaktorske registracije",
    mfaAssertionPrompt: "Dovršite proces višefaktorske autentifikacije",
    mfaAssertionFactorPrompt: "Odaberite metodu višefaktorske autentifikacije",
    mfaTotpQrCodePrompt: "Skenirajte ovaj QR kôd svojom aplikacijom za autentifikaciju",
    mfaTotpEnrollmentVerificationPrompt: "Dodajte kôd koji je generirala vaša aplikacija za autentifikaciju",
  },
} satisfies Translations;
