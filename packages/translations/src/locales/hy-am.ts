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

export const hyAM = {
  errors: {
    userNotFound: "Այս էլփոստի հասցեով հաշիվ չի գտնվել",
    wrongPassword: "Գաղտնաբառը սխալ է",
    invalidEmail: "Խնդրում ենք մուտքագրել վավեր էլփոստի հասցե",
    userDisabled: "Այս հաշիվն անջատված է",
    networkRequestFailed: "Չհաջողվեց միանալ սերվերին։ Խնդրում ենք ստուգել ինտերնետ կապը",
    tooManyRequests: "Չհաջողված փորձերի քանակն չափազանց մեծ է։ Խնդրում ենք փորձել ավելի ուշ",
    missingVerificationCode: "Խնդրում ենք մուտքագրել հաստատման կոդը",
    emailAlreadyInUse: "Այս էլփոստով հաշիվն արդեն գոյություն ունի",
    invalidCredential: "Տրամադրված տվյալները սխալ են։",
    weakPassword: "Գաղտնաբառը պետք է լինի առնվազն 6 նշան",
    unverifiedEmail: "Խնդրում ենք հաստատել ձեր էլփոստի հասցեն՝ շարունակելու համար։",
    operationNotAllowed: "Այս գործողությունը թույլատրված չէ։ Խնդրում ենք դիմել աջակցության ծառայություն։",
    invalidPhoneNumber: "Հեռախոսահամարն անվավեր է",
    missingPhoneNumber: "Խնդրում ենք նշել հեռախոսահամար",
    quotaExceeded: "SMS-ների քվոտան սպառվել է։ Խնդրում ենք փորձել ավելի ուշ",
    codeExpired: "Հաստատման կոդի ժամկետը սպառվել է",
    captchaCheckFailed: "reCAPTCHA-ի ստուգումն անհաջող էր։ Խնդրում ենք փորձել կրկին։",
    missingVerificationId: "Խնդրում ենք նախ ավարտել reCAPTCHA-ի ստուգումը։",
    missingEmail: "Խնդրում ենք նշել էլփոստի հասցե",
    invalidActionCode: "Գաղտնաբառի վերականգնման հղումն անվավեր է կամ ժամկետն անցել է",
    credentialAlreadyInUse: "Այս էլփոստով հաշիվն արդեն գոյություն ունի։ Խնդրում ենք մուտք գործել այդ հաշվով։",
    requiresRecentLogin: "Այս գործողության համար անհրաժեշտ է վերջերս կատարված մուտք։ Խնդրում ենք նորից մուտք գործել։",
    providerAlreadyLinked: "Այս հեռախոսահամարն արդեն կապված է այլ հաշվի հետ",
    invalidVerificationCode: "Անվավեր հաստատման կոդ։ Խնդրում ենք փորձել կրկին",
    unknownError: "Տեղի ունեցավ անսպասելի սխալ",
    popupClosed: "Մուտքի պատուհանը փակվեց։ Խնդրում ենք փորձել կրկին։",
    accountExistsWithDifferentCredential:
      "Այս էլփոստով հաշիվն արդեն գոյություն ունի։ Խնդրում ենք մուտք գործել սկզբնական մատակարարով։",
    displayNameRequired: "Խնդրում ենք նշել ցուցադրվող անունը",
    secondFactorAlreadyInUse: "Այս հեռախոսահամարն արդեն գրանցված է այս հաշվում։",
  },
  messages: {
    passwordResetEmailSent: "Գաղտնաբառի վերականգնման նամակն ուղարկվել է հաջողությամբ",
    signInLinkSent: "Մուտքի հղումն ուղարկվել է հաջողությամբ",
    verificationCodeFirst: "Խնդրում ենք նախ պահանջել հաստատման կոդ",
    checkEmailForReset: "Ստուգեք ձեր էլփոստը՝ գաղտնաբառի վերականգնման հրահանգների համար",
    dividerOr: "կամ",
    termsAndPrivacy: "Շարունակելով՝ դուք համաձայնվում եք մեր {tos} և {privacy} հետ։",
    mfaSmsAssertionPrompt: "Հաստատման կոդ կուղարկվի {phoneNumber} համարին՝ նույնականացման գործընթացն ավարտելու համար։",
  },
  labels: {
    emailAddress: "Էլփոստի հասցե",
    password: "Գաղտնաբառ",
    displayName: "Ցուցադրվող անուն",
    forgotPassword: "Մոռացե՞լ եք գաղտնաբառը",
    signUp: "Գրանցվել",
    signIn: "Մուտք",
    resetPassword: "Վերականգնել գաղտնաբառը",
    createAccount: "Ստեղծել հաշիվ",
    backToSignIn: "Վերադառնալ մուտք գործելուն",
    signInWithPhone: "Մուտք հեռախոսահամարով",
    phoneNumber: "Հեռախոսահամար",
    verificationCode: "Հաստատման կոդ",
    sendCode: "Ուղարկել կոդ",
    verifyCode: "Հաստատել կոդը",
    signInWithGoogle: "Մուտք Google-ով",
    signInWithFacebook: "Մուտք Facebook-ով",
    signInWithApple: "Մուտք Apple-ով",
    signInWithMicrosoft: "Մուտք Microsoft-ով",
    signInWithGitHub: "Մուտք GitHub-ով",
    signInWithYahoo: "Մուտք Yahoo-ով",
    signInWithTwitter: "Մուտք X-ով",
    signInWithEmailLink: "Մուտք էլփոստի հղումով",
    sendSignInLink: "Ուղարկել մուտքի հղում",
    termsOfService: "Ծառայության պայմաններ",
    privacyPolicy: "Գաղտնիության քաղաքականություն",
    resendCode: "Կրկին ուղարկել կոդը",
    sending: "Ուղարկվում է...",
    dismiss: "Փակել",
    multiFactorEnrollment: "Բազմաքայլ նույնականացման գրանցում",
    multiFactorAssertion: "Բազմաքայլ նույնականացում",
    mfaTotpVerification: "TOTP հաստատում",
    mfaSmsVerification: "SMS հաստատում",
    generateQrCode: "Ստեղծել QR կոդ",
  },
  prompts: {
    noAccount: "Չունե՞ք հաշիվ",
    haveAccount: "Արդեն ունե՞ք հաշիվ",
    enterEmailToReset: "Մուտքագրեք ձեր էլփոստի հասցեն՝ գաղտնաբառը վերականգնելու համար",
    signInToAccount: "Մուտք գործեք ձեր հաշիվ",
    smsVerificationPrompt: "Մուտքագրեք ձեր հեռախոսահամարին ուղարկված հաստատման կոդը",
    enterDetailsToCreate: "Մուտքագրեք ձեր տվյալները նոր հաշիվ ստեղծելու համար",
    enterPhoneNumber: "Մուտքագրեք ձեր հեռախոսահամարը",
    enterVerificationCode: "Մուտքագրեք հաստատման կոդը",
    enterEmailForLink: "Մուտքագրեք ձեր էլփոստը՝ մուտքի հղում ստանալու համար",
    mfaEnrollmentPrompt: "Ընտրեք բազմաքայլ նույնականացման նոր եղանակ",
    mfaAssertionPrompt: "Խնդրում ենք ավարտել բազմաքայլ նույնականացման գործընթացը",
    mfaAssertionFactorPrompt: "Խնդրում ենք ընտրել բազմաքայլ նույնականացման եղանակ",
    mfaTotpQrCodePrompt: "Սկանավորեք այս QR կոդը ձեր նույնականացման հավելվածով",
    mfaTotpEnrollmentVerificationPrompt: "Ավելացրեք ձեր նույնականացման հավելվածի ստեղծած կոդը",
  },
} satisfies CompleteTranslationsWithoutLegacy;
