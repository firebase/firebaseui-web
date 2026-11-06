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

export const azAZ = {
  errors: {
    userNotFound: "Bu e-poçt ünvanı ilə heç bir hesab tapılmadı",
    wrongPassword: "Yanlış parol",
    invalidEmail: "Zəhmət olmasa düzgün e-poçt ünvanı daxil edin",
    userDisabled: "Bu hesab deaktiv edilib",
    networkRequestFailed: "Serverlə əlaqə qurmaq mümkün olmadı. Zəhmət olmasa internet bağlantınızı yoxlayın",
    tooManyRequests: "Çox sayda uğursuz cəhd. Zəhmət olmasa bir az sonra yenidən cəhd edin",
    missingVerificationCode: "Zəhmət olmasa təsdiq kodunu daxil edin",
    emailAlreadyInUse: "Bu e-poçt ilə artıq hesab mövcuddur",
    invalidCredential: "Təqdim olunan məlumatlar yanlışdır.",
    weakPassword: "Parol ən azı 6 simvoldan ibarət olmalıdır",
    unverifiedEmail: "Davam etmək üçün e-poçt ünvanınızı təsdiqləyin.",
    operationNotAllowed: "Bu əməliyyata icazə verilmir. Zəhmət olmasa dəstək xidmətinə müraciət edin.",
    invalidPhoneNumber: "Telefon nömrəsi yanlışdır",
    missingPhoneNumber: "Zəhmət olmasa telefon nömrəsi daxil edin",
    quotaExceeded: "SMS limiti aşılıb. Zəhmət olmasa bir az sonra yenidən cəhd edin",
    codeExpired: "Təsdiq kodunun müddəti bitib",
    captchaCheckFailed: "reCAPTCHA yoxlanışı uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.",
    missingVerificationId: "Zəhmət olmasa əvvəlcə reCAPTCHA yoxlanışını tamamlayın.",
    missingEmail: "Zəhmət olmasa e-poçt ünvanı daxil edin",
    invalidActionCode: "Parolun sıfırlanması linki yanlışdır və ya müddəti bitib",
    credentialAlreadyInUse: "Bu e-poçt ilə artıq hesab mövcuddur. Zəhmət olmasa həmin hesabla daxil olun.",
    requiresRecentLogin: "Bu əməliyyat yeni girişi tələb edir. Zəhmət olmasa yenidən daxil olun.",
    providerAlreadyLinked: "Bu telefon nömrəsi artıq başqa hesaba bağlıdır",
    invalidVerificationCode: "Təsdiq kodu yanlışdır. Zəhmət olmasa yenidən cəhd edin",
    unknownError: "Gözlənilməz xəta baş verdi",
    popupClosed: "Giriş pəncərəsi bağlandı. Zəhmət olmasa yenidən cəhd edin.",
    accountExistsWithDifferentCredential:
      "Bu e-poçt ilə artıq hesab mövcuddur. Zəhmət olmasa əsas provayderlə daxil olun.",
    displayNameRequired: "Zəhmət olmasa görünən ad daxil edin",
    secondFactorAlreadyInUse: "Bu telefon nömrəsi artıq bu hesaba qeydiyyatdan keçib.",
  },
  messages: {
    passwordResetEmailSent: "Parolun sıfırlanması üçün e-poçt uğurla göndərildi",
    signInLinkSent: "Giriş linki uğurla göndərildi",
    verificationCodeFirst: "Zəhmət olmasa əvvəlcə təsdiq kodu sorğulayın",
    checkEmailForReset: "Parolun sıfırlanması üzrə təlimatlar üçün e-poçtunuzu yoxlayın",
    dividerOr: "və ya",
    termsAndPrivacy: "Davam etməklə {tos} və {privacy} şərtlərimizlə razılaşırsınız.",
    mfaSmsAssertionPrompt:
      "Autentifikasiya prosesini tamamlamaq üçün {phoneNumber} nömrəsinə təsdiq kodu göndəriləcək.",
  },
  labels: {
    emailAddress: "E-poçt ünvanı",
    password: "Parol",
    displayName: "Görünən ad",
    forgotPassword: "Parolunuzu unutmusunuz?",
    signUp: "Qeydiyyat",
    signIn: "Daxil ol",
    resetPassword: "Parolu sıfırla",
    createAccount: "Hesab yarat",
    backToSignIn: "Girişə qayıt",
    signInWithPhone: "Telefonla daxil ol",
    phoneNumber: "Telefon nömrəsi",
    verificationCode: "Təsdiq kodu",
    sendCode: "Kodu göndər",
    verifyCode: "Kodu təsdiqlə",
    signInWithGoogle: "Google ilə daxil ol",
    signInWithFacebook: "Facebook ilə daxil ol",
    signInWithApple: "Apple ilə daxil ol",
    signInWithMicrosoft: "Microsoft ilə daxil ol",
    signInWithGitHub: "GitHub ilə daxil ol",
    signInWithYahoo: "Yahoo ilə daxil ol",
    signInWithTwitter: "X ilə daxil ol",
    signInWithEmailLink: "E-poçt linki ilə daxil ol",
    sendSignInLink: "Giriş linkini göndər",
    termsOfService: "Xidmət şərtləri",
    privacyPolicy: "Məxfilik siyasəti",
    resendCode: "Kodu yenidən göndər",
    sending: "Göndərilir...",
    dismiss: "Bağla",
    multiFactorEnrollment: "Çoxfaktorlu qeydiyyat",
    multiFactorAssertion: "Çoxfaktorlu autentifikasiya",
    mfaTotpVerification: "TOTP təsdiqi",
    mfaSmsVerification: "SMS təsdiqi",
    generateQrCode: "QR kod yarat",
  },
  prompts: {
    noAccount: "Hesabınız yoxdur?",
    haveAccount: "Artıq hesabınız var?",
    enterEmailToReset: "Parolunuzu sıfırlamaq üçün e-poçt ünvanınızı daxil edin",
    signInToAccount: "Hesabınıza daxil olun",
    smsVerificationPrompt: "Telefon nömrənizə göndərilən təsdiq kodunu daxil edin",
    enterDetailsToCreate: "Yeni hesab yaratmaq üçün məlumatlarınızı daxil edin",
    enterPhoneNumber: "Telefon nömrənizi daxil edin",
    enterVerificationCode: "Təsdiq kodunu daxil edin",
    enterEmailForLink: "Giriş linki almaq üçün e-poçtunuzu daxil edin",
    mfaEnrollmentPrompt: "Yeni çoxfaktorlu qeydiyyat üsulunu seçin",
    mfaAssertionPrompt: "Zəhmət olmasa çoxfaktorlu autentifikasiya prosesini tamamlayın",
    mfaAssertionFactorPrompt: "Zəhmət olmasa çoxfaktorlu autentifikasiya üsulunu seçin",
    mfaTotpQrCodePrompt: "Bu QR kodu autentifikator tətbiqinizlə skan edin",
    mfaTotpEnrollmentVerificationPrompt: "Autentifikator tətbiqinizin yaratdığı kodu əlavə edin",
  },
} satisfies StrictTranslations;
