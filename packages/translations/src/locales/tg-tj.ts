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

export const tgTJ = {
  errors: {
    userNotFound: "Ҳисоб бо ин суроғаи почтаи электронӣ ёфт нашуд",
    wrongPassword: "Парол нодуруст аст",
    invalidEmail: "Лутфан, суроғаи дурусти почтаи электронӣ ворид кунед",
    userDisabled: "Ин ҳисоб ғайрифаъол карда шудааст",
    networkRequestFailed: "Пайваст шудан ба сервер муяссар нашуд. Лутфан, пайвастшавии интернетро санҷед",
    tooManyRequests: "Кӯшишҳои нописанд аз ҳад зиёд. Лутфан, баъдтар дубора кӯшиш кунед",
    missingVerificationCode: "Лутфан, рамзи тасдиқро ворид кунед",
    emailAlreadyInUse: "Ҳисоб бо ин почтаи электронӣ аллакай мавҷуд аст",
    invalidCredential: "Маълумоти ворид шудан нодуруст аст.",
    weakPassword: "Парол бояд ҳадди ақал аз 6 аломат иборат бошад",
    unverifiedEmail: "Лутфан, барои идома додан суроғаи почтаи электронии худро тасдиқ кунед.",
    operationNotAllowed: "Ин амал иҷозат дода нашудааст. Лутфан, бо дастгирӣ тамос гиред.",
    invalidPhoneNumber: "Рақами телефон нодуруст аст",
    missingPhoneNumber: "Лутфан, рақами телефонро ворид кунед",
    quotaExceeded: "Квотаи SMS аз ҳад гузашт. Лутфан, баъдтар дубора кӯшиш кунед",
    codeExpired: "Мӯҳлати рамзи тасдиқ гузаштааст",
    captchaCheckFailed: "Тасдиқи reCAPTCHA нокам шуд. Лутфан, дубора кӯшиш кунед.",
    missingVerificationId: "Лутфан, аввал тасдиқи reCAPTCHA-ро анҷом диҳед.",
    missingEmail: "Лутфан, суроғаи почтаи электронӣ ворид кунед",
    invalidActionCode: "Пайванди барқароркунии парол нодуруст аст ё мӯҳлаташ гузаштааст",
    credentialAlreadyInUse: "Ҳисоб бо ин почтаи электронӣ аллакай мавҷуд аст. Лутфан, бо ҳамин ҳисоб ворид шавед.",
    requiresRecentLogin: "Ин амал ворид шудани навро талаб мекунад. Лутфан, дубора ворид шавед.",
    providerAlreadyLinked: "Ин рақами телефон аллакай ба ҳисоби дигар пайваст шудааст",
    invalidVerificationCode: "Рамзи тасдиқ нодуруст аст. Лутфан, дубора кӯшиш кунед",
    unknownError: "Хатои ғайричашмдошт рух дод",
    popupClosed: "Равзанаи ворид шудан баста шуд. Лутфан, дубора кӯшиш кунед.",
    accountExistsWithDifferentCredential:
      "Ҳисоб бо ин почтаи электронӣ аллакай мавҷуд аст. Лутфан, бо провайдери аслӣ ворид шавед.",
    displayNameRequired: "Лутфан, номи намоиширо ворид кунед",
    secondFactorAlreadyInUse: "Ин рақами телефон аллакай ба ин ҳисоб бақайд гирифта шудааст.",
  },
  messages: {
    passwordResetEmailSent: "Почтаи барқароркунии парол бомуваффақият фиристода шуд",
    signInLinkSent: "Пайванди ворид шудан бомуваффақият фиристода шуд",
    verificationCodeFirst: "Лутфан, аввал рамзи тасдиқро дархост кунед",
    checkEmailForReset: "Барои дастурҳои барқароркунии парол почтаи электронии худро санҷед",
    dividerOr: "ё",
    termsAndPrivacy: "Бо идома додан шумо ба {tos} ва {privacy}-и мо розӣ мешавед.",
    mfaSmsAssertionPrompt: "Барои анҷом додани раванди тасдиқ, рамзи тасдиқ ба {phoneNumber} фиристода мешавад.",
  },
  labels: {
    emailAddress: "Суроғаи почтаи электронӣ",
    password: "Парол",
    displayName: "Номи намоишӣ",
    forgotPassword: "Паролро фаромӯш кардед?",
    signUp: "Бақайдгирӣ",
    signIn: "Ворид шудан",
    resetPassword: "Барқарор кардани парол",
    createAccount: "Эҷоди ҳисоб",
    backToSignIn: "Бозгашт ба ворид шудан",
    signInWithPhone: "Ворид шудан бо телефон",
    phoneNumber: "Рақами телефон",
    verificationCode: "Рамзи тасдиқ",
    sendCode: "Фиристодани рамз",
    verifyCode: "Тасдиқи рамз",
    signInWithGoogle: "Ворид шудан бо Google",
    signInWithFacebook: "Ворид шудан бо Facebook",
    signInWithApple: "Ворид шудан бо Apple",
    signInWithMicrosoft: "Ворид шудан бо Microsoft",
    signInWithGitHub: "Ворид шудан бо GitHub",
    signInWithYahoo: "Ворид шудан бо Yahoo",
    signInWithTwitter: "Ворид шудан бо X",
    signInWithEmailLink: "Ворид шудан бо пайванди почта",
    sendSignInLink: "Фиристодани пайванди ворид шудан",
    termsOfService: "Шартҳои истифода",
    privacyPolicy: "Сиёсати махфият",
    resendCode: "Аз нав фиристодани рамз",
    sending: "Фиристода мешавад...",
    dismiss: "Пӯшед",
    multiFactorEnrollment: "Бақайдгирии бисёромилӣ",
    multiFactorAssertion: "Тасдиқи бисёромилӣ",
    mfaTotpVerification: "Тасдиқи TOTP",
    mfaSmsVerification: "Тасдиқи SMS",
    generateQrCode: "Тавлиди рамзи QR",
  },
  prompts: {
    noAccount: "Ҳисоб надоред?",
    haveAccount: "Аллакай ҳисоб доред?",
    enterEmailToReset: "Барои барқарор кардани парол суроғаи почтаи электронии худро ворид кунед",
    signInToAccount: "Ба ҳисоби худ ворид шавед",
    smsVerificationPrompt: "Рамзи тасдиқеро, ки ба рақами телефони шумо фиристода шудааст, ворид кунед",
    enterDetailsToCreate: "Барои эҷоди ҳисоби нав маълумоти худро ворид кунед",
    enterPhoneNumber: "Рақами телефони худро ворид кунед",
    enterVerificationCode: "Рамзи тасдиқро ворид кунед",
    enterEmailForLink: "Барои гирифтани пайванди ворид шудан почтаи электронии худро ворид кунед",
    mfaEnrollmentPrompt: "Усули нави бақайдгирии бисёромилиро интихоб кунед",
    mfaAssertionPrompt: "Лутфан, раванди тасдиқи бисёромилиро анҷом диҳед",
    mfaAssertionFactorPrompt: "Лутфан, усули тасдиқи бисёромилиро интихоб кунед",
    mfaTotpQrCodePrompt: "Ин рамзи QR-ро бо барномаи аутентификатори худ скан кунед",
    mfaTotpEnrollmentVerificationPrompt:
      "Рамзе, ки аз ҷониби барномаи аутентификатори шумо тавлид шудааст, илова кунед",
  },
} satisfies StrictTranslations;
