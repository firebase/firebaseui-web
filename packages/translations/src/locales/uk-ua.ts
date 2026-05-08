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

/** Ukrainian UA (uk-UA) translation set. */
export const ukUA = {
  errors: {
    userNotFound: "Акаунт із цією електронною адресою не знайдено",
    wrongPassword: "Невірний пароль",
    invalidEmail: "Введіть дійсну електронну адресу",
    userDisabled: "Цей акаунт вимкнено",
    networkRequestFailed: "Не вдається підключитися до сервера. Перевірте підключення до інтернету",
    tooManyRequests: "Забагато невдалих спроб. Спробуйте знову пізніше",
    missingVerificationCode: "Введіть код підтвердження",
    emailAlreadyInUse: "Акаунт із цією електронною адресою вже існує",
    invalidCredential: "Надані облікові дані недійсні.",
    weakPassword: "Пароль має містити щонайменше 6 символів",
    unverifiedEmail: "Підтвердіть свою електронну адресу, щоб продовжити.",
    operationNotAllowed: "Ця операція не дозволена. Зверніться до служби підтримки.",
    invalidPhoneNumber: "Номер телефону недійсний",
    missingPhoneNumber: "Введіть номер телефону",
    quotaExceeded: "Квоту SMS вичерпано. Спробуйте знову пізніше",
    codeExpired: "Термін дії коду підтвердження закінчився",
    captchaCheckFailed: "Перевірка reCAPTCHA не пройдена. Спробуйте ще раз.",
    missingVerificationId: "Спочатку пройдіть перевірку reCAPTCHA.",
    missingEmail: "Введіть електронну адресу",
    invalidActionCode: "Посилання для скидання пароля недійсне або застаріле",
    credentialAlreadyInUse: "Акаунт із цією електронною адресою вже існує. Увійдіть у цей акаунт.",
    requiresRecentLogin: "Для цієї операції потрібен нещодавній вхід. Увійдіть знову.",
    providerAlreadyLinked: "Цей номер телефону вже пов'язаний з іншим акаунтом",
    invalidVerificationCode: "Недійсний код підтвердження. Спробуйте ще раз",
    unknownError: "Сталася непередбачена помилка",
    popupClosed: "Спливаюче вікно входу було закрито. Спробуйте ще раз.",
    accountExistsWithDifferentCredential:
      "Акаунт із цією електронною адресою вже існує. Увійдіть через початкового постачальника.",
    displayNameRequired: "Введіть ім'я для відображення",
    secondFactorAlreadyInUse: "Цей номер телефону вже зареєстровано в цьому акаунті.",
  },
  messages: {
    passwordResetEmailSent: "Лист для скидання пароля успішно надіслано",
    signInLinkSent: "Посилання для входу успішно надіслано",
    verificationCodeFirst: "Спочатку запросіть код підтвердження",
    checkEmailForReset: "Перевірте електронну пошту для отримання інструкцій зі скидання пароля",
    dividerOr: "або",
    termsAndPrivacy: "Продовжуючи, ви погоджуєтеся з нашими {tos} та {privacy}.",
    mfaSmsAssertionPrompt:
      "Для завершення процесу автентифікації на номер {phoneNumber} буде надіслано код підтвердження.",
  },
  labels: {
    emailAddress: "Електронна адреса",
    password: "Пароль",
    displayName: "Ім'я для відображення",
    forgotPassword: "Забули пароль?",
    signUp: "Зареєструватися",
    signIn: "Увійти",
    resetPassword: "Скинути пароль",
    createAccount: "Створити акаунт",
    backToSignIn: "Повернутися до входу",
    signInWithPhone: "Увійти за допомогою телефону",
    phoneNumber: "Номер телефону",
    verificationCode: "Код підтвердження",
    sendCode: "Надіслати код",
    verifyCode: "Підтвердити код",
    signInWithGoogle: "Увійти через Google",
    signInWithFacebook: "Увійти через Facebook",
    signInWithApple: "Увійти через Apple",
    signInWithMicrosoft: "Увійти через Microsoft",
    signInWithGitHub: "Увійти через GitHub",
    signInWithYahoo: "Увійти через Yahoo",
    signInWithTwitter: "Увійти через X",
    signInWithEmailLink: "Увійти за посиланням з електронної пошти",
    signInWithEmail: "Увійти через електронну пошту",
    sendSignInLink: "Надіслати посилання для входу",
    termsOfService: "Умови використання",
    privacyPolicy: "Політика конфіденційності",
    resendCode: "Надіслати код повторно",
    sending: "Надсилання...",
    multiFactorEnrollment: "Реєстрація багатофакторної автентифікації",
    multiFactorAssertion: "Багатофакторна автентифікація",
    mfaTotpVerification: "Підтвердження TOTP",
    mfaSmsVerification: "Підтвердження за SMS",
    generateQrCode: "Створити QR-код",
  },
  prompts: {
    noAccount: "Немає акаунту?",
    haveAccount: "Вже є акаунт?",
    enterEmailToReset: "Введіть електронну адресу для скидання пароля",
    signInToAccount: "Увійдіть у свій акаунт",
    smsVerificationPrompt: "Введіть код підтвердження, надісланий на ваш номер телефону",
    enterDetailsToCreate: "Введіть свої дані для створення нового акаунту",
    enterPhoneNumber: "Введіть свій номер телефону",
    enterVerificationCode: "Введіть код підтвердження",
    enterEmailForLink: "Введіть електронну адресу для отримання посилання для входу",
    mfaEnrollmentPrompt: "Виберіть новий метод реєстрації багатофакторної автентифікації",
    mfaAssertionPrompt: "Завершіть процес багатофакторної автентифікації",
    mfaAssertionFactorPrompt: "Виберіть метод багатофакторної автентифікації",
    mfaTotpQrCodePrompt: "Відскануйте цей QR-код за допомогою програми автентифікації",
    mfaTotpEnrollmentVerificationPrompt: "Додайте код, згенерований вашою програмою автентифікації",
  },
} satisfies Translations;
