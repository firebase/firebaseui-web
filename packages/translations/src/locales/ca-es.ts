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

/** Catalan ES (ca-ES) translation set. */
export const caES = {
  errors: {
    userNotFound: "No s'ha trobat cap compte amb aquesta adreça electrònica",
    wrongPassword: "Contrasenya incorrecta",
    invalidEmail: "Introduïu una adreça electrònica vàlida",
    userDisabled: "Aquest compte s'ha desactivat",
    networkRequestFailed: "No es pot connectar al servidor. Comproveu la vostra connexió a internet",
    tooManyRequests: "Massa intents fallits. Torneu-ho a provar més tard",
    missingVerificationCode: "Introduïu el codi de verificació",
    emailAlreadyInUse: "Ja existeix un compte amb aquest correu electrònic",
    invalidCredential: "Les credencials proporcionades no són vàlides.",
    weakPassword: "La contrasenya ha de tenir almenys 6 caràcters",
    unverifiedEmail: "Verifiqueu la vostra adreça electrònica per continuar.",
    operationNotAllowed: "Aquesta operació no està permesa. Contacteu amb l'assistència.",
    invalidPhoneNumber: "El número de telèfon no és vàlid",
    missingPhoneNumber: "Proporcioneu un número de telèfon",
    quotaExceeded: "S'ha superat la quota de SMS. Torneu-ho a provar més tard",
    codeExpired: "El codi de verificació ha caducat",
    captchaCheckFailed: "La verificació reCAPTCHA ha fallat. Torneu-ho a provar.",
    missingVerificationId: "Completeu primer la verificació reCAPTCHA.",
    missingEmail: "Proporcioneu una adreça electrònica",
    invalidActionCode: "L'enllaç per restablir la contrasenya no és vàlid o ha caducat",
    credentialAlreadyInUse: "Ja existeix un compte amb aquest correu electrònic. Inicieu sessió amb aquell compte.",
    requiresRecentLogin: "Aquesta operació requereix un inici de sessió recent. Inicieu sessió de nou.",
    providerAlreadyLinked: "Aquest número de telèfon ja està vinculat a un altre compte",
    invalidVerificationCode: "Codi de verificació no vàlid. Torneu-ho a provar",
    unknownError: "S'ha produït un error inesperat",
    popupClosed: "La finestra emergent d'inici de sessió s'ha tancat. Torneu-ho a provar.",
    accountExistsWithDifferentCredential:
      "Ja existeix un compte amb aquest correu electrònic. Inicieu sessió amb el proveïdor original.",
    displayNameRequired: "Proporcioneu un nom per mostrar",
    secondFactorAlreadyInUse: "Aquest número de telèfon ja està registrat en aquest compte.",
  },
  messages: {
    passwordResetEmailSent: "S'ha enviat correctament el correu electrònic de restabliment de contrasenya",
    signInLinkSent: "S'ha enviat correctament l'enllaç d'inici de sessió",
    verificationCodeFirst: "Primer sol·liciteu un codi de verificació",
    checkEmailForReset: "Comproveu el correu electrònic per obtenir instruccions de restabliment de contrasenya",
    dividerOr: "o",
    termsAndPrivacy: "En continuar, accepteu els nostres {tos} i {privacy}.",
    mfaSmsAssertionPrompt: "S'enviarà un codi de verificació a {phoneNumber} per completar el procés d'autenticació.",
  },
  labels: {
    emailAddress: "Adreça electrònica",
    password: "Contrasenya",
    displayName: "Nom per mostrar",
    forgotPassword: "Heu oblidat la contrasenya?",
    signUp: "Registreu-vos",
    signIn: "Inicieu sessió",
    resetPassword: "Restabliu la contrasenya",
    createAccount: "Creeu un compte",
    backToSignIn: "Torneu a l'inici de sessió",
    signInWithPhone: "Inicieu sessió amb el telèfon",
    phoneNumber: "Número de telèfon",
    verificationCode: "Codi de verificació",
    sendCode: "Envieu el codi",
    verifyCode: "Verifiqueu el codi",
    signInWithGoogle: "Inicieu sessió amb Google",
    signInWithFacebook: "Inicieu sessió amb Facebook",
    signInWithApple: "Inicieu sessió amb Apple",
    signInWithMicrosoft: "Inicieu sessió amb Microsoft",
    signInWithGitHub: "Inicieu sessió amb GitHub",
    signInWithYahoo: "Inicieu sessió amb Yahoo",
    signInWithTwitter: "Inicieu sessió amb X",
    signInWithEmailLink: "Inicieu sessió amb un enllaç de correu electrònic",
    signInWithEmail: "Inicieu sessió amb correu electrònic",
    sendSignInLink: "Envieu l'enllaç d'inici de sessió",
    termsOfService: "Condicions del servei",
    privacyPolicy: "Política de privadesa",
    resendCode: "Torneu a enviar el codi",
    sending: "S'està enviant...",
    multiFactorEnrollment: "Inscripció multifactor",
    multiFactorAssertion: "Autenticació multifactor",
    mfaTotpVerification: "Verificació TOTP",
    mfaSmsVerification: "Verificació per SMS",
    generateQrCode: "Genereu un codi QR",
  },
  prompts: {
    noAccount: "No teniu cap compte?",
    haveAccount: "Ja teniu un compte?",
    enterEmailToReset: "Introduïu la vostra adreça electrònica per restablir la contrasenya",
    signInToAccount: "Inicieu sessió al vostre compte",
    smsVerificationPrompt: "Introduïu el codi de verificació enviat al vostre número de telèfon",
    enterDetailsToCreate: "Introduïu les dades per crear un compte nou",
    enterPhoneNumber: "Introduïu el vostre número de telèfon",
    enterVerificationCode: "Introduïu el codi de verificació",
    enterEmailForLink: "Introduïu el vostre correu electrònic per rebre un enllaç d'inici de sessió",
    mfaEnrollmentPrompt: "Seleccioneu un mètode nou d'inscripció multifactor",
    mfaAssertionPrompt: "Completeu el procés d'autenticació multifactor",
    mfaAssertionFactorPrompt: "Trieu un mètode d'autenticació multifactor",
    mfaTotpQrCodePrompt: "Escanegeu aquest codi QR amb la vostra aplicació d'autenticació",
    mfaTotpEnrollmentVerificationPrompt: "Afegiu el codi generat per la vostra aplicació d'autenticació",
  },
} satisfies Translations;
