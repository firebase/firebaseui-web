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

/** Serbian RS (sr-RS) translation set. */
export const srRS = {
  errors: {
    userNotFound: "Није пронађен налог са овом адресом е-поште",
    wrongPassword: "Погрешна лозинка",
    invalidEmail: "Унесите важећу адресу е-поште",
    userDisabled: "Овај налог је онемогућен",
    networkRequestFailed: "Није могуће повезати се са сервером. Проверите интернет везу",
    tooManyRequests: "Превише неуспешних покушаја. Покушајте поново касније",
    missingVerificationCode: "Унесите код за верификацију",
    emailAlreadyInUse: "Налог са овом е-поштом већ постоји",
    invalidCredential: "Наведени акредитиви нису важећи.",
    weakPassword: "Лозинка мора имати најмање 6 знакова",
    unverifiedEmail: "Верификујте адресу е-поште да бисте наставили.",
    operationNotAllowed: "Ова операција није дозвољена. Контактирајте подршку.",
    invalidPhoneNumber: "Број телефона није важећи",
    missingPhoneNumber: "Унесите број телефона",
    quotaExceeded: "Квота СМС-а је прекорачена. Покушајте поново касније",
    codeExpired: "Код за верификацију је истекао",
    captchaCheckFailed: "Верификација reCAPTCHA није успела. Покушајте поново.",
    missingVerificationId: "Прво довршите reCAPTCHA верификацију.",
    missingEmail: "Унесите адресу е-поште",
    invalidActionCode: "Веза за ресетовање лозинке није важећа или је истекла",
    credentialAlreadyInUse: "Налог са овом е-поштом већ постоји. Пријавите се са тим налогом.",
    requiresRecentLogin: "Ова операција захтева недавну пријаву. Пријавите се поново.",
    providerAlreadyLinked: "Овај број телефона је већ повезан са другим налогом",
    invalidVerificationCode: "Неважећи код за верификацију. Покушајте поново",
    unknownError: "Дошло је до неочекиване грешке",
    popupClosed: "Искачући прозор за пријаву је затворен. Покушајте поново.",
    accountExistsWithDifferentCredential:
      "Налог са овом е-поштом већ постоји. Пријавите се са оригиналним провајдером.",
    displayNameRequired: "Унесите приказано име",
    secondFactorAlreadyInUse: "Овај број телефона је већ регистрован на овом налогу.",
  },
  messages: {
    passwordResetEmailSent: "Е-пошта за ресетовање лозинке је успешно послата",
    signInLinkSent: "Веза за пријаву је успешно послата",
    verificationCodeFirst: "Прво затражите код за верификацију",
    checkEmailForReset: "Проверите е-пошту за упутства за ресетовање лозинке",
    dividerOr: "или",
    termsAndPrivacy: "Наставком прихватате наше {tos} и {privacy}.",
    mfaSmsAssertionPrompt:
      "Код за верификацију ће бити послат на {phoneNumber} ради довршетка процеса аутентификације.",
  },
  labels: {
    emailAddress: "Адреса е-поште",
    password: "Лозинка",
    displayName: "Приказано име",
    forgotPassword: "Заборавили сте лозинку?",
    signUp: "Регистрација",
    signIn: "Пријава",
    resetPassword: "Ресетуј лозинку",
    createAccount: "Направи налог",
    backToSignIn: "Назад на пријаву",
    signInWithPhone: "Пријава телефоном",
    phoneNumber: "Број телефона",
    verificationCode: "Код за верификацију",
    sendCode: "Пошаљи код",
    verifyCode: "Верификуј код",
    signInWithGoogle: "Пријава преко Google-а",
    signInWithFacebook: "Пријава преко Facebook-а",
    signInWithApple: "Пријава преко Apple-а",
    signInWithMicrosoft: "Пријава преко Microsoft-а",
    signInWithGitHub: "Пријава преко GitHub-а",
    signInWithYahoo: "Пријава преко Yahoo-а",
    signInWithTwitter: "Пријава преко X-а",
    signInWithEmailLink: "Пријава везом е-поште",
    signInWithEmail: "Пријава е-поштом",
    sendSignInLink: "Пошаљи везу за пријаву",
    termsOfService: "Услови коришћења",
    privacyPolicy: "Политика приватности",
    resendCode: "Поново пошаљи код",
    sending: "Слање...",
    multiFactorEnrollment: "Вишефакторска регистрација",
    multiFactorAssertion: "Вишефакторска аутентификација",
    mfaTotpVerification: "TOTP верификација",
    mfaSmsVerification: "СМС верификација",
    generateQrCode: "Генериши QR код",
  },
  prompts: {
    noAccount: "Немате налог?",
    haveAccount: "Већ имате налог?",
    enterEmailToReset: "Унесите адресу е-поште за ресетовање лозинке",
    signInToAccount: "Пријавите се на свој налог",
    smsVerificationPrompt: "Унесите код за верификацију послат на ваш број телефона",
    enterDetailsToCreate: "Унесите своје податке за креирање новог налога",
    enterPhoneNumber: "Унесите свој број телефона",
    enterVerificationCode: "Унесите код за верификацију",
    enterEmailForLink: "Унесите своју е-пошту за примање везе за пријаву",
    mfaEnrollmentPrompt: "Изаберите нову методу вишефакторске регистрације",
    mfaAssertionPrompt: "Довршите процес вишефакторске аутентификације",
    mfaAssertionFactorPrompt: "Изаберите методу вишефакторске аутентификације",
    mfaTotpQrCodePrompt: "Скенирајте овај QR код помоћу апликације за аутентификацију",
    mfaTotpEnrollmentVerificationPrompt: "Додајте код генерисан вашом апликацијом за аутентификацију",
  },
} satisfies Translations;
