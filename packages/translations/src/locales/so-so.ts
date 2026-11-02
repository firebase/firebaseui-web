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

export const soSO = {
  errors: {
    userNotFound: "Akoon lagama helin cinwaanka emailkan",
    wrongPassword: "Furaha sirta ah waa khaldan yahay",
    invalidEmail: "Fadlan geli cinwaan email sax ah",
    userDisabled: "Akoonkan waa la joojiyay",
    networkRequestFailed: "Lama xidhiidhi karo server-ka. Fadlan hubi internet-kaaga",
    tooManyRequests: "Isku dayyo badan oo guul-darreysan ayaa jiray. Fadlan dib u isku day wakhti dambe",
    missingVerificationCode: "Fadlan geli koodhka xaqiijinta",
    emailAlreadyInUse: "Akoon horeba ayaa loo sameeyay emailkan",
    invalidCredential: "Aqoonsiga la bixiyay waa mid aan sax ahayn.",
    weakPassword: "Furaha sirta ah waa inuu noqdaa ugu yaraan 6 xaraf",
    unverifiedEmail: "Fadlan xaqiiji cinwaanka emailkaaga si aad u sii waddo.",
    operationNotAllowed: "Howshan lama ogolaado. Fadlan la xiriir taageerada.",
    invalidPhoneNumber: "Lambarka telefoonka waa mid aan sax ahayn",
    missingPhoneNumber: "Fadlan geli lambarka telefoonka",
    quotaExceeded: "Xadka SMS-ka waa la dhaafay. Fadlan dib u isku day wakhti dambe",
    codeExpired: "Koodhka xaqiijinta waqtigiisu waa dhammaaday",
    captchaCheckFailed: "Xaqiijinta reCAPTCHA way fashilantay. Fadlan dib u isku day.",
    missingVerificationId: "Fadlan marka hore dhammaystir xaqiijinta reCAPTCHA.",
    missingEmail: "Fadlan geli cinwaanka email-ka",
    invalidActionCode: "Xiriirka dib u dejinta furaha sirta ah waa mid aan sax ahayn ama waqtigiisu waa dhammaaday",
    credentialAlreadyInUse: "Akoon horeba ayaa loo sameeyay emailkan. Fadlan gali akoonkaas.",
    requiresRecentLogin: "Howshan waxay u baahan tahay gelitaan dhowaan ah. Fadlan mar kale gal.",
    providerAlreadyLinked: "Lambarkan telefoonka horeba ayaa lagu xidhay akoon kale",
    invalidVerificationCode: "Koodhka xaqiijinta waa mid aan sax ahayn. Fadlan dib u isku day",
    unknownError: "Khalad aan la filayn ayaa dhacay",
    popupClosed: "Daaqadda gelitaanka waa la xidhay. Fadlan dib u isku day.",
    accountExistsWithDifferentCredential:
      "Akoon horeba ayaa loo sameeyay emailkan. Fadlan ku gal adigoo isticmaalaya bixiyihii asalka ahaa.",
    displayNameRequired: "Fadlan geli magaca muuqda",
    secondFactorAlreadyInUse: "Lambarkan telefoonka horeba ayaa loo diiwaangeliyay akoonkan.",
  },
  messages: {
    passwordResetEmailSent: "Emailka dib u dejinta furaha sirta ah si guul leh ayaa loo diray",
    signInLinkSent: "Xiriirka gelitaanka si guul leh ayaa loo diray",
    verificationCodeFirst: "Fadlan marka hore codso koodhka xaqiijinta",
    checkEmailForReset: "Eeg emailkaaga tilmaamaha dib u dejinta furaha sirta ah",
    dividerOr: "ama",
    termsAndPrivacy: "Sii wadida, waxaad ogolaanaysaa {tos} iyo {privacy} keenna.",
    mfaSmsAssertionPrompt: "Koodh xaqiijin ah ayaa loo diri doonaa {phoneNumber} si loo dhammaystiro xaqiijinta.",
  },
  labels: {
    emailAddress: "Cinwaanka Email-ka",
    password: "Furaha Sirta ah",
    displayName: "Magaca Muuqda",
    forgotPassword: "Furaha sirta ah ma illoobay?",
    signUp: "Isdiiwaangeli",
    signIn: "Gali",
    resetPassword: "Dib u deji Furaha Sirta ah",
    createAccount: "Samee Akoon",
    backToSignIn: "Ku noqo Gelitaanka",
    signInWithPhone: "Gal telefoon",
    phoneNumber: "Lambarka Telefoonka",
    verificationCode: "Koodhka Xaqiijinta",
    sendCode: "Dir Koodh",
    verifyCode: "Xaqiiji Koodh",
    signInWithGoogle: "Gal Google",
    signInWithFacebook: "Gal Facebook",
    signInWithApple: "Gal Apple",
    signInWithMicrosoft: "Gal Microsoft",
    signInWithGitHub: "Gal GitHub",
    signInWithYahoo: "Gal Yahoo",
    signInWithTwitter: "Gal X",
    signInWithEmailLink: "Gal xiriir email",
    sendSignInLink: "Dir xiriirka gelitaanka",
    termsOfService: "Shuruudaha Adeegga",
    privacyPolicy: "Siyaasadda Asturnaanta",
    resendCode: "Dib u dir koodhka",
    sending: "Waa la dirayaa...",
    multiFactorEnrollment: "Diiwaangelinta Xaqiijinta Badan",
    multiFactorAssertion: "Xaqiijinta Badan",
    mfaTotpVerification: "Xaqiijinta TOTP",
    mfaSmsVerification: "Xaqiijinta SMS",
    generateQrCode: "Abuur QR Code",
  },
  prompts: {
    noAccount: "Ma lihid akoon?",
    haveAccount: "Horey ma u lihiyd akoon?",
    enterEmailToReset: "Geli cinwaanka emailkaaga si aad furahaaga sirta ah dib ugu deysid",
    signInToAccount: "Gal akoonkaaga",
    smsVerificationPrompt: "Geli koodhka xaqiijinta loo diray lambarkaaga telefoonka",
    enterDetailsToCreate: "Geli faahfaahintaada si aad akoon cusub u abuurto",
    enterPhoneNumber: "Geli lambarkaaga telefoonka",
    enterVerificationCode: "Geli koodhka xaqiijinta",
    enterEmailForLink: "Geli emailkaaga si aad u hesho xiriirka gelitaanka",
    mfaEnrollmentPrompt: "Dooro habka cusub ee diiwaangelinta xaqiijinta badan",
    mfaAssertionPrompt: "Fadlan dhammaystir habka xaqiijinta badan",
    mfaAssertionFactorPrompt: "Fadlan dooro habka xaqiijinta badan",
    mfaTotpQrCodePrompt: "Ku scan-garee QR code-kan app-ka xaqiijiyaha",
    mfaTotpEnrollmentVerificationPrompt: "Ku dar koodhka ay soo saartay app-ka xaqiijiyahaaga",
  },
} satisfies Translations;
