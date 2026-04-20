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

/** Turkish TR (tr-TR) translation set. */
export const trTR = {
  errors: {
    userNotFound: "Bu e-posta adresiyle ilişkili bir hesap bulunamadı",
    wrongPassword: "Hatalı şifre",
    invalidEmail: "Lütfen geçerli bir e-posta adresi girin",
    userDisabled: "Bu hesap devre dışı bırakıldı",
    networkRequestFailed: "Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin",
    tooManyRequests: "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin",
    missingVerificationCode: "Lütfen doğrulama kodunu girin",
    emailAlreadyInUse: "Bu e-posta ile zaten bir hesap mevcut",
    invalidCredential: "Sağlanan kimlik bilgileri geçersiz.",
    weakPassword: "Şifre en az 6 karakter olmalıdır",
    unverifiedEmail: "Devam etmek için lütfen e-posta adresinizi doğrulayın.",
    operationNotAllowed: "Bu işleme izin verilmiyor. Lütfen destekle iletişime geçin.",
    invalidPhoneNumber: "Telefon numarası geçersiz",
    missingPhoneNumber: "Lütfen bir telefon numarası girin",
    quotaExceeded: "SMS kotası aşıldı. Lütfen daha sonra tekrar deneyin",
    codeExpired: "Doğrulama kodunun süresi doldu",
    captchaCheckFailed: "reCAPTCHA doğrulaması başarısız oldu. Lütfen tekrar deneyin.",
    missingVerificationId: "Lütfen önce reCAPTCHA doğrulamasını tamamlayın.",
    missingEmail: "Lütfen bir e-posta adresi girin",
    invalidActionCode: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş",
    credentialAlreadyInUse: "Bu e-posta ile zaten bir hesap mevcut. Lütfen o hesapla oturum açın.",
    requiresRecentLogin: "Bu işlem için yakın zamanda oturum açılmış olması gerekiyor. Lütfen tekrar oturum açın.",
    providerAlreadyLinked: "Bu telefon numarası zaten başka bir hesaba bağlı",
    invalidVerificationCode: "Geçersiz doğrulama kodu. Lütfen tekrar deneyin",
    unknownError: "Beklenmedik bir hata oluştu",
    popupClosed: "Oturum açma açılır penceresi kapatıldı. Lütfen tekrar deneyin.",
    accountExistsWithDifferentCredential:
      "Bu e-posta ile zaten bir hesap mevcut. Lütfen orijinal sağlayıcıyla oturum açın.",
    displayNameRequired: "Lütfen bir görünen ad girin",
    secondFactorAlreadyInUse: "Bu telefon numarası zaten bu hesaba kayıtlı.",
  },
  messages: {
    passwordResetEmailSent: "Şifre sıfırlama e-postası başarıyla gönderildi",
    signInLinkSent: "Oturum açma bağlantısı başarıyla gönderildi",
    verificationCodeFirst: "Lütfen önce bir doğrulama kodu isteyin",
    checkEmailForReset: "Şifre sıfırlama talimatları için e-postanızı kontrol edin",
    dividerOr: "veya",
    termsAndPrivacy: "Devam ederek {tos} ve {privacy} politikamızı kabul etmiş olursunuz.",
    mfaSmsAssertionPrompt:
      "Kimlik doğrulama işlemini tamamlamak için {phoneNumber} numarasına doğrulama kodu gönderilecektir.",
  },
  labels: {
    emailAddress: "E-posta Adresi",
    password: "Şifre",
    displayName: "Görünen Ad",
    forgotPassword: "Şifremi Unuttum?",
    signUp: "Kayıt Ol",
    signIn: "Oturum Aç",
    resetPassword: "Şifreyi Sıfırla",
    createAccount: "Hesap Oluştur",
    backToSignIn: "Oturum Açmaya Geri Dön",
    signInWithPhone: "Telefonla Oturum Aç",
    phoneNumber: "Telefon Numarası",
    verificationCode: "Doğrulama Kodu",
    sendCode: "Kod Gönder",
    verifyCode: "Kodu Doğrula",
    signInWithGoogle: "Google ile Oturum Aç",
    signInWithFacebook: "Facebook ile Oturum Aç",
    signInWithApple: "Apple ile Oturum Aç",
    signInWithMicrosoft: "Microsoft ile Oturum Aç",
    signInWithGitHub: "GitHub ile Oturum Aç",
    signInWithYahoo: "Yahoo ile Oturum Aç",
    signInWithTwitter: "X ile Oturum Aç",
    signInWithEmailLink: "E-posta Bağlantısıyla Oturum Aç",
    signInWithEmail: "E-posta ile Oturum Aç",
    sendSignInLink: "Oturum Açma Bağlantısı Gönder",
    termsOfService: "Hizmet Şartları",
    privacyPolicy: "Gizlilik Politikası",
    resendCode: "Kodu Yeniden Gönder",
    sending: "Gönderiliyor...",
    multiFactorEnrollment: "Çok Faktörlü Kayıt",
    multiFactorAssertion: "Çok Faktörlü Kimlik Doğrulama",
    mfaTotpVerification: "TOTP Doğrulama",
    mfaSmsVerification: "SMS Doğrulama",
    generateQrCode: "QR Kodu Oluştur",
  },
  prompts: {
    noAccount: "Hesabınız yok mu?",
    haveAccount: "Zaten hesabınız var mı?",
    enterEmailToReset: "Şifrenizi sıfırlamak için e-posta adresinizi girin",
    signInToAccount: "Hesabınıza oturum açın",
    smsVerificationPrompt: "Telefon numaranıza gönderilen doğrulama kodunu girin",
    enterDetailsToCreate: "Yeni hesap oluşturmak için bilgilerinizi girin",
    enterPhoneNumber: "Telefon numaranızı girin",
    enterVerificationCode: "Doğrulama kodunu girin",
    enterEmailForLink: "Oturum açma bağlantısı almak için e-postanızı girin",
    mfaEnrollmentPrompt: "Yeni bir çok faktörlü kayıt yöntemi seçin",
    mfaAssertionPrompt: "Lütfen çok faktörlü kimlik doğrulama işlemini tamamlayın",
    mfaAssertionFactorPrompt: "Lütfen bir çok faktörlü kimlik doğrulama yöntemi seçin",
    mfaTotpQrCodePrompt: "Bu QR kodunu kimlik doğrulama uygulamanızla tarayın",
    mfaTotpEnrollmentVerificationPrompt: "Kimlik doğrulama uygulamanız tarafından oluşturulan kodu ekleyin",
  },
} satisfies Translations;
