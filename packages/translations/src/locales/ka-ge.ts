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

export const kaGE = {
  errors: {
    userNotFound: "ამ ელფოსტის მისამართით ანგარიში ვერ მოიძებნა",
    wrongPassword: "პაროლი არასწორია",
    invalidEmail: "გთხოვთ, შეიყვანოთ სწორი ელფოსტის მისამართი",
    userDisabled: "ეს ანგარიში გათიშულია",
    networkRequestFailed: "სერვერთან დაკავშირება ვერ მოხერხდა. გთხოვთ, შეამოწმოთ ინტერნეტ კავშირი",
    tooManyRequests: "წარუმატებელი მცდელობები ზედმეტად ბევრია. გთხოვთ, სცადოთ მოგვიანებით",
    missingVerificationCode: "გთხოვთ, შეიყვანოთ დადასტურების კოდი",
    emailAlreadyInUse: "ამ ელფოსტით ანგარიში უკვე არსებობს",
    invalidCredential: "მოწოდებული ავტორიზაციის მონაცემები არასწორია.",
    weakPassword: "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო",
    unverifiedEmail: "გთხოვთ, დაადასტუროთ თქვენი ელფოსტის მისამართი გასაგრძელებლად.",
    operationNotAllowed: "ეს ოპერაცია დაუშვებელია. გთხოვთ, დაუკავშირდეთ მხარდაჭერას.",
    invalidPhoneNumber: "ტელეფონის ნომერი არასწორია",
    missingPhoneNumber: "გთხოვთ, მიუთითოთ ტელეფონის ნომერი",
    quotaExceeded: "SMS-ის ლიმიტი ამოიწურა. გთხოვთ, სცადოთ მოგვიანებით",
    codeExpired: "დადასტურების კოდს ვადა გაუვიდა",
    captchaCheckFailed: "reCAPTCHA-ს შემოწმება ვერ განხორციელდა. გთხოვთ, სცადოთ ისევ.",
    missingVerificationId: "გთხოვთ, ჯერ დაასრულოთ reCAPTCHA-ს შემოწმება.",
    missingEmail: "გთხოვთ, მიუთითოთ ელფოსტის მისამართი",
    invalidActionCode: "პაროლის აღდგენის ბმული არასწორია ან ვადაგასულია",
    credentialAlreadyInUse: "ამ ელფოსტით ანგარიში უკვე არსებობს. გთხოვთ, შეხვიდეთ ამ ანგარიშით.",
    requiresRecentLogin: "ეს ოპერაცია მოითხოვს ახლახან შესვლას. გთხოვთ, შეხვიდეთ ხელახლა.",
    providerAlreadyLinked: "ეს ტელეფონის ნომერი უკვე დაკავშირებულია სხვა ანგარიშთან",
    invalidVerificationCode: "დადასტურების კოდი არასწორია. გთხოვთ, სცადოთ ისევ",
    unknownError: "მოხდა მოულოდნელი შეცდომა",
    popupClosed: "შესვლის ფანჯარა დაიხურა. გთხოვთ, სცადოთ ისევ.",
    accountExistsWithDifferentCredential: "ამ ელფოსტით ანგარიში უკვე არსებობს. გთხოვთ, შეხვიდეთ ორიგინალი პროვაიდერით.",
    displayNameRequired: "გთხოვთ, მიუთითოთ საჩვენებელი სახელი",
    secondFactorAlreadyInUse: "ეს ტელეფონის ნომერი უკვე რეგისტრირებულია ამ ანგარიშზე.",
  },
  messages: {
    passwordResetEmailSent: "პაროლის აღდგენის წერილი წარმატებით გაიგზავნა",
    signInLinkSent: "შესვლის ბმული წარმატებით გაიგზავნა",
    verificationCodeFirst: "გთხოვთ, ჯერ მოითხოვოთ დადასტურების კოდი",
    checkEmailForReset: "შეამოწმეთ თქვენი ელფოსტა პაროლის აღდგენის ინსტრუქციებისთვის",
    dividerOr: "ან",
    termsAndPrivacy: "გაგრძელებით თქვენ ეთანხმებით ჩვენს {tos}-ს და {privacy}-ს.",
    mfaSmsAssertionPrompt: "დადასტურების კოდი გაიგზავნება {phoneNumber}-ზე ავთენტიფიკაციის პროცესის დასასრულებლად.",
  },
  labels: {
    emailAddress: "ელფოსტის მისამართი",
    password: "პაროლი",
    displayName: "საჩვენებელი სახელი",
    forgotPassword: "დაგავიწყდათ პაროლი?",
    signUp: "რეგისტრაცია",
    signIn: "შესვლა",
    resetPassword: "პაროლის აღდგენა",
    createAccount: "ანგარიშის შექმნა",
    backToSignIn: "შესვლაზე დაბრუნება",
    signInWithPhone: "შესვლა ტელეფონით",
    phoneNumber: "ტელეფონის ნომერი",
    verificationCode: "დადასტურების კოდი",
    sendCode: "კოდის გაგზავნა",
    verifyCode: "კოდის დადასტურება",
    signInWithGoogle: "Google-ით შესვლა",
    signInWithFacebook: "Facebook-ით შესვლა",
    signInWithApple: "Apple-ით შესვლა",
    signInWithMicrosoft: "Microsoft-ით შესვლა",
    signInWithGitHub: "GitHub-ით შესვლა",
    signInWithYahoo: "Yahoo-ით შესვლა",
    signInWithTwitter: "X-ით შესვლა",
    signInWithEmailLink: "შესვლა ელფოსტის ბმულით",
    sendSignInLink: "შესვლის ბმულის გაგზავნა",
    termsOfService: "მომსახურების პირობები",
    privacyPolicy: "კონფიდენციალურობის პოლიტიკა",
    resendCode: "კოდის ხელახლა გაგზავნა",
    sending: "იგზავნება...",
    dismiss: "დახურვა",
    multiFactorEnrollment: "მრავალფაქტორიანი რეგისტრაცია",
    multiFactorAssertion: "მრავალფაქტორიანი ავთენტიფიკაცია",
    mfaTotpVerification: "TOTP დადასტურება",
    mfaSmsVerification: "SMS დადასტურება",
    generateQrCode: "QR კოდის შექმნა",
  },
  prompts: {
    noAccount: "არ გაქვთ ანგარიში?",
    haveAccount: "უკვე გაქვთ ანგარიში?",
    enterEmailToReset: "შეიყვანეთ თქვენი ელფოსტის მისამართი პაროლის აღსადგენად",
    signInToAccount: "შედით თქვენს ანგარიშში",
    smsVerificationPrompt: "შეიყვანეთ თქვენს ტელეფონზე გაგზავნილი დადასტურების კოდი",
    enterDetailsToCreate: "შეიყვანეთ თქვენი მონაცემები ახალი ანგარიშის შესაქმნელად",
    enterPhoneNumber: "შეიყვანეთ თქვენი ტელეფონის ნომერი",
    enterVerificationCode: "შეიყვანეთ დადასტურების კოდი",
    enterEmailForLink: "შეიყვანეთ თქვენი ელფოსტა შესვლის ბმულის მისაღებად",
    mfaEnrollmentPrompt: "აირჩიეთ მრავალფაქტორიანი რეგისტრაციის ახალი მეთოდი",
    mfaAssertionPrompt: "გთხოვთ, დაასრულოთ მრავალფაქტორიანი ავთენტიფიკაციის პროცესი",
    mfaAssertionFactorPrompt: "გთხოვთ, აირჩიოთ მრავალფაქტორიანი ავთენტიფიკაციის მეთოდი",
    mfaTotpQrCodePrompt: "დაასკანერეთ ეს QR კოდი თქვენი ავთენტიფიკატორის აპლიკაციით",
    mfaTotpEnrollmentVerificationPrompt: "დაამატეთ კოდი, რომელსაც თქვენი ავთენტიფიკატორის აპლიკაცია გენერირებს",
  },
} satisfies StrictTranslations;
