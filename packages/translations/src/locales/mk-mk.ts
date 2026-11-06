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

export const mkMK = {
  errors: {
    userNotFound: "Не е пронајдена сметка со оваа е-пошта адреса",
    wrongPassword: "Погрешна лозинка",
    invalidEmail: "Внесете валидна е-пошта адреса",
    userDisabled: "Оваа сметка е оневозможена",
    networkRequestFailed: "Не може да се поврзе со серверот. Проверете ја вашата интернет врска",
    tooManyRequests: "Премногу неуспешни обиди. Обидете се повторно подоцна",
    missingVerificationCode: "Внесете го кодот за верификација",
    emailAlreadyInUse: "Веќе постои сметка со оваа е-пошта",
    invalidCredential: "Дадените акредитиви се невалидни.",
    weakPassword: "Лозинката треба да има најмалку 6 знаци",
    unverifiedEmail: "Верификувајте ја вашата е-пошта адреса за да продолжите.",
    operationNotAllowed: "Оваа операција не е дозволена. Контактирајте ја поддршката.",
    invalidPhoneNumber: "Телефонскиот број е невалиден",
    missingPhoneNumber: "Внесете телефонски број",
    quotaExceeded: "Квотата за SMS е премината. Обидете се повторно подоцна",
    codeExpired: "Кодот за верификација е истечен",
    captchaCheckFailed: "Верификацијата со reCAPTCHA не успеа. Обидете се повторно.",
    missingVerificationId: "Прво завршете ја верификацијата со reCAPTCHA.",
    missingEmail: "Внесете е-пошта адреса",
    invalidActionCode: "Врската за промена на лозинката е невалидна или истечена",
    credentialAlreadyInUse: "Веќе постои сметка со оваа е-пошта. Најавете се со таа сметка.",
    requiresRecentLogin: "Оваа операција бара неодамнешна најава. Најавете се повторно.",
    providerAlreadyLinked: "Овој телефонски број е веќе поврзан со друга сметка",
    invalidVerificationCode: "Невалиден код за верификација. Обидете се повторно",
    unknownError: "Настана неочекувана грешка",
    popupClosed: "Прозорецот за најава е затворен. Обидете се повторно.",
    accountExistsWithDifferentCredential: "Веќе постои сметка со оваа е-пошта. Најавете се со оригиналниот провајдер.",
    displayNameRequired: "Внесете прикажително име",
    secondFactorAlreadyInUse: "Овој телефонски број е веќе регистриран на оваа сметка.",
  },
  messages: {
    passwordResetEmailSent: "Е-поштата за промена на лозинката е испратена успешно",
    signInLinkSent: "Линкот за најава е испратен успешно",
    verificationCodeFirst: "Прво побарајте код за верификација",
    checkEmailForReset: "Проверете ја вашата е-пошта за упатства за промена на лозинката",
    dividerOr: "или",
    termsAndPrivacy: "Со продолжување се согласувате со нашите {tos} и {privacy}.",
    mfaSmsAssertionPrompt:
      "Код за верификација ќе биде испратен на {phoneNumber} за да се заврши процесот на автентикација.",
  },
  labels: {
    emailAddress: "Е-пошта адреса",
    password: "Лозинка",
    displayName: "Прикажително име",
    forgotPassword: "Заборавена лозинка?",
    signUp: "Регистрирај се",
    signIn: "Најава",
    resetPassword: "Промени лозинка",
    createAccount: "Креирај сметка",
    backToSignIn: "Назад кон најава",
    signInWithPhone: "Најава со телефон",
    phoneNumber: "Телефонски број",
    verificationCode: "Код за верификација",
    sendCode: "Испрати код",
    verifyCode: "Верификувај код",
    signInWithGoogle: "Најава со Google",
    signInWithFacebook: "Најава со Facebook",
    signInWithApple: "Најава со Apple",
    signInWithMicrosoft: "Најава со Microsoft",
    signInWithGitHub: "Најава со GitHub",
    signInWithYahoo: "Најава со Yahoo",
    signInWithTwitter: "Најава со X",
    signInWithEmailLink: "Најава со линк на е-пошта",
    sendSignInLink: "Испрати линк за најава",
    termsOfService: "Услови за користење",
    privacyPolicy: "Политика за приватност",
    resendCode: "Повторно испрати код",
    sending: "Се испраќа...",
    dismiss: "Затвори",
    multiFactorEnrollment: "Регистрација за повеќефакторна автентикација",
    multiFactorAssertion: "Повеќефакторна автентикација",
    mfaTotpVerification: "TOTP верификација",
    mfaSmsVerification: "SMS верификација",
    generateQrCode: "Генерирај QR код",
  },
  prompts: {
    noAccount: "Немате сметка?",
    haveAccount: "Веќе имате сметка?",
    enterEmailToReset: "Внесете ја вашата е-пошта адреса за да ја промените лозинката",
    signInToAccount: "Најавете се на вашата сметка",
    smsVerificationPrompt: "Внесете го кодот за верификација испратен на вашиот телефонски број",
    enterDetailsToCreate: "Внесете ги вашите податоци за да креирате нова сметка",
    enterPhoneNumber: "Внесете го вашиот телефонски број",
    enterVerificationCode: "Внесете го кодот за верификација",
    enterEmailForLink: "Внесете ја вашата е-пошта за да добиете линк за најава",
    mfaEnrollmentPrompt: "Изберете нов метод за повеќефакторна регистрација",
    mfaAssertionPrompt: "Завршете го процесот на повеќефакторна автентикација",
    mfaAssertionFactorPrompt: "Изберете метод за повеќефакторна автентикација",
    mfaTotpQrCodePrompt: "Скенирајте го овој QR код со вашата апликација за автентикација",
    mfaTotpEnrollmentVerificationPrompt: "Внесете го кодот генериран од вашата апликација за автентикација",
  },
} satisfies CompleteTranslationsWithoutLegacy;
