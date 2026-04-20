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

/** Filipino PH (fil-PH) translation set. */
export const filPH = {
  errors: {
    userNotFound: "Walang account na natagpuan sa email address na ito",
    wrongPassword: "Mali ang password",
    invalidEmail: "Mangyaring maglagay ng valid na email address",
    userDisabled: "Ang account na ito ay na-disable",
    networkRequestFailed: "Hindi makakonekta sa server. Mangyaring suriin ang iyong koneksyon sa internet",
    tooManyRequests: "Napakaraming nabigong pagtatangka. Mangyaring subukan muli sa ibang pagkakataon",
    missingVerificationCode: "Mangyaring ilagay ang verification code",
    emailAlreadyInUse: "Mayroon nang account na may email na ito",
    invalidCredential: "Ang mga kredensyal na ibinigay ay hindi wasto.",
    weakPassword: "Ang password ay dapat na hindi bababa sa 6 na character",
    unverifiedEmail: "Mangyaring i-verify ang iyong email address upang magpatuloy.",
    operationNotAllowed: "Hindi pinahihintulutan ang operasyong ito. Mangyaring makipag-ugnayan sa support.",
    invalidPhoneNumber: "Ang numero ng telepono ay hindi wasto",
    missingPhoneNumber: "Mangyaring magbigay ng numero ng telepono",
    quotaExceeded: "Nalampasan ang SMS quota. Mangyaring subukan muli sa ibang pagkakataon",
    codeExpired: "Ang verification code ay nag-expire na",
    captchaCheckFailed: "Nabigo ang reCAPTCHA verification. Mangyaring subukan muli.",
    missingVerificationId: "Mangyaring kumpletuhin muna ang reCAPTCHA verification.",
    missingEmail: "Mangyaring magbigay ng email address",
    invalidActionCode: "Ang link para sa pag-reset ng password ay hindi wasto o nag-expire na",
    credentialAlreadyInUse:
      "Mayroon nang account na may email na ito. Mangyaring mag-sign in gamit ang account na iyon.",
    requiresRecentLogin: "Ang operasyong ito ay nangangailangan ng kamakailang pag-login. Mangyaring mag-sign in muli.",
    providerAlreadyLinked: "Ang numero ng teleponong ito ay naka-link na sa ibang account",
    invalidVerificationCode: "Hindi wastong verification code. Mangyaring subukan muli",
    unknownError: "Nagkaroon ng hindi inaasahang error",
    popupClosed: "Ang sign-in popup ay nagsara. Mangyaring subukan muli.",
    accountExistsWithDifferentCredential:
      "Mayroon nang account na may email na ito. Mangyaring mag-sign in gamit ang orihinal na provider.",
    displayNameRequired: "Mangyaring magbigay ng display name",
    secondFactorAlreadyInUse: "Ang numero ng teleponong ito ay naka-enroll na sa account na ito.",
  },
  messages: {
    passwordResetEmailSent: "Matagumpay na naipadala ang email para sa pag-reset ng password",
    signInLinkSent: "Matagumpay na naipadala ang sign-in link",
    verificationCodeFirst: "Mangyaring humiling muna ng verification code",
    checkEmailForReset: "Suriin ang iyong email para sa mga tagubilin sa pag-reset ng password",
    dividerOr: "o",
    termsAndPrivacy: "Sa pamamagitan ng pagpapatuloy, sumasang-ayon ka sa aming {tos} at {privacy}.",
    mfaSmsAssertionPrompt:
      "Isang verification code ang ipapadala sa {phoneNumber} upang makumpleto ang proseso ng authentication.",
  },
  labels: {
    emailAddress: "Email Address",
    password: "Password",
    displayName: "Display Name",
    forgotPassword: "Nakalimutan ang Password?",
    signUp: "Mag-sign Up",
    signIn: "Mag-sign In",
    resetPassword: "I-reset ang Password",
    createAccount: "Gumawa ng Account",
    backToSignIn: "Bumalik sa Sign In",
    signInWithPhone: "Mag-sign in gamit ang Telepono",
    phoneNumber: "Numero ng Telepono",
    verificationCode: "Verification Code",
    sendCode: "Magpadala ng Code",
    verifyCode: "I-verify ang Code",
    signInWithGoogle: "Mag-sign in gamit ang Google",
    signInWithFacebook: "Mag-sign in gamit ang Facebook",
    signInWithApple: "Mag-sign in gamit ang Apple",
    signInWithMicrosoft: "Mag-sign in gamit ang Microsoft",
    signInWithGitHub: "Mag-sign in gamit ang GitHub",
    signInWithYahoo: "Mag-sign in gamit ang Yahoo",
    signInWithTwitter: "Mag-sign in gamit ang X",
    signInWithEmailLink: "Mag-sign in gamit ang Email Link",
    signInWithEmail: "Mag-sign in gamit ang Email",
    sendSignInLink: "Magpadala ng Sign-in Link",
    termsOfService: "Mga Tuntunin ng Serbisyo",
    privacyPolicy: "Patakaran sa Privacy",
    resendCode: "Muling Ipadala ang Code",
    sending: "Nagpapadala...",
    multiFactorEnrollment: "Multi-factor Enrollment",
    multiFactorAssertion: "Multi-factor Authentication",
    mfaTotpVerification: "TOTP Verification",
    mfaSmsVerification: "SMS Verification",
    generateQrCode: "Gumawa ng QR Code",
  },
  prompts: {
    noAccount: "Wala kang account?",
    haveAccount: "Mayroon ka nang account?",
    enterEmailToReset: "Ilagay ang iyong email address upang i-reset ang iyong password",
    signInToAccount: "Mag-sign in sa iyong account",
    smsVerificationPrompt: "Ilagay ang verification code na ipinadala sa iyong numero ng telepono",
    enterDetailsToCreate: "Ilagay ang iyong mga detalye upang lumikha ng bagong account",
    enterPhoneNumber: "Ilagay ang iyong numero ng telepono",
    enterVerificationCode: "Ilagay ang verification code",
    enterEmailForLink: "Ilagay ang iyong email upang makatanggap ng sign-in link",
    mfaEnrollmentPrompt: "Pumili ng bagong paraan ng multi-factor enrollment",
    mfaAssertionPrompt: "Mangyaring kumpletuhin ang proseso ng multi-factor authentication",
    mfaAssertionFactorPrompt: "Mangyaring pumili ng paraan ng multi-factor authentication",
    mfaTotpQrCodePrompt: "I-scan ang QR code na ito gamit ang iyong authenticator app",
    mfaTotpEnrollmentVerificationPrompt: "Idagdag ang code na nabuo ng iyong authenticator app",
  },
} satisfies Translations;
