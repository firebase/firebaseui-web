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

/** Russian RU (ru-RU) translation set. */
export const ruRU = {
  errors: {
    userNotFound: "Аккаунт с этим адресом электронной почты не найден",
    wrongPassword: "Неверный пароль",
    invalidEmail: "Введите действительный адрес электронной почты",
    userDisabled: "Этот аккаунт был отключён",
    networkRequestFailed: "Не удаётся подключиться к серверу. Проверьте подключение к интернету",
    tooManyRequests: "Слишком много неудачных попыток. Повторите попытку позже",
    missingVerificationCode: "Введите код подтверждения",
    emailAlreadyInUse: "Аккаунт с этим адресом электронной почты уже существует",
    invalidCredential: "Предоставленные учётные данные недействительны.",
    weakPassword: "Пароль должен содержать не менее 6 символов",
    unverifiedEmail: "Подтвердите адрес электронной почты, чтобы продолжить.",
    operationNotAllowed: "Эта операция не разрешена. Обратитесь в службу поддержки.",
    invalidPhoneNumber: "Номер телефона недействителен",
    missingPhoneNumber: "Укажите номер телефона",
    quotaExceeded: "Квота SMS исчерпана. Повторите попытку позже",
    codeExpired: "Срок действия кода подтверждения истёк",
    captchaCheckFailed: "Проверка reCAPTCHA не пройдена. Повторите попытку.",
    missingVerificationId: "Сначала пройдите проверку reCAPTCHA.",
    missingEmail: "Укажите адрес электронной почты",
    invalidActionCode: "Ссылка для сброса пароля недействительна или устарела",
    credentialAlreadyInUse: "Аккаунт с этим адресом электронной почты уже существует. Войдите в этот аккаунт.",
    requiresRecentLogin: "Для этой операции требуется недавний вход. Войдите снова.",
    providerAlreadyLinked: "Этот номер телефона уже привязан к другому аккаунту",
    invalidVerificationCode: "Недействительный код подтверждения. Повторите попытку",
    unknownError: "Произошла непредвиденная ошибка",
    popupClosed: "Всплывающее окно входа было закрыто. Повторите попытку.",
    accountExistsWithDifferentCredential:
      "Аккаунт с этим адресом электронной почты уже существует. Войдите через исходного поставщика.",
    displayNameRequired: "Укажите отображаемое имя",
    secondFactorAlreadyInUse: "Этот номер телефона уже зарегистрирован в этом аккаунте.",
  },
  messages: {
    passwordResetEmailSent: "Письмо для сброса пароля успешно отправлено",
    signInLinkSent: "Ссылка для входа успешно отправлена",
    verificationCodeFirst: "Сначала запросите код подтверждения",
    checkEmailForReset: "Проверьте электронную почту для получения инструкций по сбросу пароля",
    dividerOr: "или",
    termsAndPrivacy: "Продолжая, вы соглашаетесь с нашими {tos} и {privacy}.",
    mfaSmsAssertionPrompt:
      "Для завершения процесса аутентификации код подтверждения будет отправлен на номер {phoneNumber}.",
  },
  labels: {
    emailAddress: "Адрес электронной почты",
    password: "Пароль",
    displayName: "Отображаемое имя",
    forgotPassword: "Забыли пароль?",
    signUp: "Зарегистрироваться",
    signIn: "Войти",
    resetPassword: "Сбросить пароль",
    createAccount: "Создать аккаунт",
    backToSignIn: "Вернуться ко входу",
    signInWithPhone: "Войти по телефону",
    phoneNumber: "Номер телефона",
    verificationCode: "Код подтверждения",
    sendCode: "Отправить код",
    verifyCode: "Подтвердить код",
    signInWithGoogle: "Войти через Google",
    signInWithFacebook: "Войти через Facebook",
    signInWithApple: "Войти через Apple",
    signInWithMicrosoft: "Войти через Microsoft",
    signInWithGitHub: "Войти через GitHub",
    signInWithYahoo: "Войти через Yahoo",
    signInWithTwitter: "Войти через X",
    signInWithEmailLink: "Войти по ссылке из письма",
    signInWithEmail: "Войти через электронную почту",
    sendSignInLink: "Отправить ссылку для входа",
    termsOfService: "Условия использования",
    privacyPolicy: "Политика конфиденциальности",
    resendCode: "Отправить код повторно",
    sending: "Отправка...",
    multiFactorEnrollment: "Регистрация многофакторной аутентификации",
    multiFactorAssertion: "Многофакторная аутентификация",
    mfaTotpVerification: "Подтверждение TOTP",
    mfaSmsVerification: "Подтверждение по SMS",
    generateQrCode: "Создать QR-код",
  },
  prompts: {
    noAccount: "Нет аккаунта?",
    haveAccount: "Уже есть аккаунт?",
    enterEmailToReset: "Введите адрес электронной почты для сброса пароля",
    signInToAccount: "Войдите в свой аккаунт",
    smsVerificationPrompt: "Введите код подтверждения, отправленный на ваш номер телефона",
    enterDetailsToCreate: "Введите данные для создания нового аккаунта",
    enterPhoneNumber: "Введите номер телефона",
    enterVerificationCode: "Введите код подтверждения",
    enterEmailForLink: "Введите электронную почту для получения ссылки для входа",
    mfaEnrollmentPrompt: "Выберите новый метод регистрации многофакторной аутентификации",
    mfaAssertionPrompt: "Завершите процесс многофакторной аутентификации",
    mfaAssertionFactorPrompt: "Выберите метод многофакторной аутентификации",
    mfaTotpQrCodePrompt: "Отсканируйте этот QR-код приложением для аутентификации",
    mfaTotpEnrollmentVerificationPrompt: "Добавьте код, сгенерированный приложением для аутентификации",
  },
} satisfies Translations;
