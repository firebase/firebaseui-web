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

/** Slovak SK (sk-SK) translation set. */
export const skSK = {
  errors: {
    userNotFound: "Nenašiel sa žiadny účet s touto e-mailovou adresou",
    wrongPassword: "Nesprávne heslo",
    invalidEmail: "Zadajte platnú e-mailovú adresu",
    userDisabled: "Tento účet bol deaktivovaný",
    networkRequestFailed: "Nedá sa pripojiť k serveru. Skontrolujte internetové pripojenie",
    tooManyRequests: "Príliš veľa neúspešných pokusov. Skúste to neskôr",
    missingVerificationCode: "Zadajte overovací kód",
    emailAlreadyInUse: "Účet s týmto e-mailom už existuje",
    invalidCredential: "Zadané prihlasovacie údaje sú neplatné.",
    weakPassword: "Heslo musí mať aspoň 6 znakov",
    unverifiedEmail: "Pre pokračovanie overte svoju e-mailovú adresu.",
    operationNotAllowed: "Táto operácia nie je povolená. Kontaktujte podporu.",
    invalidPhoneNumber: "Telefónne číslo je neplatné",
    missingPhoneNumber: "Zadajte telefónne číslo",
    quotaExceeded: "Kvóta SMS bola prekročená. Skúste to neskôr",
    codeExpired: "Platnosť overovacieho kódu vypršala",
    captchaCheckFailed: "Overenie reCAPTCHA zlyhalo. Skúste to znova.",
    missingVerificationId: "Najprv dokončite overenie reCAPTCHA.",
    missingEmail: "Zadajte e-mailovú adresu",
    invalidActionCode: "Odkaz na obnovenie hesla je neplatný alebo vypršal",
    credentialAlreadyInUse: "Účet s týmto e-mailom už existuje. Prihláste sa pomocou tohto účtu.",
    requiresRecentLogin: "Táto operácia vyžaduje nedávne prihlásenie. Prihláste sa znova.",
    providerAlreadyLinked: "Toto telefónne číslo je už prepojené s iným účtom",
    invalidVerificationCode: "Neplatný overovací kód. Skúste to znova",
    unknownError: "Vyskytla sa neočakávaná chyba",
    popupClosed: "Prihlasovacie okno bolo zatvorené. Skúste to znova.",
    accountExistsWithDifferentCredential:
      "Účet s týmto e-mailom už existuje. Prihláste sa pomocou pôvodného poskytovateľa.",
    displayNameRequired: "Zadajte zobrazované meno",
    secondFactorAlreadyInUse: "Toto telefónne číslo je už zaregistrované na tomto účte.",
  },
  messages: {
    passwordResetEmailSent: "E-mail na obnovenie hesla bol úspešne odoslaný",
    signInLinkSent: "Prihlasovací odkaz bol úspešne odoslaný",
    verificationCodeFirst: "Najprv si vyžiadajte overovací kód",
    checkEmailForReset: "Skontrolujte e-mail pre pokyny na obnovenie hesla",
    dividerOr: "alebo",
    termsAndPrivacy: "Pokračovaním súhlasíte s našimi {tos} a {privacy}.",
    mfaSmsAssertionPrompt: "Na číslo {phoneNumber} bude odoslaný overovací kód na dokončenie procesu overenia.",
  },
  labels: {
    emailAddress: "E-mailová adresa",
    password: "Heslo",
    displayName: "Zobrazované meno",
    forgotPassword: "Zabudli ste heslo?",
    signUp: "Registrovať sa",
    signIn: "Prihlásiť sa",
    resetPassword: "Obnoviť heslo",
    createAccount: "Vytvoriť účet",
    backToSignIn: "Späť na prihlásenie",
    signInWithPhone: "Prihlásiť sa pomocou telefónu",
    phoneNumber: "Telefónne číslo",
    verificationCode: "Overovací kód",
    sendCode: "Odoslať kód",
    verifyCode: "Overiť kód",
    signInWithGoogle: "Prihlásiť sa cez Google",
    signInWithFacebook: "Prihlásiť sa cez Facebook",
    signInWithApple: "Prihlásiť sa cez Apple",
    signInWithMicrosoft: "Prihlásiť sa cez Microsoft",
    signInWithGitHub: "Prihlásiť sa cez GitHub",
    signInWithYahoo: "Prihlásiť sa cez Yahoo",
    signInWithTwitter: "Prihlásiť sa cez X",
    signInWithEmailLink: "Prihlásiť sa pomocou e-mailového odkazu",
    signInWithEmail: "Prihlásiť sa pomocou e-mailu",
    sendSignInLink: "Odoslať prihlasovací odkaz",
    termsOfService: "Podmienky používania",
    privacyPolicy: "Zásady ochrany osobných údajov",
    resendCode: "Znovu odoslať kód",
    sending: "Odosielanie...",
    multiFactorEnrollment: "Registrácia viacfaktorového overenia",
    multiFactorAssertion: "Viacfaktorové overenie",
    mfaTotpVerification: "Overenie TOTP",
    mfaSmsVerification: "Overenie SMS",
    generateQrCode: "Vygenerovať QR kód",
  },
  prompts: {
    noAccount: "Nemáte účet?",
    haveAccount: "Už máte účet?",
    enterEmailToReset: "Zadajte svoju e-mailovú adresu na obnovenie hesla",
    signInToAccount: "Prihláste sa do svojho účtu",
    smsVerificationPrompt: "Zadajte overovací kód zaslaný na vaše telefónne číslo",
    enterDetailsToCreate: "Zadajte svoje údaje na vytvorenie nového účtu",
    enterPhoneNumber: "Zadajte svoje telefónne číslo",
    enterVerificationCode: "Zadajte overovací kód",
    enterEmailForLink: "Zadajte svoj e-mail na získanie prihlasovacieho odkazu",
    mfaEnrollmentPrompt: "Vyberte nový spôsob registrácie viacfaktorového overenia",
    mfaAssertionPrompt: "Dokončite proces viacfaktorového overenia",
    mfaAssertionFactorPrompt: "Vyberte metódu viacfaktorového overenia",
    mfaTotpQrCodePrompt: "Naskenujte tento QR kód pomocou svojej autentifikačnej aplikácie",
    mfaTotpEnrollmentVerificationPrompt: "Pridajte kód vygenerovaný vašou autentifikačnou aplikáciou",
  },
} satisfies Translations;
