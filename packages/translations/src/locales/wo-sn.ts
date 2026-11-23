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

export const woSN = {
  errors: {
    userNotFound: "Amul benn compte ak adresse email bii",
    wrongPassword: "Mot de passe bi du dëgg",
    invalidEmail: "Tàbbi adresse email bu dëgg",
    userDisabled: "Compte bi tëj na",
    networkRequestFailed: "Jokkoo gi ak serveur bi gisul. Tàddal sa connexion internet.",
    tooManyRequests: "Am na ay tentative yu bare yu dëppul. Layaat gannaaw.",
    missingVerificationCode: "Tàbbi kode verifikasyon bi",
    emailAlreadyInUse: "Am na compte ak email bii",
    invalidCredential: "Informasyon yi nga joxe naccul.",
    weakPassword: "Mot de passe bi war na am ay caractère 6 walla ka ci kawe",
    unverifiedEmail: "Verifié sa adresse email ngir continuer.",
    operationNotAllowed: "Lii naccul. Jokkoo ak support bi.",
    invalidPhoneNumber: "Numéro téléphone bi du baax",
    missingPhoneNumber: "Joxe numéro téléphone",
    quotaExceeded: "Kontaayu SMS bi jeex na. Layaat gannaaw.",
    codeExpired: "Kode verifikasyon bi tëj na",
    captchaCheckFailed: "reCAPTCHA bi dëppul. Layaat.",
    missingVerificationId: "Jeexal reCAPTCHA bi jëkk.",
    missingEmail: "Joxe adresse email",
    invalidActionCode: "Lien bi ngir soppi mot de passe bi du baax walla tëj na",
    credentialAlreadyInUse: "Am na compte ak email bii. Dugal ci compte bi.",
    requiresRecentLogin: "Lii laaj na dugal bu bees. Dugalat.",
    providerAlreadyLinked: "Numéro téléphone bii ñu jëkk ko jox compte beneen",
    invalidVerificationCode: "Kode verifikasyon bi dëppul. Layaat",
    unknownError: "Am na njuumte bu amul ci yoon",
    popupClosed: "Fenêtre bi tëju na. Layaat.",
    accountExistsWithDifferentCredential: "Am na compte ak email bii. Dugal ci service bi nga jëkk a jëfandikoo.",
    displayNameRequired: "Joxe tur bu ñu gis",
    secondFactorAlreadyInUse: "Numéro téléphone bii ñu jëkk ko bind ci compte bi.",
  },
  messages: {
    passwordResetEmailSent: "Email bu soppi mot de passe bi yonnee na",
    signInLinkSent: "Lien bi ngir dugal yonnee na",
    verificationCodeFirst: "Jëkk, laaj kode verifikasyon bi",
    checkEmailForReset: "Xool sa email ngir ndigal yi ngir soppi mot de passe",
    dividerOr: "walla",
    termsAndPrivacy: "Ci jatt bi, yaa ngi nangu {tos} ak {privacy} yi.",
    mfaSmsAssertionPrompt: "Kode verifikasyon bi dina yonnee ci {phoneNumber} ngir jeexal autentification bi.",
  },
  labels: {
    emailAddress: "Adresse email",
    password: "Mot de passe",
    displayName: "Tur bu ñu gis",
    forgotPassword: "Mot de passe bi nga fàtte?",
    signUp: "Bindu",
    signIn: "Dugal",
    resetPassword: "Soppi mot de passe",
    createAccount: "Sos compte",
    backToSignIn: "Dellu ci dugal",
    signInWithPhone: "Dugal ak téléphone",
    phoneNumber: "Numéro téléphone",
    verificationCode: "Kode verifikasyon",
    sendCode: "Yonnee kode",
    verifyCode: "Verifié kode",
    signInWithGoogle: "Dugal ak Google",
    signInWithFacebook: "Dugal ak Facebook",
    signInWithApple: "Dugal ak Apple",
    signInWithMicrosoft: "Dugal ak Microsoft",
    signInWithGitHub: "Dugal ak GitHub",
    signInWithYahoo: "Dugal ak Yahoo",
    signInWithTwitter: "Dugal ak X",
    signInWithEmailLink: "Dugal ak lien email",
    sendSignInLink: "Yonnee lien dugal",
    termsOfService: "Conditions d'utilisation",
    privacyPolicy: "Politique de confidentialité",
    resendCode: "Yonnee kode bi beneen yoon",
    sending: "Ñu ngi yonnee...",
    dismiss: "Tëj",
    multiFactorEnrollment: "Enregistrement multi-facteur",
    multiFactorAssertion: "Authentification multi-facteur",
    mfaTotpVerification: "Verifikasyon TOTP",
    mfaSmsVerification: "Verifikasyon SMS",
    generateQrCode: "Sos kode QR",
  },
  prompts: {
    noAccount: "Amul compte?",
    haveAccount: "Am nga ab compte?",
    enterEmailToReset: "Joxe sa adresse email ngir soppi sa mot de passe",
    signInToAccount: "Dugal ci sa compte",
    smsVerificationPrompt: "Joxe kode verifikasyon bi ñu yonnee ci sa numéro téléphone",
    enterDetailsToCreate: "Joxe sa xibaar ngir sos compte bu bees",
    enterPhoneNumber: "Joxe sa numéro téléphone",
    enterVerificationCode: "Joxe kode verifikasyon bi",
    enterEmailForLink: "Joxe sa email ngir jot lien bi ngir dugal",
    mfaEnrollmentPrompt: "Tànn beneen yoon bu enregistrement multi-facteur",
    mfaAssertionPrompt: "Jeexal autentification multi-facteur bi",
    mfaAssertionFactorPrompt: "Tànn benn yoon bu authentification multi-facteur",
    mfaTotpQrCodePrompt: "Scanné kode QR bii ak sa application authenticator",
    mfaTotpEnrollmentVerificationPrompt: "Yokk kode bi application authenticator bi sosu",
  },
} satisfies CompleteTranslationsWithoutLegacy;
