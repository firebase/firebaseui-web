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

export const isIS = {
  errors: {
    userNotFound: "Enginn aðgangur fannst með þessu netfangi",
    wrongPassword: "Rangt lykilorð",
    invalidEmail: "Vinsamlegast sláðu inn gilt netfang",
    userDisabled: "Þessi aðgangur hefur verið óvirkjaður",
    networkRequestFailed: "Ekki tókst að tengjast þjóninum. Vinsamlegast athugaðu nettenginguna þína",
    tooManyRequests: "Of margar misheppnaðar tilraunir. Vinsamlegast reyndu aftur síðar",
    missingVerificationCode: "Vinsamlegast sláðu inn staðfestingarkóðann",
    emailAlreadyInUse: "Aðgangur með þessu netfangi er nú þegar til",
    invalidCredential: "Innskráningargögnin sem gefin voru eru ógild.",
    weakPassword: "Lykilorðið þarf að vera að minnsta kosti 6 stafir",
    unverifiedEmail: "Vinsamlegast staðfestu netfangið þitt til að halda áfram.",
    operationNotAllowed: "Þessi aðgerð er ekki leyfð. Vinsamlegast hafðu samband við þjónustuver.",
    invalidPhoneNumber: "Símanúmerið er ógilt",
    missingPhoneNumber: "Vinsamlegast sláðu inn símanúmer",
    quotaExceeded: "SMS-kvóti er búinn. Vinsamlegast reyndu aftur síðar",
    codeExpired: "Staðfestingarkóðinn er útrunninn",
    captchaCheckFailed: "reCAPTCHA staðfesting mistókst. Vinsamlegast reyndu aftur.",
    missingVerificationId: "Vinsamlegast ljúktu reCAPTCHA staðfestingunni fyrst.",
    missingEmail: "Vinsamlegast sláðu inn netfang",
    invalidActionCode: "Hlekkurinn til að endurstilla lykilorðið er ógildur eða útrunninn",
    credentialAlreadyInUse:
      "Aðgangur með þessu netfangi er nú þegar til. Vinsamlegast skráðu þig inn með þeim aðgangi.",
    requiresRecentLogin: "Þessi aðgerð krefst nýlegrar innskráningar. Vinsamlegast skráðu þig inn aftur.",
    providerAlreadyLinked: "Þetta símanúmer er nú þegar tengt öðrum aðgangi",
    invalidVerificationCode: "Ógildur staðfestingarkóði. Vinsamlegast reyndu aftur",
    unknownError: "Óvænt villa kom upp",
    popupClosed: "Innskráningarglugganum var lokað. Vinsamlegast reyndu aftur.",
    accountExistsWithDifferentCredential:
      "Aðgangur með þessu netfangi er nú þegar til. Vinsamlegast skráðu þig inn með upprunalegu þjónustuveitunni.",
    displayNameRequired: "Vinsamlegast sláðu inn birtingarnafn",
    secondFactorAlreadyInUse: "Þetta símanúmer er nú þegar skráð á þennan aðgang.",
  },
  messages: {
    passwordResetEmailSent: "Tölvupóstur til að endurstilla lykilorð var sendur",
    signInLinkSent: "Innskráningarhlekkur var sendur",
    verificationCodeFirst: "Vinsamlegast biddu fyrst um staðfestingarkóða",
    checkEmailForReset: "Athugaðu netfangið þitt fyrir leiðbeiningar um endurstillingu lykilorðs",
    dividerOr: "eða",
    termsAndPrivacy: "Með því að halda áfram samþykkir þú {tos} og {privacy} okkar.",
    mfaSmsAssertionPrompt: "Staðfestingarkóði verður sendur á {phoneNumber} til að ljúka auðkenningarferlinu.",
  },
  labels: {
    emailAddress: "Netfang",
    password: "Lykilorð",
    displayName: "Birtingarnafn",
    forgotPassword: "Gleymt lykilorð?",
    signUp: "Nýskráning",
    signIn: "Innskráning",
    resetPassword: "Endurstilla lykilorð",
    createAccount: "Búa til aðgang",
    backToSignIn: "Til baka í innskráningu",
    signInWithPhone: "Skráðu þig inn með síma",
    phoneNumber: "Símanúmer",
    verificationCode: "Staðfestingarkóði",
    sendCode: "Senda kóða",
    verifyCode: "Staðfesta kóða",
    signInWithGoogle: "Skráðu þig inn með Google",
    signInWithFacebook: "Skráðu þig inn með Facebook",
    signInWithApple: "Skráðu þig inn með Apple",
    signInWithMicrosoft: "Skráðu þig inn með Microsoft",
    signInWithGitHub: "Skráðu þig inn með GitHub",
    signInWithYahoo: "Skráðu þig inn með Yahoo",
    signInWithTwitter: "Skráðu þig inn með X",
    signInWithEmailLink: "Skráðu þig inn með netfangstengli",
    sendSignInLink: "Senda innskráningarhlekk",
    termsOfService: "Skilmálar þjónustu",
    privacyPolicy: "Persónuverndarstefna",
    resendCode: "Senda kóða aftur",
    sending: "Sendi...",
    multiFactorEnrollment: "Skráning fjölþátta auðkenningar",
    multiFactorAssertion: "Fjölþátta auðkenning",
    mfaTotpVerification: "TOTP staðfesting",
    mfaSmsVerification: "SMS staðfesting",
    generateQrCode: "Búa til QR kóða",
  },
  prompts: {
    noAccount: "Ertu ekki með aðgang?",
    haveAccount: "Ertu nú þegar með aðgang?",
    enterEmailToReset: "Sláðu inn netfangið þitt til að endurstilla lykilorðið",
    signInToAccount: "Skráðu þig inn á aðganginn þinn",
    smsVerificationPrompt: "Sláðu inn staðfestingarkóðann sem var sendur í símann þinn",
    enterDetailsToCreate: "Sláðu inn upplýsingarnar þínar til að búa til nýjan aðgang",
    enterPhoneNumber: "Sláðu inn símanúmerið þitt",
    enterVerificationCode: "Sláðu inn staðfestingarkóðann",
    enterEmailForLink: "Sláðu inn netfangið þitt til að fá innskráningarhlekk",
    mfaEnrollmentPrompt: "Veldu nýja aðferð til að skrá fjölþátta auðkenningu",
    mfaAssertionPrompt: "Vinsamlegast ljúktu fjölþátta auðkenningarferlinu",
    mfaAssertionFactorPrompt: "Vinsamlegast veldu aðferð til fjölþátta auðkenningar",
    mfaTotpQrCodePrompt: "Skannaðu þennan QR kóða með auðkenningarforritinu þínu",
    mfaTotpEnrollmentVerificationPrompt: "Bættu við kóðanum sem auðkenningarforritið þitt býr til",
  },
} satisfies Translations;
