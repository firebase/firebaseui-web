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

/** Chinese Traditional TW (zh-TW) translation set. */
export const zhTW = {
  errors: {
    userNotFound: "找不到使用此電子郵件地址的帳戶",
    wrongPassword: "密碼不正確",
    invalidEmail: "請輸入有效的電子郵件地址",
    userDisabled: "此帳戶已被停用",
    networkRequestFailed: "無法連線到伺服器。請檢查您的網路連線",
    tooManyRequests: "失敗次數過多。請稍後再試",
    missingVerificationCode: "請輸入驗證碼",
    emailAlreadyInUse: "此電子郵件已有帳戶",
    invalidCredential: "提供的憑證無效。",
    weakPassword: "密碼長度至少需要 6 個字元",
    unverifiedEmail: "請先驗證您的電子郵件地址才能繼續。",
    operationNotAllowed: "不允許此操作。請聯絡支援服務。",
    invalidPhoneNumber: "電話號碼無效",
    missingPhoneNumber: "請提供電話號碼",
    quotaExceeded: "已超過簡訊配額。請稍後再試",
    codeExpired: "驗證碼已過期",
    captchaCheckFailed: "reCAPTCHA 驗證失敗。請重試。",
    missingVerificationId: "請先完成 reCAPTCHA 驗證。",
    missingEmail: "請提供電子郵件地址",
    invalidActionCode: "密碼重設連結無效或已過期",
    credentialAlreadyInUse: "此電子郵件已有帳戶。請使用該帳戶登入。",
    requiresRecentLogin: "此操作需要最近的登入。請重新登入。",
    providerAlreadyLinked: "此電話號碼已與另一個帳戶相關聯",
    invalidVerificationCode: "驗證碼無效。請重試",
    unknownError: "發生了意外錯誤",
    popupClosed: "登入快顯視窗已關閉。請重試。",
    accountExistsWithDifferentCredential: "此電子郵件已有帳戶。請使用原始提供者登入。",
    displayNameRequired: "請提供顯示名稱",
    secondFactorAlreadyInUse: "此電話號碼已在此帳戶中註冊。",
  },
  messages: {
    passwordResetEmailSent: "密碼重設電子郵件已成功傳送",
    signInLinkSent: "登入連結已成功傳送",
    verificationCodeFirst: "請先要求驗證碼",
    checkEmailForReset: "請查看您的電子郵件以取得密碼重設說明",
    dividerOr: "或",
    termsAndPrivacy: "繼續即表示您同意我們的{tos}和{privacy}。",
    mfaSmsAssertionPrompt: "將向 {phoneNumber} 傳送驗證碼以完成驗證程序。",
  },
  labels: {
    emailAddress: "電子郵件地址",
    password: "密碼",
    displayName: "顯示名稱",
    forgotPassword: "忘記密碼？",
    signUp: "註冊",
    signIn: "登入",
    resetPassword: "重設密碼",
    createAccount: "建立帳戶",
    backToSignIn: "返回登入",
    signInWithPhone: "使用電話號碼登入",
    phoneNumber: "電話號碼",
    verificationCode: "驗證碼",
    sendCode: "傳送驗證碼",
    verifyCode: "驗證驗證碼",
    signInWithGoogle: "使用 Google 登入",
    signInWithFacebook: "使用 Facebook 登入",
    signInWithApple: "使用 Apple 登入",
    signInWithMicrosoft: "使用 Microsoft 登入",
    signInWithGitHub: "使用 GitHub 登入",
    signInWithYahoo: "使用 Yahoo 登入",
    signInWithTwitter: "使用 X 登入",
    signInWithEmailLink: "使用電子郵件連結登入",
    signInWithEmail: "使用電子郵件登入",
    sendSignInLink: "傳送登入連結",
    termsOfService: "服務條款",
    privacyPolicy: "隱私權政策",
    resendCode: "重新傳送驗證碼",
    sending: "傳送中...",
    multiFactorEnrollment: "多重要素註冊",
    multiFactorAssertion: "多重要素驗證",
    mfaTotpVerification: "TOTP 驗證",
    mfaSmsVerification: "簡訊驗證",
    generateQrCode: "產生 QR 碼",
  },
  prompts: {
    noAccount: "沒有帳戶？",
    haveAccount: "已有帳戶？",
    enterEmailToReset: "輸入您的電子郵件地址以重設密碼",
    signInToAccount: "登入您的帳戶",
    smsVerificationPrompt: "輸入傳送至您電話號碼的驗證碼",
    enterDetailsToCreate: "輸入您的詳細資料以建立新帳戶",
    enterPhoneNumber: "輸入您的電話號碼",
    enterVerificationCode: "輸入驗證碼",
    enterEmailForLink: "輸入您的電子郵件以接收登入連結",
    mfaEnrollmentPrompt: "選擇新的多重要素註冊方法",
    mfaAssertionPrompt: "請完成多重要素驗證程序",
    mfaAssertionFactorPrompt: "請選擇多重要素驗證方法",
    mfaTotpQrCodePrompt: "使用您的驗證器應用程式掃描此 QR 碼",
    mfaTotpEnrollmentVerificationPrompt: "新增您的驗證器應用程式所產生的驗證碼",
  },
} satisfies Translations;
