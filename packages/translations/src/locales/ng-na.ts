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

import { type CompleteTranslationsWithoutLegacy } from "../types";

export const ngNA = {
  errors: {
    userNotFound: "Kapena okonti moka oimeili ndjika",
    wrongPassword: "Opasweda kayi li owala",
    invalidEmail: "Tula oimeili osho yi li owala",
    userDisabled: "Okonti ndjika oya kangwa",
    networkRequestFailed: "Inaku monika okukwatathana noserver. Tala ointernet yoye",
    tooManyRequests: "Omahoololo mahapu ga pwile. Hoolola natango konima",
    missingVerificationCode: "Tula okodi yokwiitula",
    emailAlreadyInUse: "Okonti oya li po nale moka oimeili ndjika",
    invalidCredential: "Omauyelele ngoka ga gandjwa kaga li owala.",
    weakPassword: "Opasweda nayi kale ina oonkodo 6",
    unverifiedEmail: "Itula oimeili yoye opo wu tsikile.",
    operationNotAllowed: "Oshilonga eshi kashi pitikwa. Kwata osupport.",
    invalidPhoneNumber: "Onamba yongodhi kayi li owala",
    missingPhoneNumber: "Gandja onamba yongodhi",
    quotaExceeded: "Oquota yaSMS oya dule. Hoolola natango konima",
    codeExpired: "Okodi yokwiitula oya pu",
    captchaCheckFailed: "Okwiitula kwa reCAPTCHA kwa pwile. Hoolola natango.",
    missingVerificationId: "Mana okwiitula kwa reCAPTCHA tete.",
    missingEmail: "Gandja oimeili",
    invalidActionCode: "Olinka yokutula natango opasweda kayi li owala nenge oya pu",
    credentialAlreadyInUse: "Okonti oya li po nale moka oimeili ndjika. Ingila mokonti ndjoka.",
    requiresRecentLogin: "Oshilonga eshi osha hala okwingila kwa piti nale. Ingila natango.",
    providerAlreadyLinked: "Onamba ndjika oya kwatelwa kokonti yilwe",
    invalidVerificationCode: "Okodi yokwiitula kayi li owala. Hoolola natango",
    unknownError: "Oshikukuta kashi idhimbulutwa osha holoka",
    popupClosed: "Owindow yokwingila oya patulwa. Hoolola natango.",
    accountExistsWithDifferentCredential: "Okonti oya li po nale moka oimeili ndjika. Ingila komupopi gwo tete.",
    displayNameRequired: "Gandja edina lyokulihonga",
    secondFactorAlreadyInUse: "Onamba ndjika oya li po nale mokonti ndjika.",
  },
  messages: {
    passwordResetEmailSent: "Oimeili yokutula natango opasweda oya tumwa nawa",
    signInLinkSent: "Olinka yokwingila oya tumwa nawa",
    verificationCodeFirst: "Tete indila okodi yokwiitula",
    checkEmailForReset: "Tala oimeili yoye komayele gokutula natango opasweda",
    dividerOr: "nenge",
    termsAndPrivacy: "Mokutsikila, oto pitika {tos} yetu na {privacy}.",
    mfaSmsAssertionPrompt: "Okodi yokwiitula otayi ka tumwa ku {phoneNumber} opo ku maneke okwiitula.",
  },
  labels: {
    emailAddress: "Oimeili",
    password: "Opasweda",
    displayName: "Edina lyokulihonga",
    forgotPassword: "Owa dimbwa opasweda?",
    signUp: "Iyandje",
    signIn: "Ingila",
    resetPassword: "Tula natango opasweda",
    createAccount: "Tota okonti",
    backToSignIn: "Shuna kokwingila",
    signInWithPhone: "Ingila nongodhi",
    phoneNumber: "Onamba yongodhi",
    verificationCode: "Okodi yokwiitula",
    sendCode: "Tuma okodi",
    verifyCode: "Itula okodi",
    signInWithGoogle: "Ingila ngaGoogle",
    signInWithFacebook: "Ingila ngaFacebook",
    signInWithApple: "Ingila ngaApple",
    signInWithMicrosoft: "Ingila ngaMicrosoft",
    signInWithGitHub: "Ingila ngaGitHub",
    signInWithYahoo: "Ingila ngaYahoo",
    signInWithTwitter: "Ingila ngaX",
    signInWithEmailLink: "Ingila nolinka yoimeili",
    sendSignInLink: "Tuma olinka yokwingila",
    termsOfService: "Omatompelo goshilonga",
    privacyPolicy: "Opolitika yomapulo",
    resendCode: "Tuma natango okodi",
    sending: "Otashi tumwa...",
    dismiss: "Vala",
    multiFactorEnrollment: "Okwiitula kwiiyimwe oyindji",
    multiFactorAssertion: "Okwiitula kwiiyimwe",
    mfaTotpVerification: "Okwiitula kwa TOTP",
    mfaSmsVerification: "Okwiitula kwa SMS",
    generateQrCode: "Tota okodi ya QR",
  },
  prompts: {
    noAccount: "Ino na okonti?",
    haveAccount: "Oku na okonti?",
    enterEmailToReset: "Tula oimeili yoye opo wu tule natango opasweda",
    signInToAccount: "Ingila mokonti yoye",
    smsVerificationPrompt: "Tula okodi yokwiitula ya tumwa konamba yoye yongodhi",
    enterDetailsToCreate: "Tula omauyelele oye opo wu tote okonti yipe",
    enterPhoneNumber: "Tula onamba yoye yongodhi",
    enterVerificationCode: "Tula okodi yokwiitula",
    enterEmailForLink: "Tula oimeili yoye opo wu taambule olinka yokwingila",
    mfaEnrollmentPrompt: "Hoolola omukalo mpe gwokwiitula",
    mfaAssertionPrompt: "Mana omukalo gwokwiitula",
    mfaAssertionFactorPrompt: "Hoolola omukalo gwokwiitula",
    mfaTotpQrCodePrompt: "Skana okodi ya QR ndjika napp yoye",
    mfaTotpEnrollmentVerificationPrompt: "Gwedha okodi ya totwa kapp yoye",
  },
} satisfies CompleteTranslationsWithoutLegacy;
