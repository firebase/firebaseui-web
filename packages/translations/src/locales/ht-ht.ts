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

export const htHT = {
  errors: {
    userNotFound: "Pa jwenn okenn kont ak adrès imèl sa a",
    wrongPassword: "Modpas la pa bon",
    invalidEmail: "Tanpri antre yon adrès imèl valab",
    userDisabled: "Kont sa a te dezaktive",
    networkRequestFailed: "Nou pa kapab konekte ak sèvè a. Tanpri verifye koneksyon entènèt ou",
    tooManyRequests: "Twòp tantativ echwe. Tanpri eseye ankò pita",
    missingVerificationCode: "Tanpri antre kòd verifikasyon an",
    emailAlreadyInUse: "Yon kont ak imèl sa a egziste deja",
    invalidCredential: "Enfòmasyon koneksyon yo bay yo pa valab.",
    weakPassword: "Modpas la dwe gen omwen 6 karaktè",
    unverifiedEmail: "Tanpri verifye adrès imèl ou pou kontinye.",
    operationNotAllowed: "Operasyon sa a pa pèmèt. Tanpri kontakte sipò.",
    invalidPhoneNumber: "Nimewo telefòn nan pa valab",
    missingPhoneNumber: "Tanpri bay yon nimewo telefòn",
    quotaExceeded: "Kota SMS depase. Tanpri eseye ankò pita",
    codeExpired: "Kòd verifikasyon an fin ekspire",
    captchaCheckFailed: "Verifikasyon reCAPTCHA a echwe. Tanpri eseye ankò.",
    missingVerificationId: "Tanpri fini verifikasyon reCAPTCHA a anvan.",
    missingEmail: "Tanpri bay yon adrès imèl",
    invalidActionCode: "Lyen pou reyinisyalize modpas la pa valab oswa li ekspire",
    credentialAlreadyInUse: "Yon kont ak imèl sa a egziste deja. Tanpri konekte ak kont sa a.",
    requiresRecentLogin: "Operasyon sa a mande yon koneksyon resan. Tanpri konekte ankò.",
    providerAlreadyLinked: "Nimewo telefòn sa a deja lye ak yon lòt kont",
    invalidVerificationCode: "Kòd verifikasyon an pa valab. Tanpri eseye ankò",
    unknownError: "Yon erè inatandi fèt",
    popupClosed: "Fenèt koneksyon an fèmen. Tanpri eseye ankò.",
    accountExistsWithDifferentCredential: "Yon kont ak imèl sa a egziste deja. Tanpri konekte ak founisè orijinal la.",
    displayNameRequired: "Tanpri bay yon non afichaj",
    secondFactorAlreadyInUse: "Nimewo telefòn sa a deja enskri nan kont sa a.",
  },
  messages: {
    passwordResetEmailSent: "Imèl pou reyinisyalize modpas la voye avèk siksè",
    signInLinkSent: "Lyen koneksyon an voye avèk siksè",
    verificationCodeFirst: "Tanpri mande yon kòd verifikasyon an premye",
    checkEmailForReset: "Tcheke imèl ou pou enstriksyon pou reyinisyalize modpas la",
    dividerOr: "oswa",
    termsAndPrivacy: "Lè w kontinye, ou dakò ak {tos} ak {privacy} nou yo.",
    mfaSmsAssertionPrompt: "Yon kòd verifikasyon pral voye sou {phoneNumber} pou fini pwosesis otantifikasyon an.",
  },
  labels: {
    emailAddress: "Adrès Imèl",
    password: "Modpas",
    displayName: "Non Afichaj",
    forgotPassword: "Ou bliye modpas?",
    signUp: "Enskri",
    signIn: "Konekte",
    resetPassword: "Reyinisyalize Modpas",
    createAccount: "Kreye Kont",
    backToSignIn: "Retounen nan koneksyon",
    signInWithPhone: "Konekte ak Telefòn",
    phoneNumber: "Nimewo Telefòn",
    verificationCode: "Kòd Verifikasyon",
    sendCode: "Voye Kòd",
    verifyCode: "Verifye Kòd",
    signInWithGoogle: "Konekte ak Google",
    signInWithFacebook: "Konekte ak Facebook",
    signInWithApple: "Konekte ak Apple",
    signInWithMicrosoft: "Konekte ak Microsoft",
    signInWithGitHub: "Konekte ak GitHub",
    signInWithYahoo: "Konekte ak Yahoo",
    signInWithTwitter: "Konekte ak X",
    signInWithEmailLink: "Konekte ak Lyen Imèl",
    sendSignInLink: "Voye Lyen Koneksyon",
    termsOfService: "Kondisyon Sèvis",
    privacyPolicy: "Politik Konfidansyalite",
    resendCode: "Revwaye Kòd",
    sending: "Ap voye...",
    dismiss: "Fèmen",
    multiFactorEnrollment: "Enskripsyon Miltifaktè",
    multiFactorAssertion: "Otantifikasyon Miltifaktè",
    mfaTotpVerification: "Verifikasyon TOTP",
    mfaSmsVerification: "Verifikasyon SMS",
    generateQrCode: "Jenere Kòd QR",
  },
  prompts: {
    noAccount: "Ou pa gen kont?",
    haveAccount: "Ou gen deja yon kont?",
    enterEmailToReset: "Antre adrès imèl ou pou reyinisyalize modpas ou",
    signInToAccount: "Konekte nan kont ou",
    smsVerificationPrompt: "Antre kòd verifikasyon ki voye sou nimewo telefòn ou a",
    enterDetailsToCreate: "Antre detay ou yo pou kreye yon nouvo kont",
    enterPhoneNumber: "Antre nimewo telefòn ou",
    enterVerificationCode: "Antre kòd verifikasyon an",
    enterEmailForLink: "Antre imèl ou pou resevwa yon lyen koneksyon",
    mfaEnrollmentPrompt: "Chwazi yon nouvo metòd enskripsyon miltifaktè",
    mfaAssertionPrompt: "Tanpri fini pwosesis otantifikasyon miltifaktè a",
    mfaAssertionFactorPrompt: "Tanpri chwazi yon metòd otantifikasyon miltifaktè",
    mfaTotpQrCodePrompt: "Eskane kòd QR sa a ak aplikasyon otantifikatè ou an",
    mfaTotpEnrollmentVerificationPrompt: "Ajoute kòd ki parèt nan aplikasyon otantifikatè ou an",
  },
} satisfies StrictTranslations;
