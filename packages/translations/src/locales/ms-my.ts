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

export const msMY = {
  errors: {
    userNotFound: "Tiada akaun ditemui dengan alamat e-mel ini",
    wrongPassword: "Kata laluan salah",
    invalidEmail: "Sila masukkan alamat e-mel yang sah",
    userDisabled: "Akaun ini telah dilumpuhkan",
    networkRequestFailed: "Tidak dapat menyambung ke pelayan. Sila semak sambungan internet anda",
    tooManyRequests: "Terlalu banyak percubaan gagal. Sila cuba lagi kemudian",
    missingVerificationCode: "Sila masukkan kod pengesahan",
    emailAlreadyInUse: "Akaun sudah wujud dengan e-mel ini",
    invalidCredential: "Bukti kelayakan yang diberikan tidak sah.",
    weakPassword: "Kata laluan mestilah sekurang-kurangnya 6 aksara",
    unverifiedEmail: "Sila sahkan alamat e-mel anda untuk meneruskan.",
    operationNotAllowed: "Operasi ini tidak dibenarkan. Sila hubungi sokongan.",
    invalidPhoneNumber: "Nombor telefon tidak sah",
    missingPhoneNumber: "Sila berikan nombor telefon",
    quotaExceeded: "Kuota SMS telah melebihi had. Sila cuba lagi kemudian",
    codeExpired: "Kod pengesahan telah tamat tempoh",
    captchaCheckFailed: "Pengesahan reCAPTCHA gagal. Sila cuba lagi.",
    missingVerificationId: "Sila lengkapkan pengesahan reCAPTCHA terlebih dahulu.",
    missingEmail: "Sila berikan alamat e-mel",
    invalidActionCode: "Pautan tetapan semula kata laluan tidak sah atau telah tamat tempoh",
    credentialAlreadyInUse: "Akaun sudah wujud dengan e-mel ini. Sila log masuk dengan akaun tersebut.",
    requiresRecentLogin: "Operasi ini memerlukan log masuk terkini. Sila log masuk semula.",
    providerAlreadyLinked: "Nombor telefon ini telah dipautkan kepada akaun lain",
    invalidVerificationCode: "Kod pengesahan tidak sah. Sila cuba lagi",
    unknownError: "Ralat tidak dijangka berlaku",
    popupClosed: "Tetingkap log masuk telah ditutup. Sila cuba lagi.",
    accountExistsWithDifferentCredential: "Akaun sudah wujud dengan e-mel ini. Sila log masuk dengan pembekal asal.",
    displayNameRequired: "Sila berikan nama paparan",
    secondFactorAlreadyInUse: "Nombor telefon ini telah didaftarkan dengan akaun ini.",
  },
  messages: {
    passwordResetEmailSent: "E-mel tetapan semula kata laluan berjaya dihantar",
    signInLinkSent: "Pautan log masuk berjaya dihantar",
    verificationCodeFirst: "Sila minta kod pengesahan dahulu",
    checkEmailForReset: "Semak e-mel anda untuk arahan tetapan semula kata laluan",
    dividerOr: "atau",
    termsAndPrivacy: "Dengan meneruskan, anda bersetuju dengan {tos} dan {privacy} kami.",
    mfaSmsAssertionPrompt: "Kod pengesahan akan dihantar ke {phoneNumber} untuk melengkapkan proses pengesahan.",
  },
  labels: {
    emailAddress: "Alamat E-mel",
    password: "Kata Laluan",
    displayName: "Nama Paparan",
    forgotPassword: "Lupa Kata Laluan?",
    signUp: "Daftar",
    signIn: "Log Masuk",
    resetPassword: "Tetapkan Semula Kata Laluan",
    createAccount: "Cipta Akaun",
    backToSignIn: "Kembali ke Log Masuk",
    signInWithPhone: "Log Masuk dengan Telefon",
    phoneNumber: "Nombor Telefon",
    verificationCode: "Kod Pengesahan",
    sendCode: "Hantar Kod",
    verifyCode: "Sahkan Kod",
    signInWithGoogle: "Log Masuk dengan Google",
    signInWithFacebook: "Log Masuk dengan Facebook",
    signInWithApple: "Log Masuk dengan Apple",
    signInWithMicrosoft: "Log Masuk dengan Microsoft",
    signInWithGitHub: "Log Masuk dengan GitHub",
    signInWithYahoo: "Log Masuk dengan Yahoo",
    signInWithTwitter: "Log Masuk dengan X",
    signInWithEmailLink: "Log Masuk dengan Pautan E-mel",
    sendSignInLink: "Hantar Pautan Log Masuk",
    termsOfService: "Syarat Perkhidmatan",
    privacyPolicy: "Dasar Privasi",
    resendCode: "Hantar Semula Kod",
    sending: "Menghantar...",
    dismiss: "Tutup",
    multiFactorEnrollment: "Pendaftaran Pelbagai Faktor",
    multiFactorAssertion: "Pengesahan Pelbagai Faktor",
    mfaTotpVerification: "Pengesahan TOTP",
    mfaSmsVerification: "Pengesahan SMS",
    generateQrCode: "Jana Kod QR",
  },
  prompts: {
    noAccount: "Tiada akaun?",
    haveAccount: "Sudah mempunyai akaun?",
    enterEmailToReset: "Masukkan alamat e-mel anda untuk menetapkan semula kata laluan",
    signInToAccount: "Log masuk ke akaun anda",
    smsVerificationPrompt: "Masukkan kod pengesahan yang dihantar ke nombor telefon anda",
    enterDetailsToCreate: "Masukkan butiran anda untuk mencipta akaun baharu",
    enterPhoneNumber: "Masukkan nombor telefon anda",
    enterVerificationCode: "Masukkan kod pengesahan",
    enterEmailForLink: "Masukkan e-mel anda untuk menerima pautan log masuk",
    mfaEnrollmentPrompt: "Pilih kaedah pendaftaran pelbagai faktor yang baharu",
    mfaAssertionPrompt: "Sila lengkapkan proses pengesahan pelbagai faktor",
    mfaAssertionFactorPrompt: "Sila pilih kaedah pengesahan pelbagai faktor",
    mfaTotpQrCodePrompt: "Imbas kod QR ini dengan aplikasi pengesah anda",
    mfaTotpEnrollmentVerificationPrompt: "Masukkan kod yang dijana oleh aplikasi pengesah anda",
  },
} satisfies StrictTranslations;
