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

export const nyMW = {
  errors: {
    userNotFound: "Palibe akaunti yopezeka ndi imelo adiresi iyi",
    wrongPassword: "Mawu achinsinsi olakwika",
    invalidEmail: "Chonde lowetsani imelo adiresi yolondola",
    userDisabled: "Akaunti iyi yazimitsidwa",
    networkRequestFailed: "Sitingathe kulumikizana ndi seva. Chonde yang'anani intaneti yanu",
    tooManyRequests: "Mayesero olephera ndi ambiri. Chonde yesaninso pambuyo pake",
    missingVerificationCode: "Chonde lowetsani khodi yotsimikizira",
    emailAlreadyInUse: "Akaunti ilipo kale ndi imelo iyi",
    invalidCredential: "Zidziwitso zoperekedwa sizolondola.",
    weakPassword: "Mawu achinsinsi ayenera kukhala osachepera zilembo 6",
    unverifiedEmail: "Chonde tsimikizirani imelo adiresi yanu kuti mupitirize.",
    operationNotAllowed: "Ntchitoyi siloledwa. Chonde lumikizanani ndi chithandizo.",
    invalidPhoneNumber: "Nambala ya foni ndi yolakwika",
    missingPhoneNumber: "Chonde perekani nambala ya foni",
    quotaExceeded: "Malire a SMS adutsa. Chonde yesaninso pambuyo pake",
    codeExpired: "Khodi yotsimikizira yatha nthawi",
    captchaCheckFailed: "Kutsimikizira kwa reCAPTCHA kwalephera. Chonde yesaninso.",
    missingVerificationId: "Chonde malizitsani kaye kutsimikizira kwa reCAPTCHA.",
    missingEmail: "Chonde perekani imelo adiresi",
    invalidActionCode: "Ulalo wokhazikitsanso mawu achinsinsi ndi wolakwika kapena watha nthawi",
    credentialAlreadyInUse: "Akaunti ilipo kale ndi imelo iyi. Chonde lowani ndi akaunti imeneyo.",
    requiresRecentLogin: "Ntchitoyi ikufuna kulowa posachedwapa. Chonde lowaninso.",
    providerAlreadyLinked: "Nambala ya foniyi yalumikizidwa kale ku akaunti ina",
    invalidVerificationCode: "Khodi yotsimikizira ndi yolakwika. Chonde yesaninso",
    unknownError: "Cholakwika chosayembekezereka chachitika",
    popupClosed: "Zenera lolowera latsekedwa. Chonde yesaninso.",
    accountExistsWithDifferentCredential: "Akaunti ilipo kale ndi imelo iyi. Chonde lowani ndi wopereka woyambirira.",
    displayNameRequired: "Chonde perekani dzina lowonetsedwa",
    secondFactorAlreadyInUse: "Nambala ya foniyi yalembetsedwa kale ku akauntiyi.",
  },
  messages: {
    passwordResetEmailSent: "Imelo yokhazikitsanso mawu achinsinsi yatumizidwa bwino",
    signInLinkSent: "Ulalo wolowera watumizidwa bwino",
    verificationCodeFirst: "Chonde pemphani khodi yotsimikizira kaye",
    checkEmailForReset: "Yang'anani imelo yanu kuti mupeze malangizo okhazikitsanso mawu achinsinsi",
    dividerOr: "kapena",
    termsAndPrivacy: "Mukapitiriza, mukuvomereza {tos} ndi {privacy} athu.",
    mfaSmsAssertionPrompt: "Khodi yotsimikizira idzatumizidwa ku {phoneNumber} kuti amalize kutsimikizira.",
  },
  labels: {
    emailAddress: "Imelo Adiresi",
    password: "Mawu Achinsinsi",
    displayName: "Dzina Lowonetsedwa",
    forgotPassword: "Mwaiwala Mawu Achinsinsi?",
    signUp: "Lembani",
    signIn: "Lowani",
    resetPassword: "Khazikitsaninso Mawu Achinsinsi",
    createAccount: "Pangani Akaunti",
    backToSignIn: "Bwererani ku Kulowa",
    signInWithPhone: "Lowani ndi Foni",
    phoneNumber: "Nambala ya Foni",
    verificationCode: "Khodi Yotsimikizira",
    sendCode: "Tumizani Khodi",
    verifyCode: "Tsimikizirani Khodi",
    signInWithGoogle: "Lowani ndi Google",
    signInWithFacebook: "Lowani ndi Facebook",
    signInWithApple: "Lowani ndi Apple",
    signInWithMicrosoft: "Lowani ndi Microsoft",
    signInWithGitHub: "Lowani ndi GitHub",
    signInWithYahoo: "Lowani ndi Yahoo",
    signInWithTwitter: "Lowani ndi X",
    signInWithEmailLink: "Lowani ndi Ulalo wa Imelo",
    sendSignInLink: "Tumizani Ulalo Wolowera",
    termsOfService: "Migwirizano Yautumiki",
    privacyPolicy: "Ndondomeko Yachinsinsi",
    resendCode: "Tumizaninso Khodi",
    sending: "Ikutumiza...",
    multiFactorEnrollment: "Kulembetsa Kwa Zinthu Zambiri",
    multiFactorAssertion: "Kutsimikizira Kwa Zinthu Zambiri",
    mfaTotpVerification: "Kutsimikizira kwa TOTP",
    mfaSmsVerification: "Kutsimikizira kwa SMS",
    generateQrCode: "Pangani Khodi ya QR",
  },
  prompts: {
    noAccount: "Mulibe akaunti?",
    haveAccount: "Muli kale ndi akaunti?",
    enterEmailToReset: "Lowetsani imelo adiresi yanu kuti mukhazikitsenso mawu achinsinsi",
    signInToAccount: "Lowani mu akaunti yanu",
    smsVerificationPrompt: "Lowetsani khodi yotsimikizira yotumizidwa ku nambala yanu ya foni",
    enterDetailsToCreate: "Lowetsani zambiri zanu kuti mupange akaunti yatsopano",
    enterPhoneNumber: "Lowetsani nambala ya foni yanu",
    enterVerificationCode: "Lowetsani khodi yotsimikizira",
    enterEmailForLink: "Lowetsani imelo yanu kuti mulandire ulalo wolowera",
    mfaEnrollmentPrompt: "Sankhani njira yatsopano yolembetsera zinthu zambiri",
    mfaAssertionPrompt: "Chonde malizitsani kutsimikizira kwa zinthu zambiri",
    mfaAssertionFactorPrompt: "Chonde sankhani njira yotsimikizira zinthu zambiri",
    mfaTotpQrCodePrompt: "Jambulani khodi ya QR iyi ndi pulogalamu yanu yotsimikizira",
    mfaTotpEnrollmentVerificationPrompt: "Onjezani khodi yopangidwa ndi pulogalamu yanu yotsimikizira",
  },
} satisfies Translations;
