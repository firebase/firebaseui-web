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

/** Dutch NL (nl-NL) translation set. */
export const nlNL = {
  errors: {
    userNotFound: "Geen account gevonden met dit e-mailadres",
    wrongPassword: "Onjuist wachtwoord",
    invalidEmail: "Voer een geldig e-mailadres in",
    userDisabled: "Dit account is uitgeschakeld",
    networkRequestFailed: "Kan geen verbinding maken met de server. Controleer uw internetverbinding",
    tooManyRequests: "Te veel mislukte pogingen. Probeer het later opnieuw",
    missingVerificationCode: "Voer de verificatiecode in",
    emailAlreadyInUse: "Er bestaat al een account met dit e-mailadres",
    invalidCredential: "De opgegeven inloggegevens zijn ongeldig.",
    weakPassword: "Het wachtwoord moet minimaal 6 tekens bevatten",
    unverifiedEmail: "Bevestig uw e-mailadres om door te gaan.",
    operationNotAllowed: "Deze bewerking is niet toegestaan. Neem contact op met de ondersteuning.",
    invalidPhoneNumber: "Het telefoonnummer is ongeldig",
    missingPhoneNumber: "Geef een telefoonnummer op",
    quotaExceeded: "SMS-quotum overschreden. Probeer het later opnieuw",
    codeExpired: "De verificatiecode is verlopen",
    captchaCheckFailed: "reCAPTCHA-verificatie mislukt. Probeer het opnieuw.",
    missingVerificationId: "Voltooi eerst de reCAPTCHA-verificatie.",
    missingEmail: "Geef een e-mailadres op",
    invalidActionCode: "De koppeling voor het opnieuw instellen van het wachtwoord is ongeldig of verlopen",
    credentialAlreadyInUse: "Er bestaat al een account met dit e-mailadres. Meld u aan met dat account.",
    requiresRecentLogin: "Voor deze bewerking is een recente aanmelding vereist. Meld u opnieuw aan.",
    providerAlreadyLinked: "Dit telefoonnummer is al gekoppeld aan een ander account",
    invalidVerificationCode: "Ongeldige verificatiecode. Probeer het opnieuw",
    unknownError: "Er is een onverwachte fout opgetreden",
    popupClosed: "Het aanmeldingsvenster is gesloten. Probeer het opnieuw.",
    accountExistsWithDifferentCredential:
      "Er bestaat al een account met dit e-mailadres. Meld u aan bij de oorspronkelijke provider.",
    displayNameRequired: "Geef een weergavenaam op",
    secondFactorAlreadyInUse: "Dit telefoonnummer is al geregistreerd bij dit account.",
  },
  messages: {
    passwordResetEmailSent: "E-mail voor wachtwoordherstel succesvol verzonden",
    signInLinkSent: "Aanmeldingskoppeling succesvol verzonden",
    verificationCodeFirst: "Vraag eerst een verificatiecode aan",
    checkEmailForReset: "Controleer uw e-mail voor instructies voor wachtwoordherstel",
    dividerOr: "of",
    termsAndPrivacy: "Door verder te gaan, gaat u akkoord met onze {tos} en {privacy}.",
    mfaSmsAssertionPrompt:
      "Er wordt een verificatiecode naar {phoneNumber} gestuurd om het authenticatieproces te voltooien.",
  },
  labels: {
    emailAddress: "E-mailadres",
    password: "Wachtwoord",
    displayName: "Weergavenaam",
    forgotPassword: "Wachtwoord vergeten?",
    signUp: "Aanmelden",
    signIn: "Inloggen",
    resetPassword: "Wachtwoord opnieuw instellen",
    createAccount: "Account aanmaken",
    backToSignIn: "Terug naar inloggen",
    signInWithPhone: "Inloggen met telefoon",
    phoneNumber: "Telefoonnummer",
    verificationCode: "Verificatiecode",
    sendCode: "Code verzenden",
    verifyCode: "Code verifiëren",
    signInWithGoogle: "Inloggen met Google",
    signInWithFacebook: "Inloggen met Facebook",
    signInWithApple: "Inloggen met Apple",
    signInWithMicrosoft: "Inloggen met Microsoft",
    signInWithGitHub: "Inloggen met GitHub",
    signInWithYahoo: "Inloggen met Yahoo",
    signInWithTwitter: "Inloggen met X",
    signInWithEmailLink: "Inloggen met e-mailkoppeling",
    signInWithEmail: "Inloggen met e-mail",
    sendSignInLink: "Aanmeldingskoppeling verzenden",
    termsOfService: "Servicevoorwaarden",
    privacyPolicy: "Privacybeleid",
    resendCode: "Code opnieuw verzenden",
    sending: "Verzenden...",
    multiFactorEnrollment: "Meerfactorinschrijving",
    multiFactorAssertion: "Meerfactorauthenticatie",
    mfaTotpVerification: "TOTP-verificatie",
    mfaSmsVerification: "SMS-verificatie",
    generateQrCode: "QR-code genereren",
  },
  prompts: {
    noAccount: "Geen account?",
    haveAccount: "Al een account?",
    enterEmailToReset: "Voer uw e-mailadres in om uw wachtwoord opnieuw in te stellen",
    signInToAccount: "Meld u aan bij uw account",
    smsVerificationPrompt: "Voer de verificatiecode in die naar uw telefoonnummer is verzonden",
    enterDetailsToCreate: "Voer uw gegevens in om een nieuw account aan te maken",
    enterPhoneNumber: "Voer uw telefoonnummer in",
    enterVerificationCode: "Voer de verificatiecode in",
    enterEmailForLink: "Voer uw e-mailadres in om een aanmeldingskoppeling te ontvangen",
    mfaEnrollmentPrompt: "Selecteer een nieuwe meerfactorinschrijvingsmethode",
    mfaAssertionPrompt: "Voltooi het meerfactorauthenticatieproces",
    mfaAssertionFactorPrompt: "Kies een meerfactorauthenticatiemethode",
    mfaTotpQrCodePrompt: "Scan deze QR-code met uw authenticator-app",
    mfaTotpEnrollmentVerificationPrompt: "Voeg de code toe die door uw authenticator-app is gegenereerd",
  },
} satisfies Translations;
