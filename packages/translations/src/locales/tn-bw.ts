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

export const tnBW = {
  errors: {
    userNotFound: "Ga go a fitlhelwa akhaonto e e nang le aderese ya imeile e",
    wrongPassword: "Phasewete e e phoso",
    invalidEmail: "Tsweetswee tsenya aderese ya imeile e e siameng",
    userDisabled: "Akhaonto e e tlositswe",
    networkRequestFailed: "Ga go kgonege go golagana le seva. Tsweetswee lebelela kgokagano ya gago ya inthanete",
    tooManyRequests: "Go nnile le meleko e mentsi e e sa atlegang. Tsweetswee leka gape morago",
    missingVerificationCode: "Tsweetswee tsenya khoutu ya netefatso",
    emailAlreadyInUse: "Go na le akhaonto e e nang le imeile e",
    invalidCredential: "Dikgaolo tse di neilweng ga di siame.",
    weakPassword: "Phasewete e tshwanetse go nna ya dikarolo di le 6 kana go feta",
    unverifiedEmail: "Tsweetswee netefatsa aderese ya gago ya imeile go tswelela.",
    operationNotAllowed: "Tiro e ga e a dumelelwa. Tsweetswee ikgolagane le thuso.",
    invalidPhoneNumber: "Nomoro ya mogala e ga e siame",
    missingPhoneNumber: "Tsweetswee fa nomoro ya mogala",
    quotaExceeded: "Kgaolo ya SMS e fetile. Tsweetswee leka gape morago",
    codeExpired: "Khoutu ya netefatso e feditse",
    captchaCheckFailed: "Netefatso ya reCAPTCHA e paletswe. Tsweetswee leka gape.",
    missingVerificationId: "Tsweetswee feletsa netefatso ya reCAPTCHA pele.",
    missingEmail: "Tsweetswee fa aderese ya imeile",
    invalidActionCode: "Lonaka lwa go baakanya phasewete ga le siame kgotsa le feditse",
    credentialAlreadyInUse: "Go na le akhaonto e e nang le imeile e. Tsweetswee tsena ka akhaonto eo.",
    requiresRecentLogin: "Tiro e tlhoka go tsena sešwa. Tsweetswee tsena gape.",
    providerAlreadyLinked: "Nomoro ya mogala e e setse e kopantswe le akhaonto e nngwe",
    invalidVerificationCode: "Khoutu ya netefatso e ga e siame. Tsweetswee leka gape",
    unknownError: "Phoso e e sa letelelwang e diragetse",
    popupClosed: "Fensetere ya go tsena e kwadiwe. Tsweetswee leka gape.",
    accountExistsWithDifferentCredential:
      "Go na le akhaonto e e nang le imeile e. Tsweetswee tsena ka mokgwa wa tshimologo.",
    displayNameRequired: "Tsweetswee fa leina le le bonalang",
    secondFactorAlreadyInUse: "Nomoro ya mogala e setse e ngodisitswe mo akhaontong e.",
  },
  messages: {
    passwordResetEmailSent: "Imeile ya go baakanya phasewete e romelwa ka katlego",
    signInLinkSent: "Lonaka lwa go tsena lo romeletswe ka katlego",
    verificationCodeFirst: "Tsweetswee kopa khoutu ya netefatso pele",
    checkEmailForReset: "Lebelela imeile ya gago go bona dikgato tsa go baakanya phasewete",
    dividerOr: "kgotsa",
    termsAndPrivacy: "Ka go tswelela, o dumalana le {tos} le {privacy} tsa rona.",
    mfaSmsAssertionPrompt: "Khoutu ya netefatso e tla romelwa go {phoneNumber} go feletsa tiro ya netefatso.",
  },
  labels: {
    emailAddress: "Aderese ya Imeile",
    password: "Phasewete",
    displayName: "Leina le le Bonalang",
    forgotPassword: "O lebetse phasewete?",
    signUp: "Ikwadisa",
    signIn: "Tsena",
    resetPassword: "Baakanya Phasewete",
    createAccount: "Dira Akhaonto",
    backToSignIn: "Boela go Tsena",
    signInWithPhone: "Tsena ka Mogala",
    phoneNumber: "Nomoro ya Mogala",
    verificationCode: "Khoutu ya Netefatso",
    sendCode: "Romela Khoutu",
    verifyCode: "Netefatsa Khoutu",
    signInWithGoogle: "Tsena ka Google",
    signInWithFacebook: "Tsena ka Facebook",
    signInWithApple: "Tsena ka Apple",
    signInWithMicrosoft: "Tsena ka Microsoft",
    signInWithGitHub: "Tsena ka GitHub",
    signInWithYahoo: "Tsena ka Yahoo",
    signInWithTwitter: "Tsena ka X",
    signInWithEmailLink: "Tsena ka Lonaka lwa Imeile",
    sendSignInLink: "Romela Lonaka lwa Go Tsena",
    termsOfService: "Melawana ya Tirelo",
    privacyPolicy: "Leano la Sephiri",
    resendCode: "Romela Khoutu Gape",
    sending: "E romelwa...",
    dismiss: "Tswala",
    multiFactorEnrollment: "Ikwadisetsa Dikgato Tse Dintsi",
    multiFactorAssertion: "Netefatso ya Dikgato Tse Dintsi",
    mfaTotpVerification: "Netefatso ya TOTP",
    mfaSmsVerification: "Netefatso ya SMS",
    generateQrCode: "Dira Khoutu ya QR",
  },
  prompts: {
    noAccount: "Ga o na akhaonto?",
    haveAccount: "O setse o na le akhaonto?",
    enterEmailToReset: "Tsenya aderese ya gago ya imeile go baakanya phasewete ya gago",
    signInToAccount: "Tsena mo akhaontong ya gago",
    smsVerificationPrompt: "Tsenya khoutu ya netefatso e e romelwang nomoro ya gago ya mogala",
    enterDetailsToCreate: "Tsenya dintlha tsa gago go dira akhaonto e ntšha",
    enterPhoneNumber: "Tsenya nomoro ya gago ya mogala",
    enterVerificationCode: "Tsenya khoutu ya netefatso",
    enterEmailForLink: "Tsenya imeile ya gago go amogela lonaka lwa go tsena",
    mfaEnrollmentPrompt: "Tlhopha mokgwa o mosha wa go ikwadisa dikgato tse dintsi",
    mfaAssertionPrompt: "Tsweetswee feletsa tiro ya netefatso ya dikgato tse dintsi",
    mfaAssertionFactorPrompt: "Tsweetswee tlhopha mokgwa wa netefatso ya dikgato tse dintsi",
    mfaTotpQrCodePrompt: "Ska khoutu ya QR e ka lenaneo la gago la authenticator",
    mfaTotpEnrollmentVerificationPrompt: "Tsenya khoutu e e tlhagisitsweng ke lenaneo la gago la authenticator",
  },
} satisfies StrictTranslations;
