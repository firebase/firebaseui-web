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

/** Persian IR (fa-IR) translation set. */
export const faIR = {
  errors: {
    userNotFound: "هیچ حسابی با این آدرس ایمیل یافت نشد",
    wrongPassword: "رمز عبور اشتباه است",
    invalidEmail: "لطفاً یک آدرس ایمیل معتبر وارد کنید",
    userDisabled: "این حساب غیرفعال شده است",
    networkRequestFailed: "اتصال به سرور ممکن نیست. لطفاً اتصال اینترنت خود را بررسی کنید",
    tooManyRequests: "تعداد تلاش‌های ناموفق زیاد است. لطفاً بعداً دوباره امتحان کنید",
    missingVerificationCode: "لطفاً کد تأیید را وارد کنید",
    emailAlreadyInUse: "قبلاً یک حساب با این ایمیل ایجاد شده است",
    invalidCredential: "اطلاعات ورود ارائه‌شده نامعتبر است.",
    weakPassword: "رمز عبور باید حداقل ۶ کاراکتر داشته باشد",
    unverifiedEmail: "لطفاً برای ادامه، آدرس ایمیل خود را تأیید کنید.",
    operationNotAllowed: "این عملیات مجاز نیست. لطفاً با پشتیبانی تماس بگیرید.",
    invalidPhoneNumber: "شماره تلفن نامعتبر است",
    missingPhoneNumber: "لطفاً یک شماره تلفن وارد کنید",
    quotaExceeded: "سهمیه پیامک تمام شده است. لطفاً بعداً دوباره امتحان کنید",
    codeExpired: "کد تأیید منقضی شده است",
    captchaCheckFailed: "تأیید reCAPTCHA ناموفق بود. لطفاً دوباره امتحان کنید.",
    missingVerificationId: "لطفاً ابتدا تأیید reCAPTCHA را کامل کنید.",
    missingEmail: "لطفاً یک آدرس ایمیل وارد کنید",
    invalidActionCode: "لینک بازنشانی رمز عبور نامعتبر است یا منقضی شده است",
    credentialAlreadyInUse: "قبلاً یک حساب با این ایمیل ایجاد شده است. لطفاً با آن حساب وارد شوید.",
    requiresRecentLogin: "این عملیات نیاز به ورود اخیر دارد. لطفاً دوباره وارد شوید.",
    providerAlreadyLinked: "این شماره تلفن قبلاً به حساب دیگری مرتبط شده است",
    invalidVerificationCode: "کد تأیید نامعتبر است. لطفاً دوباره امتحان کنید",
    unknownError: "یک خطای غیرمنتظره رخ داد",
    popupClosed: "پنجره ورود بسته شد. لطفاً دوباره امتحان کنید.",
    accountExistsWithDifferentCredential:
      "قبلاً یک حساب با این ایمیل ایجاد شده است. لطفاً با ارائه‌دهنده اصلی وارد شوید.",
    displayNameRequired: "لطفاً یک نام نمایشی وارد کنید",
    secondFactorAlreadyInUse: "این شماره تلفن قبلاً در این حساب ثبت شده است.",
  },
  messages: {
    passwordResetEmailSent: "ایمیل بازنشانی رمز عبور با موفقیت ارسال شد",
    signInLinkSent: "لینک ورود با موفقیت ارسال شد",
    verificationCodeFirst: "لطفاً ابتدا یک کد تأیید درخواست کنید",
    checkEmailForReset: "ایمیل خود را برای دستورالعمل‌های بازنشانی رمز عبور بررسی کنید",
    dividerOr: "یا",
    termsAndPrivacy: "با ادامه، با {tos} و {privacy} ما موافقت می‌کنید.",
    mfaSmsAssertionPrompt: "یک کد تأیید به {phoneNumber} ارسال خواهد شد تا فرآیند احراز هویت کامل شود.",
  },
  labels: {
    emailAddress: "آدرس ایمیل",
    password: "رمز عبور",
    displayName: "نام نمایشی",
    forgotPassword: "رمز عبور را فراموش کردید؟",
    signUp: "ثبت‌نام",
    signIn: "ورود",
    resetPassword: "بازنشانی رمز عبور",
    createAccount: "ایجاد حساب",
    backToSignIn: "بازگشت به ورود",
    signInWithPhone: "ورود با تلفن",
    phoneNumber: "شماره تلفن",
    verificationCode: "کد تأیید",
    sendCode: "ارسال کد",
    verifyCode: "تأیید کد",
    signInWithGoogle: "ورود با Google",
    signInWithFacebook: "ورود با Facebook",
    signInWithApple: "ورود با Apple",
    signInWithMicrosoft: "ورود با Microsoft",
    signInWithGitHub: "ورود با GitHub",
    signInWithYahoo: "ورود با Yahoo",
    signInWithTwitter: "ورود با X",
    signInWithEmailLink: "ورود با لینک ایمیل",
    signInWithEmail: "ورود با ایمیل",
    sendSignInLink: "ارسال لینک ورود",
    termsOfService: "شرایط خدمات",
    privacyPolicy: "سیاست حریم خصوصی",
    resendCode: "ارسال مجدد کد",
    sending: "در حال ارسال...",
    multiFactorEnrollment: "ثبت‌نام چندعاملی",
    multiFactorAssertion: "احراز هویت چندعاملی",
    mfaTotpVerification: "تأیید TOTP",
    mfaSmsVerification: "تأیید پیامکی",
    generateQrCode: "ایجاد کد QR",
  },
  prompts: {
    noAccount: "حساب ندارید؟",
    haveAccount: "قبلاً حساب دارید؟",
    enterEmailToReset: "آدرس ایمیل خود را برای بازنشانی رمز عبور وارد کنید",
    signInToAccount: "وارد حساب خود شوید",
    smsVerificationPrompt: "کد تأیید ارسال‌شده به شماره تلفنتان را وارد کنید",
    enterDetailsToCreate: "اطلاعات خود را برای ایجاد حساب جدید وارد کنید",
    enterPhoneNumber: "شماره تلفن خود را وارد کنید",
    enterVerificationCode: "کد تأیید را وارد کنید",
    enterEmailForLink: "ایمیل خود را برای دریافت لینک ورود وارد کنید",
    mfaEnrollmentPrompt: "یک روش ثبت‌نام چندعاملی جدید انتخاب کنید",
    mfaAssertionPrompt: "لطفاً فرآیند احراز هویت چندعاملی را کامل کنید",
    mfaAssertionFactorPrompt: "لطفاً یک روش احراز هویت چندعاملی انتخاب کنید",
    mfaTotpQrCodePrompt: "این کد QR را با برنامه احراز هویت خود اسکن کنید",
    mfaTotpEnrollmentVerificationPrompt: "کد تولیدشده توسط برنامه احراز هویت را وارد کنید",
  },
} satisfies Translations;
