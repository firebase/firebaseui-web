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

export const biVU = {
  errors: {
    userNotFound: "Nogat wan akaont we i mering wetem dis email adres",
    wrongPassword: "Paswod ia i no rait",
    invalidEmail: "Plis putum wan rait email adres",
    userDisabled: "Dis akaont i blokem finis",
    networkRequestFailed: "I no save konektem long seva. Plis jekem internet konekson blong yu",
    tooManyRequests: "Tumas taem yu traem i fael. Plis traem bakegen bihaen",
    missingVerificationCode: "Plis putum verification kod",
    emailAlreadyInUse: "Wan akaont i stap finis wetem dis email",
    invalidCredential: "Ol dataa we yu givim i no rait.",
    weakPassword: "Paswod i mas i gat at least 6 leta",
    unverifiedEmail: "Plis verifae email adres blong yu blong kasem stap we i kam bihaen.",
    operationNotAllowed: "Dis wok i no olsem. Plis kontaktem sapot.",
    invalidPhoneNumber: "Fon namba ia i no rait",
    missingPhoneNumber: "Plis givim wan fon namba",
    quotaExceeded: "SMS kota i pas finis. Plis traem bakegen bihaen",
    codeExpired: "Verification kod i pas finis",
    captchaCheckFailed: "reCAPTCHA verification i fael. Plis traem bakegen.",
    missingVerificationId: "Plis finisim reCAPTCHA verification fastaem.",
    missingEmail: "Plis givim wan email adres",
    invalidActionCode: "Link blong resetem paswod i no rait o i pas finis",
    credentialAlreadyInUse: "Wan akaont i stap finis wetem dis email. Plis sainin wetem dat akaont.",
    requiresRecentLogin: "Dis wok i nidim niufala login. Plis sainin bakegen.",
    providerAlreadyLinked: "Dis fon namba i stap finis wetem narafala akaont",
    invalidVerificationCode: "Verification kod i no rait. Plis traem bakegen",
    unknownError: "Wan trabol i kamap we yumi no ekspektem",
    popupClosed: "Sainin windo i lok finis. Plis traem bakegen.",
    accountExistsWithDifferentCredential:
      "Wan akaont i stap finis wetem dis email. Plis sainin wetem fastfala provaeda.",
    displayNameRequired: "Plis givim wan display nem",
    secondFactorAlreadyInUse: "Dis fon namba i stap finis long dis akaont.",
  },
  messages: {
    passwordResetEmailSent: "Email blong resetem paswod i go finis",
    signInLinkSent: "Sainin link i go finis",
    verificationCodeFirst: "Plis askem verification kod fastaem",
    checkEmailForReset: "Lukluk long email blong yu blong ol instraksen blong resetem paswod",
    dividerOr: "o",
    termsAndPrivacy: "Taem yu kontiniu, yu agri wetem {tos} mo {privacy} blong mifala.",
    mfaSmsAssertionPrompt: "Wan verification kod bae i go long {phoneNumber} blong finisim authentication prosesing.",
  },
  labels: {
    emailAddress: "Email Adres",
    password: "Paswod",
    displayName: "Display Nem",
    forgotPassword: "Yu forgetem paswod?",
    signUp: "Rejista",
    signIn: "Sainin",
    resetPassword: "Resetem Paswod",
    createAccount: "Mekem Akaont",
    backToSignIn: "Bak long Sainin",
    signInWithPhone: "Sainin wetem Fon",
    phoneNumber: "Fon Namba",
    verificationCode: "Verification Kod",
    sendCode: "Sendem Kod",
    verifyCode: "Verifaem Kod",
    signInWithGoogle: "Sainin wetem Google",
    signInWithFacebook: "Sainin wetem Facebook",
    signInWithApple: "Sainin wetem Apple",
    signInWithMicrosoft: "Sainin wetem Microsoft",
    signInWithGitHub: "Sainin wetem GitHub",
    signInWithYahoo: "Sainin wetem Yahoo",
    signInWithTwitter: "Sainin wetem X",
    signInWithEmailLink: "Sainin wetem Email Link",
    sendSignInLink: "Sendem Sainin Link",
    termsOfService: "Ol Rul blong Yusum",
    privacyPolicy: "Polisi blong Praivesi",
    resendCode: "Sendem Kod Bakegen",
    sending: "I stap sendem...",
    multiFactorEnrollment: "Multi-factor Rejistresen",
    multiFactorAssertion: "Multi-factor Authentication",
    mfaTotpVerification: "TOTP Verification",
    mfaSmsVerification: "SMS Verification",
    generateQrCode: "Mekem QR Kod",
  },
  prompts: {
    noAccount: "Yu no gat akaont?",
    haveAccount: "Yu gat akaont finis?",
    enterEmailToReset: "Putum email adres blong yu blong resetem paswod blong yu",
    signInToAccount: "Sainin long akaont blong yu",
    smsVerificationPrompt: "Putum verification kod we i go long fon namba blong yu",
    enterDetailsToCreate: "Putum ol detail blong yu blong mekem niufala akaont",
    enterPhoneNumber: "Putum fon namba blong yu",
    enterVerificationCode: "Putum verification kod",
    enterEmailForLink: "Putum email blong yu blong kasem sainin link",
    mfaEnrollmentPrompt: "Jusum niufala multi-factor rejistresen metod",
    mfaAssertionPrompt: "Plis finisim multi-factor authentication prosesing",
    mfaAssertionFactorPrompt: "Plis jusum wan multi-factor authentication metod",
    mfaTotpQrCodePrompt: "Skanem dis QR kod wetem authenticator aplikesen blong yu",
    mfaTotpEnrollmentVerificationPrompt: "Putum kod we authenticator aplikesen blong yu i mekem",
  },
} satisfies Translations;
