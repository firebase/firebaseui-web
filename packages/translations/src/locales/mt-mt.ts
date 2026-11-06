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

import { type StrictTranslations } from "../strict-translations";

export const mtMT = {
  errors: {
    userNotFound: "Ma nstabx ebda kont b'dan l-indirizz tal-email",
    wrongPassword: "Password ħażina",
    invalidEmail: "Jekk jogħġbok daħħal indirizz tal-email validu",
    userDisabled: "Dan il-kont ġie diżattivat",
    networkRequestFailed:
      "Ma nistax nikkonnettja mas-server. Jekk jogħġbok iċċekkja l-konnessjoni tal-internet tiegħek",
    tooManyRequests: "Ħafna tentattivi falliti. Jekk jogħġbok erġa' pprova aktar tard",
    missingVerificationCode: "Jekk jogħġbok daħħal il-kodiċi tal-verifika",
    emailAlreadyInUse: "Diġà hemm kont b'dan l-email",
    invalidCredential: "Il-kredenzjali pprovduti huma invalidi.",
    weakPassword: "Il-password għandha tkun ta' mill-inqas 6 karattri",
    unverifiedEmail: "Jekk jogħġbok ivverifika l-indirizz tal-email tiegħek biex tkompli.",
    operationNotAllowed: "Din l-operazzjoni mhix permessa. Jekk jogħġbok ikkuntattja s-support.",
    invalidPhoneNumber: "In-numru tat-telefon mhuwiex validu",
    missingPhoneNumber: "Jekk jogħġbok ipprovdi numru tat-telefon",
    quotaExceeded: "Il-kwota tal-SMS intlaħqet. Jekk jogħġbok erġa' pprova aktar tard",
    codeExpired: "Il-kodiċi tal-verifika skada",
    captchaCheckFailed: "Il-verifika tar-reCAPTCHA falliet. Jekk jogħġbok erġa' pprova.",
    missingVerificationId: "Jekk jogħġbok lesti l-verifika tar-reCAPTCHA l-ewwel.",
    missingEmail: "Jekk jogħġbok ipprovdi indirizz tal-email",
    invalidActionCode: "Il-link għar-reset tal-password mhuwiex validu jew skada",
    credentialAlreadyInUse: "Diġà hemm kont b'dan l-email. Jekk jogħġbok idħol b'dak il-kont.",
    requiresRecentLogin: "Din l-operazzjoni teħtieġ login reċenti. Jekk jogħġbok erġa' idħol.",
    providerAlreadyLinked: "Dan in-numru tat-telefon diġà huwa marbut ma' kont ieħor",
    invalidVerificationCode: "Kodiċi tal-verifika invalidu. Jekk jogħġbok erġa' pprova",
    unknownError: "Ġara żball mhux mistenni",
    popupClosed: "Il-popup tal-login ingħalaq. Jekk jogħġbok erġa' pprova.",
    accountExistsWithDifferentCredential: "Diġà hemm kont b'dan l-email. Jekk jogħġbok idħol bil-fornitur oriġinali.",
    displayNameRequired: "Jekk jogħġbok ipprovdi isem li jidher",
    secondFactorAlreadyInUse: "Dan in-numru tat-telefon diġà huwa reġistrat ma' dan il-kont.",
  },
  messages: {
    passwordResetEmailSent: "L-email għar-reset tal-password intbagħtet b'suċċess",
    signInLinkSent: "Il-link tal-login intbagħat b'suċċess",
    verificationCodeFirst: "Jekk jogħġbok itlob kodiċi tal-verifika l-ewwel",
    checkEmailForReset: "Iċċekkja l-email tiegħek għall-istruzzjonijiet tar-reset tal-password",
    dividerOr: "jew",
    termsAndPrivacy: "Billi tkompli, qed taqbel mat-{tos} u mal-{privacy} tagħna.",
    mfaSmsAssertionPrompt:
      "Kodiċi tal-verifika se jintbagħat lil {phoneNumber} biex jitlesta l-proċess tal-awtentikazzjoni.",
  },
  labels: {
    emailAddress: "Indirizz tal-Email",
    password: "Password",
    displayName: "Isem li Jidher",
    forgotPassword: "Insejt il-Password?",
    signUp: "Irreġistra",
    signIn: "Idħol",
    resetPassword: "Reset tal-Password",
    createAccount: "Oħloq Kont",
    backToSignIn: "Lura għall-Login",
    signInWithPhone: "Idħol bit-Telefon",
    phoneNumber: "Numru tat-Telefon",
    verificationCode: "Kodiċi tal-Verifika",
    sendCode: "Ibgħat il-Kodiċi",
    verifyCode: "Ivverifika l-Kodiċi",
    signInWithGoogle: "Idħol bil-Google",
    signInWithFacebook: "Idħol bil-Facebook",
    signInWithApple: "Idħol bl-Apple",
    signInWithMicrosoft: "Idħol bil-Microsoft",
    signInWithGitHub: "Idħol bil-GitHub",
    signInWithYahoo: "Idħol bil-Yahoo",
    signInWithTwitter: "Idħol bl-X",
    signInWithEmailLink: "Idħol b'Link tal-Email",
    sendSignInLink: "Ibgħat Link għall-Login",
    termsOfService: "Termini tas-Servizz",
    privacyPolicy: "Politika tal-Privatezza",
    resendCode: "Erġa' Ibgħat il-Kodiċi",
    sending: "Qed jintbagħat...",
    dismiss: "Agħlaq",
    multiFactorEnrollment: "Reġistrazzjoni Multi-Fattur",
    multiFactorAssertion: "Awtentikazzjoni Multi-Fattur",
    mfaTotpVerification: "Verifika TOTP",
    mfaSmsVerification: "Verifika SMS",
    generateQrCode: "Ħoloq Kodiċi QR",
  },
  prompts: {
    noAccount: "M'għandekx kont?",
    haveAccount: "Diġà għandek kont?",
    enterEmailToReset: "Daħħal l-indirizz tal-email tiegħek biex tirresetja l-password",
    signInToAccount: "Idħol fil-kont tiegħek",
    smsVerificationPrompt: "Daħħal il-kodiċi tal-verifika mibgħut lill-numru tat-telefon tiegħek",
    enterDetailsToCreate: "Daħħal id-dettalji tiegħek biex toħloq kont ġdid",
    enterPhoneNumber: "Daħħal in-numru tat-telefon tiegħek",
    enterVerificationCode: "Daħħal il-kodiċi tal-verifika",
    enterEmailForLink: "Daħħal l-email tiegħek biex tirċievi link għall-login",
    mfaEnrollmentPrompt: "Agħżel metodu ġdid għar-reġistrazzjoni multi-fattur",
    mfaAssertionPrompt: "Jekk jogħġbok lesti l-proċess tal-awtentikazzjoni multi-fattur",
    mfaAssertionFactorPrompt: "Jekk jogħġbok agħżel metodu ta' awtentikazzjoni multi-fattur",
    mfaTotpQrCodePrompt: "Iskennja dan il-kodiċi QR bl-app tal-awtentikazzjoni tiegħek",
    mfaTotpEnrollmentVerificationPrompt: "Żid il-kodiċi ġġenerat mill-app tal-awtentikazzjoni tiegħek",
  },
} satisfies StrictTranslations;
