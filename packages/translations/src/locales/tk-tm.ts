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

export const tkTM = {
  errors: {
    userNotFound: "Bu e-poçta salgysy bilen hasap tapylmady",
    wrongPassword: "Parol nädogry",
    invalidEmail: "Dogry e-poçta salgysyny giriziň",
    userDisabled: "Bu hasap öçürilen",
    networkRequestFailed: "Serwere birikip bolmady. Internet baglanyşygyňyzy barlaň",
    tooManyRequests: "Köp sanly başaroutsyz synanyşyk. Soňrak täzeden synanyşyň",
    missingVerificationCode: "Tassyklaýyş kodyny giriziň",
    emailAlreadyInUse: "Bu e-poçta bilen hasap eýýäm bar",
    invalidCredential: "Berlen maglumatlar nädogry.",
    weakPassword: "Parol azyndan 6 simwoldan ybarat bolmaly",
    unverifiedEmail: "Dowam etmek üçin e-poçta salgyňyzy tassyklaň.",
    operationNotAllowed: "Bu amal rugsat berilmeýär. Goldaw bilen habarlaşyň.",
    invalidPhoneNumber: "Telefon belgisi nädogry",
    missingPhoneNumber: "Telefon belgisini giriziň",
    quotaExceeded: "SMS kwotasy geçildi. Soňrak täzeden synanyşyň",
    codeExpired: "Tassyklaýyş kodunyň möhleti geçdi",
    captchaCheckFailed: "reCAPTCHA tassyklamasy şowsuz boldy. Täzeden synanyşyň.",
    missingVerificationId: "Ilki bilen reCAPTCHA tassyklamasyny tamamlaň.",
    missingEmail: "E-poçta salgysyny giriziň",
    invalidActionCode: "Parolyň täzeden düzülmegi üçin baglanyşyk nädogry ýa-da möhleti geçen",
    credentialAlreadyInUse: "Bu e-poçta bilen hasap eýýäm bar. Şol hasap bilen giriň.",
    requiresRecentLogin: "Bu amal täze girişi talap edýär. Täzeden giriň.",
    providerAlreadyLinked: "Bu telefon belgisi eýýäm başga hasaba baglanan",
    invalidVerificationCode: "Tassyklaýyş kody nädogry. Täzeden synanyşyň",
    unknownError: "Garaşylmadyk ýalňyşlyk ýüze çykdy",
    popupClosed: "Girýän penjire ýapyldy. Täzeden synanyşyň.",
    accountExistsWithDifferentCredential: "Bu e-poçta bilen hasap eýýäm bar. Esasy üpjün edijiniň üsti bilen giriň.",
    displayNameRequired: "Görkezilýän ady giriziň",
    secondFactorAlreadyInUse: "Bu telefon belgisi eýýäm bu hasaba goşulan.",
  },
  messages: {
    passwordResetEmailSent: "Parolyň täzeden düzülmegi hakda e-poçta üstünlikli iberildi",
    signInLinkSent: "Girmek baglanyşygy üstünlikli iberildi",
    verificationCodeFirst: "Ilki bilen tassyklaýyş kodyny soraň",
    checkEmailForReset: "Parolyň täzeden düzülmegi boýunça görkezmeler üçin e-poçtaňyzy barlaň",
    dividerOr: "ýa-da",
    termsAndPrivacy: "Dowam etmek bilen {tos} we {privacy} şertlerimize razy bolýarsyňyz.",
    mfaSmsAssertionPrompt: "Tassyklamagy tamamlamak üçin {phoneNumber} belgisine tassyklaýyş kody iberiler.",
  },
  labels: {
    emailAddress: "E-poçta salgysy",
    password: "Parol",
    displayName: "Görkezilýän ady",
    forgotPassword: "Paroly unutdyňyzmy?",
    signUp: "Hasap aç",
    signIn: "Gir",
    resetPassword: "Paroly täzeden düzmek",
    createAccount: "Hasap döret",
    backToSignIn: "Girişe gaýt",
    signInWithPhone: "Telefon bilen gir",
    phoneNumber: "Telefon belgisi",
    verificationCode: "Tassyklaýyş kody",
    sendCode: "Kody iber",
    verifyCode: "Kody tassykla",
    signInWithGoogle: "Google bilen gir",
    signInWithFacebook: "Facebook bilen gir",
    signInWithApple: "Apple bilen gir",
    signInWithMicrosoft: "Microsoft bilen gir",
    signInWithGitHub: "GitHub bilen gir",
    signInWithYahoo: "Yahoo bilen gir",
    signInWithTwitter: "X bilen gir",
    signInWithEmailLink: "E-poçta baglanyşygy bilen gir",
    sendSignInLink: "Giriş baglanyşygyny iber",
    termsOfService: "Ulanyş şertleri",
    privacyPolicy: "Gizlinlik syýasaty",
    resendCode: "Kody täzeden iber",
    sending: "Iberilýär...",
    multiFactorEnrollment: "Köp faktorly hasaba alyş",
    multiFactorAssertion: "Köp faktorly tassyklama",
    mfaTotpVerification: "TOTP tassyklamasy",
    mfaSmsVerification: "SMS tassyklamasy",
    generateQrCode: "QR kod döret",
  },
  prompts: {
    noAccount: "Hasabyňyz ýokmy?",
    haveAccount: "Eýýäm hasabyňyz barmy?",
    enterEmailToReset: "Parolyňyzy täzeden düzmek üçin e-poçta salgyňyzy giriziň",
    signInToAccount: "Hasabyňyza giriň",
    smsVerificationPrompt: "Telefon belgiňize iberilen tassyklaýyş kodyny giriziň",
    enterDetailsToCreate: "Täze hasap döretmek üçin maglumatlaryňyzy giriziň",
    enterPhoneNumber: "Telefon belgiňizi giriziň",
    enterVerificationCode: "Tassyklaýyş kodyny giriziň",
    enterEmailForLink: "Giriş baglanyşygyny almak üçin e-poçtaňyzy giriziň",
    mfaEnrollmentPrompt: "Täze köp faktorly hasaba alyş usulyny saýlaň",
    mfaAssertionPrompt: "Köp faktorly tassyklama prosesini tamamlaň",
    mfaAssertionFactorPrompt: "Köp faktorly tassyklama usulyny saýlaň",
    mfaTotpQrCodePrompt: "Bu QR kody authenticator programmaňyz bilen skanirläň",
    mfaTotpEnrollmentVerificationPrompt: "Authenticator programmaňyz tarapyndan döredilen kody goşuň",
  },
} satisfies Translations;
