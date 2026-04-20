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

/** Latvian LV (lv-LV) translation set. */
export const lvLV = {
  errors: {
    userNotFound: "Konts ar šo e-pasta adresi netika atrasts",
    wrongPassword: "Nepareiza parole",
    invalidEmail: "Lūdzu, ievadiet derīgu e-pasta adresi",
    userDisabled: "Šis konts ir atspējots",
    networkRequestFailed: "Nevar izveidot savienojumu ar serveri. Lūdzu, pārbaudiet interneta savienojumu",
    tooManyRequests: "Pārāk daudz neveiksmīgu mēģinājumu. Lūdzu, mēģiniet vēlāk",
    missingVerificationCode: "Lūdzu, ievadiet verifikācijas kodu",
    emailAlreadyInUse: "Konts ar šo e-pastu jau pastāv",
    invalidCredential: "Norādītie akreditācijas dati nav derīgi.",
    weakPassword: "Parolei jābūt vismaz 6 rakstzīmes garai",
    unverifiedEmail: "Lūdzu, verificējiet savu e-pasta adresi, lai turpinātu.",
    operationNotAllowed: "Šī darbība nav atļauta. Lūdzu, sazinieties ar atbalstu.",
    invalidPhoneNumber: "Tālruņa numurs nav derīgs",
    missingPhoneNumber: "Lūdzu, norādiet tālruņa numuru",
    quotaExceeded: "SMS kvota ir pārsniegta. Lūdzu, mēģiniet vēlāk",
    codeExpired: "Verifikācijas koda derīguma termiņš ir beidzies",
    captchaCheckFailed: "reCAPTCHA verifikācija neizdevās. Lūdzu, mēģiniet vēlreiz.",
    missingVerificationId: "Lūdzu, vispirms aizpildiet reCAPTCHA verifikāciju.",
    missingEmail: "Lūdzu, norādiet e-pasta adresi",
    invalidActionCode: "Paroles atiestatīšanas saite nav derīga vai ir beigusies",
    credentialAlreadyInUse: "Konts ar šo e-pastu jau pastāv. Lūdzu, piesakieties ar to kontu.",
    requiresRecentLogin: "Šī darbība prasa nesenu pieteikšanos. Lūdzu, piesakieties vēlreiz.",
    providerAlreadyLinked: "Šis tālruņa numurs jau ir saistīts ar citu kontu",
    invalidVerificationCode: "Nepareizs verifikācijas kods. Lūdzu, mēģiniet vēlreiz",
    unknownError: "Radās neparedzēta kļūda",
    popupClosed: "Pieteikšanās uznirstošais logs tika aizvērts. Lūdzu, mēģiniet vēlreiz.",
    accountExistsWithDifferentCredential:
      "Konts ar šo e-pastu jau pastāv. Lūdzu, piesakieties ar sākotnējo nodrošinātāju.",
    displayNameRequired: "Lūdzu, norādiet parādāmo vārdu",
    secondFactorAlreadyInUse: "Šis tālruņa numurs jau ir reģistrēts šajā kontā.",
  },
  messages: {
    passwordResetEmailSent: "Paroles atiestatīšanas e-pasts veiksmīgi nosūtīts",
    signInLinkSent: "Pieteikšanās saite veiksmīgi nosūtīta",
    verificationCodeFirst: "Lūdzu, vispirms pieprасiet verifikācijas kodu",
    checkEmailForReset: "Pārbaudiet e-pastu paroles atiestatīšanas instrukcijām",
    dividerOr: "vai",
    termsAndPrivacy: "Turpinot, jūs piekrītat mūsu {tos} un {privacy}.",
    mfaSmsAssertionPrompt: "Verifikācijas kods tiks nosūtīts uz {phoneNumber}, lai pabeigtu autentifikācijas procesu.",
  },
  labels: {
    emailAddress: "E-pasta adrese",
    password: "Parole",
    displayName: "Parādāmais vārds",
    forgotPassword: "Aizmirsāt paroli?",
    signUp: "Reģistrēties",
    signIn: "Pieteikties",
    resetPassword: "Atiestatīt paroli",
    createAccount: "Izveidot kontu",
    backToSignIn: "Atpakaļ uz pieteikšanos",
    signInWithPhone: "Pieteikties ar tālruni",
    phoneNumber: "Tālruņa numurs",
    verificationCode: "Verifikācijas kods",
    sendCode: "Nosūtīt kodu",
    verifyCode: "Verificēt kodu",
    signInWithGoogle: "Pieteikties ar Google",
    signInWithFacebook: "Pieteikties ar Facebook",
    signInWithApple: "Pieteikties ar Apple",
    signInWithMicrosoft: "Pieteikties ar Microsoft",
    signInWithGitHub: "Pieteikties ar GitHub",
    signInWithYahoo: "Pieteikties ar Yahoo",
    signInWithTwitter: "Pieteikties ar X",
    signInWithEmailLink: "Pieteikties ar e-pasta saiti",
    signInWithEmail: "Pieteikties ar e-pastu",
    sendSignInLink: "Nosūtīt pieteikšanās saiti",
    termsOfService: "Pakalpojumu noteikumi",
    privacyPolicy: "Privātuma politika",
    resendCode: "Nosūtīt kodu atkārtoti",
    sending: "Notiek sūtīšana...",
    multiFactorEnrollment: "Daudzfaktoru reģistrācija",
    multiFactorAssertion: "Daudzfaktoru autentifikācija",
    mfaTotpVerification: "TOTP verifikācija",
    mfaSmsVerification: "SMS verifikācija",
    generateQrCode: "Ģenerēt QR kodu",
  },
  prompts: {
    noAccount: "Nav konta?",
    haveAccount: "Jau ir konts?",
    enterEmailToReset: "Ievadiet e-pasta adresi paroles atiestatīšanai",
    signInToAccount: "Piesakieties savā kontā",
    smsVerificationPrompt: "Ievadiet verifikācijas kodu, kas nosūtīts uz jūsu tālruņa numuru",
    enterDetailsToCreate: "Ievadiet savus datus, lai izveidotu jaunu kontu",
    enterPhoneNumber: "Ievadiet savu tālruņa numuru",
    enterVerificationCode: "Ievadiet verifikācijas kodu",
    enterEmailForLink: "Ievadiet savu e-pastu, lai saņemtu pieteikšanās saiti",
    mfaEnrollmentPrompt: "Izvēlieties jaunu daudzfaktoru reģistrācijas metodi",
    mfaAssertionPrompt: "Lūdzu, pabeidziet daudzfaktoru autentifikācijas procesu",
    mfaAssertionFactorPrompt: "Lūdzu, izvēlieties daudzfaktoru autentifikācijas metodi",
    mfaTotpQrCodePrompt: "Skenējiet šo QR kodu ar savu autentifikatora lietotni",
    mfaTotpEnrollmentVerificationPrompt: "Pievienojiet kodu, ko ģenerē jūsu autentifikatora lietotne",
  },
} satisfies Translations;
