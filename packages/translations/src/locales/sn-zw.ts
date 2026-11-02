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

export const snZW = {
  errors: {
    userNotFound: "Hapana akaunti yakawanikwa neiyi email address",
    wrongPassword: "Password isiri yakanaka",
    invalidEmail: "Ndapota nyora email address iri chaiyo",
    userDisabled: "Akaunti iyi yakadzimwa",
    networkRequestFailed: "Hazvina kukwanisika kubatana neserver. Ndapota tarisa internet yako",
    tooManyRequests: "Kuedza kwakawanda kusina kubudirira. Ndapota edza zvakare gare gare",
    missingVerificationCode: "Ndapota nyora verification code",
    emailAlreadyInUse: "Akaunti yakatovapo neiyi email",
    invalidCredential: "Ruzivo rwapihwa haruna kuzvigona.",
    weakPassword: "Password inofanira kunge iine mavara 6 zvichishoma",
    unverifiedEmail: "Ndapota simbisa email address yako kuti uenderere mberi.",
    operationNotAllowed: "Basa iri haringabvumidzwi. Ndapota taura nesupport.",
    invalidPhoneNumber: "Nhamba yefoni haisi chaiyo",
    missingPhoneNumber: "Ndapota pa nhamba yefoni",
    quotaExceeded: "SMS quota yapera. Ndapota edza zvakare gare gare",
    codeExpired: "Verification code yapera nguva",
    captchaCheckFailed: "reCAPTCHA yakundikana kusimbiswa. Ndapota edza zvakare.",
    missingVerificationId: "Ndapota pedzisa reCAPTCHA verification kutanga.",
    missingEmail: "Ndapota pa email address",
    invalidActionCode: "Link yekugadzirisa password haisi chaiyo kana yapera nguva",
    credentialAlreadyInUse: "Akaunti yakatovapo neiyi email. Ndapota pinda nayo akaunti iyoyo.",
    requiresRecentLogin: "Basa iri rinoda kupinda nguva pfupi yapfuura. Ndapota pinda zvakare.",
    providerAlreadyLinked: "Nhamba yefoni iyi yatoiswa kune imwe akaunti",
    invalidVerificationCode: "Verification code haisi chaiyo. Ndapota edza zvakare",
    unknownError: "Pakaitika chikanganiso chisingatarisirwi",
    popupClosed: "Popup yekupinda yavharwa. Ndapota edza zvakare.",
    accountExistsWithDifferentCredential:
      "Akaunti yakatovapo neiyi email. Ndapota pinda uchishandisa provider yekutanga.",
    displayNameRequired: "Ndapota pa display name",
    secondFactorAlreadyInUse: "Nhamba yefoni iyi yatonyorwa muakaunti ino.",
  },
  messages: {
    passwordResetEmailSent: "Email yekugadzirisa password yatumwa zvakanaka",
    signInLinkSent: "Link yekupinda yatumwa zvakanaka",
    verificationCodeFirst: "Ndapota kumbira verification code kutanga",
    checkEmailForReset: "Tarisa email yako kuti uwane mirayiridzo yekugadzirisa password",
    dividerOr: "kana",
    termsAndPrivacy: "Kana ukaenderera mberi, unobvumirana ne{tos} ne{privacy} yedu.",
    mfaSmsAssertionPrompt: "Verification code ichatumirwa ku{phoneNumber} kuti upedze kutenda.",
  },
  labels: {
    emailAddress: "Email Address",
    password: "Password",
    displayName: "Display Name",
    forgotPassword: "Wakanganwa Password?",
    signUp: "Nyoresa",
    signIn: "Pinda",
    resetPassword: "Gadzirisa Password",
    createAccount: "Gadzira Akaunti",
    backToSignIn: "Dzokera Kukupinda",
    signInWithPhone: "Pinda neFoni",
    phoneNumber: "Nhamba yeFoni",
    verificationCode: "Verification Code",
    sendCode: "Tumira Code",
    verifyCode: "Simbisa Code",
    signInWithGoogle: "Pinda neGoogle",
    signInWithFacebook: "Pinda neFacebook",
    signInWithApple: "Pinda neApple",
    signInWithMicrosoft: "Pinda neMicrosoft",
    signInWithGitHub: "Pinda neGitHub",
    signInWithYahoo: "Pinda neYahoo",
    signInWithTwitter: "Pinda neX",
    signInWithEmailLink: "Pinda neEmail Link",
    sendSignInLink: "Tumira Sign-in Link",
    termsOfService: "Mitemo yeShandisiro",
    privacyPolicy: "Privacy Policy",
    resendCode: "Tumazve Code",
    sending: "Ichitumira...",
    multiFactorEnrollment: "Kunyoresa Multi-factor",
    multiFactorAssertion: "Multi-factor Authentication",
    mfaTotpVerification: "TOTP Verification",
    mfaSmsVerification: "SMS Verification",
    generateQrCode: "Gadzira QR Code",
  },
  prompts: {
    noAccount: "Hauna akaunti?",
    haveAccount: "Une akaunti diki?",
    enterEmailToReset: "Nyora email address yako kuti ugadzirise password yako",
    signInToAccount: "Pinda muakaunti yako",
    smsVerificationPrompt: "Nyora verification code yakatumirwa kunhamba yako yefoni",
    enterDetailsToCreate: "Nyora ruzivo rwako kuti ugadzire akaunti itsva",
    enterPhoneNumber: "Nyora nhamba yako yefoni",
    enterVerificationCode: "Nyora verification code",
    enterEmailForLink: "Nyora email yako kuti uwane sign-in link",
    mfaEnrollmentPrompt: "Sarudza nzira itsva yekunyoresa multi-factor",
    mfaAssertionPrompt: "Ndapota pedzisa kutenda kwemulti-factor authentication",
    mfaAssertionFactorPrompt: "Ndapota sarudza nzira yemulti-factor authentication",
    mfaTotpQrCodePrompt: "Scanira QR code iyi neapp yako yeauthenticator",
    mfaTotpEnrollmentVerificationPrompt: "Wedzera code inogadzirwa neapp yako yeauthenticator",
  },
} satisfies Translations;
