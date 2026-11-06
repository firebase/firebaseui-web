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

export const dzBT = {
  errors: {
    userNotFound: "འདི་ གློག་འཕྲིན་ཁ་བྱང་དང་མཐུན་པའི་ཐོ་ཁྲ་གང་ཡང་མ་རྙེད།",
    wrongPassword: "གསང་ཚིག་ སྐྱོན་ཅན་ཡིན།",
    invalidEmail: "ལེགས་པོ་ཞིག་ གློག་འཕྲིན་ཁ་བྱང་ཡོད་པ་ཞིག་ འཇུག་རོགས།",
    userDisabled: "ཐོ་ཁྲ་འདི་ བཀག་འགོག་འབད་ཡོད།",
    networkRequestFailed:
      "ཞབས་ཏོག་འཕྲུལ་ཆས་དང་ འབྲེལ་མཐུད་མ་ཐུབ། ཁྱེད་ཀྱི་ ཨིན་ཊྲ་ནེཊ་ འབྲེལ་མཐུད་ལ་ བརྟག་ཞིབ་འབད་རོགས།",
    tooManyRequests: "ཐེངས་མང་པོ་ནས་ བསམ་པ་མ་ཐུབ། སྐར་མ་ཅུ་ཤོས་ཤིག་ཤོལ་ནས་ བསྐྱར་ཚོད་ལྟ་རོགས།",
    missingVerificationCode: "ལེགས་པོ་ཞིག་ ངོས་འཛིན་ཚབ་ཨང་འཇུག་རོགས།",
    emailAlreadyInUse: "འདི་ གློག་འཕྲིན་ཁ་བྱང་གིས་ ཐོ་ཁྲ་ཡོད་ཟིན།",
    invalidCredential: "སྤྲོད་པའི་ཁྱབ་ཚུལ་ སྐྱོན་ཅན་ཡིན།",
    weakPassword: "གསང་ཚིག་ཉུང་ཤོས་ཀྱི་ཡིག་འབྲུ་ 6 ཡོད་དགོས།",
    unverifiedEmail: "མུ་མཐུད་བཏང་ཆོག་པ་ལུ་ ཁྱེད་ཀྱི་ གློག་འཕྲིན་ཁ་བྱང་ བདེན་པ་གཏན་ཁེལ་འབད་རོགས།",
    operationNotAllowed: "ལས་ཀ་འདི་ གནང་ཆོག་མ་ཡིན། ཞབས་སུ་འབྲེལ་གཏུགས་འབད་རོགས།",
    invalidPhoneNumber: "ཁ་པར་ཨང་གྲངས་ སྐྱོན་ཅན་ཡིན།",
    missingPhoneNumber: "ལེགས་པོ་ཞིག་ ཁ་པར་ཨང་གྲངས་ སྤྲོད་རོགས།",
    quotaExceeded: "SMS ཚད་ལས་ལྷག་ཡོད། སྐར་མ་ཅུ་ཤོས་ཤིག་ཤོལ་ནས་ བསྐྱར་ཚོད་ལྟ་རོགས།",
    codeExpired: "ངོས་འཛིན་ཚབ་ཨང་ དུས་ཚོད་ལས་འདས་ཡོད།",
    captchaCheckFailed: "reCAPTCHA བདེན་གཏན་འབད་མ་ཐུབ། བསྐྱར་ཚོད་ལྟ་རོགས།",
    missingVerificationId: "ལེགས་པོ་ཞིག་ སྔ་མ་ reCAPTCHA བདེན་གཏན་འབད་རོགས།",
    missingEmail: "ལེགས་པོ་ཞིག་ གློག་འཕྲིན་ཁ་བྱང་ སྤྲོད་རོགས།",
    invalidActionCode: "གསང་ཚིག་ བསྐྱར་སྒྲིག་གི་ མཐུདཔ་ སྐྱོན་ཅན་ཡིན་ཡང་ན་ དུས་ཚོད་ལས་འདས་ཡོད།",
    credentialAlreadyInUse: "འདི་ གློག་འཕྲིན་ཁ་བྱང་གིས་ ཐོ་ཁྲ་ཡོད་ཟིན། ལེགས་པོ་ཞིག་ ཐོ་ཁྲ་དེ་ཡིས་ ནང་འཛུལ་རོགས།",
    requiresRecentLogin: "ལས་ཀ་འདི་ ཉེ་ཅིག་གི་ ནང་འཛུལ་ དགོས་ཡོད། ལེགས་པོ་ཞིག་ བསྐྱར་ནང་འཛུལ་རོགས།",
    providerAlreadyLinked: "འདི་ ཁ་པར་ཨང་གྲངས་ ཐོ་ཁྲ་གཞན་ཞིག་ལ་ མཐུད་ཡོད།",
    invalidVerificationCode: "ངོས་འཛིན་ཚབ་ཨང་ སྐྱོན་ཅན་ཡིན། བསྐྱར་ཚོད་ལྟ་རོགས།",
    unknownError: "ནོར་འཁྲུལ་ངོ་མ་ཤེས་མེད་ཅིག་ བྱུང་སོང་།",
    popupClosed: "ནང་འཛུལ་སྒོ་སྣེ་ སྒོ་རྒྱོབ་ཡོད། ལེགས་པོ་ཞིག་ བསྐྱར་ཚོད་ལྟ་རོགས།",
    accountExistsWithDifferentCredential:
      "འདི་ གློག་འཕྲིན་ཁ་བྱང་གིས་ ཐོ་ཁྲ་ཡོད་ཟིན། ལེགས་པོ་ཞིག་ སྔ་མའི་ཞབས་ཏོག་སྤྲོད་མཁན་ཡིས་ ནང་འཛུལ་རོགས།",
    displayNameRequired: "ལེགས་པོ་ཞིག་ མངོན་སུམ་མིང་ སྤྲོད་རོགས།",
    secondFactorAlreadyInUse: "འདི་ ཁ་པར་ཨང་གྲངས་ འདི་ཡི་ཐོ་ཁྲ་ལ་ ཐོ་འགོད་ཡོད།",
  },
  messages: {
    passwordResetEmailSent: "གསང་ཚིག་ བསྐྱར་སྒྲིག་གི་ གློག་འཕྲིན་ཡིག་ཟམ་ ལེགས་པོར་ བསྐུར་ཡོད།",
    signInLinkSent: "ནང་འཛུལ་མཐུདཔ་ ལེགས་པོར་ བསྐུར་ཡོད།",
    verificationCodeFirst: "ཐོག་མར་ངོས་འཛིན་ཚབ་ཨང་ཞུ་རོགས།",
    checkEmailForReset: "གསང་ཚིག་ བསྐྱར་སྒྲིག་གི་ ལམ་སྟོན་ལ་ ཁྱེད་ཀྱི་ གློག་འཕྲིན་ཁ་བྱང་ བལྟ་རོགས།",
    dividerOr: "ཡང་ན།",
    termsAndPrivacy: "མུ་མཐུད་བཏང་བའི་ཚེ་ ཁྱེད་ རང་ཅག་གི {tos} དང་ {privacy} ལུ་ ཁས་ལེན་ཡོད།",
    mfaSmsAssertionPrompt: "བདེན་གཏན་འབད་བའི་ལས་རིམ་ མཇུག་བསྡུ་བའི་དོན་ལུ་ {phoneNumber} ལུ་ ངོས་འཛིན་ཚབ་ཨང་ བསྐུར་ངེ།",
  },
  labels: {
    emailAddress: "གློག་འཕྲིན་ཁ་བྱང་",
    password: "གསང་ཚིག",
    displayName: "མངོན་སུམ་མིང་",
    forgotPassword: "གསང་ཚིག་ བརྗེད་སོང་ངམ?",
    signUp: "ཐོ་འགོད།",
    signIn: "ནང་འཛུལ།",
    resetPassword: "གསང་ཚིག་ བསྐྱར་སྒྲིག",
    createAccount: "ཐོ་ཁྲ་ གསར་འཛུགས།",
    backToSignIn: "ནང་འཛུལ་ལུ་ ཕྱིར་ལྡོག",
    signInWithPhone: "ཁ་པར་ཐོ་ནང་འཛུལ།",
    phoneNumber: "ཁ་པར་ཨང་གྲངས།",
    verificationCode: "ངོས་འཛིན་ཚབ་ཨང་།",
    sendCode: "ཚབ་ཨང་ བསྐུར།",
    verifyCode: "ཚབ་ཨང་ བདེན་གཏན།",
    signInWithGoogle: "Google ཐོ་ནང་འཛུལ།",
    signInWithFacebook: "Facebook ཐོ་ནང་འཛུལ།",
    signInWithApple: "Apple ཐོ་ནང་འཛུལ།",
    signInWithMicrosoft: "Microsoft ཐོ་ནང་འཛུལ།",
    signInWithGitHub: "GitHub ཐོ་ནང་འཛུལ།",
    signInWithYahoo: "Yahoo ཐོ་ནང་འཛུལ།",
    signInWithTwitter: "X ཐོ་ནང་འཛུལ།",
    signInWithEmailLink: "གློག་འཕྲིན་མཐུདཔ་ཐོ་ནང་འཛུལ།",
    sendSignInLink: "ནང་འཛུལ་མཐུདཔ་ བསྐུར།",
    termsOfService: "ཞབས་ཏོག་གི་ཚིག་གཞི།",
    privacyPolicy: "གསང་བའི་སྲིད་ཇུས།",
    resendCode: "ཚབ་ཨང་ བསྐྱར་བསྐུར།",
    sending: "བསྐུར་བཞིན་ཡོད...",
    dismiss: "ཁ་བསྡམ།",
    multiFactorEnrollment: "ཁ་སྣོན་ཚད་མ་ཐོ་འགོད།",
    multiFactorAssertion: "ཁ་སྣོན་ཚད་མ་བདེན་གཏན།",
    mfaTotpVerification: "TOTP བདེན་གཏན།",
    mfaSmsVerification: "SMS བདེན་གཏན།",
    generateQrCode: "QR ཚབ་ཨང་ བཟོ།",
  },
  prompts: {
    noAccount: "ཐོ་ཁྲ་མེད་ངམ?",
    haveAccount: "ཐོ་ཁྲ་ཡོད་ཟིན་ངམ?",
    enterEmailToReset: "གསང་ཚིག་ བསྐྱར་སྒྲིག་ཚེ་ ཁྱེད་ཀྱི་ གློག་འཕྲིན་ཁ་བྱང་ འཇུག་རོགས།",
    signInToAccount: "ཁྱེད་ཀྱི་ཐོ་ཁྲ་ལ་ ནང་འཛུལ་རོགས།",
    smsVerificationPrompt: "ཁྱེད་ཀྱི་ཁ་པར་ཨང་གྲངས་ལུ་ བསྐུརཝ་ཡོད་པའི་ ངོས་འཛིན་ཚབ་ཨང་ འཇུག་རོགས།",
    enterDetailsToCreate: "ཐོ་ཁྲ་གསར་པ་ བཟོ་བའི་དོན་ལུ་ ཁྱེད་ཀྱི་ཞིབ་ཕྲ་ འཇུག་རོགས།",
    enterPhoneNumber: "ཁྱེད་ཀྱི་ཁ་པར་ཨང་གྲངས་ འཇུག་རོགས།",
    enterVerificationCode: "ངོས་འཛིན་ཚབ་ཨང་ འཇུག་རོགས།",
    enterEmailForLink: "ནང་འཛུལ་མཐུདཔ་ ཐོབ་པའི་དོན་ལུ་ ཁྱེད་ཀྱི་གློག་འཕྲིན་ འཇུག་རོགས།",
    mfaEnrollmentPrompt: "ཁ་སྣོན་ཚད་མའི་ ཐོ་འགོད་ཐབས་ལམ་ གསར་པ་ གདམ་རོགས།",
    mfaAssertionPrompt: "ལེགས་པོ་ཞིག་ ཁ་སྣོན་ཚད་མ་བདེན་གཏན་གྱི་ལས་རིམ་ མཇུག་བསྡུ་རོགས།",
    mfaAssertionFactorPrompt: "ལེགས་པོ་ཞིག་ ཁ་སྣོན་ཚད་མ་བདེན་གཏན་གྱི་ཐབས་ལམ་ གདམ་རོགས།",
    mfaTotpQrCodePrompt: "ཁྱེད་ཀྱི་ བདེན་གཏན་བྱེད་མཁན་ གློག་རིམ་གྱིས་ འདི་ QR ཚབ་ཨང་ སྐན་རོགས།",
    mfaTotpEnrollmentVerificationPrompt: "ཁྱེད་ཀྱི་ བདེན་གཏན་བྱེད་མཁན་ གློག་རིམ་གིས་ བཟོས་པའི་ཚབ་ཨང་ ཁ་སྣོན་རོགས།",
  },
} satisfies StrictTranslations;
