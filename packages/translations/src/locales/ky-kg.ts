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

export const kyKG = {
  errors: {
    userNotFound: "Бул электрондук почта дарегі менен аккаунт табылган жок",
    wrongPassword: "Сырсөз туура эмес",
    invalidEmail: "Сураныч, жарактуу электрондук почта дарегин киргизиңиз",
    userDisabled: "Бул аккаунт өчүрүлгөн",
    networkRequestFailed: "Серверге туташуу мүмкүн болгон жок. Сураныч, интернет байланышыңызды текшериңиз",
    tooManyRequests: "Ийгиликсиз аракеттер өтө көп. Сураныч, кийинчерээк кайра аракет кылыңыз",
    missingVerificationCode: "Сураныч, ырастоо кодун киргизиңиз",
    emailAlreadyInUse: "Бул электрондук почта менен аккаунт мурунтан бар",
    invalidCredential: "Берилген маалыматтар жарактуу эмес.",
    weakPassword: "Сырсөз кеминде 6 белгиден турушу керек",
    unverifiedEmail: "Сураныч, улантуу үчүн электрондук почта дарегиңизди ырастаңыз.",
    operationNotAllowed: "Бул операцияга уруксат берилген эмес. Сураныч, колдоо кызматына кайрылыңыз.",
    invalidPhoneNumber: "Телефон номери жараксыз",
    missingPhoneNumber: "Сураныч, телефон номерин киргизиңиз",
    quotaExceeded: "SMS квотасы ашып кетти. Сураныч, кийинчерээк кайра аракет кылыңыз",
    codeExpired: "Ырастоо кодунун мөөнөтү бүттү",
    captchaCheckFailed: "reCAPTCHA текшерүүсү ийгиликсиз болду. Сураныч, кайра аракет кылыңыз.",
    missingVerificationId: "Сураныч, адегенде reCAPTCHA текшерүүсүн аяктаңыз.",
    missingEmail: "Сураныч, электрондук почта дарегин киргизиңиз",
    invalidActionCode: "Сырсөздү калыбына келтирүү шилтемеси жараксыз же мөөнөтү бүткөн",
    credentialAlreadyInUse: "Бул электрондук почта менен аккаунт мурунтан бар. Сураныч, ошол аккаунт менен кириңиз.",
    requiresRecentLogin: "Бул операция жакында кирүүнү талап кылат. Сураныч, кайра кириңиз.",
    providerAlreadyLinked: "Бул телефон номери башка аккаунтка мурунтан байланышкан",
    invalidVerificationCode: "Ырастоо коду жараксыз. Сураныч, кайра аракет кылыңыз",
    unknownError: "Күтүлбөгөн ката кетти",
    popupClosed: "Кирүү терезеси жабылды. Сураныч, кайра аракет кылыңыз.",
    accountExistsWithDifferentCredential:
      "Бул электрондук почта менен аккаунт мурунтан бар. Сураныч, баштапкы провайдер менен кириңиз.",
    displayNameRequired: "Сураныч, көрсөтүлүүчү атты киргизиңиз",
    secondFactorAlreadyInUse: "Бул телефон номери бул аккаунтта мурунтан катталган.",
  },
  messages: {
    passwordResetEmailSent: "Сырсөздү калыбына келтирүү каты ийгиликтүү жөнөтүлдү",
    signInLinkSent: "Кирүү шилтемеси ийгиликтүү жөнөтүлдү",
    verificationCodeFirst: "Сураныч, адегенде ырастоо кодун суранып коюңуз",
    checkEmailForReset: "Сырсөздү калыбына келтирүү боюнча нускамалар үчүн электрондук почтаңызды текшериңиз",
    dividerOr: "же",
    termsAndPrivacy: "Улантуу менен сиз биздин {tos} жана {privacy} менен макул болосуз.",
    mfaSmsAssertionPrompt: "Аутентификация процессин аяктоо үчүн {phoneNumber} номерине ырастоо коду жөнөтүлөт.",
  },
  labels: {
    emailAddress: "Электрондук почта дареги",
    password: "Сырсөз",
    displayName: "Көрсөтүлүүчү аты",
    forgotPassword: "Сырсөздү унутуп калдыңызбы?",
    signUp: "Катталуу",
    signIn: "Кирүү",
    resetPassword: "Сырсөздү калыбына келтирүү",
    createAccount: "Аккаунт түзүү",
    backToSignIn: "Кирүүгө кайтуу",
    signInWithPhone: "Телефон менен кирүү",
    phoneNumber: "Телефон номери",
    verificationCode: "Ырастоо коду",
    sendCode: "Код жөнөтүү",
    verifyCode: "Кодту ырастоо",
    signInWithGoogle: "Google менен кирүү",
    signInWithFacebook: "Facebook менен кирүү",
    signInWithApple: "Apple менен кирүү",
    signInWithMicrosoft: "Microsoft менен кирүү",
    signInWithGitHub: "GitHub менен кирүү",
    signInWithYahoo: "Yahoo менен кирүү",
    signInWithTwitter: "X менен кирүү",
    signInWithEmailLink: "Электрондук почта шилтемеси менен кирүү",
    sendSignInLink: "Кирүү шилтемесин жөнөтүү",
    termsOfService: "Кызмат көрсөтүү шарттары",
    privacyPolicy: "Купуялуулук саясаты",
    resendCode: "Кодту кайра жөнөтүү",
    sending: "Жөнөтүлүүдө...",
    multiFactorEnrollment: "Көп факторлуу катталуу",
    multiFactorAssertion: "Көп факторлуу аутентификация",
    mfaTotpVerification: "TOTP ырастоо",
    mfaSmsVerification: "SMS ырастоо",
    generateQrCode: "QR код түзүү",
  },
  prompts: {
    noAccount: "Аккаунтуңуз жокпу?",
    haveAccount: "Аккаунтуңуз барбы?",
    enterEmailToReset: "Сырсөзүңүздү калыбына келтирүү үчүн электрондук почта дарегиңизди киргизиңиз",
    signInToAccount: "Аккаунтуңузга кириңиз",
    smsVerificationPrompt: "Телефон номериңизге жөнөтүлгөн ырастоо кодун киргизиңиз",
    enterDetailsToCreate: "Жаңы аккаунт түзүү үчүн маалыматыңызды киргизиңиз",
    enterPhoneNumber: "Телефон номериңизди киргизиңиз",
    enterVerificationCode: "Ырастоо кодун киргизиңиз",
    enterEmailForLink: "Кирүү шилтемесин алуу үчүн электрондук почтаңызды киргизиңиз",
    mfaEnrollmentPrompt: "Көп факторлуу катталуунун жаңы ыкмасын тандаңыз",
    mfaAssertionPrompt: "Сураныч, көп факторлуу аутентификация процессин аяктаңыз",
    mfaAssertionFactorPrompt: "Сураныч, көп факторлуу аутентификация ыкмасын тандаңыз",
    mfaTotpQrCodePrompt: "Бул QR кодун аутентификатор колдонмоңуз менен сканерлеңиз",
    mfaTotpEnrollmentVerificationPrompt: "Аутентификатор колдонмоңуз жараткан кодту кошуңуз",
  },
} satisfies Translations;
