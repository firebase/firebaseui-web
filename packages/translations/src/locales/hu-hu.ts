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

/** Hungarian HU (hu-HU) translation set. */
export const huHU = {
  errors: {
    userNotFound: "Nem található fiók ezzel az e-mail-címmel",
    wrongPassword: "Helytelen jelszó",
    invalidEmail: "Adjon meg érvényes e-mail-címet",
    userDisabled: "Ez a fiók le van tiltva",
    networkRequestFailed: "Nem sikerült csatlakozni a szerverhez. Ellenőrizze az internetkapcsolatát",
    tooManyRequests: "Túl sok sikertelen kísérlet. Próbálja újra később",
    missingVerificationCode: "Adja meg az ellenőrző kódot",
    emailAlreadyInUse: "Már létezik fiók ezzel az e-mail-címmel",
    invalidCredential: "A megadott hitelesítő adatok érvénytelenek.",
    weakPassword: "A jelszónak legalább 6 karakterből kell állnia",
    unverifiedEmail: "A folytatáshoz erősítse meg az e-mail-címét.",
    operationNotAllowed: "Ez a művelet nem engedélyezett. Lépjen kapcsolatba az ügyfélszolgálattal.",
    invalidPhoneNumber: "A telefonszám érvénytelen",
    missingPhoneNumber: "Adjon meg telefonszámot",
    quotaExceeded: "Az SMS-kvóta túllépve. Próbálja újra később",
    codeExpired: "Az ellenőrző kód lejárt",
    captchaCheckFailed: "A reCAPTCHA-ellenőrzés sikertelen volt. Próbálja újra.",
    missingVerificationId: "Először töltse ki a reCAPTCHA-ellenőrzést.",
    missingEmail: "Adjon meg e-mail-címet",
    invalidActionCode: "A jelszó-visszaállítási hivatkozás érvénytelen vagy lejárt",
    credentialAlreadyInUse: "Már létezik fiók ezzel az e-mail-címmel. Jelentkezzen be azzal a fiókkal.",
    requiresRecentLogin: "Ez a művelet közeli bejelentkezést igényel. Jelentkezzen be újra.",
    providerAlreadyLinked: "Ez a telefonszám már össze van kapcsolva egy másik fiókkal",
    invalidVerificationCode: "Érvénytelen ellenőrző kód. Próbálja újra",
    unknownError: "Váratlan hiba történt",
    popupClosed: "A bejelentkezési előugró ablak bezárult. Próbálja újra.",
    accountExistsWithDifferentCredential:
      "Már létezik fiók ezzel az e-mail-címmel. Jelentkezzen be az eredeti szolgáltatóval.",
    displayNameRequired: "Adjon meg megjelenítendő nevet",
    secondFactorAlreadyInUse: "Ez a telefonszám már regisztrálva van ehhez a fiókhoz.",
  },
  messages: {
    passwordResetEmailSent: "A jelszó-visszaállítási e-mail sikeresen elküldve",
    signInLinkSent: "A bejelentkezési hivatkozás sikeresen elküldve",
    verificationCodeFirst: "Először kérjen ellenőrző kódot",
    checkEmailForReset: "Ellenőrizze e-mailjét a jelszó-visszaállítási utasításokért",
    dividerOr: "vagy",
    termsAndPrivacy: "A folytatással elfogadja {tos} és {privacy} feltételeinket.",
    mfaSmsAssertionPrompt: "A hitelesítési folyamat befejezéséhez ellenőrző kódot küldünk a(z) {phoneNumber} számra.",
  },
  labels: {
    emailAddress: "E-mail-cím",
    password: "Jelszó",
    displayName: "Megjelenítendő név",
    forgotPassword: "Elfelejtette jelszavát?",
    signUp: "Regisztráció",
    signIn: "Bejelentkezés",
    resetPassword: "Jelszó visszaállítása",
    createAccount: "Fiók létrehozása",
    backToSignIn: "Vissza a bejelentkezéshez",
    signInWithPhone: "Bejelentkezés telefonnal",
    phoneNumber: "Telefonszám",
    verificationCode: "Ellenőrző kód",
    sendCode: "Kód küldése",
    verifyCode: "Kód ellenőrzése",
    signInWithGoogle: "Bejelentkezés Google-lal",
    signInWithFacebook: "Bejelentkezés Facebookkal",
    signInWithApple: "Bejelentkezés Apple-lel",
    signInWithMicrosoft: "Bejelentkezés Microsofttal",
    signInWithGitHub: "Bejelentkezés GitHubbal",
    signInWithYahoo: "Bejelentkezés Yahoóval",
    signInWithTwitter: "Bejelentkezés X-szel",
    signInWithEmailLink: "Bejelentkezés e-mail-hivatkozással",
    signInWithEmail: "Bejelentkezés e-maillel",
    sendSignInLink: "Bejelentkezési hivatkozás küldése",
    termsOfService: "Szolgáltatási feltételek",
    privacyPolicy: "Adatvédelmi irányelvek",
    resendCode: "Kód újraküldése",
    sending: "Küldés...",
    multiFactorEnrollment: "Többtényezős regisztráció",
    multiFactorAssertion: "Többtényezős hitelesítés",
    mfaTotpVerification: "TOTP-ellenőrzés",
    mfaSmsVerification: "SMS-ellenőrzés",
    generateQrCode: "QR-kód létrehozása",
  },
  prompts: {
    noAccount: "Nincs fiókja?",
    haveAccount: "Már van fiókja?",
    enterEmailToReset: "Adja meg e-mail-címét a jelszó visszaállításához",
    signInToAccount: "Jelentkezzen be fiókjába",
    smsVerificationPrompt: "Adja meg a telefonszámára küldött ellenőrző kódot",
    enterDetailsToCreate: "Adja meg adatait új fiók létrehozásához",
    enterPhoneNumber: "Adja meg telefonszámát",
    enterVerificationCode: "Adja meg az ellenőrző kódot",
    enterEmailForLink: "Adja meg e-mail-címét a bejelentkezési hivatkozás fogadásához",
    mfaEnrollmentPrompt: "Válasszon új többtényezős regisztrációs módszert",
    mfaAssertionPrompt: "Fejezze be a többtényezős hitelesítési folyamatot",
    mfaAssertionFactorPrompt: "Válasszon többtényezős hitelesítési módszert",
    mfaTotpQrCodePrompt: "Olvassa be ezt a QR-kódot a hitelesítő alkalmazásával",
    mfaTotpEnrollmentVerificationPrompt: "Adja meg a hitelesítő alkalmazás által generált kódot",
  },
} satisfies Translations;
