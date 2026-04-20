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

/** Norwegian Bokmål NO (nb-NO) translation set. */
export const nbNO = {
  errors: {
    userNotFound: "Ingen konto funnet med denne e-postadressen",
    wrongPassword: "Feil passord",
    invalidEmail: "Vennligst skriv inn en gyldig e-postadresse",
    userDisabled: "Denne kontoen har blitt deaktivert",
    networkRequestFailed: "Kunne ikke koble til serveren. Sjekk internettforbindelsen din",
    tooManyRequests: "For mange mislykkede forsøk. Prøv igjen senere",
    missingVerificationCode: "Vennligst skriv inn bekreftelseskoden",
    emailAlreadyInUse: "Det finnes allerede en konto med denne e-posten",
    invalidCredential: "De oppgitte legitimasjonene er ugyldige.",
    weakPassword: "Passordet må være minst 6 tegn",
    unverifiedEmail: "Vennligst bekreft e-postadressen din for å fortsette.",
    operationNotAllowed: "Denne operasjonen er ikke tillatt. Kontakt support.",
    invalidPhoneNumber: "Telefonnummeret er ugyldig",
    missingPhoneNumber: "Vennligst oppgi et telefonnummer",
    quotaExceeded: "SMS-kvoten er overskredet. Prøv igjen senere",
    codeExpired: "Bekreftelseskoden har utløpt",
    captchaCheckFailed: "reCAPTCHA-verifisering mislyktes. Prøv igjen.",
    missingVerificationId: "Fullfør reCAPTCHA-verifiseringen først.",
    missingEmail: "Vennligst oppgi en e-postadresse",
    invalidActionCode: "Lenken for tilbakestilling av passord er ugyldig eller har utløpt",
    credentialAlreadyInUse: "Det finnes allerede en konto med denne e-posten. Logg inn med den kontoen.",
    requiresRecentLogin: "Denne operasjonen krever nylig innlogging. Logg inn igjen.",
    providerAlreadyLinked: "Dette telefonnummeret er allerede koblet til en annen konto",
    invalidVerificationCode: "Ugyldig bekreftelseskode. Prøv igjen",
    unknownError: "En uventet feil oppstod",
    popupClosed: "Innloggingsvinduet ble lukket. Prøv igjen.",
    accountExistsWithDifferentCredential:
      "Det finnes allerede en konto med denne e-posten. Logg inn med den opprinnelige leverandøren.",
    displayNameRequired: "Vennligst oppgi et visningsnavn",
    secondFactorAlreadyInUse: "Dette telefonnummeret er allerede registrert på denne kontoen.",
  },
  messages: {
    passwordResetEmailSent: "E-post for tilbakestilling av passord ble sendt",
    signInLinkSent: "Innloggingslenke ble sendt",
    verificationCodeFirst: "Vennligst be om en bekreftelseskode først",
    checkEmailForReset: "Sjekk e-posten din for instruksjoner om tilbakestilling av passord",
    dividerOr: "eller",
    termsAndPrivacy: "Ved å fortsette godtar du våre {tos} og {privacy}.",
    mfaSmsAssertionPrompt:
      "En bekreftelseskode vil bli sendt til {phoneNumber} for å fullføre autentiseringsprosessen.",
  },
  labels: {
    emailAddress: "E-postadresse",
    password: "Passord",
    displayName: "Visningsnavn",
    forgotPassword: "Glemt passord?",
    signUp: "Registrer deg",
    signIn: "Logg inn",
    resetPassword: "Tilbakestill passord",
    createAccount: "Opprett konto",
    backToSignIn: "Tilbake til innlogging",
    signInWithPhone: "Logg inn med telefon",
    phoneNumber: "Telefonnummer",
    verificationCode: "Bekreftelseskode",
    sendCode: "Send kode",
    verifyCode: "Bekreft kode",
    signInWithGoogle: "Logg inn med Google",
    signInWithFacebook: "Logg inn med Facebook",
    signInWithApple: "Logg inn med Apple",
    signInWithMicrosoft: "Logg inn med Microsoft",
    signInWithGitHub: "Logg inn med GitHub",
    signInWithYahoo: "Logg inn med Yahoo",
    signInWithTwitter: "Logg inn med X",
    signInWithEmailLink: "Logg inn med e-postlenke",
    signInWithEmail: "Logg inn med e-post",
    sendSignInLink: "Send innloggingslenke",
    termsOfService: "Vilkår for bruk",
    privacyPolicy: "Personvernerklæring",
    resendCode: "Send kode på nytt",
    sending: "Sender...",
    multiFactorEnrollment: "Flerfaktorregistrering",
    multiFactorAssertion: "Flerfaktorautentisering",
    mfaTotpVerification: "TOTP-bekreftelse",
    mfaSmsVerification: "SMS-bekreftelse",
    generateQrCode: "Generer QR-kode",
  },
  prompts: {
    noAccount: "Har du ikke en konto?",
    haveAccount: "Har du allerede en konto?",
    enterEmailToReset: "Skriv inn e-postadressen din for å tilbakestille passordet",
    signInToAccount: "Logg inn på kontoen din",
    smsVerificationPrompt: "Skriv inn bekreftelseskoden som ble sendt til telefonnummeret ditt",
    enterDetailsToCreate: "Skriv inn opplysningene dine for å opprette en ny konto",
    enterPhoneNumber: "Skriv inn telefonnummeret ditt",
    enterVerificationCode: "Skriv inn bekreftelseskoden",
    enterEmailForLink: "Skriv inn e-postadressen din for å motta en innloggingslenke",
    mfaEnrollmentPrompt: "Velg en ny flerfaktorregistreringsmetode",
    mfaAssertionPrompt: "Fullfør flerfaktorautentiseringsprosessen",
    mfaAssertionFactorPrompt: "Velg en flerfaktorautentiseringsmetode",
    mfaTotpQrCodePrompt: "Skann denne QR-koden med autentiseringsappen din",
    mfaTotpEnrollmentVerificationPrompt: "Legg til koden generert av autentiseringsappen din",
  },
} satisfies Translations;
