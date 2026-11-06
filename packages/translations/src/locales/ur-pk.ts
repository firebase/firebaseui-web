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

export const urPK = {
  errors: {
    userNotFound: "اس ای میل پتے کے ساتھ کوئی اکاؤنٹ نہیں ملا",
    wrongPassword: "غلط پاس ورڈ",
    invalidEmail: "براہ کرم درست ای میل پتہ درج کریں",
    userDisabled: "یہ اکاؤنٹ غیر فعال کر دیا گیا ہے",
    networkRequestFailed: "سرور سے رابطہ نہیں ہو سکا۔ براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں",
    tooManyRequests: "بہت زیادہ ناکام کوششیں۔ براہ کرم بعد میں دوبارہ کوشش کریں",
    missingVerificationCode: "براہ کرم تصدیقی کوڈ درج کریں",
    emailAlreadyInUse: "اس ای میل کے ساتھ پہلے ہی ایک اکاؤنٹ موجود ہے",
    invalidCredential: "فراہم کردہ معلومات درست نہیں ہیں۔",
    weakPassword: "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے",
    unverifiedEmail: "جاری رکھنے کے لیے براہ کرم اپنا ای میل پتہ تصدیق کریں۔",
    operationNotAllowed: "یہ عمل اجازت یافتہ نہیں ہے۔ براہ کرم سپورٹ سے رابطہ کریں۔",
    invalidPhoneNumber: "فون نمبر درست نہیں ہے",
    missingPhoneNumber: "براہ کرم فون نمبر فراہم کریں",
    quotaExceeded: "SMS کا کوٹا ختم ہو گیا ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں",
    codeExpired: "تصدیقی کوڈ کی مدت ختم ہو گئی ہے",
    captchaCheckFailed: "reCAPTCHA کی تصدیق ناکام ہو گئی۔ براہ کرم دوبارہ کوشش کریں۔",
    missingVerificationId: "براہ کرم پہلے reCAPTCHA کی تصدیق مکمل کریں۔",
    missingEmail: "براہ کرم ای میل پتہ فراہم کریں",
    invalidActionCode: "پاس ورڈ ری سیٹ کرنے کا لنک درست نہیں ہے یا اس کی مدت ختم ہو گئی ہے",
    credentialAlreadyInUse: "اس ای میل کے ساتھ پہلے ہی ایک اکاؤنٹ موجود ہے۔ براہ کرم اس اکاؤنٹ سے سائن ان کریں۔",
    requiresRecentLogin: "اس عمل کے لیے حالیہ لاگ ان درکار ہے۔ براہ کرم دوبارہ سائن ان کریں۔",
    providerAlreadyLinked: "یہ فون نمبر پہلے ہی کسی دوسرے اکاؤنٹ سے منسلک ہے",
    invalidVerificationCode: "تصدیقی کوڈ درست نہیں ہے۔ براہ کرم دوبارہ کوشش کریں",
    unknownError: "ایک غیر متوقع خرابی پیش آئی",
    popupClosed: "سائن ان پاپ اپ بند ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔",
    accountExistsWithDifferentCredential:
      "اس ای میل کے ساتھ پہلے ہی ایک اکاؤنٹ موجود ہے۔ براہ کرم اصل فراہم کنندہ کے ذریعے سائن ان کریں۔",
    displayNameRequired: "براہ کرم ڈسپلے نام فراہم کریں",
    secondFactorAlreadyInUse: "یہ فون نمبر پہلے ہی اس اکاؤنٹ میں رجسٹر ہے۔",
  },
  messages: {
    passwordResetEmailSent: "پاس ورڈ ری سیٹ کا ای میل کامیابی سے بھیج دیا گیا",
    signInLinkSent: "سائن ان لنک کامیابی سے بھیج دیا گیا",
    verificationCodeFirst: "براہ کرم پہلے تصدیقی کوڈ کی درخواست کریں",
    checkEmailForReset: "پاس ورڈ ری سیٹ کی ہدایات کے لیے اپنا ای میل چیک کریں",
    dividerOr: "یا",
    termsAndPrivacy: "جاری رکھ کر، آپ ہماری {tos} اور {privacy} سے اتفاق کرتے ہیں۔",
    mfaSmsAssertionPrompt: "تصدیقی عمل مکمل کرنے کے لیے ایک تصدیقی کوڈ {phoneNumber} پر بھیجا جائے گا۔",
  },
  labels: {
    emailAddress: "ای میل پتہ",
    password: "پاس ورڈ",
    displayName: "ڈسپلے نام",
    forgotPassword: "پاس ورڈ بھول گئے؟",
    signUp: "سائن اپ",
    signIn: "سائن ان",
    resetPassword: "پاس ورڈ ری سیٹ کریں",
    createAccount: "اکاؤنٹ بنائیں",
    backToSignIn: "سائن ان پر واپس جائیں",
    signInWithPhone: "فون سے سائن ان کریں",
    phoneNumber: "فون نمبر",
    verificationCode: "تصدیقی کوڈ",
    sendCode: "کوڈ بھیجیں",
    verifyCode: "کوڈ کی تصدیق کریں",
    signInWithGoogle: "Google سے سائن ان کریں",
    signInWithFacebook: "Facebook سے سائن ان کریں",
    signInWithApple: "Apple سے سائن ان کریں",
    signInWithMicrosoft: "Microsoft سے سائن ان کریں",
    signInWithGitHub: "GitHub سے سائن ان کریں",
    signInWithYahoo: "Yahoo سے سائن ان کریں",
    signInWithTwitter: "X سے سائن ان کریں",
    signInWithEmailLink: "ای میل لنک سے سائن ان کریں",
    sendSignInLink: "سائن ان لنک بھیجیں",
    termsOfService: "سروس کی شرائط",
    privacyPolicy: "رازداری کی پالیسی",
    resendCode: "کوڈ دوبارہ بھیجیں",
    sending: "بھیجا جا رہا ہے...",
    dismiss: "بند کریں",
    multiFactorEnrollment: "ملٹی فیکٹر اندراج",
    multiFactorAssertion: "ملٹی فیکٹر تصدیق",
    mfaTotpVerification: "TOTP تصدیق",
    mfaSmsVerification: "SMS تصدیق",
    generateQrCode: "QR کوڈ بنائیں",
  },
  prompts: {
    noAccount: "کیا آپ کا اکاؤنٹ نہیں ہے؟",
    haveAccount: "کیا آپ کا پہلے سے اکاؤنٹ ہے؟",
    enterEmailToReset: "اپنا پاس ورڈ ری سیٹ کرنے کے لیے اپنا ای میل پتہ درج کریں",
    signInToAccount: "اپنے اکاؤنٹ میں سائن ان کریں",
    smsVerificationPrompt: "اپنے فون نمبر پر بھیجا گیا تصدیقی کوڈ درج کریں",
    enterDetailsToCreate: "نیا اکاؤنٹ بنانے کے لیے اپنی تفصیلات درج کریں",
    enterPhoneNumber: "اپنا فون نمبر درج کریں",
    enterVerificationCode: "تصدیقی کوڈ درج کریں",
    enterEmailForLink: "سائن ان لنک حاصل کرنے کے لیے اپنا ای میل درج کریں",
    mfaEnrollmentPrompt: "ملٹی فیکٹر اندراج کا نیا طریقہ منتخب کریں",
    mfaAssertionPrompt: "براہ کرم ملٹی فیکٹر تصدیق کا عمل مکمل کریں",
    mfaAssertionFactorPrompt: "براہ کرم ملٹی فیکٹر تصدیق کا طریقہ منتخب کریں",
    mfaTotpQrCodePrompt: "اس QR کوڈ کو اپنی authenticator ایپ سے اسکین کریں",
    mfaTotpEnrollmentVerificationPrompt: "اپنی authenticator ایپ کا تیار کردہ کوڈ شامل کریں",
  },
} satisfies StrictTranslations;
