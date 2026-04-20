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

/** Finnish FI (fi-FI) translation set. */
export const fiFI = {
  errors: {
    userNotFound: "Tällä sähköpostiosoitteella ei löydy tiliä",
    wrongPassword: "Väärä salasana",
    invalidEmail: "Syötä kelvollinen sähköpostiosoite",
    userDisabled: "Tämä tili on poistettu käytöstä",
    networkRequestFailed: "Palvelimeen ei saada yhteyttä. Tarkista internet-yhteys",
    tooManyRequests: "Liian monta epäonnistunutta yritystä. Yritä myöhemmin uudelleen",
    missingVerificationCode: "Syötä vahvistuskoodi",
    emailAlreadyInUse: "Tällä sähköpostilla on jo tili",
    invalidCredential: "Annetut tunnistetiedot ovat virheelliset.",
    weakPassword: "Salasanan tulee olla vähintään 6 merkkiä pitkä",
    unverifiedEmail: "Vahvista sähköpostiosoitteesi jatkaaksesi.",
    operationNotAllowed: "Tämä toiminto ei ole sallittu. Ota yhteyttä tukeen.",
    invalidPhoneNumber: "Puhelinnumero on virheellinen",
    missingPhoneNumber: "Anna puhelinnumero",
    quotaExceeded: "SMS-kiintiö ylitetty. Yritä myöhemmin uudelleen",
    codeExpired: "Vahvistuskoodi on vanhentunut",
    captchaCheckFailed: "reCAPTCHA-vahvistus epäonnistui. Yritä uudelleen.",
    missingVerificationId: "Suorita ensin reCAPTCHA-vahvistus.",
    missingEmail: "Anna sähköpostiosoite",
    invalidActionCode: "Salasanan palautuslinkki on virheellinen tai vanhentunut",
    credentialAlreadyInUse: "Tällä sähköpostilla on jo tili. Kirjaudu sillä tilillä.",
    requiresRecentLogin: "Tämä toiminto vaatii äskettäisen kirjautumisen. Kirjaudu uudelleen.",
    providerAlreadyLinked: "Tämä puhelinnumero on jo liitetty toiseen tiliin",
    invalidVerificationCode: "Virheellinen vahvistuskoodi. Yritä uudelleen",
    unknownError: "Odottamaton virhe tapahtui",
    popupClosed: "Kirjautumisikkuna suljettiin. Yritä uudelleen.",
    accountExistsWithDifferentCredential:
      "Tällä sähköpostilla on jo tili. Kirjaudu alkuperäisellä palveluntarjoajalla.",
    displayNameRequired: "Anna näyttönimi",
    secondFactorAlreadyInUse: "Tämä puhelinnumero on jo rekisteröity tälle tilille.",
  },
  messages: {
    passwordResetEmailSent: "Salasanan palautussähköposti lähetetty",
    signInLinkSent: "Kirjautumislinkki lähetetty",
    verificationCodeFirst: "Pyydä ensin vahvistuskoodi",
    checkEmailForReset: "Tarkista sähköpostisi salasanan palautusohjeita varten",
    dividerOr: "tai",
    termsAndPrivacy: "Jatkamalla hyväksyt {tos} ja {privacy}.",
    mfaSmsAssertionPrompt: "Vahvistuskoodi lähetetään numeroon {phoneNumber} todennusprosessin viimeistelemiseksi.",
  },
  labels: {
    emailAddress: "Sähköpostiosoite",
    password: "Salasana",
    displayName: "Näyttönimi",
    forgotPassword: "Unohditko salasanasi?",
    signUp: "Rekisteröidy",
    signIn: "Kirjaudu sisään",
    resetPassword: "Palauta salasana",
    createAccount: "Luo tili",
    backToSignIn: "Takaisin kirjautumiseen",
    signInWithPhone: "Kirjaudu puhelimella",
    phoneNumber: "Puhelinnumero",
    verificationCode: "Vahvistuskoodi",
    sendCode: "Lähetä koodi",
    verifyCode: "Vahvista koodi",
    signInWithGoogle: "Kirjaudu Googlella",
    signInWithFacebook: "Kirjaudu Facebookilla",
    signInWithApple: "Kirjaudu Applella",
    signInWithMicrosoft: "Kirjaudu Microsoftilla",
    signInWithGitHub: "Kirjaudu GitHubilla",
    signInWithYahoo: "Kirjaudu Yahoolla",
    signInWithTwitter: "Kirjaudu X:llä",
    signInWithEmailLink: "Kirjaudu sähköpostilinkin avulla",
    signInWithEmail: "Kirjaudu sähköpostilla",
    sendSignInLink: "Lähetä kirjautumislinkki",
    termsOfService: "Käyttöehdot",
    privacyPolicy: "Tietosuojakäytäntö",
    resendCode: "Lähetä koodi uudelleen",
    sending: "Lähetetään...",
    multiFactorEnrollment: "Monivaiheinen rekisteröinti",
    multiFactorAssertion: "Monivaiheinen todennus",
    mfaTotpVerification: "TOTP-vahvistus",
    mfaSmsVerification: "SMS-vahvistus",
    generateQrCode: "Luo QR-koodi",
  },
  prompts: {
    noAccount: "Eikö sinulla ole tiliä?",
    haveAccount: "Onko sinulla jo tili?",
    enterEmailToReset: "Syötä sähköpostiosoitteesi salasanan palauttamiseksi",
    signInToAccount: "Kirjaudu tilillesi",
    smsVerificationPrompt: "Syötä puhelinnumeroosi lähetetty vahvistuskoodi",
    enterDetailsToCreate: "Syötä tietosi uuden tilin luomiseksi",
    enterPhoneNumber: "Syötä puhelinnumerosi",
    enterVerificationCode: "Syötä vahvistuskoodi",
    enterEmailForLink: "Syötä sähköpostisi kirjautumislinkin saamiseksi",
    mfaEnrollmentPrompt: "Valitse uusi monivaiheinen rekisteröintimenetelmä",
    mfaAssertionPrompt: "Suorita monivaiheinen todennusprosessi loppuun",
    mfaAssertionFactorPrompt: "Valitse monivaiheinen todennusmenetelmä",
    mfaTotpQrCodePrompt: "Skannaa tämä QR-koodi todennussovelluksellasi",
    mfaTotpEnrollmentVerificationPrompt: "Lisää todennussovelluksesi luoma koodi",
  },
} satisfies Translations;
