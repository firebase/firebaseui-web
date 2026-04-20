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

/** Arabic (ar) translation set. */
export const ar = {
  errors: {
    userNotFound: "لم يتم العثور على حساب بهذا البريد الإلكتروني",
    wrongPassword: "كلمة المرور غير صحيحة",
    invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صالح",
    userDisabled: "تم تعطيل هذا الحساب",
    networkRequestFailed: "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت",
    tooManyRequests: "محاولات فاشلة كثيرة جداً. يرجى المحاولة مرة أخرى لاحقاً",
    missingVerificationCode: "يرجى إدخال رمز التحقق",
    emailAlreadyInUse: "يوجد حساب بالفعل بهذا البريد الإلكتروني",
    invalidCredential: "بيانات الاعتماد المقدمة غير صالحة.",
    weakPassword: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
    unverifiedEmail: "يرجى التحقق من عنوان بريدك الإلكتروني للمتابعة.",
    operationNotAllowed: "هذه العملية غير مسموح بها. يرجى التواصل مع الدعم.",
    invalidPhoneNumber: "رقم الهاتف غير صالح",
    missingPhoneNumber: "يرجى تقديم رقم هاتف",
    quotaExceeded: "تجاوز حصة الرسائل القصيرة. يرجى المحاولة مرة أخرى لاحقاً",
    codeExpired: "انتهت صلاحية رمز التحقق",
    captchaCheckFailed: "فشل التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى.",
    missingVerificationId: "يرجى إكمال التحقق من reCAPTCHA أولاً.",
    missingEmail: "يرجى تقديم عنوان بريد إلكتروني",
    invalidActionCode: "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية",
    credentialAlreadyInUse: "يوجد حساب بالفعل بهذا البريد الإلكتروني. يرجى تسجيل الدخول بهذا الحساب.",
    requiresRecentLogin: "تتطلب هذه العملية تسجيل دخول حديثاً. يرجى تسجيل الدخول مجدداً.",
    providerAlreadyLinked: "رقم الهاتف هذا مرتبط بحساب آخر بالفعل",
    invalidVerificationCode: "رمز التحقق غير صالح. يرجى المحاولة مرة أخرى",
    unknownError: "حدث خطأ غير متوقع",
    popupClosed: "تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.",
    accountExistsWithDifferentCredential: "يوجد حساب بالفعل بهذا البريد الإلكتروني. يرجى تسجيل الدخول بالمزود الأصلي.",
    displayNameRequired: "يرجى تقديم اسم عرض",
    secondFactorAlreadyInUse: "رقم الهاتف هذا مسجل بالفعل في هذا الحساب.",
  },
  messages: {
    passwordResetEmailSent: "تم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور بنجاح",
    signInLinkSent: "تم إرسال رابط تسجيل الدخول بنجاح",
    verificationCodeFirst: "يرجى طلب رمز التحقق أولاً",
    checkEmailForReset: "تحقق من بريدك الإلكتروني للحصول على تعليمات إعادة تعيين كلمة المرور",
    dividerOr: "أو",
    termsAndPrivacy: "بالمتابعة، أنت توافق على {tos} و{privacy}.",
    mfaSmsAssertionPrompt: "سيتم إرسال رمز التحقق إلى {phoneNumber} لإتمام عملية المصادقة.",
  },
  labels: {
    emailAddress: "عنوان البريد الإلكتروني",
    password: "كلمة المرور",
    displayName: "الاسم المعروض",
    forgotPassword: "نسيت كلمة المرور؟",
    signUp: "إنشاء حساب",
    signIn: "تسجيل الدخول",
    resetPassword: "إعادة تعيين كلمة المرور",
    createAccount: "إنشاء حساب",
    backToSignIn: "العودة إلى تسجيل الدخول",
    signInWithPhone: "تسجيل الدخول بالهاتف",
    phoneNumber: "رقم الهاتف",
    verificationCode: "رمز التحقق",
    sendCode: "إرسال الرمز",
    verifyCode: "التحقق من الرمز",
    signInWithGoogle: "تسجيل الدخول بـ Google",
    signInWithFacebook: "تسجيل الدخول بـ Facebook",
    signInWithApple: "تسجيل الدخول بـ Apple",
    signInWithMicrosoft: "تسجيل الدخول بـ Microsoft",
    signInWithGitHub: "تسجيل الدخول بـ GitHub",
    signInWithYahoo: "تسجيل الدخول بـ Yahoo",
    signInWithTwitter: "تسجيل الدخول بـ X",
    signInWithEmailLink: "تسجيل الدخول برابط البريد الإلكتروني",
    signInWithEmail: "تسجيل الدخول بالبريد الإلكتروني",
    sendSignInLink: "إرسال رابط تسجيل الدخول",
    termsOfService: "شروط الخدمة",
    privacyPolicy: "سياسة الخصوصية",
    resendCode: "إعادة إرسال الرمز",
    sending: "جارٍ الإرسال...",
    multiFactorEnrollment: "تسجيل المصادقة متعددة العوامل",
    multiFactorAssertion: "المصادقة متعددة العوامل",
    mfaTotpVerification: "التحقق عبر TOTP",
    mfaSmsVerification: "التحقق عبر الرسائل القصيرة",
    generateQrCode: "إنشاء رمز QR",
  },
  prompts: {
    noAccount: "ليس لديك حساب؟",
    haveAccount: "لديك حساب بالفعل؟",
    enterEmailToReset: "أدخل عنوان بريدك الإلكتروني لإعادة تعيين كلمة المرور",
    signInToAccount: "تسجيل الدخول إلى حسابك",
    smsVerificationPrompt: "أدخل رمز التحقق المرسل إلى رقم هاتفك",
    enterDetailsToCreate: "أدخل بياناتك لإنشاء حساب جديد",
    enterPhoneNumber: "أدخل رقم هاتفك",
    enterVerificationCode: "أدخل رمز التحقق",
    enterEmailForLink: "أدخل بريدك الإلكتروني لتلقي رابط تسجيل الدخول",
    mfaEnrollmentPrompt: "اختر طريقة جديدة لتسجيل المصادقة متعددة العوامل",
    mfaAssertionPrompt: "يرجى إكمال عملية المصادقة متعددة العوامل",
    mfaAssertionFactorPrompt: "يرجى اختيار طريقة المصادقة متعددة العوامل",
    mfaTotpQrCodePrompt: "امسح رمز QR هذا باستخدام تطبيق المصادقة الخاص بك",
    mfaTotpEnrollmentVerificationPrompt: "أضف الرمز الذي تم إنشاؤه بواسطة تطبيق المصادقة الخاص بك",
  },
} satisfies Translations;
