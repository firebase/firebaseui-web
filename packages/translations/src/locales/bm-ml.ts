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

export const bmML = {
  errors: {
    userNotFound: "Kunnafoni in ni email adresi oyɔrɔ tɛ sɔrɔ",
    wrongPassword: "Tɛmɛnnen parole",
    invalidEmail: "Hakilina, a ka email adresi ɲuman don",
    userDisabled: "Konte in banna",
    networkRequestFailed: "Sɛrɛvɛri ma se ka kɛ. Hakilina, a ka internet kɔnɛ ɲɛfɔ",
    tooManyRequests: "Ɲɔgɔn ɲɛnajɛ tɛ se ka kɛ. Hakilina, a segin tuma dɔw kɔfɛ",
    missingVerificationCode: "Hakilina, a ka dɔnniya koodu don",
    emailAlreadyInUse: "Kunnafoni bɛ ni email in ye kɔnɔ",
    invalidCredential: "Kunnafoni minnu di, olu tɛ ɲuman.",
    weakPassword: "Parole ka kan ka kɛ jɛkulu 6 ye",
    unverifiedEmail: "Hakilina, a ka email adresi dɔnniya ka kɛ kɔfɛ ka taa.",
    operationNotAllowed: "O baara tɛ dɔn. Hakilina, a ka dɛmɛ ɲɛ.",
    invalidPhoneNumber: "Telefoni nimero tɛ ɲuman",
    missingPhoneNumber: "Hakilina, telefoni nimero don",
    quotaExceeded: "SMS ka ɲɛfɛ ka ca. Hakilina, a segin tuma dɔw kɔfɛ",
    codeExpired: "Dɔnniya koodu waati ye bɔ",
    captchaCheckFailed: "reCAPTCHA dɔnniya ma se ka kɛ. Hakilina, a segin.",
    missingVerificationId: "Hakilina, a ka reCAPTCHA dɔnniya kɛ fɔlɔ.",
    missingEmail: "Hakilina, email adresi don",
    invalidActionCode: "Parole sabati ɲɛfɔ tɛ ɲuman walima a waati ye bɔ",
    credentialAlreadyInUse: "Kunnafoni bɛ ni email in ye kɔnɔ. Hakilina, a ka don ni o kunnafoni ye.",
    requiresRecentLogin: "O baara ka wajibi ka kɛ ni dɔnkili kura ye. Hakilina, a segin don.",
    providerAlreadyLinked: "Telefoni nimero in bɛ kunnafoni wɛrɛ ye",
    invalidVerificationCode: "Dɔnniya koodu tɛ ɲuman. Hakilina, a segin",
    unknownError: "Ko tɛ dɔn bɔra",
    popupClosed: "Don windo in bɔnɛ. Hakilina, a segin.",
    accountExistsWithDifferentCredential: "Kunnafoni bɛ ni email in ye kɔnɔ. Hakilina, a ka don ni fɔlɔ provaidɛri ye.",
    displayNameRequired: "Hakilina, a ka yɛrɛ togo don",
    secondFactorAlreadyInUse: "Telefoni nimero in bɛ kunnafoni in ye kɔnɔ.",
  },
  messages: {
    passwordResetEmailSent: "Parole sabati email ne ka ɲɛ ka taa",
    signInLinkSent: "Don link ne ka ɲɛ ka taa",
    verificationCodeFirst: "Hakilina, a ka dɔnniya koodu ɲini fɔlɔ",
    checkEmailForReset: "A ka email ɲɛfɔ parole sabati kɛlɛ ɲɛfɛ",
    dividerOr: "walima",
    termsAndPrivacy: "I ka kɛ ka taa kɔfɛ, i bɛ ɲɛnamaya ni {tos} ni {privacy} ye.",
    mfaSmsAssertionPrompt: "Dɔnniya koodu bɛ ta {phoneNumber} la walasa ka dɔnniya baara ka kɛ.",
  },
  labels: {
    emailAddress: "Email Adresi",
    password: "Parole",
    displayName: "Togo Ɲɛfɔ",
    forgotPassword: "I ɲinɛna parole la wa?",
    signUp: "I tɔgɔ sɛbɛn",
    signIn: "Don",
    resetPassword: "Parole Sabati",
    createAccount: "Konte da",
    backToSignIn: "Segin Don",
    signInWithPhone: "Telefoni Ni Don",
    phoneNumber: "Telefoni Nimero",
    verificationCode: "Dɔnniya Koodu",
    sendCode: "Koodu Ta",
    verifyCode: "Koodu Dɔnniya",
    signInWithGoogle: "Google Ni Don",
    signInWithFacebook: "Facebook Ni Don",
    signInWithApple: "Apple Ni Don",
    signInWithMicrosoft: "Microsoft Ni Don",
    signInWithGitHub: "GitHub Ni Don",
    signInWithYahoo: "Yahoo Ni Don",
    signInWithTwitter: "X Ni Don",
    signInWithEmailLink: "Email Link Ni Don",
    sendSignInLink: "Don Link Ta",
    termsOfService: "Baara Kuntigiw",
    privacyPolicy: "Kunnafoni Lakika",
    resendCode: "Koodu Ta Segin",
    sending: "Bɛ ta...",
    multiFactorEnrollment: "Dɔnniya Kɔnɔ Ka Tɛmɛ",
    multiFactorAssertion: "Dɔnniya Kɔnɔ Ka Dɔnniya",
    mfaTotpVerification: "TOTP Dɔnniya",
    mfaSmsVerification: "SMS Dɔnniya",
    generateQrCode: "QR Koodu Da",
  },
  prompts: {
    noAccount: "I ka kunnafoni tɛ wa?",
    haveAccount: "I ka kunnafoni bɛ wa?",
    enterEmailToReset: "I ka email adresi don walasa ka i ka parole sabati",
    signInToAccount: "I ka kunnafoni na don",
    smsVerificationPrompt: "Koodu don min ci i ka telefoni nimero la",
    enterDetailsToCreate: "I ka kunnafoniw don walasa ka konte kura da",
    enterPhoneNumber: "I ka telefoni nimero don",
    enterVerificationCode: "I ka dɔnniya koodu don",
    enterEmailForLink: "I ka email don walasa ka don link ɲini",
    mfaEnrollmentPrompt: "Hakilina, sugandi dɔnniya kɔnɔ ka tɛmɛ kura sugandi",
    mfaAssertionPrompt: "Hakilina, a ka dɔnniya kɔnɔ ka baara kɛ",
    mfaAssertionFactorPrompt: "Hakilina, sugandi dɔnniya kɔnɔ ka ɲɛnamaya sugandi",
    mfaTotpQrCodePrompt: "I ka QR koodu in skan ni i ka authenticator aplikasiyɔn ye",
    mfaTotpEnrollmentVerificationPrompt: "I ka koodu in don minnu bɛ kɛ i ka authenticator aplikasiyɔn na",
  },
} satisfies Translations;
