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

/** Romanian RO (ro-RO) translation set. */
export const roRO = {
  errors: {
    userNotFound: "Nu a fost găsit niciun cont cu această adresă de e-mail",
    wrongPassword: "Parolă incorectă",
    invalidEmail: "Introduceți o adresă de e-mail validă",
    userDisabled: "Acest cont a fost dezactivat",
    networkRequestFailed: "Nu se poate conecta la server. Verificați conexiunea la internet",
    tooManyRequests: "Prea multe încercări eșuate. Încercați din nou mai târziu",
    missingVerificationCode: "Introduceți codul de verificare",
    emailAlreadyInUse: "Există deja un cont cu acest e-mail",
    invalidCredential: "Acreditările furnizate sunt invalide.",
    weakPassword: "Parola trebuie să aibă cel puțin 6 caractere",
    unverifiedEmail: "Verificați adresa de e-mail pentru a continua.",
    operationNotAllowed: "Această operațiune nu este permisă. Contactați asistența.",
    invalidPhoneNumber: "Numărul de telefon este invalid",
    missingPhoneNumber: "Furnizați un număr de telefon",
    quotaExceeded: "Cota SMS a fost depășită. Încercați din nou mai târziu",
    codeExpired: "Codul de verificare a expirat",
    captchaCheckFailed: "Verificarea reCAPTCHA a eșuat. Încercați din nou.",
    missingVerificationId: "Completați mai întâi verificarea reCAPTCHA.",
    missingEmail: "Furnizați o adresă de e-mail",
    invalidActionCode: "Linkul de resetare a parolei este invalid sau a expirat",
    credentialAlreadyInUse: "Există deja un cont cu acest e-mail. Conectați-vă cu acel cont.",
    requiresRecentLogin: "Această operațiune necesită o autentificare recentă. Conectați-vă din nou.",
    providerAlreadyLinked: "Acest număr de telefon este deja asociat cu un alt cont",
    invalidVerificationCode: "Cod de verificare invalid. Încercați din nou",
    unknownError: "A apărut o eroare neașteptată",
    popupClosed: "Fereastra de conectare a fost închisă. Încercați din nou.",
    accountExistsWithDifferentCredential: "Există deja un cont cu acest e-mail. Conectați-vă cu furnizorul original.",
    displayNameRequired: "Furnizați un nume de afișare",
    secondFactorAlreadyInUse: "Acest număr de telefon este deja înregistrat în acest cont.",
  },
  messages: {
    passwordResetEmailSent: "E-mailul de resetare a parolei a fost trimis cu succes",
    signInLinkSent: "Linkul de conectare a fost trimis cu succes",
    verificationCodeFirst: "Solicitați mai întâi un cod de verificare",
    checkEmailForReset: "Verificați e-mailul pentru instrucțiuni de resetare a parolei",
    dividerOr: "sau",
    termsAndPrivacy: "Continuând, acceptați {tos} și {privacy} noastre.",
    mfaSmsAssertionPrompt:
      "Un cod de verificare va fi trimis la {phoneNumber} pentru a finaliza procesul de autentificare.",
  },
  labels: {
    emailAddress: "Adresă de e-mail",
    password: "Parolă",
    displayName: "Nume de afișare",
    forgotPassword: "Ați uitat parola?",
    signUp: "Înregistrare",
    signIn: "Conectare",
    resetPassword: "Resetați parola",
    createAccount: "Creați cont",
    backToSignIn: "Înapoi la conectare",
    signInWithPhone: "Conectați-vă cu telefonul",
    phoneNumber: "Număr de telefon",
    verificationCode: "Cod de verificare",
    sendCode: "Trimiteți codul",
    verifyCode: "Verificați codul",
    signInWithGoogle: "Conectați-vă cu Google",
    signInWithFacebook: "Conectați-vă cu Facebook",
    signInWithApple: "Conectați-vă cu Apple",
    signInWithMicrosoft: "Conectați-vă cu Microsoft",
    signInWithGitHub: "Conectați-vă cu GitHub",
    signInWithYahoo: "Conectați-vă cu Yahoo",
    signInWithTwitter: "Conectați-vă cu X",
    signInWithEmailLink: "Conectați-vă cu link de e-mail",
    signInWithEmail: "Conectați-vă cu e-mail",
    sendSignInLink: "Trimiteți linkul de conectare",
    termsOfService: "Termeni de serviciu",
    privacyPolicy: "Politica de confidențialitate",
    resendCode: "Retrimiteți codul",
    sending: "Se trimite...",
    multiFactorEnrollment: "Înregistrare multifactor",
    multiFactorAssertion: "Autentificare multifactor",
    mfaTotpVerification: "Verificare TOTP",
    mfaSmsVerification: "Verificare SMS",
    generateQrCode: "Generați cod QR",
  },
  prompts: {
    noAccount: "Nu aveți un cont?",
    haveAccount: "Aveți deja un cont?",
    enterEmailToReset: "Introduceți adresa de e-mail pentru a reseta parola",
    signInToAccount: "Conectați-vă la contul dvs.",
    smsVerificationPrompt: "Introduceți codul de verificare trimis la numărul dvs. de telefon",
    enterDetailsToCreate: "Introduceți datele pentru a crea un cont nou",
    enterPhoneNumber: "Introduceți numărul dvs. de telefon",
    enterVerificationCode: "Introduceți codul de verificare",
    enterEmailForLink: "Introduceți e-mailul pentru a primi un link de conectare",
    mfaEnrollmentPrompt: "Selectați o nouă metodă de înregistrare multifactor",
    mfaAssertionPrompt: "Finalizați procesul de autentificare multifactor",
    mfaAssertionFactorPrompt: "Alegeți o metodă de autentificare multifactor",
    mfaTotpQrCodePrompt: "Scanați acest cod QR cu aplicația dvs. de autentificare",
    mfaTotpEnrollmentVerificationPrompt: "Adăugați codul generat de aplicația dvs. de autentificare",
  },
} satisfies Translations;
