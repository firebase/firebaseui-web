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

/** Bulgarian BG (bg-BG) translation set. */
export const bgBG = {
  errors: {
    userNotFound: "Не е намерен акаунт с този имейл адрес",
    wrongPassword: "Грешна парола",
    invalidEmail: "Моля, въведете валиден имейл адрес",
    userDisabled: "Този акаунт е деактивиран",
    networkRequestFailed: "Неуспешно свързване със сървъра. Моля, проверете интернет връзката си",
    tooManyRequests: "Твърде много неуспешни опити. Моля, опитайте отново по-късно",
    missingVerificationCode: "Моля, въведете кода за потвърждение",
    emailAlreadyInUse: "Вече съществува акаунт с този имейл",
    invalidCredential: "Предоставените идентификационни данни са невалидни.",
    weakPassword: "Паролата трябва да е поне 6 знака",
    unverifiedEmail: "Моля, потвърдете имейл адреса си, за да продължите.",
    operationNotAllowed: "Тази операция не е разрешена. Моля, свържете се с поддръжката.",
    invalidPhoneNumber: "Телефонният номер е невалиден",
    missingPhoneNumber: "Моля, въведете телефонен номер",
    quotaExceeded: "Квотата за SMS е надвишена. Моля, опитайте отново по-късно",
    codeExpired: "Кодът за потвърждение е изтекъл",
    captchaCheckFailed: "Проверката reCAPTCHA е неуспешна. Моля, опитайте отново.",
    missingVerificationId: "Моля, първо завършете проверката reCAPTCHA.",
    missingEmail: "Моля, въведете имейл адрес",
    invalidActionCode: "Връзката за нулиране на паролата е невалидна или е изтекла",
    credentialAlreadyInUse: "Вече съществува акаунт с този имейл. Моля, влезте с него.",
    requiresRecentLogin: "Тази операция изисква скорошно влизане. Моля, влезте отново.",
    providerAlreadyLinked: "Този телефонен номер вече е свързан с друг акаунт",
    invalidVerificationCode: "Невалиден код за потвърждение. Моля, опитайте отново",
    unknownError: "Възникна неочаквана грешка",
    popupClosed: "Изскачащият прозорец за вход беше затворен. Моля, опитайте отново.",
    accountExistsWithDifferentCredential: "Вече съществува акаунт с този имейл. Моля, влезте с оригиналния доставчик.",
    displayNameRequired: "Моля, въведете показвано име",
    secondFactorAlreadyInUse: "Този телефонен номер вече е регистриран в този акаунт.",
  },
  messages: {
    passwordResetEmailSent: "Имейлът за нулиране на паролата е изпратен успешно",
    signInLinkSent: "Връзката за вход е изпратена успешно",
    verificationCodeFirst: "Моля, първо поискайте код за потвърждение",
    checkEmailForReset: "Проверете имейла си за инструкции за нулиране на паролата",
    dividerOr: "или",
    termsAndPrivacy: "Като продължите, вие се съгласявате с нашите {tos} и {privacy}.",
    mfaSmsAssertionPrompt:
      "Код за потвърждение ще бъде изпратен на {phoneNumber} за завършване на процеса на удостоверяване.",
  },
  labels: {
    emailAddress: "Имейл адрес",
    password: "Парола",
    displayName: "Показвано име",
    forgotPassword: "Забравена парола?",
    signUp: "Регистрация",
    signIn: "Вход",
    resetPassword: "Нулиране на парола",
    createAccount: "Създаване на акаунт",
    backToSignIn: "Обратно към входа",
    signInWithPhone: "Вход с телефон",
    phoneNumber: "Телефонен номер",
    verificationCode: "Код за потвърждение",
    sendCode: "Изпращане на код",
    verifyCode: "Потвърждаване на код",
    signInWithGoogle: "Вход с Google",
    signInWithFacebook: "Вход с Facebook",
    signInWithApple: "Вход с Apple",
    signInWithMicrosoft: "Вход с Microsoft",
    signInWithGitHub: "Вход с GitHub",
    signInWithYahoo: "Вход с Yahoo",
    signInWithTwitter: "Вход с X",
    signInWithEmailLink: "Вход с имейл връзка",
    signInWithEmail: "Вход с имейл",
    sendSignInLink: "Изпращане на връзка за вход",
    termsOfService: "Условия за ползване",
    privacyPolicy: "Политика за поверителност",
    resendCode: "Повторно изпращане на код",
    sending: "Изпращане...",
    multiFactorEnrollment: "Регистрация за многофакторна автентикация",
    multiFactorAssertion: "Многофакторна автентикация",
    mfaTotpVerification: "TOTP потвърждение",
    mfaSmsVerification: "SMS потвърждение",
    generateQrCode: "Генериране на QR код",
  },
  prompts: {
    noAccount: "Нямате акаунт?",
    haveAccount: "Вече имате акаунт?",
    enterEmailToReset: "Въведете имейл адреса си, за да нулирате паролата",
    signInToAccount: "Влезте в акаунта си",
    smsVerificationPrompt: "Въведете кода за потвърждение, изпратен на телефонния ви номер",
    enterDetailsToCreate: "Въведете данните си, за да създадете нов акаунт",
    enterPhoneNumber: "Въведете телефонния си номер",
    enterVerificationCode: "Въведете кода за потвърждение",
    enterEmailForLink: "Въведете имейла си, за да получите връзка за вход",
    mfaEnrollmentPrompt: "Изберете нов метод за многофакторна регистрация",
    mfaAssertionPrompt: "Моля, завършете процеса на многофакторна автентикация",
    mfaAssertionFactorPrompt: "Моля, изберете метод за многофакторна автентикация",
    mfaTotpQrCodePrompt: "Сканирайте този QR код с приложението си за удостоверяване",
    mfaTotpEnrollmentVerificationPrompt: "Добавете кода, генериран от приложението ви за удостоверяване",
  },
} satisfies Translations;
