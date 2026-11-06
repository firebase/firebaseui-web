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

export const zuZA = {
  errors: {
    userNotFound: "Akukho akhawunti etholakele ngale kwe-imeyili",
    wrongPassword: "Iphasiwedi engalungile",
    invalidEmail: "Sicela ufake ikheli le-imeyili elivumelekile",
    userDisabled: "Le akhawunti ivaliwe",
    networkRequestFailed: "Ayikwazi ukuxhumana neseva. Sicela uhlole ukuxhumana kwakho ne-inthanethi",
    tooManyRequests: "Imizamo eminingi ehlulekile. Sicela uzame futhi emuva kwesikhathi",
    missingVerificationCode: "Sicela ufake ikhodi yokuqinisekisa",
    emailAlreadyInUse: "Sekukhona i-akhawunti enale imeyili",
    invalidCredential: "Izitifiketi ezinikeziwe azilungile.",
    weakPassword: "Iphasiwedi kufanele ibe nezinhlamvu ezingu-6 noma ngaphezulu",
    unverifiedEmail: "Sicela uqinisekise ikheli lakho le-imeyili ukuze uqhubeke.",
    operationNotAllowed: "Lo msebenzi awuvunyelwe. Sicela uxhumane nosekelo.",
    invalidPhoneNumber: "Inombolo yefoni ayilungile",
    missingPhoneNumber: "Sicela unikeze inombolo yefoni",
    quotaExceeded: "Ikota ye-SMS yedlulile. Sicela uzame futhi emuva kwesikhathi",
    codeExpired: "Ikhodi yokuqinisekisa iphelelwe yisikhathi",
    captchaCheckFailed: "Ukuqinisekiswa kwe-reCAPTCHA kuhlulekile. Sicela uzame futhi.",
    missingVerificationId: "Sicela uqedele ukuqinisekiswa kwe-reCAPTCHA kuqala.",
    missingEmail: "Sicela unikeze ikheli le-imeyili",
    invalidActionCode: "Isixhumanisi sokusetha kabusha iphasiwedi asilungile noma sesiphelelwe yisikhathi",
    credentialAlreadyInUse: "Sekukhona i-akhawunti enale imeyili. Sicela ngena ngale akhawunti.",
    requiresRecentLogin: "Lo msebenzi udinga ukungena kwakamuva. Sicela ungene futhi.",
    providerAlreadyLinked: "Le nombolo yefoni seyihlanganiswe nenye i-akhawunti",
    invalidVerificationCode: "Ikhodi yokuqinisekisa ayilungile. Sicela uzame futhi",
    unknownError: "Kuvele iphutha elingalindelekile",
    popupClosed: "Iwindi lokungena livaliwe. Sicela uzame futhi.",
    accountExistsWithDifferentCredential: "Sekukhona i-akhawunti enale imeyili. Sicela ungene ngomhlinzeki wokuqala.",
    displayNameRequired: "Sicela unikeze igama okuzobonakala",
    secondFactorAlreadyInUse: "Le nombolo yefoni seyibhalisiwe kule akhawunti.",
  },
  messages: {
    passwordResetEmailSent: "I-imeyili yokusetha kabusha iphasiwedi ithunyelwe ngempumelelo",
    signInLinkSent: "Isixhumanisi sokungena sithunyelwe ngempumelelo",
    verificationCodeFirst: "Sicela ucele ikhodi yokuqinisekisa kuqala",
    checkEmailForReset: "Hlola i-imeyili yakho ukuze uthole imiyalelo yokusetha kabusha iphasiwedi",
    dividerOr: "noma",
    termsAndPrivacy: "Ngokuqhubeka, uyavuma ku-{tos} nakwi-{privacy} yethu.",
    mfaSmsAssertionPrompt: "Ikhodi yokuqinisekisa izothunyelwa ku-{phoneNumber} ukuqedela inqubo yokuqinisekisa.",
  },
  labels: {
    emailAddress: "Ikheli le-Imeyili",
    password: "Iphasiwedi",
    displayName: "Igama Okuzobonakala",
    forgotPassword: "Ukhohlwe iphasiwedi?",
    signUp: "Bhalisa",
    signIn: "Ngena",
    resetPassword: "Setha Kabusha Iphasiwedi",
    createAccount: "Dala I-akhawunti",
    backToSignIn: "Buyela Ekungeneni",
    signInWithPhone: "Ngena ngefoni",
    phoneNumber: "Inombolo Yefoni",
    verificationCode: "Ikhodi Yokuqinisekisa",
    sendCode: "Thumela Ikhodi",
    verifyCode: "Qinisekisa Ikhodi",
    signInWithGoogle: "Ngena nge-Google",
    signInWithFacebook: "Ngena nge-Facebook",
    signInWithApple: "Ngena nge-Apple",
    signInWithMicrosoft: "Ngena nge-Microsoft",
    signInWithGitHub: "Ngena nge-GitHub",
    signInWithYahoo: "Ngena nge-Yahoo",
    signInWithTwitter: "Ngena nge-X",
    signInWithEmailLink: "Ngena ngesixhumanisi se-imeyili",
    sendSignInLink: "Thumela Isixhumanisi Sokungena",
    termsOfService: "Imigomo Yesevisi",
    privacyPolicy: "Inqubomgomo Yobumfihlo",
    resendCode: "Phinda Uthumele Ikhodi",
    sending: "Iyathumela...",
    dismiss: "Vala",
    multiFactorEnrollment: "Ukubhalisa Izinto Eziningi",
    multiFactorAssertion: "Ukuqinisekisa Izinto Eziningi",
    mfaTotpVerification: "Ukuqinisekisa i-TOTP",
    mfaSmsVerification: "Ukuqinisekisa nge-SMS",
    generateQrCode: "Dala Ikhodi ye-QR",
  },
  prompts: {
    noAccount: "Awunayo i-akhawunti?",
    haveAccount: "Sewunayo i-akhawunti?",
    enterEmailToReset: "Faka ikheli lakho le-imeyili ukuze usethe kabusha iphasiwedi yakho",
    signInToAccount: "Ngena ku-akhawunti yakho",
    smsVerificationPrompt: "Faka ikhodi yokuqinisekisa ethunyelwe kunombolo yakho yefoni",
    enterDetailsToCreate: "Faka imininingwane yakho ukuze udale i-akhawunti entsha",
    enterPhoneNumber: "Faka inombolo yakho yefoni",
    enterVerificationCode: "Faka ikhodi yokuqinisekisa",
    enterEmailForLink: "Faka i-imeyili yakho ukuze uthole isixhumanisi sokungena",
    mfaEnrollmentPrompt: "Khetha indlela entsha yokubhalisa izinto eziningi",
    mfaAssertionPrompt: "Sicela uqedele inqubo yokuqinisekisa izinto eziningi",
    mfaAssertionFactorPrompt: "Sicela ukhethe indlela yokuqinisekisa izinto eziningi",
    mfaTotpQrCodePrompt: "Skena le khodi ye-QR ngohlelo lwakho lokuqinisekisa",
    mfaTotpEnrollmentVerificationPrompt: "Faka ikhodi ekhiqizwe uhlelo lwakho lokuqinisekisa",
  },
} satisfies CompleteTranslationsWithoutLegacy;
