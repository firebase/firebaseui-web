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

export const toTO = {
  errors: {
    userNotFound: "Kuo 'ikai ma'u ha kaunita 'aki ia 'a e imeili ni",
    wrongPassword: "Ko e pasiueti 'oku hala",
    invalidEmail: "Fakahoko ha imeili 'oku totonu",
    userDisabled: "Kuo tāpuni 'a e kaunita ni",
    networkRequestFailed: "Ikai lava ke fe'effeki'aki mo e seti. Vakai'i ho'o feinga ki he intaneti",
    tooManyRequests: "Ko e ngaahi feinga 'ikai lavame 'oku lahi ange. Feinga leva 'amui",
    missingVerificationCode: "Fakahoko ha code fakapapau'i",
    emailAlreadyInUse: "Kuo 'i ai ha kaunita 'aki 'a e imeili ni",
    invalidCredential: "Ko e fakamoleki kuo 'omi 'oku hala.",
    weakPassword: "Ko e pasiueti 'oku totonu ke 'i ai ha ngaahi mataitusi 'e 6 pe lahi ange",
    unverifiedEmail: "Fakapapau'i ho'o imeili ke kamata.",
    operationNotAllowed: "Ko e ngāue ni 'oku 'ikai tuku ke fai. Fe'eki ki he tokoni.",
    invalidPhoneNumber: "Ko e nomba telefoni 'oku hala",
    missingPhoneNumber: "Fakahoko ha nomba telefoni",
    quotaExceeded: "Kuo lahi 'aupito 'a e SMS. Feinga leva 'amui",
    codeExpired: "Kuo 'osi 'a e taimi 'o e code fakapapau'i",
    captchaCheckFailed: "Ikai ke lava 'a e fakapapau'i reCAPTCHA. Feinga leva 'amui.",
    missingVerificationId: "Fakakakato 'abu'abu 'a e fakapapau'i reCAPTCHA.",
    missingEmail: "Fakahoko ha imeili",
    invalidActionCode: "Ko e sengikii fakafoki e pasiueti 'oku hala pe kuo 'osi 'a e taimi",
    credentialAlreadyInUse: "Kuo 'i ai ha kaunita 'aki 'a e imeili ni. Kātaki 'o hu ki he kaunita ko ia.",
    requiresRecentLogin: "Ko e ngāue ni 'oku fie ma'u ha hu fo'ou. Kātaki 'o hu fo'ou.",
    providerAlreadyLinked: "Kuo fakatū'utāmaki 'a e nomba telefoni ni ki ha kaunita kehe",
    invalidVerificationCode: "Ko e code fakapapau'i 'oku hala. Feinga leva 'amui",
    unknownError: "Kuo hoko ha hala 'oku 'ikai ke fakatalaki'i",
    popupClosed: "Kuo tāpuni 'a e faka'ali'ali hu. Feinga leva 'amui.",
    accountExistsWithDifferentCredential:
      "Kuo 'i ai ha kaunita 'aki 'a e imeili ni. Kātaki 'o hu 'aki 'a e kautaha kuo 'uluaki.",
    displayNameRequired: "Fakahoko ha hingoa 'e hā",
    secondFactorAlreadyInUse: "Kuo 'i ai 'a e nomba telefoni ni 'i he kaunita ni.",
  },
  messages: {
    passwordResetEmailSent: "Kuo fa'u 'a e imeili fakafoki e pasiueti 'o lelei",
    signInLinkSent: "Kuo fa'u 'a e sengikii hu 'o lelei",
    verificationCodeFirst: "Kātaki 'o kole muʻa ha code fakapapauʻi",
    checkEmailForReset: "Vakai'i ho'o imeili ki he ngaahi tataki fakafoki e pasiueti",
    dividerOr: "pe",
    termsAndPrivacy: "Ko e kamata ange ko e fakapapau'i 'oku ke fakafeangai ki hotau {tos} mo e {privacy}.",
    mfaSmsAssertionPrompt: "Ko e code fakapapau'i 'e fa'u ki he {phoneNumber} ke fakakakato 'a e ngāue fakapapau'i.",
  },
  labels: {
    emailAddress: "Ngaahi Imeili",
    password: "Pasiueti",
    displayName: "Hingoa 'e Hā",
    forgotPassword: "Kuo ke galo 'a e pasiueti?",
    signUp: "Fakahingoa",
    signIn: "Hu",
    resetPassword: "Fakafoki 'a e Pasiueti",
    createAccount: "Fai ha Kaunita",
    backToSignIn: "Foki ki he Hu",
    signInWithPhone: "Hu 'aki 'a e Telefoni",
    phoneNumber: "Nomba Telefoni",
    verificationCode: "Code Fakapapau'i",
    sendCode: "Fa'u 'a e Code",
    verifyCode: "Fakapapau'i 'a e Code",
    signInWithGoogle: "Hu 'aki 'a Google",
    signInWithFacebook: "Hu 'aki 'a Facebook",
    signInWithApple: "Hu 'aki 'a Apple",
    signInWithMicrosoft: "Hu 'aki 'a Microsoft",
    signInWithGitHub: "Hu 'aki 'a GitHub",
    signInWithYahoo: "Hu 'aki 'a Yahoo",
    signInWithTwitter: "Hu 'aki 'a X",
    signInWithEmailLink: "Hu 'aki 'a e Sengikii Imeili",
    sendSignInLink: "Fa'u 'a e Sengikii Hu",
    termsOfService: "Ngaahi Tu'utu'uni Ngāue",
    privacyPolicy: "Tōʻonga Malu'i Fakamatala",
    resendCode: "Fa'u Fo'ou 'a e Code",
    sending: "Ko e fa'u atu...",
    multiFactorEnrollment: "Fakahingoa Ngaahi Tu'unga Lahi",
    multiFactorAssertion: "Fakapapau'i Ngaahi Tu'unga Lahi",
    mfaTotpVerification: "Fakapapau'i TOTP",
    mfaSmsVerification: "Fakapapau'i SMS",
    generateQrCode: "Fakatupu 'a e Code QR",
  },
  prompts: {
    noAccount: "Ikai ha kaunita?",
    haveAccount: "Kuo ke ai ha kaunita?",
    enterEmailToReset: "Fakahoko ho'o imeili ke fakafoki ai 'a e pasiueti",
    signInToAccount: "Hu ki ho'o kaunita",
    smsVerificationPrompt: "Fakahoko 'a e code fakapapau'i kuo fa'u ki ho'o nomba telefoni",
    enterDetailsToCreate: "Fakahoko ho'o ngaahi fakamatala ke fai ai ha kaunita foʻou",
    enterPhoneNumber: "Fakahoko ho'o nomba telefoni",
    enterVerificationCode: "Fakahoko 'a e code fakapapau'i",
    enterEmailForLink: "Fakahoko ho'o imeili ke ma'u ai 'a e sengikii hu",
    mfaEnrollmentPrompt: "Fili ha founga fakahingoa ngaahi tu'unga lahi foʻou",
    mfaAssertionPrompt: "Kātaki 'o fakakakato 'a e ngāue fakapapau'i ngaahi tu'unga lahi",
    mfaAssertionFactorPrompt: "Kātaki 'o fili ha founga fakapapau'i ngaahi tu'unga lahi",
    mfaTotpQrCodePrompt: "Sivi'i 'a e code QR ni 'aki ho'o polokalama authenticator",
    mfaTotpEnrollmentVerificationPrompt: "Fakahoko 'a e code kuo fakatupu 'e ho'o polokalama authenticator",
  },
} satisfies Translations;
