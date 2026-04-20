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

/** Italian IT (it-IT) translation set. */
export const itIT = {
  errors: {
    userNotFound: "Nessun account trovato con questo indirizzo email",
    wrongPassword: "Password non corretta",
    invalidEmail: "Per favore inserisci un indirizzo email valido",
    userDisabled: "Questo account è stato disabilitato",
    networkRequestFailed: "Impossibile connettersi al server. Per favore controlla la tua connessione internet",
    tooManyRequests: "Troppi tentativi falliti. Per favore riprova più tardi",
    missingVerificationCode: "Per favore inserisci il codice di verifica",
    emailAlreadyInUse: "Esiste già un account con questa email",
    invalidCredential: "Le credenziali fornite non sono valide.",
    weakPassword: "La password deve contenere almeno 6 caratteri",
    unverifiedEmail: "Per favore verifica il tuo indirizzo email per continuare.",
    operationNotAllowed: "Questa operazione non è consentita. Per favore contatta il supporto.",
    invalidPhoneNumber: "Il numero di telefono non è valido",
    missingPhoneNumber: "Per favore fornisci un numero di telefono",
    quotaExceeded: "Quota SMS superata. Per favore riprova più tardi",
    codeExpired: "Il codice di verifica è scaduto",
    captchaCheckFailed: "Verifica reCAPTCHA fallita. Per favore riprova.",
    missingVerificationId: "Per favore completa prima la verifica reCAPTCHA.",
    missingEmail: "Per favore fornisci un indirizzo email",
    invalidActionCode: "Il link per reimpostare la password non è valido o è scaduto",
    credentialAlreadyInUse:
      "Esiste già un account con questa email. Per favore accedi con quell'account.",
    requiresRecentLogin: "Questa operazione richiede un accesso recente. Per favore accedi di nuovo.",
    providerAlreadyLinked: "Questo numero di telefono è già collegato a un altro account",
    invalidVerificationCode: "Codice di verifica non valido. Per favore riprova",
    unknownError: "Si è verificato un errore imprevisto",
    popupClosed: "Il popup di accesso è stato chiuso. Per favore riprova.",
    accountExistsWithDifferentCredential:
      "Esiste già un account con questa email. Per favore accedi con il provider originale.",
    displayNameRequired: "Per favore fornisci un nome visualizzato",
    secondFactorAlreadyInUse: "Questo numero di telefono è già registrato su questo account.",
  },
  messages: {
    passwordResetEmailSent: "Email di reimpostazione password inviata con successo",
    signInLinkSent: "Link di accesso inviato con successo",
    verificationCodeFirst: "Per favore richiedi prima un codice di verifica",
    checkEmailForReset: "Controlla la tua email per le istruzioni di reimpostazione della password",
    dividerOr: "o",
    termsAndPrivacy: "Continuando, accetti i nostri {tos} e {privacy}.",
    mfaSmsAssertionPrompt:
      "Verrà inviato un codice di verifica a {phoneNumber} per completare il processo di autenticazione.",
  },
  labels: {
    emailAddress: "Indirizzo email",
    password: "Password",
    displayName: "Nome visualizzato",
    forgotPassword: "Password dimenticata?",
    signUp: "Registrati",
    signIn: "Accedi",
    resetPassword: "Reimposta password",
    createAccount: "Crea account",
    backToSignIn: "Torna all'accesso",
    signInWithPhone: "Accedi con il telefono",
    phoneNumber: "Numero di telefono",
    verificationCode: "Codice di verifica",
    sendCode: "Invia codice",
    verifyCode: "Verifica codice",
    signInWithGoogle: "Accedi con Google",
    signInWithFacebook: "Accedi con Facebook",
    signInWithApple: "Accedi con Apple",
    signInWithMicrosoft: "Accedi con Microsoft",
    signInWithGitHub: "Accedi con GitHub",
    signInWithYahoo: "Accedi con Yahoo",
    signInWithTwitter: "Accedi con X",
    signInWithEmailLink: "Accedi con link email",
    signInWithEmail: "Accedi con email",
    sendSignInLink: "Invia link di accesso",
    termsOfService: "Termini di servizio",
    privacyPolicy: "Informativa sulla privacy",
    resendCode: "Invia di nuovo il codice",
    sending: "Invio in corso...",
    multiFactorEnrollment: "Registrazione a più fattori",
    multiFactorAssertion: "Autenticazione a più fattori",
    mfaTotpVerification: "Verifica TOTP",
    mfaSmsVerification: "Verifica SMS",
    generateQrCode: "Genera codice QR",
  },
  prompts: {
    noAccount: "Non hai un account?",
    haveAccount: "Hai già un account?",
    enterEmailToReset: "Inserisci il tuo indirizzo email per reimpostare la password",
    signInToAccount: "Accedi al tuo account",
    smsVerificationPrompt: "Inserisci il codice di verifica inviato al tuo numero di telefono",
    enterDetailsToCreate: "Inserisci i tuoi dati per creare un nuovo account",
    enterPhoneNumber: "Inserisci il tuo numero di telefono",
    enterVerificationCode: "Inserisci il codice di verifica",
    enterEmailForLink: "Inserisci la tua email per ricevere un link di accesso",
    mfaEnrollmentPrompt: "Seleziona un nuovo metodo di registrazione a più fattori",
    mfaAssertionPrompt: "Per favore completa il processo di autenticazione a più fattori",
    mfaAssertionFactorPrompt: "Per favore scegli un metodo di autenticazione a più fattori",
    mfaTotpQrCodePrompt: "Scansiona questo codice QR con la tua app di autenticazione",
    mfaTotpEnrollmentVerificationPrompt: "Aggiungi il codice generato dalla tua app di autenticazione",
  },
} satisfies Translations;
