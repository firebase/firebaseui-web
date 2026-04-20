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

/** Indonesian ID (id-ID) translation set. */
export const idID = {
  errors: {
    userNotFound: "Tidak ada akun yang ditemukan dengan alamat email ini",
    wrongPassword: "Kata sandi salah",
    invalidEmail: "Harap masukkan alamat email yang valid",
    userDisabled: "Akun ini telah dinonaktifkan",
    networkRequestFailed: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda",
    tooManyRequests: "Terlalu banyak percobaan gagal. Coba lagi nanti",
    missingVerificationCode: "Harap masukkan kode verifikasi",
    emailAlreadyInUse: "Akun dengan email ini sudah ada",
    invalidCredential: "Kredensial yang diberikan tidak valid.",
    weakPassword: "Kata sandi harus terdiri dari minimal 6 karakter",
    unverifiedEmail: "Harap verifikasi alamat email Anda untuk melanjutkan.",
    operationNotAllowed: "Operasi ini tidak diizinkan. Hubungi dukungan.",
    invalidPhoneNumber: "Nomor telepon tidak valid",
    missingPhoneNumber: "Harap berikan nomor telepon",
    quotaExceeded: "Kuota SMS terlampaui. Coba lagi nanti",
    codeExpired: "Kode verifikasi telah kedaluwarsa",
    captchaCheckFailed: "Verifikasi reCAPTCHA gagal. Coba lagi.",
    missingVerificationId: "Harap selesaikan verifikasi reCAPTCHA terlebih dahulu.",
    missingEmail: "Harap berikan alamat email",
    invalidActionCode: "Tautan reset kata sandi tidak valid atau telah kedaluwarsa",
    credentialAlreadyInUse: "Akun dengan email ini sudah ada. Masuk dengan akun tersebut.",
    requiresRecentLogin: "Operasi ini memerlukan login terbaru. Masuk kembali.",
    providerAlreadyLinked: "Nomor telepon ini sudah ditautkan ke akun lain",
    invalidVerificationCode: "Kode verifikasi tidak valid. Coba lagi",
    unknownError: "Terjadi kesalahan yang tidak terduga",
    popupClosed: "Popup masuk ditutup. Coba lagi.",
    accountExistsWithDifferentCredential: "Akun dengan email ini sudah ada. Masuk dengan penyedia asli.",
    displayNameRequired: "Harap berikan nama tampilan",
    secondFactorAlreadyInUse: "Nomor telepon ini sudah terdaftar di akun ini.",
  },
  messages: {
    passwordResetEmailSent: "Email reset kata sandi berhasil dikirim",
    signInLinkSent: "Tautan masuk berhasil dikirim",
    verificationCodeFirst: "Harap minta kode verifikasi terlebih dahulu",
    checkEmailForReset: "Periksa email Anda untuk instruksi reset kata sandi",
    dividerOr: "atau",
    termsAndPrivacy: "Dengan melanjutkan, Anda menyetujui {tos} dan {privacy} kami.",
    mfaSmsAssertionPrompt: "Kode verifikasi akan dikirim ke {phoneNumber} untuk menyelesaikan proses autentikasi.",
  },
  labels: {
    emailAddress: "Alamat Email",
    password: "Kata Sandi",
    displayName: "Nama Tampilan",
    forgotPassword: "Lupa Kata Sandi?",
    signUp: "Daftar",
    signIn: "Masuk",
    resetPassword: "Reset Kata Sandi",
    createAccount: "Buat Akun",
    backToSignIn: "Kembali ke Masuk",
    signInWithPhone: "Masuk dengan Telepon",
    phoneNumber: "Nomor Telepon",
    verificationCode: "Kode Verifikasi",
    sendCode: "Kirim Kode",
    verifyCode: "Verifikasi Kode",
    signInWithGoogle: "Masuk dengan Google",
    signInWithFacebook: "Masuk dengan Facebook",
    signInWithApple: "Masuk dengan Apple",
    signInWithMicrosoft: "Masuk dengan Microsoft",
    signInWithGitHub: "Masuk dengan GitHub",
    signInWithYahoo: "Masuk dengan Yahoo",
    signInWithTwitter: "Masuk dengan X",
    signInWithEmailLink: "Masuk dengan Tautan Email",
    signInWithEmail: "Masuk dengan Email",
    sendSignInLink: "Kirim Tautan Masuk",
    termsOfService: "Ketentuan Layanan",
    privacyPolicy: "Kebijakan Privasi",
    resendCode: "Kirim Ulang Kode",
    sending: "Mengirim...",
    multiFactorEnrollment: "Pendaftaran Multi-faktor",
    multiFactorAssertion: "Autentikasi Multi-faktor",
    mfaTotpVerification: "Verifikasi TOTP",
    mfaSmsVerification: "Verifikasi SMS",
    generateQrCode: "Buat Kode QR",
  },
  prompts: {
    noAccount: "Belum punya akun?",
    haveAccount: "Sudah punya akun?",
    enterEmailToReset: "Masukkan alamat email Anda untuk mereset kata sandi",
    signInToAccount: "Masuk ke akun Anda",
    smsVerificationPrompt: "Masukkan kode verifikasi yang dikirim ke nomor telepon Anda",
    enterDetailsToCreate: "Masukkan detail Anda untuk membuat akun baru",
    enterPhoneNumber: "Masukkan nomor telepon Anda",
    enterVerificationCode: "Masukkan kode verifikasi",
    enterEmailForLink: "Masukkan email Anda untuk menerima tautan masuk",
    mfaEnrollmentPrompt: "Pilih metode pendaftaran multi-faktor baru",
    mfaAssertionPrompt: "Selesaikan proses autentikasi multi-faktor",
    mfaAssertionFactorPrompt: "Pilih metode autentikasi multi-faktor",
    mfaTotpQrCodePrompt: "Pindai kode QR ini dengan aplikasi autentikator Anda",
    mfaTotpEnrollmentVerificationPrompt: "Tambahkan kode yang dihasilkan oleh aplikasi autentikator Anda",
  },
} satisfies Translations;
