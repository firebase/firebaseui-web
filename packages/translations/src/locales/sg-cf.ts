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

export const sgCF = {
  errors: {
    userNotFound: "A yeke ti konte so a wara ye ti e so ti imeli",
    wrongPassword: "Modpasse so a yeke ti ala",
    invalidEmail: "Tene mbi sara adresse imeli so a yeke",
    userDisabled: "Konte so a gbu tongana",
    networkRequestFailed: "A yeke ti mû ye na serveur. Tene mbi sara connexion internet ti mo",
    tooManyRequests: "Mbeni nzoni ti gbu ye mingi. Tene mbi sara lo na pekoni",
    missingVerificationCode: "Tene mbi sara kode ti verifier",
    emailAlreadyInUse: "Konte so a wara ye na imeli so",
    invalidCredential: "Information so a mû ayeke ti ala.",
    weakPassword: "Modpasse ayeke tongana a mû ye ti caractères 6 ni",
    unverifiedEmail: "Tene mbi verifier adresse imeli ti mo pëpe ti kpe na ndo.",
    operationNotAllowed: "Ndembe so ayeke ti ala. Tene mbi sara ndo ti support.",
    invalidPhoneNumber: "Numéro ti téléphone so ayeke ti ala",
    missingPhoneNumber: "Tene mbi mû numéro ti téléphone",
    quotaExceeded: "Quota ti SMS a gbu ye. Tene mbi sara lo na pekoni",
    codeExpired: "Kode ti verifier a gbu ye",
    captchaCheckFailed: "Verification ti reCAPTCHA a gbu ye. Tene mbi sara lo na pekoni.",
    missingVerificationId: "Tene mbi sara verification ti reCAPTCHA kue na ndo.",
    missingEmail: "Tene mbi mû adresse imeli",
    invalidActionCode: "Lien ti mû modpasse ayeke ti ala walá a gbu ye",
    credentialAlreadyInUse: "Konte so a wara ye na imeli so. Tene mbi sara connexion na konte so.",
    requiresRecentLogin: "Ndembe so ayeke na connexion ti lâ. Tene mbi sara connexion pëpe.",
    providerAlreadyLinked: "Numéro ti téléphone so a wara ye na konte kekeri",
    invalidVerificationCode: "Kode ti verifier ayeke ti ala. Tene mbi sara lo na pekoni",
    unknownError: "A wara ye ti ndembe so a yeke ti ala",
    popupClosed: "Fenêtre ti connexion a gbu. Tene mbi sara lo na pekoni.",
    accountExistsWithDifferentCredential:
      "Konte so a wara ye na imeli so. Tene mbi sara connexion na fournisseur ti kpe.",
    displayNameRequired: "Tene mbi mû nom so a yeke fa",
    secondFactorAlreadyInUse: "Numéro ti téléphone so a wara ye na konte so.",
  },
  messages: {
    passwordResetEmailSent: "Imeli ti mû modpasse ti so a tokoni na lege",
    signInLinkSent: "Lien ti connexion a tokoni na lege",
    verificationCodeFirst: "Tene mbi mbi kode ti verifier na ndo",
    checkEmailForReset: "Tene mbi tara imeli ti mo ti mû tënë ti mû modpasse ti so",
    dividerOr: "walá",
    termsAndPrivacy: "Tongana a tambela, a mû ayeke na {tos} na {privacy} ti e.",
    mfaSmsAssertionPrompt: "Kode ti verifier a tokoni na {phoneNumber} ti zia ndembe ti authentification.",
  },
  labels: {
    emailAddress: "Adresse imeli",
    password: "Modpasse",
    displayName: "Nom so a yeke fa",
    forgotPassword: "Mo girisa modpasse?",
    signUp: "Inscription",
    signIn: "Connexion",
    resetPassword: "Mû modpasse ti so",
    createAccount: "Sara konte",
    backToSignIn: "Tröngö na connexion",
    signInWithPhone: "Connexion na téléphone",
    phoneNumber: "Numéro ti téléphone",
    verificationCode: "Kode ti verifier",
    sendCode: "Tokoni kode",
    verifyCode: "Verifier kode",
    signInWithGoogle: "Connexion na Google",
    signInWithFacebook: "Connexion na Facebook",
    signInWithApple: "Connexion na Apple",
    signInWithMicrosoft: "Connexion na Microsoft",
    signInWithGitHub: "Connexion na GitHub",
    signInWithYahoo: "Connexion na Yahoo",
    signInWithTwitter: "Connexion na X",
    signInWithEmailLink: "Connexion na lien ti imeli",
    sendSignInLink: "Tokoni lien ti connexion",
    termsOfService: "Ndoro ti service",
    privacyPolicy: "Politique ti confidentialité",
    resendCode: "Tokoni kode lani",
    sending: "A yeke tokoni...",
    dismiss: "Kanga",
    multiFactorEnrollment: "Inscription ti authentification multifacteur",
    multiFactorAssertion: "Authentification multifacteur",
    mfaTotpVerification: "Verification TOTP",
    mfaSmsVerification: "Verification SMS",
    generateQrCode: "Sara QR code",
  },
  prompts: {
    noAccount: "I yeke na konte ti mo ti pëpe?",
    haveAccount: "I wara konte ahon?",
    enterEmailToReset: "Tene mbi adresse imeli ti mo ti mû modpasse ti so",
    signInToAccount: "Connecté na konte ti mo",
    smsVerificationPrompt: "Tene mbi kode ti verifier so a tokoni na numéro ti téléphone ti mo",
    enterDetailsToCreate: "Tene mbi renseignement ti mo ti sara konte kekeri",
    enterPhoneNumber: "Tene mbi numéro ti téléphone ti mo",
    enterVerificationCode: "Tene mbi kode ti verifier",
    enterEmailForLink: "Tene mbi imeli ti mo ti mû lien ti connexion",
    mfaEnrollmentPrompt: "Hunda ndembe kekeri ti inscription ti authentification multifacteur",
    mfaAssertionPrompt: "Tene mbi zia ndembe ti authentification multifacteur",
    mfaAssertionFactorPrompt: "Tene mbi hunda ndembe ti authentification multifacteur",
    mfaTotpQrCodePrompt: "Scanner QR code so na application ti authentification ti mo",
    mfaTotpEnrollmentVerificationPrompt: "Fa kode so application ti authentification ti mo a sara",
  },
} satisfies StrictTranslations;
