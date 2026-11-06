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

export const myMM = {
  errors: {
    userNotFound: "ဤအီးမေးလ်လိပ်စာဖြင့် အကောင့်မတွေ့ပါ",
    wrongPassword: "စကားဝှက် မှားနေပါသည်",
    invalidEmail: "မှန်ကန်သော အီးမေးလ်လိပ်စာကို ရိုက်ထည့်ပါ",
    userDisabled: "ဤအကောင့်ကို ပိတ်ထားပါသည်",
    networkRequestFailed: "ဆာဗာသို့ ချိတ်ဆက်၍ မရပါ။ အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ",
    tooManyRequests: "ကြိုးစားမှု မအောင်မြင်မှု အကြိမ်ရေ အလွန်များနေပါသည်။ နောက်မှ ထပ်ကြိုးစားပါ",
    missingVerificationCode: "အတည်ပြုကုဒ်ကို ရိုက်ထည့်ပါ",
    emailAlreadyInUse: "ဤအီးမေးလ်ဖြင့် အကောင့်ရှိပြီးဖြစ်ပါသည်",
    invalidCredential: "ပေးထားသော အထောက်အထားများ မမှန်ကန်ပါ။",
    weakPassword: "စကားဝှက်သည် အနည်းဆုံး အက္ခရာ ၆ လုံး ရှိရပါမည်",
    unverifiedEmail: "ဆက်လက်ရန် သင့်အီးမေးလ်လိပ်စာကို အတည်ပြုပါ။",
    operationNotAllowed: "ဤလုပ်ဆောင်ချက်ကို ခွင့်မပြုပါ။ ပံ့ပိုးကူညီမှုကို ဆက်သွယ်ပါ။",
    invalidPhoneNumber: "ဖုန်းနံပါတ် မမှန်ကန်ပါ",
    missingPhoneNumber: "ဖုန်းနံပါတ်ကို ထည့်ပေးပါ",
    quotaExceeded: "SMS ကွာတာ ကျော်လွန်သွားပါပြီ။ နောက်မှ ထပ်ကြိုးစားပါ",
    codeExpired: "အတည်ပြုကုဒ်သက်တမ်း ကုန်ဆုံးသွားပါပြီ",
    captchaCheckFailed: "reCAPTCHA အတည်ပြုခြင်း မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။",
    missingVerificationId: "ရှေ့ဦးစွာ reCAPTCHA အတည်ပြုမှုကို ပြီးအောင်လုပ်ပါ။",
    missingEmail: "အီးမေးလ်လိပ်စာကို ထည့်ပေးပါ",
    invalidActionCode: "စကားဝှက် ပြန်သတ်မှတ်ရန် လင့်ခ်သည် မမှန်ကန်ပါ သို့မဟုတ် သက်တမ်းကုန်သွားပါပြီ",
    credentialAlreadyInUse: "ဤအီးမေးလ်ဖြင့် အကောင့်ရှိပြီးဖြစ်ပါသည်။ ထိုအကောင့်ဖြင့် ဝင်ရောက်ပါ။",
    requiresRecentLogin: "ဤလုပ်ဆောင်ချက်အတွက် မကြာသေးမီက ဝင်ရောက်မှု လိုအပ်ပါသည်။ ထပ်ဝင်ရောက်ပါ။",
    providerAlreadyLinked: "ဤဖုန်းနံပါတ်သည် အခြားအကောင့်နှင့် ချိတ်ဆက်ပြီးဖြစ်ပါသည်",
    invalidVerificationCode: "အတည်ပြုကုဒ် မမှန်ကန်ပါ။ ထပ်ကြိုးစားပါ",
    unknownError: "မမျှော်လင့်သော အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်",
    popupClosed: "ဝင်ရောက်ရန် ပေါ့ပ်အပ်ကို ပိတ်ထားပါသည်။ ထပ်ကြိုးစားပါ။",
    accountExistsWithDifferentCredential:
      "ဤအီးမေးလ်ဖြင့် အကောင့်ရှိပြီးဖြစ်ပါသည်။ မူလ ဝန်ဆောင်မှုပေးသူဖြင့် ဝင်ရောက်ပါ။",
    displayNameRequired: "ပြသမည့်အမည်ကို ထည့်ပေးပါ",
    secondFactorAlreadyInUse: "ဤဖုန်းနံပါတ်ကို ဤအကောင့်တွင် ပြီးသား မှတ်ပုံတင်ထားပါသည်။",
  },
  messages: {
    passwordResetEmailSent: "စကားဝှက် ပြန်သတ်မှတ်ရန် အီးမေးလ် အောင်မြင်စွာ ပို့ပြီးပါပြီ",
    signInLinkSent: "ဝင်ရောက်ရန် လင့်ခ် အောင်မြင်စွာ ပို့ပြီးပါပြီ",
    verificationCodeFirst: "ရှေ့ဦးစွာ အတည်ပြုကုဒ် တောင်းဆိုပါ",
    checkEmailForReset: "စကားဝှက် ပြန်သတ်မှတ်ရန် ညွှန်ကြားချက်များအတွက် သင့်အီးမေးလ်ကို စစ်ဆေးပါ",
    dividerOr: "သို့မဟုတ်",
    termsAndPrivacy: "ဆက်လက်လုပ်ဆောင်ခြင်းဖြင့် ကျွန်ုပ်တို့၏ {tos} နှင့် {privacy} ကို သဘောတူပါသည်။",
    mfaSmsAssertionPrompt: "အထောက်အထားစိစစ်ခြင်း လုပ်ငန်းစဉ်ပြီးစီးစေရန် အတည်ပြုကုဒ်ကို {phoneNumber} သို့ ပို့ပါမည်။",
  },
  labels: {
    emailAddress: "အီးမေးလ်လိပ်စာ",
    password: "စကားဝှက်",
    displayName: "ပြသမည့်အမည်",
    forgotPassword: "စကားဝှက် မေ့နေပါသလား?",
    signUp: "အကောင့်ဖွင့်ရန်",
    signIn: "ဝင်ရောက်ရန်",
    resetPassword: "စကားဝှက် ပြန်သတ်မှတ်ရန်",
    createAccount: "အကောင့် ဖန်တီးရန်",
    backToSignIn: "ဝင်ရောက်ရန် သို့ ပြန်သွားရန်",
    signInWithPhone: "ဖုန်းဖြင့် ဝင်ရောက်ရန်",
    phoneNumber: "ဖုန်းနံပါတ်",
    verificationCode: "အတည်ပြုကုဒ်",
    sendCode: "ကုဒ် ပို့ရန်",
    verifyCode: "ကုဒ် အတည်ပြုရန်",
    signInWithGoogle: "Google ဖြင့် ဝင်ရောက်ရန်",
    signInWithFacebook: "Facebook ဖြင့် ဝင်ရောက်ရန်",
    signInWithApple: "Apple ဖြင့် ဝင်ရောက်ရန်",
    signInWithMicrosoft: "Microsoft ဖြင့် ဝင်ရောက်ရန်",
    signInWithGitHub: "GitHub ဖြင့် ဝင်ရောက်ရန်",
    signInWithYahoo: "Yahoo ဖြင့် ဝင်ရောက်ရန်",
    signInWithTwitter: "X ဖြင့် ဝင်ရောက်ရန်",
    signInWithEmailLink: "အီးမေးလ်လင့်ခ်ဖြင့် ဝင်ရောက်ရန်",
    sendSignInLink: "ဝင်ရောက်ရန် လင့်ခ် ပို့ရန်",
    termsOfService: "ဝန်ဆောင်မှု စည်းမျဉ်းများ",
    privacyPolicy: "ကိုယ်ရေးကိုယ်တာ မူဝါဒ",
    resendCode: "ကုဒ် ပြန်ပို့ရန်",
    sending: "ပို့နေသည်...",
    dismiss: "ပိတ်ရန်",
    multiFactorEnrollment: "အချက်အများအပြား မှတ်ပုံတင်ခြင်း",
    multiFactorAssertion: "အချက်အများအပြား အထောက်အထားစိစစ်ခြင်း",
    mfaTotpVerification: "TOTP အတည်ပြုခြင်း",
    mfaSmsVerification: "SMS အတည်ပြုခြင်း",
    generateQrCode: "QR ကုဒ် ဖန်တီးရန်",
  },
  prompts: {
    noAccount: "အကောင့် မရှိသေးဘူးလား?",
    haveAccount: "အကောင့် ရှိပြီးသားလား?",
    enterEmailToReset: "စကားဝှက် ပြန်သတ်မှတ်ရန် သင့်အီးမေးလ်လိပ်စာကို ရိုက်ထည့်ပါ",
    signInToAccount: "သင့်အကောင့်သို့ ဝင်ရောက်ပါ",
    smsVerificationPrompt: "သင့်ဖုန်းနံပါတ်သို့ ပို့ထားသော အတည်ပြုကုဒ်ကို ရိုက်ထည့်ပါ",
    enterDetailsToCreate: "အကောင့်အသစ် ဖန်တီးရန် အချက်အလက်များကို ရိုက်ထည့်ပါ",
    enterPhoneNumber: "သင့်ဖုန်းနံပါတ်ကို ရိုက်ထည့်ပါ",
    enterVerificationCode: "အတည်ပြုကုဒ်ကို ရိုက်ထည့်ပါ",
    enterEmailForLink: "ဝင်ရောက်ရန် လင့်ခ် ရရှိရန် သင့်အီးမေးလ်ကို ရိုက်ထည့်ပါ",
    mfaEnrollmentPrompt: "အချက်အများအပြား မှတ်ပုံတင်ခြင်း နည်းလမ်းအသစ်ကို ရွေးပါ",
    mfaAssertionPrompt: "အချက်အများအပြား အထောက်အထားစိစစ်ခြင်း လုပ်ငန်းစဉ်ကို ပြီးစီးပါ",
    mfaAssertionFactorPrompt: "အချက်အများအပြား အထောက်အထားစိစစ်ခြင်း နည်းလမ်းကို ရွေးပါ",
    mfaTotpQrCodePrompt: "ဤ QR ကုဒ်ကို သင့် အထောက်အထားစိစစ်အက်ပ်ဖြင့် စကင်န်ဖတ်ပါ",
    mfaTotpEnrollmentVerificationPrompt: "သင့်အထောက်အထားစိစစ်အက်ပ်မှ ထုတ်ပေးသော ကုဒ်ကို ထည့်ပါ",
  },
} satisfies CompleteTranslationsWithoutLegacy;
