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

/** Swedish SE (sv-SE) translation set. */
export const svSE = {
  errors: {
    userNotFound: "Inget konto hittades med denna e-postadress",
    wrongPassword: "Fel lösenord",
    invalidEmail: "Ange en giltig e-postadress",
    userDisabled: "Det här kontot har inaktiverats",
    networkRequestFailed: "Det går inte att ansluta till servern. Kontrollera din internetanslutning",
    tooManyRequests: "För många misslyckade försök. Försök igen senare",
    missingVerificationCode: "Ange verifieringskoden",
    emailAlreadyInUse: "Det finns redan ett konto med denna e-postadress",
    invalidCredential: "De angivna autentiseringsuppgifterna är ogiltiga.",
    weakPassword: "Lösenordet måste vara minst 6 tecken",
    unverifiedEmail: "Verifiera din e-postadress för att fortsätta.",
    operationNotAllowed: "Den här åtgärden är inte tillåten. Kontakta supporten.",
    invalidPhoneNumber: "Telefonnumret är ogiltigt",
    missingPhoneNumber: "Ange ett telefonnummer",
    quotaExceeded: "SMS-kvoten har överskridits. Försök igen senare",
    codeExpired: "Verifieringskoden har gått ut",
    captchaCheckFailed: "reCAPTCHA-verifiering misslyckades. Försök igen.",
    missingVerificationId: "Slutför reCAPTCHA-verifieringen först.",
    missingEmail: "Ange en e-postadress",
    invalidActionCode: "Länken för lösenordsåterställning är ogiltig eller har gått ut",
    credentialAlreadyInUse: "Det finns redan ett konto med denna e-postadress. Logga in med det kontot.",
    requiresRecentLogin: "Den här åtgärden kräver en nylig inloggning. Logga in igen.",
    providerAlreadyLinked: "Det här telefonnumret är redan länkat till ett annat konto",
    invalidVerificationCode: "Ogiltig verifieringskod. Försök igen",
    unknownError: "Ett oväntat fel uppstod",
    popupClosed: "Inloggningsfönstret stängdes. Försök igen.",
    accountExistsWithDifferentCredential:
      "Det finns redan ett konto med denna e-postadress. Logga in med den ursprungliga leverantören.",
    displayNameRequired: "Ange ett visningsnamn",
    secondFactorAlreadyInUse: "Det här telefonnumret är redan registrerat på det här kontot.",
  },
  messages: {
    passwordResetEmailSent: "E-post för lösenordsåterställning har skickats",
    signInLinkSent: "Inloggningslänk har skickats",
    verificationCodeFirst: "Begär en verifieringskod först",
    checkEmailForReset: "Kontrollera din e-post för instruktioner om lösenordsåterställning",
    dividerOr: "eller",
    termsAndPrivacy: "Genom att fortsätta godkänner du våra {tos} och {privacy}.",
    mfaSmsAssertionPrompt: "En verifieringskod skickas till {phoneNumber} för att slutföra autentiseringsprocessen.",
  },
  labels: {
    emailAddress: "E-postadress",
    password: "Lösenord",
    displayName: "Visningsnamn",
    forgotPassword: "Glömt lösenordet?",
    signUp: "Registrera dig",
    signIn: "Logga in",
    resetPassword: "Återställ lösenord",
    createAccount: "Skapa konto",
    backToSignIn: "Tillbaka till inloggning",
    signInWithPhone: "Logga in med telefon",
    phoneNumber: "Telefonnummer",
    verificationCode: "Verifieringskod",
    sendCode: "Skicka kod",
    verifyCode: "Verifiera kod",
    signInWithGoogle: "Logga in med Google",
    signInWithFacebook: "Logga in med Facebook",
    signInWithApple: "Logga in med Apple",
    signInWithMicrosoft: "Logga in med Microsoft",
    signInWithGitHub: "Logga in med GitHub",
    signInWithYahoo: "Logga in med Yahoo",
    signInWithTwitter: "Logga in med X",
    signInWithEmailLink: "Logga in med e-postlänk",
    signInWithEmail: "Logga in med e-post",
    sendSignInLink: "Skicka inloggningslänk",
    termsOfService: "Användarvillkor",
    privacyPolicy: "Integritetspolicy",
    resendCode: "Skicka kod igen",
    sending: "Skickar...",
    multiFactorEnrollment: "Multifaktorregistrering",
    multiFactorAssertion: "Multifaktorautentisering",
    mfaTotpVerification: "TOTP-verifiering",
    mfaSmsVerification: "SMS-verifiering",
    generateQrCode: "Generera QR-kod",
  },
  prompts: {
    noAccount: "Har du inget konto?",
    haveAccount: "Har du redan ett konto?",
    enterEmailToReset: "Ange din e-postadress för att återställa lösenordet",
    signInToAccount: "Logga in på ditt konto",
    smsVerificationPrompt: "Ange verifieringskoden som skickades till ditt telefonnummer",
    enterDetailsToCreate: "Ange dina uppgifter för att skapa ett nytt konto",
    enterPhoneNumber: "Ange ditt telefonnummer",
    enterVerificationCode: "Ange verifieringskoden",
    enterEmailForLink: "Ange din e-postadress för att få en inloggningslänk",
    mfaEnrollmentPrompt: "Välj en ny metod för multifaktorregistrering",
    mfaAssertionPrompt: "Slutför multifaktorautentiseringsprocessen",
    mfaAssertionFactorPrompt: "Välj en metod för multifaktorautentisering",
    mfaTotpQrCodePrompt: "Skanna den här QR-koden med din autentiseringsapp",
    mfaTotpEnrollmentVerificationPrompt: "Lägg till koden som genereras av din autentiseringsapp",
  },
} satisfies Translations;
