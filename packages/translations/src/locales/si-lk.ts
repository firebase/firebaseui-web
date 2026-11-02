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

export const siLK = {
  errors: {
    userNotFound: "මෙම ඊමේල් ලිපිනය සමඟ ගිණුමක් හමු නොවීය",
    wrongPassword: "මුරපදය වැරදියි",
    invalidEmail: "කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න",
    userDisabled: "මෙම ගිණුම අක්‍රිය කර ඇත",
    networkRequestFailed: "සේවාදායකයට සම්බන්ධ වීමට නොහැක. කරුණාකර ඔබේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න",
    tooManyRequests: "අසාර්ථක උත්සාහයන් ගණනාවක්. කරුණාකර පසුව නැවත උත්සාහ කරන්න",
    missingVerificationCode: "කරුණාකර සත්‍යාපන කේතය ඇතුළත් කරන්න",
    emailAlreadyInUse: "මෙම ඊමේල් ලිපිනය සමඟ ගිණුමක් දැනටමත් පවතී",
    invalidCredential: "සපයන ලද අක්තපත්‍ර වලංගු නොවේ.",
    weakPassword: "මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය",
    unverifiedEmail: "දිගටම කරගෙන යාමට ඔබේ ඊමේල් ලිපිනය සත්‍යාපනය කරන්න.",
    operationNotAllowed: "මෙම මෙහෙයුමට අවසර නැත. කරුණාකර සහාය සමඟ සම්බන්ධ වන්න.",
    invalidPhoneNumber: "දුරකථන අංකය වලංගු නොවේ",
    missingPhoneNumber: "කරුණාකර දුරකථන අංකයක් ලබා දෙන්න",
    quotaExceeded: "SMS සීමාව ඉක්මවා ඇත. කරුණාකර පසුව නැවත උත්සාහ කරන්න",
    codeExpired: "සත්‍යාපන කේතය කල්ඉකුත් වී ඇත",
    captchaCheckFailed: "reCAPTCHA සත්‍යාපනය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    missingVerificationId: "කරුණාකර පළමුව reCAPTCHA සත්‍යාපනය සම්පූර්ණ කරන්න.",
    missingEmail: "කරුණාකර ඊමේල් ලිපිනයක් ලබා දෙන්න",
    invalidActionCode: "මුරපද යළි පිහිටුවීමේ සබැඳිය වලංගු නොවේ හෝ කල්ඉකුත් වී ඇත",
    credentialAlreadyInUse: "මෙම ඊමේල් ලිපිනය සමඟ ගිණුමක් දැනටමත් පවතී. කරුණාකර එම ගිණුමෙන් පුරනය වන්න.",
    requiresRecentLogin: "මෙම මෙහෙයුමට මෑත පිවිසුමක් අවශ්‍යයි. කරුණාකර නැවත පුරනය වන්න.",
    providerAlreadyLinked: "මෙම දුරකථන අංකය දැනටමත් වෙනත් ගිණුමකට සම්බන්ධ කර ඇත",
    invalidVerificationCode: "සත්‍යාපන කේතය වලංගු නොවේ. කරුණාකර නැවත උත්සාහ කරන්න",
    unknownError: "අනපේක්ෂිත දෝෂයක් ඇති විය",
    popupClosed: "පුරනය වීමේ popup වසා ඇත. කරුණාකර නැවත උත්සාහ කරන්න.",
    accountExistsWithDifferentCredential:
      "මෙම ඊමේල් ලිපිනය සමඟ ගිණුමක් දැනටමත් පවතී. කරුණාකර මුල් සපයන්නා හරහා පුරනය වන්න.",
    displayNameRequired: "කරුණාකර සංදර්ශන නමක් ලබා දෙන්න",
    secondFactorAlreadyInUse: "මෙම දුරකථන අංකය දැනටමත් මෙම ගිණුම සමඟ ලියාපදිංචි කර ඇත.",
  },
  messages: {
    passwordResetEmailSent: "මුරපදය යළි පිහිටුවීමේ ඊමේල් සාර්ථකව යවන ලදී",
    signInLinkSent: "පුරනය වීමේ සබැඳිය සාර්ථකව යවන ලදී",
    verificationCodeFirst: "කරුණාකර පළමුව සත්‍යාපන කේතයක් ඉල්ලන්න",
    checkEmailForReset: "මුරපදය යළි පිහිටුවීමේ උපදෙස් සඳහා ඔබේ ඊමේල් පරීක්ෂා කරන්න",
    dividerOr: "හෝ",
    termsAndPrivacy: "දිගටම කරගෙන යාමෙන්, ඔබ අපගේ {tos} සහ {privacy} වලට එකඟ වේ.",
    mfaSmsAssertionPrompt: "සත්‍යාපන ක්‍රියාවලිය සම්පූර්ණ කිරීමට {phoneNumber} වෙත සත්‍යාපන කේතයක් යවනු ඇත.",
  },
  labels: {
    emailAddress: "ඊමේල් ලිපිනය",
    password: "මුරපදය",
    displayName: "සංදර්ශන නම",
    forgotPassword: "මුරපදය අමතකද?",
    signUp: "ලියාපදිංචි වන්න",
    signIn: "පුරන්න",
    resetPassword: "මුරපදය යළි පිහිටුවන්න",
    createAccount: "ගිණුමක් සාදන්න",
    backToSignIn: "පුරනයට ආපසු",
    signInWithPhone: "දුරකථනයෙන් පුරන්න",
    phoneNumber: "දුරකථන අංකය",
    verificationCode: "සත්‍යාපන කේතය",
    sendCode: "කේතය යවන්න",
    verifyCode: "කේතය සත්‍යාපනය කරන්න",
    signInWithGoogle: "Google සමඟ පුරන්න",
    signInWithFacebook: "Facebook සමඟ පුරන්න",
    signInWithApple: "Apple සමඟ පුරන්න",
    signInWithMicrosoft: "Microsoft සමඟ පුරන්න",
    signInWithGitHub: "GitHub සමඟ පුරන්න",
    signInWithYahoo: "Yahoo සමඟ පුරන්න",
    signInWithTwitter: "X සමඟ පුරන්න",
    signInWithEmailLink: "ඊමේල් සබැඳිය සමඟ පුරන්න",
    sendSignInLink: "පුරනය වීමේ සබැඳිය යවන්න",
    termsOfService: "සේවා කොන්දේසි",
    privacyPolicy: "රහස්‍යතා ප්‍රතිපත්තිය",
    resendCode: "කේතය නැවත යවන්න",
    sending: "යවමින්...",
    multiFactorEnrollment: "බහු-සාධක ලියාපදිංචිය",
    multiFactorAssertion: "බහු-සාධක සත්‍යාපනය",
    mfaTotpVerification: "TOTP සත්‍යාපනය",
    mfaSmsVerification: "SMS සත්‍යාපනය",
    generateQrCode: "QR කේතය උත්පාදනය කරන්න",
  },
  prompts: {
    noAccount: "ගිණුමක් නැද්ද?",
    haveAccount: "දැනටමත් ගිණුමක් ඇද්ද?",
    enterEmailToReset: "ඔබේ මුරපදය යළි පිහිටුවීමට ඔබේ ඊමේල් ලිපිනය ඇතුළත් කරන්න",
    signInToAccount: "ඔබේ ගිණුමට පුරන්න",
    smsVerificationPrompt: "ඔබේ දුරකථන අංකයට යවන ලද සත්‍යාපන කේතය ඇතුළත් කරන්න",
    enterDetailsToCreate: "නව ගිණුමක් සෑදීමට ඔබේ විස්තර ඇතුළත් කරන්න",
    enterPhoneNumber: "ඔබේ දුරකථන අංකය ඇතුළත් කරන්න",
    enterVerificationCode: "සත්‍යාපන කේතය ඇතුළත් කරන්න",
    enterEmailForLink: "පුරනය වීමේ සබැඳිය ලබා ගැනීමට ඔබේ ඊමේල් ඇතුළත් කරන්න",
    mfaEnrollmentPrompt: "නව බහු-සාධක ලියාපදිංචි ක්‍රමයක් තෝරන්න",
    mfaAssertionPrompt: "කරුණාකර බහු-සාධක සත්‍යාපන ක්‍රියාවලිය සම්පූර්ණ කරන්න",
    mfaAssertionFactorPrompt: "කරුණාකර බහු-සාධක සත්‍යාපන ක්‍රමයක් තෝරන්න",
    mfaTotpQrCodePrompt: "ඔබේ සත්‍යාපක යෙදුමෙන් මෙම QR කේතය ස්කෑන් කරන්න",
    mfaTotpEnrollmentVerificationPrompt: "ඔබේ සත්‍යාපක යෙදුම මගින් උත්පාදනය වන කේතය එක් කරන්න",
  },
} satisfies Translations;
