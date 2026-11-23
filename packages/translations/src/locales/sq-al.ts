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

import { type CompleteTranslationsWithoutLegacy } from "../types";

export const sqAL = {
  errors: {
    userNotFound: "Nuk u gjet asnjë llogari me këtë adresë email",
    wrongPassword: "Fjalëkalim i pasaktë",
    invalidEmail: "Ju lutemi shkruani një adresë email të vlefshme",
    userDisabled: "Kjo llogari është çaktivizuar",
    networkRequestFailed: "Nuk mund të lidhemi me serverin. Ju lutemi kontrolloni lidhjen tuaj me internetin",
    tooManyRequests: "Shumë përpjekje të dështuara. Ju lutemi provoni përsëri më vonë",
    missingVerificationCode: "Ju lutemi shkruani kodin e verifikimit",
    emailAlreadyInUse: "Ekziston tashmë një llogari me këtë email",
    invalidCredential: "Kredencialet e dhëna nuk janë të vlefshme.",
    weakPassword: "Fjalëkalimi duhet të ketë të paktën 6 karaktere",
    unverifiedEmail: "Ju lutemi verifikoni adresën tuaj të email-it për të vazhduar.",
    operationNotAllowed: "Ky veprim nuk lejohet. Ju lutemi kontaktoni mbështetjen.",
    invalidPhoneNumber: "Numri i telefonit nuk është i vlefshëm",
    missingPhoneNumber: "Ju lutemi jepni një numër telefoni",
    quotaExceeded: "Kuota e SMS-ve u tejkalua. Ju lutemi provoni përsëri më vonë",
    codeExpired: "Kodi i verifikimit ka skaduar",
    captchaCheckFailed: "Verifikimi i reCAPTCHA dështoi. Ju lutemi provoni përsëri.",
    missingVerificationId: "Ju lutemi plotësoni fillimisht verifikimin e reCAPTCHA.",
    missingEmail: "Ju lutemi jepni një adresë email",
    invalidActionCode: "Lidhja e rivendosjes së fjalëkalimit është e pavlefshme ose ka skaduar",
    credentialAlreadyInUse: "Ekziston tashmë një llogari me këtë email. Ju lutemi hyni me atë llogari.",
    requiresRecentLogin: "Ky veprim kërkon një hyrje të re. Ju lutemi hyni përsëri.",
    providerAlreadyLinked: "Ky numër telefoni është i lidhur tashmë me një llogari tjetër",
    invalidVerificationCode: "Kodi i verifikimit është i pavlefshëm. Ju lutemi provoni përsëri",
    unknownError: "Ndodhi një gabim i papritur",
    popupClosed: "Dritarja e hyrjes u mbyll. Ju lutemi provoni përsëri.",
    accountExistsWithDifferentCredential:
      "Ekziston tashmë një llogari me këtë email. Ju lutemi hyni me ofruesin origjinal.",
    displayNameRequired: "Ju lutemi jepni një emër shfaqjeje",
    secondFactorAlreadyInUse: "Ky numër telefoni është regjistruar tashmë me këtë llogari.",
  },
  messages: {
    passwordResetEmailSent: "Email-i për rivendosjen e fjalëkalimit u dërgua me sukses",
    signInLinkSent: "Lidhja e hyrjes u dërgua me sukses",
    verificationCodeFirst: "Ju lutemi kërkoni fillimisht një kod verifikimi",
    checkEmailForReset: "Kontrolloni email-in tuaj për udhëzimet e rivendosjes së fjalëkalimit",
    dividerOr: "ose",
    termsAndPrivacy: "Duke vazhduar, ju pranoni {tos} dhe {privacy} tona.",
    mfaSmsAssertionPrompt:
      "Një kod verifikimi do të dërgohet te {phoneNumber} për të përfunduar procesin e autentikimit.",
  },
  labels: {
    emailAddress: "Adresa e Email-it",
    password: "Fjalëkalimi",
    displayName: "Emri i Shfaqjes",
    forgotPassword: "Keni harruar fjalëkalimin?",
    signUp: "Regjistrohu",
    signIn: "Hyr",
    resetPassword: "Rivendos Fjalëkalimin",
    createAccount: "Krijo Llogari",
    backToSignIn: "Kthehu te Hyrja",
    signInWithPhone: "Hyr me Telefon",
    phoneNumber: "Numri i Telefonit",
    verificationCode: "Kodi i Verifikimit",
    sendCode: "Dërgo Kodin",
    verifyCode: "Verifiko Kodin",
    signInWithGoogle: "Hyr me Google",
    signInWithFacebook: "Hyr me Facebook",
    signInWithApple: "Hyr me Apple",
    signInWithMicrosoft: "Hyr me Microsoft",
    signInWithGitHub: "Hyr me GitHub",
    signInWithYahoo: "Hyr me Yahoo",
    signInWithTwitter: "Hyr me X",
    signInWithEmailLink: "Hyr me Lidhje Email",
    sendSignInLink: "Dërgo Lidhjen e Hyrjes",
    termsOfService: "Kushtet e Shërbimit",
    privacyPolicy: "Politika e Privatësisë",
    resendCode: "Ridërgo Kodin",
    sending: "Duke dërguar...",
    dismiss: "Mbyll",
    multiFactorEnrollment: "Regjistrimi me Shumë Faktorë",
    multiFactorAssertion: "Autentikimi me Shumë Faktorë",
    mfaTotpVerification: "Verifikimi TOTP",
    mfaSmsVerification: "Verifikimi me SMS",
    generateQrCode: "Gjenero Kodin QR",
  },
  prompts: {
    noAccount: "Nuk keni llogari?",
    haveAccount: "Keni tashmë një llogari?",
    enterEmailToReset: "Shkruani adresën tuaj të email-it për të rivendosur fjalëkalimin",
    signInToAccount: "Hyni në llogarinë tuaj",
    smsVerificationPrompt: "Shkruani kodin e verifikimit të dërguar te numri juaj i telefonit",
    enterDetailsToCreate: "Shkruani të dhënat tuaja për të krijuar një llogari të re",
    enterPhoneNumber: "Shkruani numrin tuaj të telefonit",
    enterVerificationCode: "Shkruani kodin e verifikimit",
    enterEmailForLink: "Shkruani email-in tuaj për të marrë një lidhje hyrjeje",
    mfaEnrollmentPrompt: "Zgjidhni një metodë të re regjistrimi me shumë faktorë",
    mfaAssertionPrompt: "Ju lutemi plotësoni procesin e autentikimit me shumë faktorë",
    mfaAssertionFactorPrompt: "Ju lutemi zgjidhni një metodë autentikimi me shumë faktorë",
    mfaTotpQrCodePrompt: "Skanoni këtë kod QR me aplikacionin tuaj autentikues",
    mfaTotpEnrollmentVerificationPrompt: "Shtoni kodin e gjeneruar nga aplikacioni juaj autentikues",
  },
} satisfies CompleteTranslationsWithoutLegacy;
