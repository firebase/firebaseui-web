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

/** Danish DK (da-DK) translation set. */
export const daDK = {
  errors: {
    userNotFound: "Ingen konto fundet med denne e-mailadresse",
    wrongPassword: "Forkert adgangskode",
    invalidEmail: "Indtast venligst en gyldig e-mailadresse",
    userDisabled: "Denne konto er blevet deaktiveret",
    networkRequestFailed: "Kunne ikke oprette forbindelse til serveren. Kontroller din internetforbindelse",
    tooManyRequests: "For mange mislykkede forsøg. Prøv igen senere",
    missingVerificationCode: "Indtast venligst bekræftelseskoden",
    emailAlreadyInUse: "Der findes allerede en konto med denne e-mail",
    invalidCredential: "De angivne legitimationsoplysninger er ugyldige.",
    weakPassword: "Adgangskoden skal være mindst 6 tegn",
    unverifiedEmail: "Bekræft venligst din e-mailadresse for at fortsætte.",
    operationNotAllowed: "Denne handling er ikke tilladt. Kontakt support.",
    invalidPhoneNumber: "Telefonnummeret er ugyldigt",
    missingPhoneNumber: "Angiv venligst et telefonnummer",
    quotaExceeded: "SMS-kvoten er overskredet. Prøv igen senere",
    codeExpired: "Bekræftelseskoden er udløbet",
    captchaCheckFailed: "reCAPTCHA-bekræftelse mislykkedes. Prøv igen.",
    missingVerificationId: "Gennemfør venligst reCAPTCHA-bekræftelse først.",
    missingEmail: "Angiv venligst en e-mailadresse",
    invalidActionCode: "Linket til nulstilling af adgangskode er ugyldigt eller udløbet",
    credentialAlreadyInUse: "Der findes allerede en konto med denne e-mail. Log ind med den konto.",
    requiresRecentLogin: "Denne handling kræver et nyligt login. Log ind igen.",
    providerAlreadyLinked: "Dette telefonnummer er allerede tilknyttet en anden konto",
    invalidVerificationCode: "Ugyldig bekræftelseskode. Prøv igen",
    unknownError: "Der opstod en uventet fejl",
    popupClosed: "Login-popup'en blev lukket. Prøv igen.",
    accountExistsWithDifferentCredential:
      "Der findes allerede en konto med denne e-mail. Log ind med den originale udbyder.",
    displayNameRequired: "Angiv venligst et visningsnavn",
    secondFactorAlreadyInUse: "Dette telefonnummer er allerede tilmeldt denne konto.",
  },
  messages: {
    passwordResetEmailSent: "E-mail til nulstilling af adgangskode sendt",
    signInLinkSent: "Login-link sendt",
    verificationCodeFirst: "Anmod venligst om en bekræftelseskode først",
    checkEmailForReset: "Tjek din e-mail for instruktioner til nulstilling af adgangskode",
    dividerOr: "eller",
    termsAndPrivacy: "Ved at fortsætte accepterer du vores {tos} og {privacy}.",
    mfaSmsAssertionPrompt: "En bekræftelseskode sendes til {phoneNumber} for at fuldføre godkendelsesprocessen.",
  },
  labels: {
    emailAddress: "E-mailadresse",
    password: "Adgangskode",
    displayName: "Visningsnavn",
    forgotPassword: "Glemt adgangskode?",
    signUp: "Tilmeld dig",
    signIn: "Log ind",
    resetPassword: "Nulstil adgangskode",
    createAccount: "Opret konto",
    backToSignIn: "Tilbage til login",
    signInWithPhone: "Log ind med telefon",
    phoneNumber: "Telefonnummer",
    verificationCode: "Bekræftelseskode",
    sendCode: "Send kode",
    verifyCode: "Bekræft kode",
    signInWithGoogle: "Log ind med Google",
    signInWithFacebook: "Log ind med Facebook",
    signInWithApple: "Log ind med Apple",
    signInWithMicrosoft: "Log ind med Microsoft",
    signInWithGitHub: "Log ind med GitHub",
    signInWithYahoo: "Log ind med Yahoo",
    signInWithTwitter: "Log ind med X",
    signInWithEmailLink: "Log ind med e-maillink",
    signInWithEmail: "Log ind med e-mail",
    sendSignInLink: "Send login-link",
    termsOfService: "Servicevilkår",
    privacyPolicy: "Privatlivspolitik",
    resendCode: "Send kode igen",
    sending: "Sender...",
    multiFactorEnrollment: "Flerfaktorregistrering",
    multiFactorAssertion: "Flerfaktorgodkendelse",
    mfaTotpVerification: "TOTP-bekræftelse",
    mfaSmsVerification: "SMS-bekræftelse",
    generateQrCode: "Generer QR-kode",
  },
  prompts: {
    noAccount: "Har du ikke en konto?",
    haveAccount: "Har du allerede en konto?",
    enterEmailToReset: "Indtast din e-mailadresse for at nulstille din adgangskode",
    signInToAccount: "Log ind på din konto",
    smsVerificationPrompt: "Indtast bekræftelseskoden sendt til dit telefonnummer",
    enterDetailsToCreate: "Indtast dine oplysninger for at oprette en ny konto",
    enterPhoneNumber: "Indtast dit telefonnummer",
    enterVerificationCode: "Indtast bekræftelseskoden",
    enterEmailForLink: "Indtast din e-mail for at modtage et login-link",
    mfaEnrollmentPrompt: "Vælg en ny flerfaktorregistreringsmetode",
    mfaAssertionPrompt: "Gennemfør venligst flerfaktorgodkendelsesprocessen",
    mfaAssertionFactorPrompt: "Vælg venligst en flerfaktorgodkendelsesmetode",
    mfaTotpQrCodePrompt: "Scan denne QR-kode med din godkendelsesapp",
    mfaTotpEnrollmentVerificationPrompt: "Tilføj koden genereret af din godkendelsesapp",
  },
} satisfies Translations;
