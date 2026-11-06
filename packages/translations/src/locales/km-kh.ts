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

export const kmKH = {
  errors: {
    userNotFound: "រកមិនឃើញគណនីដែលប្រើអាសយដ្ឋានអ៊ីមែលនេះទេ",
    wrongPassword: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
    invalidEmail: "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលត្រឹមត្រូវ",
    userDisabled: "គណនីនេះត្រូវបានបិទ",
    networkRequestFailed: "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក",
    tooManyRequests: "ការព្យាយាមខកខានច្រើនដង។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ",
    missingVerificationCode: "សូមបញ្ចូលលេខកូដផ្ទៀងផ្ទាត់",
    emailAlreadyInUse: "មានគណនីដែលប្រើអ៊ីមែលនេះរួចហើយ",
    invalidCredential: "ព័ត៌មានការចូលដែលបានផ្តល់មិនត្រឹមត្រូវទេ។",
    weakPassword: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ",
    unverifiedEmail: "សូមផ្ទៀងផ្ទាត់អាសយដ្ឋានអ៊ីមែលរបស់អ្នក ដើម្បីបន្ត។",
    operationNotAllowed: "ប្រតិបត្តិការនេះមិនត្រូវបានអនុញ្ញាតទេ។ សូមទាក់ទងផ្នែកជំនួយ។",
    invalidPhoneNumber: "លេខទូរស័ព្ទមិនត្រឹមត្រូវ",
    missingPhoneNumber: "សូមផ្តល់លេខទូរស័ព្ទ",
    quotaExceeded: "ដល់កម្រិត SMS ហើយ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ",
    codeExpired: "លេខកូដផ្ទៀងផ្ទាត់បានផុតកំណត់ហើយ",
    captchaCheckFailed: "ការផ្ទៀងផ្ទាត់ reCAPTCHA បានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។",
    missingVerificationId: "សូមបញ្ចប់ការផ្ទៀងផ្ទាត់ reCAPTCHA ជាមុនសិន។",
    missingEmail: "សូមផ្តល់អាសយដ្ឋានអ៊ីមែល",
    invalidActionCode: "តំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញមិនត្រឹមត្រូវ ឬបានផុតកំណត់ហើយ",
    credentialAlreadyInUse: "មានគណនីដែលប្រើអ៊ីមែលនេះរួចហើយ។ សូមចូលដោយប្រើគណនីនោះ។",
    requiresRecentLogin: "ប្រតិបត្តិការនេះត្រូវការការចូលថ្មីៗ។ សូមចូលម្តងទៀត។",
    providerAlreadyLinked: "លេខទូរស័ព្ទនេះត្រូវបានភ្ជាប់ជាមួយគណនីផ្សេងរួចហើយ",
    invalidVerificationCode: "លេខកូដផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ។ សូមព្យាយាមម្តងទៀត",
    unknownError: "មានកំហុសដែលមិនបានរំពឹងទុកកើតឡើង",
    popupClosed: "ផ្ទាំងចូលត្រូវបានបិទ។ សូមព្យាយាមម្តងទៀត។",
    accountExistsWithDifferentCredential: "មានគណនីដែលប្រើអ៊ីមែលនេះរួចហើយ។ សូមចូលដោយប្រើអ្នកផ្តល់សេវាដើម។",
    displayNameRequired: "សូមផ្តល់ឈ្មោះបង្ហាញ",
    secondFactorAlreadyInUse: "លេខទូរស័ព្ទនេះត្រូវបានចុះឈ្មោះជាមួយគណនីនេះរួចហើយ។",
  },
  messages: {
    passwordResetEmailSent: "បានផ្ញើអ៊ីមែលកំណត់ពាក្យសម្ងាត់ឡើងវិញដោយជោគជ័យ",
    signInLinkSent: "បានផ្ញើតំណភ្ជាប់ចូលដោយជោគជ័យ",
    verificationCodeFirst: "សូមស្នើសុំលេខកូដផ្ទៀងផ្ទាត់ជាមុនសិន",
    checkEmailForReset: "សូមពិនិត្យអ៊ីមែលរបស់អ្នកសម្រាប់ការណែនាំកំណត់ពាក្យសម្ងាត់ឡើងវិញ",
    dividerOr: "ឬ",
    termsAndPrivacy: "ដោយបន្ត អ្នកយល់ព្រមនឹង {tos} និង {privacy} របស់យើង។",
    mfaSmsAssertionPrompt: "លេខកូដផ្ទៀងផ្ទាត់នឹងត្រូវផ្ញើទៅ {phoneNumber} ដើម្បីបញ្ចប់ដំណើរការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ។",
  },
  labels: {
    emailAddress: "អាសយដ្ឋានអ៊ីមែល",
    password: "ពាក្យសម្ងាត់",
    displayName: "ឈ្មោះបង្ហាញ",
    forgotPassword: "ភ្លេចពាក្យសម្ងាត់?",
    signUp: "ចុះឈ្មោះ",
    signIn: "ចូល",
    resetPassword: "កំណត់ពាក្យសម្ងាត់ឡើងវិញ",
    createAccount: "បង្កើតគណនី",
    backToSignIn: "ត្រឡប់ទៅការចូល",
    signInWithPhone: "ចូលដោយប្រើទូរស័ព្ទ",
    phoneNumber: "លេខទូរស័ព្ទ",
    verificationCode: "លេខកូដផ្ទៀងផ្ទាត់",
    sendCode: "ផ្ញើលេខកូដ",
    verifyCode: "ផ្ទៀងផ្ទាត់លេខកូដ",
    signInWithGoogle: "ចូលដោយប្រើ Google",
    signInWithFacebook: "ចូលដោយប្រើ Facebook",
    signInWithApple: "ចូលដោយប្រើ Apple",
    signInWithMicrosoft: "ចូលដោយប្រើ Microsoft",
    signInWithGitHub: "ចូលដោយប្រើ GitHub",
    signInWithYahoo: "ចូលដោយប្រើ Yahoo",
    signInWithTwitter: "ចូលដោយប្រើ X",
    signInWithEmailLink: "ចូលដោយប្រើតំណអ៊ីមែល",
    sendSignInLink: "ផ្ញើតំណភ្ជាប់ចូល",
    termsOfService: "លក្ខខណ្ឌសេវាកម្ម",
    privacyPolicy: "គោលនយោបាយឯកជនភាព",
    resendCode: "ផ្ញើលេខកូដម្តងទៀត",
    sending: "កំពុងផ្ញើ...",
    dismiss: "បិទ",
    multiFactorEnrollment: "ការចុះឈ្មោះផ្ទៀងផ្ទាត់ពហុកត្តា",
    multiFactorAssertion: "ការផ្ទៀងផ្ទាត់ពហុកត្តា",
    mfaTotpVerification: "ការផ្ទៀងផ្ទាត់ TOTP",
    mfaSmsVerification: "ការផ្ទៀងផ្ទាត់ SMS",
    generateQrCode: "បង្កើតលេខកូដ QR",
  },
  prompts: {
    noAccount: "មិនមានគណនីទេឬ?",
    haveAccount: "មានគណនីរួចហើយឬ?",
    enterEmailToReset: "បញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក ដើម្បីកំណត់ពាក្យសម្ងាត់ឡើងវិញ",
    signInToAccount: "ចូលទៅកាន់គណនីរបស់អ្នក",
    smsVerificationPrompt: "បញ្ចូលលេខកូដផ្ទៀងផ្ទាត់ដែលបានផ្ញើទៅលេខទូរស័ព្ទរបស់អ្នក",
    enterDetailsToCreate: "បញ្ចូលព័ត៌មានរបស់អ្នក ដើម្បីបង្កើតគណនីថ្មី",
    enterPhoneNumber: "បញ្ចូលលេខទូរស័ព្ទរបស់អ្នក",
    enterVerificationCode: "បញ្ចូលលេខកូដផ្ទៀងផ្ទាត់",
    enterEmailForLink: "បញ្ចូលអ៊ីមែលរបស់អ្នក ដើម្បីទទួលតំណភ្ជាប់ចូល",
    mfaEnrollmentPrompt: "ជ្រើសរើសវិធីចុះឈ្មោះផ្ទៀងផ្ទាត់ពហុកត្តាថ្មី",
    mfaAssertionPrompt: "សូមបញ្ចប់ដំណើរការផ្ទៀងផ្ទាត់ពហុកត្តា",
    mfaAssertionFactorPrompt: "សូមជ្រើសរើសវិធីផ្ទៀងផ្ទាត់ពហុកត្តា",
    mfaTotpQrCodePrompt: "ស្កេនលេខកូដ QR នេះជាមួយកម្មវិធីផ្ទៀងផ្ទាត់របស់អ្នក",
    mfaTotpEnrollmentVerificationPrompt: "បញ្ចូលលេខកូដដែលកម្មវិធីផ្ទៀងផ្ទាត់របស់អ្នកបានបង្កើត",
  },
} satisfies StrictTranslations;
