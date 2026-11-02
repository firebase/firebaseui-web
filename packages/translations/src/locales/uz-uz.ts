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

export const uzUZ = {
  errors: {
    userNotFound: "Bu elektron pochta manzili bilan hisob topilmadi",
    wrongPassword: "Parol noto'g'ri",
    invalidEmail: "Iltimos, to'g'ri elektron pochta manzilini kiriting",
    userDisabled: "Bu hisob o'chirilgan",
    networkRequestFailed: "Serverga ulanib bo'lmadi. Iltimos, internet ulanishingizni tekshiring",
    tooManyRequests: "Juda ko'p muvaffaqiyatsiz urinishlar. Iltimos, keyinroq qayta urinib ko'ring",
    missingVerificationCode: "Iltimos, tasdiqlash kodini kiriting",
    emailAlreadyInUse: "Bu elektron pochta bilan hisob allaqachon mavjud",
    invalidCredential: "Taqdim etilgan ma'lumotlar noto'g'ri.",
    weakPassword: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
    unverifiedEmail: "Davom etish uchun elektron pochta manzilingizni tasdiqlang.",
    operationNotAllowed: "Bu amalga ruxsat berilmagan. Iltimos, qo'llab-quvvatlash xizmatiga murojaat qiling.",
    invalidPhoneNumber: "Telefon raqami noto'g'ri",
    missingPhoneNumber: "Iltimos, telefon raqamini kiriting",
    quotaExceeded: "SMS kvotasi tugadi. Iltimos, keyinroq qayta urinib ko'ring",
    codeExpired: "Tasdiqlash kodining amal qilish muddati tugagan",
    captchaCheckFailed: "reCAPTCHA tekshiruvi muvaffaqiyatsiz tugadi. Iltimos, qayta urinib ko'ring.",
    missingVerificationId: "Iltimos, avval reCAPTCHA tekshiruvini yakunlang.",
    missingEmail: "Iltimos, elektron pochta manzilini kiriting",
    invalidActionCode: "Parolni tiklash havolasi noto'g'ri yoki muddati tugagan",
    credentialAlreadyInUse: "Bu elektron pochta bilan hisob allaqachon mavjud. Iltimos, o'sha hisob bilan kiring.",
    requiresRecentLogin: "Bu amal uchun yaqinda kirish talab qilinadi. Iltimos, qayta kiring.",
    providerAlreadyLinked: "Bu telefon raqami boshqa hisobga allaqachon bog'langan",
    invalidVerificationCode: "Tasdiqlash kodi noto'g'ri. Iltimos, qayta urinib ko'ring",
    unknownError: "Kutilmagan xatolik yuz berdi",
    popupClosed: "Kirish oynasi yopildi. Iltimos, qayta urinib ko'ring.",
    accountExistsWithDifferentCredential:
      "Bu elektron pochta bilan hisob allaqachon mavjud. Iltimos, asl provayder orqali kiring.",
    displayNameRequired: "Iltimos, ko'rsatiladigan ismni kiriting",
    secondFactorAlreadyInUse: "Bu telefon raqami allaqachon ushbu hisobga ulangan.",
  },
  messages: {
    passwordResetEmailSent: "Parolni tiklash xati muvaffaqiyatli yuborildi",
    signInLinkSent: "Kirish havolasi muvaffaqiyatli yuborildi",
    verificationCodeFirst: "Iltimos, avval tasdiqlash kodini so'rang",
    checkEmailForReset: "Parolni tiklash bo'yicha ko'rsatmalar uchun elektron pochtangizni tekshiring",
    dividerOr: "yoki",
    termsAndPrivacy: "Davom etish orqali siz bizning {tos} va {privacy} shartlarimizga rozi bo'lasiz.",
    mfaSmsAssertionPrompt:
      "Autentifikatsiya jarayonini yakunlash uchun {phoneNumber} raqamiga tasdiqlash kodi yuboriladi.",
  },
  labels: {
    emailAddress: "Elektron pochta manzili",
    password: "Parol",
    displayName: "Ko'rsatiladigan ism",
    forgotPassword: "Parolni unutdingizmi?",
    signUp: "Ro'yxatdan o'tish",
    signIn: "Kirish",
    resetPassword: "Parolni tiklash",
    createAccount: "Hisob yaratish",
    backToSignIn: "Kirishga qaytish",
    signInWithPhone: "Telefon orqali kirish",
    phoneNumber: "Telefon raqami",
    verificationCode: "Tasdiqlash kodi",
    sendCode: "Kod yuborish",
    verifyCode: "Kodni tasdiqlash",
    signInWithGoogle: "Google orqali kirish",
    signInWithFacebook: "Facebook orqali kirish",
    signInWithApple: "Apple orqali kirish",
    signInWithMicrosoft: "Microsoft orqali kirish",
    signInWithGitHub: "GitHub orqali kirish",
    signInWithYahoo: "Yahoo orqali kirish",
    signInWithTwitter: "X orqali kirish",
    signInWithEmailLink: "Elektron pochta havolasi orqali kirish",
    sendSignInLink: "Kirish havolasini yuborish",
    termsOfService: "Foydalanish shartlari",
    privacyPolicy: "Maxfiylik siyosati",
    resendCode: "Kodni qayta yuborish",
    sending: "Yuborilmoqda...",
    multiFactorEnrollment: "Ko'p omilli ro'yxatdan o'tish",
    multiFactorAssertion: "Ko'p omilli autentifikatsiya",
    mfaTotpVerification: "TOTP tasdiqlash",
    mfaSmsVerification: "SMS tasdiqlash",
    generateQrCode: "QR kod yaratish",
  },
  prompts: {
    noAccount: "Hisobingiz yo'qmi?",
    haveAccount: "Allaqachon hisobingiz bormi?",
    enterEmailToReset: "Parolingizni tiklash uchun elektron pochta manzilingizni kiriting",
    signInToAccount: "Hisobingizga kiring",
    smsVerificationPrompt: "Telefon raqamingizga yuborilgan tasdiqlash kodini kiriting",
    enterDetailsToCreate: "Yangi hisob yaratish uchun ma'lumotlaringizni kiriting",
    enterPhoneNumber: "Telefon raqamingizni kiriting",
    enterVerificationCode: "Tasdiqlash kodini kiriting",
    enterEmailForLink: "Kirish havolasini olish uchun elektron pochtangizni kiriting",
    mfaEnrollmentPrompt: "Yangi ko'p omilli ro'yxatdan o'tish usulini tanlang",
    mfaAssertionPrompt: "Iltimos, ko'p omilli autentifikatsiya jarayonini yakunlang",
    mfaAssertionFactorPrompt: "Iltimos, ko'p omilli autentifikatsiya usulini tanlang",
    mfaTotpQrCodePrompt: "Ushbu QR kodni autentifikator ilovangiz bilan skanerlang",
    mfaTotpEnrollmentVerificationPrompt: "Autentifikator ilovangiz yaratgan kodni kiriting",
  },
} satisfies Translations;
