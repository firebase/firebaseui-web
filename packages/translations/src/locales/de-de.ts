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

/** German DE (de-DE) translation set. */
export const deDE = {
  errors: {
    userNotFound: "Kein Konto mit dieser E-Mail-Adresse gefunden",
    wrongPassword: "Falsches Passwort",
    invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein",
    userDisabled: "Dieses Konto wurde deaktiviert",
    networkRequestFailed:
      "Verbindung zum Server nicht möglich. Bitte überprüfe deine Internetverbindung",
    tooManyRequests: "Zu viele fehlgeschlagene Versuche. Bitte versuche es später erneut",
    missingVerificationCode: "Bitte gib den Verifizierungscode ein",
    emailAlreadyInUse: "Es existiert bereits ein Konto mit dieser E-Mail-Adresse",
    invalidCredential: "Die angegebenen Anmeldedaten sind ungültig.",
    weakPassword: "Das Passwort muss mindestens 6 Zeichen lang sein",
    unverifiedEmail: "Bitte bestätige deine E-Mail-Adresse, um fortzufahren.",
    operationNotAllowed: "Diese Operation ist nicht erlaubt. Bitte kontaktiere den Support.",
    invalidPhoneNumber: "Die Telefonnummer ist ungültig",
    missingPhoneNumber: "Bitte gib eine Telefonnummer an",
    quotaExceeded: "SMS-Kontingent überschritten. Bitte versuche es später erneut",
    codeExpired: "Der Verifizierungscode ist abgelaufen",
    captchaCheckFailed: "reCAPTCHA-Überprüfung fehlgeschlagen. Bitte versuche es erneut.",
    missingVerificationId: "Bitte schließe zuerst die reCAPTCHA-Überprüfung ab.",
    missingEmail: "Bitte gib eine E-Mail-Adresse an",
    invalidActionCode: "Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen",
    credentialAlreadyInUse:
      "Es existiert bereits ein Konto mit dieser E-Mail-Adresse. Bitte melde dich mit diesem Konto an.",
    requiresRecentLogin:
      "Diese Operation erfordert eine kürzliche Anmeldung. Bitte melde dich erneut an.",
    providerAlreadyLinked: "Diese Telefonnummer ist bereits mit einem anderen Konto verknüpft",
    invalidVerificationCode: "Ungültiger Verifizierungscode. Bitte versuche es erneut",
    unknownError: "Ein unerwarteter Fehler ist aufgetreten",
    popupClosed: "Das Anmelde-Popup wurde geschlossen. Bitte versuche es erneut.",
    accountExistsWithDifferentCredential:
      "Es existiert bereits ein Konto mit dieser E-Mail-Adresse. Bitte melde dich mit dem ursprünglichen Anbieter an.",
    displayNameRequired: "Bitte gib einen Anzeigenamen an",
    secondFactorAlreadyInUse: "Diese Telefonnummer ist bereits bei diesem Konto registriert.",
  },
  messages: {
    passwordResetEmailSent: "E-Mail zum Zurücksetzen des Passworts erfolgreich gesendet",
    signInLinkSent: "Anmeldelink erfolgreich gesendet",
    verificationCodeFirst: "Bitte fordere zuerst einen Verifizierungscode an",
    checkEmailForReset: "Überprüfe deine E-Mail für Anweisungen zum Zurücksetzen des Passworts",
    dividerOr: "oder",
    termsAndPrivacy: "Durch Fortfahren stimmst du unseren {tos} und {privacy} zu.",
    mfaSmsAssertionPrompt:
      "Ein Verifizierungscode wird an {phoneNumber} gesendet, um den Authentifizierungsprozess abzuschließen.",
  },
  labels: {
    emailAddress: "E-Mail-Adresse",
    password: "Passwort",
    displayName: "Anzeigename",
    forgotPassword: "Passwort vergessen?",
    signUp: "Registrieren",
    signIn: "Anmelden",
    resetPassword: "Passwort zurücksetzen",
    createAccount: "Konto erstellen",
    backToSignIn: "Zurück zur Anmeldung",
    signInWithPhone: "Mit Telefon anmelden",
    phoneNumber: "Telefonnummer",
    verificationCode: "Verifizierungscode",
    sendCode: "Code senden",
    verifyCode: "Code bestätigen",
    signInWithGoogle: "Mit Google anmelden",
    signInWithFacebook: "Mit Facebook anmelden",
    signInWithApple: "Mit Apple anmelden",
    signInWithMicrosoft: "Mit Microsoft anmelden",
    signInWithGitHub: "Mit GitHub anmelden",
    signInWithYahoo: "Mit Yahoo anmelden",
    signInWithTwitter: "Mit X anmelden",
    signInWithEmailLink: "Mit E-Mail-Link anmelden",
    signInWithEmail: "Mit E-Mail anmelden",
    sendSignInLink: "Anmeldelink senden",
    termsOfService: "Nutzungsbedingungen",
    privacyPolicy: "Datenschutzrichtlinie",
    resendCode: "Code erneut senden",
    sending: "Wird gesendet...",
    multiFactorEnrollment: "Multi-Faktor-Registrierung",
    multiFactorAssertion: "Multi-Faktor-Authentifizierung",
    mfaTotpVerification: "TOTP-Verifizierung",
    mfaSmsVerification: "SMS-Verifizierung",
    generateQrCode: "QR-Code generieren",
  },
  prompts: {
    noAccount: "Noch kein Konto?",
    haveAccount: "Bereits ein Konto?",
    enterEmailToReset: "Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen",
    signInToAccount: "Melde dich bei deinem Konto an",
    smsVerificationPrompt: "Gib den Verifizierungscode ein, der an deine Telefonnummer gesendet wurde",
    enterDetailsToCreate: "Gib deine Daten ein, um ein neues Konto zu erstellen",
    enterPhoneNumber: "Gib deine Telefonnummer ein",
    enterVerificationCode: "Gib den Verifizierungscode ein",
    enterEmailForLink: "Gib deine E-Mail-Adresse ein, um einen Anmeldelink zu erhalten",
    mfaEnrollmentPrompt: "Wähle eine neue Multi-Faktor-Registrierungsmethode",
    mfaAssertionPrompt: "Bitte schließe den Multi-Faktor-Authentifizierungsprozess ab",
    mfaAssertionFactorPrompt: "Bitte wähle eine Multi-Faktor-Authentifizierungsmethode",
    mfaTotpQrCodePrompt: "Scanne diesen QR-Code mit deiner Authentifizierungs-App",
    mfaTotpEnrollmentVerificationPrompt: "Füge den von deiner Authentifizierungs-App generierten Code hinzu",
  },
} satisfies Translations;
