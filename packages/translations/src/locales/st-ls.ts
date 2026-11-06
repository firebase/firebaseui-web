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

export const stLS = {
  errors: {
    userNotFound: "Ha ho akhaonte e fumanoang ka aterese ena ea imeile",
    wrongPassword: "Phasewete e fosahetseng",
    invalidEmail: "Ka kopo kenya aterese ea imeile e nepahetseng",
    userDisabled: "Akhaonte ena e tlositsoe ts'ebetsong",
    networkRequestFailed: "Ha ho khonehe ho ikopanya le seva. Ka kopo hlahloba marang-rang a hau a inthanete",
    tooManyRequests: "Liteko tse ngata tse hlolehileng. Ka kopo leka hape hamorao",
    missingVerificationCode: "Ka kopo kenya khoutu ea netefatso",
    emailAlreadyInUse: "Akhaonte e sa tsoa ba teng ka imeile ena",
    invalidCredential: "Litlhaku tse fanoeng ha li nepahale.",
    weakPassword: "Phasewete e tlameha ho ba le litlhaku tse ka tlase ho 6",
    unverifiedEmail: "Ka kopo netefatsa aterese ea hau ea imeile ho tsoela pele.",
    operationNotAllowed: "Ts'ebetso ena ha e lumelloe. Ka kopo ikopanye le tšehetso.",
    invalidPhoneNumber: "Nomoro ea mohala ha e nepahale",
    missingPhoneNumber: "Ka kopo fana ka nomoro ea mohala",
    quotaExceeded: "Kota ea SMS e fetile. Ka kopo leka hape hamorao",
    codeExpired: "Khoutu ea netefatso e felile",
    captchaCheckFailed: "Netefatso ea reCAPTCHA e hlolehile. Ka kopo leka hape.",
    missingVerificationId: "Ka kopo qala u phethe netefatso ea reCAPTCHA.",
    missingEmail: "Ka kopo fana ka aterese ea imeile",
    invalidActionCode: "Sehokelo sa ho seta phasewete hape ha se nepahale kapa se felile",
    credentialAlreadyInUse: "Akhaonte e sa tsoa ba teng ka imeile ena. Ka kopo kena ka akhaonte eo.",
    requiresRecentLogin: "Ts'ebetso ena e hloka ho kena ka nako e khutšoanyane. Ka kopo kena hape.",
    providerAlreadyLinked: "Nomoro ena ea mohala e sa tsoa hokelloa akhaonte e 'ngoe",
    invalidVerificationCode: "Khoutu ea netefatso ha e nepahale. Ka kopo leka hape",
    unknownError: "Ho hlahile phoso e sa lebelloang",
    popupClosed: "Fensetere ea ho kena e koetsoe. Ka kopo leka hape.",
    accountExistsWithDifferentCredential: "Akhaonte e sa tsoa ba teng ka imeile ena. Ka kopo kena ka mofani oa pele.",
    displayNameRequired: "Ka kopo fana ka lebitso le bonahalang",
    secondFactorAlreadyInUse: "Nomoro ena ea mohala e sa tsoa ngolisoa akhaonteng ena.",
  },
  messages: {
    passwordResetEmailSent: "Imeile ea ho seta phasewete hape e romelletsoe ka katleho",
    signInLinkSent: "Sehokelo sa ho kena se romelletsoe ka katleho",
    verificationCodeFirst: "Ka kopo kopa khoutu ea netefatso pele",
    checkEmailForReset: "Hlahloba imeile ea hao bakeng sa litaelo tsa ho seta phasewete hape",
    dividerOr: "kapa",
    termsAndPrivacy: "Ha u tsoela pele, u lumela ho {tos} le {privacy} tsa rona.",
    mfaSmsAssertionPrompt: "Khoutu ea netefatso e tla romelloa ho {phoneNumber} ho phetha ts'ebetso ea netefatso.",
  },
  labels: {
    emailAddress: "Aterese ea Imeile",
    password: "Phasewete",
    displayName: "Lebitso le Bonahalang",
    forgotPassword: "Phasewete o e lebetse?",
    signUp: "Ingodisa",
    signIn: "Kena",
    resetPassword: "Seta Phasewete Hape",
    createAccount: "Theha Akhaonte",
    backToSignIn: "Khutela ho Kena",
    signInWithPhone: "Kena ka Mohala",
    phoneNumber: "Nomoro ea Mohala",
    verificationCode: "Khoutu ea Netefatso",
    sendCode: "Romella Khoutu",
    verifyCode: "Netefatsa Khoutu",
    signInWithGoogle: "Kena ka Google",
    signInWithFacebook: "Kena ka Facebook",
    signInWithApple: "Kena ka Apple",
    signInWithMicrosoft: "Kena ka Microsoft",
    signInWithGitHub: "Kena ka GitHub",
    signInWithYahoo: "Kena ka Yahoo",
    signInWithTwitter: "Kena ka X",
    signInWithEmailLink: "Kena ka Sehokelo sa Imeile",
    sendSignInLink: "Romella Sehokelo sa ho Kena",
    termsOfService: "Melaoana ea Tšebeletso",
    privacyPolicy: "Leano la Lekunutu",
    resendCode: "Romella Khoutu Hape",
    sending: "E romelloa...",
    dismiss: "Koala",
    multiFactorEnrollment: "Ngodiso ea Netefatso ea Lintlha tse Ngata",
    multiFactorAssertion: "Netefatso ea Lintlha tse Ngata",
    mfaTotpVerification: "Netefatso ea TOTP",
    mfaSmsVerification: "Netefatso ea SMS",
    generateQrCode: "Hlahisa QR Code",
  },
  prompts: {
    noAccount: "Ha u na akhaonte?",
    haveAccount: "Na o se o e na le akhaonte?",
    enterEmailToReset: "Kenya aterese ea hao ea imeile ho seta phasewete ea hao hape",
    signInToAccount: "Kena akhauntong ea hao",
    smsVerificationPrompt: "Kenya khoutu ea netefatso e romelletsoeng nomoro ea hao ea mohala",
    enterDetailsToCreate: "Kenya lintlha tsa hao ho theha akhaonte e ncha",
    enterPhoneNumber: "Kenya nomoro ea hao ea mohala",
    enterVerificationCode: "Kenya khoutu ea netefatso",
    enterEmailForLink: "Kenya imeile ea hao ho fumana sehokelo sa ho kena",
    mfaEnrollmentPrompt: "Khetha mokhoa o mocha oa ngodiso ea netefatso ea lintlha tse ngata",
    mfaAssertionPrompt: "Ka kopo phetha ts'ebetso ea netefatso ea lintlha tse ngata",
    mfaAssertionFactorPrompt: "Ka kopo khetha mokhoa oa netefatso ea lintlha tse ngata",
    mfaTotpQrCodePrompt: "Skena QR code ena ka app ea hao ea netefatso",
    mfaTotpEnrollmentVerificationPrompt: "Eketsa khoutu e hlahisitsoeng ke app ea hao ea netefatso",
  },
} satisfies StrictTranslations;
