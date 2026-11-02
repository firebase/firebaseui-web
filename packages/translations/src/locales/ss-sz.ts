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

export const ssSZ = {
  errors: {
    userNotFound: "Akukho bhalansi lotfolakala ngale-imeyili",
    wrongPassword: "Liphasiwedi lingalungile",
    invalidEmail: "Sicela ufake ikheli le-imeyili elisebenzako",
    userDisabled: "Lolu bhalansi luvimbiwe",
    networkRequestFailed: "Asikwazi kuxhuma kuseva. Sicela uhlole ukuxhumeka kwakho kwe-inthanethi",
    tooManyRequests: "Imizamo yekuphindza mincane kakhulu. Sicela uzame futsi kamuva",
    missingVerificationCode: "Sicela ufake likhodi lekuqinisekisa",
    emailAlreadyInUse: "Sekuvele kukhona libhalansi lalo ikheli le-imeyili",
    invalidCredential: "Tinkholelo letinikiwe atisebenzi.",
    weakPassword: "Liphasiwedi kufanele libe nemagama lama-6 nje",
    unverifiedEmail: "Sicela uqinisekise ikheli lakho le-imeyili ukuze uqhubeke.",
    operationNotAllowed: "Lesi senti asivumelekile. Sicela uxhumane nesekelo.",
    invalidPhoneNumber: "Inombolo yefoni ayisebenzi",
    missingPhoneNumber: "Sicela unikete inombolo yefoni",
    quotaExceeded: "Umkhawulo we-SMS udlulile. Sicela uzame futsi kamuva",
    codeExpired: "Likhodi lekuqinisekisa liphelelwe yisikhathi",
    captchaCheckFailed: "Kuqinisekiswa kwe-reCAPTCHA kwehlulekile. Sicela uzame futsi.",
    missingVerificationId: "Sicela uqale uqedele kuqinisekiswa kwe-reCAPTCHA.",
    missingEmail: "Sicela unikete ikheli le-imeyili",
    invalidActionCode: "Ilinki yekusetfwa kabusha kwaliphasiwedi ayisebenzi noma seliphelelwe yisikhathi",
    credentialAlreadyInUse: "Sekuvele kukhona libhalansi lalo ikheli le-imeyili. Sicela ungene ngalelo bhalansi.",
    requiresRecentLogin: "Lesi senti sidinga kungena esikhatsini sakamuva. Sicela ungene futsi.",
    providerAlreadyLinked: "Le nombolo yefoni isuvele ihlanganiswe nelinye libhalansi",
    invalidVerificationCode: "Likhodi lekuqinisekisa alisebenzi. Sicela uzame futsi",
    unknownError: "Kwenteka liphutsa lelingalindzelwe",
    popupClosed: "Iwindi lekungena livaliwe. Sicela uzame futsi.",
    accountExistsWithDifferentCredential:
      "Sekuvele kukhona libhalansi lalo ikheli le-imeyili. Sicela ungene ngemnikati wekuqala.",
    displayNameRequired: "Sicela unikete libito lekubonakala",
    secondFactorAlreadyInUse: "Le nombolo yefoni isuvele ibhalisiwe kulelibhalansi.",
  },
  messages: {
    passwordResetEmailSent: "I-imeyili yekusetfwa kabusha kaliphasiwedi icindzetelwe ngempumelelo",
    signInLinkSent: "Ilinki yekungena icindzetelwe ngempumelelo",
    verificationCodeFirst: "Sicela ucele likhodi lekuqinisekisa kucala",
    checkEmailForReset: "Hlola i-imeyili yakho ngetekelelo tekusetfwa kabusha kaliphasiwedi",
    dividerOr: "noma",
    termsAndPrivacy: "Uma uqhubeka, uyavuma ku{tos} naku{privacy} wetfu.",
    mfaSmsAssertionPrompt:
      "Likhodi lekuqinisekisa lizakuthunyelwa ku-{phoneNumber} kuze kuphelele inqubo yekufakazela.",
  },
  labels: {
    emailAddress: "Ikheli Le-imeyili",
    password: "Liphasiwedi",
    displayName: "Libito Lekubonakala",
    forgotPassword: "Ukhohliwe liphasiwedi?",
    signUp: "Bhalisa",
    signIn: "Ngena",
    resetPassword: "Setfa Kabusha Liphasiwedi",
    createAccount: "Dala Libhalansi",
    backToSignIn: "Buyela Ekungeneni",
    signInWithPhone: "Ngena ngelucingo",
    phoneNumber: "Inombolo Yefoni",
    verificationCode: "Likhodi Lekuqinisekisa",
    sendCode: "Thumela Likhodi",
    verifyCode: "Qinisekisa Likhodi",
    signInWithGoogle: "Ngena nge-Google",
    signInWithFacebook: "Ngena nge-Facebook",
    signInWithApple: "Ngena nge-Apple",
    signInWithMicrosoft: "Ngena nge-Microsoft",
    signInWithGitHub: "Ngena nge-GitHub",
    signInWithYahoo: "Ngena nge-Yahoo",
    signInWithTwitter: "Ngena nge-X",
    signInWithEmailLink: "Ngena ngelinki ye-imeyili",
    sendSignInLink: "Thumela Linki Yekungena",
    termsOfService: "Timiso Teseveisi",
    privacyPolicy: "Inqubomgomo Yekuphepha",
    resendCode: "Phinda Uthumele Likhodi",
    sending: "Iyathumela...",
    multiFactorEnrollment: "Kubhalisa Kwemagatsi Lamaningi",
    multiFactorAssertion: "Kufakazela Ngemagatsi Lamaningi",
    mfaTotpVerification: "Kuqinisekiswa kwe-TOTP",
    mfaSmsVerification: "Kuqinisekiswa kwe-SMS",
    generateQrCode: "Khiqa I-QR Code",
  },
  prompts: {
    noAccount: "Awunalibhalansi?",
    haveAccount: "Sewunalo libhalansi?",
    enterEmailToReset: "Faka ikheli lakho le-imeyili kuze usete kabusha liphasiwedi lakho",
    signInToAccount: "Ngena kulibhalansi lakho",
    smsVerificationPrompt: "Faka likhodi lekuqinisekisa elithunyelwe kunombolo yakho yefoni",
    enterDetailsToCreate: "Faka imininingwane yakho kuze udale libhalansi lelisha",
    enterPhoneNumber: "Faka inombolo yakho yefoni",
    enterVerificationCode: "Faka likhodi lekuqinisekisa",
    enterEmailForLink: "Faka i-imeyili yakho kuze utfole linki yekungena",
    mfaEnrollmentPrompt: "Khetsa indlela lensha yekubhalisa ngemagatsi lamaningi",
    mfaAssertionPrompt: "Sicela uphelelise inqubo yekufakazela ngemagatsi lamaningi",
    mfaAssertionFactorPrompt: "Sicela ukhetse indlela yekufakazela ngemagatsi lamaningi",
    mfaTotpQrCodePrompt: "Skena le-QR code nge-app yakho yekufakaza",
    mfaTotpEnrollmentVerificationPrompt: "Engeza likhodi lelikhiqwe yi-app yakho yekufakaza",
  },
} satisfies Translations;
