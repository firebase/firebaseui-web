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

export const dvMV = {
  errors: {
    userNotFound: "މި އީމެއިލް އެޑްރެހުން އެކައުންޓެއް ނުފެނުނު",
    wrongPassword: "ޕާސްވޯޑް ވަރަކަށް ނުވެއެވެ",
    invalidEmail: "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ލިޔުއްވާށެ",
    userDisabled: "މި އެކައުންޓް ނިކަމެތި ކޮށްފައިވެއެވެ",
    networkRequestFailed: "ސަރވަރާ ގުޅެން ނޮވެއެވެ. އިންޓަނެޓް ގުޅުން ރަނގަޅުކުރައްވާށެ",
    tooManyRequests: "ފެއިލް ވި ޓްރައި ގިނަވެއެވެ. ފަހުން އަލުން ޓްރައި ކުރައްވާށެ",
    missingVerificationCode: "ވެރިފިކޭޝަން ކޯޑް ލިޔުއްވާށެ",
    emailAlreadyInUse: "މި އީމެއިލް އިން އެކައުންޓެއް މިހާރު ހުރެއެވެ",
    invalidCredential: "ލިޔެފައިވާ މަޢުލޫމާތު ރަނގަޅު ނޫނެވެ.",
    weakPassword: "ޕާސްވޯޑް ކުޑަވެގެން 6 އަކުރު ހުންނަންވާނެއެވެ",
    unverifiedEmail: "ކުރިއަށް ދިއުމަށް މި އީމެއިލް އެޑްރެސް ވެރިފައި ކުރައްވާށެ.",
    operationNotAllowed: "މި މަސައްކަތަށް ހުއްދަ ނުދެވެއެވެ. ސަޕޯޓް އާ ގުޅުއްވާށެ.",
    invalidPhoneNumber: "ފޯން ނަންބަރު ރަނގަޅު ނޫނެވެ",
    missingPhoneNumber: "ފޯން ނަންބަރެއް ލިޔުއްވާށެ",
    quotaExceeded: "SMS ޙައްދު ހަމަވެއްޖެއެވެ. ފަހުން އަލުން ޓްރައި ކުރައްވާށެ",
    codeExpired: "ވެރިފިކޭޝަން ކޯޑުގެ މުއްދަތު ހަމަވެއްޖެއެވެ",
    captchaCheckFailed: "reCAPTCHA ވެރިފިކޭޝަން ނޮވެއެވެ. އަލުން ޓްރައި ކުރައްވާށެ.",
    missingVerificationId: "ފުރަތަމަ reCAPTCHA ވެރިފިކޭޝަން ނިންމާލައްވާށެ.",
    missingEmail: "އީމެއިލް އެޑްރެހެއް ލިޔުއްވާށެ",
    invalidActionCode: "ޕާސްވޯޑް ރީސެޓް ލިންކް ރަނގަޅު ނޫން ނުވަތަ މުއްދަތު ހަމަވެއްޖެއެވެ",
    credentialAlreadyInUse: "މި އީމެއިލް އިން އެކައުންޓެއް މިހާރު ހުރެއެވެ. އެ އެކައުންޓުން ލޮގިން ވެއްޖެ ކުރައްވާށެ.",
    requiresRecentLogin: "މި މަސައްކަތަށް އަލުން ލޮގިން ވުން ބޭނުންވެއެވެ. އަލުން ލޮގިން ވެއްޖެ ކުރައްވާށެ.",
    providerAlreadyLinked: "މި ފޯން ނަންބަރު އެހެން އެކައުންޓެއް އާ ގުޅިފައިވެއެވެ",
    invalidVerificationCode: "ވެރިފިކޭޝަން ކޯޑް ރަނގަޅު ނޫނެވެ. އަލުން ޓްރައި ކުރައްވާށެ",
    unknownError: "ކަލޭގެފާނު ނޭނގޭ މައްސަލައެއް ހިނގިއްޖެއެވެ",
    popupClosed: "ލޮގިން ޕޮޕްއަޕް ބަންދުވެއްޖެއެވެ. އަލުން ޓްރައި ކުރައްވާށެ.",
    accountExistsWithDifferentCredential:
      "މި އީމެއިލް އިން އެކައުންޓެއް މިހާރު ހުރެއެވެ. އަސްލު ޕްރޮވައިޑަރާ ލޮގިން ވެއްޖެ ކުރައްވާށެ.",
    displayNameRequired: "ޑިސްޕްލޭ ނަމެއް ލިޔުއްވާށެ",
    secondFactorAlreadyInUse: "މި ފޯން ނަންބަރު މި އެކައުންޓުގައި މިހާރު ރަޖިސްޓަރުވެފައިވެއެވެ.",
  },
  messages: {
    passwordResetEmailSent: "ޕާސްވޯޑް ރީސެޓް އީމެއިލް ކާމިޔާބުކޮށް ފޮނުވައިފިއެވެ",
    signInLinkSent: "ލޮގިން ލިންކް ކާމިޔާބުކޮށް ފޮނުވައިފިއެވެ",
    verificationCodeFirst: "ފުރަތަމަ ވެރިފިކޭޝަން ކޯޑް ރިކުއެސްޓް ކުރައްވާށެ",
    checkEmailForReset: "ޕާސްވޯޑް ރީސެޓްގެ ހިދާޔަތަށް ތިޔަ އީމެއިލް ބަލައްވާށެ",
    dividerOr: "ނުވަތަ",
    termsAndPrivacy: "ކުރިއަށް ދިއުމުން، ތިބާ އަހަރެމެންގެ {tos} އާއި {privacy} އާ ގުޅިވެއެވެ.",
    mfaSmsAssertionPrompt: "އޮތެންޓިކޭޝަން ނިންމުމަށް {phoneNumber} އަށް ވެރިފިކޭޝަން ކޯޑެއް ފޮނުވާނެއެވެ.",
  },
  labels: {
    emailAddress: "އީމެއިލް އެޑްރެސް",
    password: "ޕާސްވޯޑް",
    displayName: "ޑިސްޕްލޭ ނަން",
    forgotPassword: "ޕާސްވޯޑް ހަނދާންނެތެއްސޭ؟",
    signUp: "ރަޖިސްޓަރ ވާ",
    signIn: "ލޮގިން ވާ",
    resetPassword: "ޕާސްވޯޑް ރީސެޓް",
    createAccount: "އެކައުންޓް ހަދާ",
    backToSignIn: "ލޮގިން އަށް އަނބުރާ",
    signInWithPhone: "ފޯނުން ލޮގިން ވާ",
    phoneNumber: "ފޯން ނަންބަރު",
    verificationCode: "ވެރިފިކޭޝަން ކޯޑް",
    sendCode: "ކޯޑް ފޮނުވާ",
    verifyCode: "ކޯޑް ވެރިފައި ކުރައްވާ",
    signInWithGoogle: "Google އިން ލޮގިން ވާ",
    signInWithFacebook: "Facebook އިން ލޮގިން ވާ",
    signInWithApple: "Apple އިން ލޮގިން ވާ",
    signInWithMicrosoft: "Microsoft އިން ލޮގިން ވާ",
    signInWithGitHub: "GitHub އިން ލޮގިން ވާ",
    signInWithYahoo: "Yahoo އިން ލޮގިން ވާ",
    signInWithTwitter: "X އިން ލޮގިން ވާ",
    signInWithEmailLink: "އީމެއިލް ލިންކުން ލޮގިން ވާ",
    sendSignInLink: "ލޮގިން ލިންކް ފޮނުވާ",
    termsOfService: "ސޯވިސްގެ ޝަރުތު",
    privacyPolicy: "ޕްރައިވަސީ ޕޮލިސީ",
    resendCode: "ކޯޑް އަލުން ފޮނުވާ",
    sending: "ފޮނުވަނީ...",
    dismiss: "ބަންދުކުރޭ",
    multiFactorEnrollment: "މަލްޓީ ފެކްޓަރ ރަޖިސްޓްރޭޝަން",
    multiFactorAssertion: "މަލްޓީ ފެކްޓަރ އޮތެންޓިކޭޝަން",
    mfaTotpVerification: "TOTP ވެރިފިކޭޝަން",
    mfaSmsVerification: "SMS ވެރިފިކޭޝަން",
    generateQrCode: "QR ކޯޑް ހަދާ",
  },
  prompts: {
    noAccount: "އެކައުންޓެއް ނެތް؟",
    haveAccount: "އެކައުންޓެއް ކުރިންވެއެއްތޯ؟",
    enterEmailToReset: "ޕާސްވޯޑް ރީސެޓް ކުރުމަށް ތިޔަ އީމެއިލް އެޑްރެސް ލިޔުއްވާށެ",
    signInToAccount: "ތިޔަ އެކައުންޓަށް ލޮގިން ވާށެ",
    smsVerificationPrompt: "ތިޔަ ފޯން ނަންބަރަށް ފޮނުވާފައިވާ ވެރިފިކޭޝަން ކޯޑް ލިޔުއްވާށެ",
    enterDetailsToCreate: "އާ އެކައުންޓެއް ހަދަން ތިޔަ މަޢުލޫމާތު ލިޔުއްވާށެ",
    enterPhoneNumber: "ތިޔަ ފޯން ނަންބަރު ލިޔުއްވާށެ",
    enterVerificationCode: "ވެރިފިކޭޝަން ކޯޑް ލިޔުއްވާށެ",
    enterEmailForLink: "ލޮގިން ލިންކް ލިބިގަތުމަށް ތިޔަ އީމެއިލް ލިޔުއްވާށެ",
    mfaEnrollmentPrompt: "އާ މަލްޓީ ފެކްޓަރ ރަޖިސްޓްރޭޝަން ގޮތެއް ހޮވާށެ",
    mfaAssertionPrompt: "މަލްޓީ ފެކްޓަރ އޮތެންޓިކޭޝަން ނިންމާލައްވާށެ",
    mfaAssertionFactorPrompt: "މަލްޓީ ފެކްޓަރ އޮތެންޓިކޭޝަން ގޮތެއް ހޮވާށެ",
    mfaTotpQrCodePrompt: "މި QR ކޯޑް ތިޔަ އޮތެންޓިކޭޝަން އެޕުން ސްކޭން ކުރައްވާށެ",
    mfaTotpEnrollmentVerificationPrompt: "ތިޔަ އޮތެންޓިކޭޝަން އެޕުން ހަދާފައިވާ ކޯޑް ލިޔުއްވާށެ",
  },
} satisfies CompleteTranslationsWithoutLegacy;
