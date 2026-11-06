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

import { type CompleteTranslationsWithoutLegacy } from "../types";

export const mnMN = {
  errors: {
    userNotFound: "Энэ имэйл хаягтай бүртгэл олдсонгүй",
    wrongPassword: "Нууц үг буруу байна",
    invalidEmail: "Зөв имэйл хаяг оруулна уу",
    userDisabled: "Энэ бүртгэл идэвхгүй болсон байна",
    networkRequestFailed: "Сервертэй холбогдож чадсангүй. Интернет холболтоо шалгана уу",
    tooManyRequests: "Хэт олон удаа амжилтгүй оролдлоо. Дараа дахин оролдоно уу",
    missingVerificationCode: "Баталгаажуулах кодоо оруулна уу",
    emailAlreadyInUse: "Энэ имэйл хаягтай бүртгэл аль хэдийн байна",
    invalidCredential: "Оруулсан мэдээлэл буруу байна.",
    weakPassword: "Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой",
    unverifiedEmail: "Үргэлжлүүлэхийн тулд имэйл хаягаа баталгаажуулна уу.",
    operationNotAllowed: "Энэ үйлдлийг хийх боломжгүй. Дэмжлэгтэй холбогдоно уу.",
    invalidPhoneNumber: "Утасны дугаар буруу байна",
    missingPhoneNumber: "Утасны дугаараа оруулна уу",
    quotaExceeded: "SMS-ийн хязгаар хэтэрлээ. Дараа дахин оролдоно уу",
    codeExpired: "Баталгаажуулах кодын хугацаа дууссан",
    captchaCheckFailed: "reCAPTCHA баталгаажуулалт амжилтгүй боллоо. Дахин оролдоно уу.",
    missingVerificationId: "Эхлээд reCAPTCHA баталгаажуулалтыг дуусгана уу.",
    missingEmail: "Имэйл хаяг оруулна уу",
    invalidActionCode: "Нууц үг сэргээх холбоос буруу эсвэл хугацаа нь дууссан байна",
    credentialAlreadyInUse: "Энэ имэйл хаягтай бүртгэл аль хэдийн байна. Тэр бүртгэлээрээ нэвтэрнэ үү.",
    requiresRecentLogin: "Энэ үйлдэлд саяхны нэвтрэлт шаардлагатай. Дахин нэвтэрнэ үү.",
    providerAlreadyLinked: "Энэ утасны дугаар өөр бүртгэлтэй холбогдсон байна",
    invalidVerificationCode: "Баталгаажуулах код буруу байна. Дахин оролдоно уу",
    unknownError: "Тодорхойгүй алдаа гарлаа",
    popupClosed: "Нэвтрэх цонх хаагдлаа. Дахин оролдоно уу.",
    accountExistsWithDifferentCredential:
      "Энэ имэйл хаягтай бүртгэл аль хэдийн байна. Анхны үйлчилгээ үзүүлэгчээрээ нэвтэрнэ үү.",
    displayNameRequired: "Харуулах нэрээ оруулна уу",
    secondFactorAlreadyInUse: "Энэ утасны дугаар энэ бүртгэлд аль хэдийн бүртгэгдсэн байна.",
  },
  messages: {
    passwordResetEmailSent: "Нууц үг сэргээх имэйл амжилттай илгээгдлээ",
    signInLinkSent: "Нэвтрэх холбоос амжилттай илгээгдлээ",
    verificationCodeFirst: "Эхлээд баталгаажуулах код авна уу",
    checkEmailForReset: "Нууц үг сэргээх заавраа имэйлээсээ шалгана уу",
    dividerOr: "эсвэл",
    termsAndPrivacy: "Үргэлжлүүлснээр та манай {tos} болон {privacy}-тай санал нэгдэж байна.",
    mfaSmsAssertionPrompt:
      "Баталгаажуулалтын процессыг дуусгахын тулд {phoneNumber} руу баталгаажуулах код илгээгдэнэ.",
  },
  labels: {
    emailAddress: "Имэйл хаяг",
    password: "Нууц үг",
    displayName: "Харуулах нэр",
    forgotPassword: "Нууц үгээ мартсан уу?",
    signUp: "Бүртгүүлэх",
    signIn: "Нэвтрэх",
    resetPassword: "Нууц үг сэргээх",
    createAccount: "Бүртгэл үүсгэх",
    backToSignIn: "Нэвтрэх рүү буцах",
    signInWithPhone: "Утсаар нэвтрэх",
    phoneNumber: "Утасны дугаар",
    verificationCode: "Баталгаажуулах код",
    sendCode: "Код илгээх",
    verifyCode: "Кодыг баталгаажуулах",
    signInWithGoogle: "Google-ээр нэвтрэх",
    signInWithFacebook: "Facebook-ээр нэвтрэх",
    signInWithApple: "Apple-ээр нэвтрэх",
    signInWithMicrosoft: "Microsoft-оор нэвтрэх",
    signInWithGitHub: "GitHub-аар нэвтрэх",
    signInWithYahoo: "Yahoo-оор нэвтрэх",
    signInWithTwitter: "X-ээр нэвтрэх",
    signInWithEmailLink: "Имэйл холбоосоор нэвтрэх",
    sendSignInLink: "Нэвтрэх холбоос илгээх",
    termsOfService: "Үйлчилгээний нөхцөл",
    privacyPolicy: "Нууцлалын бодлого",
    resendCode: "Кодыг дахин илгээх",
    sending: "Илгээж байна...",
    dismiss: "Хаах",
    multiFactorEnrollment: "Олон хүчин зүйлтэй бүртгэл",
    multiFactorAssertion: "Олон хүчин зүйлтэй баталгаажуулалт",
    mfaTotpVerification: "TOTP баталгаажуулалт",
    mfaSmsVerification: "SMS баталгаажуулалт",
    generateQrCode: "QR код үүсгэх",
  },
  prompts: {
    noAccount: "Бүртгэлгүй юу?",
    haveAccount: "Аль хэдийн бүртгэлтэй юу?",
    enterEmailToReset: "Нууц үгээ сэргээхийн тулд имэйл хаягаа оруулна уу",
    signInToAccount: "Бүртгэлдээ нэвтэрнэ үү",
    smsVerificationPrompt: "Утасны дугаар руу илгээсэн баталгаажуулах кодыг оруулна уу",
    enterDetailsToCreate: "Шинэ бүртгэл үүсгэхийн тулд мэдээллээ оруулна уу",
    enterPhoneNumber: "Утасны дугаараа оруулна уу",
    enterVerificationCode: "Баталгаажуулах кодыг оруулна уу",
    enterEmailForLink: "Нэвтрэх холбоос авахын тулд имэйл хаягаа оруулна уу",
    mfaEnrollmentPrompt: "Олон хүчин зүйлтэй бүртгэлийн шинэ арга сонгоно уу",
    mfaAssertionPrompt: "Олон хүчин зүйлтэй баталгаажуулалтын процессыг дуусгана уу",
    mfaAssertionFactorPrompt: "Олон хүчин зүйлтэй баталгаажуулалтын арга сонгоно уу",
    mfaTotpQrCodePrompt: "Энэ QR кодыг баталгаажуулагч аппаараа уншуулна уу",
    mfaTotpEnrollmentVerificationPrompt: "Баталгаажуулагч аппын үүсгэсэн кодыг нэмнэ үү",
  },
} satisfies CompleteTranslationsWithoutLegacy;
