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

export const bsBA = {
  errors: {
    userNotFound: "Nije pronađen nalog s ovom e-mail adresom",
    wrongPassword: "Pogrešna lozinka",
    invalidEmail: "Unesite ispravnu e-mail adresu",
    userDisabled: "Ovaj nalog je onemogućen",
    networkRequestFailed: "Nije moguće povezati se sa serverom. Provjerite internet vezu",
    tooManyRequests: "Previše neuspjelih pokušaja. Pokušajte ponovo kasnije",
    missingVerificationCode: "Unesite kod za verifikaciju",
    emailAlreadyInUse: "Nalog s ovom e-mail adresom već postoji",
    invalidCredential: "Navedeni podaci nisu ispravni.",
    weakPassword: "Lozinka mora imati najmanje 6 znakova",
    unverifiedEmail: "Verifikujte svoju e-mail adresu da biste nastavili.",
    operationNotAllowed: "Ova radnja nije dozvoljena. Obratite se podršci.",
    invalidPhoneNumber: "Broj telefona nije ispravan",
    missingPhoneNumber: "Unesite broj telefona",
    quotaExceeded: "Prekoračen je limit za SMS. Pokušajte ponovo kasnije",
    codeExpired: "Kod za verifikaciju je istekao",
    captchaCheckFailed: "reCAPTCHA verifikacija nije uspjela. Pokušajte ponovo.",
    missingVerificationId: "Prvo završite reCAPTCHA verifikaciju.",
    missingEmail: "Unesite e-mail adresu",
    invalidActionCode: "Link za resetovanje lozinke nije ispravan ili je istekao",
    credentialAlreadyInUse: "Nalog s ovom e-mail adresom već postoji. Prijavite se s tim nalogom.",
    requiresRecentLogin: "Ova radnja zahtijeva nedavnu prijavu. Prijavite se ponovo.",
    providerAlreadyLinked: "Ovaj broj telefona je već povezan s drugim nalogom",
    invalidVerificationCode: "Neispravan kod za verifikaciju. Pokušajte ponovo",
    unknownError: "Došlo je do neočekivane greške",
    popupClosed: "Prozor za prijavu je zatvoren. Pokušajte ponovo.",
    accountExistsWithDifferentCredential:
      "Nalog s ovom e-mail adresom već postoji. Prijavite se putem originalnog pružatelja usluge.",
    displayNameRequired: "Unesite prikazno ime",
    secondFactorAlreadyInUse: "Ovaj broj telefona je već registrovan na ovom nalogu.",
  },
  messages: {
    passwordResetEmailSent: "E-mail za resetovanje lozinke je uspješno poslan",
    signInLinkSent: "Link za prijavu je uspješno poslan",
    verificationCodeFirst: "Prvo zatražite kod za verifikaciju",
    checkEmailForReset: "Provjerite e-mail za upute za resetovanje lozinke",
    dividerOr: "ili",
    termsAndPrivacy: "Nastavkom se slažete s našim {tos} i {privacy}.",
    mfaSmsAssertionPrompt: "Kod za verifikaciju bit će poslan na {phoneNumber} radi završetka autentifikacije.",
  },
  labels: {
    emailAddress: "E-mail adresa",
    password: "Lozinka",
    displayName: "Prikazno ime",
    forgotPassword: "Zaboravili ste lozinku?",
    signUp: "Registracija",
    signIn: "Prijava",
    resetPassword: "Resetuj lozinku",
    createAccount: "Kreiraj nalog",
    backToSignIn: "Nazad na prijavu",
    signInWithPhone: "Prijava telefonom",
    phoneNumber: "Broj telefona",
    verificationCode: "Kod za verifikaciju",
    sendCode: "Pošalji kod",
    verifyCode: "Verifikuj kod",
    signInWithGoogle: "Prijava putem Google",
    signInWithFacebook: "Prijava putem Facebook",
    signInWithApple: "Prijava putem Apple",
    signInWithMicrosoft: "Prijava putem Microsoft",
    signInWithGitHub: "Prijava putem GitHub",
    signInWithYahoo: "Prijava putem Yahoo",
    signInWithTwitter: "Prijava putem X",
    signInWithEmailLink: "Prijava putem e-mail linka",
    sendSignInLink: "Pošalji link za prijavu",
    termsOfService: "Uslovi korištenja",
    privacyPolicy: "Politika privatnosti",
    resendCode: "Ponovo pošalji kod",
    sending: "Slanje...",
    multiFactorEnrollment: "Registracija višefaktorske autentifikacije",
    multiFactorAssertion: "Višefaktorska autentifikacija",
    mfaTotpVerification: "TOTP verifikacija",
    mfaSmsVerification: "SMS verifikacija",
    generateQrCode: "Generiši QR kod",
  },
  prompts: {
    noAccount: "Nemate nalog?",
    haveAccount: "Već imate nalog?",
    enterEmailToReset: "Unesite e-mail adresu da biste resetovali lozinku",
    signInToAccount: "Prijavite se na svoj nalog",
    smsVerificationPrompt: "Unesite kod za verifikaciju poslan na vaš broj telefona",
    enterDetailsToCreate: "Unesite podatke za kreiranje novog naloga",
    enterPhoneNumber: "Unesite broj telefona",
    enterVerificationCode: "Unesite kod za verifikaciju",
    enterEmailForLink: "Unesite e-mail da biste primili link za prijavu",
    mfaEnrollmentPrompt: "Odaberite novi način višefaktorske registracije",
    mfaAssertionPrompt: "Završite proces višefaktorske autentifikacije",
    mfaAssertionFactorPrompt: "Odaberite način višefaktorske autentifikacije",
    mfaTotpQrCodePrompt: "Skenirajte ovaj QR kod aplikacijom za autentifikaciju",
    mfaTotpEnrollmentVerificationPrompt: "Unesite kod koji generiše vaša aplikacija za autentifikaciju",
  },
} satisfies Translations;
