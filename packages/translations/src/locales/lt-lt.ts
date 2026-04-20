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

/** Lithuanian LT (lt-LT) translation set. */
export const ltLT = {
  errors: {
    userNotFound: "Nerastas naudotojas su šiuo el. pašto adresu",
    wrongPassword: "Neteisingas slaptažodis",
    invalidEmail: "Įveskite teisingą el. pašto adresą",
    userDisabled: "Ši paskyra išjungta",
    networkRequestFailed: "Nepavyksta prisijungti prie serverio. Patikrinkite interneto ryšį",
    tooManyRequests: "Per daug nesėkmingų bandymų. Bandykite vėliau",
    missingVerificationCode: "Įveskite patvirtinimo kodą",
    emailAlreadyInUse: "Su šiuo el. paštu jau egzistuoja paskyra",
    invalidCredential: "Pateikti kredencialai yra neteisingi.",
    weakPassword: "Slaptažodis turi būti bent 6 simbolių ilgio",
    unverifiedEmail: "Patvirtinkite el. pašto adresą, kad tęstumėte.",
    operationNotAllowed: "Ši operacija neleidžiama. Susisiekite su palaikymo komanda.",
    invalidPhoneNumber: "Telefono numeris neteisingas",
    missingPhoneNumber: "Įveskite telefono numerį",
    quotaExceeded: "SMS kvota viršyta. Bandykite vėliau",
    codeExpired: "Patvirtinimo kodo galiojimo laikas baigėsi",
    captchaCheckFailed: "reCAPTCHA patikrinimas nepavyko. Bandykite dar kartą.",
    missingVerificationId: "Pirmiausia atlikite reCAPTCHA patikrinimą.",
    missingEmail: "Įveskite el. pašto adresą",
    invalidActionCode: "Slaptažodžio atkūrimo nuoroda yra neteisinga arba pasibaigė jos galiojimas",
    credentialAlreadyInUse: "Su šiuo el. paštu jau egzistuoja paskyra. Prisijunkite su ta paskyra.",
    requiresRecentLogin: "Šiai operacijai reikalingas neseniai atliktas prisijungimas. Prisijunkite iš naujo.",
    providerAlreadyLinked: "Šis telefono numeris jau susietas su kita paskyra",
    invalidVerificationCode: "Neteisingas patvirtinimo kodas. Bandykite dar kartą",
    unknownError: "Įvyko netikėta klaida",
    popupClosed: "Prisijungimo iššokantis langas buvo uždarytas. Bandykite dar kartą.",
    accountExistsWithDifferentCredential: "Su šiuo el. paštu jau egzistuoja paskyra. Prisijunkite su pirminiu tiekėju.",
    displayNameRequired: "Įveskite rodomą vardą",
    secondFactorAlreadyInUse: "Šis telefono numeris jau užregistruotas šioje paskyroje.",
  },
  messages: {
    passwordResetEmailSent: "Slaptažodžio atkūrimo el. laiškas sėkmingai išsiųstas",
    signInLinkSent: "Prisijungimo nuoroda sėkmingai išsiųsta",
    verificationCodeFirst: "Pirmiausia paprašykite patvirtinimo kodo",
    checkEmailForReset: "Patikrinkite el. paštą dėl slaptažodžio atkūrimo instrukcijų",
    dividerOr: "arba",
    termsAndPrivacy: "Tęsdami sutinkate su mūsų {tos} ir {privacy}.",
    mfaSmsAssertionPrompt: "Patvirtinimo kodas bus išsiųstas į {phoneNumber} autentifikavimo procesui užbaigti.",
  },
  labels: {
    emailAddress: "El. pašto adresas",
    password: "Slaptažodis",
    displayName: "Rodomas vardas",
    forgotPassword: "Pamiršote slaptažodį?",
    signUp: "Registruotis",
    signIn: "Prisijungti",
    resetPassword: "Atkurti slaptažodį",
    createAccount: "Sukurti paskyrą",
    backToSignIn: "Grįžti prie prisijungimo",
    signInWithPhone: "Prisijungti telefonu",
    phoneNumber: "Telefono numeris",
    verificationCode: "Patvirtinimo kodas",
    sendCode: "Siųsti kodą",
    verifyCode: "Patvirtinti kodą",
    signInWithGoogle: "Prisijungti su Google",
    signInWithFacebook: "Prisijungti su Facebook",
    signInWithApple: "Prisijungti su Apple",
    signInWithMicrosoft: "Prisijungti su Microsoft",
    signInWithGitHub: "Prisijungti su GitHub",
    signInWithYahoo: "Prisijungti su Yahoo",
    signInWithTwitter: "Prisijungti su X",
    signInWithEmailLink: "Prisijungti su el. pašto nuoroda",
    signInWithEmail: "Prisijungti su el. paštu",
    sendSignInLink: "Siųsti prisijungimo nuorodą",
    termsOfService: "Paslaugų teikimo sąlygos",
    privacyPolicy: "Privatumo politika",
    resendCode: "Siųsti kodą iš naujo",
    sending: "Siunčiama...",
    multiFactorEnrollment: "Kelių veiksnių registracija",
    multiFactorAssertion: "Kelių veiksnių autentifikavimas",
    mfaTotpVerification: "TOTP patvirtinimas",
    mfaSmsVerification: "SMS patvirtinimas",
    generateQrCode: "Generuoti QR kodą",
  },
  prompts: {
    noAccount: "Neturite paskyros?",
    haveAccount: "Jau turite paskyrą?",
    enterEmailToReset: "Įveskite el. pašto adresą slaptažodžiui atkurti",
    signInToAccount: "Prisijunkite prie savo paskyros",
    smsVerificationPrompt: "Įveskite patvirtinimo kodą, išsiųstą į jūsų telefono numerį",
    enterDetailsToCreate: "Įveskite savo duomenis naujai paskyrai sukurti",
    enterPhoneNumber: "Įveskite savo telefono numerį",
    enterVerificationCode: "Įveskite patvirtinimo kodą",
    enterEmailForLink: "Įveskite el. paštą prisijungimo nuorodai gauti",
    mfaEnrollmentPrompt: "Pasirinkite naują kelių veiksnių registracijos metodą",
    mfaAssertionPrompt: "Užbaikite kelių veiksnių autentifikavimo procesą",
    mfaAssertionFactorPrompt: "Pasirinkite kelių veiksnių autentifikavimo metodą",
    mfaTotpQrCodePrompt: "Nuskenuokite šį QR kodą savo autentifikatoriaus programa",
    mfaTotpEnrollmentVerificationPrompt: "Pridėkite jūsų autentifikatoriaus programos sugeneruotą kodą",
  },
} satisfies Translations;
